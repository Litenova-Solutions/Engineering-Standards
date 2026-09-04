#!/usr/bin/env node
// Reference passing and failing cases for the use-case parity validator.
//
// Each case writes one handler, specification, or configuration change into a
// throwaway consumer, runs tools/validate-parity.mjs against it, and asserts
// both the reported finding and the exit code. The exit code is part of every
// assertion because '--report' changes only that, and a rule without a case here
// is unverified.
//
// Usage:
//   node tools/validate-parity.cases.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validator = path.join(repository, 'tools', 'validate-parity.mjs');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'litenova-parity-cases-'));
const applicationProject = 'apps/api/src/Acme.Application';
const projectFile = path.join(fixture, 'standards.project.json');

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

function baseProject() {
  const project = resolvePlaceholders(readJson(path.join(repository, 'templates/consumer/standards.project.json')));
  project.paths.apiSolution = 'apps/api/Acme.slnx';
  project.paths.domainDocs = 'docs/domain';
  return project;
}

function write(relative, contents) {
  const file = path.join(fixture, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  return file;
}

// A handler file's content is never read. The operation folder above it names the
// use case, so the fixture writes the shortest file that carries the name.
function handler(relative) {
  return write(relative, 'internal sealed class Handler;\n');
}

function specificationText(id, overrides = {}) {
  const meta = {
    kind: 'use-case',
    id,
    specStatus: 'approved',
    implementationStatus: 'implemented',
    owner: 'fixture',
    lastReviewed: '2026-01-01',
    operationType: 'command',
    actors: ['person'],
    entryPoints: ['api'],
    risks: [],
    applicableExtensions: [],
    ...overrides,
  };
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n\n# ${id}\n`;
}

function specification(relative, id, overrides = {}) {
  return write(relative, specificationText(id, overrides));
}

function build() {
  write('apps/api/Acme.slnx', '<Solution>\n  <Folder Name="/src/">\n    <Project Path="src/Acme.Application/Acme.Application.csproj" />\n  </Folder>\n</Solution>\n');
  write(`${applicationProject}/Acme.Application.csproj`, '<Project Sdk="Microsoft.NET.Sdk" />\n');
  writeJson(projectFile, baseProject());
  handler(`${applicationProject}/Sales/Vouchers/RedeemVoucher/RedeemVoucherCommandHandler.cs`);
  specification('docs/domain/modules/sales/vouchers/redeem-voucher.md', 'sales.redeem-voucher');
}

function run(...args) {
  const result = spawnSync(process.execPath, [validator, fixture, ...args], { encoding: 'utf8' });
  return { output: `${result.stdout ?? ''}${result.stderr ?? ''}`, status: result.status };
}

function report(name, expectation, result, expectedStatus = expectation === null ? 0 : 1) {
  const problems = result.output.split('\n').filter((line) => line.startsWith('  - ')).map((line) => line.slice(4));
  const matched = expectation === null ? problems.length === 0 : problems.some((problem) => problem.includes(expectation));
  if (matched && result.status === expectedStatus) {
    console.log(`  pass  ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL  ${name}`);
  console.log(`        expected: ${expectation === null ? 'no problems' : expectation} (exit ${expectedStatus})`);
  console.log(`        exit:     ${result.status}`);
  for (const problem of problems) console.log(`        actual:   ${problem}`);
}

// A skip and a usage error carry their statement in the summary rather than in a
// finding line, so those cases assert the line the reader sees.
function reportLine(name, snippet, result, expectedStatus) {
  if (result.output.includes(snippet) && result.status === expectedStatus) {
    console.log(`  pass  ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL  ${name}`);
  console.log(`        expected: ${snippet} (exit ${expectedStatus})`);
  console.log(`        exit:     ${result.status}`);
  console.log(`        actual:   ${result.output.trim().split('\n').join('\n        ')}`);
}

// A file case adds one file, runs, and removes it, so every case starts from the
// same baseline consumer.
function fileCase(name, relative, contents, expectation, options = {}) {
  const file = write(relative, contents);
  report(name, expectation, run(...(options.args ?? [])), options.status);
  fs.rmSync(file);
}

// A configuration case sets the project's 'parity' block, runs, and restores the
// baseline project file. The baseline keeps whatever the tracked template ships,
// so every other case also proves the shipped block changes no outcome.
function configCase(name, parity, expectation, options = {}) {
  writeJson(projectFile, { ...baseProject(), parity });
  report(name, expectation, run(...(options.args ?? [])), options.status);
  writeJson(projectFile, baseProject());
}

build();

console.log('Baseline');
report('a handler and its specification are in parity', null, run());

console.log('\nHandler with no specification (CORE.SYSTEM.COVERAGE.001)');
fileCase(
  'operation folder that no page covers',
  `${applicationProject}/Sales/Vouchers/VoidVoucher/VoidVoucherCommandHandler.cs`,
  'internal sealed class Handler;\n',
  `handler with no specification: ${applicationProject}/Sales/Vouchers/VoidVoucher/VoidVoucherCommandHandler.cs -> sales.void-voucher`,
);
fileCase(
  'operation folder under a second aggregate that no page covers',
  `${applicationProject}/Sales/Discounts/ApplyDiscount/ApplyDiscountCommandHandler.cs`,
  'internal sealed class Handler;\n',
  'sales.apply-discount',
);

console.log('\nSpecification with no handler (CORE.SYSTEM.COVERAGE.001)');
fileCase(
  'implemented page that no operation folder covers',
  'docs/domain/modules/sales/vouchers/void-voucher.md',
  specificationText('sales.void-voucher'),
  'specification with no handler: docs/domain/modules/sales/vouchers/void-voucher.md',
);
fileCase(
  'planned page that no operation folder covers',
  'docs/domain/modules/sales/vouchers/plan-voucher-campaign.md',
  specificationText('sales.plan-voucher-campaign', { implementationStatus: 'planned' }),
  null,
);

console.log('\nName derivation (BACKEND.APPLICATION.CONVENTION.001)');
specification('docs/domain/modules/event-operations/event-tasks/update-event-task.md', 'event-operations.update-event-task');
fileCase(
  'a multi-word module folder resolves to its kebab-case module id',
  `${applicationProject}/EventOperations/EventTasks/UpdateEventTask/UpdateEventTaskCommandHandler.cs`,
  'internal sealed class Handler;\n',
  null,
);
fs.rmSync(path.join(fixture, 'docs/domain/modules/event-operations/event-tasks/update-event-task.md'));
fileCase(
  'an acronym run stays one identifier segment',
  `${applicationProject}/Sales/Vouchers/ReadCSVImport/ReadCSVImportQueryHandler.cs`,
  'internal sealed class Handler;\n',
  '-> sales.read-csv-import',
);
specification('docs/domain/modules/sales/vouchers/read-csv-import.md', 'sales.read-csv-import');
fileCase(
  'the derived acronym id resolves to its page',
  `${applicationProject}/Sales/Vouchers/ReadCSVImport/ReadCSVImportQueryHandler.cs`,
  'internal sealed class Handler;\n',
  null,
);
fs.rmSync(path.join(fixture, 'docs/domain/modules/sales/vouchers/read-csv-import.md'));

console.log('\nOperation folder shape (BACKEND.APPLICATION.STRUCTURE.001)');
fileCase(
  'handler sitting directly in its module directory',
  `${applicationProject}/Sales/ArchiveVoucherCommandHandler.cs`,
  'internal sealed class Handler;\n',
  `handler outside an operation folder: ${applicationProject}/Sales/ArchiveVoucherCommandHandler.cs`,
);
fileCase(
  'two aggregates naming the same operation',
  `${applicationProject}/Sales/Discounts/RedeemVoucher/RedeemVoucherCommandHandler.cs`,
  'internal sealed class Handler;\n',
  "duplicate specification id 'sales.redeem-voucher'",
);

console.log('\nEvent reactions (CORE.SYSTEM.REACTION.001)');
fileCase(
  'a reaction carries no use-case specification',
  `${applicationProject}/Sales/Vouchers/IssueVoucherOnOrderConfirmed/IssueVoucherOnOrderConfirmedReaction.cs`,
  'internal sealed class Reaction;\n',
  null,
);
fileCase(
  'a reaction named as a handler is still a reaction',
  `${applicationProject}/Sales/Vouchers/IssueVoucherOnOrderConfirmed/IssueVoucherOnOrderConfirmedReactionHandler.cs`,
  'internal sealed class Handler;\n',
  null,
);
fileCase(
  'the same operation folder holding a command handler is a use case',
  `${applicationProject}/Sales/Vouchers/IssueVoucherOnOrderConfirmed/IssueVoucherOnOrderConfirmedCommandHandler.cs`,
  'internal sealed class Handler;\n',
  'sales.issue-voucher-on-order-confirmed',
);

console.log('\nConsumer configuration');
const uncovered = `${applicationProject}/Sales/Vouchers/VoidVoucher/VoidVoucherCommandHandler.cs`;
handler(uncovered);
report('the default run fails on an open finding', 'handler with no specification', run(), 1);
report("'--report' lists the same finding and exits 0", 'handler with no specification', run('--report'), 0);
configCase('an ignoreHandlers pattern covering the folder', { ignoreHandlers: [`${applicationProject}/Sales/Vouchers/VoidVoucher/**`] }, null);
configCase('an ignoreUseCases entry naming the id', { ignoreUseCases: ['sales.void-voucher'] }, null);
configCase('an empty parity block changes nothing', {}, 'handler with no specification', { status: 1 });
fs.rmSync(path.join(fixture, uncovered));

configCase('an applicationProject that names the real project', { applicationProject }, null);
writeJson(projectFile, { ...baseProject(), parity: { applicationProject: 'apps/api/src/Missing.Application' } });
reportLine('an applicationProject that does not exist', "parity.applicationProject does not exist 'apps/api/src/Missing.Application'", run(), 2);
writeJson(projectFile, baseProject());

reportLine('an unknown option is a usage error', 'Unknown option --strict', run('--strict'), 2);

const project = readJson(projectFile);
delete project.paths.apiSolution;
writeJson(projectFile, project);
reportLine('a consumer with no API solution skips parity checking', 'use-case parity checking is not activated', run(), 0);
report('the skipped run reports no problem', null, run());
writeJson(projectFile, baseProject());

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
