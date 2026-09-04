#!/usr/bin/env node
// Reference consumer validator for the Agentic Engineering System.
//
// Validates every structured Specification Metadata block against the
// kind-discriminated schema and runs the cross-file checks that JSON Schema
// cannot prove. This is a reference implementation. A consumer may replace or
// extend it, but the checks below mirror the Verification lists in the
// core standards.
//
// Usage:
//   node tools/validate-consumer.mjs [consumerRoot]
//
// consumerRoot defaults to the current working directory. The consumer must
// contain standards.project.json. Exit code is non-zero when any check fails.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(process.argv[2] ?? '.');
const errors = [];
const err = (m) => errors.push(m);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---- locate consumer paths -------------------------------------------------
const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) {
  console.error(`No standards.project.json at ${root}`);
  process.exit(2);
}
const project = readJson(projectFile);
// The documentation root is configuration, not a constant. A hard-coded docs/
// scans nothing in a consumer that keeps its pages elsewhere, and a scan of
// nothing reports PASS. 'docs' stays the default because that is the layout the
// standards describe. (CORE.AUTHORING.METADATA.004)
const docsPath = project.paths?.docs ?? 'docs';
const docsRoot = path.join(root, docsPath);
const domainDocs = path.join(root, (project.paths?.domainDocs ?? 'docs/domain'));
// A configured path that does not resolve disables the checks that read it and
// leaves the run reporting PASS, so each message names the check that goes
// quiet. A typo in domainDocs is the expensive one.
const configuredPaths = [
  ['paths.docs', project.paths?.docs, 'the Markdown scan finds no specification to check'],
  ['paths.domainDocs', project.paths?.domainDocs, 'the use-case, workflow, and policy cross-file checks resolve nothing'],
  ['paths.uiDocs', project.paths?.uiDocs, 'the controlled UI page checks resolve nothing'],
  ['paths.apiSolution', project.paths?.apiSolution, 'the backend checks have no solution to read'],
];
for (const [field, value, consequence] of configuredPaths) {
  if (value === undefined) continue;
  if (typeof value !== 'string' || !value.trim()) { err(`standards.project.json: ${field} '${value}' is not a path`); continue; }
  if (!fs.existsSync(path.join(root, value))) err(`standards.project.json: ${field} '${value}' does not exist; ${consequence}`);
}
// Navigation and prose pages carry no structured metadata, so the project names
// the path prefixes that hold them. A declared prefix is a decision a reviewer
// can see and count; an undeclared page with no metadata block is a file nobody
// knows went unchecked. (CORE.AUTHORING.METADATA.004)
const declaredUnstructured = project.paths?.unstructuredDocs;
if (declaredUnstructured !== undefined && !Array.isArray(declaredUnstructured)) {
  err('standards.project.json: paths.unstructuredDocs must be an array of repository-relative paths');
}
const unstructuredDocs = [];
for (const entry of Array.isArray(declaredUnstructured) ? declaredUnstructured : []) {
  if (typeof entry !== 'string' || !entry.trim()) { err(`standards.project.json: paths.unstructuredDocs '${entry}' is not a path`); continue; }
  if (path.isAbsolute(entry) || entry.includes('..')) { err(`standards.project.json: paths.unstructuredDocs '${entry}' must be a repository-relative path`); continue; }
  if (!fs.existsSync(path.join(root, entry))) { err(`standards.project.json: paths.unstructuredDocs '${entry}' does not exist; correct the path or remove the exemption`); continue; }
  unstructuredDocs.push(entry.replace(/\\/g, '/').replace(/\/+$/, ''));
}
// A selection is either a bare id or an object recording the criterion that was
// met and the date it is next reviewed. Both forms resolve to one id here.
// (CORE.SCOPE.EXTENSIONS.001, CORE.SCOPE.EXTENSIONS.002)
const selections = (project.selectedExtensions ?? []).map((entry) => (
  typeof entry === 'string' ? { id: entry } : entry ?? {}
));
const selected = new Set(selections.map((entry) => entry.id));

// ---- optional manifest (for extension scope checks) ------------------------
let manifest = null;
for (const rel of ['standards/standards.manifest.json', '../standards.manifest.json']) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) { manifest = readJson(p); break; }
}
// The manifest names the id scopes whose overrides expire. A recorded override in
// one of those scopes activates the controlled UI validator.
const uiOverrideScopes = manifest?.overridePolicy?.requiresReviewBy ?? [];
// Adopting a release means accepting its complete contract, so the project
// records the release it reviewed. A mismatch means the pinned standards moved
// without anyone re-reading the overrides and provisions that now apply.
if (manifest?.version) {
  const reviewed = project.reviewedStandardsVersion;
  if (!reviewed) err(`standards.project.json: missing 'reviewedStandardsVersion'; the pinned standards are ${manifest.version}`);
  else if (reviewed !== manifest.version) {
    err(`standards.project.json: reviewedStandardsVersion '${reviewed}' does not match the pinned standards ${manifest.version}; re-review the contract and its overrides`);
  }
}

const extScope = new Map();       // id -> activationScope
const extKinds = new Map();       // id -> Set(applicableKinds)
if (manifest?.extensions) {
  for (const [id, def] of Object.entries(manifest.extensions)) {
    extScope.set(id, def.activationScope);
    if (def.applicableKinds) extKinds.set(id, new Set(def.applicableKinds));
  }
  // A selection is checked against the manifest, not only against itself.
  // applicableExtensions is compared to selectedExtensions further down, so two
  // consistent lists of ids that no longer exist would otherwise validate
  // cleanly through a release that renamed them. (CORE.SCOPE.EXTENSIONS.002)
  const known = [...extScope.keys()].sort();
  for (const id of selected) {
    if (!extScope.has(id)) {
      err(`standards.project.json: selectedExtensions '${id}' is not an extension in the pinned standards; known ids are ${known.join(', ')}`);
    }
  }
}

// An extension selected without a surface costs nothing to keep, so nobody
// removes it. A recorded review date makes the selection expire rather than
// accumulate. (CORE.PRINCIPLES.COMPLEXITY.002)
const today = new Date().toISOString().slice(0, 10);
for (const entry of selections) {
  if (!entry.reviewBy) continue;
  if (entry.reviewBy < today) {
    err(`standards.project.json: selectedExtensions '${entry.id}' was due for review on ${entry.reviewBy}; confirm the criterion still applies or remove the selection`);
  }
}

// ---- schema-equivalent kind rules ------------------------------------------
const ID = /^[a-z][a-z0-9-]*$/;
const REC = /^[a-z0-9][a-z0-9-]*$/;
const UC = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;
// Each pattern carries its shape in words. Regex source names character classes
// and not the convention, so an author who is shown one still guesses.
const FORM = new Map([
  [ID, "lower kebab-case, for example 'orders'"],
  [REC, "lower kebab-case with a letter or digit first, for example '0001-cancel-order'"],
  [UC, "'<module>.<name>' in lower kebab-case, for example 'orders.cancel-order'"],
]);
const SPEC = ['draft', 'approved', 'retired'];
const IMPL = ['planned', 'implemented', 'verified'];
const RISK = ['authorization', 'money', 'sensitive-data', 'irreversible', 'concurrency', 'durable-delivery', 'availability'];
const OPERATION_TYPES = ['command', 'query'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORM = 'YYYY-MM-DD';
const base = { kind: 1, id: 1, specStatus: 1, owner: 1, lastReviewed: 1 };
// One record owns each of these boundaries. A directory index that owns no
// boundary uses 'section-index', which may repeat.
const SINGLETON_KINDS = new Set(['product', 'domain-index', 'glossary', 'modules-index']);
const KINDS = {
  product: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: ID },
  'domain-index': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: ID },
  glossary: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: ID },
  'modules-index': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: ID },
  // A directory index that claims no implemented behavior and owns no aggregate,
  // use case, or policy. It carries the base fields and nothing else.
  'section-index': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: ID },
  module: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base, applicableExtensions: 1 }, id: ID },
  aggregate: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base, applicableExtensions: 1 }, id: UC },
  'use-case': { req: ['kind', 'id', 'specStatus', 'implementationStatus', 'owner', 'lastReviewed', 'operationType', 'actors', 'entryPoints', 'risks', 'applicableExtensions'], props: { ...base, implementationStatus: 1, operationType: 1, actors: 1, entryPoints: 1, risks: 1, applicableExtensions: 1 }, id: UC },
  'end-to-end-flow': { req: ['kind', 'id', 'specStatus', 'implementationStatus', 'owner', 'lastReviewed', 'useCases'], props: { ...base, implementationStatus: 1, useCases: 1, applicableExtensions: 1 }, id: ID },
  workflow: { req: ['kind', 'id', 'specStatus', 'implementationStatus', 'owner', 'lastReviewed', 'participatingModules', 'applicableExtensions'], props: { ...base, implementationStatus: 1, participatingModules: 1, applicableExtensions: 1 }, id: ID },
  'domain-policy': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed', 'appliesToModules'], props: { ...base, appliesToModules: 1, applicableExtensions: 1 }, id: ID },
  'decision-evidence': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: REC },
  'operating-limits': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: REC },
  page: { req: ['kind', 'id', 'specStatus', 'implementationStatus', 'owner', 'lastReviewed', 'app', 'route', 'useCases'], props: { ...base, implementationStatus: 1, app: 1, route: 1, useCases: 1, applicableExtensions: 1 }, id: UC },
  decision: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: REC },
  runbook: { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed'], props: { ...base }, id: REC },
  'release-record': { req: ['kind', 'id', 'specStatus', 'owner', 'lastReviewed', 'release'], props: { ...base, release: 1 }, id: REC },
};
const KIND_NAMES = Object.keys(KINDS);

// A consumer that rules a kind out in its own instructions still gets a clean
// PASS from the agent that writes one anyway, so the prohibition is advice. The
// declared list makes it a check. Each entry names a kind this file knows,
// because a misspelled entry prohibits nothing and reads as if it did.
const declaredProhibited = project.prohibitedKinds;
if (declaredProhibited !== undefined && !Array.isArray(declaredProhibited)) {
  err('standards.project.json: prohibitedKinds must be an array of specification kinds');
}
const prohibitedKinds = new Set();
for (const entry of Array.isArray(declaredProhibited) ? declaredProhibited : []) {
  if (typeof entry !== 'string' || !(entry in KINDS)) { err(`standards.project.json: prohibitedKinds '${entry}' is not a specification kind; expected one of ${KIND_NAMES.join(', ')}`); continue; }
  prohibitedKinds.add(entry);
}

// ---- collect files ---------------------------------------------------------
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
// consumer with no specification page does not exist; a root that resolves to
// nothing does.
if (!files.length) err(`Scanned no Markdown files under '${docsPath}'; check paths.docs, because a consumer with no specification is a misconfigured scan`);

const metas = []; // {rel, meta, file}
const singletons = new Map();     // kind -> [paths]
const acDefs = new Map();  // id -> [rel]
const e2eDefs = new Map(); // id -> [rel]
let uiOutput = '';

// Specification Metadata is a '---' delimited JSON block, per
// CORE.AUTHORING.METADATA.002. A file that carries a metadata object in any other
// wrapper, or carries none at all, is reported rather than skipped, because a
// silently skipped specification is an unvalidated specification: the run passes
// while that page sits unchecked beside every page that was checked.
// (CORE.AUTHORING.METADATA.004)
function parseBlock(raw, rel) {
  if (!raw.startsWith('---')) {
    const fenced = raw.slice(0, 2000).match(/```[a-z]*\s*\n\s*\{[\s\S]{0,400}?"kind"\s*:/);
    if (fenced) err(`${rel}: metadata block is not delimited by '---'`);
    else err(`${rel}: no metadata block; add one (a directory index that owns no aggregate, use case, or policy declares kind 'section-index') or declare the path in paths.unstructuredDocs`);
    return null;
  }
  const end = raw.indexOf('\n---', 3);
  if (end < 0) { err(`${rel}: unterminated metadata block`); return null; }
  try { return JSON.parse(raw.slice(3, end).trim()); }
  catch (e) { err(`${rel}: JSON parse error: ${e.message}`); return null; }
}

// A use-case file lives directly in its module directory, or in a single
// aggregate-root subdirectory of that module. See the module use-case
// grouping rule in the Agentic Engineering System page.
function useCaseFile(mod, name) {
  const flat = path.join(domainDocs, 'modules', mod, `${name}.md`);
  if (fs.existsSync(flat)) return flat;
  const modDir = path.join(domainDocs, 'modules', mod);
  if (fs.existsSync(modDir)) {
    for (const e of fs.readdirSync(modDir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue;
      const nested = path.join(modDir, e.name, `${name}.md`);
      if (fs.existsSync(nested)) return nested;
    }
  }
  return null;
}

for (const f of files) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const raw = fs.readFileSync(f, 'utf8');
  const hasMeta = raw.startsWith('---');

  // Research prose (Codex/Fable notes and indexes without a metadata block)
  // is not a structured specification, so skip it. A structured spec placed
  // under research/ (for example a decision-evidence record) still begins
  // with a metadata block and is validated like any other spec.
  if (/(^|\/)research\//.test(rel) && !hasMeta) continue;

  // acceptance and end-to-end id definitions (bracket form)
  for (const m of raw.matchAll(/\[(AC-[A-Z0-9-]+)\]/g)) (acDefs.get(m[1]) ?? acDefs.set(m[1], []).get(m[1])).push(rel);
  for (const m of raw.matchAll(/\[(E2E-[A-Z0-9-]+)\]/g)) (e2eDefs.get(m[1]) ?? e2eDefs.set(m[1], []).get(m[1])).push(rel);

  // internal link resolution
  const dir = path.dirname(f);
  for (const m of raw.matchAll(/\]\(([^)]+)\)/g)) {
    let href = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    href = href.split('#')[0];
    if (!href || (!href.endsWith('.md') && !href.endsWith('/'))) continue;
    if (!fs.existsSync(path.resolve(dir, href))) err(`${rel}: broken link -> ${m[1]}`);
  }

  // A declared unstructured path holds navigation or prose rather than a
  // specification, so the metadata block rule does not reach it. Its links are
  // still resolved above: a directory index is where a broken link costs most.
  if (!hasMeta && unstructuredDocs.some((prefix) => rel === prefix || rel.startsWith(`${prefix}/`))) continue;

  const meta = parseBlock(raw, rel);
  if (!meta) continue;
  metas.push({ rel, meta, file: f });

  const spec = KINDS[meta.kind];
  if (!spec) { err(`${rel}: unknown kind '${meta.kind}'; expected one of ${KIND_NAMES.join(', ')}`); continue; }
  if (prohibitedKinds.has(meta.kind)) err(`${rel}: kind '${meta.kind}' is prohibited by this consumer; standards.project.json lists it in prohibitedKinds`);
  for (const r of spec.req) if (!(r in meta)) err(`${rel}: missing required '${r}'`);
  for (const k of Object.keys(meta)) if (!(k in spec.props)) err(`${rel}: unknown property '${k}'`);
  if (meta.id !== undefined && !spec.id.test(meta.id)) err(`${rel}: id '${meta.id}' fails pattern; expected ${FORM.get(spec.id)}`);
  // A closed set names its members in the error. The vocabulary exists only in
  // this file, so an author told that a value is wrong and not which values are
  // right invents a plausible one, and the next author inherits it.
  if (meta.specStatus !== undefined && !SPEC.includes(meta.specStatus)) err(`${rel}: bad specStatus '${meta.specStatus}'; expected one of ${SPEC.join(', ')}`);
  if (meta.implementationStatus !== undefined && !IMPL.includes(meta.implementationStatus)) err(`${rel}: bad implementationStatus '${meta.implementationStatus}'; expected one of ${IMPL.join(', ')}`);
  if (meta.lastReviewed !== undefined && !DATE.test(meta.lastReviewed)) err(`${rel}: bad lastReviewed '${meta.lastReviewed}'; expected ${DATE_FORM}`);
  if (meta.operationType !== undefined && !OPERATION_TYPES.includes(meta.operationType)) err(`${rel}: bad operationType '${meta.operationType}'; expected one of ${OPERATION_TYPES.join(', ')}`);
  if (Array.isArray(meta.risks)) for (const r of meta.risks) if (!RISK.includes(r)) err(`${rel}: bad risk '${r}'; expected one of ${RISK.join(', ')}`);
  for (const a of ['actors', 'entryPoints', 'applicableExtensions']) if (Array.isArray(meta[a])) for (const v of meta[a]) if (!ID.test(v)) err(`${rel}: bad ${a} id '${v}'; expected ${FORM.get(ID)}`);
  for (const a of ['useCases']) if (Array.isArray(meta[a])) { if (!meta[a].length) err(`${rel}: ${a} empty`); for (const v of meta[a]) if (!UC.test(v)) err(`${rel}: bad ${a} id '${v}'; expected ${FORM.get(UC)}`); }
  for (const a of ['participatingModules', 'appliesToModules']) if (Array.isArray(meta[a])) { if (!meta[a].length) err(`${rel}: ${a} empty`); for (const v of meta[a]) if (!ID.test(v)) err(`${rel}: bad ${a} id '${v}'; expected ${FORM.get(ID)}`); }

  if (SINGLETON_KINDS.has(meta.kind)) {
    if (!singletons.has(meta.kind)) singletons.set(meta.kind, []);
    singletons.get(meta.kind).push(rel);
  }
  if (meta.kind === 'end-to-end-flow') {
    for (const uc of meta.useCases ?? []) { const [mod, name] = uc.split('.'); if (!useCaseFile(mod, name)) err(`${rel}: useCase '${uc}' has no file`); }
  }
  if (meta.kind === 'workflow') for (const mod of meta.participatingModules ?? []) if (!fs.existsSync(path.join(domainDocs, 'modules', mod))) err(`${rel}: participatingModule '${mod}' has no module dir`);
  if (meta.kind === 'domain-policy') for (const mod of meta.appliesToModules ?? []) if (!fs.existsSync(path.join(domainDocs, 'modules', mod))) err(`${rel}: appliesToModule '${mod}' has no module dir`);
  if (meta.kind === 'use-case') {
    const [mod, name] = String(meta.id).split('.');
    // A use-case file sits directly in its module directory, or in one
    // aggregate-root subdirectory of that module.
    const parts = path.relative(path.join(domainDocs, 'modules'), f).replace(/\\/g, '/').split('/');
    const okFlat = parts.length === 2 && parts[0] === mod && parts[1] === `${name}.md`;
    const okNested = parts.length === 3 && parts[0] === mod && parts[2] === `${name}.md`;
    if (!okFlat && !okNested) err(`${rel}: use-case id '${meta.id}' does not match its path`);
  }
  if (meta.kind === 'aggregate') {
    const [mod, agg] = String(meta.id).split('.');
    // An aggregate README is the README.md of an aggregate-root subdirectory:
    // modules/<module>/<aggregate-plural>/README.md, id '<module>.<aggregate-plural>'.
    const parts = path.relative(path.join(domainDocs, 'modules'), f).replace(/\\/g, '/').split('/');
    const ok = parts.length === 3 && parts[0] === mod && parts[1] === agg && parts[2] === 'README.md';
    if (!ok) err(`${rel}: aggregate id '${meta.id}' does not match its path`);
  }
  // extension scope checks
  if (Array.isArray(meta.applicableExtensions) && extScope.size) {
    for (const id of meta.applicableExtensions) {
      if (!selected.has(id)) err(`${rel}: applicableExtensions '${id}' is not in selectedExtensions`);
      if (extScope.get(id) === 'project') err(`${rel}: project-scoped extension '${id}' must not be listed in local metadata`);
      const kinds = extKinds.get(id);
      if (kinds && !kinds.has(meta.kind)) err(`${rel}: extension '${id}' is not applicable to kind '${meta.kind}'`);
    }
  }
}

// ---- aggregate cross-file checks -------------------------------------------
// A second domain index, glossary, or modules index is a duplicate authority
// for one boundary. Only product had been counted, so the other three could be
// repeated or misapplied to an unrelated directory. (CORE.PRINCIPLES.SOURCE.001)
for (const kind of SINGLETON_KINDS) {
  const found = singletons.get(kind) ?? [];
  if (found.length === 1) continue;
  if (!found.length) {
    if (kind === 'product') err(`Expected exactly one ${kind} specification, found 0`);
    continue;
  }
  err(`Expected at most one ${kind} specification, found ${found.length}: ${found.join(', ')}`);
}
for (const [id, locs] of acDefs) if (locs.length > 1) err(`Duplicate acceptance id ${id} defined in: ${locs.join(', ')}`);
for (const [id, locs] of e2eDefs) if (locs.length > 1) err(`Duplicate end-to-end test id ${id} defined in: ${locs.join(', ')}`);

// Every frontend declares its platform. Without the field a React web frontend
// silently skips the whole FRONTEND.UI contract, and the omission is
// indistinguishable from a considered decision. A consumer that is not ready for
// the contract declares 'other-web' or records an override, which is a visible
// statement. (FRONTEND.UI.GOVERNANCE.001)
const PLATFORMS = ['react-web', 'react-native', 'other-web'];
for (const frontend of project.paths?.frontends ?? []) {
  const name = frontend?.name ?? '(unnamed)';
  // A declared frontend whose directory is absent reads as a frontend with no
  // code, and every UI check for it passes by having nothing to read.
  if (frontend?.path !== undefined && !fs.existsSync(path.join(root, frontend.path))) {
    err(`standards.project.json: frontend '${name}' path '${frontend.path}' does not exist; the controlled UI checks for that frontend read nothing`);
  }
  if (!frontend?.platform) {
    err(`standards.project.json: frontend '${name}' declares no 'platform'; one of ${PLATFORMS.join(', ')} is required`);
  } else if (!PLATFORMS.includes(frontend.platform)) {
    err(`standards.project.json: frontend '${name}' has unknown platform '${frontend.platform}'; expected one of ${PLATFORMS.join(', ')}`);
  }
}

// A React web consumer opts into the deterministic UI validator through its
// frontend platform declaration or UI block. A recorded UI rule override must
// carry a live review date.
const uiActivated = (project.paths?.frontends ?? []).some((frontend) => frontend.ui || frontend.platform === 'react-web')
  || (project.overrides ?? []).some((override) => uiOverrideScopes.some((scope) => String(override?.provisionId ?? '').startsWith(`${scope}.`)));
if (uiActivated) {
  // Resolve the sibling validator from this file so a consumer may pin the
  // standards repository at a path other than 'standards/'.
  const uiValidator = path.join(path.dirname(fileURLToPath(import.meta.url)), 'validate-ui.mjs');
  if (fs.existsSync(uiValidator)) {
    const result = spawnSync(process.execPath, [uiValidator, root], { encoding: 'utf8' });
    uiOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    if (result.status !== 0) err('controlled UI validation failed; see the UI validator output above');
  } else {
    err(`controlled UI configuration is present but the UI validator is missing at ${uiValidator}`);
  }
}

// ---- report ----------------------------------------------------------------
console.log(`Consumer: ${root}`);
console.log(`Files scanned: ${files.length} under ${docsPath}, metadata blocks: ${metas.length}`);
console.log(`Acceptance ids: ${acDefs.size}, end-to-end test ids: ${e2eDefs.size}`);
if (uiOutput) console.log(`\n${uiOutput}`);
if (errors.length) {
  console.log(`\nFAIL (${errors.length} problem(s)):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS: metadata valid, links resolve, cross-file references consistent.');
