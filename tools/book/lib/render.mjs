// Shared HTML for the book generator: escaping, page shell, navigation.

import { LAYERS, typeLabel, typeIndexUrl, lensUrl, recordUrl } from "./model.mjs";

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function fontsLink() {
  return `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
    `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=Geist+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400&display=swap" rel="stylesheet">`;
}

export function shell({ rel, title, nav, main, wide = false, bodyClass = "", searchQuery = "" }) {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${fontsLink()}
<link rel="stylesheet" href="${rel}assets/book.css">
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
<button class="iconbtn navtoggle" id="navToggle" aria-label="Open navigation" aria-expanded="false">&#9776;</button>
<a class="brand" href="${rel}index.html"><span class="logo">B</span> Project book</a>
<form class="search" action="${rel}search.html" method="get" role="search">
<label class="visually-hidden" for="q">Search records</label>
<input id="q" name="q" type="search" placeholder="Search titles and ids" value="${esc(searchQuery)}" autocomplete="off">
</form>
<div class="topbtns">
<button class="segbtn" id="reviewToggle" aria-pressed="false" title="Show review notes on every page">Review</button>
<button class="iconbtn" id="themeToggle" title="Light or dark" aria-label="Toggle light or dark">&#9681;</button>
</div>
</header>
<div class="layout">
<nav class="nav" id="nav" aria-label="Book">${nav}</nav>
<main class="main" id="main"><div class="page${wide ? " wide" : ""}">${main}</div></main>
</div>
<script src="${rel}assets/book.js" defer></script>
</body>
</html>
`;
}

export function renderNav(index, review, active, rel) {
  const parts = [];
  const reviewCount = review.gaps.length + review.withDecider.length + review.withoutDecider.length + review.findings.length;
  parts.push(`<h2>Book</h2>`);
  parts.push(`<a class="navitem${active === "home" ? " on" : ""}" href="${rel}index.html">Home</a>`);
  parts.push(`<a class="navitem${active === "search" ? " on" : ""}" href="${rel}search.html">Search</a>`);
  parts.push(`<a class="navitem${active === "review" ? " on" : ""}" href="${rel}review/index.html">Review <span class="count${reviewCount ? " hot" : ""}">${reviewCount}</span></a>`);
  parts.push(`<a class="navitem${active === "glossary" ? " on" : ""}" href="${rel}glossary.html">Glossary</a>`);
  const actors = index.byType.get("actor") || [];
  parts.push(`<h2>Lenses</h2>`);
  parts.push(`<a class="navitem${active === "lens-index" ? " on" : ""}" href="${rel}lens/index.html">All lenses</a>`);
  for (const actor of actors) {
    const url = `${rel}${lensUrl(actor.id)}`;
    parts.push(`<a class="navitem${active === actor.id ? " on" : ""}" href="${url}">${esc(actor.title)}</a>`);
  }
  for (const layer of LAYERS) {
    const present = layer.types.filter((type) => (index.byType.get(type) || []).length > 0);
    if (present.length === 0) continue;
    parts.push(`<h2>${esc(layer.name)}</h2>`);
    for (const type of present) {
      const count = (index.byType.get(type) || []).length;
      const url = `${rel}${typeIndexUrl(type)}`;
      const on = active === `type:${type}` ? " on" : "";
      parts.push(`<a class="navitem${on}" href="${url}">${esc(typeLabel(type, true))} <span class="count">${count}</span></a>`);
    }
  }
  return parts.join("\n");
}

export function statusChip(status) {
  if (status === "approved") return `<span class="chip ok">Approved</span>`;
  if (status === "retired") return `<span class="chip">Retired</span>`;
  if (status === "draft") return `<span class="chip warn">Draft</span>`;
  return `<span class="chip">No status</span>`;
}

export function recordLink(index, rel, id) {
  const record = index.byId.get(id);
  if (!record) return `<code>${esc(id)}</code>`;
  return `<a href="${rel}${recordUrl(id)}">${esc(record.title)}</a> <span class="mono dim">${esc(id)}</span>`;
}

export function pageHeader({ kind, title, lede = "", facts = [], chips = [] }) {
  const chipsHtml = chips.length > 0
    ? `<div class="chips">${chips.join("")}</div>`
    : "";
  const factsHtml = facts.length > 0
    ? `<dl class="facts">${facts.map(([term, value]) => `<div><dt>${esc(term)}</dt><dd>${value}</dd></div>`).join("")}</dl>`
    : "";
  return `<div class="kind">${esc(kind)}</div>\n<h1 class="title">${esc(title)}</h1>\n` +
    (lede ? `<p class="lede">${esc(lede)}</p>\n` : "") + chipsHtml + factsHtml;
}

export function sectionHeading(level, id, text) {
  return `<h${level} id="${esc(id)}">${esc(text)}</h${level}>`;
}
