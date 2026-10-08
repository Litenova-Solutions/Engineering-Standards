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
const caseFile = path.join(fixture, 'packages/ui/src/floorplans/fixture-case.tsx');
const packageRoot = path.join(fixture, 'packages/ui');
const appRoot = path.join(fixture, 'apps/web');
const appStyles = path.join(appRoot, 'src/styles.css');
const appCase = path.join(appRoot, 'src/routes/case.tsx');
const tokensCss = path.join(packageRoot, 'src/styles/tokens.css');
const projectFile = path.join(fixture, 'standards.project.json');
const lockFile = path.join(packageRoot, 'ui-source-lock.json');
const designFile = path.join(packageRoot, 'DESIGN.md');

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

// An application stylesheet carries no rule of its own. It imports the shared
// package's token entry and nothing else.
const cleanAppStyles = `@import "@fixture/ui/tokens.css";
`;

let failures = 0;

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolvePlaceholders(value) {
  if (Array.isArray(value)) return value.map(resolvePlaceholders);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolvePlaceholders(item)]));
  if (typeof value === 'string' && value.startsWith('__')) return value.replace(/^__/, '').toLowerCase() || 'fixture';
  return value;
}

function seal() {
  // The lock stores the digest the validator recomputes, so the fixture seals it
  // the same way rather than shipping a placeholder.
  const lock = readJson(lockFile);
  lock.components.forEach((component, index) => {
    const relative = component.paths[0];
    const source = fs.readFileSync(path.join(packageRoot, relative), 'utf8');
    const normalized = `${source.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()}\n`;
    component.digest = `sha256:${crypto.createHash('sha256').update(normalized).digest('hex')}`;
    if (index === 0) component.name = component.name;
  });
  writeJson(lockFile, lock);
}

function build() {
  for (const directory of [
    'packages/ui/src/components',
    'packages/ui/src/floorplans',
    'packages/ui/src/styles',
    'apps/web/src/routes',
    'apps/web/src/modules',
    'docs/decisions',
    'standards/tools',
    'standards/schemas',
  ]) {
    fs.mkdirSync(path.join(fixture, directory), { recursive: true });
  }
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const schema of fs.readdirSync(path.join(repository, 'schemas'))) {
    fs.copyFileSync(path.join(repository, 'schemas', schema), path.join(fixture, 'standards/schemas', schema));
  }
  writeJson(projectFile, resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json'))));
  const project = readJson(projectFile);
  project.paths.uiPackage.name = '@fixture/ui';
  project.paths.uiPackage.publicExports = ['@fixture/ui/floorplans'];
  writeJson(projectFile, project);

  const lock = readJson(path.join(repository, 'templates/consumer/ui-source-lock.json'));
  lock.$schema = './standards/schemas/ui-source-lock.schema.json';
  writeJson(lockFile, lock);

  fs.writeFileSync(path.join(packageRoot, 'src/components/button.tsx'), 'export function Button() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(packageRoot, 'src/components/skeleton.tsx'), 'export function Skeleton() {\n  return null;\n}\n');
  fs.writeFileSync(path.join(packageRoot, 'src/floorplans/list-page.tsx'), 'export function ListPage() {\n  return <main className="grid gap-6" />;\n}\n');
  fs.writeFileSync(tokensCss, cleanCss);
  fs.writeFileSync(appStyles, cleanAppStyles);
  fs.writeFileSync(appCase, 'export function Case() {\n  return <main>Orders</main>;\n}\n');
  fs.writeFileSync(path.join(fixture, 'docs/decisions/ui-override.md'), '# Override\n');

  writeJson(path.join(packageRoot, 'components.json'), {
    style: 'base-nova',
    rsc: false,
    tsx: true,
    rtl: false,
    iconLibrary: 'lucide',
    menuColor: 'default',
    menuAccent: 'subtle',
    tailwind: { config: '', css: 'src/styles/tokens.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
    aliases: { components: '@fixture/ui/components', utils: '@fixture/ui/lib/utils', ui: '@fixture/ui/components', lib: '@fixture/ui/lib', hooks: '@fixture/ui/hooks' },
    registries: {},
  });

  const contract = fs.readFileSync(path.join(repository, 'templates/consumer/design-contract.md'), 'utf8');
  fs.writeFileSync(designFile, contract.replace(/__PROJECT__/g, 'fixture'));

  seal();
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

// A composite case writes one shared-package file and expects one rule outcome.
function compositeCase(name, code, expectation) {
  fs.writeFileSync(caseFile, `${code}\n`);
  report(name, expectation, run());
  fs.rmSync(caseFile);
}

// An application case writes one application file and expects one rule outcome.
function appCaseWith(name, code, expectation) {
  fs.writeFileSync(appCase, `${code}\n`);
  report(name, expectation, run());
  fs.writeFileSync(appCase, 'export function Case() {\n  return <main>Orders</main>;\n}\n');
}

function cssCase(name, css, expectation) {
  fs.writeFileSync(tokensCss, css);
  report(name, expectation, run());
  fs.writeFileSync(tokensCss, cleanCss);
}

function appStylesCase(name, css, expectation) {
  fs.writeFileSync(appStyles, css);
  report(name, expectation, run());
  fs.writeFileSync(appStyles, cleanAppStyles);
}

function pathCase(name, relative, contents, expectation) {
  const file = path.join(fixture, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  report(name, expectation, run());
  fs.rmSync(file);
}

function lockCase(name, mutate, expectation) {
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
  mutate(project);
  writeJson(projectFile, project);
  report(name, expectation, run());
  writeJson(projectFile, (() => {
    const restored = resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json')));
    restored.paths.uiPackage.name = '@fixture/ui';
    restored.paths.uiPackage.publicExports = ['@fixture/ui/floorplans'];
    return restored;
  })());
}

build();

console.log('Baseline');
report('tracked templates validate as shipped', null, run());

console.log('\nAllowed construction (standards/rule/frontend-ui.restrict-css-decisions)');
compositeCase('approved layout utilities', 'export const C = () => <div className="grid gap-6 lg:grid-cols-2" />;', null);
compositeCase('semantic token classes', 'export const C = () => <div className="bg-background text-foreground border-border" />;', null);
compositeCase('state and container variants', 'export const C = () => <div className="data-[state=open]:rotate-180 has-[input:checked]:bg-accent min-[420px]:flex" />;', null);
compositeCase('class merge helper', 'import { cn } from "cn";\nexport const C = ({ x }: { x?: string }) => <div className={cn("flex gap-2", x && "justify-between")} />;', null);
compositeCase('pinned icon family', 'import { Check } from "lucide-react";\nexport const C = () => <Check className="size-4" />;', null);
compositeCase('the primitive library, named by the package that owns it', 'import { Dialog } from "@base-ui/react/dialog";\nexport const C = () => <Dialog />;', null);
compositeCase('javascript negation is not an important modifier', 'export const C = ({ o }: { o: boolean }) => {\n  const v = !o;\n  return v ? null : <div className="p-4" />;\n};', null);
compositeCase('a class name inside a comment is prose', 'export const C = () => {\n  // never use bg-blue-500 or w-[37rem]\n  return <div className="p-4" />;\n};', null);
compositeCase('composed functional variants', 'export const C = () => <div className="group-data-[state=open]:rotate-180 not-has-[input]:opacity-50 peer-aria-[expanded=true]:block" />;', null);
pathCase('a file under tests is outside the controlled surface', 'packages/ui/tests/case.test.tsx', 'export const C = () => <div className="bg-red-500" />;\n', null);
pathCase('a file under the copied primitive boundary is unedited source', 'packages/ui/src/components/extra.tsx', 'export const C = () => <div className="bg-red-500" />;\n', null);
pathCase('a visual file keeps its own layout', 'apps/web/src/modules/seat-map/seat-map.visual.tsx', 'export const C = () => <div className="grid" style={{ width: 120 }} />;\n', null);
pathCase('a visual file is still held to the token rule', 'apps/web/src/modules/seat-map/other.visual.tsx', 'export const C = () => <div className="bg-red-500" />;\n', "raw Tailwind palette value requires a semantic token 'bg-red-500'");
pathCase('generated web asset is ignored', 'apps/web/android/app/src/main/assets/public/generated.css', '.generated { color: red; }\n', null);
appCaseWith('a route composing one floorplan', 'import { ListPage } from "@fixture/ui/floorplans";\nexport function Case() {\n  return <ListPage title="Orders" />;\n}\n', null);

console.log('\nRestricted Tailwind use (standards/rule/frontend-ui.restrict-css-decisions)');
compositeCase('arbitrary length', 'export const C = () => <div className="w-[37rem]" />;', "arbitrary Tailwind value requires a semantic token or declared variant 'w-[37rem]'");
compositeCase('arbitrary color', 'export const C = () => <div className="bg-[#19324a]" />;', "'bg-[#19324a]'");
compositeCase('raw palette value', 'export const C = () => <div className="text-red-500" />;', "raw Tailwind palette value requires a semantic token 'text-red-500'");
compositeCase('raw palette value with opacity', 'export const C = () => <div className="bg-slate-800/40" />;', "'bg-slate-800/40'");
compositeCase('important modifier prefix', 'export const C = () => <div className="!mt-0" />;', "important modifier requires a declared variant '!mt-0'");
compositeCase('an escaped quote keeps the following literal readable', 'import { cn } from "cn";\nexport const C = () => <div className={cn("a \\" b", "text-red-500")} />;', "'text-red-500'");
pathCase('an arbitrary selector variant in a drawing', 'apps/web/src/modules/seat-map/grid.visual.tsx', 'export const C = () => <div className="[&>svg]:size-4" />;\n', "arbitrary selector variant requires a declared variant '[&>svg]:size-4'");
pathCase('a runtime measurement in a composite', 'packages/ui/src/shell/width.tsx', 'export const C = () => <div style={{ width: 12 }} />;\n', null);
cssCase('feature selector in the token entry', `${cleanCss}.promo-card{color:red}\n`, "selector '.promo-card' is a feature style");
cssCase('a comma inside a quoted attribute value is not a selector list', `${cleanCss}[data-token=",.promo"]{color:red}\n`, null);
cssCase('a brace inside a quoted attribute value is not a block', `${cleanCss}[data-token="{"]{color:red}\n`, null);
cssCase('an unterminated string is reported once', `${cleanCss}[data-token="promo]{color:red}\n`, 'global CSS has an unterminated string');
cssCase('apply directive outside the generated base layer', `${cleanCss}@layer components {\n  .btn { @apply px-4 py-2; }\n}\n`, "'@apply' outside the generated '@layer base' block");
cssCase('unapproved global import', `${cleanCss}@import "bootstrap/dist/css/bootstrap.css";\n`, "import 'bootstrap/dist/css/bootstrap.css' is outside the approved global CSS surface");

console.log('\nApplication boundary (standards/rule/frontend-components.compose-composites-in-page-code)');
appCaseWith('an application importing the primitive library', 'import { Dialog } from "@base-ui/react/dialog";\nexport function Case() {\n  return <Dialog />;\n}\n', "imports the primitive library directly");
appCaseWith('an application importing a table library', 'import { flexRender } from "@tanstack/react-table";\nexport function Case() {\n  return <main>{flexRender}</main>;\n}\n', 'imports the table library directly');
appCaseWith('a library name inside a doc comment is prose', '/** Reads a value from `@base-ui/react` in the composite that wraps it. */\nexport function Case() {\n  return <main>Orders</main>;\n}\n', null);

console.log('\nApplication stylesheet (standards/rule/frontend-ui.keep-tokens-in-one-stylesheet)');
appStylesCase('an application stylesheet importing the package tokens', cleanAppStyles, null);
appStylesCase('an application stylesheet writing a value from a token', `${cleanAppStyles}\n:where(button) {\n  --ring-width: 2px;\n}\n`, null);
appStylesCase('an application stylesheet declaring a literal value', `${cleanAppStyles}\nbody {\n  background: #ffffff;\n}\n`, "declares 'background'");
appStylesCase('an application stylesheet importing nothing', '', 'imports no stylesheet');
appStylesCase('an application stylesheet importing a third-party sheet', '@import "bootstrap/dist/css/bootstrap.css";\n', "import 'bootstrap/dist/css/bootstrap.css' is outside the shared package");

console.log('\nShared stylesheets (standards/rule/frontend-ui.keep-tokens-in-one-stylesheet)');
pathCase('a shared stylesheet written from tokens', 'packages/ui/src/styles/shadows.css', '@utility shade {\n  background: radial-gradient(farthest-side, var(--scroll-shade), transparent);\n}\n', null);
pathCase('a shared stylesheet carrying a literal colour', 'packages/ui/src/styles/shadows.css', '@utility shade {\n  background: radial-gradient(farthest-side, oklch(0 0 0 / 0.16), transparent);\n}\n', "literal colour 'oklch(' belongs in the token stylesheet");
pathCase('a shared stylesheet carrying a hex colour', 'packages/ui/src/styles/shadows.css', '@utility shade {\n  color: #b9bbc6;\n}\n', "literal colour '#b9bbc6' belongs in the token stylesheet");

console.log('\nSource boundary (standards/rule/frontend-ui.select-one-visual-authority)');
manifestCase('second visual system in the workspace root', { dependencies: { '@mui/material': '7.0.0' } }, "second general-purpose visual dependency '@mui/material' requires an override");
manifestCase('second visual system in optionalDependencies', { optionalDependencies: { bootstrap: '5.3.3' } }, "second general-purpose visual dependency 'bootstrap' requires an override");
manifestCase('second visual system pinned through pnpm overrides', { pnpm: { overrides: { '@mantine/core': '8.0.0' } } }, "second general-purpose visual dependency '@mantine/core' requires an override");
manifestCase('second visual system pinned through resolutions', { resolutions: { antd: '5.0.0' } }, "second general-purpose visual dependency 'antd' requires an override");
configCase('UI override without a review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md' }];
}, "a UI rule override requires 'reviewBy'");
configCase('UI override with an expired review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md', reviewBy: '2020-01-01' }];
}, 'has passed; renew the decision');
configCase('UI override with a live review date', (project) => {
  project.overrides = [{ provisionId: 'standards/rule/frontend-ui.select-one-visual-authority', decision: 'docs/decisions/ui-override.md', reviewBy: '2099-01-01' }];
}, null);

console.log('\nShared package (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)');
configCase('a controlled frontend with no shared package', (project) => {
  delete project.paths.uiPackage;
}, 'and no paths.uiPackage');
configCase('a shared package with no public export', (project) => {
  project.paths.uiPackage.publicExports = [];
}, 'publicExports must contain at least one entry point');
configCase('a shared package declaring the same export twice', (project) => {
  project.paths.uiPackage.publicExports = ['@fixture/ui/floorplans', '@fixture/ui/floorplans'];
}, "duplicate '@fixture/ui/floorplans'");
configCase('a source lock outside the package root', (project) => {
  project.paths.uiPackage.sourceLock = 'docs/ui-source-lock.json';
}, 'sourceLock must live inside the shared package root');
{
  const componentsFile = path.join(packageRoot, 'components.json');
  const original = fs.readFileSync(componentsFile, 'utf8');
  writeJson(componentsFile, { ...JSON.parse(original), iconLibrary: 'heroicons' });
  report('components.json naming an icon library the baseline does not pin', 'iconLibrary must be "lucide"', run());
  fs.writeFileSync(componentsFile, original);
}
{
  const original = fs.readFileSync(lockFile, 'utf8');
  const lock = readJson(lockFile);
  lock.preset.style = 'fixture-style';
  writeJson(lockFile, lock);
  report('source lock describing a preset the manifest does not pin', 'preset.style does not match the manifest baseline', run());
  fs.writeFileSync(lockFile, original);
}

console.log('\nAdditional registries (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)');
{
  const componentsFile = path.join(packageRoot, 'components.json');
  const originalComponents = fs.readFileSync(componentsFile, 'utf8');
  const originalLock = fs.readFileSync(lockFile, 'utf8');
  const originalProject = fs.readFileSync(projectFile, 'utf8');
  const components = JSON.parse(originalComponents);
  components.registries = { '@fixture/blocks': 'https://blocks.fixture.test/r' };
  fs.writeFileSync(componentsFile, JSON.stringify(components, null, 2));
  const lock = JSON.parse(originalLock);
  lock.registry = { name: 'fixture', url: 'https://blocks.fixture.test' };
  fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2));
  const withOverride = JSON.parse(originalProject);
  withOverride.overrides = [{ provisionId: 'standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package', decision: 'docs/decisions/ui-override.md', reviewBy: '2099-01-01' }];
  fs.writeFileSync(projectFile, JSON.stringify(withOverride, null, 2));
  report('an additional registry with the override passes both gates', null, run());
  fs.writeFileSync(projectFile, originalProject);
  const output = run();
  report('the configuration gate refuses without the override', "[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] packages/ui/components.json: an additional registry requires an override decision", output);
  report('the source-lock gate refuses without the override', "[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] packages/ui/ui-source-lock.json: registry 'fixture' is not the built-in shadcn registry", output);
  fs.writeFileSync(componentsFile, originalComponents);
  fs.writeFileSync(lockFile, originalLock);
}

console.log('\nSource lock (standards/rule/frontend-ui.track-source-changes)');
fs.appendFileSync(path.join(packageRoot, 'src/components/button.tsx'), '// local change\n');
report('changed copied source without a fork record', 'no longer matches the recorded digest', run());
fs.writeFileSync(path.join(packageRoot, 'src/components/button.tsx'), 'export function Button() {\n  return null;\n}\n');
lockCase('a dependency the manifest does not pin', (lock) => {
  lock.components[0].dependencies = ['not-a-pinned-package'];
}, "dependency 'not-a-pinned-package' is not pinned in the standards manifest");
lockCase('a path escaping the package root', (lock) => {
  lock.components[0].paths = ['../../../outside/button.tsx'];
}, 'path escapes the shared package root');

console.log('\nDesign contract (standards/rule/frontend-ui.publish-a-design-contract, standards/rule/frontend-ui.declare-a-closed-floorplan-set)');
const contract = fs.readFileSync(designFile, 'utf8');
fs.rmSync(designFile);
report('shared package with no design contract', 'no design contract at', run());
fs.writeFileSync(designFile, contract.replace('## Motion', '## Movement'));
report('design contract missing a required section', "missing required section 'Motion'", run());
fs.writeFileSync(designFile, contract.replace('"package": "@fixture/ui"', '"package": "@other/ui"'));
report('design contract naming another package', "package must be '@fixture/ui'", run());
fs.writeFileSync(designFile, contract.replace('"patterns": ["list-page", "entity-page"]', '"patterns": []'));
report('design contract naming no floorplan', 'array has fewer than 1 items', run());
fs.writeFileSync(designFile, contract);
report('the shipped design contract is accepted', null, run());

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);