#!/usr/bin/env node

// Shared builder for docs/reference/provisions.md. The validator and the
// generator both call buildProvisionIndex, so the checked-in page and its
// freshness gate cannot disagree. (standards/rule/core-authoring.generate-the-provision-index)

import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = 'docs/reference/provisions.md';

// Every provision identifier is standards/<kind>/<page>.<heading-slug>. The kind
// names the assertion class, the page names the owning page, and the heading slug
// names the assertion. No segment carries a sequence number.
// (standards/rule/core-authoring.identifier-must-follow-format)
export const PROVISION_KINDS = Object.freeze([
  'convention',
  'rule',
]);
const KIND_ALTERNATION = PROVISION_KINDS.join('|');
export const PROVISION_ID_SOURCE = `standards\\/(?:${KIND_ALTERNATION})\\/[a-z][a-z0-9-]*\\.[a-z0-9][a-z0-9-]*`;
const PROVISION_ID = new RegExp(`^${PROVISION_ID_SOURCE}$`);
const RULE_HEADING = new RegExp(`^###\\s+(.+?)\\s+\\((${PROVISION_ID_SOURCE})\\)\\s*$`);

export function headingSlug(value) {
  return value
    .replace(/\s+\{#[^}]+\}\s*$/, '')
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// The page segment is <area>-<stem>, so two pages named structure.md in two
// areas stay distinct. (standards/rule/core-authoring.identifier-must-name-its-page)
export function parseProvisionId(id) {
  const match = String(id).match(/^standards\/([a-z-]+)\/([a-z][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)$/);
  if (!match) return null;
  return { kind: match[1], page: match[2], slug: match[3] };
}

export function isProvisionId(id) {
  return PROVISION_ID.test(String(id));
}

function slash(value) {
  return value.replace(/\\/g, '/');
}

function stripFences(lines) {
  const out = [];
  let inside = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inside = !inside; out.push(''); continue; }
    out.push(inside ? '' : line);
  }
  return out;
}

function walk(directory, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(candidate, result);
    else if (entry.name.endsWith('.md')) result.push(candidate);
  }
  return result;
}

function tableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  return trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
}

// A Verification row carries the provision's mark: checkable with the command
// that checks it, or guidance with the question a reviewer answers. The columns
// are found by header name, so a column the page does not have reads as absent
// rather than shifting the others.
function collectVerificationMarks(lines) {
  const marks = new Map();
  let section = '';
  let columns = null;
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*(?:\{#.*\})?\s*$/);
    if (h2) {
      section = h2[1].trim();
      columns = null;
      continue;
    }
    if (section !== 'Verification') continue;
    const cells = tableCells(line);
    if (!cells) continue;
    if (/^:?-+:?$/.test(cells[0] ?? '')) continue;
    if (!columns) {
      const lowered = cells.map((cell) => cell.toLowerCase());
      if (lowered.includes('id') && lowered.includes('evidence')) {
        columns = { id: lowered.indexOf('id'), mark: lowered.indexOf('mark'), evidence: lowered.indexOf('evidence') };
      }
      continue;
    }
    const id = cells[columns.id] ?? '';
    if (!id || marks.has(id)) continue;
    marks.set(id, {
      mark: columns.mark >= 0 ? (cells[columns.mark] ?? '') : '',
      evidence: cells[columns.evidence] ?? '',
    });
  }
  return marks;
}

export function collectProvisions(root) {
  const rows = [];
  for (const file of walk(path.join(root, 'docs'))) {
    const relative = slash(path.relative(root, file));
    if (relative === INDEX_PATH) continue;
    const lines = stripFences(fs.readFileSync(file, 'utf8').split(/\r?\n/));
    const marks = collectVerificationMarks(lines);
    let section = '';
    for (const line of lines) {
      const h2 = line.match(/^##\s+(.+?)\s*(?:\{#.*\})?\s*$/);
      if (h2) section = h2[1].trim();
      if (section !== 'Standards' && section !== 'Conventions') continue;
      const rule = line.match(RULE_HEADING);
      if (rule) {
        const parsed = parseProvisionId(rule[2]);
        const verification = marks.get(rule[2]) ?? { mark: '', evidence: '' };
        rows.push({
          id: rule[2],
          heading: rule[1],
          page: relative,
          anchor: headingSlug(`${rule[1]} (${rule[2]})`),
          kind: parsed?.kind ?? '',
          mark: verification.mark,
          evidence: verification.evidence,
        });
      }
    }
  }
  return rows.sort((left, right) => left.id.localeCompare(right.id, 'en'));
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|');
}

export function buildProvisionIndex(root) {
  const rows = collectProvisions(root);
  const kinds = new Map();
  for (const row of rows) {
    if (!kinds.has(row.kind)) kinds.set(row.kind, []);
    kinds.get(row.kind).push(row);
  }
  const lines = [
    '# Provisions',
    '',
    '## Intent',
    '',
    'Use this generated page to resolve a provision ID to its heading, owning page, and verification mark.',
    '',
    'Run `node tools/generate-provisions.mjs` after any provision change. The repository validator fails when this page and the active standards disagree.',
    '',
    `The active release states ${rows.length} provisions across ${kinds.size} kinds.`,
    '',
  ];
  for (const kind of [...kinds.keys()].sort()) {
    lines.push(`## ${kind}`, '');
    lines.push('| ID | Provision | Page | Mark | Evidence |', '|:---|:---|:---|:---|:---|');
    for (const row of kinds.get(kind)) {
      const href = slash(path.relative(path.dirname(INDEX_PATH), row.page));
      const page = row.page.replace(/^docs\//, '');
      lines.push(`| ${row.id} | [${escapeCell(row.heading)}](${href}#${row.anchor}) | \`${page}\` | ${row.mark || '-'} | ${escapeCell(row.evidence) || '-'} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export { INDEX_PATH };
