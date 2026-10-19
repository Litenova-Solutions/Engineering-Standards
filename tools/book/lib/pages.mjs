// Page renderers for the book generator. Every count is computed from model.json.

import {
  LAYERS, PRECEDENCE, LINK_LABELS, LINK_INVERSE_LABELS, PROOF_LABELS, typeLabel,
  recordUrl, typeIndexUrl, lensUrl, splitId, caseProof,
  useCaseChildren, useCaseStatus, actorLens,
} from "./model.mjs";
import { esc, pageHeader, sectionHeading, statusChip, recordLink } from "./render.mjs";

export function renderHome(index, rel) {
  const products = index.byType.get("product") || [];
  const product = products[0] || null;
  const fields = product && product.fields ? product.fields : {};

  const useCases = index.byType.get("use-case") || [];
  let implemented = 0;
  let verified = 0;
  for (const useCase of useCases) {
    const state = useCaseStatus(index, useCase.id);
    if (state.implemented) implemented += 1;
    if (state.verified) verified += 1;
  }

  const parts = [];
  parts.push(pageHeader({
    kind: product ? `Product · ${product.id}` : "Product",
    title: product ? product.title : "Project book",
    lede: "Every record of the project model, generated from model.json.",
    facts: [
      ["Records", `<b>${index.records.length}</b>`],
      ["Use cases", `<b>${useCases.length}</b>`],
      ["Implemented", `<b>${implemented}</b>`],
      ["Verified", `<b>${verified}</b>`],
    ],
  }));

  if (product) {
    parts.push(sectionHeading(2, "boundary", "Boundary"));
    if (fields.boundary) parts.push(`<p>${esc(fields.boundary)}</p>`);
    const neverDoes = Array.isArray(fields.neverDoes) ? fields.neverDoes : [];
    if (neverDoes.length > 0) {
      parts.push(sectionHeading(2, "never-does", "Never does"));
      parts.push(`<ul class="plain">${neverDoes.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`);
    }
    const audience = Array.isArray(fields.audience) ? fields.audience : [];
    if (audience.length > 0) {
      parts.push(sectionHeading(2, "audience", "Audience"));
      parts.push(`<ul class="links">${audience.map((id) => `<li>${recordLink(index, rel, id)}</li>`).join("")}</ul>`);
    }
  }

  parts.push(sectionHeading(2, "counts", "Record counts"));
  const rows = [];
  for (const layer of LAYERS) {
    for (const type of layer.types) {
      const list = index.byType.get(type) || [];
      if (list.length === 0) continue;
      const approved = list.filter((record) => record.status === "approved").length;
      const draft = list.filter((record) => record.status === "draft").length;
      const retired = list.filter((record) => record.status === "retired").length;
      rows.push(`<tr><td><a href="${rel}${typeIndexUrl(type)}">${esc(typeLabel(type, true))}</a></td>` +
        `<td class="num">${list.length}</td><td class="num">${approved}</td>` +
        `<td class="num">${draft}</td><td class="num">${retired}</td></tr>`);
    }
  }
  parts.push(`<div class="tablewrap"><table class="tbl"><thead><tr><th>Type</th>` +
    `<th class="num">Records</th><th class="num">Approved</th><th class="num">Draft</th>` +
    `<th class="num">Retired</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`);

  if (index.testRun) {
    parts.push(sectionHeading(2, "test-run", "Latest test run"));
    parts.push(`<p>${esc(index.testRun.passed)} of ${esc(index.testRun.total)} tests passed, ` +
      `${esc(index.testRun.failed)} failed.</p>`);
  }

  parts.push(sectionHeading(2, "layers", "Layers"));
  const cards = [];
  for (const layer of LAYERS) {
    const present = layer.types.filter((type) => (index.byType.get(type) || []).length > 0);
    if (present.length === 0) continue;
    const count = present.reduce((sum, type) => sum + (index.byType.get(type) || []).length, 0);
    const links = present
      .map((type) => `<a href="${rel}${typeIndexUrl(type)}">${esc(typeLabel(type, true))}</a>`)
      .join(" · ");
    cards.push(`<div class="partcard"><h3>${esc(layer.name)}</h3><p>${links}</p>` +
      `<div class="ft"><span>${count} records</span></div></div>`);
  }
  parts.push(`<div class="partsgrid">${cards.join("")}</div>`);
  return parts.join("\n");
}

// ---------- record fields ----------

const FIELD_LABELS = {
  "boundary": "Boundary", "neverDoes": "Never does", "audience": "Audience",
  "source": "Source", "applies": "Applies", "appliesBecause": "Why it applies",
  "question": "Question", "sources": "Sources", "decided": "Decided",
  "options": "Options", "changeWhen": "Change when",
  "kind": "Kind", "statement": "Statement", "values": "Values",
  "state": "State", "refusedBecause": "Why refused",
  "scope": "Scope", "code": "Code", "codeType": "Name in code", "meaning": "Meaning",
  "goal": "Goal", "actor": "Actor", "dependsOn": "Depends on",
  "codeName": "Name in code", "states": "States",
  "enforcedBy": "Enforced by", "refusal": "Refusal",
  "operation": "Operation", "anonymous": "Anonymous",
  "outcome": "Outcome", "status": "HTTP status",
  "situation": "Situation", "action": "Action", "expect": "Expect",
  "carries": "Carries", "path": "Path", "offers": "Offers",
  "bound": "Bound", "value": "Value", "trigger": "Trigger",
  "reason": "Reason", "reviewBy": "Review by", "removeWhen": "Remove when",
  "check": "Check", "endsBy": "Ends by",
  "term": "English", "labels": "Labels", "rejected": "Rejected words",
  "broader": "Broader", "narrower": "Narrower", "mannered": "Mannered",
  "decider": "Decider", "decideBy": "Decide by", "owner": "Owner",
};

const FIELD_ORDER = {
  "product": ["boundary", "neverDoes", "audience"],
  "constraint": ["source", "applies", "appliesBecause"],
  "research": ["question", "sources"],
  "decision": ["decided", "options", "changeWhen"],
  "requirement": ["kind", "statement", "values"],
  "problem": ["statement"],
  "feature": ["state", "refusedBecause"],
  "actor": ["kind", "holds"],
  "role": ["scope"],
  "permission": ["code", "codeType", "meaning"],
  "journey": ["actor", "goal", "steps"],
  "module": [],
  "business-record": ["codeName", "states"],
  "rule": ["kind", "enforcedBy", "statement"],
  "use-case": ["operation", "anonymous", "input"],
  "result": ["outcome", "code", "status", "meaning"],
  "case": ["situation", "action", "expect"],
  "event": ["meaning", "carries"],
  "entry-point": ["kind", "path"],
  "limit": ["bound", "value"],
  "runbook": ["trigger"],
  "standard": [],
  "exception": ["reason", "reviewBy", "removeWhen"],
  "known-gap": ["check", "endsBy", "reason"],
  "term": ["term", "meaning", "labels", "rejected", "broader", "narrower", "values", "mannered"],
};

const SKIP_FIELDS = new Set([
  "type", "id", "title", "owner", "status", "records",
  "decides", "basedOn", "affects", "solves", "fulfils", "governs", "raises",
  "reactsTo", "allows", "needs", "reachedThrough", "dependsOn", "terms",
  "result", "offers", "runbook", "limit", "subject", "replaces",
]);

function idLink(index, rel, id) {
  const record = index.byId.get(id);
  if (record) return `<a href="${rel}${recordUrl(id)}">${esc(record.title)}</a> <span class="mono dim">${esc(id)}</span>`;
  return `<code>${esc(id)}</code>`;
}

function idList(index, rel, value) {
  const ids = Array.isArray(value) ? value : [value];
  const items = ids.filter((id) => typeof id === "string");
  if (items.length === 0) return "";
  if (items.length === 1) return idLink(index, rel, items[0]);
  return `<ul class="links">${items.map((id) => `<li>${idLink(index, rel, id)}</li>`).join("")}</ul>`;
}

function renderFieldValue(index, rel, field, value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return esc(value);
  if (typeof value === "string") {
    if (field === "source" && /^https?:\/\//.test(value)) {
      return `<a href="${esc(value)}">${esc(value)}</a>`;
    }
    if (["actor", "result", "refusal", "standard", "limit", "runbook"].includes(field)) {
      return idLink(index, rel, value);
    }
    return esc(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    const hasObjects = value.some((entry) => entry && typeof entry === "object");
    if (field === "options") return `<ol class="plain">${value.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>`;
    if (field === "sources" && hasObjects) {
      return `<ul class="links">${value.map((entry) => {
        if (entry && typeof entry === "object" && entry.url) {
          const read = entry.read ? ` <span class="dim">read ${esc(entry.read)}</span>` : "";
          return `<li><a href="${esc(entry.url)}">${esc(entry.url)}</a>${read}</li>`;
        }
        if (entry && typeof entry === "object") return `<li><code>${esc(JSON.stringify(entry))}</code></li>`;
        return `<li>${esc(entry)}</li>`;
      }).join("")}</ul>`;
    }
    if (field === "values" && hasObjects) {
      const rows = value.map((entry) => {
        if (entry && typeof entry === "object") {
          if (entry.value !== undefined) {
            return `<tr><td>${esc(entry.value)}</td><td>${esc(entry.effectiveFrom || "")}</td></tr>`;
          }
          return `<tr><td><code>${esc(entry.code || "")}</code></td><td>${esc(entry.label || "")}</td></tr>`;
        }
        return `<tr><td>${esc(entry)}</td><td></td></tr>`;
      }).join("");
      const head = value.some((entry) => entry && typeof entry === "object" && entry.value !== undefined)
        ? "<tr><th>Value</th><th>Effective from</th></tr>"
        : "<tr><th>Code</th><th>Label</th></tr>";
      return `<div class="tablewrap"><table class="tbl"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
    }
    if (field === "input" && hasObjects) {
      const rows = value.map((entry) => {
        if (entry && typeof entry === "object") {
          return `<tr><td><code>${esc(entry.name || "")}</code></td><td>${esc(entry.meaning || "")}</td><td>${esc(entry.rules || "")}</td></tr>`;
        }
        return `<tr><td>${esc(entry)}</td><td></td><td></td></tr>`;
      }).join("");
      return `<div class="tablewrap"><table class="tbl"><thead><tr><th>Name</th><th>Meaning</th><th>Rules</th></thead><tbody>${rows}</tbody></table></div>`;
    }
    if (field === "holds" && hasObjects) {
      const rows = value.map((entry) => {
        if (entry && typeof entry === "object") {
          const role = typeof entry.role === "string" ? idLink(index, rel, entry.role) : esc(entry.role || "");
          return `<tr><td>${role}</td><td>${esc(entry.scope || "")}</td></tr>`;
        }
        return `<tr><td>${esc(entry)}</td><td></td></tr>`;
      }).join("");
      return `<div class="tablewrap"><table class="tbl"><thead><tr><th>Role</th><th>Scope</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    if (field === "steps" && hasObjects) {
      const rows = value.map((step, position) => {
        if (!step || typeof step !== "object") return `<tr><td>${position + 1}</td><td>${esc(step)}</td><td></td><td></td></tr>`;
        const useCase = typeof step.useCase === "string" ? idLink(index, rel, step.useCase) : "";
        const actor = typeof step.actor === "string" ? idLink(index, rel, step.actor) : "";
        const requires = Array.isArray(step.requires) ? step.requires.map(esc).join(", ") : esc(step.requires || "");
        return `<tr><td class="num">${position + 1}</td><td>${useCase}</td><td>${actor}</td><td>${requires}</td></tr>`;
      }).join("");
      return `<div class="tablewrap"><table class="tbl"><thead><tr><th></th><th>Use case</th><th>Actor</th><th>Requires</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    if (field === "labels" && value.length > 0 && typeof value[0] !== "string") return "";
    if (value.every((item) => typeof item === "string")) {
      if (["audience", "broader", "narrower", "refusal", "standard"].includes(field)) return idList(index, rel, value);
      if (value.length <= 3) return value.map(esc).join(", ");
      return `<ul class="plain">${value.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
    }
    return `<pre class="json">${esc(JSON.stringify(value, null, 2))}</pre>`;
  }
  if (typeof value === "object") {
    if (field === "labels") {
      const rows = Object.entries(value)
        .map(([language, label]) => `<tr><td>${esc(language)}</td><td>${esc(label)}</td></tr>`)
        .join("");
      return `<div class="tablewrap"><table class="tbl"><thead><tr><th>Language</th><th>Label</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    if (field === "rejected") return "";
    return `<pre class="json">${esc(JSON.stringify(value, null, 2))}</pre>`;
  }
  return "";
}

function renderRejected(index, rel, value) {
  const items = Array.isArray(value) ? value : [];
  if (items.length === 0) return "";
  const rows = items.map((entry) => {
    if (entry && typeof entry === "object") {
      const scope = entry.scope ? ` <span class="dim">(${esc(entry.scope)})</span>` : "";
      const except = entry.except ? ` <span class="dim">except ${esc(entry.except)}</span>` : "";
      return `<tr><td>${esc(entry.word || "")}${scope}</td><td>${esc(entry.reason || "")}${except}</td></tr>`;
    }
    return `<tr><td>${esc(entry)}</td><td></td></tr>`;
  }).join("");
  return `<div class="tablewrap"><table class="tbl"><thead><tr><th>Word</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function fieldLabel(field) {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function renderFields(index, rel, record) {
  const fields = record.fields && typeof record.fields === "object" ? record.fields : {};
  const order = FIELD_ORDER[record.type] || [];
  const rows = [];
  const seen = new Set();
  const push = (field) => {
    if (!(field in fields) || seen.has(field)) return;
    seen.add(field);
    // A result's record status and its HTTP status share one field name; only
    // a number is the HTTP status. The record status is already in the strip.
    if (record.type === "result" && field === "status" && typeof fields[field] !== "number") return;
    const html = field === "rejected"
      ? renderRejected(index, rel, fields[field])
      : renderFieldValue(index, rel, field, fields[field]);
    if (html !== "") rows.push(`<div><dt>${esc(fieldLabel(field))}</dt><dd>${html}</dd></div>`);
  };
  for (const field of order) push(field);
  for (const field of Object.keys(fields)) {
    if (!SKIP_FIELDS.has(field) && !seen.has(field)) push(field);
  }
  if (rows.length === 0) return "";
  return `<h2 id="fields">Fields</h2>\n<dl class="fields">${rows.join("")}</dl>`;
}

// ---------- record page ----------

function authorityStrip(index, record) {
  const level = PRECEDENCE.indexOf(record.type);
  const cells = [];
  if (level >= 0) {
    const chain = PRECEDENCE.map((type, position) => {
      const mark = position === level ? ` <span class="here" aria-current="true">(this record)</span>` : "";
      return `<span class="${position === level ? "cur" : ""}">${esc(typeLabel(type))}${mark}</span>`;
    }).join(` <span class="sep" aria-hidden="true">&#8250;</span> `);
    cells.push(["Precedence", chain, "wide"]);
  } else {
    cells.push(["Precedence", "Outside the precedence order", "wide"]);
  }
  cells.push(["Status", `${statusChip(record.status || "")} <span>${esc(record.status || "no status")}</span>`, ""]);
  cells.push(["Owner", esc(record.owner || "no owner"), ""]);
  const decider = record.fields ? record.fields.decider : null;
  const decideBy = record.fields ? record.fields.decideBy : null;
  cells.push(["Decider", esc(decider || "none"), ""]);
  cells.push(["Decide by", esc(decideBy || "none"), ""]);
  if (record.type === "use-case") {
    const state = useCaseStatus(index, record.id);
    cells.push(["Implemented", state.implemented
      ? `<span class="chip ok">Yes</span> <span>code implements it</span>`
      : `<span class="chip warn">No</span> <span>no code implements it</span>`, ""]);
    cells.push(["Verified", state.verified
      ? `<span class="chip ok">Yes</span> <span>every case proved by a passing test</span>`
      : `<span class="chip warn">No</span> <span>a case is unproved or failing</span>`, ""]);
  }
  return `<div class="strip" role="region" aria-label="Authority">${cells.map(([term, value, wide]) =>
    `<div class="cell${wide ? " wide" : ""}"><div class="k">${esc(term)}</div><div class="v">${value}</div></div>`).join("")}</div>`;
}

function renderOutgoingLinks(index, rel, record) {
  const links = record.links && typeof record.links === "object" ? record.links : {};
  const groups = [];
  for (const [field, label] of Object.entries(LINK_LABELS)) {
    const targets = links[field];
    if (!Array.isArray(targets) || targets.length === 0) continue;
    if (field === "terms" && record.type === "term") continue;
    const items = targets
      .filter((id) => typeof id === "string")
      .map((id) => `<li>${idLink(index, rel, id)}</li>`)
      .join("");
    if (items) groups.push(`<h3>${esc(label)}</h3>\n<ul class="links">${items}</ul>`);
  }
  if (groups.length === 0) return "";
  return `<h2 id="links">Links</h2>\n${groups.join("\n")}`;
}

function renderIncomingLinks(index, rel, record) {
  const incoming = index.backlinks.get(record.id) || [];
  if (incoming.length === 0) return "";
  const byField = new Map();
  for (const { from, field } of incoming) {
    if (!index.byId.has(from)) continue;
    if (!byField.has(field)) byField.set(field, []);
    byField.get(field).push(from);
  }
  const groups = [];
  for (const [field, ids] of [...byField.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const label = LINK_INVERSE_LABELS[field] || `Linked through ${field}`;
    const items = ids.sort().map((id) => `<li>${idLink(index, rel, id)}</li>`).join("");
    groups.push(`<h3>${esc(label)}</h3>\n<ul class="links">${items}</ul>`);
  }
  if (groups.length === 0) return "";
  return `<h2 id="linked-from">Linked from</h2>\n${groups.join("\n")}`;
}

function renderComputed(index, rel, record) {
  const parts = [];
  const implementsLinks = index.implementsByTarget.get(record.id) || [];
  if (implementsLinks.length > 0) {
    const items = implementsLinks.map((link) => {
      const kind = { "handler": "Handler", "reaction": "Reaction", "job": "Job", "event": "Domain event", "result": "Refusal thrown" }[link.kind] || esc(link.kind || "Code");
      return `<li><span class="chip">${kind}</span> <code>${esc(link.path)}</code></li>`;
    }).join("");
    parts.push(`<h3>Implemented by</h3>\n<ul class="links">${items}</ul>`);
  }
  const callsLinks = index.callsByTarget.get(record.id) || [];
  if (callsLinks.length > 0) {
    const items = callsLinks.map((link) => {
      const screen = index.screensByKey.get(link.screen) || null;
      const routes = screen ? screen.operations.map((op) => `${op.method} ${op.path}`).join(", ") : "";
      const file = screen ? ` <span class="mono dim">${esc(screen.file)}</span>` : "";
      return `<li><b>${esc(link.screen)}</b> calls <code>${esc(link.operation)}</code>` +
        (routes ? ` <span class="mono dim">${esc(routes)}</span>` : "") + file + `</li>`;
    }).join("");
    parts.push(`<h3>Called from</h3>\n<ul class="links">${items}</ul>`);
  }
  const provesLinks = index.provesByCase.get(record.id) || [];
  if (provesLinks.length > 0) {
    const items = provesLinks.map((link) => {
      const test = index.testsByName.get(link.scenario) || null;
      const where = test ? ` <span class="mono dim">${esc(test.file)}:${test.line}</span>` : "";
      const confirmed = link.confirmed === true ? "confirmed" : "unconfirmed";
      const outcome = link.passing === true ? "passing" : link.passing === false ? "failing" : "no test run";
      return `<li><code>${esc(link.scenario)}</code> <span class="dim">${confirmed}, ${outcome}</span>${where}</li>`;
    }).join("");
    parts.push(`<h3>Proved by</h3>\n<ul class="links">${items}</ul>`);
  }
  if (parts.length === 0) return "";
  return `<h2 id="implementation">Implementation</h2>\n${parts.join("\n")}`;
}

function proofChip(state) {
  const tone = state === "proved-passing" ? "ok" : state === "unproved" ? "warn" : "note";
  return `<span class="chip ${tone}">${esc(PROOF_LABELS[state])}</span>`;
}

function renderUseCaseResults(index, rel, record) {
  const { results, cases } = useCaseChildren(index, record.id);
  const parts = [];
  if (results.length > 0) {
    const items = results.map((result) => {
      const fields = result.fields || {};
      const code = fields.code ? ` <code>${esc(fields.code)}</code>` : "";
      // Only a numeric status is the HTTP status. A string is the record
      // status, which the authority strip already shows, so it stays out.
      const status = typeof fields.status === "number" ? ` <span class="dim">HTTP ${fields.status}</span>` : "";
      return `<li>${idLink(index, rel, result.id)} <span class="dim">${esc(fields.outcome || "")}</span>${code}${status}</li>`;
    }).join("");
    parts.push(`<h2 id="results">Results</h2>\n<ul class="links">${items}</ul>`);
  }
  if (cases.length > 0) {
    const items = cases.map((kase) => {
      const { state } = caseProof(index, kase.id);
      const fields = kase.fields || {};
      const detail = [fields.situation, fields.action, fields.expect].filter(Boolean).map(esc).join(" &#8594; ");
      return `<li>${idLink(index, rel, kase.id)} ${proofChip(state)}` +
        (detail ? `<div class="dim">${detail}</div>` : "") + `</li>`;
    }).join("");
    parts.push(`<h2 id="cases">Cases</h2>\n<ul class="links">${items}</ul>`);
  }
  return parts.join("\n");
}

function renderCaseProof(index, rel, record) {
  const { state, links, claimed } = caseProof(index, record.id);
  const parts = [`<h2 id="proof">Proof</h2>\n<p>${proofChip(state)}` +
    (claimed ? ` A test claims this case, but the claim does not hold: no proving step calls the use case, or a refusal asserts no code.` : "") +
    `</p>`];
  if (links.length > 0) {
    const items = links.map((link) => {
      const where = link.test ? ` <span class="mono dim">${esc(link.test.file)}:${link.test.line}</span>` : "";
      const confirmed = link.confirmed ? "confirmed" : "unconfirmed";
      const outcome = link.passing === true ? "passing" : link.passing === false ? "failing" : "no test run";
      const indirect = link.indirect ? ", indirect" : "";
      return `<li><code>${esc(link.scenario)}</code> <span class="dim">${confirmed}${indirect}, ${outcome}</span>${where}</li>`;
    }).join("");
    parts.push(`<ul class="links">${items}</ul>`);
  }
  return parts.join("\n");
}

function renderRecordReview(index, rel, record, review) {
  const items = [];
  if (record.status === "draft") {
    const decider = record.fields ? record.fields.decider : null;
    const decideBy = record.fields ? record.fields.decideBy : null;
    items.push(`<li>This record is a draft` +
      (decider ? ` awaiting ${esc(decider)}` : ` with no decider`) +
      (decideBy ? ` by ${esc(decideBy)}` : ` with no decide-by date`) + `.</li>`);
  }
  for (const { record: gap, expired } of review.gaps) {
    const subjects = gap.links && Array.isArray(gap.links.subject) ? gap.links.subject : [];
    if (!subjects.includes(record.id)) continue;
    items.push(`<li>${expired ? `<span class="chip risk">Expired</span> ` : ""}Known gap: ${idLink(index, rel, gap.id)}.</li>`);
  }
  for (const finding of review.findings) {
    if (finding.subject !== record.id) continue;
    items.push(`<li><span class="chip risk">Finding</span> <code>${esc(finding.code)}</code> ${esc(finding.message)}</li>`);
  }
  if (items.length === 0) return "";
  return `<section class="review-only" aria-label="Review notes"><h2>Review</h2>\n<ul class="links">${items.join("")}</ul></section>`;
}

export function renderRecord(index, rel, record, review) {
  const kind = `${typeLabel(record.type)} · ${record.id}`;
  const facts = [
    ["File", `<span class="mono">${esc(record.file || "")}${record.line ? `:${record.line}` : ""}</span>`],
  ];
  if (record.type === "use-case") {
    const { results, cases } = useCaseChildren(index, record.id);
    facts.push(["Results", `<b>${results.length}</b>`]);
    facts.push(["Cases", `<b>${cases.length}</b>`]);
  }
  const parts = [];
  parts.push(pageHeader({ kind, title: record.title || record.id, facts }));
  parts.push(authorityStrip(index, record));
  const fieldsHtml = renderFields(index, rel, record);
  if (fieldsHtml) parts.push(fieldsHtml);
  if (record.type === "use-case") {
    const resultsHtml = renderUseCaseResults(index, rel, record);
    if (resultsHtml) parts.push(resultsHtml);
  }
  if (record.type === "case") parts.push(renderCaseProof(index, rel, record));
  const outgoing = renderOutgoingLinks(index, rel, record);
  if (outgoing) parts.push(outgoing);
  const incoming = renderIncomingLinks(index, rel, record);
  if (incoming) parts.push(incoming);
  const computed = renderComputed(index, rel, record);
  if (computed) parts.push(computed);
  const reviewHtml = renderRecordReview(index, rel, record, review);
  if (reviewHtml) parts.push(reviewHtml);
  return parts.join("\n");
}

// ---------- type index ----------

export function renderTypeIndex(index, rel, type) {
  const list = index.byType.get(type) || [];
  const parts = [];
  parts.push(pageHeader({
    kind: "Index",
    title: typeLabel(type, true),
    lede: `${list.length} records.`,
  }));
  const rows = list.map((record) => {
    const status = record.status || "";
    const extra = record.type === "use-case"
      ? (() => {
        const state = useCaseStatus(index, record.id);
        return `<td>${state.implemented ? "Yes" : "No"}</td><td>${state.verified ? "Yes" : "No"}</td>`;
      })()
      : "";
    return `<tr><td><a href="${rel}${recordUrl(record.id)}">${esc(record.title)}</a>` +
      `<div class="mono dim">${esc(record.id)}</div></td>` +
      `<td data-value="${esc(status)}">${statusChip(status)}</td>` +
      `<td>${esc(record.owner || "")}</td>${extra}</tr>`;
  }).join("");
  const extraHead = type === "use-case" ? "<th>Implemented</th><th>Verified</th>" : "";
  parts.push(`<div class="tablewrap"><table class="tbl sortable">` +
    `<thead><tr><th><button type="button" data-sort="0">Title</button></th>` +
    `<th><button type="button" data-sort="1">Status</button></th>` +
    `<th><button type="button" data-sort="2">Owner</button></th>${extraHead}</tr></thead>` +
    `<tbody>${rows}</tbody></table></div>`);
  return parts.join("\n");
}

// ---------- lenses ----------

export function renderLensIndex(index, rel) {
  const actors = index.byType.get("actor") || [];
  const parts = [];
  parts.push(pageHeader({
    kind: "Lenses",
    title: "Lenses",
    lede: "One lens per actor: what each actor does, holds and may reach.",
  }));
  const items = actors.map((actor) => {
    const lens = actorLens(index, actor.id);
    return `<li><a href="${rel}${lensUrl(actor.id)}">${esc(actor.title)}</a> ` +
      `<span class="dim">${lens.journeys.length} journeys, ${lens.roles.length} roles, ` +
      `${lens.permissions.length} permissions, ${lens.useCases.length} use cases</span></li>`;
  }).join("");
  parts.push(`<ul class="links">${items}</ul>`);
  return parts.join("\n");
}

export function renderLens(index, rel, actor) {
  const lens = actorLens(index, actor.id);
  const kind = actor.fields ? actor.fields.kind : null;
  const parts = [];
  parts.push(pageHeader({
    kind: `Lens · ${actor.id}`,
    title: actor.title,
    facts: kind ? [["Kind", esc(kind)]] : [],
  }));
  parts.push(`<h2 id="journeys">Journeys</h2>`);
  if (lens.journeys.length > 0) {
    parts.push(`<ul class="links">${lens.journeys.map((journey) =>
      `<li>${idLink(index, rel, journey.id)}</li>`).join("")}</ul>`);
  } else {
    parts.push(`<p>This actor takes no journey.</p>`);
  }
  parts.push(`<h2 id="roles">Roles</h2>`);
  if (lens.roles.length > 0) {
    const rows = lens.roles.map(({ hold, role }) => {
      const name = role ? `<a href="${rel}${recordUrl(role.id)}">${esc(role.title)}</a>` : `<code>${esc(hold.role)}</code>`;
      return `<tr><td>${name}</td><td>${esc(hold.scope || "")}</td></tr>`;
    }).join("");
    parts.push(`<div class="tablewrap"><table class="tbl"><thead><tr><th>Role</th><th>Scope</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  } else {
    parts.push(`<p>This actor holds no role.</p>`);
  }
  parts.push(`<h2 id="permissions">Permissions</h2>`);
  if (lens.permissions.length > 0) {
    const items = lens.permissions.map((permission) => {
      const meaning = permission.fields ? permission.fields.meaning : null;
      return `<li>${idLink(index, rel, permission.id)}` +
        (meaning ? ` <span class="dim">${esc(meaning)}</span>` : "") + `</li>`;
    }).join("");
    parts.push(`<ul class="links">${items}</ul>`);
  } else {
    parts.push(`<p>Its roles allow no permission.</p>`);
  }
  parts.push(`<h2 id="use-cases">Use cases</h2>`);
  if (lens.useCases.length > 0) {
    parts.push(`<ul class="links">${lens.useCases.map((useCase) =>
      `<li>${idLink(index, rel, useCase.id)}</li>`).join("")}</ul>`);
  } else {
    parts.push(`<p>Its permissions open no use case.</p>`);
  }
  return parts.join("\n");
}

// ---------- review ----------

export function renderReview(index, rel, review, generatedDate) {
  const parts = [];
  parts.push(pageHeader({
    kind: "Review",
    title: "Review",
    lede: `Known gaps, drafts awaiting a decision, and check findings, as of ${generatedDate.slice(0, 10)}.`,
    facts: [
      ["Known gaps", `<b>${review.gaps.length}</b>`],
      ["Drafts", `<b>${review.withDecider.length + review.withoutDecider.length}</b>`],
      ["Findings", `<b>${review.findings.length}</b>`],
    ],
  }));
  parts.push(`<h2 id="gaps">Known gaps</h2>`);
  if (review.gaps.length > 0) {
    const items = review.gaps.map(({ record, expired }) => {
      const fields = record.fields || {};
      const subjects = record.links && Array.isArray(record.links.subject) ? record.links.subject : [];
      const subjectLinks = subjects.map((id) => idLink(index, rel, id)).join(", ");
      return `<div class="fitem"><span class="sev${expired ? " high" : ""}"></span><div>` +
        `<div class="t">${expired ? "Expired: " : ""}<a href="${rel}${recordUrl(record.id)}">${esc(record.title)}</a></div>` +
        `<div class="m"><span>Owner ${esc(record.owner || "none")}</span>` +
        `<span>Ends ${esc(fields.endsBy || "no date")}</span>` +
        `<span>Check <code>${esc(fields.check || "")}</code></span></div>` +
        (fields.reason ? `<p class="d">${esc(fields.reason)}</p>` : "") +
        (subjectLinks ? `<p class="d">About ${subjectLinks}</p>` : "") +
        `</div></div>`;
    }).join("");
    parts.push(items);
  } else {
    parts.push(`<p>No known gap is recorded.</p>`);
  }
  parts.push(`<h2 id="drafts">Drafts awaiting a decision</h2>`);
  const drafts = [...review.withDecider, ...review.withoutDecider];
  if (drafts.length > 0) {
    const rows = drafts.map((record) => {
      const decider = record.fields ? record.fields.decider : null;
      const decideBy = record.fields ? record.fields.decideBy : null;
      return `<tr><td><a href="${rel}${recordUrl(record.id)}">${esc(record.title)}</a>` +
        `<div class="mono dim">${esc(record.id)}</div></td>` +
        `<td>${esc(typeLabel(record.type))}</td>` +
        `<td>${esc(decider || "no decider")}</td>` +
        `<td>${esc(decideBy || "no date")}</td></tr>`;
    }).join("");
    parts.push(`<div class="tablewrap"><table class="tbl"><thead><tr><th>Record</th><th>Type</th><th>Decider</th><th>Decide by</th></thead><tbody>${rows}</tbody></table></div>`);
  } else {
    parts.push(`<p>No draft awaits a decision.</p>`);
  }
  parts.push(`<h2 id="findings">Findings</h2>`);
  if (review.findings.length > 0) {
    const items = review.findings.map((finding) => {
      const subject = finding.subject && index.byId.has(finding.subject)
        ? `<p class="d">About ${idLink(index, rel, finding.subject)}</p>` : "";
      return `<div class="fitem"><span class="sev high"></span><div>` +
        `<div class="t"><code>${esc(finding.code)}</code> ${esc(finding.message)}</div>` +
        `<div class="m"><span class="mono">${esc(finding.path || "")}${finding.line ? `:${finding.line}` : ""}</span></div>` +
        subject + `</div></div>`;
    }).join("");
    parts.push(items);
  } else {
    parts.push(`<p>No findings file was supplied. Run the generator with <code>--findings</code> ` +
      `pointing at the JSON output of the model check to list them here.</p>`);
  }
  if (review.known.length > 0) {
    parts.push(`<h2 id="known">Findings covered by a known gap</h2>`);
    const items = review.known.map((finding) =>
      `<li><code>${esc(finding.code)}</code> ${esc(finding.message)} ` +
      `<span class="mono dim">${esc(finding.path || "")}${finding.line ? `:${finding.line}` : ""}</span></li>`).join("");
    parts.push(`<details><summary>${review.known.length} covered findings</summary><ul class="links">${items}</ul></details>`);
  }
  return parts.join("\n");
}

// ---------- glossary ----------

export function renderGlossary(index, rel) {
  const terms = index.byType.get("term") || [];
  const parts = [];
  parts.push(pageHeader({
    kind: "Glossary",
    title: "Glossary",
    lede: `${terms.length} terms.`,
  }));
  for (const term of terms) {
    const fields = term.fields || {};
    const labels = fields.labels && typeof fields.labels === "object"
      ? Object.entries(fields.labels).map(([language, label]) => `${language}: ${label}`).join(", ")
      : "";
    const rejected = Array.isArray(fields.rejected)
      ? fields.rejected.map((entry) => typeof entry === "object" && entry !== null ? entry.word : entry).filter(Boolean).join(", ")
      : "";
    parts.push(`<div class="card term"><div class="h"><b><a href="${rel}${recordUrl(term.id)}">${esc(term.title)}</a></b>` +
      (labels ? `<span>${esc(labels)}</span>` : "") + `</div>` +
      (fields.meaning ? `<p>${esc(fields.meaning)}</p>` : "") +
      (rejected ? `<p class="dim">Not: ${esc(rejected)}.</p>` : "") + `</div>`);
  }
  if (terms.length === 0) parts.push(`<p>No term is recorded.</p>`);
  return parts.join("\n");
}

// ---------- search ----------

export function renderSearch(rel, entries = []) {
  // The index is embedded in the page so search works when the site opens
  // as files, where fetch cannot load search.json. The container id is
  // unique to this page: no section heading on any page may reuse it.
  const embedded = JSON.stringify(entries).replace(/</g, "\\u003c");
  return pageHeader({
    kind: "Search",
    title: "Search",
    lede: "Filter every record by its title or id.",
  }) + `\n<div id="search-results" role="status" aria-live="polite"><p>Type above to search.</p></div>` +
    `\n<script>window.bookSearchIndex = ${embedded};</script>`;
}

export function searchIndexPayload(index) {
  return (index.records || []).map((record) => ({
    id: record.id,
    title: record.title || record.id,
    type: record.type,
    url: recordUrl(record.id),
  }));
}

