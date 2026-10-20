/**
 * Reusable mock fragments.
 *
 * A fragment draws one piece of a screen the way a shared UI package draws it, so an
 * item's variant only has to say what is different about its idea. Every
 * fragment takes the cast so the data stays the reference cast.
 */

import { COMPANY, DELIVERY, INVOICE, MONEY, ORDER, PEOPLE, PRODUCT, REFUSALS, STATES } from "./cast.mjs";

export { COMPANY, DELIVERY, INVOICE, MONEY, ORDER, PEOPLE, PRODUCT, REFUSALS, STATES };

/** A status badge. The word is the signal; the tone repeats it. */
export function badge(state, extra = "") {
  return `<span class="badge ${state.tone}${extra}"><span class="dot"></span>${state.label}</span>`;
}

/** A badge from raw parts, for states the cast does not name. */
export function badgeRaw(label, tone = "neutral", extra = "") {
  return `<span class="badge ${tone}${extra}"><span class="dot"></span>${label}</span>`;
}

/** The sidebar, at the width the real shell uses inside a mock. */
export function sidebar(active = "Home", groups = true) {
  const item = (label, href, current, sub = false, chev = false, count) =>
    `<a href="#"${current ? ' aria-current="page"' : ""}${sub ? ' class="sub"' : ""}>${
      sub ? "" : '<span style="width:12px;display:inline-block;opacity:.55"></span>'
    }${label}${count ? `<span class="n" style="margin-left:auto;font-size:11px">${count}</span>` : ""}${
      chev ? '<span class="chev">›</span>' : ""
    }</a>`;

  return `<nav>
  ${item("Home", "#", active === "Home")}
  ${item("Orders", "#", active === "Orders", false, groups)}
  ${groups && active === "Orders" ? item("Orders", "#", true, true) + item("Returns", "#", false, true) : ""}
  ${item("Customers", "#", active === "Customers", false, groups)}
  ${item("Products", "#", active === "Products", false, groups)}
  ${item("Invoices", "#", active === "Invoices", false, groups)}
  ${item("Reports", "#", active === "Reports", false, groups)}
  ${item("Settings", "#", active === "Settings", false, groups)}
  <span class="grow"></span>
  ${item("Help", "#", false)}
  <div class="who">
    <span class="avatar" style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span>
    <span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span>
  </div>
</nav>`;
}

/** A top bar above the page body. */
export function bar(title) {
  return `<div class="bar"><span>${title}</span><span class="icons">◐ ☼</span></div>`;
}

/**
 * A whole mock inside the console shell, which is what most items are judging.
 *
 * @param title The browser-bar title.
 * @param page The page markup, already composed.
 * @param active The sidebar entry to mark current.
 */
export function shell(title, page, active = "Home", { groups = true } = {}) {
  return `<div class="shell">${sidebar(active, groups)}<div class="main">${bar(title)}${page}</div></div>`;
}

/** A breadcrumb trail. */
export function trail(...parts) {
  const last = parts.length - 1;
  return `<nav class="trail">${parts
    .map((part, i) =>
      i === last ? `<span aria-current="page" style="color:var(--foreground);font-weight:500">${part}</span>` : `<a href="#">${part}</a><span class="sep">›</span>`,
    )
    .join("")}</nav>`;
}

/**
 * A page heading with its actions.
 *
 * @param title The h1.
 * @param desc One line under it.
 * @param actions Markup for the action area.
 */
export function phead(title, desc, actions = "", { crumb = null, below = false } = {}) {
  return `${crumb ?? ""}
<div class="phead">
  <div>
    <h1>${title}</h1>
    ${desc ? `<p class="desc">${desc}</p>` : ""}
  </div>
  ${actions ? `<div class="acts${below ? " below" : ""}">${actions}</div>` : ""}
</div>`;
}

/** A Section: the only box in the dashboard. */
export function section(title, body, { desc = "", acts = "", flush = false } = {}) {
  return `<section class="section">
  ${title ? `<h3>${title}${acts ? `<span class="acts">${acts}</span>` : ""}</h3>` : ""}
  ${desc ? `<p class="sdesc">${desc}</p>` : ""}
  <div class="body${flush ? " flush" : ""}">${body}</div>
</section>`;
}

/** A stat tile. */
export function tile(label, figure, sub = "", extra = "") {
  return `<div class="tile"><div class="lab">${label}</div><div class="fig">${figure}</div>${sub ? `<div class="sub">${sub}</div>` : ""}${extra}</div>`;
}

/** A row of stat tiles. */
export function tiles(...rows) {
  return `<div class="tiles">${rows.join("")}</div>`;
}

/** A form field with label, control, help and error. */
export function field(label, control, { help = "", error = "", optional = false, required = false } = {}) {
  const marker = optional ? `<span class="opt">optional</span>` : required ? `<span class="req" aria-hidden="true">*</span>` : "";
  return `<div class="field">
  <label>${label}${marker}</label>
  ${control}
  ${help ? `<span class="help">${help}</span>` : ""}
  ${error ? `<span class="err">${error}</span>` : ""}
</div>`;
}

/** A text input. */
export function input(value = "", { placeholder = "", cls = "", readonly = false, disabled = false } = {}) {
  return `<input class="inp ${cls}" value="${value}" placeholder="${placeholder}"${
    readonly ? " readonly" : ""
  }${disabled ? " disabled" : ""}>`;
}

/** A money input with the currency shown. */
export function money(value, { suffix = "EUR", wrap = true, cls = "" } = {}) {
  const control = `<input class="inp money ${wrap ? "has-cur" : ""}" value="${value}" inputmode="decimal">`;
  return wrap
    ? `<span class="inp-wrap money-wrap has-cur">${control}<span class="cur">${suffix}</span></span>`
    : control;
}

/** A select. */
export function select(value, options = []) {
  return `<select class="sel">${options
    .map((o) => `<option${o === value ? " selected" : ""}>${o}</option>`)
    .join("")}</select>`;
}

/** An alert. A command result, worded by its own code. */
export function alert(tone, title, detail = "", tail = "") {
  const ico = { positive: "✓", destructive: "✕", caution: "!", info: "i", plain: "", "solid-pos": "✓", "solid-neg": "✕" }[tone] ?? "i";
  return `<div class="alert ${tone}">
  <span class="ico" aria-hidden="true">${ico}</span>
  <span class="txt"><b>${title}</b>${detail ? `<small>${detail}</small>` : ""}</span>
  ${tail ? `<span class="tail">${tail}</span>` : ""}
</div>`;
}

/** A refusal worded from its code, which is how the dashboard words one. */
export function refusal(key, { withHelp = true } = {}) {
  const r = REFUSALS[key];
  return alert(
    "destructive",
    r.title,
    r.detail,
    withHelp ? '<span class="linkish" style="font-size:11.5px">Why?</span>' : "",
  );
}

/** A page-level status. A fact, not a command result. */
export function notice(tone, text) {
  return `<div class="alert ${tone}"><span class="txt">${text}</span></div>`;
}

/** An empty state. */
export function emptyState(title, line, action = "", icon = "◍") {
  return `<div class="empty">
  <span class="ico" aria-hidden="true">${icon}</span>
  <b>${title}</b>
  <p>${line}</p>
  ${action}
</div>`;
}

/** A skeleton placeholder block. */
export function skeleton(kind = "list") {
  if (kind === "tiles") {
    return `<div class="tiles">${Array.from({ length: 3 }, () => `<div class="tile"><div class="skel" style="width:44%"></div><div class="skel" style="height:24px;width:34%;margin:5px 0"></div><div class="skel" style="width:70%"></div></div>`).join("")}</div>`;
  }
  if (kind === "rows") return Array.from({ length: 4 }, () => '<div class="skel row"></div>').join("");
  return Array.from({ length: 3 }, (_, i) => `<div class="skel line" style="width:${[90, 74, 82][i]}%"></div>`).join("");
}

/** A progress bar. */
export function progress(value, thin = false) {
  return `<div class="progress${thin ? " thin" : ""}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><i style="width:${value}%"></i></div>`;
}

/** A spinner with its label. */
export function loading(text = "Loading") {
  return `<div class="loading-row"><span class="spinner" role="status"></span>${text}</div>`;
}

/** A toast at the edge of the screen. */
export function toast(tone, text, { undo = false, close = true } = {}) {
  const ico = { positive: "✓", destructive: "✕", caution: "!", info: "i" }[tone] ?? "i";
  return `<div class="toast">
  <span aria-hidden="true" style="color:var(--${tone === "positive" ? "positive" : tone === "destructive" ? "destructive" : tone === "caution" ? "caution" : "info"}-surface-foreground)">${ico}</span>
  <span>${text}</span>
  ${undo || close ? `<span class="tail">${undo ? '<span class="undo">Undo</span>' : ""}${close ? '<span style="color:var(--muted-foreground);cursor:pointer">✕</span>' : ""}</span>` : ""}
</div>`;
}

/** A pagination bar. */
export function pager(page = 1, pages = 11, from = 1, to = 25, total = 268) {
  const nums = [];
  const window = [1, 2, 3, 4, 5, 6, 7];
  for (const n of window) {
    if (n > pages) break;
    nums.push(`<button${n === page ? ' aria-current="page"' : ""}>${n}</button>`);
  }
  return `<div class="pager">
  <span>${from} – ${to} of ${total}</span>
  <span class="right">
    <span class="nums">${nums.join("")}</span>
    <button class="btn sm icon" aria-label="Previous page"${page === 1 ? " disabled" : ""}>‹</button>
    <button class="btn sm icon" aria-label="Next page">›</button>
  </span>
</div>`;
}

/**
 * A toolbar with search and filters.
 *
 * A filter is either a label, which becomes a one-option select, or a string that
 * already carries its own markup. Anything containing markup is passed through,
 * because wrapping it again would nest a select inside a select and the browser
 * silently repairs it into something the reader cannot use.
 */
export function toolbar({ search = "", filters = [], views = null, right = "", placeholder = "Search" } = {}) {
  return `<div class="toolbar">
  ${views ? segmented(views.map((v) => v.label ?? v), views.findIndex((v) => v.on)) : ""}
  ${search !== null ? `<span class="search"><span class="ico">⌕</span><input value="${search}" placeholder="${placeholder}"></span>` : ""}
  ${filters
    .map((f) => (typeof f === "string" && f.includes("<") ? f : `<select class="fsel"><option>${f}</option></select>`))
    .join("")}
  ${right ? `<span class="right">${right}</span>` : ""}
</div>`;
}

/** A segmented control. */
export function segmented(labels, active = 0) {
  return `<div class="segmented" role="group">${labels
    .map((l, i) => `<button aria-pressed="${i === active}">${l}</button>`)
    .join("")}</div>`;
}

/** A dialog drawn on a scrim inside the stage. */
export function dialog(title, body, { footer = "", size = "", desc = "", scrim = true } = {}) {
  return `${scrim ? '<div class="scrim">' : ""}
<div class="dialog ${size}" role="dialog" aria-modal="true" aria-label="${title}">
  <header><div><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ""}</div></header>
  <div class="dbody">${body}</div>
  ${footer ? `<footer>${footer}</footer>` : ""}
</div>
${scrim ? "</div>" : ""}`;
}

/** A drawer drawn beside its list. */
export function drawer(content, { footer = "" } = {}) {
  return `<div class="scrim" style="place-items:stretch;padding:0">
  <div class="drawer" role="dialog" aria-modal="true">${content}${footer ? `<footer>${footer}</footer>` : ""}</div>
</div>`;
}

/** A dropdown menu. */
export function menu(items, { width = "" } = {}) {
  return `<div class="menu" style="${width ? `width:${width}` : ""}">${items
    .map((i) => (i === "-" ? '<div class="sep"></div>' : `<div class="mi${i.danger ? " danger" : ""}"${i.disabled ? " disabled" : ""}${
      i.checked ? ' aria-checked="true"' : ""
    }>${i.icon ? `<span aria-hidden="true" style="opacity:.6">${i.icon}</span>` : ""}${i.label}${i.shortcut ? `<span class="sc">${i.shortcut}</span>` : ""}</div>`))
    .join("")}</div>`;
}

/** A tooltip. */
export function tip(text, keys) {
  return `<div class="tip" role="tooltip">${text}${keys ? ` ${keys.map((k) => `<kbd>${k}</kbd>`).join(" ")}` : ""}</div>`;
}

/** An explained action: a disabled button with its reason in visible text. */
export function explained(action, why, danger = false) {
  return `<div class="explained">
  <button class="btn${danger ? " subtle-danger" : ""}" aria-disabled="true" tabindex="0">${action}</button>
  <span class="why">${why}</span>
</div>`;
}

/** A record list row. */
export function recordRow({ title, sub = "", state = null, fig = "", figSub = "", actions = "", lead = null }) {
  return `<div class="rrow">
  ${lead ? `<span class="lead ${lead}"></span>` : ""}
  <span class="txt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span>
  ${state ? `<span style="flex:none">${badgeRaw(state.label, state.tone)}</span>` : ""}
  ${fig ? `<span class="fig">${fig}${figSub ? `<small>${figSub}</small>` : ""}</span>` : ""}
  ${actions ? `<span class="acts">${actions}</span>` : ""}
</div>`;
}

/** An action list row: something to deal with, with the step that deals with it. */
export function actionRow(title, why, step = "Deal with it", icon = "◔") {
  return `<div class="arow">
  <span class="why" aria-hidden="true">${icon}</span>
  <span class="txt"><b>${title}</b><small>${why}</small></span>
  <span class="go"><button class="btn sm">${step}</button></span>
</div>`;
}

/** A timeline entry. */
export function timelineEntry(title, when, who = "", tone = "neutral", last = false) {
  return `<div class="tlrow">
  <span class="rail"><span class="node ${tone}"></span>${last ? "" : '<span class="thread"></span>'}</span>
  <span class="tx"><b>${title}</b><small>${when}${who ? ` · ${who}` : ""}</small></span>
</div>`;
}

/** Tabs. */
export function tabs(labels, active = 0) {
  return `<div class="tabs" role="tablist">${labels
    .map((l, i) => `<button role="tab" aria-selected="${i === active}">${l}</button>`)
    .join("")}</div>`;
}

/** A statement: money that adds up top to bottom. */
export function statement(groups, grand) {
  return `<div class="stmt">${groups
    .map(
      (group) => `<div class="grp">
    <div class="glab">${group.label}</div>
    ${group.lines
      .map(
        (line) => `<div class="line"><span>${line.what}${line.sub ? `<span class="sub">${line.sub}</span>` : ""}</span><span class="fig">${line.amount}</span></div>`,
      )
      .join("")}
    <div class="sub-total"><span>${group.totalLabel}</span><span class="fig">${group.total}</span></div>
  </div>`,
    )
    .join("")}<div class="grand"><span>${grand.label}</span><span class="fig">${grand.amount}</span></div></div>`;
}

/** A money row in a list: what it is on the left, the figure on the right. */
export function split(what, figure, sub = "") {
  return `<div class="split"><span>${what}${sub ? `<span class="sub">${sub}</span>` : ""}</span><span class="fig">${figure}</span></div>`;
}

/** A labelled value grid. */
export function facts(pairs, { stacked = false } = {}) {
  return `<dl class="facts${stacked ? " stacked" : ""}">${pairs
    .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
    .join("")}</dl>`;
}

/** The order table row the shipped list page draws, as a reusable table. */
export function ordersTable({ rows = 6, sortable = false, states = true } = {}) {
  const header = (label, cls = "") =>
    `<th scope="col" class="${sortable ? "sortable " : ""}${cls}">${label}${sortable ? '<span class="dir">▾</span>' : ""}</th>`;

  const data = [
    [ORDER.number, ORDER.company, `${ORDER.customer}<small>${ORDER.email}</small>`, ORDER.placed, "Paid", MONEY.order],
    ["SO-1041", "Becker Bouw", "Tom Becker<small>tom@becker-bouw.example</small>", "8 Oct 2026, 09:20", "Paid", "EUR 310.00"],
    ["SO-1040", "Lindqvist Studio", "Elin Lindqvist<small>elin@lindqvist.example</small>", "8 Oct 2026, 08:55", "Awaiting payment", "EUR 64.50"],
    ["SO-1039", ORDER.company, `${ORDER.customer}<small>${ORDER.email}</small>`, "7 Oct 2026, 17:12", "Shipped", MONEY.lamp],
    ["SO-1038", "Okafor Office", "Ade Okafor<small>ade@okafor.example</small>", "7 Oct 2026, 15:40", "Refunded", "EUR 0.00"],
    ["SO-1037", "Becker Bouw", "Tom Becker<small>tom@becker-bouw.example</small>", "7 Oct 2026, 11:03", "Paid", "EUR 1,240.00"],
  ].slice(0, rows);

  return `<table class="dt">
  <thead><tr>
    <th class="check"><input type="checkbox" aria-label="Select all orders"></th>
    ${header("Order")}${header("Customer")}${header("Placed")}
    ${states ? header("State") : ""}${header("Paid", "num")}
  </tr></thead>
  <tbody>${data
    .map(
      ([number, company, customer, placed, state, paid], i) => `<tr>
    <td class="check"><input type="checkbox" aria-label="Select order ${number}"></td>
    <td><span class="lines"><span class="code">${number}</span><small>${company}</small></span></td>
    <td><span class="lines"><b>${customer.split("<small>")[0]}</b>${customer.includes("<small>") ? `<small>${customer.split("<small>")[1].replace("</small>", "")}</small>` : ""}</span></td>
    <td class="nowrap">${placed}</td>
    ${states ? `<td>${badgeRaw(state, { Paid: "positive", Shipped: "positive", "Awaiting payment": "caution", Refunded: "neutral" }[state] ?? "neutral", "outline")}</td>` : ""}
    <td class="num">${paid}</td>
  </tr>`,
    )
    .join("")}</tbody>
</table>`;
}

/** A two-column page frame, the editor's shape. */
export function twoCol(left, right, { ratio = "1fr 1fr" } = {}) {
  return `<div style="display:grid;grid-template-columns:${ratio};gap:18px;align-items:start">${left}${right}</div>`;
}

/** A brand mark, as an application header draws it. */
export function brandMark(size = 26) {
  return `<span class="brand-mark" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px">E</span>`;
}

/** A file drop zone. */
export function dropZone(label, help) {
  return `<button class="drop"><span class="ico">▤</span><span><b>${label}</b><small>${help}</small></span></button>`;
}

/** A key/value list for identifiers, labelled and copyable. */
export function copyValue(label, value) {
  return `<span class="copyable"><span class="code">${value}</span><button aria-label="Copy ${label}">⧉</button></span>`;
}

/** A callout. */
export function callout(tone, html) {
  return `<div class="callout ${tone}">${html}</div>`;
}

/** A form section: the title and line on the left, the fields on the right. */
export function formSection(title, line, fields, { stacked = false } = {}) {
  return `<div class="fsect${stacked ? " stacked" : ""}">
  <div class="ft"><h4>${title}</h4>${line ? `<p>${line}</p>` : ""}</div>
  <div class="ff">${fields}</div>
</div>`;
}

/** A submit row. */
export function formActions(...buttons) {
  return `<div class="btnrow end">${buttons.join("")}</div>`;
}