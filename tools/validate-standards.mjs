#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildProvisionIndex, headingSlug, INDEX_PATH } from './provisions.mjs';
import {
  AND_OR,
  CONTRACTIONS,
  VAGUE_TERMS,
  checkProseMeasures,
  sentences,
  stripFences,
  visibleText,
  words,
} from './prose.mjs';

// Every provision identifier is AREA.PAGE.TOPIC.NNN. AREA and PAGE come from the
// manifest id registry, TOPIC names the assertion, and NNN is a three-digit sequence.
const PROVISION_ID_SOURCE = '[A-Z][A-Z0-9]*\\.[A-Z][A-Z0-9]*\\.[A-Z][A-Z0-9]*\\.\\d{3}';
const PROVISION_ID = new RegExp(`^${PROVISION_ID_SOURCE}$`);
const PROVISION_HEADING = new RegExp(`^###\\s+(.+?)\\s+\\((${PROVISION_ID_SOURCE})\\)\\s*$`);
// A looser shape still catches a stale identifier so it reports as an unknown reference
// instead of passing unnoticed.
const CITATION_SOURCE = '[A-Z][A-Z0-9]*(?:\\.[A-Z0-9]+){1,}\\.\\d{3}';
const METHODS = new Set(['static', 'test', 'inspection', 'operation']);
const MODALS = /\b(?:MUST NOT|SHOULD NOT|MUST|SHOULD|MAY)\b/g;
const OTHER_NORMATIVE = /\b(?:REQUIRED|FORBIDDEN|SHALL)\b/;
const PROVISION_LABEL = /^\*\*(Requirement|Deviation|Rationale|Example|Default|Replacement):\*\*/;
const GENERIC_EVIDENCE = /\b(?:verify compliance|check compliance|inspect evidence|verify evidence)\b/i;
const ACTION_VERBS = new Set(`Accept Activate Add Advance Align Anchor Announce Apply Approve Assert Assign Attach Audit Authenticate Authorize Avoid Await Back Bind Bound Build Call Canonicalize Centralize Check Cite Classify Co-locate Collect Commit Compare Complete Compose Configure Connect Control Copy Cover Create Declare Default Defer Define Delay Deliver Deploy Deprecate Derive Diff Discard Dispatch Distinguish Document Drive Emit Enforce Escalate Escape Evolve Exclude Exercise Expose Express Finish Follow Format Gate Generate Give Govern Group Handle Hide Identify Implement Inject Inspect Isolate Keep Lease Limit List Load Localize Locate Make Map Mark Match Measure Meet Minimize Mirror Model Move Name Note Operate Organize Own Parameterize Parse Pass Persist Pin Place Plan Point Prefer Preserve Prevent Process Project Promote Protect Prove Provide Publish Purge Query Raise Read Reconnect Record Recover Reference Reflect Regenerate Register Reject Reload Release Remove Render Replay Replace Report Represent Require Renew Requeue Resolve Restrict Retain Retire Retry Return Revalidate Review Rotate Route Run Scan Scope Select Separate Serialize Set Signal Simulate Specify Split Stage Start State Stop Store Subscribe Supply Support Tag Test Tolerate Trace Track Translate Treat Update Use Validate Verify Version Wait Write`.split(' '));
// Every authoring rule is an error. This set stays empty unless a new rule is
// landed against existing content, in which case it holds that rule only while
// its count is burned down.
export const WARNING_DIAGNOSTIC_CODES = Object.freeze([]);

// A claim is the comparable core of a heading, a Requirement, a Default, or a
// summary bullet: lowercase words with punctuation, code marks, and any leading
// actor and normative modal removed.
function claim(text) {
  const words = String(text)
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return words.replace(/^.*?\b(must not|must|should not|should|may)\b\s*/, '').trim();
}

export const STABLE_DIAGNOSTIC_CODES = Object.freeze([
  'AGENT_PROJECTION_ID',
  'ANCHOR_BROKEN',
  'CONVENTION_DEFAULT_SENTENCE',
  'CONVENTION_ID_SEGMENT',
  'CONVENTION_MISSING_DEFAULT',
  'CONVENTION_MISSING_REPLACEMENT',
  'CONVENTION_NORMATIVE',
  'CONVENTION_REPLACEMENT_SENTENCE',
  'EXTENSION_ACTIVATION',
  'EXTENSION_BASELINE',
  'EXTENSION_DEPENDENCIES',
  'EXTENSION_KIND',
  'EXTENSION_SCOPE',
  'GLOSSARY_DEFINITION',
  'GLOSSARY_ORDER',
  'HEADING_ACTION',
  'HEADING_EMPTY_BODY',
  'ID_AREA_UNKNOWN',
  'ID_DUPLICATE',
  'ID_LOCATION',
  'ID_MISSING',
  'ID_PAGE_FILENAME',
  'ID_SCOPE_MISMATCH',
  'ID_TOPIC_DUPLICATE',
  'ID_TOPIC_REPEATS_PAGE',
  'ID_TOPIC_UNKNOWN',
  'ID_TOPIC_UNUSED',
  'ID_UNKNOWN_REFERENCE',
  'INDEX_CONTAINS_PROCEDURE',
  'INDEX_INTENT',
  'LINK_BROKEN',
  'MANIFEST_ANCHOR',
  'MANIFEST_DUPLICATE_PATH',
  'MANIFEST_JSON',
  'MANIFEST_LOAD_PLAN',
  'MANIFEST_PATH',
  'OVERRIDE_CONVENTION_ID',
  'OVERRIDE_UNKNOWN_ID',
  'PAGE_EMPTY_SECTION',
  'PAGE_MISSING_SECTION',
  'PAGE_SECTION_ORDER',
  'PAGE_TITLE_CASE',
  'PAGE_TITLE_COUNT',
  'PAGE_UNKNOWN_SECTION',
  'PROFILE_COMPOSITION_EXTRA',
  'PROFILE_COMPOSITION_MISSING',
  'PROSE_AND_OR',
  'PROSE_CONTRACTION',
  'PROSE_LIST_LENGTH',
  'PROSE_NON_ASCII',
  'PROSE_NORMATIVE_LOCATION',
  'PROSE_PARAGRAPH_LENGTH',
  'PROSE_SENTENCE_LENGTH',
  'PROSE_TABLE_CELL_LENGTH',
  'PROSE_VAGUE_TERM',
  'PROVISIONS_STALE',
  'PROVISION_RESTATES_HEADING',
  'REFERENCE_EXAMPLE_DECLARATION',
  'SCHEMA_INVALID',
  'SCHEMA_JSON',
  'SCHEMA_UNSUPPORTED_KEYWORD',
  'STANDARD_DEVIATION_SENTENCE',
  'STANDARD_EXAMPLE_LABEL',
  'STANDARD_ID_SEGMENT',
  'STANDARD_INFORMATIVE_NORMATIVE',
  'STANDARD_LABEL_DUPLICATE',
  'STANDARD_LABEL_INVALID',
  'STANDARD_LABEL_ORDER',
  'STANDARD_MISSING_DEVIATION',
  'STANDARD_MISSING_REQUIREMENT',
  'STANDARD_MODAL_COUNT',
  'STANDARD_MODAL_VOCABULARY',
  'STANDARD_REQUIREMENT_COUNT',
  'STANDARD_SENTENCE_COUNT',
  'STANDARD_UNEXPECTED_DEVIATION',
  'STANDARD_UNLABELED_CONTENT',
  'SUMMARY_COUNT',
  'SUMMARY_ID_POSITION',
  'SUMMARY_MISSING_ID',
  'SUMMARY_NORMATIVE',
  'SUMMARY_RESTATES_REQUIREMENT',
  'SUMMARY_UNKNOWN_ID',
  'VERIFY_DUPLICATE_ID',
  'VERIFY_DUPLICATE_METHOD',
  'VERIFY_GENERIC_EVIDENCE',
  'VERIFY_METHOD',
  'VERIFY_MISSING_ID',
  'VERIFY_NO_ARTIFACT',
  'VERIFY_TEMPLATED_EVIDENCE',
  'VERIFY_UNKNOWN_ID',

  'TEMPLATE_INDEX_PATH',

  'INDEX_MISSING_ROUTING',
]);
// The keyword set and the evaluator below are one unit. A keyword listed here
// without an implementation would be read as an annotation and assert nothing,
// so every assertive name in this set has a branch in `validateSchemaValue`, and
// every name outside it fails the schema rather than passing unread. That is why
// the repository ships no schema library: the gate is what makes a local
// evaluator safe, and a library that accepts every keyword removes it.
const SCHEMA_ANNOTATIONS = new Set(['$schema', '$id', '$defs', '$comment', 'title', 'description', 'default', 'examples', 'deprecated']);
const SCHEMA_KEYWORDS = new Set([
  ...SCHEMA_ANNOTATIONS,
  '$ref', 'type', 'const', 'enum', 'pattern', 'minLength', 'maxLength',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'minItems', 'maxItems', 'uniqueItems', 'items', 'prefixItems', 'contains',
  'minProperties', 'maxProperties', 'required', 'dependentRequired',
  'properties', 'patternProperties', 'propertyNames', 'additionalProperties',
  'allOf', 'anyOf', 'oneOf', 'if', 'then', 'else', 'not',
]);

// Every position a subschema can occupy, so the gate reaches each one. A keyword
// the gate never descends into hides its whole subtree from the check.
const SCHEMA_CHILD_LISTS = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];
const SCHEMA_CHILD_MAPS = ['properties', 'patternProperties', '$defs'];
const SCHEMA_CHILD_VALUES = ['items', 'contains', 'propertyNames', 'additionalProperties', 'if', 'then', 'else', 'not'];

// Naming the codepoint tells an author which character to hunt for. Naming the
// ASCII form tells them what to type instead, which is the action the rule
// actually asks for. These are the characters an editor substitution or a paste
// from a word processor introduces; anything else reports its codepoint alone.
// The keys are codepoints rather than characters, because this file is itself
// under the ASCII rule.
const ASCII_REPLACEMENTS = new Map([
  ['00A0', 'a plain space'],
  ['00B7', 'a hyphen'],
  ['00D7', 'the letter x'],
  ['2013', 'a hyphen'],
  ['2014', 'a hyphen'],
  ['2018', 'a straight apostrophe'],
  ['2019', 'a straight apostrophe'],
  ['201C', 'a straight quotation mark'],
  ['201D', 'a straight quotation mark'],
  ['2022', 'a Markdown list marker'],
  ['2026', 'three full stops'],
  ['2192', 'the word to'],
]);

function nonAsciiMessage(character, prefix) {
  const codepoint = character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  const replacement = ASCII_REPLACEMENTS.get(codepoint);
  return `${prefix}U+${codepoint}${replacement ? `; write ${replacement}` : ''}`;
}

function slash(value) {
  return value.replace(/\\/g, '/');
}

function walk(directory, predicate, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(candidate, predicate, result);
    else if (predicate(candidate)) result.push(candidate);
  }
  return result;
}

function isCurrentStandardsMaterial(relative) {
  return relative !== 'CHANGELOG.md'
    && relative !== 'LICENSE.md';
}

function lineNumber(text, offset) {
  return text.slice(0, offset).split('\n').length;
}





function titleCase(value) {
  const small = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const tokens = value.match(/[A-Za-z0-9][A-Za-z0-9./+-]*/g) ?? [];
  return tokens.every((token, index) => {
    if (/^(?:v?\d|[A-Z0-9.]+$)/.test(token) || /[a-z][A-Z]|[A-Z][a-z]+[A-Z]/.test(token) || token.includes('.')) return true;
    if (index > 0 && index < tokens.length - 1 && small.has(token.toLowerCase())) return token === token.toLowerCase();
    return /^[A-Z]/.test(token);
  });
}

function sectionBody(lines, sectionName) {
  const start = lines.findIndex((line) => line.replace(/\s+\{#[^}]+\}\s*$/, '').trim() === `## ${sectionName}`);
  if (start < 0) return '';
  let end = start + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) end += 1;
  return lines.slice(start + 1, end).join('\n').trim();
}

function checkIndexAndGlossary(relative, kind, raw, sections, add) {
  if (kind === 'index' && sections[0]?.name !== 'Intent') {
    add(relative, sections[0]?.line ?? 1, 'INDEX_INTENT', 'an index must start with an Intent H2');
  }
  if (kind !== 'glossary') return;
  const terms = sections.map((section) => section.name);
  const sorted = [...terms].sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base' }));
  if (terms.some((term, index) => term !== sorted[index])) add(relative, 1, 'GLOSSARY_ORDER', 'glossary terms are not alphabetical');
  const lines = raw.split(/\r?\n/);
  for (let index = 0; index < sections.length; index += 1) {
    const start = sections[index].line;
    const end = index + 1 < sections.length ? sections[index + 1].line - 1 : lines.length;
    const firstParagraph = [];
    for (let cursor = start; cursor < end; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim()) {
        if (firstParagraph.length) break;
        continue;
      }
      if (/^#{1,6}\s+/.test(line)) break;
      firstParagraph.push(line);
    }
    if (sentences(firstParagraph.join(' ')).length !== 1) {
      add(relative, sections[index].line, 'GLOSSARY_DEFINITION', `term '${sections[index].name}' must start with one definition sentence`);
    }
  }
}

function checkAgentProjection(relative, raw, add) {
  const lines = stripFences(raw.split(/\r?\n/));
  let paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    const text = paragraph.map((item) => item.line).join(' ');
    if (!new RegExp(`\\b${CITATION_SOURCE}\\b`).test(text)) {
      add(relative, paragraph[0].number, 'AGENT_PROJECTION_ID', 'agent projection contains no canonical provision citation');
    }
    paragraph = [];
  };
  for (const item of lines) {
    if (!item.line.trim() || /^#{1,6}\s+/.test(item.line)) {
      flush();
      continue;
    }
    if (/^\s*(?:[-*+] |\d+\.\s+)/.test(item.line)) flush();
    paragraph.push(item);
    if (/^\s*(?:[-*+] |\d+\.\s+)/.test(item.line)) flush();
  }
  flush();
}

function anchorsFor(raw) {
  const anchors = new Set();
  for (const match of raw.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const explicit = match[1].match(/\{#([^}]+)\}\s*$/);
    anchors.add(explicit?.[1] ?? headingSlug(match[1]));
  }
  return anchors;
}

// A directory names the class of every page inside it. Four of these hold pages a
// reader follows or looks up rather than pages that own provisions, and each one
// answers a question at a single layer. (CORE.AUTHORING.DISCLOSURE.002)
const PAGE_CLASS_AREA = {
  ext: 'extension',
  profile: 'profile',
  guide: 'how-to',
  tutorial: 'tutorial',
  reference: 'reference',
  tools: 'command',
};

// A standards template seeds one page class, so it is parsed as the page it
// produces and held to that page's contract.
// An authoring template is parsed as the page class it produces, so its
// placeholder identifiers are normalized into valid ones and its virtual path
// stands in for a real page path. Both live in the same namespace as real pages,
// which is what makes the parse meaningful and also what makes the stem
// reserved. A real page at one of these paths would share a scope with a
// template and report as a duplicate of a file nobody wrote.
const TEMPLATE_VIRTUAL_PATH = {
  'extension.md': 'docs/ext/template.md',
  'how-to.md': 'docs/guide/template.md',
  'tutorial.md': 'docs/tutorial/template.md',
  'command.md': 'docs/tools/template.md',
};
const RESERVED_TEMPLATE_STEMS = new Set([...Object.values(TEMPLATE_VIRTUAL_PATH), 'docs/core/template.md']);

function pageClass(relative) {
  if (relative === INDEX_PATH) return 'index';
  if (relative === 'docs/reference/glossary.md') return 'glossary';
  if (relative.endsWith('/README.md') || relative === 'README.md') return 'index';
  // A page owning no provision derives no identifier from its stem, so it carries
  // a descriptive hyphenated name. A stem pattern refusing the hyphen returned no
  // class for every such page, and a page with no class is held to no contract.
  const area = relative.match(/^docs\/([a-z][a-z0-9]*)\/[a-z][a-z0-9-]*\.md$/)?.[1];
  if (!area) return null;
  return PAGE_CLASS_AREA[area] ?? 'topic';
}

function expectedSections(kind) {
  if (kind === 'topic') {
    return { required: ['Intent', 'Agent Summary', 'Standards', 'Conventions', 'Verification'], optional: ['Concepts', 'Reference example'] };
  }
  if (kind === 'profile') {
    return { required: ['Intent', 'Agent Summary', 'Standards', 'Composition', 'Conventions', 'Verification'], optional: [] };
  }
  if (kind === 'extension') {
    return { required: ['Intent', 'Activation', 'Baseline relationship', 'Agent Summary', 'Standards', 'Conventions', 'Dependencies', 'Verification'], optional: [] };
  }
  if (kind === 'how-to') return { required: ['Purpose', 'Procedure', 'Verification'], optional: ['Prerequisites'] };
  // A tutorial closes on what the reader now has. Verification asks whether a
  // procedure worked, which is a different question asked by a different reader.
  if (kind === 'tutorial') return { required: ['Purpose', 'Prerequisites', 'Lesson', 'What you built'], optional: [] };
  if (kind === 'reference') return { required: ['Intent', 'Reference'], optional: ['Notes'] };
  // Underneath is required rather than optional, so a command page that hides its
  // mechanism fails rather than passing in silence. A command with nothing
  // separately runnable writes 'None.' (CORE.AUTHORING.DISCLOSURE.003)
  if (kind === 'command') {
    return { required: ['Name', 'Synopsis', 'Description', 'Arguments', 'Options', 'Exit codes', 'Examples', 'Underneath'], optional: [] };
  }
  return null;
}

function checkSectionOrder(relative, kind, sections, add) {
  const contract = expectedSections(kind);
  if (!contract) return;
  const names = sections.map((section) => section.name);
  for (const required of contract.required) {
    if (!names.includes(required)) add(relative, 1, 'PAGE_MISSING_SECTION', `missing required H2 '${required}'`);
  }
  const allowed = new Set([...contract.required, ...contract.optional]);
  for (const section of sections) {
    if (!allowed.has(section.name)) add(relative, section.line, 'PAGE_UNKNOWN_SECTION', `H2 '${section.name}' is not valid for ${kind} pages`);
  }
  const canonical = kind === 'topic'
    ? ['Intent', 'Agent Summary', 'Concepts', 'Standards', 'Conventions', 'Reference example', 'Verification']
    : kind === 'how-to'
      ? ['Purpose', 'Prerequisites', 'Procedure', 'Verification']
      : kind === 'reference'
        ? ['Intent', 'Reference', 'Notes']
        : contract.required;
  let previous = -1;
  for (const section of sections) {
    const position = canonical.indexOf(section.name);
    if (position < previous) {
      add(relative, section.line, 'PAGE_SECTION_ORDER', `H2 '${section.name}' is out of order`);
      break;
    }
    previous = position;
  }
}

function checkProse(relative, raw, kind, add) {
  // A recorded decision quotes external material verbatim, so the measures
  // would report the quotation rather than the authoring.
  if (/(^|\/)reference\/decisions\//.test(relative)) return;
  checkProseMeasures(relative, raw, add);
}

function parsePage(relative, raw, add, globalIds, virtual = false) {
  const kind = pageClass(relative);
  const lines = raw.split(/\r?\n/);
  const clean = stripFences(lines);
  const headings = [];
  const sections = [];
  let currentH2 = '';
  let currentH2Line = 0;
  let h1Count = 0;
  let h1Title = '';
  let h1Line = 1;
  let summaryStart = -1;
  let summaryLine = 1;
  let summaryEnd = lines.length;
  const provisions = [];
  const verificationRows = [];
  const summaryReferences = [];

  for (let index = 0; index < clean.length; index += 1) {
    const line = clean[index].line;
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    if (h1) {
      h1Count += 1;
      h1Title = h1[1];
      h1Line = index + 1;
    }
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      if (currentH2 === 'Agent Summary') summaryEnd = index;
      const name = h2[1].replace(/\s+\{#[^}]+\}\s*$/, '');
      currentH2 = name;
      currentH2Line = index + 1;
      sections.push({ name, line: index + 1 });
      if (name === 'Agent Summary') {
        summaryStart = index + 1;
        summaryLine = index + 1;
      }
      continue;
    }
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      headings.push({ text: heading[1], section: currentH2, line: index + 1 });
      const rule = line.match(PROVISION_HEADING);
      if ((currentH2 === 'Standards' || currentH2 === 'Conventions') && !rule) {
        add(relative, index + 1, 'ID_MISSING', `provision heading '${heading[1]}' has no valid ID`);
        continue;
      }
      if (!rule) continue;
      const id = rule[2];
      const firstWord = rule[1].match(/^[A-Za-z]+(?:-[A-Za-z]+)?/)?.[0];
      if (!firstWord || !ACTION_VERBS.has(firstWord)) add(relative, index + 1, 'HEADING_ACTION', `provision heading '${rule[1]}' must start with an action verb`);
      if (globalIds.has(id)) add(relative, index + 1, 'ID_DUPLICATE', `provision ID '${id}' also appears in ${globalIds.get(id)}`);
      else globalIds.set(id, `${relative}:${index + 1}`);
      if (currentH2 !== 'Standards' && currentH2 !== 'Conventions') {
        add(relative, index + 1, 'ID_LOCATION', `provision ID '${id}' is outside Standards or Conventions`);
        continue;
      }
      let cursor = index + 1;
      const body = [];
      while (cursor < clean.length && !/^#{2,3}\s+/.test(clean[cursor].line)) body.push(clean[cursor++]);
      provisions.push({ id, title: rule[1], section: currentH2, line: index + 1, body });
    }
  }

  // A heading with no body and no lower-level heading beneath it groups
  // nothing. It becomes a dead entry in any generated table of contents.
  for (let index = 0; index < clean.length; index += 1) {
    const heading = clean[index].line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (!heading) continue;
    const level = heading[1].length;
    let body = false;
    for (let cursor = index + 1; cursor < clean.length; cursor += 1) {
      const next = clean[cursor].line.match(/^(#{1,6})\s+/);
      if (next) {
        if (next[1].length <= level) break;
        body = true;
        break;
      }
      if (clean[cursor].line.trim() || clean[cursor].fenced) { body = true; break; }
    }
    if (!body) add(relative, index + 1, 'HEADING_EMPTY_BODY', `heading '${heading[2]}' has no body and no nested heading`);
  }

  // An index navigates. A numbered procedure inside one duplicates a canonical
  // provision without citing it. (CORE.AUTHORING.PAGE.001)
  if (kind === 'index') {
    const step = clean.find((item) => /^\s*\d+\.\s+\S/.test(item.line));
    if (step) add(relative, step.number, 'INDEX_CONTAINS_PROCEDURE', 'an index must not contain a numbered procedure');
  }

  if (kind && kind !== 'index' && h1Count !== 1) add(relative, 1, 'PAGE_TITLE_COUNT', `expected one H1, found ${h1Count}`);
  if (kind && kind !== 'index' && h1Count === 1 && !titleCase(h1Title)) add(relative, h1Line, 'PAGE_TITLE_CASE', `H1 '${h1Title}' must use Title Case`);
  checkSectionOrder(relative, kind, sections, add);
  checkIndexAndGlossary(relative, kind, raw, sections, add);
  const sectionContract = expectedSections(kind);
  if (sectionContract) {
    for (const section of sections) {
      if ([...sectionContract.required, ...sectionContract.optional].includes(section.name)
        && !sectionBody(lines, section.name)) add(relative, section.line, 'PAGE_EMPTY_SECTION', `H2 '${section.name}' must contain content or 'None.'`);
    }
  }
  if (kind === 'topic' && sections.some((section) => section.name === 'Reference example')) {
    const example = sectionBody(lines, 'Reference example');
    const firstLine = stripFences(example.split(/\r?\n/)).find((item) => item.line.trim())?.line.trim() ?? '';
    const ids = [...example.matchAll(new RegExp(`\\b${CITATION_SOURCE}\\b`, 'g'))];
    if (!firstLine.startsWith('This informative example demonstrates ') || !ids.length) {
      const section = sections.find((item) => item.name === 'Reference example');
      add(relative, section?.line ?? 1, 'REFERENCE_EXAMPLE_DECLARATION', 'Reference example must begin with an informative declaration and provision IDs');
    }
  }

  for (const provision of provisions) {
    const nonblank = provision.body.filter((item) => item.line.trim());
    const allowedLabels = provision.section === 'Standards'
      ? ['Requirement', 'Deviation', 'Rationale', 'Example']
      : ['Default', 'Replacement', 'Rationale', 'Example'];
    const labels = [];
    let activeLabel = '';
    let fenceReported = false;
    for (const item of provision.body) {
      const label = item.line.match(PROVISION_LABEL)?.[1];
      if (label) {
        labels.push({ name: label, line: item.number });
        activeLabel = label;
        if (!allowedLabels.includes(label)) add(relative, item.number, 'STANDARD_LABEL_INVALID', `label '${label}' is invalid in ${provision.section}`);
        if (label === 'Rationale' || label === 'Example') {
          const informative = visibleText(item.line);
          if ((informative.match(MODALS) ?? []).length || OTHER_NORMATIVE.test(informative)) {
            add(relative, item.number, 'STANDARD_INFORMATIVE_NORMATIVE', `informative content in '${provision.id}' contains normative vocabulary`);
          }
        }
        continue;
      }
      if (item.fenced) {
        if (activeLabel !== 'Example' && !fenceReported) {
          add(relative, item.number, 'STANDARD_EXAMPLE_LABEL', `fenced example in '${provision.id}' must follow an Example label`);
          fenceReported = true;
        }
        continue;
      }
      if (!item.line.trim()) continue;
      if (!activeLabel || ['Requirement', 'Deviation', 'Default', 'Replacement'].includes(activeLabel)) {
        add(relative, item.number, 'STANDARD_UNLABELED_CONTENT', `content in '${provision.id}' must follow a Rationale or Example label`);
      }
      if (activeLabel === 'Rationale' || activeLabel === 'Example') {
        const informative = visibleText(item.line);
        if ((informative.match(MODALS) ?? []).length || OTHER_NORMATIVE.test(informative)) {
          add(relative, item.number, 'STANDARD_INFORMATIVE_NORMATIVE', `informative content in '${provision.id}' contains normative vocabulary`);
        }
      }
    }
    for (const label of new Set(labels.map((item) => item.name))) {
      const count = labels.filter((item) => item.name === label).length;
      if (count > 1) add(relative, labels.find((item) => item.name === label).line, 'STANDARD_LABEL_DUPLICATE', `provision '${provision.id}' has ${count} ${label} labels`);
    }
    let previousLabel = -1;
    for (const label of labels) {
      const position = allowedLabels.indexOf(label.name);
      if (position >= 0 && position < previousLabel) {
        add(relative, label.line, 'STANDARD_LABEL_ORDER', `label '${label.name}' is out of order in '${provision.id}'`);
        break;
      }
      if (position >= 0) previousLabel = position;
    }

    if (provision.section === 'Standards') {
      // CONVENTION is the only force signal inside an identifier, so a Standard
      // cannot borrow it. (CORE.AUTHORING.IDENTIFIER.002)
      if (/\.CONVENTION\.\d+$/.test(provision.id)) add(relative, provision.line, 'STANDARD_ID_SEGMENT', `Standard '${provision.id}' reserves the CONVENTION segment for a replaceable default`);
      const requirements = nonblank.filter((item) => item.line.startsWith('**Requirement:**'));
      if (requirements.length === 0) {
        add(relative, provision.line, 'STANDARD_MISSING_REQUIREMENT', `Standard '${provision.id}' has no Requirement statement`);
        continue;
      }
      if (requirements.length > 1) add(relative, provision.line, 'STANDARD_REQUIREMENT_COUNT', `Standard '${provision.id}' has ${requirements.length} Requirement statements`);
      const requirement = requirements[0];
      const statement = requirement.line.slice('**Requirement:**'.length).trim();
      const modalCount = (visibleText(statement).match(MODALS) ?? []).length;
      if (modalCount !== 1) add(relative, requirement.number, 'STANDARD_MODAL_COUNT', `Requirement for '${provision.id}' has ${modalCount} normative modals`);
      if (OTHER_NORMATIVE.test(visibleText(statement))) add(relative, requirement.number, 'STANDARD_MODAL_VOCABULARY', `Requirement for '${provision.id}' uses an unsupported normative term`);
      if (sentences(statement).length !== 1) add(relative, requirement.number, 'STANDARD_SENTENCE_COUNT', `Requirement for '${provision.id}' must contain one sentence`);
      const should = /\bSHOULD(?: NOT)?\b/.test(visibleText(statement));
      const deviations = nonblank.filter((item) => item.line.startsWith('**Deviation:**'));
      if (should && deviations.length === 0) add(relative, provision.line, 'STANDARD_MISSING_DEVIATION', `recommendation '${provision.id}' has no Deviation statement`);
      if (!should && deviations.length) add(relative, deviations[0].number, 'STANDARD_UNEXPECTED_DEVIATION', `non-recommendation '${provision.id}' cannot contain a Deviation statement`);
      if (deviations[0] && sentences(deviations[0].line.slice('**Deviation:**'.length).trim()).length !== 1) {
        add(relative, deviations[0].number, 'STANDARD_DEVIATION_SENTENCE', `Deviation for '${provision.id}' must contain one sentence`);
      }
    } else {
      if (!/\.CONVENTION\.\d+$/.test(provision.id)) add(relative, provision.line, 'CONVENTION_ID_SEGMENT', `convention ID '${provision.id}' must use the CONVENTION topic segment`);
      const defaults = nonblank.filter((item) => item.line.startsWith('**Default:**'));
      const replacements = nonblank.filter((item) => item.line.startsWith('**Replacement:**'));
      if (!defaults.length) add(relative, provision.line, 'CONVENTION_MISSING_DEFAULT', `convention '${provision.id}' has no Default statement`);
      if (!replacements.length) add(relative, provision.line, 'CONVENTION_MISSING_REPLACEMENT', `convention '${provision.id}' has no Replacement statement`);
      if (defaults[0] && sentences(defaults[0].line.slice('**Default:**'.length).trim()).length !== 1) add(relative, defaults[0].number, 'CONVENTION_DEFAULT_SENTENCE', `Default for '${provision.id}' must contain one sentence`);
      if (replacements[0] && sentences(replacements[0].line.slice('**Replacement:**'.length).trim()).length !== 1) add(relative, replacements[0].number, 'CONVENTION_REPLACEMENT_SENTENCE', `Replacement for '${provision.id}' must contain one sentence`);
      const bodyText = nonblank.map((item) => visibleText(item.line)).join(' ');
      if ((bodyText.match(MODALS) ?? []).length || OTHER_NORMATIVE.test(bodyText)) add(relative, provision.line, 'CONVENTION_NORMATIVE', `convention '${provision.id}' contains normative vocabulary`);
    }
  }

  if (summaryStart >= 0) {
    const bullets = clean.slice(summaryStart, summaryEnd).filter((item) => /^\s*-\s+/.test(item.line));
    if (bullets.length > 10) add(relative, summaryLine, 'SUMMARY_COUNT', `Agent Summary has ${bullets.length} bullets; maximum is 10`);
    for (const bullet of bullets) {
      const text = visibleText(bullet.line);
      if ((text.match(MODALS) ?? []).length || OTHER_NORMATIVE.test(text)) add(relative, bullet.number, 'SUMMARY_NORMATIVE', 'Agent Summary contains normative vocabulary');
      const ids = [...bullet.line.matchAll(new RegExp(`\\b${CITATION_SOURCE}\\b`, 'g'))].map((match) => match[0]);
      if (!ids.length) add(relative, bullet.number, 'SUMMARY_MISSING_ID', 'Agent Summary bullet cites no provision ID');
      if (!new RegExp(`\\((${CITATION_SOURCE})(?:,\\s*${CITATION_SOURCE})*\\)\\s*$`).test(bullet.line)) {
        add(relative, bullet.number, 'SUMMARY_ID_POSITION', 'Agent Summary bullet must end with its provision citations');
      }
      const bulletClaim = claim(text.replace(/\([^)]*\)\s*$/, ''));
      for (const id of ids) summaryReferences.push({ id, line: bullet.number, claim: bulletClaim });
    }
  }

  // A provision whose Requirement or Default only repeats its own heading
  // states no obligation. The heading is a label; the assertion belongs in the
  // labeled block. (CORE.AUTHORING.REQUIREMENT.001, CORE.AUTHORING.DEFAULTS.001)
  for (const provision of provisions) {
    const label = provision.section === 'Standards' ? 'Requirement' : 'Default';
    const assertion = provision.body.find((item) => item.line.startsWith(`**${label}:**`));
    if (!assertion) continue;
    provision.claim = claim(assertion.line.replace(`**${label}:**`, ''));
    if (provision.claim && provision.claim === claim(provision.title)) {
      add(relative, provision.line, 'PROVISION_RESTATES_HEADING', `${label} for '${provision.id}' only restates its heading`);
    }
  }

  // Tier 1 exists to compress Tier 2. A bullet identical to its provision adds
  // no context and makes the escalation pointless. (CORE.AUTHORING.SUMMARY.001)
  for (const reference of summaryReferences) {
    const provision = provisions.find((item) => item.id === reference.id);
    if (provision?.claim && reference.claim && provision.claim === reference.claim) {
      add(relative, reference.line, 'SUMMARY_RESTATES_REQUIREMENT', `Agent Summary bullet for '${reference.id}' repeats its provision verbatim`);
    }
  }

  const provisionLines = new Set(provisions.flatMap((provision) => [provision.line, ...provision.body.map((item) => item.number)]));
  const summaryLines = new Set(summaryStart >= 0 ? clean.slice(summaryStart, summaryEnd).map((item) => item.number) : []);
  for (const item of clean) {
    if (provisionLines.has(item.number) || summaryLines.has(item.number)) continue;
    const text = visibleText(item.line);
    if ((text.match(MODALS) ?? []).length || OTHER_NORMATIVE.test(text)) {
      add(relative, item.number, 'PROSE_NORMATIVE_LOCATION', 'normative vocabulary is outside a Standards Requirement');
    }
  }

  const verification = sections.find((section) => section.name === 'Verification');
  if (verification) {
    for (let index = verification.line; index < clean.length; index += 1) {
      const match = clean[index].line.match(new RegExp(`^\\|\\s*(${CITATION_SOURCE})\\s*\\|\\s*([^|]+?)\\s*\\|\\s*([^|]+?)\\s*\\|\\s*$`));
      if (!match) continue;
      const methods = match[2].split(',').map((item) => item.trim()).filter(Boolean);
      for (const method of methods) if (!METHODS.has(method)) add(relative, index + 1, 'VERIFY_METHOD', `unknown verification method '${method}'`);
      if (new Set(methods).size !== methods.length) add(relative, index + 1, 'VERIFY_DUPLICATE_METHOD', `Verification repeats a method for '${match[1]}'`);
      const evidence = match[3].trim();
      if (GENERIC_EVIDENCE.test(visibleText(evidence))) add(relative, index + 1, 'VERIFY_GENERIC_EVIDENCE', `Verification for '${match[1]}' uses generic evidence`);
      // Evidence that echoes its own provision heading names no artifact. It
      // tells a reviewer to confirm that a rule says what it says.
      const owner = provisions.find((provision) => provision.id === match[1]);
      const ownerClaim = owner ? claim(owner.title) : '';
      if (ownerClaim && claim(evidence).includes(ownerClaim)) {
        add(relative, index + 1, 'VERIFY_TEMPLATED_EVIDENCE', `Verification for '${match[1]}' repeats its provision heading instead of naming evidence`);
      }
      // A static or test claim is checkable only when it names the command,
      // path, identifier, or assertion that produces the result.
      if (methods.some((method) => method === 'static' || method === 'test') && !/`[^`]+`/.test(evidence)) {
        add(relative, index + 1, 'VERIFY_NO_ARTIFACT', `Verification for '${match[1]}' claims a ${methods.join(' and ')} method but names no artifact`);
      }
      verificationRows.push({ id: match[1], line: index + 1, evidence });
    }
    const rowIds = verificationRows.map((row) => row.id);
    for (const provision of provisions) {
      const count = rowIds.filter((id) => id === provision.id).length;
      if (count === 0) add(relative, verification.line, 'VERIFY_MISSING_ID', `Verification has no row for '${provision.id}'`);
      if (count > 1) add(relative, verification.line, 'VERIFY_DUPLICATE_ID', `Verification has ${count} rows for '${provision.id}'`);
    }
    for (const row of verificationRows) {
      if (!provisions.some((provision) => provision.id === row.id)) add(relative, row.line, 'VERIFY_UNKNOWN_ID', `Verification references unknown page provision '${row.id}'`);
    }
  }

  if (!virtual) checkProse(relative, raw, kind, add);
  return { kind, provisions, headings, summaryReferences };
}

function unsupportedSchemaKeywords(schema, relative, pointer, add) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return;
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.has(key)) add(relative, 1, 'SCHEMA_UNSUPPORTED_KEYWORD', `unsupported JSON Schema keyword '${key}' at '${pointer}'`);
  }
  for (const key of SCHEMA_CHILD_LISTS) {
    const children = schema[key];
    if (!Array.isArray(children)) continue;
    for (let index = 0; index < children.length; index += 1) unsupportedSchemaKeywords(children[index], relative, `${pointer}/${key}/${index}`, add);
  }
  for (const key of SCHEMA_CHILD_MAPS) {
    for (const [name, child] of Object.entries(schema[key] ?? {})) unsupportedSchemaKeywords(child, relative, `${pointer}/${key}/${name}`, add);
  }
  for (const key of SCHEMA_CHILD_VALUES) {
    if (schema[key] && typeof schema[key] === 'object') unsupportedSchemaKeywords(schema[key], relative, `${pointer}/${key}`, add);
  }
}

function resolveSchemaRef(root, reference) {
  if (!reference.startsWith('#/')) throw new Error(`unsupported schema reference '${reference}'`);
  return reference.slice(2).split('/').reduce((value, segment) => value?.[segment.replace(/~1/g, '/').replace(/~0/g, '~')], root);
}

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateSchemaValue(value, schema, root, location, errors) {
  if (!schema || typeof schema !== 'object') return;
  if (schema.$ref) {
    const target = resolveSchemaRef(root, schema.$ref);
    if (!target) errors.push(`${location}: unresolved schema reference '${schema.$ref}'`);
    else validateSchemaValue(value, target, root, location, errors);
  }
  for (const branch of schema.allOf ?? []) validateSchemaValue(value, branch, root, location, errors);
  // Exactly one branch accepts the value. The count alone tells an author that
  // the value fits no shape without telling them why any shape refused it, so
  // the message carries the first reason from each branch that rejected.
  if (schema.oneOf) {
    const rejections = [];
    let matched = 0;
    for (let index = 0; index < schema.oneOf.length; index += 1) {
      const branchErrors = [];
      validateSchemaValue(value, schema.oneOf[index], root, location, branchErrors);
      if (branchErrors.length === 0) matched += 1;
      else rejections.push(`shape ${index + 1}: ${branchErrors[0].replace(`${location}: `, '')}`);
    }
    if (matched !== 1) {
      const because = matched === 0 && rejections.length ? ` (${rejections.join('; ')})` : '';
      errors.push(`${location}: value matches ${matched} of ${schema.oneOf.length} allowed shapes, expected exactly 1${because}`);
    }
  }
  if (schema.anyOf) {
    const rejections = [];
    const accepted = schema.anyOf.some((branch, index) => {
      const branchErrors = [];
      validateSchemaValue(value, branch, root, location, branchErrors);
      if (branchErrors.length === 0) return true;
      rejections.push(`shape ${index + 1}: ${branchErrors[0].replace(`${location}: `, '')}`);
      return false;
    });
    if (!accepted) errors.push(`${location}: value matches none of the ${schema.anyOf.length} allowed shapes (${rejections.join('; ')})`);
  }
  if (schema.if) {
    const conditionErrors = [];
    validateSchemaValue(value, schema.if, root, location, conditionErrors);
    validateSchemaValue(value, conditionErrors.length === 0 ? schema.then : schema.else, root, location, errors);
  }
  if (schema.not) {
    const notErrors = [];
    validateSchemaValue(value, schema.not, root, location, notErrors);
    if (notErrors.length === 0) errors.push(`${location}: value matches prohibited schema`);
  }
  if (schema.type) {
    const matches = schema.type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value)
      : schema.type === 'array' ? Array.isArray(value)
        : schema.type === 'integer' ? Number.isInteger(value)
          : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value)
            : schema.type === 'string' ? typeof value === 'string'
              : schema.type === 'boolean' ? typeof value === 'boolean'
                : schema.type === 'null' ? value === null
                  : true;
    if (!matches) {
      errors.push(`${location}: expected ${schema.type}`);
      return;
    }
  }
  if (schema.const !== undefined && !jsonEqual(value, schema.const)) errors.push(`${location}: expected constant ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item) => jsonEqual(item, value))) errors.push(`${location}: value is outside the allowed enum`);
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${location}: string is shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${location}: string is longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${location}: string does not match ${schema.pattern}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${location}: number is below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${location}: number is above ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${location}: number is not above ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push(`${location}: number is not below ${schema.exclusiveMaximum}`);
    // Floating-point remainders drift, so the test rounds to the nearest
    // multiple and compares against a tolerance derived from the divisor.
    if (schema.multipleOf !== undefined) {
      const quotient = value / schema.multipleOf;
      if (Math.abs(quotient - Math.round(quotient)) > 1e-9) errors.push(`${location}: number is not a multiple of ${schema.multipleOf}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${location}: array has fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${location}: array has more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${location}: array items are not unique`);
    const prefix = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
    for (let index = 0; index < prefix.length && index < value.length; index += 1) validateSchemaValue(value[index], prefix[index], root, `${location}/${index}`, errors);
    for (let index = prefix.length; index < value.length; index += 1) validateSchemaValue(value[index], schema.items, root, `${location}/${index}`, errors);
    if (schema.contains) {
      const holds = value.some((item) => {
        const itemErrors = [];
        validateSchemaValue(item, schema.contains, root, location, itemErrors);
        return itemErrors.length === 0;
      });
      if (!holds) errors.push(`${location}: array contains no item matching the required shape`);
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push(`${location}: object has fewer than ${schema.minProperties} properties`);
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) errors.push(`${location}: object has more than ${schema.maxProperties} properties`);
    for (const required of schema.required ?? []) if (!(required in value)) errors.push(`${location}: missing required property '${required}'`);
    for (const [trigger, dependents] of Object.entries(schema.dependentRequired ?? {})) {
      if (!(trigger in value)) continue;
      for (const dependent of dependents) if (!(dependent in value)) errors.push(`${location}: property '${trigger}' requires '${dependent}'`);
    }
    if (schema.propertyNames) for (const key of keys) validateSchemaValue(key, schema.propertyNames, root, `${location}/${key}`, errors);
    const declared = schema.properties ?? {};
    const patterns = Object.entries(schema.patternProperties ?? {});
    for (const [key, child] of Object.entries(value)) {
      let evaluated = false;
      if (key in declared) {
        validateSchemaValue(child, declared[key], root, `${location}/${key}`, errors);
        evaluated = true;
      }
      for (const [expression, subschema] of patterns) {
        if (!new RegExp(expression).test(key)) continue;
        validateSchemaValue(child, subschema, root, `${location}/${key}`, errors);
        evaluated = true;
      }
      if (evaluated) continue;
      if (schema.additionalProperties === false) errors.push(`${location}: unknown property '${key}'`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') validateSchemaValue(child, schema.additionalProperties, root, `${location}/${key}`, errors);
    }
  }
}

function validateSchemaConsumer(root, schemaRelative, valueRelative, add) {
  const schemaFile = path.join(root, schemaRelative);
  const valueFile = path.join(root, valueRelative);
  if (!fs.existsSync(schemaFile) || !fs.existsSync(valueFile)) return;
  let schema;
  let value;
  try {
    schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
    value = JSON.parse(fs.readFileSync(valueFile, 'utf8'));
  } catch (cause) {
    add(valueRelative, 1, 'SCHEMA_JSON', cause.message);
    return;
  }
  unsupportedSchemaKeywords(schema, schemaRelative, '#', add);
  const errors = [];
  try {
    validateSchemaValue(value, schema, schema, valueRelative, errors);
  } catch (cause) {
    errors.push(cause.message);
  }
  for (const error of errors) add(valueRelative, 1, 'SCHEMA_INVALID', error);
}

function checkLinks(root, files, add) {
  const anchors = new Map();
  for (const file of files) anchors.set(file, anchorsFor(fs.readFileSync(file, 'utf8')));
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const relative = slash(path.relative(root, file));
    for (const match of raw.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1].trim();
      if (/^(?:https?:|mailto:)/.test(href)) continue;
      const [targetPart, anchor] = href.split('#');
      const target = targetPart ? path.resolve(path.dirname(file), decodeURIComponent(targetPart)) : file;
      if (targetPart && !fs.existsSync(target)) {
        add(relative, lineNumber(raw, match.index), 'LINK_BROKEN', `link target '${href}' does not exist`);
        continue;
      }
      if (anchor && fs.existsSync(target) && target.toLowerCase().endsWith('.md')) {
        const targetAnchors = anchors.get(target) ?? anchorsFor(fs.readFileSync(target, 'utf8'));
        if (!targetAnchors.has(anchor)) add(relative, lineNumber(raw, match.index), 'ANCHOR_BROKEN', `anchor '#${anchor}' does not exist in '${slash(path.relative(root, target))}'`);
      }
    }
  }
}

function checkManifest(root, add) {
  const manifestFile = path.join(root, 'standards.manifest.json');
  if (!fs.existsSync(manifestFile)) return;
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  } catch (cause) {
    add('standards.manifest.json', 1, 'MANIFEST_JSON', cause.message);
    return;
  }
  const references = [manifest.agentsEntry];
  for (const profile of Object.values(manifest.profiles ?? {})) {
    references.push(profile.entry, ...(profile.pages ?? []));
    if (new Set(profile.pages ?? []).size !== (profile.pages ?? []).length) add('standards.manifest.json', 1, 'MANIFEST_DUPLICATE_PATH', `profile '${profile.entry}' contains a duplicate page path`);
  }
  for (const extension of Object.values(manifest.extensions ?? {})) references.push(extension.path);
  for (const plan of Object.values(manifest.loadPlans ?? {})) references.push(...(plan.tier0 ?? []), ...(plan.tier1 ?? []), ...(plan.tier2 ?? []));
  for (const reference of references.filter(Boolean)) {
    const [relative, anchor] = reference.split('#');
    const target = path.join(root, relative);
    if (!fs.existsSync(target)) {
      add('standards.manifest.json', 1, 'MANIFEST_PATH', `path '${relative}' does not exist`);
      continue;
    }
    if (anchor && !anchorsFor(fs.readFileSync(target, 'utf8')).has(anchor)) add('standards.manifest.json', 1, 'MANIFEST_ANCHOR', `anchor '#${anchor}' does not exist in '${relative}'`);
  }
  for (const [id, profile] of Object.entries(manifest.profiles ?? {})) {
    const entry = path.join(root, profile.entry);
    if (!fs.existsSync(entry)) continue;
    const raw = fs.readFileSync(entry, 'utf8');
    // The Composition section is the profile's list, so only that section is
    // compared with the manifest. A link in Intent or Conventions is prose
    // pointing at a page, not a claim that the profile composes it.
    const composition = sectionBody(raw.split(/\r?\n/), 'Composition');
    const actual = new Set([...composition.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)].map((match) => slash(path.relative(root, path.resolve(path.dirname(entry), decodeURIComponent(match[1]))))));
    const expected = new Set(profile.pages ?? []);
    for (const page of expected) if (!actual.has(page)) add(profile.entry, 1, 'PROFILE_COMPOSITION_MISSING', `profile '${id}' Composition omits '${page}'`);
    for (const page of actual) if (!expected.has(page)) add(profile.entry, 1, 'PROFILE_COMPOSITION_EXTRA', `profile '${id}' Composition adds '${page}' outside the manifest`);
  }
  for (const [id, extension] of Object.entries(manifest.extensions ?? {})) {
    const file = path.join(root, extension.path);
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const lines = raw.split(/\r?\n/);
    const activation = sectionBody(lines, 'Activation');
    const baseline = sectionBody(lines, 'Baseline relationship');
    const dependencies = sectionBody(lines, 'Dependencies');
    if (!activation.includes(`Activation scope: \`${extension.activationScope}\`.`)) add(extension.path, 1, 'EXTENSION_SCOPE', `extension '${id}' does not state activation scope '${extension.activationScope}'`);
    const kindLine = activation.split(/\r?\n/).find((line) => line.startsWith('Applicable specification kinds:')) ?? '';
    const actualKinds = [...kindLine.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    const expectedKinds = extension.applicableKinds ?? [];
    if (actualKinds.length !== expectedKinds.length || actualKinds.some((kind) => !expectedKinds.includes(kind))) {
      add(extension.path, 1, 'EXTENSION_KIND', `extension '${id}' applicable kinds do not match the manifest`);
    }
    const activationDetail = activation.split(/\r?\n/).filter((line) => line.trim() && !/^(?:Activation scope|Applicable specification kinds):/.test(line.trim()));
    if (!activationDetail.length) add(extension.path, 1, 'EXTENSION_ACTIVATION', `extension '${id}' has no activation criterion`);
    if (!baseline) add(extension.path, 1, 'EXTENSION_BASELINE', `extension '${id}' has an empty Baseline relationship`);
    if (!dependencies) add(extension.path, 1, 'EXTENSION_DEPENDENCIES', `extension '${id}' has an empty Dependencies section`);
  }
  const writingPlan = manifest.loadPlans?.['core.authoring'];
  if (!writingPlan || !(writingPlan.tier1 ?? []).includes('docs/core/authoring.md#agent-summary')
    || !(writingPlan.tier2 ?? []).includes('docs/core/authoring.md') || !(writingPlan.tier2 ?? []).includes('CONTRIBUTING.md')) {
    add('standards.manifest.json', 1, 'MANIFEST_LOAD_PLAN', 'core.authoring must load the authoring summary, page, and CONTRIBUTING.md');
  }
}

function manifestRegistry(root) {
  const absent = { present: false, areas: new Set(), topics: new Set() };
  const file = path.join(root, 'standards.manifest.json');
  if (!fs.existsSync(file)) return absent;
  try {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    const registry = manifest.provisionRegistry ?? {};
    return { present: true, areas: new Set(registry.areas ?? []), topics: new Set(registry.topics ?? []) };
  } catch {
    return absent;
  }
}

function normalizeTemplate(relative, raw) {
  return raw
    .replaceAll('{AREA.PAGE.TOPIC.001}', 'TEMPLATE.PAGE.TOPIC.001')
    .replaceAll('{AREA.PAGE}.CONVENTION.001', 'TEMPLATE.PAGE.CONVENTION.001')
    .replaceAll('{EXT.NAME.TOPIC.001}', 'EXT.TEMPLATE.TOPIC.001')
    .replaceAll('{EXT.NAME}.CONVENTION.001', 'EXT.TEMPLATE.CONVENTION.001')
    .replaceAll('{Topic Title}', 'Topic Title')
    .replaceAll('{Extension Title}', 'Extension Title')
    .replaceAll('{How-To Title}', 'How-To Title')
    .replaceAll('{Tutorial Title}', 'Tutorial Title')
    .replaceAll('{Command Title}', 'Command Title');
}

export function validateRepository(rootInput = '.') {
  const root = path.resolve(rootInput);
  const diagnostics = [];
  const stableCodes = new Set(STABLE_DIAGNOSTIC_CODES);
  const add = (relative, line, code, message) => {
    if (!stableCodes.has(code)) throw new Error(`Validator emitted undeclared diagnostic code '${code}'`);
    diagnostics.push({ relative: slash(relative), line, code, message });
  };
  try {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return { usageError: `Repository root is not a directory: ${root}`, diagnostics };
    fs.accessSync(root, fs.constants.R_OK);
  } catch (cause) {
    return { usageError: `Repository root is unreadable: ${root}: ${cause.message}`, diagnostics };
  }

  let markdown;
  try {
    markdown = walk(root, (file) => file.toLowerCase().endsWith('.md'));
  } catch (cause) {
    return { usageError: `Repository input is unreadable: ${cause.message}`, diagnostics };
  }
  const currentMarkdown = markdown.filter((file) => isCurrentStandardsMaterial(slash(path.relative(root, file))));
  const globalIds = new Map();
  const parsedPages = [];
  for (const file of currentMarkdown) {
    const relative = slash(path.relative(root, file));
    if (/^templates\/standard\//.test(relative)) continue;
    if (RESERVED_TEMPLATE_STEMS.has(relative)) {
      add(relative, 1, 'ID_PAGE_FILENAME', `'${relative}' is the virtual path an authoring template parses as; rename the page so its scope is its own`);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    const prose = stripFences(raw.split(/\r?\n/)).map((item) => item.line).join('\n');
    const nonAscii = prose.match(/[^\x00-\x7F]/);
    if (nonAscii) add(relative, lineNumber(prose, nonAscii.index), 'PROSE_NON_ASCII', nonAsciiMessage(nonAscii[0], 'non-ASCII character '));
    parsedPages.push({ relative, raw, parsed: parsePage(relative, raw, add, globalIds) });
    if (relative === 'AGENTS.md' || relative.endsWith('/project-agents.md')) checkAgentProjection(relative, raw, add);
  }

  // Provision identity comes from the path. The directory names the area and the file
  // stem names the page, so two pages cannot share a scope: the filesystem already
  // forbids a duplicate stem inside one directory. Only the word lists are declared.
  const registry = manifestRegistry(root);
  const usedTopics = new Set();
  for (const page of registry.present ? parsedPages : []) {
    const provisions = page.parsed.provisions ?? [];
    if (!provisions.length) continue;
    const parts = page.relative.match(/^docs\/([a-z][a-z0-9]*)\/([a-z][a-z0-9]*)\.md$/);
    if (!parts) {
      add(page.relative, 1, 'ID_PAGE_FILENAME', `page owns ${provisions.length} provisions, so its path must be docs/<area>/<page>.md with one lowercase word in each position`);
      continue;
    }
    const [, areaDir, stem] = parts;
    const scope = `${areaDir.toUpperCase()}.${stem.toUpperCase()}`;
    if (!registry.areas.has(areaDir.toUpperCase())) {
      add(page.relative, 1, 'ID_AREA_UNKNOWN', `directory '${areaDir}' is not a registered provisionRegistry area`);
    }
    for (const provision of provisions) {
      if (!provision.id.startsWith(`${scope}.`)) {
        add(page.relative, provision.line, 'ID_SCOPE_MISMATCH', `provision '${provision.id}' does not use the page scope '${scope}' its path derives`);
      }
      const topic = provision.id.split('.')[2];
      usedTopics.add(topic);
      if (topic === stem.toUpperCase()) {
        add(page.relative, provision.line, 'ID_TOPIC_REPEATS_PAGE', `provision '${provision.id}' repeats its page name as its topic, so the topic names nothing`);
      }
      if (!registry.topics.has(topic)) {
        add(page.relative, provision.line, 'ID_TOPIC_UNKNOWN', `topic '${topic}' is not a registered provisionRegistry topic`);
      }
    }
  }
  // One concept, one spelling. Regular and -ies plurals both count as the same word.
  const singular = (topic) => (topic.endsWith('IES') ? `${topic.slice(0, -3)}Y` : topic.endsWith('SES') ? topic.slice(0, -2) : topic.endsWith('S') ? topic.slice(0, -1) : null);
  for (const topic of registry.present ? registry.topics : []) {
    const other = singular(topic);
    if (other && registry.topics.has(other)) {
      add('standards.manifest.json', 1, 'ID_TOPIC_DUPLICATE', `topics '${other}' and '${topic}' name one concept in two forms`);
    }
    if (!usedTopics.has(topic)) add('standards.manifest.json', 1, 'ID_TOPIC_UNUSED', `provisionRegistry registers topic '${topic}', which no provision uses`);
  }

  const activeIds = new Set(globalIds.keys());
  for (const page of parsedPages) {
    for (const reference of page.parsed.summaryReferences) {
      if (!activeIds.has(reference.id)) add(page.relative, reference.line, 'SUMMARY_UNKNOWN_ID', `Agent Summary cites unknown provision '${reference.id}'`);
    }
    const prose = stripFences(page.raw.split(/\r?\n/)).map((item) => item.line).join('\n');
    for (const match of prose.matchAll(new RegExp(`\\b${CITATION_SOURCE}\\b`, 'g'))) {
      const id = match[0];
      const line = lineNumber(prose, match.index);
      if (!activeIds.has(id)) add(page.relative, line, 'ID_UNKNOWN_REFERENCE', `active content references unknown provision '${id}'`);
    }
  }

  const templateRoot = path.join(root, 'templates', 'standard');
  for (const file of walk(templateRoot, (candidate) => candidate.endsWith('.md'))) {
    const relative = slash(path.relative(root, file));
    const name = path.basename(file);
    const virtualRelative = TEMPLATE_VIRTUAL_PATH[name] ?? 'docs/core/template.md';
    const normalized = normalizeTemplate(relative, fs.readFileSync(file, 'utf8'));
    const nonAscii = stripFences(normalized.split(/\r?\n/)).map((item) => item.line).join('\n').match(/[^\x00-\x7F]/);
    if (nonAscii) add(relative, 1, 'PROSE_NON_ASCII', nonAsciiMessage(nonAscii[0], 'authoring template contains non-ASCII character '));
    parsePage(virtualRelative, normalized, add, globalIds, true);
    checkProse(relative, normalized, pageClass(virtualRelative), add);
  }

  checkLinks(root, currentMarkdown, add);
  checkManifest(root, add);

  // The provision index is derived. A stale page would send a reader to the wrong
  // heading, so the gate compares it with the active standards.
  // (CORE.AUTHORING.INDEX.001)
  const indexFile = path.join(root, INDEX_PATH);
  if (fs.existsSync(indexFile)) {
    const expected = `${buildProvisionIndex(root)}\n`;
    const actual = fs.readFileSync(indexFile, 'utf8').replace(/\r\n/g, '\n');
    if (actual !== expected) add(INDEX_PATH, 1, 'PROVISIONS_STALE', 'generated provision index differs from the active standards; run node tools/generate-provisions.mjs');
  } else if (fs.existsSync(path.join(root, 'docs', 'reference'))) {
    add(INDEX_PATH, 1, 'PROVISIONS_STALE', 'generated provision index is missing; run node tools/generate-provisions.mjs');
  }
  validateSchemaConsumer(root, 'schemas/standards-manifest.schema.json', 'standards.manifest.json', add);
  validateSchemaConsumer(root, 'schemas/standards-project.schema.json', 'templates/consumer/standards.project.json', add);

  const projectTemplate = path.join(root, 'templates', 'consumer', 'standards.project.json');
  if (fs.existsSync(projectTemplate)) {
    try {
      const project = JSON.parse(fs.readFileSync(projectTemplate, 'utf8'));
      for (const override of project.overrides ?? []) {
        if (!activeIds.has(override.provisionId)) add('templates/consumer/standards.project.json', 1, 'OVERRIDE_UNKNOWN_ID', `override references unknown Standard '${override.provisionId}'`);
        else if (/\.CONVENTION\.\d+$/.test(override.provisionId)) add('templates/consumer/standards.project.json', 1, 'OVERRIDE_CONVENTION_ID', `override cannot reference Convention '${override.provisionId}'`);
      }
    } catch {
      // Schema diagnostics report invalid JSON.
    }
  }

  // The template index is the only map from a template file to the consumer path
  // it targets. A renamed template leaves a row pointing at nothing, and that row
  // reads exactly like a correct one. (CORE.PRINCIPLES.SOURCE.001)
  checkTemplateIndex(root, add);

  // A reader who cannot tell a tutorial from a reference opens both and trusts
  // neither, so the documentation root names each class before it links to one.
  // (CORE.AUTHORING.INDEX.002)
  checkRootIndexRouting(root, add);

  diagnostics.sort((left, right) => left.relative.localeCompare(right.relative) || left.line - right.line || left.code.localeCompare(right.code));
  return { diagnostics };
}

const ROUTING_HEADING = 'Which page do you want';

function checkRootIndexRouting(root, add) {
  const relative = 'docs/README.md';
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let routingLine = -1;
  let firstGroupLine = -1;
  let currentHeading = '';
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^##\s+(.+?)\s*$/);
    if (heading) {
      currentHeading = heading[1];
      if (currentHeading === ROUTING_HEADING && routingLine < 0) routingLine = index + 1;
      continue;
    }
    // A navigation group is a section whose body lists links. Intent introduces
    // the page and names no destination, so a link inside it starts no group.
    if (firstGroupLine < 0 && currentHeading && currentHeading !== 'Intent' && currentHeading !== ROUTING_HEADING && /^-\s+\[/.test(lines[index])) {
      firstGroupLine = index + 1;
    }
  }
  if (routingLine < 0) {
    add(relative, 1, 'INDEX_MISSING_ROUTING', `documentation root index has no '${ROUTING_HEADING}' section, so a reader cannot tell which page class answers their question`);
    return;
  }
  if (firstGroupLine >= 0 && routingLine > firstGroupLine) {
    add(relative, routingLine, 'INDEX_MISSING_ROUTING', `'${ROUTING_HEADING}' appears after the first navigation group at line ${firstGroupLine}`);
  }
}

function checkTemplateIndex(root, add) {
  const relative = 'templates/consumer/README.md';
  const indexFile = path.join(root, relative);
  if (!fs.existsSync(indexFile)) return;
  const lines = fs.readFileSync(indexFile, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const row = lines[index].match(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/);
    if (!row) continue;
    const [, template] = row;
    if (!fs.existsSync(path.join(root, 'templates', 'consumer', template))) {
      add(relative, index + 1, 'TEMPLATE_INDEX_PATH', `template '${template}' named in the index does not exist`);
    }
  }
  // Every tracked template appears in the index. A shipped template that no row
  // names is a template a consumer cannot find.
  const named = new Set(lines.flatMap((line) => {
    const row = line.match(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/);
    return row ? [row[1]] : [];
  }));
  const directory = path.join(root, 'templates', 'consumer');
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory)) {
    if (entry === 'README.md' || named.has(entry)) continue;
    add(relative, 1, 'TEMPLATE_INDEX_PATH', `template '${entry}' is tracked but no index row names it`);
  }
}

const USAGE = `Usage: node tools/validate-standards.mjs [repositoryRoot] [--warnings] [--format=json] [--help]

Validates the authoring contract over the standards repository at repositoryRoot,
which defaults to the current directory.

  --warnings      List every warning occurrence instead of a count per code.
  --format=json   Write one JSON object on stdout instead of human-readable lines.
  --help          Print this text and exit.

Exit codes: 0 no error, 1 at least one error, 2 usage error.`;

function runCli() {
  const flags = process.argv.slice(2).filter((value) => value.startsWith('-'));
  if (flags.includes('--help') || flags.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }
  const json = flags.includes('--format=json');
  const unknown = flags.filter((value) => value !== '--warnings' && value !== '--format=json');
  if (unknown.length) {
    console.error(`Unknown option ${unknown.join(', ')}`);
    console.error(USAGE);
    process.exit(2);
  }
  const args = process.argv.slice(2).filter((value) => !value.startsWith('-'));
  if (args.length > 1) {
    console.error(USAGE);
    process.exit(2);
  }
  const result = validateRepository(args[0] ?? '.');
  if (result.usageError) {
    console.error(result.usageError);
    process.exit(2);
  }
  const warningCodes = new Set(WARNING_DIAGNOSTIC_CODES);
  const errors = result.diagnostics.filter((diagnostic) => !warningCodes.has(diagnostic.code));
  const warnings = result.diagnostics.filter((diagnostic) => warningCodes.has(diagnostic.code));
  // A machine reader needs the file, the line, and the stable code as fields. A
  // reader that has to parse the human lines back apart breaks the first time a
  // message is reworded, so the tool emits the structure it already holds.
  if (json) {
    console.log(JSON.stringify({
      tool: 'validate-standards',
      root: path.resolve(args[0] ?? '.'),
      ok: errors.length === 0,
      errors: errors.map(({ relative, line, code, message }) => ({ file: relative, line, code, message })),
      warnings: warnings.map(({ relative, line, code, message }) => ({ file: relative, line, code, message })),
    }, null, 2));
    process.exit(errors.length ? 1 : 0);
  }
  for (const diagnostic of errors) console.error(`${diagnostic.relative}:${diagnostic.line} [${diagnostic.code}] ${diagnostic.message}`);
  if (warnings.length) {
    const counts = new Map();
    for (const diagnostic of warnings) counts.set(diagnostic.code, (counts.get(diagnostic.code) ?? 0) + 1);
    console.error(`\nStandards authoring warnings (${warnings.length}). These do not fail the build:`);
    for (const code of [...counts.keys()].sort()) console.error(`  ${String(counts.get(code)).padStart(4)}  ${code}`);
    console.error('  Run with --warnings to list every occurrence.');
    if (process.argv.includes('--warnings')) {
      for (const diagnostic of warnings) console.error(`  ${diagnostic.relative}:${diagnostic.line} [${diagnostic.code}] ${diagnostic.message}`);
    }
  }
  if (errors.length) {
    console.error(`Standards authoring checks failed with ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log('Standards authoring checks passed.');
}

if (pathToFileURL(process.argv[1] ?? '').href === import.meta.url) runCli();
