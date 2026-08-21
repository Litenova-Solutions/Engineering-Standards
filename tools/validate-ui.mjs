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

const root = path.resolve(process.argv[2] ?? '.');
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

function digest(file) {
  return `sha256:${crypto.createHash('sha256').update(normalizeSource(fs.readFileSync(file, 'utf8'))).digest('hex')}`;
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

function literals(region) {
  const found = [];
  for (const match of region.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) found.push(match[1] ?? match[2] ?? match[3] ?? '');
  return found;
}

function classStrings(text) {
  const found = [];
  for (const match of text.matchAll(/\b(?:className|class)\s*=\s*/g)) {
    const start = match.index + match[0].length;
    const opener = text[start];
    if (opener === '"' || opener === "'" || opener === '`') {
      const end = text.indexOf(opener, start + 1);
      if (end > start) found.push(text.slice(start + 1, end));
      continue;
    }
    if (opener === '{') {
      const region = balanced(text, start, '{', '}');
      if (region !== null) found.push(...literals(region));
    }
  }
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
const allowedBracketVariant = /^(?:group|peer|has|not|in|data|aria|supports|min|max|nth|nth-last|nth-of-type|nth-last-of-type)-\[/;
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
  if (!/^\d+\.\d+\.\d+$/.test(lock.cli ?? '')) error(`${label}: cli must be a pinned semantic version`);
  if (lock.cli === 'latest') error(`${label}: cli may not be latest`);
  if (expectedCli && lock.cli !== expectedCli) error(`${label}: cli must match manifest shadcn pin '${expectedCli}'`);
  if (!/^sha256:[a-f0-9]{64}$/.test(lock.preset?.fingerprint ?? '')) error(`${label}: preset fingerprint must be a sha256 digest`);
  if (lock.registry?.name !== 'shadcn' || lock.registry?.url !== 'https://ui.shadcn.com') error(`${label}: only the built-in shadcn registry is allowed`);
  const presetKeys = ['code', 'style', 'base', 'cssVariables', 'baseColor', 'theme', 'chartColor', 'font', 'fontHeading', 'icons', 'radius', 'menuAccent', 'menuColor', 'componentsStyle'];
  for (const key of presetKeys) {
    const expected = key === 'code' ? ui.presetCode : key === 'fingerprint' ? ui.presetFingerprint : ui[key];
    const actual = key === 'code' ? lock.preset?.code : lock.preset?.[key];
    if (expected !== undefined && actual !== expected) error(`${label}: preset.${key} does not match frontend UI configuration`);
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
    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
      ...(packageJson.peerDependencies ?? {}),
    };
    for (const name of visualPackages) if (dependencies[name]) error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: second general-purpose visual dependency '${name}' requires an override`);
  }
}

function validateGlobalCss(file) {
  const label = relativeToRoot(file);
  const text = fs.readFileSync(file, 'utf8');
  let depth = 0;
  let inComment = false;
  for (let index = 0; index < text.length; index += 1) {
    if (!inComment && text[index] === '/' && text[index + 1] === '*') {
      inComment = true;
      index += 1;
      continue;
    }
    if (inComment && text[index] === '*' && text[index + 1] === '/') {
      inComment = false;
      index += 1;
      continue;
    }
    if (inComment) continue;
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') depth -= 1;
    if (depth < 0) error(`[FRONTEND.UI.TAILWIND.001] ${label}: closing brace has no matching opening brace`);
  }
  if (inComment || depth !== 0) error(`[FRONTEND.UI.TAILWIND.001] ${label}: global CSS has unbalanced comments or braces`);
  for (const match of text.matchAll(/@import\s+(["'])([^"']+)\1/g)) {
    if (!allowedGlobalImports.has(match[2]) && !match[2].startsWith('./')) error(`[FRONTEND.UI.TAILWIND.001] ${label}: import '${match[2]}' is outside the approved global CSS surface`);
  }
  classifyGlobalCss(label, text);
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

function classifyGlobalCss(label, text) {
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '');
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

function validatePageSidecars(project, frontend, ui, vocabularyInfo) {
  const uiDocs = filePath(project.paths?.uiDocs ?? 'docs/ui');
  const frontendRoot = filePath(frontend.path);
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
    for (const key of ['schemaVersion', 'page', 'profile', 'shell', 'regions', 'states', 'initial', 'responsive', 'focus', 'accessibility', 'evidence']) required(contract, key, label);
    if (contract.schemaVersion !== 1) error(`${label}: schemaVersion must be 1`);
    if (contract.page !== metadata.id) error(`${label}: page must match '${metadata.id}'`);
    if (contract.profile !== ui.profile) error(`${label}: profile must match frontend UI configuration`);
    if (!vocabularyInfo) continue;
    if (!vocabularyInfo.shellIds.has(contract.shell)) error(`${label}: unknown shell '${contract.shell}'`);
    for (const region of array(contract, 'regions', label)) {
      const regionLabel = `${label}.${region?.id ?? 'region'}`;
      if (!vocabularyInfo.patternIds.has(region?.pattern)) error(`${regionLabel}: unknown pattern '${region?.pattern}'`);
      for (const component of array(region, 'components', regionLabel)) if (!vocabularyInfo.componentIds.has(component)) error(`${regionLabel}: unknown component '${component}'`);
    }
    for (const state of array(contract, 'states', label)) if (!vocabularyInfo.stateIds.has(state)) error(`${label}: unknown state '${state}'`);
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
const expires = (ruleId) => reviewScopes.some((scope) => String(ruleId ?? '').startsWith(`${scope}.`));
for (const override of project?.overrides ?? []) {
  if (!expires(override?.ruleId)) continue;
  const label = `override '${override.ruleId}'`;
  if (!override.reviewBy) {
    error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: a UI rule override requires 'reviewBy' with the review or removal date`);
    continue;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(override.reviewBy)) error(`${label}: reviewBy must be YYYY-MM-DD`);
  else if (override.reviewBy < today) error(`[FRONTEND.UI.GOVERNANCE.001] ${label}: review date ${override.reviewBy} has passed; renew the decision or complete the migration`);
  if (override.decision && !fs.existsSync(filePath(override.decision))) error(`${label}: decision does not exist '${override.decision}'`);
}

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
    validatePageSidecars(project, frontend, ui, vocabularyInfo);
  } else {
    validatePageSidecars(project, frontend, ui, null);
  }
}

console.log(`Consumer: ${root}`);
console.log(`UI-configured frontends: ${configured}`);
if (errors.length) {
  console.log(`\nFAIL (${errors.length} problem(s)):`);
  for (const item of errors) console.log(`  - ${item}`);
  process.exit(1);
}
if (!configured) {
  console.log('PASS: no React web UI configuration is present; standards migration has not been activated.');
  process.exit(0);
}
console.log('\nPASS: UI configuration, vocabulary, source locks, page contracts, and source boundaries are valid.');
