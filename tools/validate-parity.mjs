#!/usr/bin/env node
// Reference validator for parity between Application code and use-case specifications.
//
// The consumer validator proves that specification metadata is well formed and
// that its references resolve. It never opens the code, so two populations can
// drift apart without any check noticing: a handler nobody specified reads as a
// reviewed feature and is not one, and a specification nobody implemented states
// a plan in the present tense. This validator compares both populations in both
// directions. (CORE.SYSTEM.COVERAGE.001)
//
// The validator is local and deterministic. It reads the consumer configuration,
// the Application project tree, and the
// specification metadata blocks under 'paths.domainDocs'. It runs no build,
// loads no compiler, and fetches nothing.
//
// Usage:
//   node standards/tools/validate-parity.mjs [consumerRoot] [--report]
//
// consumerRoot defaults to the current working directory. The consumer must
// contain standards.project.json. Exit code is non-zero when any check fails.
//
// '--report' prints the same findings and exits 0, for a consumer burning down an
// existing gap. It is a command-line flag rather than a configuration field, so a
// suppressed run stays visible in the command that produced it instead of
// becoming a setting nobody re-reads.
//
// Optional configuration is the 'parity' block of standards.project.json, so one
// file configures every validator. Every field is optional and every default is
// empty:
//
//   "parity": {
//     "applicationProject": "apps/api/src/Acme.Application",
//     "ignoreHandlers": ["apps/api/src/Acme.Application/Shared/**"],
//     "ignoreUseCases": ["sales.import-legacy-orders"]
//   }
//
// 'applicationProject' names the Application project directory when discovery
// cannot choose one. 'ignoreHandlers' holds consumer-root-relative glob patterns
// for handler files that carry no use-case specification by decision.
// 'ignoreUseCases' holds specification ids implemented outside the Application
// project. Each entry is consumer-specific, which is why it lives in the
// consumer's own configuration rather than in this tool.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const reportOnly = args.includes('--report');
const positional = args.filter((value) => !value.startsWith('-'));
const unknown = args.filter((value) => value.startsWith('-') && value !== '--report');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error('Usage: node validate-parity.mjs [consumerRoot] [--report]');
  process.exit(2);
}

const root = path.resolve(positional[0] ?? '.');
const findings = [];
const finding = (message) => findings.push(message);

const slash = (value) => value.split(path.sep).join('/');
const relativeToRoot = (file) => slash(path.relative(root, file));

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (cause) {
    console.error(`${label}: cannot parse JSON (${cause.message})`);
    process.exit(2);
  }
}

// ---- consumer configuration -------------------------------------------------
const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) {
  console.error(`No standards.project.json at ${root}`);
  process.exit(2);
}
const project = readJson(projectFile, 'standards.project.json');

const parity = project.parity ?? {};
const ignoredHandlerPatterns = Array.isArray(parity.ignoreHandlers) ? parity.ignoreHandlers : [];
const ignoredUseCases = new Set(Array.isArray(parity.ignoreUseCases) ? parity.ignoreUseCases : []);

// A consumer with no backend omits the solution path and records the decision
// that names the baseline rules left without a surface. Parity has nothing to
// compare then, so the run states the skipped scope rather than passing
// silently. (CORE.SCOPE.BACKEND.001)
if (!project.paths?.apiSolution) {
  console.log(`Consumer: ${root}`);
  console.log("PASS: the project declares no 'paths.apiSolution'; use-case parity checking is not activated.");
  process.exit(0);
}

// ---- locate the Application project ----------------------------------------
const IGNORED_DIRECTORIES = new Set(['bin', 'obj', 'node_modules']);

function directories(from, depth, result = []) {
  if (depth < 0 || !fs.existsSync(from)) return result;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (!entry.isDirectory() || IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) continue;
    const candidate = path.join(from, entry.name);
    result.push(candidate);
    directories(candidate, depth - 1, result);
  }
  return result;
}

// The Application project is found by directory convention rather than by
// reading the solution file. A consumer's solution is '.sln' or '.slnx', two
// unrelated formats, and neither one records which project holds the use cases.
// The directory that actually holds the handlers is the thing being scanned, so
// locating it directly also survives a project entry the solution never updated.
// (BACKEND.ARCHITECTURE.MODULE.001)
function locateApplicationProject() {
  if (parity.applicationProject) {
    const configured = path.resolve(root, parity.applicationProject);
    if (!fs.existsSync(configured)) {
      console.error(`standards.project.json: parity.applicationProject does not exist '${parity.applicationProject}'`);
      process.exit(2);
    }
    return configured;
  }
  const solution = path.resolve(root, project.paths.apiSolution);
  const solutionRoot = fs.existsSync(solution) && fs.statSync(solution).isDirectory() ? solution : path.dirname(solution);
  const candidates = directories(solutionRoot, 3).filter((candidate) => (
    /\.Application$/i.test(path.basename(candidate))
    && fs.readdirSync(candidate).some((name) => name.endsWith('.csproj'))
  ));
  if (candidates.length === 1) return candidates[0];
  if (!candidates.length) {
    console.error(`No '*.Application' project directory under ${relativeToRoot(solutionRoot)}; name one in standards.project.json 'parity.applicationProject'`);
  } else {
    console.error(`Several '*.Application' project directories under ${relativeToRoot(solutionRoot)}: ${candidates.map(relativeToRoot).join(', ')}; name one in standards.project.json 'parity.applicationProject'`);
  }
  process.exit(2);
}

const applicationProject = locateApplicationProject();

// ---- naming -----------------------------------------------------------------
// PascalCase folder name to kebab-case specification id. The two passes run in
// this order on purpose. The first keeps an acronym run attached to its own
// segment and starts a new one at the following word, so 'ReadCSVImport' becomes
// 'ReadCSV-Import'. The second breaks every remaining lower-to-upper and
// digit-to-upper boundary, so 'RegisterWebhookEndpoint' becomes
// 'register-webhook-endpoint' and 'ImportV2Feed' becomes 'import-v2-feed' rather
// than splitting the version number away from its letter. This mapping is the
// one place where a rename in code silently stops matching a page, so a consumer
// that renames a folder reads the reported id before assuming the page is gone.
function kebab(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

// Ignore patterns accept '*' inside one path segment and '**' across segments,
// so a consumer can exclude a whole folder without listing every file in it.
// A trailing '/**' also matches the folder's own direct children, so an
// exclusion does not depend on how deeply the excluded tree happens to nest.
function globToRegExp(pattern) {
  let body = '';
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character !== '*') {
      body += character.replace(/[.+^${}()|[\]\\?]/, '\\$&');
      continue;
    }
    if (pattern[index + 1] !== '*') {
      body += '[^/]*';
      continue;
    }
    const separated = pattern[index + 2] === '/';
    body += separated ? '(?:.*/)?' : '.*';
    index += separated ? 2 : 1;
  }
  return new RegExp(`^${body}$`);
}

const ignoredHandlers = ignoredHandlerPatterns.map(globToRegExp);

// ---- collect handlers -------------------------------------------------------
function walk(directory, predicate, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    // Compiler output holds a copy of the source tree under another path, so
    // scanning it counts every handler twice. A dot directory holds tool state
    // rather than authored source.
    if (IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(candidate, predicate, result);
    else if (predicate(candidate)) result.push(candidate);
  }
  return result;
}

// A reaction runs after a fact another use case already recorded. It is recorded
// separately from the use case that raised the event, so it carries no use-case
// specification of its own and is not counted here. (CORE.SYSTEM.REACTION.001)
const isReaction = (name) => /Reaction(Handler)?\.cs$/.test(name);

const handlerFiles = walk(applicationProject, (file) => {
  const name = path.basename(file);
  return name.endsWith('Handler.cs') && !isReaction(name);
}).filter((file) => !ignoredHandlers.some((pattern) => pattern.test(relativeToRoot(file))));

// Each operation owns one folder under its module, and the module and aggregate
// directories above it carry the same names as the specification tree. The
// specification id is '<module>.<use-case>': the aggregate segment groups
// operations in code but does not appear in the id, because a use case that
// reads across roots belongs to a module rather than to one root.
// (BACKEND.APPLICATION.STRUCTURE.001, BACKEND.APPLICATION.CONVENTION.001)
const derived = new Map(); // id -> [handler file]
for (const file of handlerFiles) {
  const segments = slash(path.relative(applicationProject, file)).split('/');
  if (segments.length < 3) {
    // The operation folder is what names the use case. A handler sitting
    // directly in a module or aggregate directory names nothing, and skipping it
    // would hide it from both directions of this check.
    finding(`handler outside an operation folder: ${relativeToRoot(file)}`);
    continue;
  }
  const id = `${kebab(segments[0])}.${kebab(segments[segments.length - 2])}`;
  if (!derived.has(id)) derived.set(id, []);
  derived.get(id).push(file);
}

// One specification cannot resolve back to two handlers, so two operation
// folders that reduce to the same id are reported rather than counted as
// covered. This happens when two aggregates in one module name an operation
// identically. (CORE.SYSTEM.COVERAGE.001)
for (const [id, files] of derived) {
  if (files.length > 1) finding(`duplicate specification id '${id}' derived from: ${files.map(relativeToRoot).join(', ')}`);
}

// ---- collect use-case specifications ---------------------------------------
// Specification Metadata is a '---' delimited JSON block, per
// CORE.AUTHORING.METADATA.002. A page whose block does not parse is reported by
// the consumer validator, so it is skipped here rather than reported twice.
function metadata(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return null;
  try {
    return JSON.parse(raw.slice(3, end).trim());
  } catch {
    return null;
  }
}

const domainDocs = path.join(root, project.paths?.domainDocs ?? 'docs/domain');
const specifications = new Map(); // id -> {file, implementationStatus}
for (const file of walk(domainDocs, (candidate) => candidate.endsWith('.md'))) {
  const meta = metadata(file);
  if (meta?.kind !== 'use-case' || typeof meta.id !== 'string') continue;
  specifications.set(meta.id, { file, implementationStatus: meta.implementationStatus });
}

// ---- compare both directions ------------------------------------------------
for (const [id, files] of derived) {
  if (specifications.has(id) || ignoredUseCases.has(id)) continue;
  for (const file of files) finding(`handler with no specification: ${relativeToRoot(file)} -> ${id}`);
}

// Parity binds an implemented use case. A 'planned' specification describes work
// that has not been built, so it is expected to have no handler and reporting it
// would turn correct authoring into a finding.
// (CORE.SYSTEM.COVERAGE.001, CORE.SYSTEM.USECASE.002)
let planned = 0;
for (const [id, spec] of specifications) {
  if (spec.implementationStatus === 'planned') {
    planned += 1;
    continue;
  }
  if (derived.has(id) || ignoredUseCases.has(id)) continue;
  finding(`specification with no handler: ${relativeToRoot(spec.file)}`);
}

// ---- report -----------------------------------------------------------------
console.log(`Consumer: ${root}`);
console.log(`Application project: ${relativeToRoot(applicationProject)}`);
console.log(`Handlers: ${handlerFiles.length}, use-case specifications: ${specifications.size}`);
// A skipped population reads as a conforming one unless the run names it.
if (planned) console.log(`Specifications not yet implemented: ${planned}`);
if (ignoredHandlerPatterns.length || ignoredUseCases.size) {
  console.log(`Configured exclusions: ${ignoredHandlerPatterns.length} handler pattern(s), ${ignoredUseCases.size} specification id(s)`);
}
if (findings.length && reportOnly) {
  console.log(`\nREPORT (${findings.length} finding(s)):`);
  for (const item of findings) console.log(`  - ${item}`);
  console.log("\nExit code is 0 because '--report' was passed. The default run fails on these findings.");
  process.exit(0);
}
if (findings.length) {
  console.log(`\nFAIL (${findings.length} problem(s)):`);
  for (const item of findings) console.log(`  - ${item}`);
  process.exit(1);
}
console.log('\nPASS: every Application use case has a specification and every implemented specification has a handler.');
