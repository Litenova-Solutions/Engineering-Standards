#!/usr/bin/env node
// Reference validator for the controlled React web UI contract.
//
// The validator is deliberately local and deterministic. It reads the consumer
// configuration, source locks, vocabulary, page sidecars, and source files. It
// never fetches a registry or a package. Consumers may add stricter AST rules,
// but they should preserve these checks.
//
// Usage:
//   node standards/tools/validate-ui.mjs [consumerRoot]

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { unsupportedSchemaKeywords, validateSchemaValue } from './schema.mjs';

// The schemas ship beside this file rather than under the consumer, so a
// consumer that vendors the standards at any depth resolves the same shapes.
const schemaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'schemas');

const USAGE = `Usage: node tools/validate-ui.mjs [consumerRoot] [--format=json] [--help]

Validates the controlled React web UI contract for the consumer at consumerRoot,
which defaults to the current directory.

  --format=json   Write one JSON object on stdout instead of human-readable lines.
  --help          Print this text and exit.

Exit codes: 0 no problem, 1 at least one problem, 2 usage error.`;

const flags = process.argv.slice(2).filter((value) => value.startsWith('-'));
if (flags.includes('--help') || flags.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
const unknownFlags = flags.filter((value) => value !== '--format=json');
if (unknownFlags.length) {
  console.error(`Unknown option ${unknownFlags.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
const jsonOutput = flags.includes('--format=json');
const root = path.resolve(process.argv.slice(2).find((value) => !value.startsWith('-')) ?? '.');
const errors = [];
const error = (message) => errors.push(message);

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (cause) {
    error(`${label}: cannot parse JSON (${cause.message})`);
    return null;
  }
}

function required(object, key, label) {
  if (!object || object[key] === undefined || object[key] === null || object[key] === '') {
    error(`${label}: missing '${key}'`);
    return false;
  }
  return true;
}

function array(object, key, label) {
  if (!Array.isArray(object?.[key])) {
    error(`${label}: '${key}' must be an array`);
    return [];
  }
  return object[key];
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) error(`${label}: duplicate '${value}'`);
    seen.add(value);
  }
}

function filePath(relative) {
  return path.resolve(root, relative);
}

function relativeToRoot(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function within(rootPath, candidate) {
  const base = path.resolve(rootPath) + path.sep;
  return path.resolve(candidate).startsWith(base);
}

const IGNORED_DIRECTORIES = new Set([
  'node_modules', '.next', 'out', 'dist', 'build', '.output', '.svelte-kit', 'coverage', 'android', 'ios',
]);

function walk(directory, predicate, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    // Build output is generated, not authored. Scanning it reports the bundler's
    // own CSS as a source violation, which no consumer can fix. Native runtime
    // directories hold copied web assets rather than authored source.
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(candidate, predicate, result);
    else if (predicate(candidate)) result.push(candidate);
  }
  return result;
}

function normalizeSource(contents) {
  return contents.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd() + '\n';
}

// A source lock names one file in several component entries, and the walk that
// collects source files reads each one again. Hashing is the expensive step, so
// the digest is computed once per absolute path.
const digests = new Map();

function digest(file) {
  const key = path.resolve(file);
  const cached = digests.get(key);
  if (cached) return cached;
  const value = `sha256:${crypto.createHash('sha256').update(normalizeSource(fs.readFileSync(key, 'utf8'))).digest('hex')}`;
  digests.set(key, value);
  return value;
}

function presetFingerprint(preset) {
  const decoded = {
    baseColor: preset.baseColor,
    chartColor: preset.chartColor,
    font: preset.font,
    fontHeading: preset.fontHeading,
    iconLibrary: preset.icons,
    menuAccent: preset.menuAccent,
    menuColor: preset.menuColor,
    radius: preset.radius,
    style: preset.style,
    theme: preset.theme,
  };
  const canonical = JSON.stringify(Object.fromEntries(Object.entries(decoded).sort(([left], [right]) => left.localeCompare(right))));
  return `sha256:${crypto.createHash('sha256').update(canonical).digest('hex')}`;
}

// Tailwind class strings are extracted from class attributes and class-merge
// helper calls before any utility rule runs. Scanning a whole file with a
// utility pattern reports ordinary JavaScript (`= !loading`) and prose in
// comments, so the utility rules only see strings that reach a class attribute.
const classHelpers = new Set(['cn', 'clsx', 'cva', 'tv', 'twMerge', 'twJoin']);

function balanced(text, start, open, close) {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === open) depth += 1;
    else if (text[index] === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start + 1, index);
    }
  }
  return null;
}

// A character class cannot see an escaped delimiter, so `"px-2 \" px-3"` ends at
// the middle quote and every later token in the file parses against the wrong
// boundary. The scanner honours the backslash escape the language defines, and
// treats an unterminated quote as no literal rather than as one that runs to the
// end of the file. A single quote inside a comment is therefore skipped instead
// of swallowing the next real class string.
function readLiteral(text, start) {
  const quote = text[start];
  let value = '';
  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\\') {
      value += text[index + 1] ?? '';
      index += 1;
      continue;
    }
    if (character === quote) return { value, end: index };
    if (character === '\n' && quote !== '`') return null;
    value += character;
  }
  return null;
}

function literals(region) {
  const found = [];
  for (let index = 0; index < region.length; index += 1) {
    const character = region[index];
    if (character !== '"' && character !== "'" && character !== '`') continue;
    const literal = readLiteral(region, index);
    if (!literal) continue;
    found.push(literal.value);
    index = literal.end;
  }
  return found;
}

function classStrings(text) {
  const found = [];
  for (const match of text.matchAll(/\b(?:className|class)\s*=\s*/g)) {
    const start = match.index + match[0].length;
    const opener = text[start];
    if (opener === '"' || opener === "'" || opener === '`') {
      const literal = readLiteral(text, start);
      if (literal) found.push(literal.value);
      continue;
    }
    if (opener === '{') {
      const region = balanced(text, start, '{', '}');
      if (region !== null) found.push(...literals(region));
    }
  }
  // Every call expression matches first and the helper set filters the rest. A
  // call the set does not name contributes no class string.
  for (const match of text.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
    if (!classHelpers.has(match[1])) continue;
    const region = balanced(text, match.index + match[0].length - 1, '(', ')');
    if (region !== null) found.push(...literals(region));
  }
  return found;
}

// A bracket in a variant segment is Tailwind variant syntax, which the
// convention allows. A bracket in the final utility segment is an arbitrary
// value, which it does not.
//
// The names below are the functional variants of the Tailwind release that
// `standards.manifest.json` pins under `packages.npm.tailwindcss`. They compose,
// so `group-data-[open]` and `not-has-[a]` are one variant each. A Tailwind
// release that adds a functional variant needs this list and a fixture case;
// until it has both, the new variant reports as an arbitrary selector rather
// than passing unread.
const bracketVariant = '(?:aria|data|group|has|in|max|min|not|nth|nth-last|nth-of-type|nth-last-of-type|peer|supports)';
const allowedBracketVariant = new RegExp(`^${bracketVariant}(?:-${bracketVariant})*-\\[`);
const palette = '(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)';
const rawPalette = new RegExp(`^-?(?:text|bg|border|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|shadow|placeholder)-${palette}-\\d{2,3}(?:/\\d{1,3})?$`);

const utilityMessages = {
  arbitrary: 'arbitrary Tailwind value requires a semantic token or declared variant',
  important: 'important modifier requires a declared variant',
  palette: 'raw Tailwind palette value requires a semantic token',
  selector: 'arbitrary selector variant requires a declared variant',
};

function splitVariants(token) {
  const segments = [];
  let depth = 0;
  let current = '';
  for (const character of token) {
    if (character === '[') depth += 1;
    if (character === ']') depth -= 1;
    if (character === ':' && depth === 0) {
      segments.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  segments.push(current);
  return segments;
}

function inspectClassString(value, report) {
  for (const token of value.split(/\s+/)) {
    if (!token || token.includes('${')) continue;
    if (token.startsWith('!') || token.endsWith('!')) report('important', token);
    const segments = splitVariants(token.replace(/^!/, '').replace(/!$/, ''));
    const utility = segments.pop() ?? '';
    for (const variant of segments) {
      if (variant.includes('[') && !allowedBracketVariant.test(variant)) report('selector', token);
    }
    if (utility.includes('[')) report('arbitrary', token);
    if (rawPalette.test(utility)) report('palette', token);
  }
}

// A value read against one of the shipped schemas. The keyword gate runs first,
// so a schema carrying a keyword this evaluator does not implement fails rather
// than passing unread.
function schemaCheck(schemaName, value, label, provisionId) {
  const file = path.join(schemaRoot, schemaName);
  if (!fs.existsSync(file)) {
    error(`${label}: schema '${schemaName}' is missing from the standards release`);
    return false;
  }
  const schema = readJson(file, schemaName);
  if (!schema) return false;
  const problems = [];
  unsupportedSchemaKeywords(schema, schemaName, '#', (_relative, _line, _code, message) => problems.push(message));
  try {
    validateSchemaValue(value, schema, schema, label, problems);
  } catch (cause) {
    problems.push(`${label}: ${cause.message}`);
  }
  for (const problem of problems) error(`[${provisionId}] ${problem}`);
  return problems.length === 0;
}

// The H2 names a Markdown page carries, in the order they appear.
function sectionNames(raw) {
  return [...raw.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
}

// ---- design contract -------------------------------------------------------

const DESIGN_SECTIONS = ['Brand', 'Tokens', 'Vocabulary', 'Patterns', 'Do', 'Do not', 'Motion', 'Voice'];

function validateDesignContract(frontend, ui, frontendRoot, vocabularyInfo, recipes) {
  const file = path.join(frontendRoot, 'DESIGN.md');
  const label = relativeToRoot(file);
  if (!fs.existsSync(file)) {
    error(`[FRONTEND.UI.DESIGN.001] frontend '${frontend.name}': no design contract at '${relativeToRoot(file)}'`);
    return null;
  }
  const metadata = parseMetadata(file);
  if (!metadata) {
    error(`[FRONTEND.UI.DESIGN.001] ${label}: design contract has no metadata block`);
    return null;
  }
  schemaCheck('design-contract.schema.json', metadata, label, 'FRONTEND.UI.DESIGN.001');
  if (metadata.frontend !== frontend.name) error(`[FRONTEND.UI.DESIGN.001] ${label}: frontend must be '${frontend.name}'`);
  if (metadata.profile !== ui.profile) error(`[FRONTEND.UI.DESIGN.001] ${label}: profile must match frontend UI configuration`);
  if (vocabularyInfo && metadata.shell && !vocabularyInfo.shellIds.has(metadata.shell)) {
    error(`[FRONTEND.UI.DESIGN.001] ${label}: unknown shell '${metadata.shell}'`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const present = new Set(sectionNames(raw));
  for (const section of DESIGN_SECTIONS) {
    if (!present.has(section)) error(`[FRONTEND.UI.DESIGN.001] ${label}: missing required section '${section}'`);
  }
  const bound = new Set([...(vocabularyInfo?.patternIds ?? [])].map(recipeName));
  for (const pattern of metadata.patterns ?? []) {
    if (vocabularyInfo && !bound.has(pattern)) error(`[FRONTEND.UI.DESIGN.001] ${label}: pattern '${pattern}' is not in the frontend vocabulary`);
    if (recipes.size && !recipes.has(recipeName(pattern))) error(`[FRONTEND.UI.COMPOSITION.001] ${label}: pattern '${pattern}' has no recipe in the composition catalog`);
  }
  return metadata;
}

// ---- composition catalog ---------------------------------------------------

// One pass over the catalog, before any frontend is read. A recipe is a Markdown
// page that argues the shape and a sidecar that states it, so a page with no
// sidecar is a shape nothing resolves and a sidecar with no page is a shape
// nobody argued.
function readCompositionCatalog(project) {
  const recipes = new Map();
  const declared = project?.paths?.uiCompositions;
  const uiDocs = project?.paths?.uiDocs ?? 'docs/ui';
  const catalogRoot = filePath(declared ?? path.posix.join(uiDocs, 'compositions'));
  if (!fs.existsSync(catalogRoot)) {
    // A consumer with no page sidecar needs no catalog. The per-region check
    // reports the absence where it matters, naming the region that wanted one.
    if (declared) error(`[FRONTEND.UI.COMPOSITION.002] ${relativeToRoot(catalogRoot)}: declared composition catalog does not exist`);
    return recipes;
  }
  for (const file of walk(catalogRoot, (candidate) => candidate.endsWith('.md'))) {
    const name = path.basename(file, '.md');
    if (name === 'README') continue;
    const sidecar = path.join(path.dirname(file), `${name}.recipe.json`);
    const label = relativeToRoot(sidecar);
    if (!fs.existsSync(sidecar)) {
      error(`[FRONTEND.UI.COMPOSITION.002] ${relativeToRoot(file)}: recipe has no sidecar at '${label}'`);
      continue;
    }
    const recipe = readJson(sidecar, label);
    if (!recipe) continue;
    if (!schemaCheck('composition-recipe.schema.json', recipe, label, 'FRONTEND.UI.COMPOSITION.002')) continue;
    if (recipe.recipe !== name) {
      error(`[FRONTEND.UI.COMPOSITION.002] ${label}: recipe must be '${name}', which is the name of the page beside it`);
      continue;
    }
    recipes.set(name, { ...recipe, label, consumers: new Set() });
  }
  for (const file of walk(catalogRoot, (candidate) => candidate.endsWith('.recipe.json'))) {
    const name = path.basename(file, '.recipe.json');
    if (recipes.has(name)) continue;
    error(`[FRONTEND.UI.COMPOSITION.002] ${relativeToRoot(file)}: recipe sidecar has no Markdown page beside it`);
  }
  return recipes;
}

// A vocabulary pattern can carry a variant after a slash, so `record-list/dense`
// and `record-list/default` are two bindings of one recipe. The name before the
// slash is the recipe the catalog holds.
function recipeName(pattern) {
  return String(pattern ?? '').split('/')[0];
}

// ---- route resolution ------------------------------------------------------

// A folder that contributes no URL segment: `(group)` organizes, `@slot` is a
// parallel route, and `_private` is excluded from routing.
function routeSegment(folder) {
  if (folder.startsWith('(') || folder.startsWith('@') || folder.startsWith('_')) return null;
  const dynamic = folder.match(/^\[+\.{0,3}(.+?)\]+$/);
  return dynamic ? `{${dynamic[1]}}` : folder;
}

const ROUTE_FILE = /^page\.(?:tsx|ts|jsx|js)$/;

// Three states are owned by a file beside the route rather than by a component
// inside it. The router renders the segment's own file, or the nearest one above
// it, so a page declaring one of these states is answered by a file it inherits.
const SEGMENT_STATE_FILE = { loading: 'loading', 'not-found': 'not-found', error: 'error' };

function segmentStates(routeFile, frontendRoot) {
  const found = new Set();
  const appRoot = path.join(frontendRoot, 'app');
  let directory = path.dirname(routeFile);
  while (within(appRoot, directory) || path.resolve(directory) === path.resolve(appRoot)) {
    for (const [state, stem] of Object.entries(SEGMENT_STATE_FILE)) {
      for (const extension of SOURCE_EXTENSIONS) {
        if (fs.existsSync(path.join(directory, `${stem}${extension}`))) found.add(state);
      }
    }
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return found;
}

// Every route the application tree declares, in the notation a page
// specification writes. A localized tree carries one leading parameter that
// distinguishes no route from another, so each route is also registered without
// its first parameter segment.
function readRoutes(frontendRoot) {
  const routes = new Map();
  const appRoot = path.join(frontendRoot, 'app');
  if (!fs.existsSync(appRoot)) return routes;
  const register = (route, file) => {
    if (!routes.has(route)) routes.set(route, file);
  };
  const walkRoutes = (directory, segments) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        const segment = routeSegment(entry.name);
        walkRoutes(candidate, segment === null ? segments : [...segments, segment]);
        continue;
      }
      if (!ROUTE_FILE.test(entry.name)) continue;
      const route = `/${segments.join('/')}`;
      register(route === '/' ? '/' : route, candidate);
      if (segments.length && /^\{.+\}$/.test(segments[0])) {
        const shortened = `/${segments.slice(1).join('/')}`;
        register(shortened === '/' ? '/' : shortened, candidate);
      }
    }
  };
  walkRoutes(appRoot, []);
  return routes;
}

// ---- region scan -----------------------------------------------------------

const SOURCE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

function resolveImport(specifier, fromFile, frontendRoot) {
  let base;
  if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else if (specifier.startsWith('@/')) base = path.resolve(frontendRoot, specifier.slice(2));
  else return null;
  if (!within(frontendRoot, base) && path.resolve(base) !== path.resolve(frontendRoot)) return null;
  for (const extension of ['', ...SOURCE_EXTENSIONS]) {
    const candidate = `${base}${extension}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = path.join(base, `index${extension}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// Every `data-region` value the route renders, following its own imports inside
// the frontend. A region marked in a shared feature component belongs to every
// page that reaches it, which is what makes an unnamed region reportable.
function regionsRendered(routeFile, frontendRoot) {
  const found = new Set();
  const seen = new Set();
  const queue = [routeFile];
  while (queue.length) {
    const file = queue.pop();
    const key = path.resolve(file);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!fs.existsSync(key)) continue;
    const text = fs.readFileSync(key, 'utf8');
    for (const match of text.matchAll(/data-region=(?:"([a-z][a-z0-9-]*)"|\{"([a-z][a-z0-9-]*)"\}|'([a-z][a-z0-9-]*)')/g)) {
      found.add(match[1] ?? match[2] ?? match[3]);
    }
    for (const match of text.matchAll(/(?:from\s+|import\s*\(\s*)(['"])([^'"]+)\1/g)) {
      const target = resolveImport(match[2], key, frontendRoot);
      if (target) queue.push(target);
    }
  }
  return found;
}

function parseMetadata(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) {
    error(`${relativeToRoot(file)}: unterminated metadata block`);
    return null;
  }
  try {
    return JSON.parse(raw.slice(3, end).trim());
  } catch (cause) {
    error(`${relativeToRoot(file)}: metadata is not JSON (${cause.message})`);
    return null;
  }
}

function validateComponentsJson(file, ui) {
  const label = relativeToRoot(file);
  const config = readJson(file, label);
  if (!config) return;
  if (ui.componentsStyle && config.style !== ui.componentsStyle) error(`[FRONTEND.UI.SHADCN.001] ${label}: style must be '${ui.componentsStyle}'`);
  if (config.iconLibrary !== ui.icons) error(`[FRONTEND.UI.SHADCN.001] ${label}: iconLibrary must be '${ui.icons}'`);
  if (config.tailwind?.baseColor !== ui.baseColor) error(`[FRONTEND.UI.SHADCN.001] ${label}: tailwind.baseColor must be '${ui.baseColor}'`);
  if (config.tailwind?.cssVariables !== ui.cssVariables) error(`[FRONTEND.UI.SHADCN.001] ${label}: tailwind.cssVariables must be ${ui.cssVariables}`);
  if (config.menuColor !== ui.menuColor) error(`[FRONTEND.UI.SHADCN.001] ${label}: menuColor must be '${ui.menuColor}'`);
  if (config.menuAccent !== ui.menuAccent) error(`[FRONTEND.UI.SHADCN.001] ${label}: menuAccent must be '${ui.menuAccent}'`);
  const expectedAliases = {
    components: '@/components',
    utils: '@/lib/utils',
    ui: '@/components/ui',
    lib: '@/lib',
    hooks: '@/hooks',
  };
  for (const [alias, value] of Object.entries(expectedAliases)) if (config.aliases?.[alias] !== value) error(`[FRONTEND.UI.SHADCN.001] ${label}: aliases.${alias} must be '${value}'`);
  if (config.rtl !== false) error(`[FRONTEND.UI.SHADCN.001] ${label}: rtl must be false in the default baseline`);
  if (config.registries && Object.keys(config.registries).length > 0) error(`[FRONTEND.UI.SHADCN.001] ${label}: additional registries require an override decision`);
}

function validateVocabulary(file, ui, frontendName, frontendRoot, manifest) {
  const label = relativeToRoot(file);
  const vocabulary = readJson(file, label);
  if (!vocabulary) return null;
  for (const key of ['schemaVersion', 'frontend', 'profile', 'baseline', 'tokens', 'states', 'shells', 'patterns', 'components', 'forks', 'specialists', 'runtimeStyles', 'evidence']) required(vocabulary, key, label);
  if (vocabulary.schemaVersion !== 1) error(`${label}: schemaVersion must be 1`);
  if (vocabulary.frontend !== frontendName) error(`${label}: frontend must be '${frontendName}'`);
  if (vocabulary.profile !== ui.profile) error(`${label}: profile must match frontend UI configuration`);

  const baseline = vocabulary.baseline ?? {};
  const expected = {
    system: ui.system,
    styling: ui.styling,
    base: ui.base,
    style: ui.style,
    presetCode: ui.presetCode,
    presetFingerprint: ui.presetFingerprint,
    cssVariables: ui.cssVariables,
    baseColor: ui.baseColor,
    theme: ui.theme,
    chartColor: ui.chartColor,
    font: ui.font,
    fontHeading: ui.fontHeading,
    icons: ui.icons,
    radius: ui.radius,
    menuAccent: ui.menuAccent,
    menuColor: ui.menuColor,
    componentsStyle: ui.componentsStyle,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (baseline[key] !== value) error(`${label}: baseline.${key} does not match frontend UI configuration`);
  }

  const shells = array(vocabulary, 'shells', label);
  const patterns = array(vocabulary, 'patterns', label);
  const components = array(vocabulary, 'components', label);
  const tokens = array(vocabulary, 'tokens', label);
  const states = array(vocabulary, 'states', label);
  const forks = array(vocabulary, 'forks', label);
  const specialists = array(vocabulary, 'specialists', label);
  const evidence = array(vocabulary, 'evidence', label);
  for (const key of ['shells', 'patterns', 'components', 'states', 'evidence']) {
    unique(array(vocabulary, key, label).map((item) => item?.id), `${label}.${key}`);
  }
  unique(tokens.map((item) => item?.name), `${label}.tokens`);
  unique(forks.map((item) => item?.component), `${label}.forks`);
  unique(specialists.map((item) => item?.id), `${label}.specialists`);
  const shellIds = new Set(shells.map((item) => item?.id));
  const patternIds = new Set(patterns.map((item) => item?.id));
  const componentIds = new Set(components.map((item) => item?.id));
  const stateIds = new Set(states.map((item) => item?.id));
  const evidenceIds = new Set(evidence.map((item) => item?.id));

  for (const shell of shells) {
    required(shell, 'id', `${label}.shell`);
    for (const region of array(shell, 'regions', `${label}.${shell?.id ?? 'shell'}`)) if (typeof region !== 'string' || !region) error(`${label}: shell region must be a non-empty string`);
  }
  for (const pattern of patterns) {
    const patternLabel = `${label}.${pattern?.id ?? 'pattern'}`;
    required(pattern, 'id', patternLabel);
    for (const component of array(pattern, 'components', patternLabel)) if (!componentIds.has(component)) error(`${patternLabel}: unknown component '${component}'`);
    for (const state of array(pattern, 'states', patternLabel)) if (!stateIds.has(state)) error(`${patternLabel}: unknown state '${state}'`);
    for (const evidenceId of array(pattern, 'evidence', patternLabel)) if (!evidenceIds.has(evidenceId)) error(`${patternLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const state of states) {
    const stateLabel = `${label}.state.${state?.id ?? 'unknown'}`;
    for (const evidenceId of array(state, 'requiredEvidence', stateLabel)) if (!evidenceIds.has(evidenceId)) error(`${stateLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const component of components) {
    const componentLabel = `${label}.${component?.id ?? 'component'}`;
    required(component, 'id', componentLabel);
    required(component, 'source', componentLabel);
    if (!['baseline', 'extended', 'forked', 'specialist'].includes(component?.status)) error(`${componentLabel}: invalid status`);
    if (component?.source) {
      const source = path.resolve(frontendRoot, component.source);
      if (!within(frontendRoot, source) || !fs.existsSync(source)) error(`[FRONTEND.UI.VOCABULARY.001] ${componentLabel}: source file does not exist '${component.source}'`);
    }
    for (const state of array(component, 'states', componentLabel)) if (!stateIds.has(state)) error(`${componentLabel}: unknown state '${state}'`);
    for (const evidenceId of array(component, 'evidence', componentLabel)) if (!evidenceIds.has(evidenceId)) error(`${componentLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const fork of forks) {
    const forkLabel = `${label}.fork.${fork?.component ?? 'unknown'}`;
    if (fork?.status !== 'forked') error(`${forkLabel}: status must be forked`);
    if (!componentIds.has(fork?.component)) error(`${forkLabel}: component is not in the vocabulary`);
    for (const scope of array(fork, 'scope', forkLabel)) if (!fs.existsSync(path.resolve(frontendRoot, scope))) error(`[FRONTEND.UI.FORKS.001] ${forkLabel}: fork scope does not exist '${scope}'`);
    for (const evidenceId of array(fork, 'evidence', forkLabel)) if (!evidenceIds.has(evidenceId)) error(`${forkLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const specialist of specialists) {
    const specialistLabel = `${label}.specialist.${specialist?.id ?? 'unknown'}`;
    required(specialist, 'package', specialistLabel);
    if (specialist?.package && !Object.prototype.hasOwnProperty.call(manifest?.packages?.npm ?? {}, specialist.package)) error(`[FRONTEND.UI.COMPANION.001] ${specialistLabel}: package '${specialist.package}' is not pinned in the standards manifest`);
    for (const evidenceId of array(specialist, 'evidence', specialistLabel)) if (!evidenceIds.has(evidenceId)) error(`${specialistLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const record of array(vocabulary, 'runtimeStyles', label)) {
    const runtimeLabel = `${label}.runtimeStyle.${record?.reason ? record.reason.slice(0, 40) : 'unknown'}`;
    required(record, 'reason', runtimeLabel);
    for (const scope of array(record, 'scope', runtimeLabel)) {
      const candidate = path.resolve(frontendRoot, scope);
      if (!within(frontendRoot, candidate) || !fs.existsSync(candidate)) error(`[FRONTEND.UI.TAILWIND.001] ${runtimeLabel}: runtime style scope does not exist '${scope}'`);
    }
    for (const property of array(record, 'properties', runtimeLabel)) {
      if (typeof property !== 'string' || !property.startsWith('--')) error(`[FRONTEND.UI.TAILWIND.001] ${runtimeLabel}: runtime style property '${property}' must be a CSS custom property`);
    }
    for (const evidenceId of array(record, 'evidence', runtimeLabel)) if (!evidenceIds.has(evidenceId)) error(`${runtimeLabel}: unknown evidence '${evidenceId}'`);
  }
  for (const record of evidence) {
    const recordLabel = `${label}.evidence.${record?.id ?? 'unknown'}`;
    if (!/^(?:AC|E2E|UI)-[A-Z0-9-]+$/.test(record?.id ?? '')) error(`${recordLabel}: invalid evidence id`);
    if (!['component', 'browser', 'accessibility', 'visual', 'manual'].includes(record?.kind)) error(`${recordLabel}: invalid evidence kind`);
    if (!['pass', 'fail', 'waived'].includes(record?.result)) error(`${recordLabel}: invalid evidence result`);
  }
  return { vocabulary, shellIds, patternIds, componentIds, stateIds, evidenceIds };
}

function validateSourceLock(file, ui, frontendRoot, vocabularyInfo, manifest) {
  const label = relativeToRoot(file);
  const lock = readJson(file, label);
  if (!lock) return;
  for (const key of ['schemaVersion', 'generator', 'cli', 'preset', 'registry', 'formatter', 'components']) required(lock, key, label);
  if (lock.schemaVersion !== 1) error(`${label}: schemaVersion must be 1`);
  if (lock.generator !== 'shadcn/ui') error(`${label}: generator must be shadcn/ui`);
  const expectedCli = manifest?.packages?.npm?.shadcn;
  // The pinned-version test already rejects `latest` and every other range, so
  // no separate branch for the word is reachable.
  if (!/^\d+\.\d+\.\d+$/.test(lock.cli ?? '')) error(`${label}: cli must be a pinned semantic version`);
  if (expectedCli && lock.cli !== expectedCli) error(`${label}: cli must match manifest shadcn pin '${expectedCli}'`);
  if (!/^sha256:[a-f0-9]{64}$/.test(lock.preset?.fingerprint ?? '')) error(`${label}: preset fingerprint must be a sha256 digest`);
  if (lock.registry?.name !== 'shadcn' || lock.registry?.url !== 'https://ui.shadcn.com') error(`${label}: only the built-in shadcn registry is allowed`);
  const presetKeys = ['code', 'style', 'base', 'cssVariables', 'baseColor', 'theme', 'chartColor', 'font', 'fontHeading', 'icons', 'radius', 'menuAccent', 'menuColor', 'componentsStyle'];
  for (const key of presetKeys) {
    const expected = key === 'code' ? ui.presetCode : key === 'fingerprint' ? ui.presetFingerprint : ui[key];
    const actual = key === 'code' ? lock.preset?.code : lock.preset?.[key];
    if (expected !== undefined && actual !== expected) error(`${label}: preset.${key} does not match frontend UI configuration`);
  }
  // Two separate claims. The lock has to be internally consistent, so its stored
  // fingerprint covers the preset fields written beside it. The lock also has to
  // agree with the consumer configuration, so the same digest covers the decoded
  // `ui` block. Checking only the second one lets a lock carry a preset nobody
  // hashed; checking only the first lets a self-consistent lock describe a
  // different preset from the one the frontend declares.
  if (lock.preset && presetFingerprint(lock.preset) !== lock.preset.fingerprint) {
    error(`[FRONTEND.UI.FORKS.001] ${label}: preset fingerprint does not match the preset fields recorded beside it`);
  }
  const expectedFingerprint = presetFingerprint(ui);
  if (lock.preset?.fingerprint !== expectedFingerprint) error(`[FRONTEND.UI.FORKS.001] ${label}: preset fingerprint does not match decoded preset values`);

  const lockComponents = array(lock, 'components', label);
  unique(lockComponents.map((item) => item?.name), `${label}.components`);
  const vocabularyComponents = new Map((vocabularyInfo?.vocabulary.components ?? []).map((item) => [item.id, item]));
  const pinnedPackages = new Set(Object.keys(manifest?.packages?.npm ?? {}));
  for (const item of lockComponents) {
    const itemLabel = `${label}.${item?.name ?? 'component'}`;
    for (const key of ['name', 'address', 'status', 'paths', 'digest', 'dependencies']) required(item, key, itemLabel);
    if (item?.status && !['baseline', 'extended', 'forked', 'specialist'].includes(item.status)) error(`${itemLabel}: invalid status`);
    const vocabularyComponent = vocabularyComponents.get(item?.name) ?? vocabularyComponents.get(`${item?.name}/default`);
    if (vocabularyInfo && !vocabularyComponent) error(`${itemLabel}: component is not in the UI vocabulary`);
    if (vocabularyComponent && vocabularyComponent.status !== item.status) error(`${itemLabel}: source-lock status does not match vocabulary status`);
    for (const dependency of array(item, 'dependencies', itemLabel)) if (!pinnedPackages.has(dependency)) error(`${itemLabel}: dependency '${dependency}' is not pinned in the standards manifest`);
    for (const relative of array(item, 'paths', itemLabel)) {
      const candidate = path.resolve(frontendRoot, relative);
      if (!within(frontendRoot, candidate)) {
        error(`${itemLabel}: path escapes frontend root '${relative}'`);
        continue;
      }
      if (!fs.existsSync(candidate)) {
        error(`${itemLabel}: source path does not exist '${relative}'`);
        continue;
      }
      if (digest(candidate) !== item.digest && item.status === 'baseline') {
        error(`[FRONTEND.UI.FORKS.001] ${itemLabel}: '${relative}' no longer matches the baseline digest; record it as extended or forked`);
      }
    }
  }
}

// A workspace hoists dependencies, so a second visual system declared at the
// repository root or in a shared package reaches the frontend without appearing
// in the frontend's own manifest.
function packageManifests(frontendRoot) {
  const files = new Set();
  const rootManifest = path.join(root, 'package.json');
  if (fs.existsSync(rootManifest)) files.add(rootManifest);
  for (const file of walk(path.join(root, 'packages'), (file) => path.basename(file) === 'package.json')) files.add(file);
  for (const file of walk(frontendRoot, (file) => path.basename(file) === 'package.json')) files.add(file);
  return [...files];
}

function validateDependencyBoundary(frontendRoot, ui) {
  const packageFiles = packageManifests(frontendRoot);
  const visualPackages = [
    '@chakra-ui/react',
    '@fluentui/react',
    '@blueprintjs/core',
    '@mantine/core',
    '@mui/material',
    '@radix-ui/themes',
    'antd',
    'bootstrap',
    'material-ui',
    'react-bootstrap',
  ];
  for (const file of packageFiles) {
    const label = relativeToRoot(file);
    const packageJson = readJson(file, label);
    if (!packageJson || ui.system !== 'shadcn/ui') continue;
    // An `optionalDependencies` entry installs when the platform allows it, and
    // an `overrides`, `pnpm.overrides`, or `resolutions` entry pins a version of
    // a package the tree resolves. Each one puts the named package in
    // `node_modules` where a component can import it, so each one is a declared
    // visual dependency for this boundary.
    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
      ...(packageJson.peerDependencies ?? {}),
      ...(packageJson.optionalDependencies ?? {}),
      ...(packageJson.overrides ?? {}),
      ...(packageJson.pnpm?.overrides ?? {}),
      ...(packageJson.resolutions ?? {}),
    };
    for (const name of visualPackages) if (dependencies[name]) error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: second general-purpose visual dependency '${name}' requires an override`);
  }
}

// A CSS string can carry a brace, a semicolon, or a comment opener, so counting
// those characters without tracking the string that holds them misreads
// `[data-state="{"]` as a block and `[data-kind="a,b"]` as two selectors. The
// scanner removes comments and empties every string body, which leaves the
// structure the brace check and the statement classifier read while keeping each
// selector's shape intact.
function readCssString(text, start) {
  const quote = text[start];
  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (character === quote) return index;
    if (character === '\n') return -1;
  }
  return -1;
}

function cssStructure(text, report) {
  let output = '';
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (character === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index + 2);
      if (end < 0) {
        report('an unterminated comment');
        return output;
      }
      index = end + 2;
      continue;
    }
    if (character === '"' || character === "'") {
      const end = readCssString(text, index);
      if (end < 0) {
        report('an unterminated string');
        return output;
      }
      output += `${character}${character}`;
      index = end + 1;
      continue;
    }
    output += character;
    index += 1;
  }
  return output;
}

function validateGlobalCss(file) {
  const label = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  let malformed = false;
  const structure = cssStructure(text, (reason) => {
    malformed = true;
    error(`[FRONTEND.UI.TAILWIND.001] ${label}: global CSS has ${reason}`);
  });
  let depth = 0;
  for (const character of structure) {
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth < 0) {
        error(`[FRONTEND.UI.TAILWIND.001] ${label}: closing brace has no matching opening brace`);
        malformed = true;
        break;
      }
    }
  }
  if (!malformed && depth !== 0) error(`[FRONTEND.UI.TAILWIND.001] ${label}: global CSS has an unclosed block`);
  for (const match of text.matchAll(/@import\s+(["'])([^"']+)\1/g)) {
    if (!allowedGlobalImports.has(match[2]) && !match[2].startsWith('./')) error(`[FRONTEND.UI.TAILWIND.001] ${label}: import '${match[2]}' is outside the approved global CSS surface`);
  }
  classifyGlobalCss(label, structure);
}

// The generated entry imports Tailwind, the shadcn Tailwind layer, and the
// approved animation layer. Anything else is a project styling decision.
const allowedGlobalImports = new Set(['tailwindcss', 'tw-animate-css', 'shadcn/tailwind.css']);

// A top-level classifier, not a CSS parser. It reports the statements the
// convention names as ungoverned: a class or id selector declared in the global
// entry. It deliberately makes no claim about declarations inside a block, and
// the repository adds no parser dependency to make one.
const allowedGlobalAtRules = new Set([
  'import', 'theme', 'layer', 'variant', 'custom-variant', 'plugin', 'utility', 'source',
  'keyframes', 'font-face', 'media', 'supports', 'container', 'property', 'charset', 'page',
]);

function classifyGlobalCss(label, stripped) {
  let depth = 0;
  let statement = '';
  // The generated entry expresses its documented browser base rules with
  // '@apply' inside '@layer base'. That block is accepted generated source, the
  // same way upstream utility classes in installed components are. '@apply'
  // anywhere else hides an unreviewed utility group.
  let topLevelOpener = '';
  let applyOutsideBase = false;
  for (const character of stripped) {
    if (character === '{') {
      if (depth === 0) {
        topLevelOpener = statement.trim();
        reportGlobalStatement(label, statement);
      }
      depth += 1;
      statement = '';
      continue;
    }
    if (character === '}') {
      depth = Math.max(0, depth - 1);
      if (depth === 0) topLevelOpener = '';
      statement = '';
      continue;
    }
    if (character === ';' && depth === 0) {
      reportGlobalStatement(label, statement);
      statement = '';
      continue;
    }
    statement += character;
    if (depth > 0 && statement.includes('@apply') && !/^@layer\s+base\b/.test(topLevelOpener)) {
      applyOutsideBase = true;
      statement = '';
    }
  }
  if (applyOutsideBase) error(`[FRONTEND.UI.TAILWIND.001] ${label}: '@apply' outside the generated '@layer base' block hides an unreviewed utility group`);
}

function reportGlobalStatement(label, statement) {
  const value = statement.trim();
  if (!value) return;
  if (value.startsWith('@')) {
    const name = value.slice(1).split(/[\s(;]/)[0];
    if (!allowedGlobalAtRules.has(name)) error(`[FRONTEND.UI.TAILWIND.001] ${label}: at-rule '@${name}' is outside the approved global CSS surface`);
    return;
  }
  // The generated theme entry declares the color-scheme class itself.
  const allowedClassSelectors = new Set(['.dark', '.light']);
  for (const selector of value.split(',')) {
    const trimmed = selector.trim();
    if (allowedClassSelectors.has(trimmed)) continue;
    if (trimmed.startsWith('.') || trimmed.startsWith('#')) {
      error(`[FRONTEND.UI.TAILWIND.001] ${label}: selector '${trimmed}' is a feature style; use a component variant or semantic token`);
    }
  }
}

// One pass over every page sidecar declaration, before any frontend is read.
// The per-frontend pass below selects the pages whose `app` names that frontend,
// so a page naming a frontend nobody declared is selected by no pass and reports
// nothing. Two pages sharing a route are each valid alone and only collide as a
// pair, which no single-page check sees either.
function validatePageRegistry(project, frontends) {
  const uiDocs = filePath(project.paths?.uiDocs ?? 'docs/ui');
  const declared = new Set(frontends.map((frontend) => frontend.name));
  const routes = new Map();
  for (const pageFile of walk(uiDocs, (file) => file.endsWith('.md'))) {
    const metadata = parseMetadata(pageFile);
    if (!metadata || metadata.kind !== 'page') continue;
    const label = relativeToRoot(pageFile);
    if (!declared.has(metadata.app)) {
      error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: page declares app '${metadata.app}', which no frontend in standards.project.json declares`);
      continue;
    }
    if (!metadata.route) continue;
    const key = `${metadata.app} ${metadata.route}`;
    const owner = routes.get(key);
    if (owner) error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: route '${metadata.route}' in '${metadata.app}' is already declared by '${owner}'`);
    else routes.set(key, label);
  }
}

// ---- acceptance ------------------------------------------------------------

// Every acceptance identifier a sidecar names, resolved to the record beside its
// route and to the file that runs. An identifier with no file is a claim the
// project cannot make, and a file no sidecar names is a run nothing reports.
function validateAcceptance(contract, metadata, frontendRoot, routes, label) {
  const claimed = array(contract, 'evidence', label).filter((id) => typeof id === 'string' && id.startsWith('AC-'));
  const routeFile = routes.get(metadata.route);
  if (!routeFile) {
    if (claimed.length) error(`[FRONTEND.UI.ACCEPTANCE.001] ${label}: names acceptance identifiers, and route '${metadata.route}' has no page file`);
    return;
  }
  const evidenceDirectory = path.join(path.dirname(routeFile), 'evidence');
  const record = path.join(evidenceDirectory, 'acceptance.json');
  const recordLabel = relativeToRoot(record);
  if (!claimed.length) return;
  if (!fs.existsSync(record)) {
    error(`[FRONTEND.UI.PLACEMENT.001] ${label}: no acceptance record at '${recordLabel}'`);
    return;
  }
  const acceptance = readJson(record, recordLabel);
  if (!acceptance) return;
  if (!schemaCheck('acceptance-criteria.schema.json', acceptance, recordLabel, 'FRONTEND.UI.ACCEPTANCE.001')) return;
  if (acceptance.page !== contract.page) error(`[FRONTEND.UI.ACCEPTANCE.001] ${recordLabel}: page must be '${contract.page}'`);
  const criteria = new Map((acceptance.criteria ?? []).map((item) => [item.id, item]));
  for (const id of claimed) {
    const criterion = criteria.get(id);
    if (!criterion) {
      error(`[FRONTEND.UI.ACCEPTANCE.001] ${recordLabel}: '${label}' names '${id}', which the record does not state`);
      continue;
    }
    const spec = path.join(evidenceDirectory, criterion.spec);
    if (!fs.existsSync(spec)) error(`[FRONTEND.UI.ACCEPTANCE.001] ${recordLabel}: '${id}' names '${criterion.spec}', which does not exist`);
  }
  for (const id of criteria.keys()) {
    if (!claimed.includes(id)) error(`[FRONTEND.UI.ACCEPTANCE.001] ${recordLabel}: states '${id}', which '${label}' does not name`);
  }
}

function validatePageSidecars(project, frontend, ui, vocabularyInfo, recipes) {
  const uiDocs = filePath(project.paths?.uiDocs ?? 'docs/ui');
  const frontendRoot = filePath(frontend.path);
  const routes = readRoutes(frontendRoot);
  const stateComponents = new Map();
  for (const component of vocabularyInfo?.vocabulary.components ?? []) {
    for (const state of component.states ?? []) {
      if (!stateComponents.has(state)) stateComponents.set(state, new Set());
      stateComponents.get(state).add(component.id);
    }
  }
  const shellRegions = new Set(
    (vocabularyInfo?.vocabulary.shells ?? []).flatMap((shell) => shell.regions ?? []),
  );
  const pageFiles = walk(uiDocs, (file) => file.endsWith('.md'));
  for (const pageFile of pageFiles) {
    const metadata = parseMetadata(pageFile);
    if (!metadata || metadata.kind !== 'page' || metadata.app !== frontend.name) continue;
    const adjacent = path.join(path.dirname(pageFile), `${path.basename(pageFile, '.md')}.ui.json`);
    const idSidecar = path.join(uiDocs, `${metadata.id}.ui.json`);
    const sidecar = fs.existsSync(adjacent) ? adjacent : idSidecar;
    const pageLabel = relativeToRoot(pageFile);
    if (!fs.existsSync(sidecar)) {
      error(`${pageLabel}: missing UI sidecar (expected '${relativeToRoot(adjacent)}' or '${relativeToRoot(idSidecar)}')`);
      continue;
    }
    const label = relativeToRoot(sidecar);
    const contract = readJson(sidecar, label);
    if (!contract) continue;
    // The schema owns the shape: which keys are required, which values are
    // closed sets, and which strings match a pattern. The checks below are the
    // ones that read a second file, which is what a schema cannot do.
    schemaCheck('ui-page.schema.json', contract, label, 'FRONTEND.UI.PAGE.001');
    if (contract.page !== metadata.id) error(`${label}: page must match '${metadata.id}'`);
    if (contract.profile !== ui.profile) error(`${label}: profile must match frontend UI configuration`);
    validateAcceptance(contract, metadata, frontendRoot, routes, label);
    if (!vocabularyInfo) continue;
    if (!vocabularyInfo.shellIds.has(contract.shell)) error(`${label}: unknown shell '${contract.shell}'`);
    const named = new Set();
    const carried = new Set();
    for (const region of array(contract, 'regions', label)) {
      const regionLabel = `${label}.${region?.id ?? 'region'}`;
      if (region?.id) named.add(region.id);
      if (!vocabularyInfo.patternIds.has(region?.pattern)) error(`${regionLabel}: unknown pattern '${region?.pattern}'`);
      else if (recipes.size) {
        const recipe = recipes.get(recipeName(region.pattern));
        if (!recipe) error(`[FRONTEND.UI.COMPOSITION.001] ${regionLabel}: pattern '${region.pattern}' has no recipe in the composition catalog`);
        else if (recipe.scope !== 'page') error(`[FRONTEND.UI.COMPOSITION.001] ${regionLabel}: recipe '${region.pattern}' is a shell recipe, which a page region does not name`);
        else recipe.consumers.add(contract.page);
      }
      for (const component of array(region, 'components', regionLabel)) {
        if (!vocabularyInfo.componentIds.has(component)) error(`${regionLabel}: unknown component '${component}'`);
        carried.add(component);
      }
    }
    const routeFile = routes.get(metadata.route);
    const inherited = routeFile ? segmentStates(routeFile, frontendRoot) : new Set();
    for (const state of array(contract, 'states', label)) {
      if (!vocabularyInfo.stateIds.has(state)) {
        error(`${label}: unknown state '${state}'`);
        continue;
      }
      if (inherited.has(state)) continue;
      const carriers = stateComponents.get(state);
      if (!carriers || ![...carriers].some((component) => carried.has(component))) {
        const owner = SEGMENT_STATE_FILE[state];
        const answer = owner ? `, and no '${owner}' file sits above its route` : '';
        error(`[FRONTEND.UI.STATE.001] ${label}: state '${state}' is declared, and no component any region names carries it${answer}`);
      }
    }
    // The frozen plan is the sidecar. A region in the source that the sidecar
    // does not name is the section an implementation added after gate B.
    if (routeFile) {
      for (const region of regionsRendered(routeFile, frontendRoot)) {
        if (named.has(region) || shellRegions.has(region)) continue;
        error(`[FRONTEND.UI.GATES.001] ${relativeToRoot(routeFile)}: renders region '${region}', which '${label}' does not name`);
      }
    }
    // An evidence array holds two kinds of identifier from two registers. A
    // `UI-` id is owned by this frontend's vocabulary and is resolved here. An
    // `AC-` or `E2E-` id is owned by the consumer specifications and is resolved
    // by `validate-consumer.mjs`, which reads the acceptance and end-to-end
    // registers this validator never loads.
    for (const evidenceId of array(contract, 'evidence', label)) if (evidenceId.startsWith('UI-') && !vocabularyInfo.evidenceIds.has(evidenceId)) error(`${label}: unknown UI evidence '${evidenceId}'`);
  }

  // Alternate visual systems retain page-contract validation, but their CSS,
  // vendor, and source-lock rules are owned by the override decision. The
  // shadcn source boundary below must not be applied to Bootstrap, MUI, or a
  // bounded specialist system.
  if (ui.system && ui.system !== 'shadcn/ui') return;
  // The missing-key errors are already recorded; the source scan needs both
  // boundaries to say anything useful.
  if (!ui.primitives || !ui.globalCss) return;

  const sourceFiles = walk(frontendRoot, (file) => /\.(?:ts|tsx|js|jsx|css)$/.test(file));
  const globalCss = path.resolve(root, ui.globalCss);
  // Lucide is the manifest-pinned icon family and the baseline installs no icon
  // wrapper, so feature code imports it directly. A component primitive package
  // is a visual authority and stays inside the primitive boundary.
  const vendorImport = /(?:from\s+['"](?:@base-ui\/react|radix-ui|@radix-ui\/)|import\s*\(['"](?:@base-ui\/react|radix-ui|@radix-ui\/))/;
  const runtimeStyleFiles = new Set(
    (vocabularyInfo?.vocabulary.runtimeStyles ?? []).flatMap((record) => (record?.scope ?? []).map((scope) => path.resolve(frontendRoot, scope))),
  );
  for (const source of sourceFiles) {
    const relative = relativeToRoot(source);
    const text = fs.readFileSync(source, 'utf8');
    if (source.endsWith('.css')) {
      if (path.resolve(source) !== path.resolve(globalCss)) error(`[FRONTEND.UI.TAILWIND.001] ${relative}: CSS file is outside the designated global CSS entry`);
      continue;
    }
    for (const match of text.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+\.css)\1/g)) {
      const imported = path.resolve(path.dirname(source), match[2]);
      if (imported !== globalCss) error(`[FRONTEND.UI.TAILWIND.001] ${relative}: CSS import '${match[2]}' is outside the approved global entry`);
    }
    const inPrimitives = within(path.resolve(root, ui.primitives), source);
    const inTests = /(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(source) || /\.(?:test|spec)\.[^.]+$/.test(source);
    if (inPrimitives || inTests) continue;
    if (vendorImport.test(text)) error(`[FRONTEND.UI.GOVERNANCE.001] ${relative}: direct UI vendor import is outside the primitive boundary`);
    const reported = new Set();
    for (const value of classStrings(text)) {
      inspectClassString(value, (kind, token) => {
        const key = `${kind}:${token}`;
        if (reported.has(key)) return;
        reported.add(key);
        error(`[FRONTEND.UI.TAILWIND.001] ${relative}: ${utilityMessages[kind]} '${token}'`);
      });
    }
    if (/style=\{\{/.test(text) && !runtimeStyleFiles.has(path.resolve(source))) {
      error(`[FRONTEND.UI.TAILWIND.001] ${relative}: inline style requires a vocabulary runtimeStyles record for this file`);
    }
  }
}

const projectFile = path.join(root, 'standards.project.json');
if (!fs.existsSync(projectFile)) {
  console.error(`No standards.project.json at ${root}`);
  process.exit(2);
}
const project = readJson(projectFile, 'standards.project.json');
const manifestFile = fs.existsSync(path.join(root, 'standards/standards.manifest.json'))
  ? path.join(root, 'standards/standards.manifest.json')
  : path.join(root, '../standards.manifest.json');
const manifest = fs.existsSync(manifestFile) ? readJson(manifestFile, relativeToRoot(manifestFile)) : null;
const frontends = project?.paths?.frontends ?? [];
let configured = 0;

// A UI rule override suspends the visual baseline, so it carries a review date
// and stops being valid once that date passes. This check is time dependent by
// design; every other check in this validator depends only on repository files.
const today = new Date().toISOString().slice(0, 10);
// The manifest names the id scopes whose overrides expire. The policy is declared
// data, so renaming a scope never silently drops the review requirement.
const reviewScopes = manifest?.overridePolicy?.requiresReviewBy ?? [];
const expires = (provisionId) => reviewScopes.some((scope) => String(provisionId ?? '').startsWith(`${scope}.`));
for (const override of project?.overrides ?? []) {
  if (!expires(override?.provisionId)) continue;
  const label = `override '${override.provisionId}'`;
  if (!override.reviewBy) {
    error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: a UI rule override requires 'reviewBy' with the review or removal date`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(override.reviewBy)) error(`${label}: reviewBy must be YYYY-MM-DD`);
  else if (override.reviewBy < today) error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: review date ${override.reviewBy} has passed; renew the decision or complete the migration`);
  if (override.decision && !fs.existsSync(filePath(override.decision))) error(`${label}: decision does not exist '${override.decision}'`);
}

if (project) validatePageRegistry(project, frontends);
const recipes = project ? readCompositionCatalog(project) : new Map();

for (const frontend of frontends) {
  if (frontend.platform === 'react-web' && !frontend.ui) error(`[FRONTEND.UI.GOVERNANCE.001] frontend '${frontend.name}': react-web frontends require a UI configuration`);
  if (!frontend.ui) continue;
  configured += 1;
  const label = `frontend '${frontend.name}'`;
  if (frontend.platform && frontend.platform !== 'react-web') error(`${label}: UI configuration is only valid for platform react-web`);
  const ui = frontend.ui;
  required(ui, 'profile', label);
  required(ui, 'publicExports', label);
  if (!Array.isArray(ui.publicExports) || ui.publicExports.length === 0) error(`${label}: publicExports must contain at least one export boundary`);
  const effectiveUi = {
    ...(manifest?.uiBaseline ?? {}),
    ...ui,
  };
  // The CLI encodes the component base in the style name. Only the default base
  // has a verified mapping, so a compatibility base states its own value rather
  // than having one guessed from its package name.
  if (ui.base === 'base-ui' && !ui.componentsStyle) effectiveUi.componentsStyle = `base-${effectiveUi.style}`;
  if (ui.base && ui.base !== 'base-ui' && !ui.componentsStyle) {
    error(`[FRONTEND.UI.SHADCN.001] ${label}: a non-default component base must state componentsStyle as the pinned CLI writes it`);
    effectiveUi.componentsStyle = null;
  }
  const selectedSystem = ui.system ?? manifest?.uiBaseline?.system ?? 'shadcn/ui';
  if (!['shadcn/ui', 'bootstrap', 'mui', 'other'].includes(selectedSystem)) error(`${label}: unsupported UI system '${selectedSystem}'`);
  if (ui.reviewBy !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(ui.reviewBy)) error(`${label}: reviewBy must be YYYY-MM-DD`);
  if (selectedSystem === 'shadcn/ui') {
    const baseline = manifest?.uiBaseline;
    if (!baseline) error(`${label}: standards manifest has no uiBaseline`);
    const mismatches = baseline
      ? ['system', 'styling', 'base', 'style', 'cssVariables', 'baseColor', 'theme', 'chartColor', 'font', 'fontHeading', 'icons', 'radius', 'menuAccent', 'menuColor'].filter((key) => Object.prototype.hasOwnProperty.call(ui, key) && ui[key] !== baseline[key])
      : [];
    if (mismatches.length && (!ui.overrideDecision || !ui.reviewBy)) error(`${label}: UI baseline mismatch (${mismatches.join(', ')}) requires overrideDecision and reviewBy`);
    const decodedOverride = ['style', 'baseColor', 'theme', 'chartColor', 'font', 'fontHeading', 'icons', 'radius', 'menuAccent', 'menuColor'].some((key) => Object.prototype.hasOwnProperty.call(ui, key) && baseline && ui[key] !== baseline[key]);
    if (decodedOverride && (!ui.presetCode || !ui.presetFingerprint)) error(`${label}: a preset override requires presetCode and presetFingerprint`);
    if (effectiveUi.presetFingerprint !== presetFingerprint(effectiveUi)) error(`[FRONTEND.UI.SHADCN.001] ${label}: presetFingerprint does not match the decoded preset fields`);
  } else if (!ui.overrideDecision || !ui.reviewBy) {
    error(`${label}: non-default UI system requires overrideDecision and reviewBy`);
  }
  if (ui.overrideDecision && !fs.existsSync(filePath(ui.overrideDecision))) error(`${label}: overrideDecision does not exist '${ui.overrideDecision}'`);
  const frontendRoot = filePath(frontend.path);
  if (!fs.existsSync(frontendRoot)) {
    error(`${label}: frontend path does not exist '${frontend.path}'`);
    continue;
  }
  if (selectedSystem === 'shadcn/ui') {
    for (const key of ['componentsJson', 'vocabulary', 'sourceLock', 'globalCss', 'primitives']) {
      if (required(ui, key, label) && !fs.existsSync(filePath(ui[key]))) error(`${label}: ${key} path does not exist '${ui[key]}'`);
    }
    if (ui.sourceLock && !within(frontendRoot, filePath(ui.sourceLock))) error(`${label}: sourceLock must be inside the frontend root`);
    if (ui.globalCss && !within(frontendRoot, filePath(ui.globalCss))) error(`${label}: globalCss must be inside the frontend root`);
    if (ui.primitives && !within(frontendRoot, filePath(ui.primitives))) error(`${label}: primitives must be inside the frontend root`);
    if (ui.componentsJson && !within(frontendRoot, filePath(ui.componentsJson))) error(`${label}: componentsJson must be inside the frontend root`);
    if (ui.componentsJson && fs.existsSync(filePath(ui.componentsJson))) validateComponentsJson(filePath(ui.componentsJson), effectiveUi);
    const vocabularyFile = ui.vocabulary ? filePath(ui.vocabulary) : null;
    const vocabularyInfo = vocabularyFile && fs.existsSync(vocabularyFile) ? validateVocabulary(vocabularyFile, effectiveUi, frontend.name, frontendRoot, manifest) : null;
    const sourceLockFile = ui.sourceLock ? filePath(ui.sourceLock) : null;
    // Source-lock digests are checked even when the vocabulary is unreadable, so
    // an invalid vocabulary cannot hide source drift.
    if (sourceLockFile && fs.existsSync(sourceLockFile)) validateSourceLock(sourceLockFile, effectiveUi, frontendRoot, vocabularyInfo, manifest);
    if (ui.globalCss && fs.existsSync(filePath(ui.globalCss))) validateGlobalCss(filePath(ui.globalCss));
    validateDependencyBoundary(frontendRoot, effectiveUi);
    validateDesignContract(frontend, ui, frontendRoot, vocabularyInfo, recipes);
    validatePageSidecars(project, frontend, ui, vocabularyInfo, recipes);
  } else {
    validateDesignContract(frontend, ui, frontendRoot, null, recipes);
    validatePageSidecars(project, frontend, ui, null, recipes);
  }
}

// A recipe nobody reaches for is a shape the catalog carries and no page reads.
// The count is reported rather than refused, because the promotion path in
// FRONTEND.UI.CONVENTION.003 is a default a consumer can replace.
const unusedRecipes = [...recipes.values()].filter((recipe) => recipe.scope === 'page' && recipe.consumers.size === 0).map((recipe) => recipe.recipe);
const singleUseRecipes = [...recipes.values()].filter((recipe) => recipe.scope === 'page' && recipe.consumers.size === 1).map((recipe) => recipe.recipe);

if (jsonOutput) {
  console.log(JSON.stringify({
    tool: 'validate-ui',
    consumer: root,
    ok: errors.length === 0,
    configuredFrontends: configured,
    skippedFrontends: configured ? [] : frontends.map((frontend) => ({ name: frontend.name, platform: frontend.platform ?? null })),
    recipes: recipes.size,
    unusedRecipes,
    singleUseRecipes,
    problems: errors,
  }, null, 2));
  process.exit(errors.length ? 1 : 0);
}
console.log(`Consumer: ${root}`);
console.log(`UI-configured frontends: ${configured}`);
console.log(`Composition recipes: ${recipes.size}`);
if (unusedRecipes.length) console.log(`Recipes no page names: ${unusedRecipes.join(', ')}`);
if (singleUseRecipes.length) console.log(`Recipes one page names: ${singleUseRecipes.join(', ')}`);
if (errors.length) {
  console.log(`\nFAIL (${errors.length} problem(s)):`);
  for (const item of errors) console.log(`  - ${item}`);
  process.exit(1);
}
if (!configured) {
  // A silent skip reads as conformance. Naming the frontends and the platform
  // each one declared makes the skipped scope visible in the output that a
  // reviewer reads. (FRONTEND.UI.GOVERNANCE.001)
  const skipped = frontends.map((frontend) => `${frontend.name} (platform: ${frontend.platform ?? 'undeclared'})`);
  console.log('PASS: no React web UI configuration is present; standards migration has not been activated.');
  if (skipped.length) console.log(`Skipped frontends: ${skipped.join(', ')}`);
  else console.log('Skipped frontends: none; the project declares no frontend.');
  process.exit(0);
}
console.log('\nPASS: UI configuration, vocabulary, source locks, page contracts, and source boundaries are valid.');
