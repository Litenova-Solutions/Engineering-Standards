/**
 * Everything the judge needs to decide on one category, in one run.
 *
 *   node judge.mjs <category-id> [out-dir]
 *
 * 1. The category file loads on its own.
 * 2. Structure: at least 6 options, one pick, a verdict, and a rationale and
 *    a trade-off on every option; ids unique across the registry.
 * 3. audit.mjs for the category.
 * 4. A registry of this category alone, and a contact sheet per item: the
 *    Compare view in light at 1280 and in dark at 390, so every option of an
 *    item is judged in one image per theme.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadOne, loadTolerant } from "./load.mjs";
import { loadPlaywright } from "./playwright.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = loadPlaywright();

const [catId, outArg] = process.argv.slice(2);
const OUT = path.resolve(outArg ?? path.join(HERE, "dist", "judge", catId));
mkdirSync(OUT, { recursive: true });

const cat = await loadOne(catId);
const { loaded } = await loadTolerant();
const others = loaded.filter((c) => c.id !== catId).flatMap((c) => c.items.map((i) => i.id));

const problems = [];
let added = 0;
let newOptions = 0;
for (const item of cat.items) {
  if (others.includes(item.id)) problems.push(`${item.id}: id also used by another category`);
  if (item.variants.length < 6) problems.push(`${item.id}: ${item.variants.length} options`);
  const picks = item.variants.filter((v) => v.pick).length;
  if (picks !== 1) problems.push(`${item.id}: ${picks} picks`);
  if (!item.verdict?.trim()) problems.push(`${item.id}: no verdict`);
  if (item.added) added += 1;
  for (const v of item.variants) {
    if (v.author) newOptions += 1;
    for (const f of ["name", "html", "rationale", "tradeoff"]) if (!String(v[f] ?? "").trim()) problems.push(`${item.id} / ${v.name}: no ${f}`);
    if (/\$\{/.test(v.html)) problems.push(`${item.id} / ${v.name}: an unrendered \${...} placeholder`);
  }
  const names = item.variants.map((v) => v.name);
  for (const n of names.filter((n, i) => names.indexOf(n) !== i)) problems.push(`${item.id}: duplicate option name ${n}`);
}
console.log(`${cat.id}: ${cat.items.length} items (${added} added), ${cat.items.reduce((s, i) => s + i.variants.length, 0)} options (${newOptions} added)`);
console.log(problems.length ? `STRUCTURE:\n  ${problems.join("\n  ")}` : "structure: ok");

execFileSync(process.execPath, [path.join(HERE, "audit.mjs"), catId], { stdio: "inherit" });
const audit = readFileSync(path.join(HERE, "dist", "audit", `${catId}.md`), "utf8").split("\n").filter((l) => l.startsWith("  - "));
if (audit.length) console.log(`AUDIT:\n${audit.slice(0, 30).join("\n")}${audit.length > 30 ? `\n  ... ${audit.length - 30} more` : ""}`);

const page = path.join(OUT, "registry.html");
execFileSync(process.execPath, [path.join(HERE, "build.mjs")], { env: { ...process.env, REGISTRY_ONLY: catId, REGISTRY_OUT: page }, stdio: "pipe" });

const browser = await chromium.launch();
const errors = [];
for (const [theme, width, vw] of [["light", "1280", 2000], ["dark", "390", 2560]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 1400 } });
  await ctx.addInitScript(([t, w]) => {
    localStorage.setItem("ui-patterns.viewer.v1", JSON.stringify({ theme: t, width: w, scale: true, nav: false, view: "compare" }));
  }, [theme, width]);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  for (const item of cat.items) {
    await p.goto(`${pathToFileURL(page).href}#${item.id}/a/compare`);
    await p.waitForTimeout(900);
    // The viewer scrolls inside its main column; let the page grow so the shot holds every option.
    await p.addStyleTag({ content: ".app{height:auto!important}.main{overflow:visible!important}.body{min-height:0}" });
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(OUT, `${item.id}--${theme}-${width}.png`), fullPage: true });
  }
  await ctx.close();
}
await browser.close();
if (errors.length) console.log(`PAGE ERRORS: ${[...new Set(errors)].join("; ")}`);
console.log(`contact sheets: ${OUT}`);
