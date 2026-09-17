#!/usr/bin/env node
// Reference passing and failing cases for the controlled UI validator.
//
// Each case builds a throwaway consumer from the tracked templates, runs
// tools/validate-ui.mjs against it, and asserts that the rule fires or stays
// silent. A rule without a case here is unverified, so add both directions when
// adding a rule.
//
// Usage:
//   node tools/validate-ui.cases.mjs

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validator = path.join(repository, 'tools', 'validate-ui.mjs');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'litenova-ui-cases-'));
const caseFile = path.join(fixture, 'apps/web/app/case.tsx');
const globalCss = path.join(fixture, 'apps/web/app/globals.css');
const projectFile = path.join(fixture, 'standards.project.json');
const vocabularyFile = path.join(fixture, 'docs/ui/web/vocabulary.json');
// The structure the pinned CLI actually generates: the three approved imports,
// the dark variant, the theme mapping, both token blocks, and the documented
// browser base rules expressed with '@apply' inside '@layer base'.
const cleanCss = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-sans: var(--font-sans);
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --radius-lg: var(--radius);
}

:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --radius: 0.625rem;
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
}
`;

// The route the fixture page specification names. Both regions the sidecar
// declares are marked, so the frozen-plan scan has something to resolve.
const routeSource = `export default function Page() {
  return (
    <main>
      <div data-region="page-header" />
      <div data-region="content" />
    </main>
  );
}
`;

let failures = 0;

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolvePlaceholders(value) {
  if (Array.isArray(value)) return value.map(resolvePlaceholders);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolvePlaceholders(item)]));
  if (typeof value === 'string' && value.startsWith('__')) return 'fixture';
  return value;
}

function build() {
  for (const directory of ['apps/web/app', 'apps/web/app/evidence', 'apps/web/components/ui', 'apps/web/components/common', 'apps/web/lib', 'docs/ui/web', 'docs/ui/compositions', 'docs/decisions', 'standards/tools', 'standards/schemas']) {
    fs.mkdirSync(path.join(fixture, directory), { recursive: true });
  }
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const schema of fs.readdirSync(path.join(repository, 'schemas'))) {
    fs.copyFileSync(path.join(repository, 'schemas', schema), path.join(fixture, 'standards/schemas', schema));
  }
  writeJson(projectFile, resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json'))));
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-vocabulary.json'), vocabularyFile);
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-page.json'), path.join(fixture, 'docs/ui/web/page.ui.json'));
  // The sidecar is only reachable through a page specification, so the fixture
  // carries the matching page document.
  fs.writeFileSync(
    path.join(fixture, 'docs/ui/web/page.md'),
    `---\n${JSON.stringify(
      {
        kind: 'page',
        id: 'web.page',
        specStatus: 'approved',
        implementationStatus: 'planned',
        owner: 'fixture',
        lastReviewed: '2026-01-01',
        app: 'web',
        route: '/',
        useCases: ['fixture.view'],
      },
      null,
      2,
    )}\n---\n\n# Fixture page\n`,
  );
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-source-lock.json'), path.join(fixture, 'apps/web/ui-source-lock.json'));
  fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), 'export function Button() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/skeleton.tsx'), 'export function Skeleton() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/common/empty-state.tsx'), 'export function EmptyState() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/common/error-state.tsx'), 'export function ErrorState() {\n  return null;\n}\n');
  // The route the sidecar describes. The region scan starts here, the acceptance
  // record sits beside it, and the design contract is read from the frontend root.
  fs.writeFileSync(path.join(fixture, 'apps/web/app/page.tsx'), routeSource);
  const contract = fs.readFileSync(path.join(repository, 'templates/consumer/design-contract.md'), 'utf8');
  fs.writeFileSync(path.join(fixture, 'apps/web/DESIGN.md'), contract.replace(/__FRONTEND__/g, 'web'));
  for (const recipe of ['page-header', 'record-list']) {
    const page = fs.readFileSync(path.join(repository, 'templates/consumer/composition.md'), 'utf8');
    fs.writeFileSync(path.join(fixture, `docs/ui/compositions/${recipe}.md`), page.replace('composition-record-list', `composition-${recipe}`));
    const sidecar = readJson(path.join(repository, 'templates/consumer/composition-recipe.json'));
    writeJson(path.join(fixture, `docs/ui/compositions/${recipe}.recipe.json`), { ...sidecar, recipe });
  }
  writeJson(path.join(fixture, 'apps/web/app/evidence/acceptance.json'), readJson(path.join(repository, 'templates/consumer/acceptance-criteria.json')));
  fs.writeFileSync(path.join(fixture, 'apps/web/app/evidence/AC-PAGE-01.spec.ts'), 'export const criterion = "AC-PAGE-01";\n');
  fs.writeFileSync(globalCss, cleanCss);
  fs.writeFileSync(path.join(fixture, 'docs/decisions/ui-override.md'), '# Override\n');
  writeJson(path.join(fixture, 'apps/web/components.json'), {
    style: 'base-vega',
    rsc: true,
    tsx: true,
    rtl: false,
    iconLibrary: 'lucide',
    menuColor: 'default',
    menuAccent: 'subtle',
    tailwind: { config: '', css: 'app/globals.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
    aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' },
    registries: {},
  });

  // The lock stores the digest the validator recomputes, so the fixture seals it
  // the same way rather than shipping a placeholder.
  const lockFile = path.join(fixture, 'apps/web/ui-source-lock.json');
  const lock = readJson(lockFile);
  const source = fs.readFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), 'utf8');
  const normalized = `${source.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()}\n`;
  lock.components[0].digest = `sha256:${crypto.createHash('sha256').update(normalized).digest('hex')}`;
  writeJson(lockFile, lock);
}

function run() {
  const result = spawnSync(process.execPath, [validator, fixture], { encoding: 'utf8' });
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function report(name, expectation, output) {
  const problems = output.split('\n').filter((line) => line.startsWith('  - ')).map((line) => line.slice(4));
  const matched = expectation === null ? problems.length === 0 : problems.some((problem) => problem.includes(expectation));
  if (matched) {
    console.log(`  pass  ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL  ${name}`);
  console.log(`        expected: ${expectation === null ? 'no problems' : expectation}`);
  for (const problem of problems) console.log(`        actual:   ${problem}`);
}

// A source case writes one feature file and expects one rule outcome.
function sourceCase(name, code, expectation) {
  fs.writeFileSync(caseFile, `${code}\n`);
  report(name, expectation, run());
  fs.rmSync(caseFile);
}

function cssCase(name, css, expectation) {
  fs.writeFileSync(globalCss, css);
  report(name, expectation, run());
  fs.writeFileSync(globalCss, cleanCss);
}

function pathCase(name, relative, contents, expectation) {
  const file = path.join(fixture, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  report(name, expectation, run());
  fs.rmSync(file);
}

// A page case writes a second page specification beside the tracked one, so the
// checks that compare pages with each other have two pages to compare.
function pageCase(name, metadata, expectation) {
  const file = path.join(fixture, `docs/ui/web/${metadata.id.split('.').pop()}.md`);
  const block = {
    kind: 'page',
    specStatus: 'approved',
    implementationStatus: 'planned',
    owner: 'fixture',
    lastReviewed: '2026-01-01',
    useCases: ['fixture.view'],
    ...metadata,
  };
  fs.writeFileSync(file, `---\n${JSON.stringify(block, null, 2)}\n---\n\n# Fixture page\n`);
  report(name, expectation, run());
  fs.rmSync(file);
}

function lockCase(name, mutate, expectation) {
  const lockFile = path.join(fixture, 'apps/web/ui-source-lock.json');
  const original = fs.readFileSync(lockFile, 'utf8');
  const lock = readJson(lockFile);
  mutate(lock);
  writeJson(lockFile, lock);
  report(name, expectation, run());
  fs.writeFileSync(lockFile, original);
}

function manifestCase(name, packageJson, expectation) {
  const file = path.join(fixture, 'package.json');
  writeJson(file, { name: 'fixture', ...packageJson });
  report(name, expectation, run());
  fs.rmSync(file, { force: true });
}

function configCase(name, mutate, expectation) {
  const project = readJson(projectFile);
  const vocabulary = readJson(vocabularyFile);
  mutate(readJson(projectFile) && project, vocabulary);
  writeJson(projectFile, project);
  writeJson(vocabularyFile, vocabulary);
  report(name, expectation, run());
  writeJson(projectFile, resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json'))));
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-vocabulary.json'), vocabularyFile);
}

build();

console.log('Baseline');
report('tracked templates validate as shipped', null, run());

console.log('\nAllowed construction');
sourceCase('approved layout utilities', 'export const C = () => <div className="grid gap-6 lg:grid-cols-2" />;', null);
sourceCase('semantic token classes', 'export const C = () => <div className="bg-background text-foreground border-border" />;', null);
sourceCase('state and container variants', 'export const C = () => <div className="data-[state=open]:rotate-180 has-[input:checked]:bg-accent min-[420px]:flex" />;', null);
sourceCase('class merge helper', 'import { cn } from "@/lib/utils";\nexport const C = ({ x }: { x?: string }) => <div className={cn("flex gap-2", x && "justify-between")} />;', null);
sourceCase('pinned icon family', 'import { Check } from "lucide-react";\nexport const C = () => <Check className="size-4" />;', null);
sourceCase('javascript negation is not an important modifier', 'export const C = ({ o }: { o: boolean }) => {\n  const v = !o;\n  return v ? null : <div className="p-4" />;\n};', null);
sourceCase('a class name inside a comment is prose', 'export const C = () => {\n  // never use bg-blue-500 or w-[37rem]\n  return <div className="p-4" />;\n};', null);
sourceCase('a call the helper set does not name carries no class string', 'import { t } from "@/lib/i18n";\nexport const C = () => <div title={t("bg-red-500")} className="p-4" />;', null);
sourceCase('composed functional variants', 'export const C = () => <div className="group-data-[state=open]:rotate-180 not-has-[input]:opacity-50 peer-aria-[expanded=true]:block" />;', null);
pathCase('generated native web asset is ignored', 'apps/web/android/app/src/main/assets/public/_next/static/css/generated.css', '.generated { color: red; }\n', null);
pathCase('a file under tests is outside the controlled surface', 'apps/web/tests/case.test.tsx', 'export const C = () => <div className="bg-red-500" />;\n', null);
pathCase('authored feature CSS is rejected', 'apps/web/features/generated.css', '.generated { color: red; }\n', 'CSS file is outside the designated global CSS entry');

console.log('\nRestricted Tailwind use (FRONTEND.UI.TAILWIND.001)');
sourceCase('arbitrary length', 'export const C = () => <div className="w-[37rem]" />;', "arbitrary Tailwind value requires a semantic token or declared variant 'w-[37rem]'");
sourceCase('arbitrary radius', 'export const C = () => <div className="rounded-[11px]" />;', "'rounded-[11px]'");
sourceCase('arbitrary color', 'export const C = () => <div className="bg-[#19324a]" />;', "'bg-[#19324a]'");
sourceCase('arbitrary property', 'export const C = () => <div className="[--panel-gap:13px]" />;', "'[--panel-gap:13px]'");
sourceCase('arbitrary value behind a responsive variant', 'export const C = () => <div className="lg:w-[37rem]" />;', "'lg:w-[37rem]'");
sourceCase('raw palette value', 'export const C = () => <div className="text-red-500" />;', "raw Tailwind palette value requires a semantic token 'text-red-500'");
sourceCase('raw palette value with opacity', 'export const C = () => <div className="bg-slate-800/40" />;', "'bg-slate-800/40'");
sourceCase('raw palette value inside a merge helper', 'import { cn } from "@/lib/utils";\nexport const C = () => <div className={cn("p-2", "border-indigo-400")} />;', "'border-indigo-400'");
sourceCase('important modifier prefix', 'export const C = () => <div className="!mt-0" />;', "important modifier requires a declared variant '!mt-0'");
sourceCase('important modifier suffix', 'export const C = () => <div className="mt-0!" />;', "important modifier requires a declared variant 'mt-0!'");
sourceCase('arbitrary selector variant', 'export const C = () => <div className="[&>svg]:size-4" />;', "arbitrary selector variant requires a declared variant '[&>svg]:size-4'");
sourceCase('undeclared inline style', 'export const C = () => <div style={{ width: 120 }} />;', 'inline style requires a vocabulary runtimeStyles record');
sourceCase('an escaped quote keeps the following literal readable', 'import { cn } from "@/lib/utils";\nexport const C = () => <div className={cn("a \\" b", "text-red-500")} />;', "'text-red-500'");
cssCase('feature selector in the global entry', `${cleanCss}.promo-card{color:red}\n`, "selector '.promo-card' is a feature style");
cssCase('a comma inside a quoted attribute value is not a selector list', `${cleanCss}[data-token=",.promo"]{color:red}\n`, null);
cssCase('a brace inside a quoted attribute value is not a block', `${cleanCss}[data-token="{"]{color:red}\n`, null);
cssCase('an unterminated string is reported once', `${cleanCss}[data-token="promo]{color:red}\n`, 'global CSS has an unterminated string');
cssCase('apply directive outside the generated base layer', `${cleanCss}@layer components {\n  .btn { @apply px-4 py-2; }\n}\n`, "'@apply' outside the generated '@layer base' block");
cssCase('unapproved global import', `${cleanCss}@import "bootstrap/dist/css/bootstrap.css";\n`, "import 'bootstrap/dist/css/bootstrap.css' is outside the approved global CSS surface");

console.log('\nSource boundary (FRONTEND.UI.GOVERNANCE.001)');
sourceCase('primitive vendor import in feature code', 'import { Dialog } from "@base-ui/react";\nexport const C = () => <Dialog />;', 'direct UI vendor import is outside the primitive boundary');
manifestCase('second visual system in the workspace root', { dependencies: { '@mui/material': '7.0.0' } }, "second general-purpose visual dependency '@mui/material' requires an override");
manifestCase('second visual system in optionalDependencies', { optionalDependencies: { bootstrap: '5.3.3' } }, "second general-purpose visual dependency 'bootstrap' requires an override");
manifestCase('second visual system pinned through pnpm overrides', { pnpm: { overrides: { '@mantine/core': '8.0.0' } } }, "second general-purpose visual dependency '@mantine/core' requires an override");
manifestCase('second visual system pinned through resolutions', { resolutions: { antd: '5.0.0' } }, "second general-purpose visual dependency 'antd' requires an override");
configCase('UI override without a review date', (project) => {
  project.overrides = [{ provisionId: 'FRONTEND.UI.GOVERNANCE.001', decision: 'docs/decisions/ui-override.md' }];
}, "a UI rule override requires 'reviewBy'");
configCase('UI override with an expired review date', (project) => {
  project.overrides = [{ provisionId: 'FRONTEND.UI.GOVERNANCE.001', decision: 'docs/decisions/ui-override.md', reviewBy: '2020-01-01' }];
}, 'has passed; renew the decision or complete the migration');
configCase('UI override with a live review date', (project) => {
  project.overrides = [{ provisionId: 'FRONTEND.UI.GOVERNANCE.001', decision: 'docs/decisions/ui-override.md', reviewBy: '2099-01-01' }];
}, null);

console.log('\nBaseline configuration (FRONTEND.UI.SHADCN.001, FRONTEND.UI.VOCABULARY.001, FRONTEND.UI.FORKS.001)');
configCase('compatibility base without a stated components style', (project, vocabulary) => {
  project.paths.frontends[0].ui.base = 'radix-ui';
  project.paths.frontends[0].ui.overrideDecision = 'docs/decisions/ui-override.md';
  project.paths.frontends[0].ui.reviewBy = '2099-01-01';
  vocabulary.baseline.base = 'radix-ui';
}, 'a non-default component base must state componentsStyle');
configCase('preset fingerprint that contradicts the decoded fields', (project) => {
  project.paths.frontends[0].ui.font = 'inter';
  project.paths.frontends[0].ui.presetCode = 'other';
  project.paths.frontends[0].ui.presetFingerprint = `sha256:${'0'.repeat(64)}`;
  project.paths.frontends[0].ui.overrideDecision = 'docs/decisions/ui-override.md';
  project.paths.frontends[0].ui.reviewBy = '2099-01-01';
}, 'presetFingerprint does not match the decoded preset fields');
configCase('shadcn frontend missing an owned path', (project) => {
  delete project.paths.frontends[0].ui.primitives;
}, "missing 'primitives'");
configCase('vocabulary state that no evidence record covers', (project, vocabulary) => {
  vocabulary.states.push({ id: 'offline', requiredEvidence: ['UI-MISSING'] });
}, "unknown evidence 'UI-MISSING'");
configCase('page contract state outside the vocabulary', (project, vocabulary) => {
  vocabulary.states = vocabulary.states.filter((state) => state.id !== 'empty');
}, "unknown state 'empty'");

console.log('\nPage contracts (FRONTEND.UI.PAGE.001)');
const sidecar = path.join(fixture, 'docs/ui/web/page.ui.json');
const sidecarContract = readJson(sidecar);
fs.rmSync(sidecar);
report('page specification without a UI sidecar', 'missing UI sidecar', run());
writeJson(sidecar, { ...sidecarContract, shell: 'invented-shell/default' });
report('page contract naming an unlisted shell', "unknown shell 'invented-shell/default'", run());
writeJson(sidecar, { ...sidecarContract, regions: [{ ...sidecarContract.regions[0], pattern: 'invented-pattern/default' }] });
report('page contract naming an unlisted pattern', "unknown pattern 'invented-pattern/default'", run());
fs.copyFileSync(path.join(repository, 'templates/consumer/ui-page.json'), sidecar);

console.log('\nPage registry (FRONTEND.UI.GOVERNANCE.001)');
pageCase('two pages declaring one route', { id: 'web.duplicate', app: 'web', route: '/' }, "route '/' in 'web' is already declared by");
pageCase('two pages on one route in different frontends', { id: 'web.elsewhere', app: 'admin', route: '/' }, "page declares app 'admin', which no frontend");
pageCase('a distinct route is accepted', { id: 'web.second', app: 'web', route: '/second' }, 'missing UI sidecar');

console.log('\nDesign contract (FRONTEND.UI.DESIGN.001)');
const designFile = path.join(fixture, 'apps/web/DESIGN.md');
const designContract = fs.readFileSync(designFile, 'utf8');
fs.rmSync(designFile);
report('frontend with no design contract', 'no design contract at', run());
fs.writeFileSync(designFile, designContract.replace('## Motion', '## Movement'));
report('design contract missing a required section', "missing required section 'Motion'", run());
fs.writeFileSync(designFile, designContract.replace('"patterns": ["page-header", "record-list"]', '"patterns": ["invented-pattern"]'));
report('design contract naming a pattern no vocabulary binds', "pattern 'invented-pattern' is not in the frontend vocabulary", run());
fs.writeFileSync(designFile, designContract.replace('"profile": "application-balanced"', '"profile": "admin-dense"'));
report('design contract whose profile contradicts the project record', 'profile must match frontend UI configuration', run());
fs.writeFileSync(designFile, designContract);
report('the shipped design contract is accepted', null, run());

console.log('\nComposition catalog (FRONTEND.UI.CATALOG.001, FRONTEND.UI.COMPOSITION.001)');
const recipeFile = path.join(fixture, 'docs/ui/compositions/record-list.recipe.json');
const recipeSidecar = readJson(recipeFile);
fs.rmSync(recipeFile);
report('catalog page with no recipe sidecar', 'recipe has no sidecar at', run());
writeJson(recipeFile, { ...recipeSidecar, scope: 'shell' });
report('page region naming a shell recipe', 'is a shell recipe, which a page region does not name', run());
writeJson(recipeFile, { ...recipeSidecar, slots: [] });
report('recipe with no slot', 'array has fewer than 1 items', run());
writeJson(recipeFile, recipeSidecar);
pathCase('recipe sidecar with no page beside it', 'docs/ui/compositions/orphan.recipe.json', `${JSON.stringify({ ...recipeSidecar, recipe: 'orphan' }, null, 2)}\n`, 'recipe sidecar has no Markdown page beside it');
const catalogSidecar = path.join(fixture, 'docs/ui/web/page.ui.json');
const catalogContract = readJson(catalogSidecar);
writeJson(catalogSidecar, {
  ...catalogContract,
  regions: catalogContract.regions.map((region) => (region.id === 'content' ? { ...region, pattern: 'page-header/default' } : region)),
});
report('two regions may bind one recipe', null, run());
writeJson(catalogSidecar, catalogContract);

console.log('\nDeclared states (FRONTEND.UI.STATE.001)');
writeJson(catalogSidecar, {
  ...catalogContract,
  regions: catalogContract.regions.map((region) => (region.id === 'content' ? { ...region, components: ['button'] } : region)),
});
report('declared state that no named component carries', "state 'loading' is declared, and no component any region names carries it", run());
writeJson(catalogSidecar, catalogContract);

console.log('\nFrozen plan (FRONTEND.UI.GATES.001)');
const routeFile = path.join(fixture, 'apps/web/app/page.tsx');
fs.writeFileSync(routeFile, routeSource.replace('data-region="content"', 'data-region="late-addition"'));
report('route rendering a region the sidecar does not name', "renders region 'late-addition', which 'docs/ui/web/page.ui.json' does not name", run());
fs.writeFileSync(path.join(fixture, 'apps/web/components/common/late.tsx'), 'export const Late = () => <div data-region="imported-addition" />;\n');
fs.writeFileSync(routeFile, `import { Late } from "@/components/common/late";\n${routeSource.replace('<div data-region="content" />', '<Late />')}`);
report('region reached through an import the route follows', "renders region 'imported-addition'", run());
fs.rmSync(path.join(fixture, 'apps/web/components/common/late.tsx'));
fs.writeFileSync(routeFile, routeSource);
report('a route inside its frozen plan is accepted', null, run());

console.log('\nAcceptance (FRONTEND.UI.PLACEMENT.001, FRONTEND.UI.ACCEPTANCE.001)');
const acceptanceFile = path.join(fixture, 'apps/web/app/evidence/acceptance.json');
const acceptanceRecord = readJson(acceptanceFile);
const specFile = path.join(fixture, 'apps/web/app/evidence/AC-PAGE-01.spec.ts');
fs.rmSync(specFile);
report('acceptance identifier with no file', "'AC-PAGE-01' names 'AC-PAGE-01.spec.ts', which does not exist", run());
fs.writeFileSync(specFile, 'export const criterion = "AC-PAGE-01";\n');
writeJson(acceptanceFile, { ...acceptanceRecord, criteria: [{ ...acceptanceRecord.criteria[0], id: 'AC-PAGE-02', spec: 'AC-PAGE-02.spec.ts' }] });
report('acceptance record stating an identifier no sidecar names', "states 'AC-PAGE-02', which 'docs/ui/web/page.ui.json' does not name", run());
writeJson(acceptanceFile, { ...acceptanceRecord, criteria: [{ ...acceptanceRecord.criteria[0], steps: [] }] });
report('criterion with no step', 'array has fewer than 1 items', run());
writeJson(acceptanceFile, acceptanceRecord);
fs.rmSync(acceptanceFile);
report('page naming acceptance identifiers with no record beside its route', 'no acceptance record at', run());
writeJson(acceptanceFile, acceptanceRecord);
report('the shipped acceptance record is accepted', null, run());

console.log('\nSource lock (FRONTEND.UI.FORKS.001)');
fs.appendFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), '// local change\n');
report('changed baseline source without a fork record', 'no longer matches the baseline digest', run());
fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), 'export function Button() {\n  return null;\n}\n');
lockCase('preset fields that the recorded fingerprint does not cover', (lock) => {
  lock.preset.theme = 'fixture-theme';
}, 'preset fingerprint does not match the preset fields recorded beside it');

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
