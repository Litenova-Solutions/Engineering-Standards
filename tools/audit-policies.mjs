// Collects every live `policy/...` code into one map: which page defines it,
// which modules that page binds, and which use cases defend it in their Rules
// table. The retired `POL-` scheme is reported at the end.
//
// Reads: every page under `docs/domain/domain-rules/`, every use-case page's
// Rules table under `docs/domain/modules/`, the policy enumeration in
// `docs/domain/domain-rules/README.md`, and `docs/domain/identifiers-mapping.md`
// for the retired identifiers.
//
// Writes: `docs/domain/policy-map.md`.
//
//   node standards/tools/audit-policies.mjs [consumerRoot]           reports the counts
//   node standards/tools/audit-policies.mjs [consumerRoot] --check   refuses a stale page
//   node standards/tools/audit-policies.mjs [consumerRoot] --fix     writes the page
//
// The map is keyed by the live `policy/<page>.<slug>` codes and the policy pages
// that define them. A code cited by a Rules table but defined by no policy page
// is reported in its own section rather than dropped. The prose measures are
// imported from the sibling `prose.mjs` so the map proves its own output.

import fs from 'node:fs';
import path from 'node:path';
import { words } from './prose.mjs';

const DOCS = 'docs/domain';
const RULES = `${DOCS}/domain-rules`;
const MODULES = `${DOCS}/modules`;
const MAPPING = `${DOCS}/identifiers-mapping.md`;
const PAGE = `${DOCS}/policy-map.md`;
const CELL_LIMIT = 20;
const CITATIONS_PER_ROW = 18;

const USAGE = `Usage: node standards/tools/audit-policies.mjs [consumerRoot] [--check|--fix]

Collects the policy-to-use-case map into docs/domain/policy-map.md.

  (no mode)  Report the counts and whether the page is current.
  --check    Exit non-zero when the page is stale.
  --fix      Write the page.

consumerRoot defaults to the current working directory.`;

const flags = process.argv.slice(2).filter((argument) => argument.startsWith('-'));
const unknown = flags.filter((flag) => flag !== '--check' && flag !== '--fix');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
if (flags.includes('--check') && flags.includes('--fix')) {
  console.error('Pass one of --check and --fix, not both.');
  console.error(USAGE);
  process.exit(2);
}
const root = path.resolve(process.argv.slice(2).find((argument) => !argument.startsWith('-')) ?? '.');
const fix = flags.includes('--fix');
const check = flags.includes('--check');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
function filesUnder(directory) {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) found.push(full);
    }
  };
  walk(path.join(root, directory));
  return found.sort();
}
const relative = (full) => path.relative(root, full).replace(/\\/g, '/');

function metadata(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return null;
  try {
    return JSON.parse(raw.slice(3, end).trim());
  } catch {
    return null;
  }
}
function section(raw, name) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${name}`);
  if (start < 0) return null;
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s/.test(lines[index])) break;
    body.push(lines[index]);
  }
  return body.join('\n');
}
const CODE = /`(policy\/[a-z0-9-]+(?:\.[a-z0-9-]+)?)`/g;
const CODE_ANCHOR = /^policy\/([a-z0-9-]+)(?:\.([a-z0-9-]+))?$/;

// A use case lives directly in its module directory or in one aggregate folder
// beneath it, so the page a code is defended by is found the same way.
function useCasePage(id) {
  const [module, name] = id.replace(/^use-case\//, '').split('.');
  const flat = `${MODULES}/${module}/${name}.md`;
  if (fs.existsSync(path.join(root, flat))) return flat;
  const moduleDirectory = path.join(root, MODULES, module);
  if (!fs.existsSync(moduleDirectory)) return null;
  for (const entry of fs.readdirSync(moduleDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const nested = `${MODULES}/${module}/${entry.name}/${name}.md`;
    if (fs.existsSync(path.join(root, nested))) return nested;
  }
  return null;
}

// The policy enumeration in the folder's README is the page order. A README
// that does not link every policy page falls back to the file names.
function policyOrder(pages) {
  const raw = read(`${RULES}/README.md`).replace(/\r\n/g, '\n');
  const listed = [];
  for (const match of raw.matchAll(/\[([a-z0-9-]+)\]\(([a-z0-9-]+)\.md\)/g)) {
    if (match[1] !== match[2] || !pages.has(match[1]) || listed.includes(match[1])) continue;
    listed.push(match[1]);
  }
  return pages.size > 0 && [...pages.keys()].every((name) => listed.includes(name)) ? listed : [...pages.keys()].sort();
}

const policies = new Map();
for (const entry of fs.readdirSync(path.join(root, RULES), { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const rel = `${RULES}/${entry.name}`;
  const raw = read(rel);
  const meta = metadata(raw);
  if (!meta || meta.kind !== 'domain-policy') continue;
  const codes = [];
  const rules = section(raw, 'Rules');
  if (rules) {
    for (const line of rules.split(/\r?\n/)) {
      const match = line.match(/^\|\s*`(policy\/[a-z0-9-]+(?:\.[a-z0-9-]+)?)`/);
      if (match && !codes.includes(match[1])) codes.push(match[1]);
    }
  }
  policies.set(String(meta.id), {
    page: rel,
    modules: Array.isArray(meta.appliesToModules) ? meta.appliesToModules : [],
    codes,
  });
}

// The edge is a code in a use-case Rules table. One row may name more than one.
const citations = new Map();
for (const file of filesUnder(MODULES)) {
  const raw = fs.readFileSync(file, 'utf8');
  const meta = metadata(raw);
  if (!meta || meta.kind !== 'use-case') continue;
  const rules = section(raw, 'Rules');
  if (!rules) continue;
  for (const line of rules.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue;
    const cell = line.split('|')[1] ?? '';
    for (const match of cell.matchAll(CODE)) {
      if (!citations.has(match[1])) citations.set(match[1], []);
      const users = citations.get(match[1]);
      if (!users.includes(String(meta.id))) users.push(String(meta.id));
    }
  }
}

const order = policyOrder(policies);
const policyAnchors = new Set(policies.keys());

// A cited code belongs to the section of the policy page it names. A code with
// no page is collected for the trailing section.
const orphans = new Map();
for (const [code, users] of citations) {
  const match = code.match(CODE_ANCHOR);
  if (match && policyAnchors.has(match[1])) continue;
  orphans.set(code, users);
}
for (const [id, policy] of policies) {
  for (const [code, users] of citations) {
    const match = code.match(CODE_ANCHOR);
    if (!match || match[1] !== id) continue;
    if (!policy.codes.includes(code)) policy.codes.push(code);
  }
}
for (const policy of policies.values()) policy.codes.sort();

// The retired identifiers whose live code names no policy page. The migration
// map is their only record, so the section is generated from it.
const retired = [];
const mapping = read(MAPPING);
for (const line of mapping.split(/\r?\n/)) {
  const match = line.match(/^\|\s*`(POL-[A-Z0-9-]+)`\s*\|\s*`(policy\/[a-z0-9-]+(?:\.[a-z0-9-]+)?)`\s*\|/);
  if (!match) continue;
  const anchor = match[2].match(CODE_ANCHOR)?.[1];
  if (anchor && !policyAnchors.has(anchor)) retired.push({ id: match[1], code: match[2] });
}

function link(target, label) {
  return `[${label}](${path.posix.relative(DOCS, target)})`;
}

function defendedBy(users) {
  if (!users.length) return ['None.'];
  const cells = [];
  for (let index = 0; index < users.length; index += CITATIONS_PER_ROW) {
    const slice = users.slice(index, index + CITATIONS_PER_ROW);
    cells.push(slice.map((id) => {
      const page = useCasePage(id);
      return page ? link(page, id) : `\`${id}\``;
    }).join(', '));
  }
  return cells;
}

const lines = [];
lines.push('---');
lines.push('{');
lines.push('  "kind": "section-index",');
lines.push('  "id": "policy-map",');
lines.push('  "specStatus": "approved",');
lines.push('  "owner": "Entro product and engineering",');
lines.push('  "lastReviewed": "2026-09-21"');
lines.push('}');
lines.push('---');
lines.push('# Policy map');
lines.push('');
lines.push('One section per policy page under `docs/domain/domain-rules/`. Each section names the modules the page binds and one row per code the page defines. The `Defended by` column lists the use cases whose `Rules` table cites that code. `entro check policies --fix` regenerates this page. A code cited but defined outside the policy pages appears under `Codes with no policy page`.');
for (const id of order) {
  const policy = policies.get(id);
  lines.push('');
  lines.push(`## ${link(policy.page, id)}`);
  lines.push('');
  lines.push(`Applies to ${policy.modules.length} modules: ${policy.modules.map((module) => `\`${module}\``).join(', ')}.`);
  lines.push('');
  lines.push('| Code | Defended by |');
  lines.push('|:---|:---|');
  for (const code of policy.codes) {
    const cells = defendedBy(citations.get(code) ?? []);
    for (const cell of cells) lines.push(`| \`${code}\` | ${cell} |`);
  }
}
if (orphans.size) {
  lines.push('');
  lines.push('## Codes with no policy page');
  lines.push('');
  lines.push('These codes are cited by a `Rules` table and have no page under `domain-rules/`.');
  lines.push('');
  lines.push('| Code | Defended by |');
  lines.push('|:---|:---|');
  for (const code of [...orphans.keys()].sort()) {
    const cells = defendedBy(orphans.get(code));
    for (const cell of cells) lines.push(`| \`${code}\` | ${cell} |`);
  }
}
if (retired.length) {
  lines.push('');
  lines.push('## Retired identifiers with no policy page');
  lines.push('');
  lines.push('These retired identifiers have no policy page. [The migration map](identifiers-mapping.md) is their only record.');
  lines.push('');
  lines.push('| Retired identifier | Live code |');
  lines.push('|:---|:---|');
  for (const entry of retired) lines.push(`| \`${entry.id}\` | \`${entry.code}\` |`);
}
const page = `${lines.join('\n')}\n`;

const tooLong = [];
for (const line of lines) {
  if (!line.startsWith('|') || /^\|\s*:?-/.test(line)) continue;
  const cells = line.split('|').slice(1, -1);
  for (const cell of cells) if (words(cell).length > CELL_LIMIT) tooLong.push(cell);
}
if (tooLong.length) {
  console.error(`audit-policies: ${tooLong.length} cell(s) past the prose bound:`);
  for (const finding of tooLong) console.error(`  - ${finding.slice(0, 100)}`);
}
if (fix && tooLong.length) process.exit(1);

const codeCount = order.reduce((count, id) => count + policies.get(id).codes.length, 0);
if (fix) {
  fs.writeFileSync(path.join(root, PAGE), page, 'utf8');
  console.log(`audit-policies: wrote ${PAGE}`);
} else {
  const existing = fs.existsSync(path.join(root, PAGE)) ? read(PAGE) : '';
  const current = existing === page;
  console.log(`audit-policies: ${order.length} policy page(s), ${codeCount} code(s), ${orphans.size} code(s) with no page, ${retired.length} retired identifier(s).`);
  if (!current) console.log(`audit-policies: ${PAGE} is stale; run --fix.`);
  else console.log(`audit-policies: ${PAGE} is current.`);
  if (check && (!current || tooLong.length)) process.exit(1);
}
