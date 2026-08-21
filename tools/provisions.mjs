#!/usr/bin/env node

// Shared builder for docs/reference/provisions.md. The validator and the
// generator both call buildProvisionIndex, so the checked-in page and its
// freshness gate cannot disagree. (CORE.AUTHORING.INDEX.001)

import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = 'docs/reference/provisions.md';
const RULE_HEADING = /^###\s+(.+?)\s+\(([A-Z][A-Z0-9]*\.[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9]*\.\d{3})\)\s*$/;

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
      if (rule) rows.push({ id: rule[2], heading: rule[1], page: relative, anchor: headingSlug(`${rule[1]} (${rule[2]})`) });
    }
  }
  return rows.sort((left, right) => left.id.localeCompare(right.id, 'en'));
}

export function buildProvisionIndex(root) {
  const rows = collectProvisions(root);
  const areas = new Map();
  for (const row of rows) {
    const area = row.id.split('.')[0];
    if (!areas.has(area)) areas.set(area, []);
    areas.get(area).push(row);
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
    `The active release states ${rows.length} provisions across ${areas.size} areas.`,
    '',
  ];
  for (const area of [...areas.keys()].sort()) {
    lines.push(`## ${area}`, '');
    lines.push('| ID | Provision | Page |', '|:---|:---|:---|');
    for (const row of areas.get(area)) {
      const href = slash(path.relative(path.dirname(INDEX_PATH), row.page));
      const page = row.page.replace(/^docs\//, '');
      lines.push(`| ${row.id} | [${row.heading}](${href}#${row.anchor}) | \`${page}\` |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export { INDEX_PATH };
