#!/usr/bin/env node
// Product records command for a consumer documentation set.
//
// Writes the History section of every product-topic page from the decision
// records that name it, and reports which product rules the rest of the
// documentation cites. History is derived rather than written, because a past
// typed by hand drifts from the decisions it claims to summarise.
// (standards/rule/core-product.derive-history-from-decisions,
// standards/rule/core-product.report-which-product-rules-are-carried)
//
// With --check the command refuses instead of listing: a product rule no
// specification cites and an aggregate citing no rule each fail unless the
// trace baseline names them with a reason, and a baseline entry that is no
// longer needed fails as stale.
// (standards/rule/core-product.reject-an-uncarried-product-rule,
// standards/rule/core-release.record-accepted-debt-as-a-shrinking-baseline)

import fs from 'node:fs';
import path from 'node:path';
import { collectProductRecords, historyLines, replaceSection, sectionBody, definedRules, readMeta, PRODUCT_RULE } from './product.mjs';

const USAGE = `Usage: node tools/product-records.mjs [consumerRoot] [--write] [--coverage] [--check] [--baseline <file>] [--format=json] [--help]

Reads the product-topic pages and decision records under the consumer's
documentation root. With no option, reports each page whose History section
differs from the decisions that name it.

  --write           Rewrite each stale History section in place.
  --coverage        List every product rule with the pages outside product/ that cite it.
  --check           Fail on an uncarried rule or a rule-less aggregate the baseline does not name, and on a stale baseline entry.
  --baseline <file> Read the trace baseline from this consumer-root-relative file for --check. Without it the baseline is empty.
  --format=json     Write one JSON object on stdout instead of human-readable lines.
  --help            Print this text and exit.

Exit codes: 0 nothing stale and no check finding, 1 at least one stale History section without --write or at least one check finding, 2 usage error.`;

// A baseline reason opens with one fixed prefix, so a reader sees the kind of
// gap at once. (standards/rule/core-product.reject-an-uncarried-product-rule)
const REASON_PREFIXES = ['Company practice', 'Refusal', 'Planned', 'Carried not yet cited', 'Missing', 'Engineering only', 'Not yet cited'];

const args = process.argv.slice(2);
let baselineArg = null;
const rest = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--baseline') {
    baselineArg = args[index + 1] ?? null;
    index += 1;
  } else {
    rest.push(args[index]);
  }
}
const flags = rest.filter((a) => a.startsWith('-'));
if (flags.includes('--help') || flags.includes('-h')) { console.log(USAGE); process.exit(0); }
const known = new Set(['--write', '--coverage', '--check', '--format=json']);
const unknown = flags.filter((flag) => !known.has(flag));
if (unknown.length) { console.error(`Unknown option ${unknown.join(', ')}`); console.error(USAGE); process.exit(2); }
if (args.includes('--baseline') && (baselineArg === null || baselineArg.startsWith('-'))) { console.error('--baseline needs a file'); console.error(USAGE); process.exit(2); }
const write = flags.includes('--write');
const coverage = flags.includes('--coverage');
const check = flags.includes('--check');
const json = flags.includes('--format=json');

const root = path.resolve(rest.find((a) => !a.startsWith('-')) ?? '.');
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
if (coverage || check) {
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

// An aggregate cites a product rule when its specification folder carries a rule
// identifier: the aggregate page or a use-case page beside it. The folder is
// found by the aggregate page's metadata kind, the same way the consumer
// validator classifies it, and keyed by its metadata id.
let aggregates = [];
if (check) {
  const folders = new Map();
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.md')) continue;
      const raw = fs.readFileSync(full, 'utf8');
      const meta = readMeta(raw);
      if (!meta || meta.kind !== 'aggregate' || typeof meta.id !== 'string') continue;
      folders.set(meta.id, { page: relOf(full), directory: path.dirname(full) });
    }
  };
  walk(docsRoot);
  for (const [id, folder] of folders) {
    const cited = new Set();
    for (const entry of fs.readdirSync(folder.directory, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const raw = fs.readFileSync(path.join(folder.directory, entry.name), 'utf8');
      for (const match of raw.matchAll(PRODUCT_RULE)) cited.add(match[1]);
    }
    aggregates.push({ id, page: folder.page, cites: [...cited] });
  }
  aggregates.sort((a, b) => a.id.localeCompare(b.id));
}

const findings = [];
let baselineRel = null;
if (check) {
  let baseline = { rules: {}, aggregates: {} };
  if (baselineArg) {
    baselineRel = baselineArg.replace(/\\/g, '/');
    const baselineFile = path.join(root, baselineArg);
    if (!fs.existsSync(baselineFile)) { console.error(`No trace baseline at ${baselineFile}`); process.exit(2); }
    try {
      const parsed = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
      baseline = { rules: parsed.rules ?? {}, aggregates: parsed.aggregates ?? {} };
    } catch (cause) {
      console.error(`Trace baseline is not valid JSON (${cause.message})`);
      process.exit(2);
    }
  }
  const citedRules = new Set(rules.filter((rule) => rule.citedBy.length).map((rule) => rule.rule));
  const definedRuleIds = new Set(rules.map((rule) => rule.rule));
  for (const rule of rules) {
    if (rule.citedBy.length) continue;
    if (!baseline.rules[rule.rule]) findings.push(`uncited product rule with no baseline entry: ${rule.rule} (defined in ${rule.page})`);
  }
  const citingAggregates = new Set(aggregates.filter((aggregate) => aggregate.cites.length).map((aggregate) => aggregate.id));
  const aggregateIds = new Set(aggregates.map((aggregate) => aggregate.id));
  for (const aggregate of aggregates) {
    if (aggregate.cites.length) continue;
    if (!baseline.aggregates[aggregate.id]) findings.push(`aggregate citing no product rule with no baseline entry: ${aggregate.id} (${aggregate.page})`);
  }
  for (const [id, entry] of Object.entries(baseline.rules)) {
    const reason = entry?.reason ?? '';
    if (!REASON_PREFIXES.some((prefix) => reason === prefix || reason.startsWith(`${prefix}:`))) {
      findings.push(`trace baseline reason needs a known prefix: rules.${id}`);
    }
    if (citedRules.has(id)) findings.push(`stale trace baseline entry: rules.${id} is now cited`);
    else if (!definedRuleIds.has(id)) findings.push(`stale trace baseline entry: rules.${id} names no defined rule`);
  }
  for (const [id, entry] of Object.entries(baseline.aggregates)) {
    const reason = entry?.reason ?? '';
    if (!REASON_PREFIXES.some((prefix) => reason === prefix || reason.startsWith(`${prefix}:`))) {
      findings.push(`trace baseline reason needs a known prefix: aggregates.${id}`);
    }
    if (citingAggregates.has(id)) findings.push(`stale trace baseline entry: aggregates.${id} now cites a product rule`);
    else if (!aggregateIds.has(id)) findings.push(`stale trace baseline entry: aggregates.${id} names no aggregate page`);
  }
}

if (json) {
  console.log(JSON.stringify({ stale, written: write, rules: coverage ? rules : undefined, check: check ? { baseline: baselineRel, findings } : undefined }, null, 2));
} else {
  if (!stale.length) console.log(`History: ${pages.length} product-topic page(s), none stale.`);
  else console.log(`History: ${stale.length} page(s) ${write ? 'rewritten' : 'stale'}:\n${stale.map((rel) => `  - ${rel}`).join('\n')}`);
  if (coverage) {
    const uncited = rules.filter((rule) => !rule.citedBy.length);
    console.log(`Coverage: ${rules.length} product rule(s), ${rules.length - uncited.length} cited outside product/, ${uncited.length} not cited.`);
    for (const rule of rules) console.log(`  ${rule.citedBy.length ? 'cited ' : 'uncited'} ${rule.rule}${rule.citedBy.length ? ` <- ${rule.citedBy.join(', ')}` : ''}`);
  }
  if (check) {
    if (!findings.length) console.log(`Check: ${rules.length} product rule(s) and ${aggregates.length} aggregate(s) agree with the baseline.`);
    else console.log(`Check: ${findings.length} finding(s)${baselineRel ? ` against ${baselineRel}` : ' with no baseline'}:\n${findings.map((finding) => `  - ${finding}`).join('\n')}`);
  }
}
process.exit((stale.length && !write) || findings.length ? 1 : 0);
