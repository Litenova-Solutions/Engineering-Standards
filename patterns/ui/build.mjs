import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TOKENS } from "./tokens.mjs";
import { loadCategories } from "./load.mjs";
import { MOCK_BOOT, canvasClass, sheetFor } from "./mock-doc.mjs";

// REGISTRY_ONLY=<category-id> builds a registry of that one category, to judge it
// while another category file is being edited; REGISTRY_OUT names the file.
const CATEGORIES = await loadCategories(process.env.REGISTRY_ONLY);

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** Where the artefact lands. A single file, opened straight from disk or through serve.mjs. */
const OUT = process.env.REGISTRY_OUT ? path.resolve(process.env.REGISTRY_OUT) : path.resolve(HERE, "dist", "ui-patterns.html");
mkdirSync(path.dirname(OUT), { recursive: true });
const BUILD_DATE = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const letter = (i) => LETTERS[i] ?? `v${i + 1}`;

/** A variant's stable id: its name as a slug, so a saved choice survives a reorder. */
function slug(text) {
  return String(text).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-+$/, "");
}

const problems = [];
const data = {
  built: BUILD_DATE,
  sheet: sheetFor(CATEGORIES),
  boot: MOCK_BOOT,
  categories: CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    short: category.short,
    intro: category.intro,
    items: category.items.map((item) => {
      const seen = new Set();
      const picks = item.variants.filter((v) => v.pick).length;
      if (picks !== 1) problems.push(`${item.id}: ${picks} options marked as the pick`);
      if (item.variants.length < 6) problems.push(`${item.id}: ${item.variants.length} options, fewer than 6`);
      return {
        id: item.id,
        title: item.title,
        why: item.why,
        floorplan: item.floorplan ?? null,
        shipped: !!item.shipped,
        added: !!item.added,
        verdict: item.verdict ?? null,
        variants: item.variants.map((variant, index) => {
          let id = slug(variant.name);
          while (seen.has(id)) id += "-x";
          seen.add(id);
          for (const field of ["html", "rationale", "tradeoff"]) {
            if (!String(variant[field] ?? "").trim()) problems.push(`${item.id} / ${variant.name}: no ${field}`);
          }
          return {
            id,
            letter: letter(index),
            name: variant.name,
            html: variant.html,
            rationale: variant.rationale,
            tradeoff: variant.tradeoff,
            pick: !!variant.pick,
            shipped: !!variant.shipped,
            author: variant.author ?? null,
            bodyClass: canvasClass(variant),
          };
        }),
      };
    }),
  })),
};

const ids = data.categories.flatMap((c) => c.items.map((i) => i.id));
for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) problems.push(`duplicate item id: ${id}`);

/** JSON inside a script element: "</" would end the element early. */
const json = JSON.stringify(data).replaceAll("</", "<\\/").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
const css = readFileSync(path.resolve(HERE, "viewer.css"), "utf8");
const js = readFileSync(path.resolve(HERE, "viewer.js"), "utf8");

const items = data.categories.flatMap((c) => c.items);
const options = items.reduce((s, i) => s + i.variants.length, 0);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI pattern library</title>
<meta name="description" content="Every recurring screen, element and scenario in a business application, with several options each, to choose from and record in a pattern catalog.">
<style>
${TOKENS}
${css}
</style>
<script>
try {
  var u = JSON.parse(localStorage.getItem("ui-patterns.viewer.v1") || "{}");
  if (u.theme === "dark" || (u.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
} catch (e) {}
</script>
</head>
<body>
<div class="app" id="app">
  <header class="top" id="top"></header>
  <div class="body">
    <nav class="nav" aria-label="Items">
      <div class="nav-search">
        <input type="search" id="q" placeholder="Search items and options  ( / )" aria-label="Search items and options">
        <div class="nav-filter" id="nav-filter" role="group" aria-label="Show">
          <button type="button" data-f="all">All</button><button type="button" data-f="open">Open</button><button type="button" data-f="chosen">Chosen</button><button type="button" data-f="new">Added in review</button>
        </div>
      </div>
      <div class="nav-list" id="nav-list"></div>
    </nav>
    <main class="main" id="main"><div class="main-in" id="main-in"></div></main>
  </div>
</div>

<div id="panel-wrap" hidden>
  <div class="scrim" id="panel-scrim"></div>
  <aside class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
    <header>
      <div style="flex:1"><h2 id="panel-title">Your choices</h2><p>Everything you choose, shortlist and note, written to one file.</p></div>
      <button class="b sm icon ghost" type="button" id="panel-close" aria-label="Close">\u2715</button>
    </header>
    <div class="pbody" id="panel-body"></div>
  </aside>
</div>
<input type="file" id="import-input" accept="application/json,.json" hidden>

<div class="show" id="show" hidden role="dialog" aria-modal="true" aria-label="Slideshow">
  <div class="show-stage" id="show-stage"></div>
  <div class="show-why" id="show-why"></div>
  <div class="show-bar" id="show-bar"></div>
</div>

<script type="application/json" id="registry-data">${json}</script>
<script>
${js}
</script>
</body>
</html>
`;

writeFileSync(OUT, html, "utf8");

console.log(`wrote ${OUT}`);
console.log(`  ${(html.length / 1024).toFixed(0)} KB, ${data.categories.length} categories, ${items.length} items, ${options} options`);
console.log(`  ${items.filter((i) => i.added).length} items and ${items.reduce((s, i) => s + i.variants.filter((v) => !!v.author).length, 0)} options added in review, ${items.filter((i) => i.verdict).length} verdicts`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exitCode = 1;
}
