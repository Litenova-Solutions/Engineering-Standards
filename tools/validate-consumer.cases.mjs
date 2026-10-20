#!/usr/bin/env node
// Reference passing and failing cases for the consumer validator.
//
// The fixture is a throwaway small consumer written in the model shape: a
// library-style shop with one module, one business record, one use case with
// its results, one rule and one event, actors, roles, permissions, entry
// points, one requirement, one decision, and one page per page style. Every
// case mutates one file, runs tools/validate-consumer.mjs against the fixture,
// and asserts that the rule fires or stays silent. A rule without a case here
// is unverified, so add both directions when adding a rule.
//
// The fixture project takes its reviewed version and its known extension id
// from the tracked manifest, so the suite follows the release it ships in.
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

const manifest = JSON.parse(fs.readFileSync(path.join(repository, 'standards.manifest.json'), 'utf8'));
const manifestVersion = manifest.version ?? '2.0.0';
const knownExtension = Object.keys(manifest.extensions ?? {})[0] ?? 'outbox';

function page(meta, body) {
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n${body}`;
}

// Every body sentence stays inside the prose measures, so the baseline case
// proves the checks rather than the fixture prose.
const PAGES = [
  ['docs/product/brief.md',
    { type: 'product', id: 'product/fixture', title: 'Fixture Shop', owner: 'fixture', status: 'approved', boundary: 'The shop sells printed books to readers.', neverDoes: ['The shop never sells ebooks.'], audience: ['actor/customer'] },
    `# Fixture Shop

The shop sells printed books to readers in one city.
`],
  ['docs/product/pricing.md',
    { type: 'product-topic', id: 'pricing', title: 'Pricing', owner: 'fixture', status: 'approved', records: [{ type: 'requirement', id: 'requirement/pricing.flat-fee', title: 'Flat fee', kind: 'promise', statement: 'Every order carries a flat fee of one euro.', values: [{ value: 'EUR 1.00', effectiveFrom: '2026-01-01' }] }] },
    `# Pricing

Every order carries a flat fee of one euro.
`],
  ['docs/product/decisions/0001-launch.md',
    { type: 'decision', id: 'decision/0001-launch', title: 'Launch with a flat fee', owner: 'fixture', status: 'approved', decided: '2026-01-01', options: ['A flat fee on every order.', 'A percentage of each order total.'], changeWhen: 'The fee changes when delivery costs move.', decides: ['requirement/pricing.flat-fee'], basedOn: [] },
    `# Launch with a flat fee

## Context

The shop opens with one fee it can state on every page.

## Options

The choice stood between a flat fee and a percentage.

## Decision

The shop charges a flat fee on every order.

## Consequences

Every receipt shows the same fee line.

## Evidence

The launch plan states the fee on its first page.
`],
  ['docs/domain/actors/customer.md',
    { type: 'actor', id: 'actor/customer', title: 'Customer', owner: 'fixture', status: 'approved', kind: 'person', holds: [{ role: 'role/customer', scope: 'self' }] },
    `# Customer

A customer buys books from the shop.
`],
  ['docs/domain/roles/customer.md',
    { type: 'role', id: 'role/customer', title: 'Customer', owner: 'fixture', status: 'approved', scope: 'self', allows: ['permission/cancel-order'] },
    `# Customer

A customer holds this role on their own orders.
`],
  ['docs/domain/permissions.md',
    { type: 'permission-list', id: 'permissions', title: 'Permissions', owner: 'fixture', status: 'approved', records: [{ type: 'permission', id: 'permission/cancel-order', title: 'Cancel order', code: 'cancel-order', codeType: 'CancelOrder', meaning: 'The holder cancels an order they placed.' }] },
    `# Permissions

The list below names every action the shop grants.
`],
  ['docs/domain/entry-points.md',
    { type: 'entry-point-list', id: 'entry-points', title: 'Entry points', owner: 'fixture', status: 'approved', records: [{ type: 'entry-point', id: 'entry-point/web', title: 'Web shop', kind: 'web-app', path: 'apps/web' }] },
    `# Entry points

Customers reach the shop through the web shop.
`],
  ['docs/domain/modules/orders/README.md',
    { type: 'module', id: 'module/orders', title: 'Orders', owner: 'fixture', status: 'approved', dependsOn: [] },
    `# Orders

The orders module keeps every order claim.
`],
  ['docs/domain/modules/orders/order-claims/README.md',
    {
      type: 'business-record', id: 'business-record/orders.order-claim', title: 'Order claim', owner: 'fixture', status: 'approved', codeName: 'OrderClaim', states: ['Draft', 'Cancelled'],
      records: [
        { type: 'rule', id: 'rule/order-claim.cancel-before-shipment-only', title: 'Cancel before shipment only', kind: 'checked-before', enforcedBy: 'validator', statement: 'A customer cancels an order claim only before its shipment leaves.', governs: ['use-case/orders.cancel-order'], refusal: 'result/cancel-order.cancel-refused', basedOn: [], fulfils: ['requirement/pricing.flat-fee'] },
        { type: 'event', id: 'event/order-claim.order-cancelled', title: 'Order cancelled', meaning: 'An order claim was cancelled.', carries: ['orderId'] },
      ],
    },
    `# Order claim

An order claim states what a customer ordered.
`],
  ['docs/domain/modules/orders/cancel-order.md',
    {
      type: 'use-case', id: 'use-case/orders.cancel-order', title: 'Cancel order', owner: 'fixture', status: 'approved', operation: 'command', needs: ['permission/cancel-order'], reachedThrough: ['entry-point/web'], raises: ['event/order-claim.order-cancelled'], fulfils: ['requirement/pricing.flat-fee'],
      records: [
        { type: 'result', id: 'result/cancel-order.order-cancelled', title: 'Order cancelled', outcome: 'success', status: 200, meaning: 'The order claim was cancelled.' },
        { type: 'result', id: 'result/cancel-order.cancel-refused', title: 'Cancel refused', outcome: 'refusal', code: 'failure/orders.cancel-refused', status: 409, meaning: 'The shipment already left, so the cancel is refused.' },
      ],
    },
    `# Cancel order

A customer cancels an order claim before shipment.
`],
  ['docs/guide/first-run.md',
    { type: 'tutorial', id: 'first-run', title: 'Run It For The First Time', owner: 'fixture', status: 'approved' },
    `# Run It For The First Time

## Purpose

This lesson starts the shop on a reader machine.

## Prerequisites

- The reader installed the runtime the README names.

## Lesson

Run the start command and open the shop page.

## What you built

The shop answers on the reader machine now.
`],
  ['docs/guide/add-a-pack.md',
    { type: 'how-to', id: 'add-a-pack', title: 'Add A Seed Pack', owner: 'fixture', status: 'approved' },
    `# Add A Seed Pack

## Purpose

This page adds one seed pack to the shop.

## Procedure

1. Copy the pack file into the packs folder.
2. Run the seed command the README names.

## Verification

The shop lists the pack on its packs page.
`],
  ['docs/tools/fixture-up.md',
    { type: 'command', id: 'fixture-up', title: 'Fixture Up', owner: 'fixture', status: 'approved' },
    `# Fixture Up

## Name

\`fixture up\` starts the shop.

## Synopsis

\`\`\`bash
fixture up [--detach]
\`\`\`

## Description

The command starts the shop and its database.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| \`target\` | no | Selects the shop to start. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| \`--detach\` | off | Starts the shop behind the terminal. |

## Exit codes

| Code | Meaning |
|:---|:---|
| \`0\` | The shop started. |
| \`1\` | The shop failed to start. |

## Examples

Start the shop from its root:

\`\`\`bash
fixture up
\`\`\`

## Underneath

The command runs the database and then the shop.
`],
  ['docs/reference/ports.md',
    { type: 'reference', id: 'ports', title: 'Allocated Ports', owner: 'fixture', status: 'approved' },
    `# Allocated Ports

## Intent

This page lists the ports the shop uses.

## Reference

| Name | Value |
|:---|:---|
| \`shop\` | \`5080\` |
`],
  ['docs/tools/configuration.md',
    { type: 'configuration', id: 'configuration', title: 'Fixture Settings', owner: 'fixture', status: 'approved' },
    `# Fixture Settings

## Intent

This page lists the settings the shop reads.

## Settings

| Setting | Meaning |
|:---|:---|
| \`seedPack\` | The pack the shop seeds. |

## Precedence

The file sets the base and flags win.
`],
];

const LANGUAGE = {
  schemaVersion: 2,
  terms: [
    {
      id: 'term/order-claim',
      term: 'order claim',
      meaning: 'A claim stating what a customer ordered from the shop.',
      labels: { nl: 'orderclaim', de: 'Bestellanspruch' },
      rejected: [{ word: 'orderclaim', reason: 'the words stay separate.' }],
      owner: 'fixture',
      status: 'approved',
    },
  ],
  mannered: [{ term: 'load-bearing', instead: 'required' }],
};

let failures = 0;

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
  writeFile('standards.project.json', `${JSON.stringify({
    project: { name: 'fixture' },
    size: 'small',
    stacks: [],
    reviewedStandardsVersion: manifestVersion,
    paths: { docs: 'docs', domainDocs: 'docs/domain', uiDocs: 'docs/ui', frontends: [] },
    selectedExtensions: [],
    owners: ['fixture'],
    constraints: { answered: true },
    optionalTypes: [],
  }, null, 2)}\n`);
  fs.mkdirSync(path.join(fixture, 'standards'), { recursive: true });
  fs.copyFileSync(path.join(repository, 'standards.manifest.json'), path.join(fixture, 'standards/standards.manifest.json'));
  for (const [target, meta, body] of PAGES) writeFile(target, page(meta, body));
  writeFile('docs/language.json', `${JSON.stringify(LANGUAGE, null, 2)}\n`);
}

let lastStatus = 0;

function run(extra = []) {
  const result = spawnSync(process.execPath, [validator, fixture, ...extra], { encoding: 'utf8' });
  lastStatus = result.status;
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function report(name, expectation, output) {
  const status = lastStatus;
  const problems = output.split('\n').filter((line) => line.startsWith('  - ')).map((line) => line.slice(4));
  // The exit code is what CI reads, so it is asserted beside the message. A run
  // that prints a problem and exits 0 passes every gate that matters.
  const expectedStatus = expectation === null ? 0 : problems.length ? 1 : 0;
  if (status !== expectedStatus) {
    failures += 1;
    console.log(`  FAIL  ${name}`);
    console.log(`        expected exit ${expectedStatus}, got ${status}`);
    return;
  }
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

// Mutate one page's frontmatter, assert the outcome, then restore it.
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

// Replace text in one page's body, assert the outcome, then restore it.
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

// Mutate one JSON file, assert the outcome, then restore it.
function jsonCase(name, relative, mutate, expectation) {
  const original = readFixture(relative);
  const value = JSON.parse(original);
  mutate(value);
  writeFile(relative, `${JSON.stringify(value, null, 2)}\n`);
  report(name, expectation, run());
  writeFile(relative, original);
}

build();

console.log('Baseline');
report('fixture validates as written', null, run());

console.log('\nProject record');
projectCase('size outside the allowed sizes', (p) => { p.size = 'colossal'; }, '/size');
projectCase('reviewed version outside its form', (p) => { p.reviewedStandardsVersion = 'v2'; }, '/reviewedStandardsVersion');
projectCase('selected extensions outside its array form', (p) => { p.selectedExtensions = 'outbox'; }, '/selectedExtensions');
projectCase('frontend platform outside the stacks', (p) => { p.paths.frontends = [{ name: 'web', path: 'apps/web', platform: 'winforms' }]; }, '/paths/frontends/0/platform');

console.log('\nManifest version and extensions');
projectCase('reviewed version behind the pinned release', (p) => { p.reviewedStandardsVersion = '0.0.0'; }, 'does not match the pinned standards');
projectCase('extension the manifest does not ship', (p) => { p.selectedExtensions = [{ id: 'no-such-extension', criterion: 'Nothing needs it.', reviewBy: '2999-01-01' }]; }, "is not an extension in the pinned standards");
projectCase('extension whose review date passed', (p) => { p.selectedExtensions = [{ id: knownExtension, criterion: 'The suite needs one.', reviewBy: '2020-01-01' }]; }, 'was due for review on 2020-01-01');
projectCase('known extension with a live review date', (p) => { p.selectedExtensions = [{ id: knownExtension, criterion: 'The suite needs one.', reviewBy: '2999-01-01' }]; }, null);

console.log('\nRelease stage');
const stageSelection = (fields) => ({ id: 'stage', criterion: 'No deployment holds customer data.', reviewBy: '2999-01-01', ...fields });
const liveDeferral = { provision: 'standards/rule/ext-stage.declare-the-release-stage', until: '2999-01-01' };
projectCase('stage selection with its release stage and a live deferral', (p) => { p.selectedExtensions = [stageSelection({ releaseStage: 'pre-production', deferredProvisions: [liveDeferral] })]; }, null);
projectCase('stage selection without a release stage', (p) => { p.selectedExtensions = [stageSelection({})]; }, 'releaseStage');
projectCase('stage selection with an unknown release stage', (p) => { p.selectedExtensions = [stageSelection({ releaseStage: 'beta' })]; }, '/releaseStage');
projectCase('release stage on another extension', (p) => { p.selectedExtensions = [{ id: knownExtension, criterion: 'The suite needs one.', reviewBy: '2999-01-01', releaseStage: 'production' }]; }, '/id');
projectCase('production stage that still defers', (p) => { p.selectedExtensions = [stageSelection({ releaseStage: 'production', deferredProvisions: [liveDeferral] })]; }, 'declares production and still defers');
projectCase('deferral of a provision the standards do not hold', (p) => { p.selectedExtensions = [stageSelection({ releaseStage: 'pre-production', deferredProvisions: [{ provision: 'standards/rule/core-model.no-such-rule', until: '2999-01-01' }] })]; }, 'is not a provision in the pinned standards');
projectCase('deferral past its end date', (p) => { p.selectedExtensions = [stageSelection({ releaseStage: 'pre-production', deferredProvisions: [{ ...liveDeferral, until: '2020-01-01' }] })]; }, 'ended on 2020-01-01');

console.log('\nConfigured paths');
projectCase('documentation root that is on disk', (p) => { p.paths.docs = 'docs'; }, null);
projectCase('documentation root that is not on disk', (p) => { p.paths.docs = 'documentation'; }, "paths.docs 'documentation' does not exist");
projectCase('documentation root that holds no Markdown', (p) => { p.paths.docs = 'standards'; }, 'Scanned no Markdown files');
projectCase('language record path that is not on disk', (p) => { p.paths.language = 'docs/missing.json'; }, "paths.language 'docs/missing.json' does not exist");
projectCase('frontend path that is not on disk', (p) => { p.paths.frontends = [{ name: 'web', path: 'apps/missing', platform: 'react' }]; }, "frontend 'web' path 'apps/missing' does not exist");
fileCase(
  'page under the documentation root is scanned',
  'docs/domain/modules/orders/unscanned.md',
  page({ type: 'workflow', id: 'unscanned', title: 'Unscanned', owner: 'fixture', status: 'approved' }, '# Unscanned\n'),
  'matches 0 of',
);

console.log('\nFrontmatter shape');
metaCase('missing required title', 'docs/domain/modules/orders/cancel-order.md', (m) => { delete m.title; }, "missing required property 'title'");
metaCase('removed hand-written status field', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.implementationStatus = 'planned'; }, "unknown property 'implementationStatus'");
metaCase('status outside the lifecycle', 'docs/product/brief.md', (m) => { m.status = 'final'; }, '/status');
metaCase('use-case operation outside command and query', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.operation = 'mutation'; }, '/operation');
metaCase('result entry without its outcome', 'docs/domain/modules/orders/cancel-order.md', (m) => { delete m.records[0].outcome; }, '/records/0');
metaCase('retired page type from the old model', 'docs/domain/modules/orders/cancel-order.md', (m) => { m.type = 'aggregate'; }, 'matches 0 of');
fileCase(
  'page with no frontmatter block',
  'docs/domain/modules/orders/plain.md',
  '# Plain\n\nA page with no record.\n',
  'no frontmatter block',
);
fileCase(
  'page with a broken frontmatter block',
  'docs/domain/modules/orders/broken.md',
  '---\n{bad json}\n---\n\n# Broken\n',
  'JSON parse error',
);

console.log('\nRequired sections');
bodyCase('decision that omits its evidence', 'docs/product/decisions/0001-launch.md', (raw) => raw.replace('## Evidence', '## Notes'), "requires an H2 'Evidence'");
bodyCase('decision that omits its options', 'docs/product/decisions/0001-launch.md', (raw) => raw.replace('## Options', '## Notes'), "requires an H2 'Options'");
bodyCase('tutorial that omits what the reader built', 'docs/guide/first-run.md', (raw) => raw.replace('## What you built', '## Verification'), "requires an H2 'What you built'");
bodyCase('how-to with no verification', 'docs/guide/add-a-pack.md', (raw) => raw.replace('## Verification', '## Notes'), "requires an H2 'Verification'");
bodyCase('command page hiding its mechanism', 'docs/tools/fixture-up.md', (raw) => raw.split('## Underneath')[0], "requires an H2 'Underneath'");
bodyCase('reference page with no reference section', 'docs/reference/ports.md', (raw) => raw.replace('## Reference', '## Procedure'), "requires an H2 'Reference'");
bodyCase('configuration page with no precedence', 'docs/tools/configuration.md', (raw) => raw.replace('## Precedence', '## Notes'), "requires an H2 'Precedence'");
bodyCase('use-case page keeps free body prose', 'docs/domain/modules/orders/cancel-order.md', (raw) => `${raw}\nA note with no heading.\n`, null);
bodyCase('module page keeps free body prose', 'docs/domain/modules/orders/README.md', (raw) => `${raw}\nA note with no heading.\n`, null);

console.log('\nLanguage record');
jsonCase('language record without its version', 'docs/language.json', (record) => { delete record.schemaVersion; }, 'schemaVersion');
jsonCase('language record with the old version', 'docs/language.json', (record) => { record.schemaVersion = 1; }, '/schemaVersion');
jsonCase('term scope that is not a regular expression', 'docs/language.json', (record) => { record.terms[0].rejected[0].scope = '(['; }, 'is not a regular expression');
bodyCase('rejected synonym in page prose', 'docs/domain/modules/orders/README.md', (raw) => `${raw}\nThe orderclaim form is wrong.\n`, 'LANGUAGE_REJECTED_SYNONYM');
bodyCase('mannered term in page prose', 'docs/domain/modules/orders/README.md', (raw) => `${raw}\nThis rule is load-bearing for orders.\n`, 'LANGUAGE_MANNERED_TERM');
bodyCase(
  'generated region skips language and prose',
  'docs/domain/modules/orders/README.md',
  (raw) => `${raw}\n<!-- generated:counts -->\nThe orderclaim form is load-bearing for word counts here and keeps growing past every bound a page would state for one sentence alone today without doubt or pause at all.\n<!-- /generated:counts -->\n`,
  null,
);

console.log('\nControlled prose');
const LONG_SENTENCE = 'The shop opens its doors at nine and closes at six with one till open all day for every reader who walks in before noon without fail.';
bodyCase('sentence past the word bound', 'docs/domain/modules/orders/README.md', (raw) => `${raw}\n${LONG_SENTENCE}\n`, 'controlled-prose problem(s)');
{
  // Report mode turns the measures into advisories. The absent form keeps the
  // case green however the project schema treats the prose block.
  const page = 'docs/domain/modules/orders/README.md';
  const originalPage = readFixture(page);
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.prose = { enforcement: 'report' };
  writeFile(page, `${originalPage}\n${LONG_SENTENCE}\n`);
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  report('report mode turns measures into advisories', { absent: 'controlled-prose problem(s)' }, run());
  writeFile(page, originalPage);
  writeFile('standards.project.json', originalProject);
}
projectCase('language scan pattern that matches nothing', (p) => { p.paths.languageScan = ['src/**/*.cs']; }, 'matches no file');
{
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.paths.languageScan = ['src/**/*.cs'];
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  writeFile('src/order-claims.cs', '// the orderclaim handling lives here\n');
  report('rejected synonym in a scanned surface', 'LANGUAGE_REJECTED_SYNONYM', run());
  fs.rmSync(path.join(fixture, 'src'), { recursive: true, force: true });
  writeFile('standards.project.json', originalProject);
}

console.log('\nControlled UI');
projectCase('controlled frontend without its shared package', (p) => { p.paths.frontends = [{ name: 'web', path: 'apps/web', platform: 'react' }]; }, "no 'paths.uiPackage'");
projectCase('frontend outside the controlled contract stays quiet', (p) => { p.paths.frontends = [{ name: 'door', path: 'apps/door', platform: 'blazor-web' }]; }, { absent: 'controlled UI' });
{
  // A controlled frontend with an unreadable shared package fails the child
  // validator, and its findings merge into this validator's list.
  const originalProject = readFixture('standards.project.json');
  const project = JSON.parse(originalProject);
  project.paths.frontends = [{ name: 'web', path: 'apps/web', platform: 'react', ui: { profile: 'application-balanced' } }];
  project.paths.uiPackage = {
    name: 'fixture-ui',
    path: 'packages/ui',
    componentsJson: 'packages/ui/components.json',
    primitives: 'packages/ui/src',
    tokens: 'packages/ui/tokens.css',
    sourceLock: 'packages/ui/lock.json',
    designContract: 'packages/ui/DESIGN.md',
    publicExports: ['fixture-ui'],
  };
  writeFile('standards.project.json', `${JSON.stringify(project, null, 2)}\n`);
  writeFile('apps/web/package.json', '{}\n');
  writeFile('packages/ui/components.json', '{}\n');
  fs.mkdirSync(path.join(fixture, 'packages/ui/src'), { recursive: true });
  writeFile('packages/ui/tokens.css', '');
  writeFile('packages/ui/lock.json', '{}\n');
  writeFile('packages/ui/DESIGN.md', '# Design\n');
  report('child validator findings merge with their prefix', 'controlled UI:', run());
  fs.rmSync(path.join(fixture, 'apps'), { recursive: true, force: true });
  fs.rmSync(path.join(fixture, 'packages'), { recursive: true, force: true });
  writeFile('standards.project.json', originalProject);
}

console.log('\nMachine-readable contract');
{
  const original = readFixture('standards.project.json');
  writeFile('standards.project.json', '{\n');
  let status = -1;
  let parsed = null;
  try {
    const result = spawnSync(process.execPath, [validator, fixture, '--format=json'], { encoding: 'utf8' });
    status = result.status;
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }
  writeFile('standards.project.json', original);
  if (status !== 2 || !parsed || parsed.ok !== false || !String(parsed.problems ?? []).includes('not valid JSON')) {
    failures += 1;
    console.log('  FAIL  malformed project file keeps the machine-readable contract');
    console.log('        expected exit 2 with ok false and the parse message in problems');
  } else {
    console.log('  pass  malformed project file keeps the machine-readable contract');
  }
}
{
  const page = 'docs/product/decisions/0001-launch.md';
  const original = readFixture(page);
  writeFile(page, original.replace('## Evidence', '## Notes'));
  let parsed = null;
  try {
    const result = spawnSync(process.execPath, [validator, fixture, '--format=json'], { encoding: 'utf8' });
    parsed = result.status === 1 ? JSON.parse(result.stdout) : null;
  } catch {
    parsed = null;
  }
  writeFile(page, original);
  if (!parsed || parsed.ok !== false || parsed.tool !== 'validate-consumer' || !String(parsed.problems ?? []).includes("requires an H2 'Evidence'")) {
    failures += 1;
    console.log('  FAIL  failing run writes its problems as an array');
    console.log("        expected exit 1 with ok false and the missing section in problems");
  } else {
    console.log('  pass  failing run writes its problems as an array');
  }
}

console.log('\nByte-order mark (a leading mark is stripped before parsing)');
fileCase(
  'page with a leading byte-order mark',
  'docs/domain/modules/orders/bom-page.md',
  `\uFEFF${page({ type: 'reference', id: 'bom-page', title: 'BOM page', owner: 'fixture', status: 'approved' }, '# BOM page\n\n## Intent\n\nThis page carries a leading mark.\n\n## Reference\n\n| Name | Value |\n|:---|:---|\n| `mark` | `strip` |\n')}`,
  null,
);
{
  const original = readFixture('standards.project.json');
  writeFile('standards.project.json', `\uFEFF${original}`);
  report('project file with a leading byte-order mark', null, run());
  writeFile('standards.project.json', original);
}

console.log('\nProse detail (each file is read once and reused)');
{
  // The --prose detail reads the same text the main scan already read. A long
  // sentence keeps its detail line after the read-once change.
  const page = 'docs/domain/modules/orders/README.md';
  const original = readFixture(page);
  writeFile(page, `${original}\n${LONG_SENTENCE}\n`);
  const result = spawnSync(process.execPath, [validator, fixture, '--prose'], { encoding: 'utf8' });
  writeFile(page, original);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (!output.includes('Controlled prose (') || !output.includes('PROSE_SENTENCE_LENGTH')) {
    failures += 1;
    console.log('  FAIL  prose detail lists the measures behind the counts');
  } else {
    console.log('  pass  prose detail lists the measures behind the counts');
  }
}

if (!process.env.KEEP_FIXTURE) fs.rmSync(fixture, { recursive: true, force: true }); else console.log(`fixture: ${fixture}`);
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
