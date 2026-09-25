#!/usr/bin/env node
// Cross-references consumer specification identifiers with the code elements
// that mark them.
//
// The consumer validator proves that specification metadata is well formed and
// resolves its links. The parity validator proves that every use-case page has a
// handler. Neither one opens the marking tags that tie a specification identifier
// to the code element that implements it, so a page can name an invariant no
// handler enforces, and a handler can cite a use case no page declares, with both
// runs green. This validator compares the two populations in both directions.
// (standards/rule/core-system.documentation-and-code-change-together,
// standards/rule/backend-identifiers.state-the-identifier-grammar)
//
// The validator is local and deterministic. It reads the consumer configuration,
// the specification pages under 'paths.domainDocs', the C# source under the
// configured code roots, and the Reqnroll feature files. It runs no build, loads
// no compiler, and fetches nothing.
//
// Usage:
//   node standards/tools/validate-spec-sync.mjs [consumerRoot] [--report] [--format=json] [--help]
//
// consumerRoot defaults to the current working directory. The consumer must
// contain standards.project.json. Exit code is non-zero when any check fails.
//
// '--report' prints the same findings and exits 0, for a consumer burning down an
// existing gap. It is a command-line flag rather than a configuration field, so a
// suppressed run stays visible in the command that produced it.
//
// Optional configuration is the 'specSync' block of standards.project.json:
//
//   "specSync": {
//     "codeRoots": ["apps/api/src", "apps/api/tests"],
//     "markedRoots": ["apps/api/src/Entro.Domain", "apps/api/src/Entro.Application", "apps/api/src/Entro.WebApi", "apps/api/tests"],
//     "featureRoots": ["apps/api/tests/Entro.Acceptance.Tests/Features"],
//     "evidenceRoots": ["apps/admin", "apps/storefront", "apps/scanner", "apps/control-panel"]
//   }
//
// 'codeRoots' names the directories whose C# files are read for markup tags.
// 'markedRoots' names the directories whose type-declaring files must carry one,
// defaulting to the domain, application, and API projects plus every test root.
// 'featureRoots' names the directories holding Reqnroll feature files.
// 'evidenceRoots' names the frontend directories whose test files are read for
// acceptance-criterion and path citations, defaulting to every path in
// project.paths.frontends. A browser test cites a criterion the same way a
// <covers> tag or an '@implements_' tag does, so a UI criterion resolves when a
// frontend test names it. A browser test cites a path by opening its title with
// '[path/<id>]'. Only test files under those roots are read.
//
// The marking grammar this validator enforces is one identifier per XML doc tag:
//
//   /// <implements>entro/use-case/orders.place-order</implements>
//   /// <emits>entro/event/order.placed</emits>
//   /// <uses>entro/event/payment.taken</uses>
//   /// <enforces>entro/invariant/order.placed-once</enforces>
//   /// <covers>entro/acceptance-criterion/orders.place-order.places-the-order</covers>
//
// A tag is a single-line XML doc comment. Its value is one identifier, or several
// separated by whitespace. The identifier may carry the 'entro/' source prefix or
// omit it, because a citation inside Entro's own source is a same-source citation.
// A citation prefixed with any other source is foreign and is not Entro's to
// reconcile. The kinds are the twelve in docs/backend/identifiers.md plus 'value',
// the marking-only kind a closed-set value case carries.
//
// A Reqnroll scenario carries the same citation in a tag with '/' replaced by '_'
// and the prefix 'implements_':
//
//   @implements_entro_acceptance-criterion_orders.place-order.places-the-order
//
// A test proves the use case its 'covers' identifier names. An acceptance
// criterion names '<module>.<use-case>.<topic>', so a test that covers one proves
// that use case, and an invariant enforced by that use case is then proven.
//
// A path is proven per path when the use case's criteria name paths. A criterion
// names the path it proves in the form
//
//   - [acceptance-criterion/<id>] (path/<id>) <text>
//
// and a path is then proven when a test cites it directly, or when a test covers
// a criterion that names it. A use case whose criteria name no path keeps
// use-case-level proof: a test on any criterion proves every path. The run
// reports each use case relying on that proof rather than refusing it.
// (standards/rule/backend-identifiers.prove-each-named-path-through-a-test)
//
// A file must carry a tag when it declares an element the marking convention
// names: a command, query, handler, validator, authorizer, domain event, domain
// exception, aggregate root, or API endpoint. The declaration is matched by its
// type name. A port, an option, a shared value object, and the host's wiring
// declare none of those, so the validator does not ask them for a tag. A test is
// asked only when it cites an identifier a specification page resolves, because
// a pure unit test proves nothing a page depends on.
//
// An API endpoint mapped with '.ExcludeFromDescription()' is the one endpoint the
// validator does not ask for a tag. That call keeps the route out of the published
// contract, so no use-case page can be its specification and no identifier it
// might carry could resolve. Development-only tooling uses the marker for exactly
// that reason. Every endpoint without it is still asked for a tag.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const USAGE = `Usage: node standards/tools/validate-spec-sync.mjs [consumerRoot] [--report] [--format=json] [--help]

Cross-references the specification identifiers a consumer declares with the code
elements that mark them, for the consumer at consumerRoot, which defaults to the
current directory. The consumer must contain standards.project.json.

  --report        List findings and exit 0 instead of failing on them.
  --format=json   Write one JSON object on stdout instead of human-readable lines.
  --help          Print this text and exit.

Exit codes: 0 no finding or --report, 1 at least one finding, 2 usage error.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
const reportOnly = args.includes('--report');
const jsonOutput = args.includes('--format=json');
const positional = args.filter((value) => !value.startsWith('-'));
const unknown = args.filter((value) => value.startsWith('-') && value !== '--report' && value !== '--format=json');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error(USAGE);
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

// ---- the identifier grammar ------------------------------------------------
// The kinds and their forms live in the standards page this tool ships beside, so
// a release that adds a kind flows into the validator without a second list. The
// tool falls back to the built-in list when the page is absent, which is the case
// only for a copy taken outside the standards repository.
// (standards/rule/backend-identifiers.name-the-kind-with-a-full-english-word)
const STANDARDS_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCHEME_PAGE = path.join(STANDARDS_ROOT, 'docs', 'backend', 'identifiers.md');
const SCHEME_FALLBACK_KINDS = [
  'aggregate', 'event', 'exception', 'failure', 'use-case', 'path',
  'invariant', 'validation', 'authorization', 'acceptance-criterion', 'policy', 'rule',
];
// 'value' is not one of the twelve element kinds. It is the marking-only kind a
// closed-set value case carries, named by the marking convention rather than by
// the scheme. (standard/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
const MARKING_ONLY_KINDS = ['value'];

function readSchemeKinds() {
  try {
    const text = fs.readFileSync(SCHEME_PAGE, 'utf8');
    const found = new Set();
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\|\s*`([a-z][a-z-]*)`\s*\|/);
      if (match && SCHEME_FALLBACK_KINDS.includes(match[1])) found.add(match[1]);
    }
    if (found.size) {
      return { kinds: [...found].sort(), source: slash(path.relative(STANDARDS_ROOT, SCHEME_PAGE)) };
    }
  } catch {
    // A copied tool outside the standards repository keeps working on the
    // built-in list rather than failing to start.
  }
  return { kinds: [...SCHEME_FALLBACK_KINDS].sort(), source: null };
}

const scheme = readSchemeKinds();
const ALL_KINDS = [...new Set([...scheme.kinds, ...MARKING_ONLY_KINDS])];
const ALL_KIND_SET = new Set(ALL_KINDS);
// Kinds whose element is realised by a code element. A failure, a path, a policy,
// and a rule are cited in prose and carry no <implements> tag, so requiring code
// for them would report a correct page.
const CODE_KINDS = new Set([
  'aggregate', 'event', 'exception', 'use-case',
  'invariant', 'validation', 'authorization', 'acceptance-criterion',
]);

// A longer alternative is tried first so a kind that is a prefix of another never
// matches the shorter word and leaves the remaining characters to the body.
const KIND_ALT = [...ALL_KINDS].sort((a, b) => b.length - a.length).join('|');
const SOURCE_SEGMENT = '[a-z][a-z0-9-]*';
const IDENT_BODY = '[a-z][a-z0-9_-]*(?:\\.[a-z][a-z0-9_-]*)*';
const IDENT_EXPRESSION = `(?:${SOURCE_SEGMENT}\\/)?(?:${KIND_ALT})\\/${IDENT_BODY}`;
// The boundary guards stop a match inside a longer path segment or a URL, where a
// slash or a dot would otherwise let 'event/' read as a kind.
const IDENT_GLOBAL = new RegExp(`(?<![A-Za-z0-9_\\/.-])${IDENT_EXPRESSION}(?![A-Za-z0-9_\\/.-])`, 'g');

// An identifier is '<kind>/<body>' or '<source>/<kind>/<body>'. The body carries
// no slash, so the part count names which form this is.
function parseCitation(token) {
  const parts = String(token).split('/');
  if (parts.length === 2) return { source: null, kind: parts[0], body: parts[1] };
  if (parts.length === 3) return { source: parts[0], kind: parts[1], body: parts[2] };
  return null;
}

// A bare identifier is one Entro owns. A citation from Entro to Entro may carry
// the 'entro/' source prefix or omit it. A citation from another source is not
// this repository's to reconcile and resolves to null.
// (standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form)
function bareIdentifier(token) {
  const parsed = parseCitation(token);
  if (!parsed || !ALL_KIND_SET.has(parsed.kind)) return null;
  if (parsed.source && parsed.source !== 'entro') return null;
  return `${parsed.kind}/${parsed.body}`;
}

function scanIdentifiers(text) {
  const found = [];
  for (const match of String(text).matchAll(IDENT_GLOBAL)) {
    const bare = bareIdentifier(match[0]);
    if (bare) found.push(bare);
  }
  return found;
}

// ---- locate the consumer ---------------------------------------------------
const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) {
  console.error(`No standards.project.json at ${root}`);
  process.exit(2);
}
const project = readJson(projectFile, 'standards.project.json');
const specSync = project.specSync ?? {};

const IGNORED_DIRECTORIES = new Set(['bin', 'obj', 'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage']);
// A generated code-behind file beside a feature carries no authored class and no
// tag. A designer or global-usings file is the same. Reading one as unmarked
// source reports a defect nobody can fix.
const GENERATED = /\.(feature|g|designer|assemblyinfo)\.cs$/i;

function walk(directory, predicate, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(candidate, predicate, result);
    else if (predicate(candidate)) result.push(candidate);
  }
  return result;
}

const domainDocs = path.join(root, project.paths?.domainDocs ?? 'docs/domain');
const configuredCodeRoots = Array.isArray(specSync.codeRoots) && specSync.codeRoots.length
  ? specSync.codeRoots
  : ['apps/api/src', 'apps/api/tests'];
const testRoots = Array.isArray(project.paths?.testRoots) && project.paths.testRoots.length
  ? project.paths.testRoots
  : ['apps/api/tests'];
const configuredMarkedRoots = Array.isArray(specSync.markedRoots) && specSync.markedRoots.length
  ? specSync.markedRoots
  : ['apps/api/src/Entro.Domain', 'apps/api/src/Entro.Application', 'apps/api/src/Entro.WebApi', ...testRoots];
const configuredFeatureRoots = Array.isArray(specSync.featureRoots) && specSync.featureRoots.length
  ? specSync.featureRoots
  : ['apps/api/tests/Entro.Acceptance.Tests/Features'];
// A frontend citation lives in the browser test that proves the criterion, so
// the default is every frontend the consumer declares rather than a fixed path.
// The roots read only test files, because a criterion recorded in an acceptance
// record beside a route is a plan, not a test.
const configuredEvidenceRoots = Array.isArray(specSync.evidenceRoots) && specSync.evidenceRoots.length
  ? specSync.evidenceRoots
  : (Array.isArray(project.paths?.frontends) ? project.paths.frontends.map((frontend) => frontend?.path).filter(Boolean) : []);

const markedRoots = configuredMarkedRoots.map((value) => slash(value).replace(/\/+$/, ''));
const isMarked = (relative) => markedRoots.some((prefix) => relative === prefix || relative.startsWith(`${prefix}/`));

// ---- collect specification identifiers -------------------------------------
const specPages = [];
const declaredIds = new Set();       // metadata id any page states
const declaredMeta = new Map();      // id -> metadata, for the planned and retired exemptions
const citedIds = new Set();          // any identifier a page cites in prose or a table

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

// A fenced block holds an example rather than a declaration, so its identifiers
// are not specs to reconcile. (standards/rule/backend-identifiers.state-the-identifier-grammar)
function stripFences(text) {
  let inside = false;
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { inside = !inside; out.push(''); continue; }
    out.push(inside ? '' : line);
  }
  return out.join('\n');
}

for (const file of walk(domainDocs, (candidate) => candidate.endsWith('.md'))) {
  const rel = relativeToRoot(file);
  if (path.basename(file) === 'identifiers-tombstones.md') continue;
  const isMapping = rel === 'docs/domain/identifiers-mapping.md';
  if (!isMapping) specPages.push(file);
  const meta = metadata(file);
  if (meta && typeof meta.id === 'string') {
    const id = bareIdentifier(meta.id);
    if (id) {
      declaredIds.add(id);
      declaredMeta.set(id, meta);
    }
  }
  const identifiers = scanIdentifiers(stripFences(fs.readFileSync(file, 'utf8')));
  for (const id of identifiers) {
    // The mapping is a generated migration index. Its current exception
    // identifiers are declarations; its historical acceptance and invariant
    // rows are not active specifications.
    if (!isMapping || id.startsWith('exception/') || id.startsWith('event/')) citedIds.add(id);
  }
}

const retiredIds = new Set();
const tombstoneFile = path.join(domainDocs, 'identifiers-tombstones.md');
if (fs.existsSync(tombstoneFile)) {
  for (const match of fs.readFileSync(tombstoneFile, 'utf8').matchAll(/^-\s*`([^`]+)`\s*->/gm)) retiredIds.add(match[1]);
}
const specIds = new Set([...declaredIds, ...citedIds].filter((id) => !retiredIds.has(id)));

// ---- criterion-to-path form ------------------------------------------------
// A criterion line names the path it proves in parentheses after its own
// identifier. The path belongs to the criterion's use case, so a path of another
// use case is reported rather than counted as proof.
// (standards/rule/backend-identifiers.name-a-path-of-the-criterions-own-use-case)
const CRITERION_PATH = new RegExp(`^\\s*[-*]\\s+\\[(${IDENT_EXPRESSION})\\]\\s*\\((${IDENT_EXPRESSION})\\)`);
const criterionPaths = new Map();     // acceptance-criterion id -> path id
const pathNamingUseCases = new Set(); // '<module>.<use-case>' whose criteria name a path

function useCaseOf(id) {
  const parsed = parseCitation(id);
  if (!parsed) return null;
  const segments = parsed.body.split('.');
  return segments.length >= 2 ? `${segments[0]}.${segments[1]}` : null;
}

for (const file of specPages) {
  const rel = relativeToRoot(file);
  for (const line of stripFences(fs.readFileSync(file, 'utf8')).split('\n')) {
    const match = line.match(CRITERION_PATH);
    if (!match) continue;
    const criterion = bareIdentifier(match[1]);
    const named = bareIdentifier(match[2]);
    if (!criterion || !named || !criterion.startsWith('acceptance-criterion/') || !named.startsWith('path/')) continue;
    if (useCaseOf(criterion) !== useCaseOf(named)) {
      finding(`criterion names a path of another use case: ${rel}: ${criterion} names ${named}`);
      continue;
    }
    criterionPaths.set(criterion, named);
    pathNamingUseCases.add(useCaseOf(criterion));
  }
}

// ---- collect code markings -------------------------------------------------
const codeFiles = [];
const seen = new Set();
for (const configured of configuredCodeRoots) {
  for (const file of walk(path.join(root, configured), (candidate) => candidate.endsWith('.cs') && !GENERATED.test(path.basename(candidate)))) {
    const key = path.resolve(file);
    if (seen.has(key)) continue;
    seen.add(key);
    codeFiles.push(file);
  }
}
codeFiles.sort();

const TAG_LINE = /^\s*\/\/\//;
const TAG = /<(implements|emits|uses|enforces|covers)>([^<]*)<\/\1>/g;
const RECORD_DERIVATION = /\brecord\s+([A-Z][A-Za-z0-9_]*)\s*:\s*([A-Z][A-Za-z0-9_]*)/g;
const ABSTRACT_RECORD = /\babstract\s+(?:sealed\s+)?record\s+([A-Z][A-Za-z0-9_]*)/g;

// A file must carry a tag when it declares an element the marking convention
// names: a command, query, handler, validator, authorizer, domain event, domain
// exception, aggregate root, or API endpoint. The declaration is matched by the
// type name it declares rather than by the filename, so a file whose name ends
// in one of those words is not asked for a tag when it declares something else,
// and a file whose name does not is asked when it declares one.
//
// A port declares no operation. An interface is never markable, whatever its
// name, because the marking convention names the implementation of an operation
// rather than the contract for one. The host's own wiring declares no operation
// a page or an identifier names: a pipeline stage, an exception boundary, and an
// authentication scheme carry an infrastructure interface, not the use-case
// interface a handler carries. A use-case handler implements ICommandHandler or
// IQueryHandler, which is what separates it from those. A domain exception
// derives from DomainException, so an operational exception in the Application
// or WebApi layer is not one. (standards/rule/core-system.documentation-and-code-change-together)
//
// An endpoint mapped with '.ExcludeFromDescription()' is the exception to the
// endpoint rule, and only to the endpoint rule. The call keeps the route out of
// the published API document, which is how a development-only deployment tool
// stays off every generated client and out of the buyer-facing contract. Nothing
// the contract does not carry can be named by a use-case page, so an identifier
// there would resolve to nothing. The marker exempts a file only when it covers
// every endpoint the file declares, so a second, published endpoint in the same
// file is still asked for a tag.
const EXCLUDE_BY_DECLARATION = /\.ExcludeFromDescription\s*\(\s*\)/g;
const CONCRETE_DECLARATION = /\b(?:class|record(?:\s+(?:class|struct))?|struct)\s+([A-Z][A-Za-z0-9_]*)/g;
const AGGREGATE_ROOT_DECLARATION = /:\s*AggregateRoot\s*</;
const DOMAIN_EXCEPTION_BASE = /:\s*DomainException\b/;
const USE_CASE_HANDLER_BASE = /I(?:Command|Query)Handler\s*</;
const TEST_MARKER = /\[\s*(?:Fact|Theory|Scenario|Given|When|Then|StepDefinition)\b/;

function declaredTypeNames(text) {
  const names = [];
  for (const match of text.matchAll(CONCRETE_DECLARATION)) names.push(match[1]);
  return names;
}

// A file is exempt from the endpoint rule when '.ExcludeFromDescription()' covers
// every endpoint it declares. Counting rather than a bare presence test keeps a
// published endpoint markable when it shares a file with an excluded one, because
// that endpoint is still owed a tag.
function everyEndpointIsExcluded(text, names) {
  const endpoints = names.filter((name) => /(?:Endpoint|Endpoints)$/.test(name));
  if (!endpoints.length) return false;
  const markers = text.match(EXCLUDE_BY_DECLARATION) ?? [];
  return markers.length >= endpoints.length;
}

// A test is part of the marking system only when it proves something, which is
// when it cites an identifier a specification page declares or cites, of a kind
// a test can prove. A pure unit test (a value object, a pipeline stage, an
// architecture rule) cites nothing that resolves, so no page depends on it and
// no tag is owed. A test that asserts a failure code cites a value, not a
// proof, so it is not asked for a tag either. A test that cites a criterion
// without one is a gap and is still reported.
// (standards/rule/core-system.documentation-and-code-change-together)
const PROVABLE_KINDS = new Set(['use-case', 'acceptance-criterion', 'path', 'invariant']);

function citesProvableIdentifier(text) {
  return scanIdentifiers(text).some((id) => {
    const parsed = parseCitation(id);
    return parsed !== null && PROVABLE_KINDS.has(parsed.kind) && specIds.has(id);
  });
}

function isMarkableElement(text) {
  if (TEST_MARKER.test(text)) return citesProvableIdentifier(text);
  const names = declaredTypeNames(text);
  if (!names.length) return false;
  if (names.some((name) => /(?:Command|Query)$/.test(name))) return true;
  if (names.some((name) => /Validator$/.test(name))) return true;
  if (names.some((name) => /Authorizer$/.test(name))) return true;
  if (names.some((name) => /(?:Endpoint|Endpoints)$/.test(name)) && !everyEndpointIsExcluded(text, names)) return true;
  if (names.some((name) => /Event$/.test(name)) && /IDomainEvent\b/.test(text)) return true;
  if (names.some((name) => /Handler$/.test(name)) && USE_CASE_HANDLER_BASE.test(text)) return true;
  if (names.some((name) => /Exception$/.test(name)) && DOMAIN_EXCEPTION_BASE.test(text)) return true;
  if (AGGREGATE_ROOT_DECLARATION.test(text)) return true;
  return false;
}

// A closed-set base is what a value case derives. The base set is built first
// because a derived record can sit in a file the walk reaches later.
// (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
const abstractRecords = new Set();
for (const file of codeFiles) {
  for (const match of fs.readFileSync(file, 'utf8').matchAll(ABSTRACT_RECORD)) abstractRecords.add(match[1]);
}

const codeTags = new Map();     // id -> [{file, tag}]
const testCitedIds = new Set(); // id -> cited by a <covers> tag
const testFiles = new Set();
const enforcedBy = new Map();   // invariant id -> Set of use-case ids enforcing it

function addCodeTag(id, file, tag) {
  if (!codeTags.has(id)) codeTags.set(id, []);
  codeTags.get(id).push({ file, tag });
}

for (const file of codeFiles) {
  const rel = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  const tags = [];
  for (const line of text.split(/\r?\n/)) {
    if (!TAG_LINE.test(line)) continue;
    for (const match of line.matchAll(TAG)) {
      const tag = match[1];
      const value = match[2].trim();
      const ids = scanIdentifiers(value);
      if (!ids.length) finding(`marking tag names no identifier: ${rel}: <${tag}>`);
      tags.push({ tag, ids });
    }
  }

  const fileHasTag = tags.length > 0;
  const hasValueTag = tags.some((entry) => entry.ids.some((id) => id.startsWith('value/')));
  for (const entry of tags) {
    for (const id of entry.ids) {
      addCodeTag(id, rel, entry.tag);
      if (entry.tag === 'covers') {
        testCitedIds.add(id);
        testFiles.add(rel);
      }
    }
  }

  // A handler that both implements a use case and enforces an invariant is what
  // lets a test on that use case prove the invariant. The use-case body is what
  // the test side records, so both sides are keyed by the body without the kind.
  const useCases = tags
    .filter((entry) => entry.tag === 'implements')
    .flatMap((entry) => entry.ids)
    .filter((id) => id.startsWith('use-case/'))
    .map((id) => id.slice('use-case/'.length));
  const invariants = tags.filter((entry) => entry.tag === 'enforces').flatMap((entry) => entry.ids).filter((id) => id.startsWith('invariant/'));
  for (const invariant of invariants) {
    if (!enforcedBy.has(invariant)) enforcedBy.set(invariant, new Set());
    for (const useCase of useCases) enforcedBy.get(invariant).add(useCase);
  }

  if (isMarked(rel) && isMarkableElement(text) && !fileHasTag) {
    finding(`code element with no identifier tag: ${rel}`);
  }

  if (isMarked(rel) && !hasValueTag) {
    for (const match of text.matchAll(RECORD_DERIVATION)) {
      if (!abstractRecords.has(match[2])) continue;
      finding(`closed-set value with no identifier: ${rel} declares ${match[1]} deriving ${match[2]}`);
      break;
    }
  }
}

// ---- collect feature markings ----------------------------------------------
const featureFiles = [];
for (const configured of configuredFeatureRoots) {
  for (const file of walk(path.join(root, configured), (candidate) => candidate.endsWith('.feature'))) featureFiles.push(file);
}
featureFiles.sort();

// A tag is '@implements_' followed by the identifier with '/' replaced by '_'.
// The kind boundary is recovered by name rather than by replacing every '_',
// because a failure anchor keeps underscores inside its topic.
// (standards/rule/core-system.documentation-and-code-change-together)
function reconstructImplementationTag(tag) {
  const body = tag.replace(/^implements_/, '');
  const firstCut = body.indexOf('_');
  if (firstCut < 0) return null;
  const first = body.slice(0, firstCut);
  if (ALL_KIND_SET.has(first)) {
    return `${first}/${body.slice(firstCut + 1)}`;
  }
  const secondCut = body.indexOf('_', firstCut + 1);
  if (secondCut < 0) return null;
  const second = body.slice(firstCut + 1, secondCut);
  if (!ALL_KIND_SET.has(second)) return null;
  return `${second}/${body.slice(secondCut + 1)}`;
}

const FEATURE_TAG = /@(implements_[^\s@]+)/g;
for (const file of featureFiles) {
  const rel = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(FEATURE_TAG)) {
    const reconstructed = reconstructImplementationTag(match[1]);
    if (!reconstructed) {
      finding(`malformed implementation tag: ${rel}: @${match[1]}`);
      continue;
    }
    const id = bareIdentifier(reconstructed);
    if (!id) {
      finding(`malformed implementation tag: ${rel}: @${match[1]}`);
      continue;
    }
    testCitedIds.add(id);
    testFiles.add(rel);
  }

  // A scenario with no implementation tag names no spec, so no gate can tell what
  // it proves. The tag block is the run of tag, comment, and blank lines
  // immediately above the scenario.
  let pending = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*@/.test(line)) { pending.push(line); continue; }
    if (line.trim() === '' || /^\s*#/.test(line)) continue;
    if (/^\s*(?:Scenario|Scenario Outline)\s*:/i.test(line)) {
      if (!pending.some((tagLine) => /@implements_[^\s@]+/.test(tagLine))) {
        finding(`feature scenario with no implementation tag: ${rel}:${index + 1}`);
      }
      pending = [];
      continue;
    }
    pending = [];
  }
}

// ---- collect frontend test citations ---------------------------------------
// A browser test names the criterion or the path it proves at the start of its
// title, in the citation form the other two carriers use:
//
//   test("[acceptance-criterion/storefront.ticket.shows-the-ticket-code] ...")
//   test("[path/orders.place-order.expected-total-mismatch] ...")
//
// A criterion is read anywhere in a test file. A path is read only from the
// opening of a title, because the word 'path' followed by a slash is common in
// route and file names. (standards/rule/frontend-ui.map-every-use-case-path)
const FRONTEND_TEST_FILE = /\.(?:spec|test)\.[cm]?[jt]sx?$/i;
const PATH_TITLE = new RegExp(`['"\`]\\s*\\[((?:${SOURCE_SEGMENT}\\/)?path\\/${IDENT_BODY})\\]`, 'g');
const frontendFiles = [];
for (const configured of configuredEvidenceRoots) {
  for (const file of walk(path.join(root, configured), (candidate) => FRONTEND_TEST_FILE.test(path.basename(candidate)))) {
    frontendFiles.push(file);
  }
}
frontendFiles.sort();

for (const file of frontendFiles) {
  const rel = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  let carriesCitation = false;
  for (const id of scanIdentifiers(text)) {
    if (!id.startsWith('acceptance-criterion/')) continue;
    testCitedIds.add(id);
    carriesCitation = true;
  }
  for (const match of text.matchAll(PATH_TITLE)) {
    const id = bareIdentifier(match[1]);
    if (!id) continue;
    testCitedIds.add(id);
    carriesCitation = true;
  }
  if (carriesCitation) testFiles.add(rel);
}

// A test that covers an acceptance criterion proves the use case the criterion is
// anchored on, and an invariant enforced by it is then proven too.
const testedUseCases = new Set();
for (const id of testCitedIds) {
  const parsed = parseCitation(id);
  if (!parsed) continue;
  if (parsed.kind === 'use-case') {
    testedUseCases.add(parsed.body);
  } else if (parsed.kind === 'acceptance-criterion' || parsed.kind === 'path') {
    const segments = parsed.body.split('.');
    if (segments.length >= 2) testedUseCases.add(`${segments[0]}.${segments[1]}`);
  }
}

// ---- compare both directions -----------------------------------------------
const codeIds = new Set([...codeTags.keys(), ...testCitedIds]);

for (const id of [...specIds].sort()) {
  const parsed = parseCitation(id);
  if (!parsed || !CODE_KINDS.has(parsed.kind)) continue;
  if (codeTags.has(id) || testCitedIds.has(id)) continue;
  const meta = declaredMeta.get(id);
  if (meta && (meta.implementationStatus === 'planned' || meta.specStatus === 'retired')) continue;
  finding(`spec identifier with no code element: ${id}`);
}

for (const id of [...codeIds].sort()) {
  if (retiredIds.has(id)) continue;
  const parsed = parseCitation(id);
  if (!parsed || parsed.kind === 'value') continue;
  if (specIds.has(id)) continue;
  finding(`code identifier with no specification: ${id}`);
}

for (const id of [...specIds].sort()) {
  const parsed = parseCitation(id);
  if (!parsed || parsed.kind !== 'invariant') continue;
  if (testCitedIds.has(id)) continue;
  const enforcers = enforcedBy.get(id);
  if (enforcers && [...enforcers].some((useCase) => testedUseCases.has(useCase))) continue;
  finding(`invariant without a test: ${id}`);
}

// A path is proven by its own citation, or by a covered criterion that names
// it. A use case whose criteria name no path falls back to use-case-level proof,
// and the fallback is reported so the remaining gap stays visible.
const provenByCriterion = new Set();
for (const [criterion, named] of criterionPaths) if (testCitedIds.has(criterion)) provenByCriterion.add(named);
const useCaseLevelProof = new Set();
for (const id of [...specIds].sort()) {
  const parsed = parseCitation(id);
  if (!parsed || parsed.kind !== 'path') continue;
  if (testCitedIds.has(id) || provenByCriterion.has(id)) continue;
  const useCase = parsed.body.split('.').length >= 3 ? useCaseOf(id) : null;
  if (useCase && !pathNamingUseCases.has(useCase) && testedUseCases.has(useCase)) {
    useCaseLevelProof.add(useCase);
    continue;
  }
  finding(`path without a test: ${id}`);
}
const useCaseLevel = [...useCaseLevelProof].sort();

// ---- report ----------------------------------------------------------------
if (jsonOutput) {
  console.log(JSON.stringify({
    tool: 'validate-spec-sync',
    consumer: root,
    ok: findings.length === 0 || reportOnly,
    activated: true,
    schemePage: scheme.source,
    kinds: ALL_KINDS,
    specificationIdentifiers: specIds.size,
    codeIdentifiers: codeIds.size,
    specificationPages: specPages.length,
    csharpFiles: codeFiles.length,
    featureFiles: featureFiles.length,
    frontendFiles: frontendFiles.length,
    testCitations: testCitedIds.size,
    criteriaNamingPaths: criterionPaths.size,
    useCaseLevelProof: useCaseLevel,
    reportOnly,
    findings,
  }, null, 2));
  process.exit(findings.length && !reportOnly ? 1 : 0);
}

console.log(`Consumer: ${root}`);
if (scheme.source) console.log(`Identifier grammar: ${scheme.kinds.length} kind(s) read from ${scheme.source}`);
else console.log('Identifier grammar: built-in kind list (the standards page was not found)');
console.log(`Specification identifiers: ${specIds.size}, code identifiers: ${codeIds.size}`);
console.log(`Scanned ${specPages.length} specification page(s), ${codeFiles.length} C# file(s), ${featureFiles.length} feature file(s), ${frontendFiles.length} frontend test file(s); ${testFiles.size} file(s) carry a test citation`);
console.log(`Path proof: ${criterionPaths.size} criterion(s) name a path; ${useCaseLevel.length} use case(s) prove their paths at use-case level because no criterion names a path`);
if (useCaseLevel.length) console.log(`Use-case-level path proof: ${useCaseLevel.join(', ')}`);
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
console.log('\nPASS: every specification identifier is cited by a code element, every code identifier resolves to a specification, every invariant and path has a test, and every marked file carries a tag.');