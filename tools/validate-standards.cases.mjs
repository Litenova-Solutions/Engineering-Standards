#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { STABLE_DIAGNOSTIC_CODES, validateRepository } from './validate-standards.mjs';
import { buildProvisionIndex, INDEX_PATH } from './provisions.mjs';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'validate-standards.mjs');
const failures = [];
let executed = 0;
const coveredDiagnostics = new Set();

const topicPage = `# Topic Standard

## Intent

This page defines one repository topic.

## Agent Summary {#agent-summary}

- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)

## Standards

### Keep the topic bounded (CORE.TOPIC.BOUNDARY.001)

**Requirement:** Consumers MUST keep the topic inside its declared boundary.

**Rationale:** The boundary gives reviewers one testable result.

## Conventions

### Use the default location (CORE.TOPIC.CONVENTION.001)

**Default:** Store the topic in its owning documentation area.

**Replacement:** A consumer can name another location through an explicit local convention.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CORE.TOPIC.BOUNDARY.001 | inspection | Inspect the declared topic boundary. |
| CORE.TOPIC.CONVENTION.001 | static | \`node tools/validate-standards.mjs\` resolves the topic document location. |
`;

const extension = `# Sample Extension

## Intent

This extension adds one optional capability.

## Activation

Activation scope: \`local\`.

Applicable specification kinds: \`use-case\`.

Enable this extension when the sample capability is required.

## Baseline relationship

This extension replaces no baseline provision.

## Agent Summary {#agent-summary}

- Record extension activation. (EXT.SAMPLE.ADOPT.001)

## Standards

### Record extension activation (EXT.SAMPLE.ADOPT.001)

**Requirement:** Consumers MUST record activation on each applicable specification.

## Conventions

None.

## Dependencies

None.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.SAMPLE.ADOPT.001 | static | \`node tools/validate-consumer.mjs\` resolves applicable specification metadata. |
`;

const profile = `# Sample Profile

## Intent

This profile selects one standards composition.

## Agent Summary {#agent-summary}

- Apply the complete profile. (PROFILE.SAMPLE.COMPOSITION.001)

## Standards

### Apply the complete profile (PROFILE.SAMPLE.COMPOSITION.001)

**Requirement:** Consumers MUST apply every document in the selected profile composition.

## Composition

- [Topic standard](../core/topic.md)

## Conventions

None.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| PROFILE.SAMPLE.COMPOSITION.001 | static | \`node tools/validate-standards.mjs\` compares the profile with its manifest entry. |
`;

const guide = `# Sample Guide

## Purpose

Create one verified standards artifact.

## Prerequisites

- Read the applicable canonical provision.

## Procedure

1. Create the artifact in its owning directory.
2. Run the applicable repository validator.

## Verification

- Confirm that the validator exits with code zero.
`;

function write(root, relative, contents) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, 'utf8');
}

function base(root) {
  write(root, 'docs/core/topic.md', topicPage);
  write(root, 'docs/ext/sample.md', extension);
  write(root, 'docs/profile/sample.md', profile);
  write(root, 'docs/guide/sample.md', guide);
  write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nUse this page to find repository documentation.\n');
  write(root, 'docs/reference/glossary.md', '# Glossary\n\n## Topic\n\nA bounded standards subject.\n');
  // The provision index is derived, so the fixture repository carries a current one.
  write(root, INDEX_PATH, `${buildProvisionIndex(root)}\n`);
}

function run(name, mutate, expected, forbidden = []) {
  executed += 1;
  for (const code of expected) coveredDiagnostics.add(code);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'standards-authoring-'));
  try {
    base(root);
    mutate?.(root);
    const result = validateRepository(root);
    const codes = new Set(result.diagnostics.map((item) => item.code));
    for (const code of expected) if (!codes.has(code)) failures.push(`${name}: expected ${code}, got ${[...codes].join(', ') || 'no errors'}`);
    for (const code of forbidden) if (codes.has(code)) failures.push(`${name}: did not expect ${code}`);
    if (!expected.length && result.diagnostics.length) failures.push(`${name}: expected pass, got ${result.diagnostics.map((item) => item.code).join(', ')}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

run('all page classes pass', null, []);
run('stale provision index', (root) => write(root, INDEX_PATH, '# Provision Index\n\n## Intent\n\nThis page is out of date.\n'), ['PROVISIONS_STALE']);
run('missing provision index', (root) => fs.rmSync(path.join(root, INDEX_PATH)), ['PROVISIONS_STALE']);
run('declared prose exclusions pass', (root) => write(root, 'templates/consumer/exclusions.md', `# Exclusion Fixture

\`\`\`json
{"metadata":"This obvious and/or non-ASCII value - — - is excluded because metadata and fenced code are not prose."}
\`\`\`

Read the [source](https://example.com/an-obvious/and/or/very/long/link/destination).

The identifier \`one.extremely-long.dotted-path-like-token/with-many-segments\` counts as one word.
`), []);
run('duplicate ID', (root) => write(root, 'docs/core/duplicate.md', topicPage.replace('# Topic Standard', '# Duplicate Standard')), ['ID_DUPLICATE']);
run('missing requirement', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Requirement:** Consumers MUST keep the topic inside its declared boundary.\n\n', '')), ['STANDARD_MISSING_REQUIREMENT']);
run('multiple modals', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Consumers MUST keep the topic inside its declared boundary.', 'Consumers MUST write the topic and MUST review the topic.')), ['STANDARD_MODAL_COUNT']);
run('missing deviation', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Consumers MUST keep', 'Consumers SHOULD keep')), ['STANDARD_MISSING_DEVIATION']);
run('missing convention default', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Default:** Store the topic in its owning documentation area.\n\n', '')), ['CONVENTION_MISSING_DEFAULT']);
run('normative convention', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Store the topic in its owning documentation area.', 'Consumers MUST store the topic in its owning documentation area.')), ['CONVENTION_NORMATIVE']);
run('summary without ID', (root) => write(root, 'docs/core/topic.md', topicPage.replace('- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)', '- Keep the topic bounded.')), ['SUMMARY_MISSING_ID']);
run('missing evidence row', (root) => write(root, 'docs/core/topic.md', topicPage.replace('| CORE.TOPIC.BOUNDARY.001 | inspection | Inspect the declared topic boundary. |\n', '')), ['VERIFY_MISSING_ID']);
run('long sentence', (root) => write(root, 'docs/core/topic.md', topicPage.replace('This page defines one repository topic.', 'This sentence contains more than twenty five visible words because the fixture must prove that descriptive prose cannot exceed the fixed controlled technical prose sentence limit in active documentation.')), ['PROSE_SENTENCE_LENGTH']);
run('long list item', (root) => write(root, 'docs/guide/sample.md', guide.replace('- Read the applicable canonical provision.', '- Read the applicable canonical provision and every related document before you create any artifact or run any verification command for this repository task.')), ['PROSE_LIST_LENGTH']);
run('non-ASCII prose', (root) => write(root, 'docs/core/topic.md', topicPage.replace('one repository topic', 'one repository topic - with an em dash -').replace('- with an em dash -', '\u2014 with an em dash')), ['PROSE_NON_ASCII']);
run('vague term', (root) => write(root, 'docs/core/topic.md', topicPage.replace('one repository topic', 'one obvious repository topic')), ['PROSE_VAGUE_TERM']);
run('section order', (root) => write(root, 'docs/core/topic.md', topicPage.replace('## Standards', '## TEMP').replace('## Conventions', '## Standards').replace('## TEMP', '## Conventions')), ['PAGE_SECTION_ORDER']);
run('broken link', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nRead the [missing page](missing.md).\n'), ['LINK_BROKEN']);
run('invalid schema consumer', (root) => {
  write(root, 'schemas/standards-manifest.schema.json', JSON.stringify({ type: 'object', required: ['version'], properties: { version: { const: '1.0.0' } }, additionalProperties: false }));
  write(root, 'standards.manifest.json', JSON.stringify({ version: '2.0.0' }));
}, ['SCHEMA_INVALID']);
run('unsupported schema keyword', (root) => {
  write(root, 'schemas/standards-manifest.schema.json', JSON.stringify({ type: 'object', format: 'custom' }));
  write(root, 'standards.manifest.json', '{}');
}, ['SCHEMA_UNSUPPORTED_KEYWORD']);

run('missing H1', (root) => write(root, 'docs/core/topic.md', topicPage.replace('# Topic Standard\n\n', '')), ['PAGE_TITLE_COUNT']);
run('H1 case', (root) => write(root, 'docs/core/topic.md', topicPage.replace('# Topic Standard', '# Topic standard')), ['PAGE_TITLE_CASE']);
run('missing section', (root) => write(root, 'docs/core/topic.md', topicPage.replace('## Intent\n\n', '')), ['PAGE_MISSING_SECTION']);
run('empty section', (root) => write(root, 'docs/core/topic.md', topicPage.replace('This page defines one repository topic.\n\n', '')), ['PAGE_EMPTY_SECTION']);
run('unknown section', (root) => write(root, 'docs/core/topic.md', topicPage.replace('## Standards', '## Notes\n\nOne informative note.\n\n## Standards')), ['PAGE_UNKNOWN_SECTION']);
run('reference example declaration', (root) => write(root, 'docs/core/topic.md', topicPage.replace('## Verification', '## Reference example\n\nA topic example has no declared provision.\n\n## Verification')), ['REFERENCE_EXAMPLE_DECLARATION']);
run('index without Intent', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Overview\n\nUse this page to find repository documentation.\n'), ['INDEX_INTENT']);
run('glossary order', (root) => write(root, 'docs/reference/glossary.md', '# Glossary\n\n## Zeta\n\nThe last sample term.\n\n## Alpha\n\nThe first sample term.\n'), ['GLOSSARY_ORDER']);
run('glossary definition', (root) => write(root, 'docs/reference/glossary.md', '# Glossary\n\n## Topic\n\nA bounded standards subject. It has another definition sentence.\n'), ['GLOSSARY_DEFINITION']);
run('non-action heading', (root) => write(root, 'docs/core/topic.md', topicPage.replace('### Keep the topic bounded', '### Topic boundary')), ['HEADING_ACTION']);
run('uncited agent projection', (root) => write(root, 'AGENTS.md', '# Agent Context\n\nRead the standards before changing code.\n'), ['AGENT_PROJECTION_ID']);

run('missing provision ID', (root) => write(root, 'docs/core/topic.md', topicPage.replace('### Keep the topic bounded (CORE.TOPIC.BOUNDARY.001)', '### Keep the topic bounded')), ['ID_MISSING']);
run('misplaced provision ID', (root) => write(root, 'docs/guide/sample.md', guide.replace('## Procedure', '## Procedure\n\n### Keep extra work bounded (CORE.TOPIC.EXTRA.001)\n\nRecord one informative note.')), ['ID_LOCATION']);
run('unknown active ID', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nThe page cites CORE.UNKNOWN.RULE.001.\n'), ['ID_UNKNOWN_REFERENCE']);
// A stale three-part identifier must still surface. Only grammar notation with no
// three-digit tail is exempt from the citation scan.
run('stale three-part citation', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nThe page cites TOPIC.BOUNDARY.001.\n'), ['ID_UNKNOWN_REFERENCE']);
run('grammar notation is not a citation', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nAn identifier uses AREA.PAGE.TOPIC.NNN as its grammar.\n'), []);

run('unsupported modal vocabulary', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Consumers MUST keep the topic inside its declared boundary.', 'Consumers MUST keep the topic bounded and SHALL record its owner.')), ['STANDARD_MODAL_VOCABULARY']);
run('multiple requirement sentences', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Consumers MUST keep the topic inside its declared boundary.', 'Consumers MUST keep the topic inside its boundary. Reviewers inspect the result.')), ['STANDARD_SENTENCE_COUNT']);
run('duplicate Requirement', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', '**Requirement:** Consumers MUST name the topic owner.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_REQUIREMENT_COUNT']);
run('unexpected deviation', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', '**Deviation:** No deviation applies.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_UNEXPECTED_DEVIATION']);
run('deviation sentence count', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Consumers MUST keep', 'Consumers SHOULD keep').replace('**Rationale:** The boundary gives reviewers one testable result.', '**Deviation:** A local decision permits another boundary. The decision names its owner.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_DEVIATION_SENTENCE']);
run('unlabeled example', (root) => write(root, 'docs/core/topic.md', topicPage.replace('## Conventions', '```text\nexample\n```\n\n## Conventions')), ['STANDARD_EXAMPLE_LABEL']);
run('normative rationale', (root) => write(root, 'docs/core/topic.md', topicPage.replace('The boundary gives reviewers one testable result.', 'Reviewers MUST record the boundary result.')), ['STANDARD_INFORMATIVE_NORMATIVE']);
run('duplicate label', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', '**Rationale:** The boundary gives reviewers one testable result.\n\n**Rationale:** Another explanation.')), ['STANDARD_LABEL_DUPLICATE']);
run('invalid label', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', '**Default:** Keep another default.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_LABEL_INVALID']);
run('label order', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', '**Example:** One example.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_LABEL_ORDER']);
run('unlabeled provision content', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Rationale:** The boundary gives reviewers one testable result.', 'Additional constraint.\n\n**Rationale:** The boundary gives reviewers one testable result.')), ['STANDARD_UNLABELED_CONTENT']);

run('invalid convention ID', (root) => write(root, 'docs/core/topic.md', topicPage.replaceAll('CORE.TOPIC.CONVENTION.001', 'CORE.TOPIC.DEFAULT.001')), ['CONVENTION_ID_SEGMENT']);
run('Standard reserving the CONVENTION segment', (root) => write(root, 'docs/core/topic.md', topicPage.replaceAll('CORE.TOPIC.BOUNDARY.001', 'CORE.TOPIC.CONVENTION.002')), ['STANDARD_ID_SEGMENT']);
run('missing convention replacement', (root) => write(root, 'docs/core/topic.md', topicPage.replace('**Replacement:** A consumer can name another location through an explicit local convention.\n', '')), ['CONVENTION_MISSING_REPLACEMENT']);
run('default sentence count', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Store the topic in its owning documentation area.', 'Store the topic in its owning documentation area. Record the path.')), ['CONVENTION_DEFAULT_SENTENCE']);
run('replacement sentence count', (root) => write(root, 'docs/core/topic.md', topicPage.replace('A consumer can name another location through an explicit local convention.', 'A consumer can name another location. The local convention records it.')), ['CONVENTION_REPLACEMENT_SENTENCE']);

run('summary count', (root) => {
  const bullets = Array.from({ length: 11 }, () => '- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)').join('\n');
  write(root, 'docs/core/topic.md', topicPage.replace('- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)', bullets));
}, ['SUMMARY_COUNT']);
run('summary ID position', (root) => write(root, 'docs/core/topic.md', topicPage.replace('- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)', '- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001) Extra text.')), ['SUMMARY_ID_POSITION']);
run('normative summary', (root) => write(root, 'docs/core/topic.md', topicPage.replace('- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)', '- Consumers MUST keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)')), ['SUMMARY_NORMATIVE']);
run('unknown summary ID', (root) => write(root, 'docs/core/topic.md', topicPage.replace('CORE.TOPIC.BOUNDARY.001)', 'CORE.UNKNOWN.SUMMARY.001)')), ['SUMMARY_UNKNOWN_ID']);

run('duplicate verification row', (root) => write(root, 'docs/core/topic.md', topicPage.replace('| CORE.TOPIC.CONVENTION.001 | static | `node tools/validate-standards.mjs` resolves the topic document location. |', '| CORE.TOPIC.BOUNDARY.001 | inspection | Inspect the declared topic boundary. |\n| CORE.TOPIC.CONVENTION.001 | static | `node tools/validate-standards.mjs` resolves the topic document location. |')), ['VERIFY_DUPLICATE_ID']);
run('duplicate verification method', (root) => write(root, 'docs/core/topic.md', topicPage.replace('| CORE.TOPIC.CONVENTION.001 | static |', '| CORE.TOPIC.CONVENTION.001 | static, static |')), ['VERIFY_DUPLICATE_METHOD']);
run('generic verification evidence', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Inspect the declared topic boundary.', 'Inspect evidence for the topic boundary.')), ['VERIFY_GENERIC_EVIDENCE']);
run('invalid verification method', (root) => write(root, 'docs/core/topic.md', topicPage.replace('| CORE.TOPIC.CONVENTION.001 | static |', '| CORE.TOPIC.CONVENTION.001 | manual |')), ['VERIFY_METHOD']);
run('unknown verification row', (root) => write(root, 'docs/core/topic.md', topicPage.replace('| CORE.TOPIC.CONVENTION.001 | static | `node tools/validate-standards.mjs` resolves the topic document location. |', '| CORE.TOPIC.CONVENTION.001 | static | `node tools/validate-standards.mjs` resolves the topic document location. |\n| CORE.TOPIC.UNKNOWN.001 | static | `node tools/validate-standards.mjs` asserts the unknown row. |')), ['VERIFY_UNKNOWN_ID']);

run('contraction', (root) => write(root, 'docs/core/topic.md', topicPage.replace('This page defines one repository topic.', "This page isn't a second repository topic.")), ['PROSE_CONTRACTION']);
run('and-or', (root) => write(root, 'docs/core/topic.md', topicPage.replace('one repository topic', 'one repository and/or consumer topic')), ['PROSE_AND_OR']);
run('long paragraph', (root) => write(root, 'docs/core/topic.md', topicPage.replace('This page defines one repository topic.', 'One sentence. Two sentences. Three sentences. Four sentences. Five sentences. Six sentences. Seven sentences.')), ['PROSE_PARAGRAPH_LENGTH']);
run('long table cell', (root) => write(root, 'docs/core/topic.md', topicPage.replace('Inspect the declared topic boundary.', 'The repository report records the declared topic boundary with its owner, scope, source, review date, status, evidence, command, path, and result.')), ['PROSE_TABLE_CELL_LENGTH']);
run('normative guide prose', (root) => write(root, 'docs/guide/sample.md', guide.replace('Create one verified standards artifact.', 'Consumers MUST create one verified standards artifact.')), ['PROSE_NORMATIVE_LOCATION']);

run('broken anchor', (root) => write(root, 'docs/README.md', '# Documentation\n\n## Intent\n\nRead the [missing anchor](core/topic.md#missing).\n'), ['ANCHOR_BROKEN']);
run('manifest JSON', (root) => write(root, 'standards.manifest.json', '{'), ['MANIFEST_JSON']);
run('manifest path', (root) => write(root, 'standards.manifest.json', JSON.stringify({ agentsEntry: 'missing.md' })), ['MANIFEST_PATH']);
run('manifest anchor', (root) => write(root, 'standards.manifest.json', JSON.stringify({ agentsEntry: 'docs/core/topic.md#missing' })), ['MANIFEST_ANCHOR']);
run('manifest duplicate path', (root) => write(root, 'standards.manifest.json', JSON.stringify({ profiles: { sample: { entry: 'docs/profile/sample.md', pages: ['docs/core/topic.md', 'docs/core/topic.md'] } } })), ['MANIFEST_DUPLICATE_PATH']);
run('profile composition missing', (root) => write(root, 'standards.manifest.json', JSON.stringify({ profiles: { sample: { entry: 'docs/profile/sample.md', pages: ['docs/core/topic.md', 'docs/core/other.md'] } } })), ['PROFILE_COMPOSITION_MISSING']);
run('profile composition extra', (root) => write(root, 'standards.manifest.json', JSON.stringify({ profiles: { sample: { entry: 'docs/profile/sample.md', pages: [] } } })), ['PROFILE_COMPOSITION_EXTRA']);

run('extension scope mismatch', (root) => write(root, 'standards.manifest.json', JSON.stringify({ extensions: { sample: { path: 'docs/ext/sample.md', activationScope: 'project' } } })), ['EXTENSION_SCOPE']);
run('extension kind mismatch', (root) => write(root, 'standards.manifest.json', JSON.stringify({ extensions: { sample: { path: 'docs/ext/sample.md', activationScope: 'local', applicableKinds: ['workflow'] } } })), ['EXTENSION_KIND']);
run('missing extension activation', (root) => {
  write(root, 'docs/ext/sample.md', extension.replace('\nEnable this extension when the sample capability is required.\n', '\n'));
  write(root, 'standards.manifest.json', JSON.stringify({ extensions: { sample: { path: 'docs/ext/sample.md', activationScope: 'local', applicableKinds: ['use-case'] } } }));
}, ['EXTENSION_ACTIVATION']);
run('empty baseline relationship', (root) => {
  write(root, 'docs/ext/sample.md', extension.replace('This extension replaces no baseline provision.\n', ''));
  write(root, 'standards.manifest.json', JSON.stringify({ extensions: { sample: { path: 'docs/ext/sample.md', activationScope: 'local', applicableKinds: ['use-case'] } } }));
}, ['EXTENSION_BASELINE']);
run('empty extension dependencies', (root) => {
  write(root, 'docs/ext/sample.md', extension.replace('## Dependencies\n\nNone.', '## Dependencies\n'));
  write(root, 'standards.manifest.json', JSON.stringify({ extensions: { sample: { path: 'docs/ext/sample.md', activationScope: 'local', applicableKinds: ['use-case'] } } }));
}, ['EXTENSION_DEPENDENCIES']);
run('missing writing load plan', (root) => write(root, 'standards.manifest.json', '{}'), ['MANIFEST_LOAD_PLAN']);

run('invalid override IDs', (root) => write(root, 'templates/consumer/standards.project.json', JSON.stringify({ overrides: [{ provisionId: 'CORE.TOPIC.CONVENTION.001' }, { provisionId: 'CORE.UNKNOWN.OVERRIDE.001' }] })), ['OVERRIDE_CONVENTION_ID', 'OVERRIDE_UNKNOWN_ID']);

// oneOf is enforced rather than allowed and skipped. Without the branch check a
// value matching none of the shapes would validate cleanly.
const oneOfSchema = JSON.stringify({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    selectedExtensions: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string', pattern: '^[a-z][a-z0-9-]*$' },
          { type: 'object', additionalProperties: false, required: ['id', 'criterion', 'reviewBy'], properties: { id: { type: 'string' }, criterion: { type: 'string' }, reviewBy: { type: 'string' } } },
        ],
      },
    },
  },
});
run('value matches no oneOf branch', (root) => {
  write(root, 'schemas/standards-project.schema.json', oneOfSchema);
  write(root, 'templates/consumer/standards.project.json', JSON.stringify({ selectedExtensions: [{ id: 'outbox', criterion: 'Durable delivery.' }] }));
}, ['SCHEMA_INVALID']);
run('value matches exactly one oneOf branch', (root) => {
  write(root, 'schemas/standards-project.schema.json', oneOfSchema);
  write(root, 'templates/consumer/standards.project.json', JSON.stringify({ selectedExtensions: ['outbox', { id: 'jobs', criterion: 'Holds expire on a timer.', reviewBy: '2099-01-01' }] }));
}, [], ['SCHEMA_INVALID']);

// The index is the only map from a template to the consumer path it targets, so
// a renamed template and an unlisted template are both invisible without it.
run('template index names a missing file', (root) => {
  write(root, 'templates/consumer/sample.md', '# Sample\n');
  write(root, 'templates/consumer/README.md', '# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n| `absent.md` | `docs/absent.md` | Renamed away. |\n');
}, ['TEMPLATE_INDEX_PATH']);
run('template index omits a tracked template', (root) => {
  write(root, 'templates/consumer/sample.md', '# Sample\n');
  write(root, 'templates/consumer/unlisted.md', '# Unlisted\n');
  write(root, 'templates/consumer/README.md', '# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n');
}, ['TEMPLATE_INDEX_PATH']);
run('template index resolves every row', (root) => {
  write(root, 'templates/consumer/sample.md', '# Sample\n');
  write(root, 'templates/consumer/README.md', '# Templates\n\n## Intent\n\nUse these starting points.\n\n| Template | Target | Purpose |\n|:---|:---|:---|\n| `sample.md` | `docs/sample.md` | Present. |\n');
}, [], ['TEMPLATE_INDEX_PATH']);
run('provision restates its heading', (root) => write(root, 'docs/core/topic.md', topicPage.replace(
  '**Requirement:** Consumers MUST keep the topic inside its declared boundary.',
  '**Requirement:** Consumers MUST keep the topic bounded.',
)), ['PROVISION_RESTATES_HEADING']);
run('summary bullet repeats its provision', (root) => write(root, 'docs/core/topic.md', topicPage.replace(
  '- Keep the topic bounded. (CORE.TOPIC.BOUNDARY.001)',
  '- Keep the topic inside its declared boundary. (CORE.TOPIC.BOUNDARY.001)',
)), ['SUMMARY_RESTATES_REQUIREMENT']);
run('evidence repeats its provision heading', (root) => write(root, 'docs/core/topic.md', topicPage.replace(
  '| CORE.TOPIC.BOUNDARY.001 | inspection | Inspect the declared topic boundary. |',
  '| CORE.TOPIC.BOUNDARY.001 | inspection | Pull request review asserts `keep the topic bounded` in the owning specification. |',
)), ['VERIFY_TEMPLATED_EVIDENCE']);
run('static evidence names no artifact', (root) => write(root, 'docs/core/topic.md', topicPage.replace(
  '| CORE.TOPIC.CONVENTION.001 | static | `node tools/validate-standards.mjs` resolves the topic document location. |',
  '| CORE.TOPIC.CONVENTION.001 | static | The reviewer resolves the topic document location. |',
)), ['VERIFY_NO_ARTIFACT']);
const fixtureTopics = ['ADOPT', 'BOUNDARY', 'COMPOSITION', 'CONVENTION'];
const fixtureAreas = ['CORE', 'EXT', 'PROFILE'];

function registryManifest(areas = fixtureAreas, topics = fixtureTopics) {
  return JSON.stringify({ provisionRegistry: { areas, topics } });
}

run('provision outside the scope its path derives', (root) => {
  write(root, 'docs/core/topic.md', topicPage.replaceAll('CORE.TOPIC.', 'CORE.OTHER.'));
  write(root, 'standards.manifest.json', registryManifest());
}, ['ID_SCOPE_MISMATCH']);
run('provisions under an unregistered area directory', (root) => {
  write(root, 'docs/other/topic.md', topicPage.replaceAll('CORE.TOPIC.', 'OTHER.TOPIC.'));
  write(root, 'standards.manifest.json', registryManifest());
}, ['ID_AREA_UNKNOWN']);
run('page file name that is not one lowercase word', (root) => {
  write(root, 'docs/core/two-words.md', topicPage.replaceAll('CORE.TOPIC.', 'CORE.TWOWORDS.'));
  write(root, 'standards.manifest.json', registryManifest());
}, ['ID_PAGE_FILENAME']);
run('registered topic that no provision uses', (root) => {
  write(root, 'standards.manifest.json', registryManifest(undefined, [...fixtureTopics, 'UNUSED']));
}, ['ID_TOPIC_UNUSED']);
run('topic outside the registered vocabulary', (root) => {
  write(root, 'standards.manifest.json', registryManifest(undefined, ['ADOPT', 'COMPOSITION', 'CONVENTION']));
}, ['ID_TOPIC_UNKNOWN']);
run('topic that repeats its page name', (root) => {
  write(root, 'docs/core/topic.md', topicPage.replaceAll('CORE.TOPIC.BOUNDARY.', 'CORE.TOPIC.TOPIC.'));
  write(root, 'standards.manifest.json', registryManifest(undefined, [...fixtureTopics, 'TOPIC']));
}, ['ID_TOPIC_REPEATS_PAGE']);
run('one concept registered in two forms', (root) => {
  write(root, 'standards.manifest.json', registryManifest(undefined, [...fixtureTopics, 'BOUNDARYS']));
}, ['ID_TOPIC_DUPLICATE']);
run('heading with no body', (root) => write(root, 'docs/core/topic.md', topicPage.replace(
  '## Standards',
  ['## Concepts', '', '### Empty concept', '', '### Second concept', '', 'This concept has a body.', '', '## Standards'].join('\n'),
)), ['HEADING_EMPTY_BODY']);
run('numbered procedure inside an index', (root) => write(root, 'docs/README.md',
  ['# Documentation', '', '## Intent', '', 'Use this page to find repository documentation.', '', '## Activation', '', '1. Select the applicable document.', ''].join('\n'),
), ['INDEX_CONTAINS_PROCEDURE']);
run('schema JSON', (root) => {
  write(root, 'schemas/standards-manifest.schema.json', '{');
  write(root, 'standards.manifest.json', '{}');
}, ['SCHEMA_JSON']);

const usage = spawnSync(process.execPath, [script, 'one', 'two'], { encoding: 'utf8' });
executed += 1;
if (usage.status !== 2) failures.push(`usage exit code: expected 2, got ${usage.status}`);

for (const code of STABLE_DIAGNOSTIC_CODES) {
  if (!coveredDiagnostics.has(code)) failures.push(`diagnostic coverage: no failing fixture expects ${code}`);
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  console.error(`Standards validator cases failed: ${failures.length} failure(s) across ${executed} cases.`);
  process.exit(1);
}

console.log(`Standards validator cases passed: ${executed} cases.`);
