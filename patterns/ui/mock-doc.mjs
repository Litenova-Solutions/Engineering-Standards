/**
 * One mock as a whole document.
 *
 * The viewer, the audit and the screenshot tool all render a mock through this,
 * so what a reviewer is shown is what the checks measured. A mock runs in its
 * own iframe: the width preset is a real viewport, media queries apply, and the
 * light and dark copies sit side by side without sharing a class on <html>.
 */

import { TOKENS } from "./tokens.mjs";
import { MOCK_CSS } from "./mock-css.mjs";

/** The full stylesheet for a set of categories: tokens, shared vocabulary, then each category's own rules. */
export function sheetFor(categories) {
  return `${TOKENS}\n${MOCK_CSS}\n${categories.map((c) => c.css ?? "").join("\n")}`;
}

/**
 * The body class a variant's declared canvas maps to.
 * `width` is "phone", "narrow" or "wide"; `fit: "full"` drops the 1180 cap.
 */
export function canvasClass(variant) {
  const classes = [];
  if (variant.width) classes.push(`w-${variant.width}`);
  if (variant.fit === "full") classes.push("fit-full");
  return classes.join(" ");
}

/**
 * The script inside every mock document. It reports the canvas height to the
 * parent, so the viewer sizes the iframe to the mock rather than scrolling it,
 * and it swallows clicks on the mock's dead links.
 */
export const MOCK_BOOT = `
(function () {
  // The canvas, not the document: a document is never shorter than its
  // iframe, so measuring it would let a frame grow but never shrink.
  function report() {
    var c = document.querySelector(".mock-canvas");
    var h = c ? Math.ceil(c.getBoundingClientRect().bottom + scrollY) : document.documentElement.scrollHeight;
    var over = document.documentElement.scrollWidth - innerWidth;
    parent.postMessage({ mockHeight: Math.max(h, 80), overflow: over, mockId: window.name }, "*");
  }
  addEventListener("load", report);
  if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (a) e.preventDefault();
  });
})();
`;

/**
 * A complete HTML document for one mock.
 *
 * @param html The mock markup.
 * @param theme "light" or "dark".
 * @param bodyClass The variant's canvas class.
 * @param sheet The stylesheet from sheetFor().
 */
export function mockDocument(html, { theme = "light", bodyClass = "", sheet }) {
  return `<!doctype html><html lang="en"${theme === "dark" ? ' class="dark"' : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${sheet}</style></head><body class="${bodyClass}"><div class="mock-canvas">${html}</div><script>${MOCK_BOOT}</script></body></html>`;
}
