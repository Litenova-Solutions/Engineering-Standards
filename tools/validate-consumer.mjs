#!/usr/bin/env node
// Consumer validator for the Litenova engineering standards.
//
// Holds a consumer repository to the release it pinned. It checks the project
// record against the project schema, the manifest version and the stacks and
// extensions the project names, every page's frontmatter against the record
// schema, each page's required sections, the language record with the prose
// measures and the rejected words, and the controlled UI through the UI
// validator. The model builder owns everything else: identifier resolution,
// coverage, traces, and the computed links between records, code, screens and
// tests.
//
// Usage:
//   node standards/tools/validate-consumer.mjs [consumerRoot] [--prose] [--format=json] [--help]
//
// consumerRoot defaults to the current working directory. The consumer must
// contain standards.project.json. Exit code is non-zero when any check fails.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkProseMeasures, checkLanguage, checkLanguageInSource, compileLanguage } from './prose.mjs';
import { schemaProblems } from './schema.mjs';

const USAGE = `Usage: node standards/tools/validate-consumer.mjs [consumerRoot] [--prose] [--format=json] [--help]

Validates the consumer repository at consumerRoot, which defaults to the
current directory. The consumer must contain standards.project.json.

  --prose         List every controlled-prose measure behind the reported counts.
  --format=json   Write one JSON object on stdout instead of human-readable lines.
  --help          Print this text and exit.

Exit codes: 0 no problem, 1 at least one problem, 2 usage error.`;

const flags = process.argv.slice(2).filter((a) => a.startsWith('-'));
if (flags.includes('--help') || flags.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
const unknownFlags = flags.filter((a) => a !== '--prose' && a !== '--format=json');
if (unknownFlags.length) {
  console.error(`Unknown option ${unknownFlags.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
const jsonOutput = flags.includes('--format=json');
// The root is the first argument that is not a flag, so an option can be passed
// without being read as the consumer directory.
const root = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('-')) ?? '.');
const errors = [];
const err = (m) => errors.push(m);
// An advisory is printed and counted, and never fails the run.
const advisories = [];
const advise = (m) => advisories.push(m);

// Every read in this file passes through one cache, so a file the checks
// revisit is read once and reused. The cache also strips a leading byte-order
// mark, which some editors still write: without the strip a page that carries
// a frontmatter block reports none.
const textCache = new Map();
function readText(p) {
  let text = textCache.get(p);
  if (text === undefined) {
    text = fs.readFileSync(p, 'utf8');
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    textCache.set(p, text);
  }
  return text;
}

function readJson(p) {
  return JSON.parse(readText(p));
}

// A malformed project file or manifest ends the run as a usage error, with the
// path and the parse message. A stack trace would break the --format=json
// contract a machine reader relies on.
function failInput(message) {
  if (jsonOutput) {
    console.log(JSON.stringify({
      tool: 'validate-consumer',
      consumer: root,
      ok: false,
      scanned: { documentationRoot: 'docs', files: 0, pages: 0 },
      problems: [message],
      advisories: [],
    }, null, 2));
  } else {
    console.error(message);
  }
  process.exit(2);
}

// `fs.globSync` arrived in Node 22 and is still marked experimental, so calling
// it puts a runtime floor on every consumer of this repository without the
// repository stating one. The walker below reads the same patterns through
// `fs.readdirSync`, which every maintained Node release has. It returns files
// only, so a caller needs no second filesystem call per match.
const GLOB_IGNORED = new Set(['node_modules', '.git', 'bin', 'obj', '.next', 'dist', 'build', 'out', 'coverage']);

function globSegment(segment) {
  let expression = '';
  for (const character of segment) {
    if (character === '*') expression += '[^/]*';
    else if (character === '?') expression += '[^/]';
    else expression += character.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${expression}$`);
}

function globFiles(from, pattern) {
  const segments = pattern.split('/').filter((segment) => segment.length && segment !== '.');
  const results = new Set();
  const visit = (directory, index, prefix) => {
    if (index >= segments.length) return;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    const segment = segments[index];
    const last = index === segments.length - 1;
    // '**' matches zero or more directories. The rest of the pattern is tried
    // at this level first, then inside every subdirectory.
    if (segment === '**') {
      visit(directory, index + 1, prefix);
      for (const entry of entries) {
        if (!entry.isDirectory() || GLOB_IGNORED.has(entry.name)) continue;
        visit(path.join(directory, entry.name), index, prefix ? `${prefix}/${entry.name}` : entry.name);
      }
      return;
    }
    const matcher = globSegment(segment);
    for (const entry of entries) {
      if (!matcher.test(entry.name)) continue;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (last && entry.isFile()) results.add(relative);
      else if (!last && entry.isDirectory() && !GLOB_IGNORED.has(entry.name)) visit(path.join(directory, entry.name), index + 1, relative);
    }
  };
  visit(from, 0, '');
  return [...results].sort();
}

// The schemas ship with this validator, so they resolve from its own location
// rather than from the consumer. A consumer may pin the standards repository
// at a path other than 'standards/'.
const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const standardsRoot = path.dirname(toolsDir);
const projectSchemaFile = path.join(standardsRoot, 'schemas', 'standards-project.schema.json');
const recordSchemaFile = path.join(standardsRoot, 'schemas', 'record.schema.json');
const languageSchemaFile = path.join(standardsRoot, 'schemas', 'language.schema.json');
for (const schemaFile of [projectSchemaFile, recordSchemaFile, languageSchemaFile]) {
  if (!fs.existsSync(schemaFile)) failInput(`Schema '${path.relative(standardsRoot, schemaFile).replace(/\\/g, '/')}' is missing from the pinned standards; the validator cannot run without it`);
}
const readSchema = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ---- project record ---------------------------------------------------------
const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) {
  console.error(`No standards.project.json at ${root}`);
  process.exit(2);
}
let project;
try {
  project = readJson(projectFile);
} catch (cause) {
  failInput(`standards.project.json: not valid JSON (${cause.message})`);
}
// The project record is validated through the shared schema module, so the
// schema is the one statement of its shape. A hand table beside it would need
// the same edit twice and drift on the third.
for (const problem of schemaProblems(projectSchemaFile, project, 'standards.project.json', readSchema)) err(problem);

// The documentation root is configuration, not a constant. A hard-coded docs/
// scans nothing in a consumer that keeps its pages elsewhere, and a scan of
// nothing reports PASS. 'docs' stays the default because that is the layout the
// standards describe.
const docsPath = project.paths?.docs ?? 'docs';
const docsRoot = path.join(root, docsPath);
// A configured path that does not resolve disables the checks that read it and
// leaves the run reporting PASS, so each message names the check that goes
// quiet.
for (const [field, value, consequence] of [
  ['paths.docs', project.paths?.docs, 'the page scan finds no record to check'],
  ['paths.language', project.paths?.language, 'the vocabulary and mannered-term checks resolve nothing'],
]) {
  if (value === undefined) continue;
  if (typeof value !== 'string' || !value.trim()) { err(`standards.project.json: ${field} '${value}' is not a path`); continue; }
  if (!fs.existsSync(path.join(root, value))) err(`standards.project.json: ${field} '${value}' does not exist; ${consequence}`);
}

// A selection records the criterion that was met and the date it is next
// reviewed, so a selection that costs nothing to keep still expires.
const declaredExtensions = project.selectedExtensions ?? [];
const selections = (Array.isArray(declaredExtensions) ? declaredExtensions : []).map((entry) => (
  typeof entry === 'string' ? { id: entry } : entry ?? {}
));
const selected = new Set(selections.map((entry) => entry.id));

// ---- manifest: version, stacks, extensions -----------------------------------
let manifest = null;
for (const rel of ['standards/standards.manifest.json', '../standards.manifest.json']) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) {
    try {
      manifest = readJson(p);
    } catch (cause) {
      failInput(`${rel}: not valid JSON (${cause.message})`);
    }
    break;
  }
}
// Adopting a release means accepting its complete contract, so the project
// records the release it reviewed. A mismatch means the pinned standards moved
// without anyone re-reading the contract that now applies.
if (manifest?.version) {
  const reviewed = project.reviewedStandardsVersion;
  if (!reviewed) err(`standards.project.json: missing 'reviewedStandardsVersion'; the pinned standards are ${manifest.version}`);
  else if (reviewed !== manifest.version) {
    err(`standards.project.json: reviewedStandardsVersion '${reviewed}' does not match the pinned standards ${manifest.version}; re-review the contract and record the new version`);
  }
}

// A stack the pinned release does not ship selects no page, so every
// stack-scoped provision would pass by applying to nothing.
const knownStacks = manifest?.stacks ? Object.keys(manifest.stacks).sort() : ['blazor-web', 'react', 'svelte'];
if (manifest?.extensions) {
  // A selection is checked against the manifest, not only against itself, so a
  // release that renamed an extension fails the stale selection rather than
  // passing a contract nobody selected.
  const known = Object.keys(manifest.extensions).sort();
  for (const id of selected) {
    if (!manifest.extensions[id]) {
      err(`standards.project.json: extensions '${id}' is not an extension in the pinned standards; known ids are ${known.join(', ')}`);
    }
  }
}

// An extension selected without a surface costs nothing to keep, so nobody
// removes it. A recorded review date makes the selection expire rather than
// accumulate.
const today = new Date().toISOString().slice(0, 10);
for (const entry of selections) {
  if (!entry.reviewBy) continue;
  if (entry.reviewBy < today) {
    err(`standards.project.json: extensions '${entry.id}' was due for review on ${entry.reviewBy}; confirm the criterion still applies or remove the selection`);
  }
}

// Every frontend declares its stack. Without the field a frontend silently
// skips every stack-scoped check, and the omission is indistinguishable from a
// considered position.
const CONTROLLED_PLATFORMS = ['react', 'svelte'];
const controlledFrontends = [];
const frontends = Array.isArray(project.paths?.frontends) ? project.paths.frontends : [];
for (const frontend of frontends) {
  const name = frontend?.name ?? '(unnamed)';
  // A declared frontend whose directory is absent reads as a frontend with no
  // code, and every check for it passes by having nothing to read.
  if (frontend?.path !== undefined && !fs.existsSync(path.join(root, frontend.path))) {
    err(`standards.project.json: frontend '${name}' path '${frontend.path}' does not exist; the checks for that frontend read nothing`);
  }
  if (!frontend?.platform) {
    err(`standards.project.json: frontend '${name}' declares no 'platform'; one of ${knownStacks.join(', ')} is required`);
  } else if (!knownStacks.includes(frontend.platform)) {
    err(`standards.project.json: frontend '${name}' has unknown platform '${frontend.platform}'; expected one of ${knownStacks.join(', ')}`);
  } else if (CONTROLLED_PLATFORMS.includes(frontend.platform)) {
    controlledFrontends.push(frontend);
  }
}

// A controlled frontend composes the shared UI package, so the workspace declares
// it once. The package travels with the workspace rather than with an
// application, so one missing field is one missing file for every frontend
// rather than a row per application.
const uiPackage = project.paths?.uiPackage ?? null;
if (controlledFrontends.length && !uiPackage) {
  err(`standards.project.json: ${controlledFrontends.length} controlled frontend(s) and no 'paths.uiPackage'; the shared UI package every controlled web frontend composes is undeclared`);
} else if (uiPackage) {
  const uiPackageLabel = `standards.project.json: paths.uiPackage '${uiPackage.name ?? '(unnamed)'}'`;
  for (const key of ['path', 'componentsJson', 'primitives', 'tokens', 'sourceLock', 'designContract']) {
    if (uiPackage[key] !== undefined && !fs.existsSync(path.join(root, uiPackage[key]))) {
      err(`${uiPackageLabel}: ${key} path does not exist '${uiPackage[key]}'`);
    }
  }
  for (const frontend of controlledFrontends) {
    const stylesheet = frontend.ui?.globalCss;
    if (stylesheet !== undefined && !fs.existsSync(path.join(root, stylesheet))) {
      err(`standards.project.json: frontend '${frontend.name}' ui.globalCss path does not exist '${stylesheet}'`);
    }
  }
}

// ---- collect files ------------------------------------------------------------
const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) files.push(p);
  }
})(docsRoot);
// Every check below reads this list, so an empty list agrees with everything. A
// consumer with no page does not exist; a root that resolves to nothing does.
if (!files.length) err(`Scanned no Markdown files under '${docsPath}'; check paths.docs, because a consumer with no page is a misconfigured scan`);

// A page record or a page style declares the sections its reader expects to
// find. An absent section is a question the page never answered, which reads
// exactly like a question with no answer. Types with no entry carry their
// content in frontmatter and keep free body prose.
const REQUIRED_SECTIONS = {
  decision: ['Context', 'Options', 'Decision', 'Consequences', 'Evidence'],
  tutorial: ['Purpose', 'Prerequisites', 'Lesson', 'What you built'],
  'how-to': ['Purpose', 'Procedure', 'Verification'],
  reference: ['Intent', 'Reference'],
  command: ['Name', 'Synopsis', 'Description', 'Arguments', 'Options', 'Exit codes', 'Examples', 'Underneath'],
  configuration: ['Intent', 'Settings', 'Precedence'],
};

// Frontmatter is a '---' delimited JSON block. A file that carries a record in
// any other wrapper, or carries none at all, is reported rather than skipped,
// because a silently skipped page is an unvalidated page: the run passes while
// that page sits unchecked beside every page that was checked.
function parseBlock(raw, rel) {
  if (!raw.startsWith('---')) {
    const fenced = raw.slice(0, 2000).match(/```[a-z]*\s*\n\s*\{[\s\S]{0,400}?"type"\s*:/);
    if (fenced) err(`${rel}: frontmatter block is not delimited by '---'`);
    else err(`${rel}: no frontmatter block; every page opens with a '---' JSON block carrying its record type or page style`);
    return null;
  }
  const end = raw.indexOf('\n---', 3);
  if (end < 0) { err(`${rel}: unterminated frontmatter block`); return null; }
  try { return JSON.parse(raw.slice(3, end).trim()); }
  catch (e) { err(`${rel}: JSON parse error: ${e.message}`); return null; }
}

// A section body is the text between its own H2 and the next one.
function sectionBody(raw, name) {
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

let pages = 0;
for (const f of files) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const raw = readText(f);
  const meta = parseBlock(raw, rel);
  if (!meta) continue;
  pages += 1;
  // Frontmatter is validated through the shared schema module against the
  // record schema, so the schema is the one statement of every record shape.
  for (const problem of schemaProblems(recordSchemaFile, meta, rel, readSchema)) err(problem);
  if (meta && typeof meta.type === 'string') {
    for (const name of REQUIRED_SECTIONS[meta.type] ?? []) {
      if (sectionBody(raw, name) === null) err(`${rel}: type '${meta.type}' requires an H2 '${name}'`);
    }
  }
}

// ---- language and controlled prose -------------------------------------------
let languageSummary = '';
{
  const languagePath = project.paths?.language;
  const languageFile = languagePath ? path.join(root, languagePath) : path.join(docsRoot, 'language.json');
  const languageRel = path.relative(root, languageFile).replace(/\\/g, '/');
  let compiled = null;
  if (fs.existsSync(languageFile)) {
    let record;
    try { record = readJson(languageFile); } catch (e) { err(`${languageRel}: not valid JSON (${e.message})`); }
    if (record) {
      const shape = schemaProblems(languageSchemaFile, record, languageRel, readSchema);
      for (const problem of shape) err(problem);
      // A scope that does not compile silently rejects nothing, which is the
      // fail-open shape this validator exists to refuse. The record is not
      // compiled afterwards, because compiling it would throw the same error
      // as an unhandled crash and print no diagnostic at all.
      let scopesOk = true;
      const terms = Array.isArray(record.terms) ? record.terms : [];
      for (const entry of terms) {
        if (!entry || typeof entry !== 'object') continue;
        const rejected = Array.isArray(entry.rejected) ? entry.rejected : [];
        for (const scope of [entry.scope, ...rejected.map((synonym) => synonym?.scope)].filter((value) => typeof value === 'string' && value)) {
          try { new RegExp(scope); } catch { err(`${languageRel}: term '${entry.term}' has a scope that is not a regular expression: '${scope}'`); scopesOk = false; }
        }
      }
      if (!shape.length && scopesOk) compiled = compileLanguage(record);
    }
  } else if (languagePath) {
    err(`standards.project.json: paths.language '${languagePath}' does not exist; the vocabulary and mannered-term checks resolve nothing`);
  }

  // AGENTS.md is scanned for language even though it carries no record and
  // sits outside the documentation root. It is the first file an agent reads,
  // so its register is the register that gets copied into every page written
  // afterwards, and a rule the exemplar breaks is a rule that does not hold.
  const agentsFile = path.join(root, 'AGENTS.md');
  const languageFiles = fs.existsSync(agentsFile) ? [...files, agentsFile] : files;

  const languageFindings = [];
  const proseCounts = new Map();
  const proseCodes = new Map();
  for (const f of languageFiles) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const raw = readText(f);
    // A scope is written against the documentation root. AGENTS.md sits above
    // it, so it matches no scoped rule and is checked by the mannered list.
    const scopeRel = f === agentsFile ? rel : path.relative(docsRoot, f).replace(/\\/g, '/');
    checkLanguage(scopeRel, raw, compiled, (_r, line, code, message) => {
      languageFindings.push(`${rel}:${line}: ${code} ${message}`);
    });
    if (f === agentsFile) continue;
    let count = 0;
    const codes = new Map();
    checkProseMeasures(rel, raw, (_relative, _line, code) => { count += 1; codes.set(code, (codes.get(code) ?? 0) + 1); });
    if (count) { proseCounts.set(rel, count); proseCodes.set(rel, codes); }
  }

  // The documentation tree is one of the surfaces a word reaches, and usually
  // the smallest. A project's source, its interface copy, its API contract and
  // its tests carry the same vocabulary to a developer, a customer and a
  // reviewer, and a check that reads only Markdown holds the vocabulary where
  // nobody reads it. `paths.languageScan` names those surfaces.
  //
  // A scope in the language record is written against the documentation root
  // for a page under it, and against the repository root for one of these
  // files, because there is no other root the two have in common.
  let scannedSurfaces = 0;
  const languageScan = Array.isArray(project.paths?.languageScan) ? project.paths.languageScan : [];
  for (const pattern of languageScan) {
    let matched;
    try {
      matched = globFiles(root, pattern);
    } catch (e) {
      err(`standards.project.json: paths.languageScan '${pattern}' could not be read (${e.message})`);
      continue;
    }
    // A pattern that matches nothing switches a surface off in silence, which
    // is the shape this validator refuses everywhere else.
    if (!matched.length) {
      err(`standards.project.json: paths.languageScan '${pattern}' matches no file; the vocabulary check over that surface did not run`);
      continue;
    }
    for (const relativePath of matched) {
      const absolute = path.join(root, relativePath);
      const rel = relativePath.replace(/\\/g, '/');
      scannedSurfaces += 1;
      checkLanguageInSource(rel, readText(absolute), compiled, (_r, line, code, message) => {
        languageFindings.push(`${rel}:${line}: ${code} ${message}`);
      });
    }
  }

  // A rejected synonym is always an error. The vocabulary is the project's own,
  // so a term it rejects is a term it chose to reject. A consumer that sets
  // `prose.enforcement` to `report` gets the prose measures and the mannered
  // terms as advisories instead: they are counted and printed, and they do not
  // fail the run.
  const proseReportOnly = project.prose?.enforcement === 'report';
  const proseErr = proseReportOnly ? advise : err;
  for (const finding of languageFindings) {
    if (finding.includes('LANGUAGE_MANNERED_TERM')) proseErr(finding);
    else err(finding);
  }

  for (const [rel, count] of proseCounts) {
    proseErr(`${rel}: ${count} controlled-prose problem(s); run 'node standards/tools/validate-consumer.mjs --prose' to list them`);
  }
  const manneredCount = languageFindings.filter((f) => f.includes('LANGUAGE_MANNERED_TERM')).length;
  const rejectedCount = languageFindings.length - manneredCount;
  const surfaceNote = scannedSurfaces
    ? `, ${scannedSurfaces} non-Markdown surface(s) scanned`
    : ', documentation only';
  // The default output names the worst files and their dominant measure, so a
  // reader can act without a second flag. --prose still lists every measure.
  const hotspot = [...proseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([rel, count]) => {
      const codes = proseCodes.get(rel) ?? new Map();
      const top = [...codes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'PROSE_SENTENCE_LENGTH';
      return `${rel} (${count}, mostly ${top})`;
    })
    .join('; ');
  const hotspotNote = hotspot ? `; worst prose: ${hotspot}; run with --prose to list every measure` : '';
  languageSummary = compiled
    ? `Language: ${manneredCount} mannered term(s), ${rejectedCount} rejected synonym(s)${surfaceNote}${hotspotNote}`
    : `Language: no language record found; the vocabulary and mannered-term checks did not run`;

  // --prose lists the measures behind the counts, which is what a person needs
  // to burn a page down. The check itself stays on by default.
  if (process.argv.includes('--prose')) {
    const detail = [];
    for (const f of files) {
      const rel = path.relative(root, f).replace(/\\/g, '/');
      checkProseMeasures(rel, readText(f), (r, line, code, message) => detail.push(`${r}:${line}: ${code} ${message}`));
    }
    console.log(`\nControlled prose (${detail.length}):`);
    for (const d of detail) console.log(`  - ${d}`);
  }
}

// ---- controlled UI ------------------------------------------------------------
// A controlled-web consumer opts into the deterministic UI validator through its
// frontend platform declaration or UI block.
const uiActivated = controlledFrontends.length > 0 || Boolean(uiPackage);
if (uiActivated) {
  // Resolve the sibling validator from this file so a consumer may pin the
  // standards repository at a path other than 'standards/'.
  const uiValidator = path.join(toolsDir, 'validate-ui.mjs');
  if (fs.existsSync(uiValidator)) {
    // The child validator gets 120 seconds and answers as JSON, so its
    // findings merge by structure rather than by re-parsing human lines. A
    // spawn failure reports the validator path rather than a UI content
    // failure, because a validator that never started proved nothing about
    // the UI.
    const result = spawnSync(process.execPath, [uiValidator, root, '--format=json'], { encoding: 'utf8', timeout: 120000 });
    if (result.error) {
      err(`controlled UI validator at ${uiValidator} could not start (${result.error.message})`);
    } else {
      let parsed = null;
      try {
        parsed = JSON.parse(result.stdout);
      } catch {
        parsed = null;
      }
      if (!parsed || !Array.isArray(parsed.problems)) {
        err(`controlled UI validator output could not be read as JSON (exit ${result.status}); the UI findings are unknown`);
      } else {
        // Each UI problem is carried into this validator's own list rather than
        // left in a block of text. A caller reading the structured output has no
        // 'above' to look at, and a caller reading the human output sees the same
        // problems either way.
        for (const item of parsed.problems) err(`controlled UI: ${item}`);
        if (result.status !== 0 && parsed.problems.length === 0) {
          err(`controlled UI validation failed with exit code ${result.status}`);
        }
      }
    }
  } else {
    err(`controlled UI configuration is present but the UI validator is missing at ${uiValidator}`);
  }
}

// ---- report ------------------------------------------------------------------
// A machine reader gets the problems as an array and the counts as fields, so
// nothing has to be recovered by parsing the human lines back apart.
if (jsonOutput) {
  console.log(JSON.stringify({
    tool: 'validate-consumer',
    consumer: root,
    ok: errors.length === 0,
    scanned: { documentationRoot: docsPath, files: files.length, pages },
    problems: errors,
    advisories,
  }, null, 2));
  process.exit(errors.length ? 1 : 0);
}
console.log(`Consumer: ${root}`);
console.log(`Files scanned: ${files.length} under ${docsPath}, frontmatter pages: ${pages}`);
console.log(languageSummary);
if (advisories.length) {
  // The count and the worst pages are in the Language line; --prose lists every measure.
  const proseNote = project.prose?.enforcement === 'report' ? `, reported because prose.enforcement is 'report'` : '';
  console.log(`\nADVISORY (${advisories.length} finding(s)${proseNote})`);
  if (process.argv.includes('--prose')) for (const a of advisories) console.log(`  - ${a}`);
}
if (errors.length) {
  console.log(`\nFAIL (${errors.length} problem(s)):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS: project configuration, page frontmatter, language and prose are valid.');
