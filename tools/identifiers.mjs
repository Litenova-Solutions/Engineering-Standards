#!/usr/bin/env node
// Identifier scans for a consumer of docs/backend/identifiers.md.
//
// RuleIdentifierScan reads the classification identifiers a consumer writes in
// its documentation and checks them against the ten rules on that page.
// MultiFormScan reads every raised domain event in the consumer source and
// checks the four identifying attributes.
//
// Both report through the caller's err(message) and return the number of
// identifiers they read, so the caller can state the scope it actually covered.

export const KNOWN_KINDS = [
  'aggregate',
  'authorization',
  'acceptance-criterion',
  'event',
  'exception',
  'failure',
  'invariant',
  'path',
  'policy',
  'rule',
  'use-case',
  'validation',
];

// A kind shortened to two or three characters. Rule 2 rejects it.
export const KIND_ABBREVIATIONS = ['agg', 'autz', 'ac', 'evt', 'exc', 'fail', 'inv', 'pol', 'uc', 'val'];

// The sources a cross-source citation may name. The first segment of an
// identifier is otherwise absent. (standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form)
export const DEFAULT_SOURCES = ['entro', 'litepress', 'owasp', 'rfc', 'standards'];

const RULE_KINDS = new Set(['invariant', 'validation', 'authorization', 'acceptance-criterion', 'policy', 'rule']);

// The number of dot-separated parts each kind carries after its kind segment.
// (standards/rule/backend-identifiers.state-the-per-kind-identifier-forms)
const FORM_PARTS = {
  aggregate: [1],
  event: [2],
  exception: [2],
  'use-case': [2],
  path: [3],
  invariant: [2, 3],
  validation: [2, 3],
  authorization: [2],
  'acceptance-criterion': [3],
  policy: [2],
  rule: [2],
  failure: [2],
};

const RULE = {
  grammar: 'standards/rule/backend-identifiers.state-the-identifier-grammar',
  kind: 'standards/rule/backend-identifiers.name-the-kind-with-a-full-english-word',
  anchor: 'standards/rule/backend-identifiers.anchor-the-identifier-on-its-natural-home',
  forms: 'standards/rule/backend-identifiers.state-the-per-kind-identifier-forms',
  trigger: 'standards/rule/backend-identifiers.use-a-trigger-form-only-for-invariants',
  attributes: 'standards/rule/backend-identifiers.attach-four-identifying-attributes-to-every-cross-boundary-element',
  source: 'standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form',
  digits: 'standards/rule/backend-identifiers.exclude-digits-from-every-identifier',
  unique: 'standards/rule/backend-identifiers.keep-identifiers-unique-within-their-anchor',
  tombstone: 'standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list',
};

const KIND_ALTERNATION = [...KNOWN_KINDS, ...KIND_ABBREVIATIONS].join('|');
// A candidate is an optional source segment, a kind, and a topic. The kind list
// keeps ordinary prose such as 'docs/domain/orders' out of the scan. The
// lookbehind keeps the kind segment inside a longer name, for example the
// 'event' in 'alfio-event/alf.io', out of the scan.
const CANDIDATE = new RegExp(
  `(?<![A-Za-z0-9_-])(?:([a-z][a-z0-9-]*)/)?(${KIND_ALTERNATION})/([A-Za-z0-9][A-Za-z0-9._-]*)`,
  'g',
);
// Lowercase kebab-case, the shape of every segment except a failure topic.
const GRAIN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/;
// A failure topic is lowercase snake case, so an underscore is correct there.
const SNAKE = /^[a-z][a-z0-9_]*$/;

// A fenced block is a code sample rather than a classified page section, and it
// carries identifiers that a reader is meant to type rather than resolve.
function stripFences(raw) {
  return raw.replace(/```[\s\S]*?```/g, '');
}

// Extract every candidate identifier from one document body. The trailing
// punctuation of a sentence is not part of the identifier it follows.
export function identifiersIn(raw) {
  const found = [];
  const text = stripFences(raw);
  for (const match of text.matchAll(CANDIDATE)) {
    const source = match[1];
    const kind = match[2];
    const rest = match[3].replace(/[._-]+$/, '');
    if (!rest) continue;
    found.push({ source, kind, rest, token: source ? `${source}/${kind}/${rest}` : `${kind}/${rest}` });
  }
  return found;
}

// The anchor check resolves on the four kinds whose consumer anchors are fully
// known. The rest are left to validate-spec-sync, which reads the code.
function anchorProblem(kind, parts, anchors) {
  const { aggregateAnchors, moduleAnchors, useCaseAnchors, useCaseNames } = anchors;
  if (kind === 'aggregate') return parts.length === 1 && !aggregateAnchors.has(parts[0]) ? `aggregate '${parts[0]}'` : null;
  if (kind === 'event') return parts.length === 2 && !aggregateAnchors.has(parts[0]) ? `aggregate '${parts[0]}'` : null;
  if (kind === 'use-case') return parts.length === 2 && !moduleAnchors.has(parts[0]) ? `module '${parts[0]}'` : null;
  if (kind === 'authorization') {
    if (parts.length !== 2) return null;
    return useCaseNames.has(parts[0]) ? null : `use case '${parts[0]}'`;
  }
  if (kind === 'validation') {
    if (parts.length === 3) {
      if (!moduleAnchors.has(parts[0])) return `module '${parts[0]}'`;
      return useCaseAnchors.has(`${parts[0]}.${parts[1]}`) ? null : `use case '${parts[0]}.${parts[1]}'`;
    }
    if (parts.length === 2) return useCaseNames.has(parts[0]) ? null : `use case '${parts[0]}'`;
    return null;
  }
  if (kind === 'path') {
    if (parts.length !== 3) return null;
    if (!moduleAnchors.has(parts[0])) return `module '${parts[0]}'`;
    return useCaseAnchors.has(`${parts[0]}.${parts[1]}`) ? null : `use case '${parts[0]}.${parts[1]}'`;
  }
  return null;
}

/**
 * Check every classification identifier in `files` against the ten rules.
 *
 * files    - array of { rel, raw }, one per document to scan.
 * context  - anchors and definitions:
 *            { aggregateAnchors, moduleAnchors, useCaseAnchors, useCaseNames,
 *              sources, tombstones, definitions, tombstoneRel }
 *            definitions is an array of { id, rel } for the active set that
 *            rules 9 and 10 read.
 * err      - callback receiving one message per finding.
 *
 * Returns the number of identifiers read.
 * (standards/rule/backend-identifiers.state-the-identifier-grammar through
 *  standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list)
 */
export function RuleIdentifierScan({ files, context, err }) {
  const anchors = {
    aggregateAnchors: context?.aggregateAnchors ?? new Set(),
    moduleAnchors: context?.moduleAnchors ?? new Set(),
    useCaseAnchors: context?.useCaseAnchors ?? new Set(),
    useCaseNames: context?.useCaseNames ?? new Set(),
    policyAnchors: context?.policyAnchors ?? new Set(),
  };
  const sources = context?.sources ?? new Set(DEFAULT_SOURCES);
  const tombstoneRel = context?.tombstoneRel;
  const knownSources = [...sources].sort().join(', ');

  let read = 0;
  for (const file of files) {
    if (tombstoneRel && file.rel === tombstoneRel) continue;
    for (const { source, kind, rest, token } of identifiersIn(file.raw)) {
      read += 1;

      // Rule 2: the kind is one full English word.
      if (KIND_ABBREVIATIONS.includes(kind)) {
        err(`${file.rel}: '${token}' abbreviates its kind; the kind is one full English word, one of ${KNOWN_KINDS.join(', ')} (${RULE.kind})`);
        continue;
      }

      // Rule 7: a leading segment before the kind is a known source.
      if (source && !sources.has(source)) {
        err(`${file.rel}: '${token}' names source '${source}', which is not a known source; use one of ${knownSources} (${RULE.source})`);
        continue;
      }

      const parts = rest.split('.');

      // Rule 1: the identifier is kind/anchor.topic in lowercase kebab-case. A
      // failure topic is lowercase snake case instead.
      const shaped = kind === 'failure'
        ? parts.length === 2 && GRAIN.test(parts[0]) && SNAKE.test(parts[1])
        : GRAIN.test(rest);
      if (!shaped) {
        err(`${file.rel}: '${token}' does not follow kind/anchor.topic in lowercase kebab-case (${RULE.grammar})`);
        continue;
      }

      // Rule 8: no segment carries a digit. A source-prefixed citation is
      // external, so its numbering belongs to the source that owns it.
      if (!source && /\d/.test(rest)) {
        err(`${file.rel}: '${token}' carries a digit; a second identifier wanting a name is renamed and never numbered (${RULE.digits})`);
      }

      // Rule 4: the kind's declared part count. A one-part rule identifier whose
      // part is a known policy page names the page rather than one of its rules,
      // which is the anchor and not a malformed rule. It is excluded here and
      // reported by the caller.
      const allowed = FORM_PARTS[kind];
      const pageReference = RULE_KINDS.has(kind) && parts.length === 1 && kind === 'policy' && anchors.policyAnchors.has(parts[0]);
      if (!pageReference && allowed && !allowed.includes(parts.length)) {
        err(`${file.rel}: '${token}' has ${parts.length} dot-separated part(s); kind '${kind}' declares ${allowed.join(' or ')} (${RULE.forms})`);
      }

      // Rule 5: a three-part rule identifier anchored on an aggregate is a
      // trigger form, and only an invariant has one.
      if (RULE_KINDS.has(kind) && kind !== 'invariant' && parts.length === 3 && anchors.aggregateAnchors.has(parts[0])) {
        err(`${file.rel}: '${token}' carries a trigger form; only an invariant is cited from a mutating use case (${RULE.trigger})`);
      }

      // Rule 3: the anchor names the kind's natural home.
      const wrongAnchor = anchorProblem(kind, parts, anchors);
      if (wrongAnchor) {
        err(`${file.rel}: '${token}' anchors on ${wrongAnchor}, which is not the natural home for kind '${kind}' (${RULE.anchor})`);
      }
    }
  }

  // Rule 9: every active identifier is unique within its anchor scope.
  // Rule 10: an active identifier is not a retired one.
  const definitions = context?.definitions ?? [];
  const byId = new Map();
  for (const definition of definitions) {
    if (!byId.has(definition.id)) byId.set(definition.id, []);
    byId.get(definition.id).push(definition.rel);
  }
  for (const [id, rels] of byId) {
    if (rels.length > 1) {
      err(`${rels[0]}: identifier '${id}' is defined ${rels.length} times, also in ${rels.slice(1).join(', ')}; two elements in one anchor are renamed, never repeated (${RULE.unique})`);
    }
    if (context?.tombstones?.has(id)) {
      err(`${rels[0]}: '${id}' is a retired identifier and is in use; a retired identifier is never reused (${RULE.tombstone})`);
    }
  }

  return read;
}

/**
 * Check the four identifying attributes of every raised domain event.
 *
 * sourceFiles - array of { rel, raw }, one per C# source file.
 * docText     - the concatenated documentation, for the documentation anchor.
 * context     - { aggregateAnchors }.
 * err         - callback receiving one message per finding.
 *
 * Returns the number of event types read.
 * (standards/rule/backend-identifiers.attach-four-identifying-attributes-to-every-cross-boundary-element)
 */
export function MultiFormScan({ sourceFiles, docText, context, err }) {
  const aggregateAnchors = context?.aggregateAnchors ?? new Set();
  const eventFiles = [];
  for (const file of sourceFiles) {
    if (!/\bIDomainEvent\b/.test(file.raw)) continue;
    // A raised event implements IDomainEvent directly. A handler that is
    // generic over IDomainEvent names it inside another type, so an exact base
    // name is what separates the fact from the code that reacts to it.
    const declarations = [];
    const decl = /(?:^|\n)\s*(?:(?:public|internal|sealed|abstract|partial|static)\s+)*(record|class)\s+(\w+)(?:<[^>]*>)?\s*(?:\([^;{)]*\))?\s*:\s*([^{;]+)/g;
    for (const match of file.raw.matchAll(decl)) {
      const bases = match[3].split(/[,\s]+/).filter(Boolean);
      if (bases.includes('IDomainEvent')) declarations.push({ keyword: match[1], name: match[2] });
    }
    if (!declarations.length) continue;
    eventFiles.push({ ...file, declarations });
  }

  // Causation is one carrier shared by every event, so it is present or absent
  // for the bundle rather than for one type.
  const hasCausation = sourceFiles.some((file) => /\bCausationId\b|\bICausationScope\b/.test(file.raw));

  let read = 0;
  let causationReported = false;
  for (const file of eventFiles) {
    read += 1;

    // Identity: an event is an immutable record with an opaque handle. A class
    // is a mutable object and cannot carry an opaque identity.
    for (const declaration of file.declarations) {
      if (declaration.keyword !== 'record') {
        err(`${file.rel}: raised event '${declaration.name}' is declared as a class; the identity attribute of an event is its opaque record handle (${RULE.attributes})`);
      }
    }

    // Classification: the semantic name a reader cites.
    const classification = file.raw.match(/Classification\s*=\s*"([^"]*)"/);
    if (!classification) {
      err(`${file.rel}: raised event carries no Classification constant; give it one of the form event/<aggregate>.<past-tense> (${RULE.attributes})`);
    } else {
      const value = classification[1];
      if (!/^event\/[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/.test(value)) {
        err(`${file.rel}: Classification '${value}' does not match event/<aggregate>.<past-tense> (${RULE.grammar})`);
      } else {
        const anchor = value.slice('event/'.length).split('.')[0];
        if (aggregateAnchors.size && !aggregateAnchors.has(anchor)) {
          err(`${file.rel}: Classification '${value}' anchors on aggregate '${anchor}', which is not a known aggregate (${RULE.anchor})`);
        }
      }
      // Documentation anchor: the page a reader opens to learn the fact.
      if (docText && !docText.includes(value)) {
        err(`${file.rel}: Classification '${value}' appears in no documentation page; the documentation anchor cannot resolve (${RULE.attributes})`);
      }
    }

    // Causation: the use case or event that raised it, carried by the envelope.
    if (!hasCausation && !causationReported) {
      causationReported = true;
      err(`${file.rel}: raised events carry no causation; the outbox envelope records the use-case identifier that raised the event (${RULE.attributes})`);
    }
  }

  return read;
}