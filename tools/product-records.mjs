#!/usr/bin/env node
// Product records command for a consumer documentation set.
//
// Writes the History section of every product-topic page from the decision
// records that name it, and reports which product rules the rest of the
// documentation cites. History is derived rather than written, because a past
// typed by hand drifts from the decisions it claims to summarise.
// (standards/rule/core-product.derive-history-from-decisions,
// standards/rule/core-product.report-which-product-rules-are-carried)

import fs from 'node:fs';
import path from 'node:path';
import { collectProductRecords, historyLines, replaceSection, sectionBody, definedRules, PRODUCT_RULE } from './product.mjs';

const USAGE = `Usage: node tools/product-records.mjs [consumerRoot] [--write] [--coverage] [--format=json] [--help]

Reads the product-topic pages and decision records under the consumer's
documentation root. With no option, reports each page whose History section
differs from the decisions that name it.

  --write         Rewrite each stale History section in place.
  --coverage      List every product rule with the pages outside product/ that cite it.
  --format=json   Write one JSON object on stdout instead of human-readable lines.
  --help          Print this text and exit.

Exit codes: 0 nothing stale, 1 at least one stale History section without --write, 2 usage error.`;

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('-'));
if (flags.includes('--help') || flags.includes('-h')) { console.log(USAGE); process.exit(0); }
const known = new Set(['--write', '--coverage', '--format=json']);
const unknown = flags.filter((flag) => !known.has(flag));
if (unknown.length) { console.error(`Unknown option ${unknown.join(', ')}`); console.error(USAGE); process.exit(2); }
const write = flags.includes('--write');
const coverage = flags.includes('--coverage');
const json = flags.includes('--format=json');

const root = path.resolve(args.find((a) => !a.startsWith('-')) ?? '.');
const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) { console.error(`No standards.project.json at ${root}`); process.exit(2); }
const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
const docsPath = project.paths?.docs ?? 'docs';
const docsRoot = path.join(root, docsPath);

const { topics, decisions } = collectProductRecords(docsRoot);
const pages = topics.filter((page) => page.meta.kind === 'product-topic');
const relOf = (file) => path.relative(root, file).replace(/\\/g, '/');

const stale = [];
for (const page of pages) {
  const body = sectionBody(page.raw, 'History');
  if (body === null) continue;
  const expected = historyLines(decisions, page);
  if (body.trim() === expected.join('\n').trim()) continue;
  stale.push(relOf(page.file));
  if (write) fs.writeFileSync(page.file, replaceSection(page.raw, 'History', expected));
}

let rules = [];
if (coverage) {
  const productRoot = path.join(docsRoot, 'product');
  const citations = new Map();
  for (const page of pages) for (const rule of definedRules(page)) citations.set(rule, { page: relOf(page.file), citedBy: [] });
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) { if (path.resolve(full) !== path.resolve(productRoot)) walk(full); continue; }
      if (!entry.name.endsWith('.md')) continue;
      const raw = fs.readFileSync(full, 'utf8');
      for (const match of raw.matchAll(PRODUCT_RULE)) {
        const record = citations.get(match[1]);
        if (record && !record.citedBy.includes(relOf(full))) record.citedBy.push(relOf(full));
      }
    }
  };
  walk(docsRoot);
  rules = [...citations].map(([rule, record]) => ({ rule, ...record })).sort((a, b) => a.rule.localeCompare(b.rule));
}

if (json) {
  console.log(JSON.stringify({ stale, written: write, rules: coverage ? rules : undefined }, null, 2));
} else {
  if (!stale.length) console.log(`History: ${pages.length} product-topic page(s), none stale.`);
  else console.log(`History: ${stale.length} page(s) ${write ? 'rewritten' : 'stale'}:\n${stale.map((rel) => `  - ${rel}`).join('\n')}`);
  if (coverage) {
    const uncited = rules.filter((rule) => !rule.citedBy.length);
    console.log(`Coverage: ${rules.length} product rule(s), ${rules.length - uncited.length} cited outside product/, ${uncited.length} not cited.`);
    for (const rule of rules) console.log(`  ${rule.citedBy.length ? 'cited ' : 'uncited'} ${rule.rule}${rule.citedBy.length ? ` <- ${rule.citedBy.join(', ')}` : ''}`);
  }
}
process.exit(stale.length && !write ? 1 : 0);
