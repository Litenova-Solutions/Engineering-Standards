// Checks that every aggregate page still says what the Domain source does.
//
// Reads: every `kind: aggregate` page under `docs/domain/modules/`, the
// matching folder under `apps/api/src/Entro.Domain/`, and the collection-bound
// constants registered in `docs/domain/domain-rules/aggregate-bounds.md`.
// Writes: `docs/domain/drift-baseline.json`, the disagreements accepted so far.
//
// Four checks, each finding named with its page and source line:
//
//   1. A public mutating method on the root class that the page's
//      `Aggregate invariants` section does not name.
//   2. A domain event type raised inside the aggregate's folder that the page's
//      `Events` section does not name.
//   3. A sealed state record nested under the root's state record that
//      `Business states` and `Technical state mapping` do not name.
//   4. A collection-bound constant on the root that the page's `Bounds` section
//      does not name. The aggregate-bounds register is what classifies a
//      constant as a collection bound.
//
//   node standards/tools/audit-drift.mjs [consumerRoot]           reports
//   node standards/tools/audit-drift.mjs [consumerRoot] --report  the same
//   node standards/tools/audit-drift.mjs [consumerRoot] --check   refuses on an
//                                                                 unaccepted finding or a stale entry
//   node standards/tools/audit-drift.mjs [consumerRoot] --fix     writes the baseline
//
// The baseline is keyed `page|kind|name` and holds the source location beside
// each accepted finding. A page that is fixed leaves its entry matching
// nothing, and `--check` refuses that too, so the file shrinks rather than rots.

import fs from 'node:fs';
import path from 'node:path';

const DOCS = 'docs/domain';
const MODULES = `${DOCS}/modules`;
const DOMAIN = 'apps/api/src/Entro.Domain';
const BOUNDS_PAGE = `${DOCS}/domain-rules/aggregate-bounds.md`;
const BASELINE = `${DOCS}/drift-baseline.json`;

const USAGE = `Usage: node standards/tools/audit-drift.mjs [consumerRoot] [--report|--check|--fix]

Reports where an aggregate page disagrees with the Domain source.

  (no mode)  Report every finding and exit zero.
  --report   The same.
  --check    Exit non-zero when a finding is absent from the baseline, or a
             baseline entry no longer matches a finding.
  --fix      Write the baseline from the current findings.

consumerRoot defaults to the current working directory.`;

const flags = process.argv.slice(2).filter((argument) => argument.startsWith('-'));
const unknown = flags.filter((flag) => flag !== '--check' && flag !== '--fix' && flag !== '--report');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
if (flags.includes('--check') && flags.includes('--fix')) {
  console.error('--check and --fix are different runs.');
  console.error(USAGE);
  process.exit(2);
}
const root = path.resolve(process.argv.slice(2).find((argument) => !argument.startsWith('-')) ?? '.');
const check = flags.includes('--check');
const fix = flags.includes('--fix');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
function filesUnder(directory, extension) {
  const found = [];
  if (!fs.existsSync(directory)) return found;
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'bin' || entry.name === 'obj') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(extension)) found.push(full);
    }
  };
  walk(path.join(root, directory));
  return found.sort();
}
const relative = (full) => path.relative(root, full).replace(/\\/g, '/');
const pascal = (kebab) => kebab.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

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
function sectionLine(raw, name) {
  const lines = raw.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === `## ${name}`);
  return index < 0 ? 1 : index + 1;
}

// Comments and string contents are blanked, and newlines are kept so every
// reported line number is the line number in the file.
function stripCode(text) {
  let out = '';
  let index = 0;
  while (index < text.length) {
    const two = text.slice(index, index + 2);
    if (two === '//') {
      while (index < text.length && text[index] !== '\n') {
        out += ' ';
        index += 1;
      }
      continue;
    }
    if (two === '/*') {
      out += '  ';
      index += 2;
      while (index < text.length && !(text[index] === '*' && text[index + 1] === '/')) {
        out += text[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      if (index < text.length) {
        out += '  ';
        index += 2;
      }
      continue;
    }
    if (text[index] === '"') {
      const verbatim = text[index + 1] === '@';
      out += verbatim ? '  ' : ' ';
      index += verbatim ? 2 : 1;
      while (index < text.length) {
        if (text[index] === '\\' && !verbatim) {
          out += '  ';
          index += 2;
          continue;
        }
        if (text[index] === '\n') {
          out += '\n';
          index += 1;
          continue;
        }
        if (text[index] === '"') {
          if (verbatim && text[index + 1] === '"') {
            out += '  ';
            index += 2;
            continue;
          }
          out += ' ';
          index += 1;
          break;
        }
        out += ' ';
        index += 1;
      }
      continue;
    }
    if (text[index] === "'") {
      out += ' ';
      index += 1;
      while (index < text.length && text[index] !== "'") {
        if (text[index] === '\\') {
          out += '  ';
          index += 2;
        } else {
          out += text[index] === '\n' ? '\n' : ' ';
          index += 1;
        }
      }
      if (index < text.length) {
        out += ' ';
        index += 1;
      }
      continue;
    }
    out += text[index];
    index += 1;
  }
  return out;
}
function matchBrace(text, open) {
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    else if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

// A method is mutating when its body raises a domain event, assigns a member or
// field, mutates a child it looked up, or constructs the root itself.
function mutatingBody(body) {
  if (/RaiseDomainEvent\s*\(/.test(body)) return true;
  if (/\b[A-Z]\w*\s*(?:\?\?=|=)(?![=>])/.test(body)) return true;
  if (/\b_[a-z]\w*\s*(?:\?\?=|=)(?![=>])/.test(body)) return true;
  if (/\b_[a-z]\w*\.(?:Add|AddRange|Remove|RemoveAt|Clear|Insert)\s*\(/.test(body)) return true;
  if (/\bFind[A-Z]\w*\s*\([^)]*\)\s*\.\s*[A-Z]\w*\s*\(/.test(body)) return true;
  return false;
}

const findings = [];
const pages = [];

// One finding, keyed `page|kind|name` so the baseline survives a line moving.
function record(page, kind, name, source, detail) {
  findings.push({ key: `${page}|${kind}|${name}`, kind, source, detail });
}

for (const file of filesUnder(MODULES, '.md')) {
  const raw = fs.readFileSync(file, 'utf8');
  const meta = metadata(raw);
  if (!meta || meta.kind !== 'aggregate') continue;
  const rel = relative(file);
  const parts = rel.split('/');
  const module = parts[2] === 'modules' ? parts[3] : undefined;
  const plural = parts[4];
  pages.push({ id: String(meta.id).replace(/^aggregate\//, ''), rel, raw, module, plural });
}

const boundsRegister = new Map();
{
  const raw = read(BOUNDS_PAGE);
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === '## Bounds');
  if (start >= 0) {
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^##\s/.test(lines[index])) break;
      if (!lines[index].trim().startsWith('|')) continue;
      if (/^\|\s*:?-/.test(lines[index].trim())) continue;
      const cells = lines[index].split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells[0] === 'Aggregate') continue;
      const aggregate = (cells[0] ?? '').replace(/`/g, '');
      const names = `${cells[1] ?? ''} ${cells[2] ?? ''}`.match(/`([A-Z]\w*)`/g) ?? [];
      if (!aggregate) continue;
      if (!boundsRegister.has(aggregate)) boundsRegister.set(aggregate, new Set());
      for (const name of names) boundsRegister.get(aggregate).add(name.replace(/`/g, ''));
    }
  }
}

for (const page of pages) {
  const domainDirectory = `${DOMAIN}/${pascal(page.module ?? '')}/${pascal(page.plural ?? '')}`;
  const sources = filesUnder(domainDirectory, '.cs');
  if (!sources.length) {
    record(page.rel, 'source', domainDirectory, page.rel, `${page.rel}: no Domain source under ${domainDirectory}/`);
    continue;
  }
  let rootFile = null;
  let rootName = null;
  let rootText = null;
  for (const source of sources) {
    const text = fs.readFileSync(source, 'utf8');
    const match = text.match(/\bclass\s+(\w+)\s*:\s*AggregateRoot\s*</);
    if (!match) continue;
    rootFile = source;
    rootName = match[1];
    rootText = text;
    break;
  }
  if (!rootFile) {
    record(page.rel, 'root', domainDirectory, page.rel, `${page.rel}: no AggregateRoot class under ${domainDirectory}/`);
    continue;
  }
  const rootRel = relative(rootFile);
  const stripped = stripCode(rootText);
  const declaration = stripped.search(new RegExp(`\\bclass\\s+${rootName}\\s*:`));
  const classOpen = stripped.indexOf('{', declaration);
  const classClose = matchBrace(stripped, classOpen);
  const classBody = stripped.slice(classOpen + 1, classClose);

  // 1. Public mutating methods named in the Aggregate invariants section.
  const invariants = section(page.raw, 'Aggregate invariants') ?? '';
  const invariantsLine = sectionLine(page.raw, 'Aggregate invariants');
  for (const match of classBody.matchAll(/(?:^|\n)[ \t]*(public)[^\n(;=]*?\b([A-Z]\w*)\s*\(/g)) {
    const name = match[2];
    if (name === rootName) continue;
    const parenOpen = classOpen + 1 + match.index + match[0].length - 1;
    let depth = 0;
    let parenClose = -1;
    for (let index = parenOpen; index < classOpen + 1 + classBody.length; index += 1) {
      if (stripped[index] === '(') depth += 1;
      else if (stripped[index] === ')') {
        depth -= 1;
        if (depth === 0) {
          parenClose = index;
          break;
        }
      }
    }
    if (parenClose < 0) continue;
    let cursor = parenClose + 1;
    while (/\s/.test(stripped[cursor])) cursor += 1;
    if (stripped[cursor] === ';') continue;
    if (stripped[cursor] === '=') continue;
    const bodyOpen = stripped.indexOf('{', cursor);
    if (bodyOpen < 0 || bodyOpen > classClose) continue;
    const bodyClose = matchBrace(stripped, bodyOpen);
    const body = stripped.slice(bodyOpen + 1, bodyClose);
    if (!mutatingBody(body)) continue;
    if (new RegExp(`\\b${name}\\b`).test(invariants)) continue;
    const site = `${rootRel}:${lineOf(rootText, classOpen + 1 + match.index)}`;
    record(page.rel, 'method', `${rootName}.${name}`, site, `${page.rel}:${invariantsLine}: method ${rootName}.${name} is not named in 'Aggregate invariants' (${site})`);
  }

  // 2. Domain event types raised in the folder named in the Events section.
  const events = section(page.raw, 'Events') ?? '';
  const eventsLine = sectionLine(page.raw, 'Events');
  const seenEvents = new Set();
  for (const source of sources) {
    const text = fs.readFileSync(source, 'utf8');
    const cleaned = stripCode(text);
    for (const match of cleaned.matchAll(/\bnew\s+([A-Z]\w*Event)\s*\(/g)) {
      const name = match[1];
      if (new RegExp(`\\b${name}\\b`).test(events)) continue;
      if (seenEvents.has(name)) continue;
      seenEvents.add(name);
      const site = `${relative(source)}:${lineOf(text, match.index)}`;
      record(page.rel, 'event', name, site, `${page.rel}:${eventsLine}: ${name} is raised at ${site} and is not named in 'Events'`);
    }
  }

  // 3. Sealed state records named in Business states or Technical state mapping.
  const states = section(page.raw, 'Business states') ?? '';
  const mapping = section(page.raw, 'Technical state mapping') ?? '';
  const stateLine = section(page.raw, 'Business states') !== null
    ? sectionLine(page.raw, 'Business states')
    : section(page.raw, 'Technical state mapping') !== null ? sectionLine(page.raw, 'Technical state mapping') : 1;
  for (const source of sources) {
    const text = fs.readFileSync(source, 'utf8');
    const stateMatch = text.match(new RegExp(`abstract\\s+record\\s+${rootName}State\\b`));
    if (!stateMatch) continue;
    const cleaned = stripCode(text);
    const stateOpen = cleaned.indexOf('{', stateMatch.index);
    const stateClose = matchBrace(cleaned, stateOpen);
    const stateBody = cleaned.slice(stateOpen + 1, stateClose);
    for (const match of stateBody.matchAll(/\bsealed\s+record\s+(\w+)/g)) {
      const name = match[1];
      if (new RegExp(`\\b${name}\\b`).test(states) || new RegExp(`\\b${name}\\b`).test(mapping)) continue;
      const site = `${relative(source)}:${lineOf(text, stateOpen + 1 + match.index)}`;
      record(page.rel, 'state', `${rootName}State.${name}`, site, `${page.rel}:${stateLine}: state record ${rootName}State.${name} is not named in 'Business states' or 'Technical state mapping' (${site})`);
    }
  }

  // 4. Collection-bound constants named in the Bounds section.
  const bounds = section(page.raw, 'Bounds') ?? '';
  const boundsLine = sectionLine(page.raw, 'Bounds');
  const registered = boundsRegister.get(rootName) ?? new Set();
  for (const match of rootText.matchAll(/\bpublic\s+const\s+(?:int|long)\s+(\w+)\s*=/g)) {
    const name = match[1];
    if (!registered.has(name)) continue;
    if (new RegExp(`\\b${name}\\b`).test(bounds)) continue;
    const site = `${rootRel}:${lineOf(rootText, match.index)}`;
    record(page.rel, 'bound', `${rootName}.${name}`, site, `${page.rel}:${boundsLine}: constant ${rootName}.${name} is not named in 'Bounds' (${site})`);
  }
}

function readBaseline() {
  const file = path.join(root, BASELINE);
  if (!fs.existsSync(file)) return new Map();
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    console.error(`audit-drift: ${BASELINE} is not valid JSON.`);
    process.exit(2);
  }
  return new Map(Object.entries(parsed.accepted ?? {}));
}

function writeBaseline() {
  const accepted = {};
  for (const finding of [...findings].sort((left, right) => left.key.localeCompare(right.key))) {
    accepted[finding.key] = finding.source;
  }
  const document = {
    $comment: `Every aggregate-page disagreement accepted when the drift check was wired. Keyed page|kind|name, each value the source location. Regenerate with node standards/tools/audit-drift.mjs --fix. An entry that stops matching a finding fails --check, so the file shrinks as pages are fixed.`,
    accepted,
  };
  fs.writeFileSync(path.join(root, BASELINE), `${JSON.stringify(document, null, 2)}\n`);
}

const accepted = readBaseline();
const current = new Set(findings.map((finding) => finding.key));
const unaccepted = findings.filter((finding) => !accepted.has(finding.key));
const stale = [...accepted.keys()].filter((key) => !current.has(key));

if (fix) {
  writeBaseline();
  const counts = new Map();
  for (const finding of findings) counts.set(finding.kind, (counts.get(finding.kind) ?? 0) + 1);
  const named = ['method', 'event', 'state', 'bound', 'source', 'root']
    .filter((kind) => counts.has(kind))
    .map((kind) => `${kind === 'source' ? 'source pages' : kind === 'root' ? 'root pages' : `${kind}s`} ${counts.get(kind)}`)
    .join(', ');
  console.log(`audit-drift: wrote ${BASELINE} with ${findings.length} accepted finding(s): ${named}.`);
  process.exit(0);
}

if (!check) {
  for (const finding of findings) console.log(`  - ${finding.detail}`);
  const summary = findings.length === 0
    ? `Checked ${pages.length} aggregate page(s). Every page agrees with the Domain source.`
    : `Checked ${pages.length} aggregate page(s). ${findings.length} disagreement(s), ${findings.length - unaccepted.length} accepted in the baseline.`;
  console.log(`audit-drift: ${summary}`);
  process.exit(0);
}

for (const finding of unaccepted) console.log(`  - ${finding.detail}`);
for (const key of stale) console.log(`  - baseline entry no longer matches a finding: ${key}`);

if (unaccepted.length === 0 && stale.length === 0) {
  console.log(`audit-drift: Checked ${pages.length} aggregate page(s). ${findings.length} disagreement(s), all accepted in the baseline.`);
  process.exit(0);
}

console.log(`audit-drift: Checked ${pages.length} aggregate page(s). ${unaccepted.length} finding(s) not in the baseline, ${stale.length} baseline entry(ies) no longer match.`);
process.exit(1);
