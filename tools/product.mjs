// Shared reader for product records: the product-topic pages and the decision
// records that set them. The consumer validator and the product-records command
// both read through this module, so the History section a command writes and
// the History section a validator checks cannot disagree.
// (standards/rule/core-product.derive-history-from-decisions)

import fs from 'node:fs';
import path from 'node:path';

// A product rule identifier is product/<topic>.<rule>. The topic is the id of
// the product-topic page that defines it, so a reader resolves a citation to its
// page without a lookup. (standards/rule/core-product.identify-every-product-rule)
export const PRODUCT_RULE = /`(product\/[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*)`/g;
export const PRODUCT_RULE_FORM = "'product/<topic>.<rule>' in lower kebab-case, for example 'product/pricing.flat-rate-fee'";

// The sections a product-topic page carries, in reading order. The chapter comes
// first and is written for a person: the situation, what the product does, why it
// is better, one worked example, what it costs, and how sure the reasoning is.
// The commitments follow for specifications and agents: Rules is what an agent
// applies, Position, Refusals, and Open questions state the present, Next states
// the future, History states the past, and Evidence lists the sources.
// (standards/rule/core-product.state-each-topic-in-one-page-shape,
// standards/rule/core-product.place-the-story-before-the-commitments)
export const CHAPTER_SECTIONS = ['Summary', 'The situation', 'What we do', 'Why it is better', 'A worked example', 'Costs and risks', 'How sure we are'];
export const COMMITMENT_SECTIONS = ['Rules', 'Position', 'Refusals', 'Open questions', 'Next', 'History', 'Evidence'];
export const TOPIC_SECTIONS = [...CHAPTER_SECTIONS, ...COMMITMENT_SECTIONS];

// A decision that sets product pages argues a business choice, so it carries the
// options it weighed and the condition that would reopen it rather than the
// override sections. (standards/rule/core-product.record-each-product-choice-as-a-decision)
export const PRODUCT_DECISION_SECTIONS = ['Context', 'Options considered', 'Decision', 'Evidence', 'Consequences', 'What would change it'];

// A byte-order mark is not content. Some editors still write one at the start
// of a file, and it breaks the metadata read below, so every read strips it.
function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

export function readMeta(raw) {
  const text = stripBom(raw);
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  try { return JSON.parse(text.slice(3, end).trim()); } catch { return null; }
}

export function sectionBody(raw, name) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${name}`);
  if (start < 0) return null;
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n');
}

// Replace one H2 section's body, keeping the heading and the sections around it.
export function replaceSection(raw, name, bodyLines) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${name}`);
  if (start < 0) return raw;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  const next = [...lines.slice(0, start + 1), '', ...bodyLines, '', ...lines.slice(end)];
  return next.join(eol);
}

// The entries of a section that state one item each: a table data row or a
// bullet. A header row and an alignment row state nothing.
export function sectionEntries(body) {
  const entries = [];
  let tableRow = 0;
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    // A fenced block shows an example of the shape and states no entry.
    if (trimmed.startsWith('```')) { fenced = !fenced; tableRow = 0; continue; }
    if (fenced) continue;
    if (trimmed.startsWith('|')) {
      tableRow += 1;
      if (tableRow === 1) continue;
      if (/^\|[\s:|-]+\|$/.test(trimmed)) continue;
      entries.push(trimmed);
      continue;
    }
    tableRow = 0;
    if (/^[-*]\s+/.test(trimmed)) entries.push(trimmed);
  }
  return entries;
}

export function statesNone(body) {
  return /^\s*`?None`?\./i.test(body.trim());
}

// Every relative Markdown link in a fragment, resolved against the page holding it.
export function linkedFiles(fragment, fromFile) {
  const out = [];
  for (const match of fragment.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = match[1].split('#')[0];
    if (!href || /^(https?:|mailto:)/.test(href) || !href.endsWith('.md')) continue;
    out.push(path.resolve(path.dirname(fromFile), href));
  }
  return out;
}

export function title(raw) {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

// Collect the product-topic pages and the decision records under a documentation
// root. Paths are absolute; docsRel is the path relative to the documentation
// root, which is the form a decision's affects field names.
export function collectProductRecords(docsRoot) {
  const topics = [];
  const decisions = [];
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.md')) continue;
      const raw = stripBom(fs.readFileSync(full, 'utf8'));
      const meta = readMeta(raw);
      if (!meta) continue;
      const docsRel = path.relative(docsRoot, full).replace(/\\/g, '/');
      const record = { file: full, docsRel, raw, meta };
      if (meta.kind === 'product-topic' || meta.kind === 'product') topics.push(record);
      if (meta.kind === 'decision') decisions.push(record);
    }
  };
  walk(docsRoot);
  return { topics, decisions };
}

// The decisions whose affects field names a page, oldest first.
export function decisionsAffecting(decisions, docsRel) {
  return decisions
    .filter((decision) => Array.isArray(decision.meta.affects) && decision.meta.affects.includes(docsRel))
    .sort((left, right) => (left.meta.decided ?? left.meta.lastReviewed ?? '').localeCompare(right.meta.decided ?? right.meta.lastReviewed ?? '') || String(left.meta.id).localeCompare(String(right.meta.id)));
}

// One History line per decision, newest first. The date is the approval date
// once a person approved the decision, and the last review date before that.
export function historyLines(decisions, page) {
  const lines = decisionsAffecting(decisions, page.docsRel).reverse().map((decision) => {
    const href = path.relative(path.dirname(page.file), decision.file).replace(/\\/g, '/');
    const date = decision.meta.decided ?? decision.meta.lastReviewed ?? '';
    const status = decision.meta.specStatus === 'retired' && decision.meta.supersededBy
      ? `retired, replaced by ${decision.meta.supersededBy}`
      : decision.meta.specStatus;
    return `- ${date}: [${decision.meta.id}](${href}) ${title(decision.raw)}. Status: ${status}.`;
  });
  return lines.length ? lines : ['None. No decision record names this page in its affects field.'];
}

// The product rules each topic page defines in its Rules section.
export function definedRules(page) {
  const body = sectionBody(page.raw, 'Rules') ?? '';
  const rules = [];
  for (const entry of sectionEntries(body)) {
    const match = entry.match(/^[-*]\s+`(product\/[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*)`/);
    if (match) rules.push(match[1]);
  }
  return rules;
}
