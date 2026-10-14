/**
 * Photographs one item's mocks at real viewport widths, in both themes.
 *
 *   node shoot.mjs <item-id> [variants] [widths] [themes]
 *   node shoot.mjs frame-home                  every option, 390,768,1440, light,dark
 *   node shoot.mjs frame-home a,c 1440 dark     two options, one width, one theme
 *
 * Writes shots/review/<item-id>/<letter>-<theme>-<width>.png and prints, per
 * shot, whether the mock overflows its viewport sideways. A mock renders through
 * mock-doc.mjs, the same document the viewer puts in its iframe.
 */

import { mkdirSync } from "node:fs";
import path from "node:path";
import { loadPlaywright } from "./playwright.mjs";
import { fileURLToPath } from "node:url";

import { loadTolerant } from "./load.mjs";
import { canvasClass, mockDocument, sheetFor } from "./mock-doc.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = loadPlaywright();

const [itemId, which = "all", widthsArg = "390,768,1440", themesArg = "light,dark"] = process.argv.slice(2);
if (!itemId) {
  console.error("usage: node shoot.mjs <item-id> [a,b|all] [390,768,1440] [light,dark]");
  process.exit(2);
}

const { loaded: CATEGORIES } = await loadTolerant();
const sheet = sheetFor(CATEGORIES);
const item = CATEGORIES.flatMap((c) => c.items).find((i) => i.id === itemId);
if (!item) {
  console.error(`no item with id ${itemId}`);
  process.exit(2);
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const wanted = which === "all" ? null : new Set(which.split(","));
const widths = widthsArg.split(",").map(Number);
const themes = themesArg.split(",");
const outDir = path.resolve(HERE, "dist", "shots", itemId);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const [index, variant] of item.variants.entries()) {
  const code = LETTERS[index];
  if (wanted && !wanted.has(code)) continue;
  const own = variant.width === "phone" ? [390] : variant.width === "narrow" ? [480] : variant.width === "tablet" ? [768] : widths;
  for (const width of own) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setContent(mockDocument(variant.html, { theme, bodyClass: canvasClass(variant), sheet }), { waitUntil: "load" });
      const facts = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        height: document.documentElement.scrollHeight,
      }));
      const file = path.join(outDir, `${code}-${theme}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const flags = [];
      if (facts.overflow > 1) flags.push(`OVERFLOWS by ${facts.overflow}px`);
      if (errors.length) flags.push(`ERRORS ${errors.join("; ")}`);
      console.log(`${code.toUpperCase()} ${variant.name} | ${theme} ${width} | h=${facts.height} ${flags.join(" ")}\n   ${file}`);
      await page.close();
    }
  }
}
await browser.close();
