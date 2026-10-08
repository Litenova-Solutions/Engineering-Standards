/**
 * Loads the registry's categories, or one of them on its own.
 *
 * items/index.mjs imports every category file, so one file that does not parse
 * stops every script. Loading a single category by its id keeps the others
 * judgeable while one is being edited.
 */

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Category id to its file and export, in library order, from categories.json. */
const LIST = JSON.parse(readFileSync(path.join(HERE, "categories.json"), "utf8"));
export const FILES = Object.fromEntries(LIST.map((c) => [c.id, [`${c.file}.mjs`, c.export, c.id]]));

/**
 * A cast reference left as text, such as `${EVENT.date}` inside a plain string,
 * resolved to its value. A mock written with the wrong quote would otherwise
 * show the placeholder to the reviewer.
 */
const CAST = await import("./cast.mjs");
function resolveCast(text) {
  if (typeof text !== "string" || !text.includes("${")) return text;
  return text.replace(/\$\{\s*([A-Z]+(?:\.[A-Za-z0-9_]+)+)\s*\}/g, (whole, ref) => {
    const value = ref.split(".").reduce((o, k) => (o == null ? undefined : o[k]), CAST);
    return typeof value === "string" || typeof value === "number" ? String(value) : whole;
  });
}

function resolveCategory(cat) {
  for (const item of cat.items) {
    item.why = resolveCast(item.why);
    for (const v of item.variants) for (const f of ["html", "rationale", "tradeoff", "name"]) v[f] = resolveCast(v[f]);
  }
  return cat;
}

/** One category, imported fresh. */
export async function loadOne(id) {
  const [file, name, title] = FILES[id] ?? [];
  if (!file) throw new Error(`no category ${id}`);
  const url = `${pathToFileURL(path.join(HERE, "items", file)).href}?t=${Date.now()}`;
  const mod = await import(url);
  return resolveCategory({ id, title, short: title, intro: "", ...mod[name] });
}

/** Every category through items/index.mjs, or only the one asked for. */
export async function loadCategories(only) {
  if (only && only !== "all") return [await loadOne(only)];
  const { CATEGORIES } = await import("./items/index.mjs");
  return CATEGORIES.map(resolveCategory);
}

/** Every category that currently parses, in registry order, and the ids that did not. */
export async function loadTolerant() {
  const loaded = [];
  const failed = [];
  for (const id of Object.keys(FILES)) {
    try {
      loaded.push(await loadOne(id));
    } catch (error) {
      failed.push(`${id}: ${error.message.split("\n")[0]}`);
    }
  }
  return { loaded, failed };
}
