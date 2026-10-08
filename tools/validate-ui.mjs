#!/usr/bin/env node
// Reference validator for the controlled React web UI contract.
//
// The validator is deliberately local and deterministic. It reads the shared UI
// package the consumer declares, its registry configuration, its source lock, its
// design contract, its stylesheets, and the pattern catalog when the consumer
// declares one, then checks the boundary each frontend
// keeps. It never fetches a registry or a package. Consumers may add stricter AST
// rules, but they should preserve these checks.
//
// It reads no page document. The route code is the page contract, and the route
// suite proves each route in a browser.
// (standards/rule/frontend-ui.check-every-route-in-a-browser)
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
  'node_modules', '.next', 'out', 'dist', 'build', '.output', '.svelte-kit', 'coverage', 'android', 'ios', '.tanstack', 'test-results', 'playwright-report',
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

function inspectClassString(value, report, options = {}) {
  // An arbitrary variant declares context rather than a value, so it is a drift
  // in authored feature code and an ordinary declaration inside a shared
  // composite. Only the caller knows which it is reading.
  const variants = options.variants ?? true;
  for (const token of value.split(/\s+/)) {
    if (!token || token.includes('${')) continue;
    if (token.startsWith('!') || token.endsWith('!')) report('important', token);
    const segments = splitVariants(token.replace(/^!/, '').replace(/!$/, ''));
    const utility = segments.pop() ?? '';
    if (variants) {
      for (const variant of segments) {
        if (variant.includes('[') && !allowedBracketVariant.test(variant)) report('selector', token);
      }
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

// ---- shared UI package ------------------------------------------------------

// The registry configuration the pinned CLI wrote. It is read against the
// manifest baseline, so a package describing a preset the release does not pin
// reports rather than passing unread.
function validateComponentsJson(file, baseline, baselineOverride) {
  const label = relativeToRoot(file);
  const config = readJson(file, label);
  if (!config) return;
  const expected = {
    style: baseline.componentsStyle,
    iconLibrary: baseline.icons,
    menuColor: baseline.menuColor,
    menuAccent: baseline.menuAccent,
    rtl: false,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (config[key] !== value) error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: ${key} must be ${JSON.stringify(value)}`);
  }
  if (config.tailwind?.baseColor !== baseline.baseColor) error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: tailwind.baseColor must be '${baseline.baseColor}'`);
  if (config.tailwind?.cssVariables !== baseline.cssVariables) error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: tailwind.cssVariables must be ${baseline.cssVariables}`);
  if (config.registries && Object.keys(config.registries).length > 0 && !baselineOverride) {
    error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: an additional registry requires an override decision`);
  }
}

// The source lock describes one copy of the registry source. Its paths resolve
// against the package root rather than an application root, so a second
// application cannot hold a copy the lock does not see.
function validateSourceLock(file, baseline, packageRoot, manifest, baselineOverride) {
  const label = relativeToRoot(file);
  const lock = readJson(file, label);
  if (!lock) return;
  for (const key of ['schemaVersion', 'generator', 'cli', 'preset', 'registry', 'formatter', 'components']) required(lock, key, label);
  schemaCheck('ui-source-lock.schema.json', lock, label, 'standards/rule/frontend-ui.track-source-changes');
  const expectedCli = manifest?.packages?.npm?.shadcn;
  // The pinned-version test already rejects `latest` and every other range, so
  // no separate branch for the word is reachable.
  if (!/^\d+\.\d+\.\d+$/.test(lock.cli ?? '')) error(`${label}: cli must be a pinned semantic version`);
  else if (expectedCli && lock.cli !== expectedCli) error(`${label}: cli must match manifest shadcn pin '${expectedCli}'`);
  if ((lock.registry?.name !== 'shadcn' || lock.registry?.url !== 'https://ui.shadcn.com') && !baselineOverride) error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: registry '${lock.registry?.name ?? '(unnamed)'}' is not the built-in shadcn registry; an additional registry requires an override decision`);
  for (const key of ['style', 'base', 'cssVariables', 'baseColor', 'theme', 'chartColor', 'font', 'fontHeading', 'icons', 'radius', 'menuAccent', 'menuColor', 'componentsStyle']) {
    if (baseline[key] !== undefined && lock.preset?.[key] !== baseline[key]) {
      error(`[standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package] ${label}: preset.${key} does not match the manifest baseline`);
    }
  }
  const pinnedPackages = new Set(Object.keys(manifest?.packages?.npm ?? {}));
  const items = array(lock, 'components', label);
  unique(items.map((item) => item?.name), `${label}.components`);
  for (const item of items) {
    const itemLabel = `${label}.${item?.name ?? 'component'}`;
    for (const key of ['name', 'address', 'status', 'paths', 'digest', 'dependencies']) required(item, key, itemLabel);
    for (const dependency of array(item, 'dependencies', itemLabel)) {
      if (!pinnedPackages.has(dependency)) error(`[standards/rule/frontend-ui.track-source-changes] ${itemLabel}: dependency '${dependency}' is not pinned in the standards manifest`);
    }
    for (const relative of array(item, 'paths', itemLabel)) {
      const candidate = path.resolve(packageRoot, relative);
      if (!within(packageRoot, candidate)) {
        error(`${itemLabel}: path escapes the shared package root '${relative}'`);
        continue;
      }
      if (!fs.existsSync(candidate)) {
        error(`${itemLabel}: source path does not exist '${relative}'`);
        continue;
      }
      if (digest(candidate) !== item.digest && item.status === 'baseline') {
        error(`[standards/rule/frontend-ui.track-source-changes] ${itemLabel}: '${relative}' no longer matches the recorded digest; record it as extended or forked`);
      }
    }
  }
}

const DESIGN_SECTIONS = ['Brand', 'Tokens', 'Vocabulary', 'Patterns', 'Do', 'Do not', 'Motion', 'Voice'];

// The design contract travels with the shared package, so it is read once for the
// workspace rather than once per application. A floorplan it names outside the
// closed set is a design decision, not a route-level choice.
// (standards/rule/frontend-ui.publish-a-design-contract,
// standards/rule/frontend-ui.declare-a-closed-floorplan-set)
function validateDesignContract(pkg) {
  const label = relativeToRoot(filePath(pkg.designContract));
  const file = filePath(pkg.designContract);
  if (!fs.existsSync(file)) {
    error(`[standards/rule/frontend-ui.publish-a-design-contract] shared package '${pkg.name}': no design contract at '${pkg.designContract}'`);
    return null;
  }
  const metadata = parseMetadata(file);
  if (!metadata) {
    error(`[standards/rule/frontend-ui.publish-a-design-contract] ${label}: design contract has no metadata block`);
    return null;
  }
  schemaCheck('design-contract.schema.json', metadata, label, 'standards/rule/frontend-ui.publish-a-design-contract');
  if (pkg.name && metadata.package !== pkg.name) {
    error(`[standards/rule/frontend-ui.publish-a-design-contract] ${label}: package must be '${pkg.name}'`);
  }
  const present = new Set(sectionNames(fs.readFileSync(file, 'utf8')));
  for (const section of DESIGN_SECTIONS) {
    if (!present.has(section)) error(`[standards/rule/frontend-ui.publish-a-design-contract] ${label}: missing required section '${section}'`);
  }
  return metadata;
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

// ---- stylesheets ------------------------------------------------------------

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
    error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: global CSS has ${reason}`);
  });
  let depth = 0;
  for (const character of structure) {
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth < 0) {
        error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: closing brace has no matching opening brace`);
        malformed = true;
        break;
      }
    }
  }
  if (!malformed && depth !== 0) error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: global CSS has an unclosed block`);
  // The packages the manifest already pins. A pinned font family is a token, so
  // importing one from the token sheet is the sheet doing its job rather than a
  // project reaching for a stylesheet the sheet cannot see.
  const pinned = new Set(Object.keys(manifest?.packages?.npm ?? {}));
  for (const match of text.matchAll(/@import\s+(["'])([^"']+)\1/g)) {
    // The token sheet may import the Tailwind layer, the approved animation
    // layer, and any package the manifest already pins.
    const specifier = match[2];
    if (allowedGlobalImports.has(specifier) || specifier.startsWith('./')) continue;
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (!pinned.has(packageName)) {
      error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: import '${specifier}' is outside the approved global CSS surface`);
    }
  }
  classifyGlobalCss(label, structure);
}

// The shared package's entry imports Tailwind, its own token layer, and the
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
  if (applyOutsideBase) error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: '@apply' outside the generated '@layer base' block hides an unreviewed utility group`);
}

function reportGlobalStatement(label, statement) {
  const value = statement.trim();
  if (!value) return;
  if (value.startsWith('@')) {
    const name = value.slice(1).split(/[\s(;]/)[0];
    if (!allowedGlobalAtRules.has(name)) error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: at-rule '@${name}' is outside the approved global CSS surface`);
    return;
  }
  // The generated theme entry declares the color-scheme class itself.
  const allowedClassSelectors = new Set(['.dark', '.light']);
  for (const selector of value.split(',')) {
    const trimmed = selector.trim();
    if (allowedClassSelectors.has(trimmed)) continue;
    if (trimmed.startsWith('.') || trimmed.startsWith('#')) {
      error(`[standards/rule/frontend-ui.restrict-css-decisions] ${label}: selector '${trimmed}' is a feature style; use a component variant or semantic token`);
    }
  }
}

// An application stylesheet imports the shared package's tokens and writes any
// value from a token. A literal colour or a literal size here is a second token
// sheet beside the first, so every declaration is held to the custom-property
// form. A frontend holding no shared composite still declares its focus ring and
// its device rules here, from the same tokens.
function validateFrontendStylesheet(file, packageRoot, pkg) {
  const label = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  const structure = cssStructure(text, () => {});
  const imports = [...text.matchAll(/@import\s+(["'])([^"']+)\1/g)].map((match) => match[2]);
  if (!imports.length) {
    error(`[standards/rule/frontend-ui.keep-tokens-in-one-stylesheet] ${label}: imports no stylesheet; an application stylesheet imports the shared package's token stylesheet`);
    return;
  }
  for (const value of imports) {
    if (value.startsWith('./') || value.startsWith('../')) continue;
    if (!value.startsWith(`${pkg.name}/`)) {
      error(`[standards/rule/frontend-ui.keep-tokens-in-one-stylesheet] ${label}: import '${value}' is outside the shared package '${pkg.name}'`);
    }
  }
  for (const match of structure.matchAll(/\{([^}]*)\}/g)) {
    for (const declaration of match[1].split(';')) {
      const property = declaration.split(':')[0]?.trim();
      // A custom property is a token. An at-rule is `@apply`, `@media`, or a
      // variant, none of which writes a value of its own here. Anything else
      // that reads as a CSS property is a literal the token sheet owns.
      if (!property || property.startsWith('--') || property.startsWith('@')) continue;
      if (!/^-?[a-z][a-z0-9-]*$/i.test(property)) continue;
      error(`[standards/rule/frontend-ui.keep-tokens-in-one-stylesheet] ${label}: declares '${property}'; a value written in an application belongs in the shared package's tokens`);
    }
  }
  if (!within(path.resolve(root), packageRoot)) {
    error(`[standards/rule/frontend-ui.keep-tokens-in-one-stylesheet] ${label}: the shared package root '${pkg.path}' is outside the workspace`);
  }
}

// ---- source scan ------------------------------------------------------------

// A stylesheet the shared package ships beside the token sheet carries
// utilities, device rules, and display helpers, written from tokens. A literal
// colour here is a second token sheet beside the first, so every stylesheet but
// the token sheet is held to the same rule as an application stylesheet.
// (standards/rule/frontend-ui.keep-tokens-in-one-stylesheet)
function validateSharedStylesheets(packageRoot, tokensFile) {
  const tokenPath = path.resolve(tokensFile);
  const files = walk(packageRoot, (candidate) => candidate.endsWith('.css'));
  for (const file of files) {
    if (path.resolve(file) === tokenPath) continue;
    if (/(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(file)) continue;
    const label = relativeToRoot(file);
    const structure = cssStructure(fs.readFileSync(file, 'utf8'), () => {});
    const reported = new Set();
    for (const match of structure.matchAll(/\b(?:oklch|rgba?|hsla?)\(|#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b/g)) {
      if (reported.has(match[0])) continue;
      reported.add(match[0]);
      error(`[standards/rule/frontend-ui.keep-tokens-in-one-stylesheet] ${label}: literal colour '${match[0]}' belongs in the token stylesheet`);
    }
  }
}

// One pass over the shared package. The Tailwind utility rules apply to every
// authored file outside the copied primitive boundary and the tests. The shared
// package owns the primitive library, so its composites import it deliberately;
// an application does not, and `validateApplicationImports` refuses it there.
// (standards/rule/frontend-ui.restrict-css-decisions)
function validateSourceScan(target, primitives) {
  const files = walk(target, (file) => /\.(?:ts|tsx|js|jsx)$/.test(file));
  for (const source of files) {
    const relative = relativeToRoot(source);
    const text = fs.readFileSync(source, 'utf8');
    const inPrimitives = primitives && within(primitives, source);
    const inTests = /(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(source) || /\.(?:test|spec)\.[^.]+$/.test(source);
    if (inPrimitives || inTests) continue;
    const reported = new Set();
    for (const value of classStrings(text)) {
      inspectClassString(value, (kind, token) => {
        const key = `${kind}:${token}`;
        if (reported.has(key)) return;
        reported.add(key);
        error(`[standards/rule/frontend-ui.restrict-css-decisions] ${relative}: ${utilityMessages[kind]} '${token}'`);
      }, { variants: false });
    }
    // A visual file is the one drawing no shared component makes, so it lays
    // itself out. The utility rules above still apply to it, so it stays on
    // semantic tokens.
    if (/\.visual\.tsx?$/.test(source)) continue;
  }
}

// An application composes the shared package's exported entry points. It reaches
// no primitive library and no internal package path.
const APPLICATION_IMPORT_BOUNDARIES = [
  { pattern: /['"](@base-ui\/react|radix-ui|@radix-ui\/)/, message: 'imports the primitive library directly; import the shared package\'s component' },
  { pattern: /['"]@(?:[a-z0-9-]+\/)?ui\/(?:lib|hooks)\//, message: 'imports an internal shared package path; import a documented entry point' },
  { pattern: /['"]@tanstack\/react-table['"]/, message: "imports the table library directly; import the shared package's data table" },
];

function validateApplicationImports(frontendRoot, pkg) {
  const files = walk(frontendRoot, (file) => /\.(?:ts|tsx|js|jsx)$/.test(file));
  for (const source of files) {
    const relative = relativeToRoot(source);
    if (/\.(?:test|spec)\.[^.]+$/.test(source)) continue;
    if (/(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(source)) continue;
    const text = fs.readFileSync(source, 'utf8');
    for (const boundary of APPLICATION_IMPORT_BOUNDARIES) {
      if (!boundary.pattern.test(text)) continue;
      // The scanner is a reference check, not a linter. A file that composes the
      // shared package's components may quote a library name in a doc comment, so
      // only a real import statement counts.
      const statements = [...text.matchAll(/(?:^|\n)\s*(?:import|export)[^;\n]*['"][^'"]+['"]/g)].map((match) => match[0]);
      if (!statements.some((statement) => boundary.pattern.test(statement))) continue;
      error(`[standards/rule/frontend-components.compose-composites-in-page-code] ${relative}: ${boundary.message} from shared package '${pkg.name}'`);
    }
  }
}

// A workspace hoists dependencies, so a second visual system declared at the
// repository root or in another shared package reaches every frontend without
// appearing in any frontend manifest.
function packageManifests() {
  const files = new Set();
  const rootManifest = path.join(root, 'package.json');
  if (fs.existsSync(rootManifest)) files.add(rootManifest);
  for (const directory of ['packages', 'apps']) {
    for (const file of walk(path.join(root, directory), (file) => path.basename(file) === 'package.json')) files.add(file);
  }
  return [...files];
}

function validateDependencyBoundary() {
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
  for (const file of packageManifests()) {
    const label = relativeToRoot(file);
    const packageJson = readJson(file, label);
    if (!packageJson) continue;
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
    for (const name of visualPackages) {
      if (dependencies[name]) error(`[standards/rule/frontend-ui.select-one-visual-authority] ${label}: second general-purpose visual dependency '${name}' requires an override`);
    }
  }
}

// ---- pattern catalog --------------------------------------------------------

// The pattern catalog records one decision per recurring UI question: the
// options considered, the option chosen, the compact behaviour, and the
// implementation per platform. The schema proves the shape; the checks below
// prove the references the schema cannot see across properties, so every named
// option, breakpoint, group, and component path resolves.
function validatePatternCatalog(relative) {
  const file = filePath(relative);
  const label = relativeToRoot(file);
  if (!fs.existsSync(file)) {
    error(`[standards/rule/frontend-patterns.keep-one-pattern-catalog] pattern catalog: no catalog at '${relative}'`);
    return;
  }
  const catalog = readJson(file, label);
  if (!catalog) return;
  schemaCheck('ui-pattern-catalog.schema.json', catalog, label, 'standards/rule/frontend-patterns.keep-one-pattern-catalog');
  // A catalog that breaks the schema still reads below, so each access guards
  // its own shape rather than assuming the schema proved it.
  const breakpoints = catalog.breakpoints && typeof catalog.breakpoints === 'object' && !Array.isArray(catalog.breakpoints)
    ? new Set(Object.keys(catalog.breakpoints))
    : new Set();
  const groupIds = new Set(Array.isArray(catalog.groups) ? catalog.groups.map((group) => group?.id) : []);
  const patterns = Array.isArray(catalog.patterns) ? catalog.patterns : [];
  const seenPatterns = new Set();
  for (const pattern of patterns) {
    const id = pattern?.id ?? '(unnamed)';
    if (pattern?.id !== undefined) {
      if (seenPatterns.has(pattern.id)) error(`[standards/rule/frontend-patterns.keep-one-pattern-catalog] ${label}: duplicate pattern id '${pattern.id}'`);
      seenPatterns.add(pattern.id);
    }
    const where = `${label}: pattern '${id}'`;
    const options = Array.isArray(pattern?.options) ? pattern.options : [];
    const optionIds = new Set(options.map((option) => option?.id));
    const seenOptions = new Set();
    for (const option of options) {
      if (option?.id === undefined) continue;
      if (seenOptions.has(option.id)) error(`[standards/rule/frontend-patterns.keep-one-pattern-catalog] ${where} has a duplicate option id '${option.id}'`);
      seenOptions.add(option.id);
    }
    if (pattern?.group !== undefined && !groupIds.has(pattern.group)) {
      error(`[standards/rule/frontend-patterns.keep-one-pattern-catalog] ${where}: group '${pattern.group}' is not one of the catalog groups`);
    }
    if (pattern?.decision?.option !== undefined && !optionIds.has(pattern.decision.option)) {
      error(`[standards/rule/frontend-patterns.record-every-option-considered] ${where}: decision.option '${pattern.decision.option}' is not one of its options`);
    }
    if (pattern?.compact?.breakpoint !== undefined && !breakpoints.has(pattern.compact.breakpoint)) {
      error(`[standards/rule/frontend-patterns.declare-the-compact-behaviour] ${where}: compact.breakpoint '${pattern.compact.breakpoint}' is not a key of breakpoints`);
    }
    if (pattern?.compact?.option !== undefined && !optionIds.has(pattern.compact.option)) {
      error(`[standards/rule/frontend-patterns.declare-the-compact-behaviour] ${where}: compact.option '${pattern.compact.option}' is not one of its options`);
    }
    const extensions = Array.isArray(pattern?.extensions) ? pattern.extensions : [];
    extensions.forEach((extension, index) => {
      if (extension?.option !== undefined && !optionIds.has(extension.option)) {
        error(`[standards/rule/frontend-patterns.record-every-option-considered] ${where}: extensions[${index}].option '${extension.option}' is not one of its options`);
      }
    });
    const implementations = pattern?.implementations && typeof pattern.implementations === 'object' && !Array.isArray(pattern.implementations)
      ? Object.entries(pattern.implementations)
      : [];
    for (const [platform, implementation] of implementations) {
      const target = `${where}: implementations.${platform}`;
      if (Array.isArray(implementation?.components)) {
        implementation.components.forEach((component, index) => {
          if (typeof component !== 'string' || !component) return;
          if (!fs.existsSync(filePath(component))) {
            error(`[standards/rule/frontend-patterns.implement-a-chosen-pattern-once] ${target}.components[${index}] does not exist '${component}'`);
          }
        });
      }
      const components = implementation?.components;
      if (implementation?.status === 'adopted' && (components === undefined || (Array.isArray(components) && components.length === 0))) {
        error(`[standards/rule/frontend-patterns.implement-a-chosen-pattern-once] ${target} has status 'adopted' with no components`);
      }
      const gap = implementation?.gap;
      if ((implementation?.status === 'partial' || implementation?.status === 'pending') && (gap === undefined || gap === null || gap === '')) {
        error(`[standards/rule/frontend-patterns.state-the-implementation-status] ${target} has status '${implementation.status}' with no gap`);
      }
    }
  }
}

// ---- run --------------------------------------------------------------------

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
const baseline = manifest?.uiBaseline ?? null;
const frontends = project?.paths?.frontends ?? [];
const controlled = frontends.filter((frontend) => frontend?.platform === 'react-web');
const skipped = frontends.filter((frontend) => frontend?.platform && frontend.platform !== 'react-web');
let checked = 0;

// A UI rule override carries a review date and stops being valid once that date
// passes. This check is time dependent by design; every other check in this
// validator depends only on repository files.
const today = new Date().toISOString().slice(0, 10);
// The manifest names the id scopes whose overrides expire. The policy is declared
// data, so renaming a scope never silently drops the review requirement.
const reviewScopes = manifest?.overridePolicy?.requiresReviewBy ?? [];
const expires = (provisionId) => reviewScopes.some((scope) => String(provisionId ?? '').startsWith(`${scope}.`));
for (const override of project?.overrides ?? []) {
  if (!expires(override?.provisionId)) continue;
  const label = `override '${override.provisionId}'`;
  if (!override.reviewBy) {
    error(`[standards/rule/frontend-ui.select-one-visual-authority] ${label}: a UI rule override requires 'reviewBy' with the review or removal date`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(override.reviewBy)) error(`${label}: reviewBy must be YYYY-MM-DD`);
  else if (override.reviewBy < today) error(`[standards/rule/frontend-ui.select-one-visual-authority] ${label}: review date ${override.reviewBy} has passed; renew the decision`);
  if (override.decision && !fs.existsSync(filePath(override.decision))) error(`${label}: decision does not exist '${override.decision}'`);
}

// A controlled frontend composes the shared package, so the workspace declares
// it once. A frontend that composes no shared component carries no UI block.
// (standards/rule/frontend-ui.select-one-visual-authority)
// An additional registry passes both registry gates under an override decision
// against the pinned baseline provision. The review date on that decision is
// checked above; the gates below check its presence.
const baselineOverride = (project?.overrides ?? []).some((override) => override?.provisionId === 'standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package');
const pkg = project?.paths?.uiPackage ?? null;
if (!controlled.length && pkg) {
  error('standards.project.json: paths.uiPackage is declared but no frontend declares the platform react-web');
}
if (controlled.length && !pkg) {
  error(`standards/rule/frontend-ui.select-one-visual-authority standards.project.json: ${controlled.length} controlled frontend(s) and no paths.uiPackage`);
}

let packageSummary = null;

if (pkg) {
  const label = `shared package '${pkg.name ?? '(unnamed)'}'`;
  if (!baseline) error(`${label}: the standards manifest has no uiBaseline`);
  for (const key of ['name', 'path', 'componentsJson', 'primitives', 'tokens', 'sourceLock', 'designContract']) required(pkg, key, label);
  const exports = array(pkg, 'publicExports', label);
  if (exports.length === 0) error(`${label}: publicExports must contain at least one entry point`);
  unique(exports, `${label}.publicExports`);
  const packageRoot = pkg.path ? filePath(pkg.path) : null;
  if (packageRoot && !fs.existsSync(packageRoot)) {
    error(`${label}: path does not exist '${pkg.path}'`);
  }
  for (const key of ['componentsJson', 'sourceLock', 'designContract']) {
    if (!pkg[key]) continue;
    const candidate = filePath(pkg[key]);
    if (packageRoot && !within(packageRoot, candidate)) {
      error(`${label}: ${key} must live inside the shared package root '${pkg.path}'`);
    } else if (!fs.existsSync(candidate)) {
      error(`${label}: ${key} path does not exist '${pkg[key]}'`);
    }
  }
  if (packageRoot) {
    for (const key of ['primitives', 'tokens']) {
      if (!pkg[key]) continue;
      const candidate = filePath(pkg[key]);
      if (!within(packageRoot, candidate)) error(`${label}: ${key} must live inside the shared package root '${pkg.path}'`);
      else if (!fs.existsSync(candidate)) error(`${label}: ${key} path does not exist '${pkg[key]}'`);
    }
    if (baseline) {
      if (pkg.componentsJson && fs.existsSync(filePath(pkg.componentsJson))) validateComponentsJson(filePath(pkg.componentsJson), baseline, baselineOverride);
      if (pkg.sourceLock && fs.existsSync(filePath(pkg.sourceLock))) validateSourceLock(filePath(pkg.sourceLock), baseline, packageRoot, manifest, baselineOverride);
      if (pkg.designContract) validateDesignContract(pkg);
      if (pkg.tokens && fs.existsSync(filePath(pkg.tokens))) validateGlobalCss(filePath(pkg.tokens));
      if (pkg.tokens) validateSharedStylesheets(packageRoot, filePath(pkg.tokens));
      validateSourceScan(packageRoot, pkg.primitives ? path.resolve(filePath(pkg.primitives)) : null);
    }
    packageSummary = { name: pkg.name, path: pkg.path, exports };
  }
  validateDependencyBoundary();
}

for (const frontend of controlled) {
  const label = `frontend '${frontend.name}'`;
  if (!frontend.ui) {
    error(`${label}: a react-web frontend requires a 'ui' block declaring its density profile`);
    continue;
  }
  required(frontend.ui, 'profile', label);
  if (!['public-light', 'application-balanced', 'admin-dense'].includes(frontend.ui.profile)) {
    error(`${label}: profile must be one of public-light, application-balanced, admin-dense`);
  }
  const frontendRoot = frontend.path ? filePath(frontend.path) : null;
  if (frontendRoot && !fs.existsSync(frontendRoot)) {
    error(`${label}: frontend path does not exist '${frontend.path}'`);
    continue;
  }
  checked += 1;
  if (frontend.ui.globalCss) {
    const stylesheet = filePath(frontend.ui.globalCss);
    if (!fs.existsSync(stylesheet)) error(`${label}: globalCss path does not exist '${frontend.ui.globalCss}'`);
    else if (pkg) validateFrontendStylesheet(stylesheet, filePath(pkg.path), pkg);
  }
  if (frontendRoot) {
    validateApplicationImports(frontendRoot, pkg ?? { name: '(undeclared)' });
    const sources = walk(frontendRoot, (file) => /\.(?:ts|tsx|js|jsx)$/.test(file));
    for (const source of sources) {
      const relative = relativeToRoot(source);
      if (/\.(?:test|spec)\.[^.]+$/.test(source)) continue;
      if (/(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(source)) continue;
      if (!/\.visual\.tsx?$/.test(source)) continue;
      // A visual file lays itself out, and it is the one place in an application
      // where class names belong. The utility rule still applies, so the drawing
      // stays on semantic tokens and on no raw palette value.
      const text = fs.readFileSync(source, 'utf8');
      const seen = new Set();
      for (const value of classStrings(text)) {
        inspectClassString(value, (kind, token) => {
          const key = `${kind}:${token}`;
          if (seen.has(key)) return;
          seen.add(key);
          error(`[standards/rule/frontend-ui.restrict-css-decisions] ${relative}: ${utilityMessages[kind]} '${token}'`);
        });
      }
    }
    for (const source of sources) {
      const relative = relativeToRoot(source);
      if (/\.(?:test|spec)\.[^.]+$/.test(source)) continue;
      if (/(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])/.test(source)) continue;
      // A visual file lays itself out. Its class names are read above.
      if (/\.visual\.tsx?$/.test(source)) continue;
      if (/style=\{\{/.test(fs.readFileSync(source, 'utf8'))) {
        error(`[standards/rule/frontend-ui.restrict-css-decisions] ${relative}: an inline style belongs in a shared component`);
      }
    }
  }
}

// A workspace that records pattern decisions keeps one catalog beside its
// design contract. A workspace without one reports nothing here.
// (standards/rule/frontend-patterns.keep-one-pattern-catalog)
if (project?.paths?.uiPatterns) {
  validatePatternCatalog(project.paths.uiPatterns);
}

if (jsonOutput) {
  console.log(JSON.stringify({
    tool: 'validate-ui',
    consumer: root,
    ok: errors.length === 0,
    sharedPackage: packageSummary,
    controlledFrontends: checked,
    skippedFrontends: skipped.map((frontend) => ({ name: frontend.name, platform: frontend.platform ?? null })),
    problems: errors,
  }, null, 2));
  process.exit(errors.length ? 1 : 0);
}
console.log(`Consumer: ${root}`);
console.log(`Shared UI package: ${packageSummary ? `${packageSummary.name} at ${packageSummary.path}` : 'none declared'}`);
console.log(`Controlled frontends: ${checked}`);
if (skipped.length) console.log(`Skipped frontends: ${skipped.map((frontend) => `${frontend.name} (platform: ${frontend.platform})`).join(', ')}`);
if (errors.length) {
  console.log(`\nFAIL (${errors.length} problem(s)):`);
  for (const item of errors) console.log(`  - ${item}`);
  process.exit(1);
}
if (!pkg) {
  // A silent skip reads as conformance. Naming the frontends and the platform
  // each one declared makes the skipped scope visible in the output that a
  // reviewer reads. (standards/rule/frontend-ui.record-a-frontend-outside-the-controlled-contract)
  const declared = frontends.map((frontend) => `${frontend.name} (platform: ${frontend.platform ?? 'undeclared'})`);
  console.log('PASS: no controlled React web frontend is present.');
  if (declared.length) console.log(`Skipped frontends: ${declared.join(', ')}`);
  else console.log('Skipped frontends: none; the project declares no frontend.');
  process.exit(0);
}
console.log('\nPASS: the shared package, its source lock, its design contract, its stylesheets, and each frontend boundary are valid.');