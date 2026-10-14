/**
 * The UI pattern library as data, generated from the drawn items.
 *
 *   node patterns/ui/library.mjs --write   regenerate library.json from items/*.mjs
 *   node patterns/ui/library.mjs --check   fail when library.json differs from what --write would produce
 *
 * library.json is what a consumer's pattern catalog cites. It is derived from the
 * items, so it is never edited by hand: change an item, then run --write.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCategories } from "./load.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "library.json");

export function slug(text) {
  return String(text).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-+$/, "");
}
function plain(html) {
  return String(html ?? "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

const REFLOW = "The recommended option reflows: one column, header actions under the title, and a table scrolls inside its own region.";

async function build() {
  const categories = await loadCategories("all");
  const problems = [];
  const patterns = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      const seen = new Set();
      const options = item.variants.map((v) => {
        let id = slug(v.name);
        while (seen.has(id)) id += "-x";
        seen.add(id);
        const option = { id, name: v.name, rationale: plain(v.rationale), cost: plain(v.tradeoff) };
        if (v.reference) option.reference = v.reference;
        return option;
      });
      const recommended = item.variants.findIndex((v) => v.pick);
      if (recommended < 0) problems.push(`${item.id}: no recommended option (pick)`);
      if (item.variants.length < 2) problems.push(`${item.id}: fewer than two options`);
      let compact = { breakpoint: "md", behaviour: REFLOW };
      if (item.compact) {
        const option = item.compact.option ? options.find((o) => o.name === item.compact.option)?.id : undefined;
        if (item.compact.option && !option) problems.push(`${item.id}: compact option ${item.compact.option} is not one of its options`);
        compact = { breakpoint: item.compact.breakpoint ?? "md", ...(option ? { option } : {}), behaviour: item.compact.behaviour };
      }
      patterns.push({
        id: item.id,
        group: cat.id,
        title: item.title,
        question: plain(item.why),
        options,
        recommended: options[Math.max(0, recommended)].id,
        compact,
        ...(item.verdict ? { assessment: plain(item.verdict) } : {}),
      });
    }
  }
  const ids = patterns.map((p) => p.id);
  for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) problems.push(`duplicate pattern id ${id}`);
  const library = {
    $schema: "../../schemas/ui-pattern-library.schema.json",
    kind: "ui-pattern-library",
    schemaVersion: 1,
    breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
    groups: categories.map((c) => ({ id: c.id, title: c.title, kind: c.kind })),
    patterns,
  };
  return { text: JSON.stringify(library, null, 2) + "\n", problems, count: patterns.length };
}

const mode = process.argv[2];
const { text, problems, count } = await build();
if (problems.length) {
  console.error(`${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exitCode = 1;
} else if (mode === "--write") {
  writeFileSync(OUT, text);
  console.log(`wrote library.json: ${count} patterns`);
} else if (mode === "--check") {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { /* absent */ }
  if (current.replace(/\r\n/g, "\n") !== text) {
    console.error("library.json is stale: run node patterns/ui/library.mjs --write");
    process.exitCode = 1;
  } else console.log(`library.json is current: ${count} patterns`);
} else {
  console.error("usage: node patterns/ui/library.mjs --write | --check");
  process.exitCode = 2;
}
