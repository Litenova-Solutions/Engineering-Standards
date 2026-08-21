#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildProvisionIndex, headingSlug, INDEX_PATH } from './provisions.mjs';

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
const ACTION_VERBS = new Set(`Accept Activate Add Advance Align Anchor Apply Approve Assert Assign Attach Audit Authenticate Authorize Avoid Await Back Bind Bound Build Call Canonicalize Centralize Check Cite Classify Co-locate Collect Commit Compare Complete Compose Configure Connect Control Copy Cover Create Declare Default Defer Define Delay Deliver Deploy Deprecate Derive Diff Discard Dispatch Distinguish Document Drive Emit Enforce Escalate Escape Evolve Exclude Exercise Expose Express Finish Follow Format Gate Generate Give Govern Group Handle Hide Identify Implement Inject Inspect Isolate Keep Lease Limit List Load Localize Locate Make Map Mark Match Measure Meet Minimize Mirror Model Move Name Note Operate Organize Own Parameterize Parse Pass Persist Pin Place Plan Point Prefer Preserve Prevent Process Project Promote Protect Prove Provide Publish Purge Query Raise Read Reconnect Record Recover Reference Reflect Regenerate Register Reject Reload Release Remove Render Replay Replace Report Represent Require Renew Requeue Resolve Restrict Retain Retire Retry Return Revalidate Review Rotate Route Run Scan Scope Select Separate Serialize Set Signal Simulate Specify Split Stage Start State Stop Store Subscribe Supply Support Tag Test Tolerate Trace Track Translate Treat Update Use Validate Verify Version Wait Write`.split(' '));
const VAGUE_TERMS = [
  ['etc.', /\betc\./i],
  ['and so on', /\band so on\b/i],
  ['as appropriate', /\bas appropriate\b/i],
  ['as needed', /\bas needed\b/i],
  ['simply', /\bsimply\b/i],
  ['just', /\bjust\b/i],
  ['basically', /\bbasically\b/i],
  ['obvious', /\bobvious(?:ly)?\b/i],
  ['clearly', /\bclearly\b/i],
  ['very', /\bvery\b/i],
  ['really', /\breally\b/i],
];
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

const CONTRACTIONS = /\b(?:ain't|aren't|can't|couldn't|didn't|doesn't|don't|hadn't|hasn't|haven't|he'd|he'll|he's|how'd|how'll|how's|i'd|i'll|i'm|i've|isn't|it'd|it'll|it's|let's|mightn't|mustn't|shan't|she'd|she'll|she's|shouldn't|that's|there'd|there'll|there's|they'd|they'll|they're|they've|wasn't|we'd|we'll|we're|we've|weren't|what'd|what'll|what're|what's|what've|where'd|where'll|where's|who'd|who'll|who's|won't|wouldn't|you'd|you'll|you're|you've)\b/i;
const AND_OR = /\band\/or\b/i;
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
]);
const SCHEMA_KEYWORDS = new Set([
  '$schema', '$id', '$ref', '$defs', 'title', 'description', 'type', 'const', 'enum', 'pattern',
  'minLength', 'minItems', 'minProperties', 'uniqueItems', 'required', 'properties', 'items',
  'additionalProperties', 'allOf', 'if', 'then', 'else', 'not', 'default', 'examples',
]);

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

function stripFences(lines) {
  const result = [];
  let fence = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMarkers = line.match(/```/g)?.length ?? 0;
    if (fenceMarkers) {
      if (fenceMarkers % 2 === 1) fence = !fence;
      result.push({ line: '', number: index + 1, fenced: true });
      continue;
    }
    result.push({ line: fence ? '' : line, number: index + 1, fenced: fence });
  }
  return result;
}

function visibleText(value) {
  return value
    .replace(/^\s*\*\*(?:Requirement|Deviation|Rationale|Example|Default|Replacement):\*\*\s*/i, '')
    .replace(/`[^`]*`/g, ' TOKEN ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<https?:[^>]+>/g, ' URL ')
    .replace(/https?:\/\/\S+/g, ' URL ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\{#[^}]+\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value) {
  return visibleText(value).match(/[A-Za-z0-9][A-Za-z0-9@#%+&'./:-]*/g) ?? [];
}

function sentences(value) {
  const text = visibleText(value)
    .replace(/\b(?:Mr|Mrs|Ms|Dr|vs)\./g, (match) => match.replace('.', ''))
    .replace(/\b[A-Z]\./g, (match) => match.replace('.', ''))
    .replace(/\.(?=[A-Za-z0-9])/g, '')
    .replace(/(?<=[A-Za-z0-9])\.(?=[A-Za-z0-9])/g, '')
    .trim();
  if (!text) return [];
  const found = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  return found.map((item) => item.trim()).filter(Boolean);
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

const PAGE_CLASS_AREA = { ext: 'extension', profile: 'profile', guide: 'guide' };

function pageClass(relative) {
  if (relative === INDEX_PATH) return 'index';
  if (relative === 'docs/reference/glossary.md') return 'glossary';
  if (relative.endsWith('/README.md') || relative === 'README.md') return 'index';
  const area = relative.match(/^docs\/([a-z][a-z0-9]*)\/[a-z][a-z0-9]*\.md$/)?.[1];
  if (!area || area === 'reference') return null;
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
  if (kind === 'guide') return { required: ['Purpose', 'Procedure', 'Verification'], optional: ['Prerequisites'] };
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
    : kind === 'guide'
      ? ['Purpose', 'Prerequisites', 'Procedure', 'Verification']
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
  if (/(^|\/)reference\/decisions\//.test(relative)) return;
  const lines = stripFences(raw.split(/\r?\n/));
  let paragraph = [];
  let list = [];

  const scanTerms = (value, number) => {
    const visible = visibleText(value);
    for (const [term, pattern] of VAGUE_TERMS) {
      if (pattern.test(visible)) add(relative, number, 'PROSE_VAGUE_TERM', `replace vague term '${term}'`);
    }
    const contraction = visible.match(CONTRACTIONS);
    if (contraction) add(relative, number, 'PROSE_CONTRACTION', `replace contraction '${contraction[0]}' with its full form`);
    if (AND_OR.test(visible)) add(relative, number, 'PROSE_AND_OR', "replace 'and/or' with an exact relationship");
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const number = paragraph[0].number;
    const value = paragraph.map((item) => item.line).join(' ');
    const found = sentences(value);
    if (found.length > 6) add(relative, number, 'PROSE_PARAGRAPH_LENGTH', `paragraph has ${found.length} sentences; maximum is 6`);
    for (const sentence of found) {
      const count = words(sentence).length;
      if (count > 25) add(relative, number, 'PROSE_SENTENCE_LENGTH', `sentence has ${count} words; maximum is 25: '${visibleText(sentence).slice(0, 120)}'`);
    }
    scanTerms(value, number);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    const number = list[0].number;
    const value = list.map((item) => item.line).join(' ');
    const content = value.replace(/^\s*(?:[-*+] |\d+\.\s+)/, '');
    for (const sentence of sentences(content)) {
      const count = words(sentence).length;
      if (count > 20) add(relative, number, 'PROSE_LIST_LENGTH', `list sentence has ${count} words; maximum is 20: '${visibleText(sentence).slice(0, 120)}'`);
    }
    scanTerms(value, number);
    list = [];
  };

  for (const item of lines) {
    const line = item.line;
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^\s*(?:[-*+] |\d+\.\s+)/.test(line)) {
      flushParagraph();
      flushList();
      list.push(item);
      continue;
    }
    if (list.length && /^\s{2,}\S/.test(line)) {
      list.push(item);
      continue;
    }
    flushList();
    if (/^#{1,6}\s/.test(line) || /^\s*</.test(line) || /^\s*---\s*$/.test(line)) {
      flushParagraph();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flushParagraph();
      if (!/^\s*\|?\s*:?-+/.test(line)) {
        const cells = line.split('|').slice(1, -1);
        for (const cell of cells) {
          const count = words(cell).length;
          if (count > 20) add(relative, item.number, 'PROSE_TABLE_CELL_LENGTH', `table cell has ${count} words; maximum is 20: '${visibleText(cell).slice(0, 120)}'`);
          scanTerms(cell, item.number);
        }
      }
      continue;
    }
    paragraph.push(item);
  }
  flushParagraph();
  flushList();
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
  for (const key of ['allOf']) for (const item of schema[key] ?? []) unsupportedSchemaKeywords(item, relative, `${pointer}/${key}`, add);
  for (const key of ['items', 'additionalProperties', 'if', 'then', 'else', 'not']) {
    if (schema[key] && typeof schema[key] === 'object') unsupportedSchemaKeywords(schema[key], relative, `${pointer}/${key}`, add);
  }
  for (const [name, child] of Object.entries(schema.properties ?? {})) unsupportedSchemaKeywords(child, relative, `${pointer}/properties/${name}`, add);
  for (const [name, child] of Object.entries(schema.$defs ?? {})) unsupportedSchemaKeywords(child, relative, `${pointer}/$defs/${name}`, add);
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
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${location}: string does not match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${location}: array has fewer than ${schema.minItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${location}: array items are not unique`);
    for (let index = 0; index < value.length; index += 1) validateSchemaValue(value[index], schema.items, root, `${location}/${index}`, errors);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) errors.push(`${location}: object has fewer than ${schema.minProperties} properties`);
    for (const required of schema.required ?? []) if (!(required in value)) errors.push(`${location}: missing required property '${required}'`);
    const declared = schema.properties ?? {};
    for (const [key, child] of Object.entries(value)) {
      if (key in declared) validateSchemaValue(child, declared[key], root, `${location}/${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${location}: unknown property '${key}'`);
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
    .replaceAll('{Guide Title}', 'Guide Title');
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
    const raw = fs.readFileSync(file, 'utf8');
    const prose = stripFences(raw.split(/\r?\n/)).map((item) => item.line).join('\n');
    const nonAscii = prose.match(/[^\x00-\x7F]/);
    if (nonAscii) add(relative, lineNumber(prose, nonAscii.index), 'PROSE_NON_ASCII', `non-ASCII character U+${nonAscii[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
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
    const virtualRelative = name === 'extension.md' ? 'docs/ext/template.md'
      : name === 'guide.md' ? 'docs/guide/template.md'
        : 'docs/core/template.md';
    const normalized = normalizeTemplate(relative, fs.readFileSync(file, 'utf8'));
    const nonAscii = stripFences(normalized.split(/\r?\n/)).map((item) => item.line).join('\n').match(/[^\x00-\x7F]/);
    if (nonAscii) add(relative, 1, 'PROSE_NON_ASCII', `authoring template contains non-ASCII character U+${nonAscii[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
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

  diagnostics.sort((left, right) => left.relative.localeCompare(right.relative) || left.line - right.line || left.code.localeCompare(right.code));
  return { diagnostics };
}

function runCli() {
  const args = process.argv.slice(2).filter((value) => value !== '--warnings');
  if (args.length > 1) {
    console.error('Usage: node tools/validate-standards.mjs [repositoryRoot] [--warnings]');
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
