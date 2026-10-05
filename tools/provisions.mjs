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
  'acceptance-criterion',
  'authorization',
  'invariant',
  'policy',
  'rule',
  'validation',
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

export function collectProvisions(root) {
  const rows = [];
  for (const file of walk(path.join(root, 'docs'))) {
    const relative = slash(path.relative(root, file));
    if (relative === INDEX_PATH) continue;
    let section = '';
    for (const line of stripFences(fs.readFileSync(file, 'utf8').split(/\r?\n/))) {
      const h2 = line.match(/^##\s+(.+?)\s*(?:\{#.*\})?\s*$/);
      if (h2) section = h2[1].trim();
      if (section !== 'Standards' && section !== 'Conventions') continue;
      const rule = line.match(RULE_HEADING);
      if (rule) {
        const parsed = parseProvisionId(rule[2]);
        rows.push({
          id: rule[2],
          heading: rule[1],
          page: relative,
          anchor: headingSlug(`${rule[1]} (${rule[2]})`),
          kind: parsed?.kind ?? '',
        });
      }
    }
  }
  return rows.sort((left, right) => left.id.localeCompare(right.id, 'en'));
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
    'Use this generated page to resolve a provision ID to its heading and owning page.',
    '',
    'Run `node tools/generate-provisions.mjs` after any provision change. The repository validator fails when this page and the active standards disagree.',
    '',
    `The active release states ${rows.length} provisions across ${kinds.size} kinds.`,
    '',
  ];
  for (const kind of [...kinds.keys()].sort()) {
    lines.push(`## ${kind}`, '');
    lines.push('| ID | Provision | Page |', '|:---|:---|:---|');
    for (const row of kinds.get(kind)) {
      const href = slash(path.relative(path.dirname(INDEX_PATH), row.page));
      const page = row.page.replace(/^docs\//, '');
      lines.push(`| ${row.id} | [${row.heading}](${href}#${row.anchor}) | \`${page}\` |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export { INDEX_PATH };
