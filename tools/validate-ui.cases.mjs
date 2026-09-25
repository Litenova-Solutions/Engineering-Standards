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

// The fixture route composes one floorplan and carries no layout class. The
// source scan reads it like any other authored file.
const routeSource = `import { ListPage } from "@/components/floorplans/list-page";

export default function Page() {
  return <ListPage title="Orders" count={0} rows={null} />;
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
  for (const directory of ['apps/web/app', 'apps/web/components/ui', 'apps/web/components/common', 'apps/web/components/floorplans', 'apps/web/lib', 'docs/ui/web', 'docs/decisions', 'standards/tools', 'standards/schemas']) {
    fs.mkdirSync(path.join(fixture, directory), { recursive: true });
  }
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const schema of fs.readdirSync(path.join(repository, 'schemas'))) {
    fs.copyFileSync(path.join(repository, 'schemas', schema), path.join(fixture, 'standards/schemas', schema));
  }
  writeJson(projectFile, resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json'))));
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-vocabulary.json'), vocabularyFile);
  fs.copyFileSync(path.join(repository, 'templates/consumer/ui-source-lock.json'), path.join(fixture, 'apps/web/ui-source-lock.json'));
  fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), 'export function Button() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/skeleton.tsx'), 'export function Skeleton() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/common/empty-state.tsx'), 'export function EmptyState() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/common/error-state.tsx'), 'export function ErrorState() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(fixture, 'apps/web/components/floorplans/list-page.tsx'), 'export function ListPage() {\n  return <main className="grid gap-6" />;\n}\n');
  // The route composes the floorplan, and the design contract is read from the
  // frontend root.
  fs.writeFileSync(path.join(fixture, 'apps/web/app/page.tsx'), routeSource);
  const contract = fs.readFileSync(path.join(repository, 'templates/consumer/design-contract.md'), 'utf8');
  fs.writeFileSync(path.join(fixture, 'apps/web/DESIGN.md'), contract.replace(/__FRONTEND__/g, 'web'));
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

console.log('\nRestricted Tailwind use (standards/rule/frontend-ui.restrict-css-decisions)');
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

console.log('\nSource boundary (standards/rule/frontend-ui.select-one-visual-authority)');
sourceCase('primitive vendor import in feature code', 'import { Dialog } from "@base-ui/react";\nexport const C = () => <Dialog />;', 'direct UI vendor import is outside the primitive boundary');
manifestCase('second visual system in the workspace root', { dependencies: { '@mui/material': '7.0.0' } }, "second general-purpose visual dependency '@mui/material' requires an override");
manifestCase('second visual system in optionalDependencies', { optionalDependencies: { bootstrap: '5.3.3' } }, "second general-purpose visual dependency 'bootstrap' requires an override");
manifestCase('second visual system pinned through pnpm overrides', { pnpm: { overrides: { '@mantine/core': '8.0.0' } } }, "second general-purpose visual dependency '@mantine/core' requires an override");
manifestCase('second visual system pinned through resolutions', { resolutions: { antd: '5.0.0' } }, "second general-purpose visual dependency 'antd' requires an override");
configCase('UI override without a review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md' }];
}, "a UI rule override requires 'reviewBy'");
configCase('UI override with an expired review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md', reviewBy: '2020-01-01' }];
}, 'has passed; renew the decision or complete the migration');
configCase('UI override with a live review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md', reviewBy: '2099-01-01' }];
}, null);

console.log('\nBaseline configuration (standards/rule/frontend-ui.use-the-pinned-shadcnui-baseline, standards/rule/frontend-ui.declare-the-ui-vocabulary, standards/rule/frontend-ui.track-source-changes)');
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
configCase('vocabulary pattern naming a state the vocabulary omits', (project, vocabulary) => {
  vocabulary.states = vocabulary.states.filter((state) => state.id !== 'empty');
}, "unknown state 'empty'");
configCase('vocabulary component whose source file is missing', (project, vocabulary) => {
  vocabulary.components[0].source = 'components/ui/missing.tsx';
}, "source file does not exist 'components/ui/missing.tsx'");
{
  const componentsFile = path.join(fixture, 'apps/web/components.json');
  const original = fs.readFileSync(componentsFile, 'utf8');
  writeJson(componentsFile, { ...JSON.parse(original), iconLibrary: 'heroicons' });
  report('components.json naming an icon library the baseline does not pin', "iconLibrary must be 'lucide'", run());
  fs.writeFileSync(componentsFile, original);
}

console.log('\nNo page document (standards/rule/frontend-ui.compose-each-route-from-one-floorplan)');
pathCase(
  'a page document is not read',
  'docs/ui/web/page.md',
  `---\n${JSON.stringify({ kind: 'page', id: 'web.page', app: 'web', route: '/' }, null, 2)}\n---\n\n# Fixture page\n`,
  null,
);
pathCase(
  'a route rendering a data-region attribute is not compared with any page document',
  'apps/web/app/other/page.tsx',
  'export default function Other() {\n  return <main data-region="late-addition" />;\n}\n',
  null,
);

console.log('\nDesign contract (standards/rule/frontend-ui.publish-a-design-contract, standards/rule/frontend-ui.declare-a-closed-floorplan-set)');
const designFile = path.join(fixture, 'apps/web/DESIGN.md');
const designContract = fs.readFileSync(designFile, 'utf8');
fs.rmSync(designFile);
report('frontend with no design contract', 'no design contract at', run());
fs.writeFileSync(designFile, designContract.replace('## Motion', '## Movement'));
report('design contract missing a required section', "missing required section 'Motion'", run());
fs.writeFileSync(designFile, designContract.replace('"patterns": ["list-page", "entity-page"]', '"patterns": ["invented-page"]'));
report('design contract naming a floorplan no vocabulary binds', "floorplan 'invented-page' is not in the frontend vocabulary", run());
fs.writeFileSync(designFile, designContract.replace('"patterns": ["list-page", "entity-page"]', '"patterns": []'));
report('design contract naming no floorplan', 'array has fewer than 1 items', run());
fs.writeFileSync(designFile, designContract.replace('"profile": "application-balanced"', '"profile": "admin-dense"'));
report('design contract whose profile contradicts the project record', 'profile must match frontend UI configuration', run());
fs.writeFileSync(designFile, designContract);
report('the shipped design contract is accepted', null, run());

console.log('\nSource lock (standards/rule/frontend-ui.track-source-changes)');
fs.appendFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), '// local change\n');
report('changed baseline source without a fork record', 'no longer matches the baseline digest', run());
fs.writeFileSync(path.join(fixture, 'apps/web/components/ui/button.tsx'), 'export function Button() {\n  return null;\n}\n');
lockCase('preset fields that the recorded fingerprint does not cover', (lock) => {
  lock.preset.theme = 'fixture-theme';
}, 'preset fingerprint does not match the preset fields recorded beside it');

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
