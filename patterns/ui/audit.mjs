/**
 * Measures every mock of one category, or of all of them, at real widths in
 * both themes, and writes what a reviewer would otherwise have to see.
 *
 *   node audit.mjs [category-id|all]
 *
 * Writes audit/<category-id>.md: per option, sideways overflow at each width,
 * text whose contrast with its background is under 4.5:1 (3:1 for large text),
 * text clipped by its box, and colours written into the markup instead of tokens.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadPlaywright } from "./playwright.mjs";
import { fileURLToPath } from "node:url";

import { loadCategories, loadOne, loadTolerant } from "./load.mjs";
import { canvasClass, mockDocument, sheetFor } from "./mock-doc.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = loadPlaywright();

const want = process.argv[2] ?? "all";
const WIDTHS = [390, 768, 1440];
const THEMES = ["light", "dark"];
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
mkdirSync(path.join(HERE, "dist", "audit"), { recursive: true });

/** Runs inside the mock: contrast and clipping, with a short path to each element. */
function inspect() {
  // Computed colours arrive as oklch(); painting one pixel converts any CSS
  // colour to sRGB without a colour-space library.
  const pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  function rgba(str) {
    if (cache.has(str)) return cache.get(str);
    pixel.clearRect(0, 0, 1, 1);
    pixel.fillStyle = "#000";
    pixel.fillStyle = str;
    pixel.fillRect(0, 0, 1, 1);
    const d = pixel.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    cache.set(str, out);
    return out;
  }
  function lum([r, g, b]) {
    const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function over(top, under) {
    const a = top[3];
    return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
  }
  function bgOf(el) {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    let base = rgba(getComputedStyle(document.body).backgroundColor);
    if (base[3] < 1) base = document.documentElement.classList.contains("dark") ? [37, 37, 37, 1] : [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  }
  function label(el) {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 3; n = n.parentElement) {
      parts.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/).slice(0, 2).join(".") : ""));
    }
    return parts.join(" > ");
  }
  const low = [];
  const clipped = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode;
    const text = t.textContent.trim();
    if (!text) continue;
    const el = t.parentElement;
    if (seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.6) continue;
    if (el.closest("[aria-disabled='true'],[disabled],.disabled")) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const fg = rgba(cs.color);
    const bg = bgOf(el);
    const fgOn = over(fg, bg);
    const L1 = lum(fgOn), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    const need = large ? 3 : 4.5;
    if (ratio < need) low.push(`${ratio.toFixed(2)}:1 "${text.slice(0, 40)}" (${label(el)})`);
    if ((cs.overflow.includes("hidden") || cs.textOverflow === "ellipsis") && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== "ellipsis") {
      clipped.push(`"${text.slice(0, 40)}" (${label(el)})`);
    }
  }
  // A box that hides overflow and holds wider content cuts that content off;
  // a box that scrolls (auto/scroll) is a deliberate scroll container.
  for (const box of document.querySelectorAll(".mock-canvas *:not(input):not(textarea):not(select)")) {
    const cs = getComputedStyle(box);
    if (!/hidden|clip/.test(cs.overflowX) || cs.textOverflow === "ellipsis") continue;
    if (box.clientWidth < 40 || box.scrollWidth <= box.clientWidth + 4) continue;
    if (box.getBoundingClientRect().height <= 1) continue;
    clipped.push(`box cuts off ${box.scrollWidth - box.clientWidth}px of content (${label(box)})`);
  }
  // Content pushed past the left edge never makes a scrollbar, so it is
  // invisible to the overflow check: a menu or popover cut off on a phone.
  for (const el of document.querySelectorAll(".mock-canvas *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.left > -4) continue;
    if (!el.textContent.trim() || [...el.children].some((c) => c.getBoundingClientRect().left <= -4)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    clipped.push(`off the left edge by ${Math.round(-r.left)}px "${el.textContent.trim().slice(0, 30)}" (${label(el)})`);
  }
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    height: document.documentElement.scrollHeight,
    low: low.slice(0, 12),
    lowCount: low.length,
    clipped: clipped.slice(0, 6),
  };
}

const HARD_COLOUR = /(?:#[0-9a-fA-F]{3,8}\b|\b(?:white|black)\b(?=[;"'\s)])|rgba?\(|hsla?\()/g;

const browser = await chromium.launch();
const page = await browser.newPage();
const cats = want === "all" ? (await loadTolerant()).loaded : [await loadOne(want)];
const sheet = sheetFor(cats);
for (const cat of cats) {
  const lines = [`# Audit: ${cat.title} (${cat.id})`, "", `Generated by audit.mjs. Widths ${WIDTHS.join(", ")}; light and dark. Contrast floor 4.5:1, 3:1 for large text.`, ""];
  let findings = 0;
  for (const item of cat.items) {
    lines.push(`## ${item.id}: ${item.title}`, "");
    for (const [i, v] of item.variants.entries()) {
      const out = [];
      const styleColours = [...v.html.matchAll(/style="([^"]*)"/g)].flatMap((m) => m[1].match(HARD_COLOUR) ?? []);
      if (styleColours.length) out.push(`hard-coded colours in style attributes: ${[...new Set(styleColours)].slice(0, 6).join(", ")}`);
      const widths = v.width === "phone" ? [390] : v.width === "narrow" ? [480] : v.width === "tablet" ? [768] : WIDTHS;
      for (const width of widths) {
        for (const theme of THEMES) {
          await page.setViewportSize({ width, height: 900 });
          await page.setContent(mockDocument(v.html, { theme, bodyClass: canvasClass(v), sheet }), { waitUntil: "load" });
          const r = await page.evaluate(inspect);
          const tag = `${theme} ${width}`;
          if (r.overflow > 1) out.push(`${tag}: page scrolls sideways by ${r.overflow}px`);
          if (r.lowCount) out.push(`${tag}: ${r.lowCount} low-contrast text: ${r.low.slice(0, 4).join("; ")}`);
          if (r.clipped.length) out.push(`${tag}: clipped text: ${r.clipped.join("; ")}`);
        }
      }
      findings += out.length;
      lines.push(`- **${LETTERS[i].toUpperCase()} ${v.name}**${v.pick ? " (pick)" : ""}: ${out.length ? "" : "no findings"}`);
      for (const o of out) lines.push(`  - ${o}`);
    }
    lines.push("");
  }
  writeFileSync(path.join(HERE, "dist", "audit", `${cat.id}.md`), lines.join("\n"));
  console.log(`${cat.id}: ${findings} findings`);
}
await browser.close();
