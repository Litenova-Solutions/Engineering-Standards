// Index over model.json for the book generator. Pure data shaping, no HTML.

export const LAYERS = [
  { name: "Why", types: ["product", "constraint", "research", "decision", "requirement"] },
  { name: "Problems and features", types: ["problem", "feature"] },
  { name: "People", types: ["actor", "role", "permission"] },
  { name: "Journeys", types: ["journey"] },
  { name: "How the business works", types: ["module", "business-record", "rule", "use-case", "result", "case", "event"] },
  { name: "Entry points", types: ["entry-point"] },
  { name: "Running it", types: ["limit", "runbook"] },
  { name: "How we build", types: ["standard", "exception", "known-gap"] },
  { name: "Terms", types: ["term"] },
];

const TYPE_LABELS = {
  "product": ["Product", "Products"],
  "constraint": ["Constraint", "Constraints"],
  "research": ["Research", "Research"],
  "decision": ["Decision", "Decisions"],
  "requirement": ["Requirement", "Requirements"],
  "problem": ["Problem", "Problems"],
  "feature": ["Feature", "Features"],
  "actor": ["Actor", "Actors"],
  "role": ["Role", "Roles"],
  "permission": ["Permission", "Permissions"],
  "journey": ["Journey", "Journeys"],
  "module": ["Module", "Modules"],
  "business-record": ["Business record", "Business records"],
  "rule": ["Rule", "Rules"],
  "use-case": ["Use case", "Use cases"],
  "result": ["Result", "Results"],
  "case": ["Case", "Cases"],
  "event": ["Event", "Events"],
  "entry-point": ["Entry point", "Entry points"],
  "limit": ["Limit", "Limits"],
  "runbook": ["Runbook", "Runbooks"],
  "standard": ["Standard", "Standards"],
  "exception": ["Exception", "Exceptions"],
  "known-gap": ["Known gap", "Known gaps"],
  "term": ["Term", "Terms"],
};

export function typeLabel(type, plural = false) {
  const labels = TYPE_LABELS[type];
  if (!labels) return plural ? "Records" : "Record";
  return plural ? labels[1] : labels[0];
}

export const LINK_LABELS = {
  "decides": "Decides",
  "basedOn": "Based on",
  "affects": "Affects",
  "solves": "Solves",
  "fulfils": "Fulfils",
  "governs": "Governs",
  "raises": "Raises",
  "reactsTo": "Reacts to",
  "allows": "Allows",
  "needs": "Needs",
  "reachedThrough": "Reached through",
  "dependsOn": "Depends on",
  "terms": "Terms",
  "result": "Illustrates",
  "offers": "Offers",
  "runbook": "Runbook",
  "limit": "Limit",
  "subject": "About",
  "replaces": "Replaces",
  "refusal": "Refusal",
  "standard": "Standard",
};

export const LINK_INVERSE_LABELS = {
  "decides": "Decided by",
  "basedOn": "Basis for",
  "affects": "Problems affecting this",
  "solves": "Solved by",
  "fulfils": "Fulfilled by",
  "governs": "Governed by",
  "raises": "Raised by",
  "reactsTo": "Reactions",
  "allows": "Allowed by",
  "needs": "Needed by",
  "reachedThrough": "Entry for",
  "dependsOn": "Depended on by",
  "terms": "Used by",
  "result": "Illustrated by",
  "offers": "Offered by",
  "runbook": "Runbook for",
  "limit": "Limit for",
  "subject": "Known gaps",
  "replaces": "Replaced by",
  "refusal": "Refusal for",
  "standard": "Exceptions",
};

export const PRECEDENCE = ["constraint", "product", "requirement", "rule", "use-case"];

// The record URL: the id with "/" and "." mapped to path segments.
export function recordUrl(id) {
  const slash = id.indexOf("/");
  if (slash < 0) return "index.html";
  const type = id.slice(0, slash);
  const rest = id.slice(slash + 1).split(".").join("/");
  return `${type}/${rest}.html`;
}

export function typeIndexUrl(type) {
  return `${type}/index.html`;
}

export function lensUrl(actorId) {
  const name = actorId.includes("/") ? actorId.slice(actorId.indexOf("/") + 1) : actorId;
  return `lens/${name}.html`;
}

// Relative prefix from a page back to the site root.
export function relFor(url) {
  const depth = url.split("/").length - 1;
  return depth <= 0 ? "" : "../".repeat(depth);
}

// Split "use-case/lending.borrow-copy" into type, home and name.
export function splitId(id) {
  const slash = id.indexOf("/");
  if (slash < 0) return { type: id, home: null, name: "" };
  const type = id.slice(0, slash);
  const rest = id.slice(slash + 1);
  const dot = rest.indexOf(".");
  if (dot < 0) return { type, home: null, name: rest };
  return { type, home: rest.slice(0, dot), name: rest.slice(dot + 1) };
}

export function buildIndex(model) {
  const records = Array.isArray(model.records) ? model.records : [];
  const byId = new Map();
  for (const record of records) {
    if (record && typeof record.id === "string" && !byId.has(record.id)) byId.set(record.id, record);
  }
  const byType = new Map();
  for (const record of records) {
    if (!record || typeof record.type !== "string") continue;
    if (!byType.has(record.type)) byType.set(record.type, []);
    byType.get(record.type).push(record);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => String(a.title || a.id).localeCompare(String(b.title || b.id)));
  }

  const backlinks = new Map();
  const addBacklink = (to, from, field) => {
    if (!backlinks.has(to)) backlinks.set(to, []);
    backlinks.get(to).push({ from, field });
  };
  for (const record of records) {
    if (!record || !record.links || typeof record.links !== "object") continue;
    for (const [field, targets] of Object.entries(record.links)) {
      if (!Array.isArray(targets)) continue;
      for (const target of targets) {
        if (typeof target === "string" && target.length > 0) addBacklink(target, record.id, field);
      }
    }
  }

  const resultsOf = new Map();
  const casesOf = new Map();
  for (const record of records) {
    if (!record || (record.type !== "result" && record.type !== "case")) continue;
    const { home } = splitId(record.id);
    if (!home) continue;
    const map = record.type === "result" ? resultsOf : casesOf;
    if (!map.has(home)) map.set(home, []);
    map.get(home).push(record);
  }

  const links = model.links && typeof model.links === "object" ? model.links : {};
  const implementsByTarget = new Map();
  for (const link of links.implements || []) {
    if (!link || typeof link.to !== "string") continue;
    if (!implementsByTarget.has(link.to)) implementsByTarget.set(link.to, []);
    implementsByTarget.get(link.to).push(link);
  }
  const callsByTarget = new Map();
  for (const link of links.calls || []) {
    if (!link || typeof link.to !== "string") continue;
    if (!callsByTarget.has(link.to)) callsByTarget.set(link.to, []);
    callsByTarget.get(link.to).push(link);
  }
  const provesByCase = new Map();
  for (const link of links.proves || []) {
    if (!link || typeof link.case !== "string") continue;
    if (!provesByCase.has(link.case)) provesByCase.set(link.case, []);
    provesByCase.get(link.case).push(link);
  }

  const tests = Array.isArray(model.tests) ? model.tests : [];
  const testsByName = new Map();
  for (const test of tests) {
    if (test && typeof test.scenario === "string" && !testsByName.has(test.scenario)) {
      testsByName.set(test.scenario, test);
    }
  }
  const screens = Array.isArray(model.screens) ? model.screens : [];
  const screensByKey = new Map();
  for (const screen of screens) {
    if (!screen || typeof screen.frontend !== "string" || typeof screen.route !== "string") continue;
    screensByKey.set(`${screen.frontend} ${screen.route}`, screen);
  }

  const status = model.status && typeof model.status === "object" ? model.status : {};
  const testRun = model.testRun && typeof model.testRun === "object" ? model.testRun : null;

  return {
    records, byId, byType, backlinks, resultsOf, casesOf,
    implementsByTarget, callsByTarget, provesByCase,
    tests, testsByName, screens, screensByKey, status, testRun,
  };
}

// One case's proof state from its proves links.
export function caseProof(index, caseId) {
  const links = index.provesByCase.get(caseId) || [];
  const enriched = links.map((link) => ({
    scenario: link.scenario,
    confirmed: link.confirmed === true,
    indirect: link.indirect === true,
    passing: typeof link.passing === "boolean" ? link.passing : null,
    test: typeof link.scenario === "string" ? index.testsByName.get(link.scenario) || null : null,
  }));
  const confirmed = enriched.filter((link) => link.confirmed);
  let state = "unproved";
  if (confirmed.length > 0) {
    if (confirmed.some((link) => link.indirect)) state = "proved-indirect";
    else if (confirmed.some((link) => link.passing === false)) state = "proved-failing";
    else if (confirmed.every((link) => link.passing === true)) state = "proved-passing";
    else state = "awaiting-run";
  }
  return { state, links: enriched, claimed: links.length > 0 && confirmed.length === 0 };
}

export const PROOF_LABELS = {
  "proved-passing": "Proved and passing",
  "proved-failing": "Proved and failing",
  "proved-indirect": "Proved indirect",
  "awaiting-run": "Proved, awaiting test run",
  "unproved": "Unproved",
};

export function useCaseChildren(index, useCaseId) {
  const { name } = splitId(useCaseId);
  return {
    results: index.resultsOf.get(name) || [],
    cases: index.casesOf.get(name) || [],
  };
}

export function useCaseStatus(index, useCaseId) {
  const entry = index.status[useCaseId];
  if (!entry || typeof entry !== "object") return { implemented: false, verified: false };
  return { implemented: entry.implemented === true, verified: entry.verified === true };
}

// An actor's lens: its journeys, roles, permissions and the use cases they open.
export function actorLens(index, actorId) {
  const journeys = [];
  for (const record of index.byType.get("journey") || []) {
    const fields = record.fields || {};
    if (fields.actor === actorId) {
      journeys.push(record);
      continue;
    }
    const steps = Array.isArray(fields.steps) ? fields.steps : [];
    if (steps.some((step) => step && step.actor === actorId)) journeys.push(record);
  }
  const actor = index.byId.get(actorId);
  const holds = actor && actor.fields && Array.isArray(actor.fields.holds) ? actor.fields.holds : [];
  const roles = [];
  const permissionIds = new Set();
  for (const hold of holds) {
    if (!hold || typeof hold.role !== "string") continue;
    const role = index.byId.get(hold.role);
    roles.push({ hold, role: role || null });
    const allows = role && role.links && Array.isArray(role.links.allows) ? role.links.allows : [];
    for (const id of allows) permissionIds.add(id);
  }
  const permissions = [...permissionIds]
    .map((id) => index.byId.get(id) || null)
    .filter((record) => record !== null)
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));
  const useCases = [];
  for (const record of index.byType.get("use-case") || []) {
    const needs = record.links && Array.isArray(record.links.needs) ? record.links.needs : [];
    if (needs.some((id) => permissionIds.has(id))) useCases.push(record);
  }
  useCases.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  return { journeys, roles, permissions, useCases };
}

export function reviewData(index, findingsFile, generatedDate) {
  const today = generatedDate.slice(0, 10);
  const gaps = [...(index.byType.get("known-gap") || [])].map((record) => {
    const endsBy = record.fields ? record.fields.endsBy : null;
    return { record, expired: typeof endsBy === "string" && endsBy < today };
  });
  gaps.sort((a, b) => {
    if (a.expired !== b.expired) return a.expired ? -1 : 1;
    return String(a.record.fields?.endsBy || "").localeCompare(String(b.record.fields?.endsBy || ""));
  });
  const drafts = (index.records || []).filter((record) => record.status === "draft");
  const withDecider = drafts
    .filter((record) => record.fields && record.fields.decideBy)
    .sort((a, b) => String(a.fields.decideBy).localeCompare(String(b.fields.decideBy)));
  const withoutDecider = drafts
    .filter((record) => !(record.fields && record.fields.decideBy))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const findings = findingsFile && Array.isArray(findingsFile.findings) ? findingsFile.findings : [];
  const known = findingsFile && Array.isArray(findingsFile.known) ? findingsFile.known : [];
  return { gaps, withDecider, withoutDecider, findings, known };
}
