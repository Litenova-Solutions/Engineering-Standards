#!/usr/bin/env node
// Reference passing and failing cases for the consumer validator.
//
// The fixture is a throwaway consumer built from the tracked templates in
// templates/consumer/, with placeholders resolved to values that satisfy the
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
  __CAST__: 'scenarios',
  __CAST_TITLE__: 'The Reference Cast',
  __ORGANIZATION__: 'Fixture Promotions',
  __PERSON__: 'Sanne',
  __AMOUNT__: 'ticket price',
  __SITUATION__: 'The onsale minute',
  'YYYY-MM-DD': '2026-01-01',
};

// Each tracked Markdown template and the fixture path its kind requires.
const LAYOUT = [
  ['product-brief.md', 'docs/product/brief.md'],
  ['end-to-end-flow.md', 'docs/product/flows/event-sales.md'],
  ['domain-index.md', 'docs/domain/README.md'],
  ['glossary.md', 'docs/domain/glossary.md'],
  ['scenario-cast.md', 'docs/domain/scenarios.md'],
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
  const project = JSON.parse(resolvePlaceholders(fs.readFileSync(path.join(repository, 'templates/consumer/standards.project.json'), 'utf8')));
  project.paths.frontends = [];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  // The configured-path checks resolve against the fixture, so the fixture
  // holds what the project file and the frontend cases declare. Without them a
  // path error fires in every case and hides the rule under test.
  writeFile('apps/api/Fixture.slnx', '');
  fs.mkdirSync(path.join(fixture, 'apps/admin'), { recursive: true });
  fs.mkdirSync(path.join(fixture, 'standards'), { recursive: true });
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const [template, target] of LAYOUT) {
    writeFile(target, resolvePlaceholders(fs.readFileSync(path.join(repository, 'templates/consumer', template), 'utf8')));
  }
}

function run() {
  const result = spawnSync(process.execPath, [validator, fixture], { encoding: 'utf8' });
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function report(name, expectation, output) {
  const problems = output.split('\n').filter((line) => line.startsWith('  - ')).map((line) => line.slice(4));
  // Three expectation forms: null for a clean run, a string the output must
  // carry, and { absent } for a diagnostic the output must not carry. The third
  // exists because a case that narrows one setting can make an unrelated rule
  // fire, and 'no problems at all' would then assert the wrong thing.
  const matched = expectation === null
    ? problems.length === 0
    : typeof expectation === 'object'
      ? !problems.some((problem) => problem.includes(expectation.absent))
      : problems.some((problem) => problem.includes(expectation));
  if (matched) {
    console.log(`  pass  ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL  ${name}`);
  const wanted = expectation === null
    ? 'no problems'
    : typeof expectation === 'object' ? `no problem naming ${expectation.absent}` : expectation;
  console.log(`        expected: ${wanted}`);
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

// Replace text in one specification's body, assert the outcome, then restore it.
function bodyCase(name, relative, transform, expectation) {
  const original = readFixture(relative);
  writeFile(relative, transform(original));
  report(name, expectation, run());
  writeFile(relative, original);
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

console.log('\nDocumentation root');
projectCase('documentation root that is on disk', (p) => { p.paths.docs = 'docs'; }, null);
projectCase('documentation root that is not on disk', (p) => { p.paths.docs = 'documentation'; }, "paths.docs 'documentation' does not exist");
projectCase('documentation root that holds no Markdown', (p) => { p.paths.docs = 'standards'; }, 'Scanned no Markdown files');
fileCase(
  'page under the documentation root is scanned',
  'docs/domain/modules/orders/unscanned.md',
  `---\n${JSON.stringify({ kind: 'invented', id: 'unscanned', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Unscanned\n`,
  "unknown kind 'invented'",
);

{
  // The scan follows the configured root rather than a hard-coded docs/, so the
  // same page outside that root is not scanned at all.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.paths.docs = 'docs/product';
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  fileCase(
    'page outside the configured documentation root is not scanned',
    'docs/domain/modules/orders/unscanned.md',
    `---\n${JSON.stringify({ kind: 'invented', id: 'unscanned', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Unscanned\n`,
    { absent: "unknown kind 'invented'" },
  );
  writeFile('standards.project.json', originalProject);
}

console.log('\nConfigured paths');
projectCase('domainDocs that is on disk', (p) => { p.paths.domainDocs = 'docs/domain'; }, null);
projectCase('domainDocs that is not on disk', (p) => { p.paths.domainDocs = 'docs/domains'; }, "paths.domainDocs 'docs/domains' does not exist");
projectCase('uiDocs that is on disk', (p) => { p.paths.uiDocs = 'docs/ui'; }, null);
projectCase('uiDocs that is not on disk', (p) => { p.paths.uiDocs = 'docs/interface'; }, "paths.uiDocs 'docs/interface' does not exist");
projectCase('apiSolution that is on disk', (p) => { p.paths.apiSolution = 'apps/api/Fixture.slnx'; }, null);
projectCase('apiSolution that is not on disk', (p) => { p.paths.apiSolution = 'apps/api/Missing.slnx'; }, "paths.apiSolution 'apps/api/Missing.slnx' does not exist");
projectCase('frontend path that is not on disk', (p) => { p.paths.frontends = [{ name: 'admin', path: 'apps/missing', platform: 'other-web' }]; }, "frontend 'admin' path 'apps/missing' does not exist");

console.log('\nMetadata field rules');
metaCase('missing required field', 'docs/domain/modules/orders/cancel-order.md', (m) => { delete m.operationType; }, "missing required 'operationType'");
metaCase('unknown property', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.unexpected = 1; }, "unknown property 'unexpected'");
metaCase('id fails its kind pattern', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.id = 'Orders.CancelOrder'; }, "fails pattern; expected '<module>.<name>' in lower kebab-case");
metaCase('accepted use-case id', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.id = 'orders.cancel-order'; }, null);
// A closed-set error names the values the author may use, so each expectation
// covers the list and not only the value that was rejected.
metaCase('unknown kind', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.kind = 'invented'; }, "unknown kind 'invented'; expected one of product, domain-index, glossary");
metaCase('bad specStatus', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.specStatus = 'final'; }, "bad specStatus 'final'; expected one of draft, approved, retired");
metaCase('bad implementationStatus', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.implementationStatus = 'done'; }, "bad implementationStatus 'done'; expected one of planned, implemented, verified");
metaCase('accepted implementationStatus value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.implementationStatus = 'implemented'; }, null);
metaCase('bad lastReviewed', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.lastReviewed = '01-01-2026'; }, "bad lastReviewed '01-01-2026'; expected YYYY-MM-DD");
metaCase('accepted lastReviewed', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.lastReviewed = '2026-02-01'; }, null);
metaCase('bad operationType', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.operationType = 'mutation'; }, "bad operationType 'mutation'; expected one of command, query");
metaCase('bad risk value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.risks = ['danger']; }, "bad risk 'danger'; expected one of authorization, money, sensitive-data, irreversible, concurrency, durable-delivery, availability");
metaCase('accepted risk value', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.risks = ['authorization']; }, null);
metaCase('bad actor identifier', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.actors = ['Buyer Account']; }, "bad actors id 'Buyer Account'; expected lower kebab-case");
metaCase('accepted actor identifier', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.actors = ['buyer-account']; }, null);

console.log('\nExtension selection');
projectCase('selected extension absent from the manifest', (p) => { p.selectedExtensions = ['outbox-worker']; }, "selectedExtensions 'outbox-worker' is not an extension");
projectCase('selected extension present in the manifest', (p) => { p.selectedExtensions = ['outbox']; }, null);
projectCase('selection object records its criterion', (p) => { p.selectedExtensions = [{ id: 'outbox', criterion: 'Ticket issue cannot lose a delivery.', reviewBy: '2099-01-01' }]; }, null);
projectCase('selection object with an unknown id', (p) => { p.selectedExtensions = [{ id: 'outbox-worker', criterion: 'Durable delivery.', reviewBy: '2099-01-01' }]; }, "selectedExtensions 'outbox-worker' is not an extension");
projectCase('selection review date has passed', (p) => { p.selectedExtensions = [{ id: 'outbox', criterion: 'Export was planned.', reviewBy: '2020-01-01' }]; }, 'was due for review on 2020-01-01');

console.log('\nFrontend platform declaration');
projectCase('frontend omits its platform', (p) => { p.paths.frontends = [{ name: 'admin', path: 'apps/admin' }]; }, "declares no 'platform'");
projectCase('frontend declares an unknown platform', (p) => { p.paths.frontends = [{ name: 'admin', path: 'apps/admin', platform: 'web' }]; }, "unknown platform 'web'");
projectCase('frontend outside the UI contract declares other-web', (p) => { p.paths.frontends = [{ name: 'admin', path: 'apps/admin', platform: 'other-web' }]; }, null);

console.log('\nCross-file references');
metaCase('flow names a use case with no file', 'docs/product/flows/event-sales.md', (m) => { m.useCases = ['orders.no-such-case']; }, "useCase 'orders.no-such-case' has no file");
metaCase('flow with an empty use-case list', 'docs/product/flows/event-sales.md', (m) => { m.useCases = []; }, 'useCases empty');
metaCase('workflow names an absent module', 'docs/domain/workflows/order-fulfillment.md', (m) => { m.participatingModules = ['billing']; }, "participatingModule 'billing' has no module dir");
metaCase('policy names an absent module', 'docs/domain/policies/refund-limit.md', (m) => { m.appliesToModules = ['billing']; }, "appliesToModule 'billing' has no module dir");
metaCase('use-case id does not match its path', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.id = 'orders.other-case'; }, 'does not match its path');
metaCase('aggregate id does not match its path', 'docs/domain/modules/orders/order-claims/README.md', (m) => { m.id = 'orders.other-aggregate'; }, 'does not match its path');
fileCase('duplicate acceptance id', 'docs/domain/modules/orders/second.md', `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.second', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Second\n\n[AC-ORDERS-CANCEL-ORDER-01] Duplicate of the template criterion.\n`, 'Duplicate acceptance id AC-ORDERS-CANCEL-ORDER-01');
fileCase('second product specification', 'docs/product/second.md', `---\n${JSON.stringify({ kind: 'product', id: 'second', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Second product\n`, 'Expected at most one product specification, found 2');
fileCase('second glossary specification', 'docs/domain/second-glossary.md', `---\n${JSON.stringify({ kind: 'glossary', id: 'second', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Second glossary\n`, 'Expected at most one glossary specification, found 2');
fileCase('second modules index', 'docs/domain/modules/second.md', `---\n${JSON.stringify({ kind: 'modules-index', id: 'second', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Second modules index\n`, 'Expected at most one modules-index specification, found 2');
fileCase('section index for a directory that owns no boundary', 'docs/ui/README.md', `---\n${JSON.stringify({ kind: 'section-index', id: 'ui', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# UI architecture\n`, null);
fileCase('a second section index is permitted', 'docs/research/README.md', `---\n${JSON.stringify({ kind: 'section-index', id: 'research', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Research register\n`, null);
fileCase('broken internal link', 'docs/domain/modules/orders/linking.md', '# Linking\n\nSee the [absent record](./absent.md).\n', 'broken link');

console.log('\nUse-case directory grammar (CORE.SYSTEM.CONVENTION.002)');
report('flat single-aggregate module resolves', null, run());
fileCase(
  'nested aggregate subdirectory resolves',
  'docs/domain/modules/orders/order-claims/claim-guest-order.md',
  `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.claim-guest-order', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Claim guest order\n\n## Scenario\n\nSanne claims the order she placed as a guest on the morning after the show.\n`,
  null,
);
fileCase(
  'use case two directories below its module fails',
  'docs/domain/modules/orders/order-claims/deep/too-deep.md',
  `---\n${JSON.stringify({ kind: 'use-case', id: 'orders.too-deep', specStatus: 'approved', implementationStatus: 'planned', owner: 'fixture', lastReviewed: '2026-01-01', operationType: 'command', actors: ['buyer'], entryPoints: [], risks: [], applicableExtensions: [] }, null, 2)}\n---\n\n# Too deep\n`,
  'does not match its path',
);

console.log('\nExtension scope (CORE.SYSTEM.EXTENSIONS.001)');
metaCase('local extension that the project did not select', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['cache']; }, "'cache' is not in selectedExtensions");
projectCase('selected local extension on an allowed kind', (p) => { p.selectedExtensions = ['cache']; }, null);

{
  // A selected local extension is valid on an allowed kind and invalid on a
  // kind its manifest entry excludes. A project-scoped extension is never
  // valid in local metadata.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.selectedExtensions = ['cache', 'locale'];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  metaCase('selected local extension on its allowed kind', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['cache']; }, null);
  metaCase('local extension on an excluded kind', 'docs/domain/modules/orders/README.md', (m) => { m.applicableExtensions = ['cache']; }, "is not applicable to kind 'module'");
  metaCase('project-scoped extension in local metadata', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.applicableExtensions = ['locale']; }, 'must not be listed in local metadata');
  writeFile('standards.project.json', originalProject);
}

console.log('\nAdoption gate (CORE.AUTHORING.SNAPSHOT.006)');
projectCase('reviewed release matches the pinned release', () => {}, null);
projectCase('reviewed release is behind the pinned release', (p) => { p.reviewedStandardsVersion = '1.11.0'; }, 'does not match the pinned standards');
projectCase('reviewed release is absent', (p) => { delete p.reviewedStandardsVersion; }, "missing 'reviewedStandardsVersion'");

console.log('\nProhibited kinds');
projectCase('specification declares a prohibited kind', (p) => { p.prohibitedKinds = ['workflow']; }, "kind 'workflow' is prohibited by this consumer");
projectCase('prohibited kind that no specification declares', (p) => { p.prohibitedKinds = ['section-index']; }, null);
projectCase('prohibited kind the validator does not know', (p) => { p.prohibitedKinds = ['workflows']; }, "prohibitedKinds 'workflows' is not a specification kind");
projectCase('prohibitedKinds outside an array', (p) => { p.prohibitedKinds = 'workflow'; }, 'prohibitedKinds must be an array');

console.log('\nMetadata carrier (CORE.AUTHORING.METADATA.002)');
fileCase(
  'metadata in a fenced block instead of the carrier',
  'docs/domain/modules/orders/fenced.md',
  '# Fenced\n\n```json\n{\n  "kind": "use-case",\n  "id": "orders.fenced"\n}\n```\n',
  "metadata block is not delimited by '---'",
);
fileCase('unterminated metadata block', 'docs/domain/modules/orders/open.md', '---\n{\n  "kind": "use-case"\n}\n', 'unterminated metadata block');
fileCase('invalid JSON in the carrier', 'docs/domain/modules/orders/broken.md', '---\n{\n  "kind": use-case\n}\n---\n\n# Broken\n', 'JSON parse error');
fileCase('prose page with no metadata block', 'docs/operations/security-and-privacy.md', '# Security and privacy\n\nCross-cutting reference prose with no structured kind.\n', 'no metadata block');

console.log('\nUnstructured documentation (CORE.AUTHORING.METADATA.004)');
projectCase('unstructuredDocs outside an array', (p) => { p.paths.unstructuredDocs = 'docs/operations'; }, 'paths.unstructuredDocs must be an array');
projectCase('unstructured path that is not on disk', (p) => { p.paths.unstructuredDocs = ['docs/nowhere']; }, "paths.unstructuredDocs 'docs/nowhere' does not exist");
projectCase('unstructured path that is on disk', (p) => { p.paths.unstructuredDocs = ['docs/operations']; }, null);

{
  // A declared prefix exempts the prose beneath it and nothing else. The
  // second case is the same page one directory away: outside every declared
  // prefix it is reported, which is what keeps the exemption narrow.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.paths.unstructuredDocs = ['docs/operations'];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  fileCase('prose under a declared unstructured path', 'docs/operations/security-and-privacy.md', '# Security and privacy\n\nCross-cutting reference prose with no structured kind.\n', null);
  fileCase('prose outside every declared unstructured path', 'docs/domain/policies/README.md', '# Policies\n\nDirectory index prose with no structured kind.\n', 'no metadata block');
  writeFile('standards.project.json', originalProject);
}

console.log('\nResearch exclusion');
fileCase('research prose without metadata is skipped', 'docs/research/notes.md', '# Notes\n\nUnstructured research prose.\n', null);
fileCase(
  'research record with metadata is validated',
  'docs/research/bad-record.md',
  `---\n${JSON.stringify({ kind: 'decision-evidence', id: 'bad-record', specStatus: 'final', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Bad record\n`,
  "bad specStatus 'final'",
);

console.log('\nScenario sections (CORE.SYSTEM.SCENARIO.001, CORE.SYSTEM.SCENARIO.002, CORE.SYSTEM.SCENARIO.003, CORE.SYSTEM.CONVENTION.007)');
bodyCase(
  'behavior specification with no Scenario section',
  'docs/domain/modules/orders/cancel-order.md',
  (raw) => raw.replace(/## Scenario[\s\S]*?(?=## Trigger)/, ''),
  "no 'Scenario' section",
);
bodyCase(
  'Scenario section with no prose',
  'docs/domain/modules/orders/cancel-order.md',
  (raw) => raw.replace(/## Scenario[\s\S]*?(?=## Trigger)/, '## Scenario\r\n\r\n'),
  "'Scenario' section is empty",
);
bodyCase(
  'Scenario section naming an aggregate invariant',
  'docs/domain/modules/orders/order-claims/README.md',
  (raw) => raw.replace(/## Scenario(\r?\n){2}/, '## Scenario\r\n\r\nSanne cancels the order, which INV-ORDERS-01 permits.\r\n\r\n'),
  'names INV-ORDERS-01',
);
bodyCase(
  'Scenario section past the word bound',
  'docs/domain/modules/orders/README.md',
  (raw) => raw.replace(/## Scenario(\r?\n){2}/, `## Scenario\r\n\r\n${'word '.repeat(200)}\r\n\r\n`),
  'the bound is 120',
);
projectCase('scenarioWordLimit below the accepted floor', (p) => { p.scenarioWordLimit = 10; }, 'scenarioWordLimit must be an integer of at least 40');
{
  // A consumer that raises the bound has the raised value applied, so the
  // convention is replaceable in fact and not only in its wording.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.scenarioWordLimit = 400;
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  // 200 words: over the 120 default and under the raised 400, so the case
  // proves the raise applied. They are shaped as 4-word sentences in 5-sentence
  // paragraphs because the controlled prose measures also read this page, and
  // one 200-word run would report a sentence-length problem rather than the
  // scenario bound this case is about.
  const scenarioBody = Array.from({ length: 10 }, () => 'word word word word. '.repeat(5).trim()).join('\r\n\r\n');
  bodyCase(
    'Scenario section within a raised word bound',
    'docs/domain/modules/orders/README.md',
    (raw) => raw.replace(/## Scenario(\r?\n){2}/, `## Scenario\r\n\r\n${scenarioBody}\r\n\r\n`),
    null,
  );
  writeFile('standards.project.json', originalProject);
}
fileCase(
  'second reference cast',
  'docs/domain/other-scenarios.md',
  `---\n${JSON.stringify({ kind: 'scenario-cast', id: 'other-scenarios', specStatus: 'approved', owner: 'fixture', lastReviewed: '2026-01-01' }, null, 2)}\n---\n\n# Other scenarios\n`,
  'found 2',
);
{
  // The cast is the one record every Scenario section draws from, so its
  // absence is a finding rather than a stage the consumer has not reached.
  const original = readFixture('docs/domain/scenarios.md');
  fs.rmSync(path.join(fixture, 'docs/domain/scenarios.md'));
  report('documentation set with no reference cast', 'Expected exactly one scenario-cast specification, found 0', run());
  writeFile('docs/domain/scenarios.md', original);
}

console.log('\nProject language (CORE.AUTHORING.TERM.002, CORE.AUTHORING.TERM.003, CORE.AUTHORING.VOICE.002)');
{
  const languageFile = 'docs/language.json';
  const record = {
    schemaVersion: 1,
    terms: [{ term: 'holder', rejected: ['seller'], scope: '^domain/modules/orders/', reason: 'seller names the organizer' }],
    mannered: [{ term: 'load-bearing', instead: 'required' }],
  };
  writeFile(languageFile, `${JSON.stringify(record, null, 2)}\n`);

  report('language record with no violation present', null, run());

  bodyCase(
    'rejected synonym inside its scope',
    'docs/domain/modules/orders/README.md',
    (raw) => `${raw}\nThe seller keeps the ticket.\n`,
    'LANGUAGE_REJECTED_SYNONYM',
  );

  // The same word outside the scope is correct, so the scope has to be the
  // thing that decides rather than the word.
  bodyCase(
    'rejected synonym outside its scope',
    'docs/domain/glossary.md',
    (raw) => `${raw}\nThe seller keeps the ticket.\n`,
    { absent: 'LANGUAGE_REJECTED_SYNONYM' },
  );

  bodyCase(
    'mannered term anywhere',
    'docs/domain/glossary.md',
    (raw) => `${raw}\nThat rule is load-bearing.\n`,
    'LANGUAGE_MANNERED_TERM',
  );

  // A word is matched on its own, so a rejection of 'seller' leaves a longer
  // word containing it alone.
  bodyCase(
    'rejected synonym as part of a longer word',
    'docs/domain/modules/orders/README.md',
    (raw) => `${raw}\nThe sellerships remain open.\n`,
    { absent: 'LANGUAGE_REJECTED_SYNONYM' },
  );

  // A fenced block is code, and code carries the rejected name because the
  // identifier is what it is called.
  bodyCase(
    'rejected synonym inside a fenced block',
    'docs/domain/modules/orders/README.md',
    (raw) => `${raw}\n\`\`\`text\nseller\n\`\`\`\n`,
    { absent: 'LANGUAGE_REJECTED_SYNONYM' },
  );

  // A scope that does not compile would reject nothing while reporting a pass,
  // which is the fail-open shape the validator refuses elsewhere.
  writeFile(languageFile, `${JSON.stringify({ ...record, terms: [{ term: 'holder', rejected: ['seller'], scope: '^domain/[' }] }, null, 2)}\n`);
  report('language scope that is not a regular expression', 'is not a regular expression', run());

  fs.rmSync(path.join(fixture, languageFile));
  report('no language record present', null, run());
}

console.log('\nControlled prose in consumer documentation (CORE.AUTHORING.PROSE.002, CORE.AUTHORING.PROSE.003)');
{
  const page = 'docs/domain/modules/orders/README.md';
  const original = readFixture(page);
  const longSentence = `\n${'word '.repeat(30).trim()}.\n`;
  writeFile(page, `${original}${longSentence}`);
  report('measure violation with no baseline entry', 'controlled-prose problem(s) and no prose baseline entry', run());

  const reviewed = splitMeta(original).meta.lastReviewed;
  writeFile('docs/prose-baseline.json', `${JSON.stringify({ pages: { [page]: { count: 1, lastReviewed: reviewed } } }, null, 2)}\n`);
  report('measure violation recorded in the baseline', null, run());

  // Debt is accepted at a count. A page that grows past it is reported even
  // though the page is listed, because a baseline that absorbs new debt is an
  // exemption rather than a record.
  writeFile(page, `${original}${longSentence}${longSentence}`);
  report('baselined page whose debt grew', 'controlled-prose problems grew from 1 to 2', run());

  // A page read against the code leaves the baseline in the same change.
  writeFile(page, `${original}${longSentence}`);
  const advanced = splitMeta(original);
  advanced.meta.lastReviewed = '2099-01-01';
  writeFile(page, `${joinMeta(advanced.meta, advanced.body)}${longSentence}`);
  report('baselined page whose lastReviewed advanced', 'leaves the prose baseline in the same change', run());

  writeFile(page, original);
  report('baseline entry for a page that is now clean', 'listed in the prose baseline and now clean', run());

  fs.rmSync(path.join(fixture, 'docs/prose-baseline.json'));
  writeFile(page, original);
}

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
