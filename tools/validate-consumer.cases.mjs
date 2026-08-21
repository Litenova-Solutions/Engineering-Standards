#!/usr/bin/env node
// Reference passing and failing cases for the consumer validator.
//
// The fixture is a throwaway consumer built from the tracked templates in
// templates/docs/, with placeholders resolved to values that satisfy the
// directory grammar. Every case mutates one file, runs
// tools/validate-consumer.mjs against the fixture, and asserts that the rule
// fires or stays silent. A rule without a case here is unverified, so add both
// directions when adding a rule.
//
// Building the fixture from the tracked templates also validates every shipped
// Markdown metadata block as a side effect: a template that loses a required
// field or gains an unknown property fails the baseline case.
//
// Usage:
//   node tools/validate-consumer.cases.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validator = path.join(repository, 'tools', 'validate-consumer.mjs');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'litenova-consumer-cases-'));

// Placeholder values chosen so ids, paths, and cross-file references agree.
const VALUES = {
  __PROJECT__: 'fixture',
  __PROJECT_ID__: 'fixture',
  __API_SOLUTION__: 'apps/api/Fixture.slnx',
  __OWNER__: 'fixture',
  '__TITLE__': 'Fixture',
  __MODULE__: 'orders',
  __MODULE_ID__: 'ORDERS',
  __USE_CASE__: 'cancel-order',
  __USE_CASE_ID__: 'CANCEL-ORDER',
  __AGGREGATE_ID__: 'order-claims',
  __OPERATION_TYPE__: 'command',
  __ACTOR__: 'buyer',
  __FLOW__: 'event-sales',
  __FLOW_ID__: 'EVENT-SALES',
  __WORKFLOW__: 'order-fulfillment',
  __POLICY__: 'refund-limit',
  __APP__: 'web',
  __PAGE__: 'cancel',
  __ROUTE__: '/cancel',
  __DECISION_ID__: '0001-fixture',
  __EVIDENCE_RECORD__: 'fixture-evidence',
  __RELEASE_RECORD_ID__: '2026-01-01-fixture',
  __VERSION__: '1.0.0',
  __RUNBOOK_ID__: 'restore-database',
  'YYYY-MM-DD': '2026-01-01',
};

// Each tracked Markdown template and the fixture path its kind requires.
const LAYOUT = [
  ['product-brief.md', 'docs/product/brief.md'],
  ['end-to-end-flow.md', 'docs/product/flows/event-sales.md'],
  ['domain-index.md', 'docs/domain/README.md'],
  ['glossary.md', 'docs/domain/glossary.md'],
  ['modules-index.md', 'docs/domain/modules/README.md'],
  ['module.md', 'docs/domain/modules/orders/README.md'],
  ['use-case.md', 'docs/domain/modules/orders/cancel-order.md'],
  ['aggregate.md', 'docs/domain/modules/orders/order-claims/README.md'],
  ['workflow.md', 'docs/domain/workflows/order-fulfillment.md'],
  ['domain-policy.md', 'docs/domain/policies/refund-limit.md'],
  ['operating-limits.md', 'docs/operations/limits.md'],
  ['page.md', 'docs/ui/web/cancel.md'],
  ['decision.md', 'docs/decisions/0001-fixture.md'],
  ['runbook.md', 'docs/runbooks/restore-database.md'],
  ['release-record.md', 'docs/releases/2026-01-01-fixture.md'],
  ['decision-evidence.md', 'docs/research/fixture-evidence.md'],
];

let failures = 0;

function resolvePlaceholders(text) {
  let out = text;
  for (const [token, value] of Object.entries(VALUES)) out = out.split(token).join(value);
  return out;
}

function writeFile(relative, contents) {
  const file = path.join(fixture, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  return file;
}

function readFixture(relative) {
  return fs.readFileSync(path.join(fixture, relative), 'utf8');
}

function splitMeta(raw) {
  const end = raw.indexOf('\n---', 3);
  return { meta: JSON.parse(raw.slice(3, end).trim()), body: raw.slice(end + 4) };
}

function joinMeta(meta, body) {
  return `---\n${JSON.stringify(meta, null, 2)}\n---${body}`;
}

function build() {
  // The project file drives path resolution. The fixture declares no frontend,
  // so the controlled UI validator stays out of these cases.
  const project = JSON.parse(resolvePlaceholders(fs.readFileSync(path.join(repository, 'templates/docs/standards.project.json'), 'utf8')));
  project.paths.frontends = [];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  fs.mkdirSync(path.join(fixture, 'standards'), { recursive: true });
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const [template, target] of LAYOUT) {
    writeFile(target, resolvePlaceholders(fs.readFileSync(path.join(repository, 'templates/docs', template), 'utf8')));
  }
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

// Mutate one specification's metadata, assert the outcome, then restore it.
function metaCase(name, relative, mutate, expectation) {
  const original = readFixture(relative);
  const { meta, body } = splitMeta(original);
  mutate(meta);
  writeFile(relative, joinMeta(meta, body));
  report(name, expectation, run());
  writeFile(relative, original);
}

// Write one extra file, assert the outcome, then remove it.
function fileCase(name, relative, contents, expectation) {
  writeFile(relative, contents);
  report(name, expectation, run());
  fs.rmSync(path.join(fixture, relative));
}

// Mutate standards.project.json, assert the outcome, then restore it.
function projectCase(name, mutate, expectation) {
  const original = readFixture('standards.project.json');
  const project = JSON.parse(original);
  mutate(project);
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  report(name, expectation, run());
  writeFile('standards.project.json', original);
}

build();

console.log('Baseline');
report('tracked templates validate as shipped', null, run());

console.log('\nMetadata field rules');
metaCase('missing required field', 'docs/domain/modules/orders/cancel-order.md', (m) => { delete m.operationType; }, "missing required 'operationType'");
metaCase('unknown property', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.unexpected = 1; }, "unknown property 'unexpected'");
metaCase('id fails its kind pattern', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.id = 'Orders.CancelOrder'; }, 'fails pattern');
metaCase('unknown kind', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.kind = 'invented'; }, "unknown kind 'invented'");
metaCase('bad specStatus', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.specStatus = 'final'; }, "bad specStatus 'final'");
metaCase('bad implementationStatus', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.implementationStatus = 'done'; }, 'bad implementationStatus');
metaCase('accepted implementationStatus value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.implementationStatus = 'implemented'; }, null);
metaCase('bad lastReviewed', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.lastReviewed = '01-01-2026'; }, 'bad lastReviewed');
metaCase('bad operationType', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.operationType = 'mutation'; }, 'bad operationType');
metaCase('bad risk value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.risks = ['danger']; }, "bad risk 'danger'");
metaCase('accepted risk value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.risks = ['authorization']; }, null);
metaCase('bad actor identifier', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.actors = ['Buyer Account']; }, 'bad actors id');

console.log('\nCross-file references');
metaCase('flow names a use case with no file', 'docs/product/flows/event-sales.md', (m) => { m.useCases = ['orders.no-such-case']; }, "useCase 'orders.no-such-case' has no file");
metaCase('flow with an empty use-case list', 'docs/product/flows/event-sales.md', (m) => { m.useCases = []; }, 'useCases empty');
metaCase('workflow names an absent module', 'docs/domain/workflows/order-fulfillment.md', (m) => { m.participatingModules = ['billing']; }, "participatingModule 'billing' has no module dir");
metaCase('policy names an absent module', 'docs/domain/policies/refund-limit.md', (m) => { m.appliesToModules = ['billing']; }, "appliesToModule 'billing' has no module dir");
metaCase('use-case id does not match its path', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.id = 'orders.other-case'; }, 'does not match its path');
metaCase('aggregate id does not match its path', 'docs/domain/modules/orders/order-claims/README.md', (m) => { m.id = 'orders.other-aggregate'; }, 'does not match its path');
fileCase('duplicate acceptance id', 'docs/domain/modules/orders/second.md', `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.second', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Second\n\n[AC-ORDERS-CANCEL-ORDER-01] Duplicate of the template criterion.\n`, 'Duplicate acceptance id AC-ORDERS-CANCEL-ORDER-01');
fileCase('second product specification', 'docs/product/second.md', `---\n${JSON.stringify({ kind: 'product', id: 'second', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Second product\n`, 'Expected exactly one product specification, found 2');
fileCase('broken internal link', 'docs/domain/modules/orders/linking.md', '# Linking\n\nSee the [absent record](./absent.md).\n', 'broken link');

console.log('\nUse-case directory grammar (AGENTIC.CONVENTION.002)');
report('flat single-aggregate module resolves', null, run());
fileCase(
  'nested aggregate subdirectory resolves',
  'docs/domain/modules/orders/order-claims/claim-guest-order.md',
  `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.claim-guest-order', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Claim guest order\n`,
  null,
);
fileCase(
  'use case two directories below its module fails',
  'docs/domain/modules/orders/order-claims/deep/too-deep.md',
  `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.too-deep', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Too deep\n`,
  'does not match its path',
);

console.log('\nExtension scope (AGENTIC.EXTENSIONS.001)');
metaCase('local extension that the project did not select', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['caching']; }, "'caching' is not in selectedExtensions");
projectCase('selected local extension on an allowed kind', (p) => { p.selectedExtensions = ['caching']; }, null);

{
  // A selected local extension is valid on an allowed kind and invalid on a
  // kind its manifest entry excludes. A project-scoped extension is never
  // valid in local metadata.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.selectedExtensions = ['caching', 'localization'];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  metaCase('selected local extension on its allowed kind', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['caching']; }, null);
  metaCase('local extension on an excluded kind', 'docs/domain/modules/orders/README.md', (m) => { m.applicableExtensions = ['caching']; }, "is not applicable to kind 'module'");
  metaCase('project-scoped extension in local metadata', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['localization']; }, 'must not be listed in local metadata');
  writeFile('standards.project.json', originalProject);
}

console.log('\nAdoption gate (WRITING.SNAPSHOT.006)');
projectCase('reviewed release matches the pinned release', () => {}, null);
projectCase('reviewed release is behind the pinned release', (p) => { p.reviewedStandardsVersion = '1.11.0'; }, 'does not match the pinned standards');
projectCase('reviewed release is absent', (p) => { delete p.reviewedStandardsVersion; }, "missing 'reviewedStandardsVersion'");

console.log('\nMetadata carrier (WRITING.METADATA.002)');
fileCase(
  'metadata in a fenced block instead of the carrier',
  'docs/domain/modules/orders/fenced.md',
  '# Fenced\n\n```json\n{\n  "kind": "use-case",\n  "id": "orders.fenced"\n}\n```\n',
  "metadata block is not delimited by '---'",
);
fileCase('unterminated metadata block', 'docs/domain/modules/orders/open.md', '---\n{\n  "kind": "use-case"\n}\n', 'unterminated metadata block');
fileCase('invalid JSON in the carrier', 'docs/domain/modules/orders/broken.md', '---\n{\n  "kind": use-case\n}\n---\n\n# Broken\n', 'JSON parse error');
fileCase('prose page with no metadata is not a specification', 'docs/operations/security-and-privacy.md', '# Security and privacy\n\nCross-cutting reference prose with no structured kind.\n', null);

console.log('\nResearch exclusion');
fileCase('research prose without metadata is skipped', 'docs/research/notes.md', '# Notes\n\nUnstructured research prose.\n', null);
fileCase(
  'research record with metadata is validated',
  'docs/research/bad-record.md',
  `---\n${JSON.stringify({ kind: 'decision-evidence', id: 'bad-record', specStatus: 'final', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Bad record\n`,
  "bad specStatus 'final'",
);

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
