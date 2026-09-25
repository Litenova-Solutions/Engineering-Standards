#!/usr/bin/env node
// Reference passing and failing cases for the specification-sync validator.
//
// Each case writes one page, code element, feature, or configuration change into
// a throwaway consumer, runs tools/validate-spec-sync.mjs against it, and asserts
// both the reported finding and the exit code. The exit code is part of every
// assertion because '--report' changes only that, and a rule without a case here
// is unverified.
//
// Usage:
//   node tools/validate-spec-sync.test.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validator = path.join(repository, 'tools', 'validate-spec-sync.mjs');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'litenova-spec-sync-cases-'));
const projectFile = path.join(fixture, 'standards.project.json');

const PAGE = 'docs/domain/modules/sales/vouchers/redeem-voucher.md';
const VOID_PAGE = 'docs/domain/modules/sales/vouchers/void-voucher.md';
const UI_PAGE = 'docs/domain/modules/sales/vouchers/ui-evidence.md';
const DOMAIN = 'apps/api/src/Entro.Domain/Sales/Vouchers';
const APPLICATION = 'apps/api/src/Entro.Application/Sales/Vouchers/RedeemVoucher';
const TESTS = 'apps/api/tests/Acceptance';
const FEATURES = `${TESTS}/Features`;
const FRONTEND_EVIDENCE = 'apps/admin/app/evidence';

const CRITERION = 'acceptance-criterion/sales.redeem-voucher.redeems';
const FEATURE_TAG = '@implements_entro_acceptance-criterion_sales.redeem-voucher.redeems';
const UI_CRITERION = 'acceptance-criterion/admin.dashboard.shows-the-dashboard-heading';
const CRITERIA_PAGE = 'docs/domain/modules/sales/vouchers/criteria.md';
const UI_ORPHAN = 'acceptance-criterion/admin.dashboard.orphan-criterion';

let failures = 0;

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function write(relative, contents) {
  const file = path.join(fixture, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  return file;
}

// A use-case page cites every identifier its code elements mark, so the baseline
// has both populations non-empty. An 'extra' entry is an identifier no baseline
// code element carries, which is what a gap case needs.
function pageText(extra = []) {
  const ids = [
    'aggregate/voucher',
    'event/voucher.redeemed',
    'exception/voucher.not-found',
    'invariant/voucher.redeemed-once',
    'validation/redeem-voucher.code-required',
    'authorization/redeem-voucher.actor-allowed',
    'acceptance-criterion/sales.redeem-voucher.redeems',
    'path/sales.redeem-voucher.success',
    'failure/sales.not_found',
    ...extra,
  ];
  const meta = {
    kind: 'use-case',
    id: 'use-case/sales.redeem-voucher',
    specStatus: 'approved',
    implementationStatus: 'implemented',
  };
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n\n# Redeem voucher\n\nThe page cites ${ids.map((id) => `\`${id}\``).join(', ')}.\n`;
}

function baseProject() {
  return {
    project: { name: 'fixture' },
    profile: 'dotnet-nextjs',
    reviewedStandardsVersion: '2.0.0',
    paths: { domainDocs: 'docs/domain', testRoots: ['apps/api/tests'], frontends: [{ name: 'admin', path: 'apps/admin' }] },
    specSync: {
      codeRoots: ['apps/api/src', 'apps/api/tests'],
      markedRoots: [
        'apps/api/src/Entro.Domain',
        'apps/api/src/Entro.Application',
        'apps/api/src/Entro.WebApi',
        'apps/api/tests',
      ],
      featureRoots: [FEATURES],
      evidenceRoots: ['apps/admin'],
    },
  };
}

function build() {
  writeJson(projectFile, baseProject());

  write(PAGE, pageText());
  write(`${DOMAIN}/Voucher.cs`,
    '/// <implements>entro/aggregate/voucher</implements>\npublic sealed class Voucher : AggregateRoot<VoucherId>;\n');
  write(`${DOMAIN}/Events/VoucherRedeemedEvent.cs`,
    '/// <implements>entro/event/voucher.redeemed</implements>\npublic sealed record VoucherRedeemedEvent;\n');
  write(`${DOMAIN}/Exceptions/VoucherNotFoundException.cs`,
    '/// <implements>entro/exception/voucher.not-found</implements>\npublic sealed class VoucherNotFoundException : Exception;\n');
  write(`${DOMAIN}/VoucherState.cs`,
    '/// <implements>entro/value/voucher.state.draft</implements>\npublic sealed record Draft : VoucherState;\npublic abstract record VoucherState;\n');
  write(`${APPLICATION}/RedeemVoucherCommand.cs`,
    '/// <implements>entro/use-case/sales.redeem-voucher</implements>\npublic sealed record RedeemVoucherCommand;\n');
  write(`${APPLICATION}/RedeemVoucherCommandHandler.cs`,
    '/// <implements>entro/use-case/sales.redeem-voucher</implements>\n'
    + '/// <emits>entro/event/voucher.redeemed</emits>\n'
    + '/// <enforces>entro/invariant/voucher.redeemed-once</enforces>\n'
    + 'public sealed class RedeemVoucherCommandHandler;\n');
  write(`${APPLICATION}/RedeemVoucherCommandValidator.cs`,
    '/// <implements>entro/validation/redeem-voucher.code-required</implements>\npublic sealed class RedeemVoucherCommandValidator;\n');
  write(`${APPLICATION}/RedeemVoucherAuthorizer.cs`,
    '/// <implements>entro/authorization/redeem-voucher.actor-allowed</implements>\npublic sealed class RedeemVoucherAuthorizer;\n');
  write(`${APPLICATION}/RedeemVoucherEndpoints.cs`,
    '/// <implements>entro/use-case/sales.redeem-voucher</implements>\npublic static class RedeemVoucherEndpoints;\n');
  write(`${TESTS}/RedeemVoucherTests.cs`,
    `/// <covers>entro/${CRITERION}</covers>\n`
    + 'public sealed class RedeemVoucherTests\n{\n    [Fact]\n    public void Redeems() { }\n}\n');
  write(`${FEATURES}/RedeemVoucher.feature`,
    `Feature: Redeeming a voucher\n\n  ${FEATURE_TAG}\n  Scenario: Redeems a voucher\n    Given a voucher exists\n`);
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

// A pair or group case adds several files at once, because some gaps only appear
// when a page and the code element it names are both present.
function withFiles(entries, name, expectation, options = {}) {
  const files = entries.map(([relative, contents]) => write(relative, contents));
  report(name, expectation, run(...(options.args ?? [])), options.status);
  for (const file of files) fs.rmSync(file);
}

const VOID_HANDLER = `/// <implements>entro/use-case/sales.void-voucher</implements>\n`
  + '/// <enforces>entro/invariant/voucher.never-refunded</enforces>\n'
  + 'public sealed class VoidVoucherCommandHandler;\n';
const VOID_COMMAND = `/// <implements>entro/use-case/sales.void-voucher</implements>\npublic sealed record VoidVoucherCommand;\n`;

build();

console.log('Baseline');
report('every specification identifier and code identifier is in sync', null, run());
report('a second run reports the same clean result', null, run());

console.log('\nSpecification with no code (standards/rule/core-system.documentation-and-code-change-together)');
fileCase(
  'a use-case page that no code element implements',
  VOID_PAGE,
  pageText(['use-case/sales.void-voucher']),
  'spec identifier with no code element: use-case/sales.void-voucher',
);

console.log('\nCode with no specification (standards/rule/core-system.documentation-and-code-change-together)');
fileCase(
  'a command implementing a use case no page declares',
  `${APPLICATION}/VoidVoucherCommand.cs`,
  VOID_COMMAND,
  'code identifier with no specification: use-case/sales.void-voucher',
);

console.log('\nClosed-set value (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)');
fileCase(
  'a value case deriving a closed-set base with no value identifier',
  `${DOMAIN}/VoucherChannel.cs`,
  'public sealed record Online : VoucherChannel;\npublic abstract record VoucherChannel;\n',
  'closed-set value with no identifier:',
);

console.log('\nInvariant and path coverage');
withFiles(
  [
    [VOID_PAGE, pageText(['use-case/sales.void-voucher', 'invariant/voucher.never-refunded'])],
    [`${APPLICATION}/VoidVoucherCommandHandler.cs`, VOID_HANDLER],
  ],
  'an invariant enforced by a use case no test covers',
  'invariant without a test: invariant/voucher.never-refunded',
);
withFiles(
  [
    [VOID_PAGE, pageText(['use-case/sales.void-voucher', 'path/sales.void-voucher.success'])],
    [`${APPLICATION}/VoidVoucherCommand.cs`, VOID_COMMAND],
  ],
  'a path on a use case no test covers',
  'path without a test: path/sales.void-voucher.success',
);

console.log('\nFeature markings');
fileCase(
  'a feature scenario with no implementation tag',
  `${FEATURES}/VoidVoucher.feature`,
  'Feature: Voiding a voucher\n\n  Scenario: Voids a voucher\n    Given a voucher exists\n',
  'feature scenario with no implementation tag:',
);
fileCase(
  'a feature tag that names no known kind',
  `${FEATURES}/VoidVoucher.feature`,
  'Feature: Voiding a voucher\n\n'
  + '  @implements_entro_nonsense_foo\n'
  + `  ${FEATURE_TAG}\n`
  + '  Scenario: Voids a voucher\n    Given a voucher exists\n',
  'malformed implementation tag:',
);

console.log('\nFrontend evidence (standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion)');
{
  const uiPage = `# UI evidence\n\nThe page cites \`${UI_CRITERION}\`.\n`;
  const specFile = `import { test, expect } from '@playwright/test';\n\n`
    + `test("[${UI_CRITERION}] renders every region its contract names", async ({ page }) => {\n`
    + '  expect(page).toBeTruthy();\n});\n';
  withFiles(
    [
      [UI_PAGE, uiPage],
      [`${FRONTEND_EVIDENCE}/${UI_CRITERION.slice('acceptance-criterion/'.length)}.spec.ts`, specFile],
    ],
    'a UI criterion a frontend test cites resolves',
    null,
  );
}
fileCase(
  'a UI criterion no frontend test cites is still reported',
  UI_PAGE,
  `# UI evidence\n\nThe page cites \`${UI_ORPHAN}\`.\n`,
  `spec identifier with no code element: ${UI_ORPHAN}`,
);

console.log('\nPath citations (standards/rule/frontend-ui.map-every-use-case-path, standards/rule/backend-identifiers.prove-each-named-path-through-a-test)');
{
  const voidPage = [VOID_PAGE, pageText(['use-case/sales.void-voucher', 'path/sales.void-voucher.success'])];
  const voidCommand = [`${APPLICATION}/VoidVoucherCommand.cs`, VOID_COMMAND];
  withFiles(
    [voidPage, voidCommand, [`${FRONTEND_EVIDENCE}/void-voucher.spec.ts`, "test('[path/sales.void-voucher.success] voids the voucher', async () => {});\n"]],
    'a browser test title citing a path proves that path',
    null,
  );
  withFiles(
    [voidPage, voidCommand, [`${FRONTEND_EVIDENCE}/void-voucher.spec.ts`, "const route = 'path/sales.void-voucher.success';\ntest('voids the voucher', async () => {});\n"]],
    'a path outside the opening of a test title is not a citation',
    'path without a test: path/sales.void-voucher.success',
  );
  withFiles(
    [voidPage, voidCommand, [`${TESTS}/VoidVoucherTests.cs`, '/// <covers>entro/path/sales.void-voucher.success</covers>\npublic sealed class VoidVoucherTests\n{\n    [Fact]\n    public void Voids() { }\n}\n']],
    'a covers tag citing a path proves that path',
    null,
  );
}
const namedSuccess = `- [${CRITERION}] (path/sales.redeem-voucher.success) Redeeming a voucher marks it redeemed.\n`;
fileCase(
  'a covered criterion that names a path proves that path',
  CRITERIA_PAGE,
  `# Criteria\n\n${namedSuccess}`,
  null,
);
fileCase(
  'a path of a use case whose criteria name paths needs its own proof',
  CRITERIA_PAGE,
  `# Criteria\n\n${namedSuccess}\nThe use case also has 'path/sales.redeem-voucher.expired'.\n`,
  'path without a test: path/sales.redeem-voucher.expired',
);
fileCase(
  'a criterion naming a path of another use case is reported',
  CRITERIA_PAGE,
  `# Criteria\n\n- [${CRITERION}] (path/sales.void-voucher.success) Redeeming a voucher marks it redeemed.\n`,
  'criterion names a path of another use case:',
);
{
  const file = write(CRITERIA_PAGE, "# Criteria\n\nThe use case also has 'path/sales.redeem-voucher.expired'.\n");
  const result = run();
  report('a use case whose criteria name no path keeps use-case-level proof', null, result);
  reportLine('the use-case-level proof is reported', 'Use-case-level path proof: sales.redeem-voucher', result, 0);
  fs.rmSync(file);
}

console.log('\nForeign sources and generated files');
fileCase(
  'a page citing an identifier another source owns',
  'docs/domain/modules/sales/vouchers/foreign-note.md',
  '# Note\n\nAnother source owns `litepress/invariant/article.published-once-only`.\n',
  null,
);
fileCase(
  'a generated feature code-behind is not authored source',
  `${FEATURES}/RedeemVoucher.feature.cs`,
  'public sealed class RedeemVoucherFeature;\n',
  null,
);

console.log('\nDeclared exemptions (standards/rule/core-system.keep-specifications-and-use-cases-in-one-to-one-correspondence)');
fileCase(
  'a planned page with no code element',
  'docs/domain/modules/sales/vouchers/plan-voucher.md',
  '---\n{\n  "kind": "use-case",\n  "id": "use-case/sales.plan-voucher",\n  "specStatus": "approved",\n  "implementationStatus": "planned"\n}\n---\n\n# Plan voucher\n',
  null,
);
fileCase(
  'a retired identifier is not a specification finding',
  'docs/domain/identifiers-tombstones.md',
  '# Retired identifiers\n\n- `exception/retired.exception` -> none (retired)\n',
  null,
);

console.log('\nMarkable declarations (standards/rule/core-system.documentation-and-code-change-together)');
fileCase(
  'a port that ends in a markable word is not a markable element',
  `${APPLICATION}/IVoucherValidator.cs`,
  'public interface IVoucherValidator;\n',
  null,
);
fileCase(
  'a pipeline stage is not a markable element',
  'apps/api/src/Entro.Application/Pipeline/CausationScopeCommandPreHandler.cs',
  'internal sealed class CausationScopeCommandPreHandler<TCommand>\n'
  + '    : ICommandPreHandler<TCommand>\n'
  + '    where TCommand : ICommand;\n',
  null,
);
fileCase(
  'an authentication scheme handler is not a markable element',
  'apps/api/src/Entro.WebApi/Hosting/Security/ProbeAuthenticationHandler.cs',
  'internal sealed class ProbeAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>;\n',
  null,
);
fileCase(
  'an operational exception that is not a domain exception is not a markable element',
  'apps/api/src/Entro.Application/Platform/Deployment/UnknownOperationalSignalException.cs',
  'public sealed class UnknownOperationalSignalException : Exception;\n',
  null,
);
fileCase(
  'a unit test that proves nothing is not a markable element',
  `${TESTS}/ProbeValueTests.cs`,
  'public sealed class ProbeValueTests\n{\n    [Fact]\n    public void Rounds() { }\n}\n',
  null,
);
fileCase(
  'a test that cites an acceptance criterion without a tag is reported',
  `${TESTS}/ProbeCitationTests.cs`,
  'public sealed class ProbeCitationTests\n{\n'
  + `    [Trait("AcceptanceCriterion", "${CRITERION}")]\n`
  + '    [Fact]\n    public void Proves() { }\n}\n',
  'code element with no identifier tag:',
);
fileCase(
  'a command with no tag is reported',
  `${APPLICATION}/ProbeCommand.cs`,
  'public sealed record ProbeCommand;\n',
  'code element with no identifier tag:',
);
fileCase(
  'a use-case handler with no tag is reported',
  `${APPLICATION}/ProbeCommandHandler.cs`,
  'internal sealed class ProbeCommandHandler : ICommandHandler<ProbeCommand>;\n',
  'code element with no identifier tag:',
);
fileCase(
  'a read-model record that ends in Event is not a domain event',
  'apps/api/src/Entro.Application/Operations/ProcessorEvents/AppliedProcessorEvent.cs',
  'public sealed record AppliedProcessorEvent;\n',
  null,
);
fileCase(
  'a test that only asserts a failure code is not a markable element',
  `${TESTS}/ProbeFailureTests.cs`,
  'public sealed class ProbeFailureTests\n{\n'
  + '    [Fact]\n    public void Refuses() { }\n'
  + '    private const string Code = "failure/sales.not_found";\n}\n',
  null,
);
fileCase(
  'a domain event with no tag is reported',
  `${DOMAIN}/Events/ProbeEvent.cs`,
  'public sealed record ProbeEvent : IDomainEvent;\n',
  'code element with no identifier tag:',
);
fileCase(
  'a domain exception with no tag is reported',
  `${DOMAIN}/Exceptions/UntaggedVoucherException.cs`,
  'public sealed class UntaggedVoucherException : DomainException;\n',
  'code element with no identifier tag:',
);
fileCase(
  'an endpoint with no tag is reported',
  'apps/api/src/Entro.WebApi/Sales/Vouchers/ProbeVoucherEndpoint.cs',
  'internal sealed class ProbeVoucherEndpoint : IEndpoint;\n',
  'code element with no identifier tag:',
);
fileCase(
  'an endpoint excluded from the published document is not a markable element',
  'apps/api/src/Entro.WebApi/Platform/Deployment/ProbeDevelopmentEndpoint.cs',
  'internal sealed class ProbeDevelopmentEndpoint : IEndpoint\n{\n'
  + '    public void MapEndpoint(IEndpointRouteBuilder endpoints) => endpoints\n'
  + '        .MapPost("/api/development/probe", () => { })\n'
  + '        .ExcludeFromDescription();\n}\n',
  null,
);
fileCase(
  'an endpoint without the exclusion marker is still reported',
  'apps/api/src/Entro.WebApi/Platform/Deployment/ProbePublishedEndpoint.cs',
  'internal sealed class ProbePublishedEndpoint : IEndpoint;\n',
  'code element with no identifier tag:',
);

console.log('\nConsumer configuration');
{
  const project = baseProject();
  delete project.specSync;
  writeJson(projectFile, project);
  report('the built-in roots cover the fixture layout', null, run());
  writeJson(projectFile, baseProject());
}

fileCase(
  "'--report' lists a finding and exits 0",
  VOID_PAGE,
  pageText(['use-case/sales.void-voucher']),
  'spec identifier with no code element: use-case/sales.void-voucher',
  { args: ['--report'], status: 0 },
);

reportLine('an unknown option is a usage error', 'Unknown option --strict', run('--strict'), 2);
reportLine('--help states the synopsis and exits 0', 'Usage: node standards/tools/validate-spec-sync.mjs', run('--help'), 0);
reportLine('--format=json writes one machine-readable object', '"tool": "validate-spec-sync"', run('--format=json'), 0);

{
  const saved = fs.readFileSync(projectFile);
  fs.rmSync(projectFile);
  reportLine('a directory with no consumer configuration is a usage error', 'No standards.project.json', run(), 2);
  fs.writeFileSync(projectFile, saved);
}

fs.rmSync(fixture, { recursive: true, force: true });
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);