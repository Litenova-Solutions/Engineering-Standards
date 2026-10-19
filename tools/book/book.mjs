#!/usr/bin/env node
// Generate the project book: a static site from a consumer's model.json.
//
// Usage: node tools/book/book.mjs --model <model.json> --out <folder> [--findings <file>]

import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, reviewData, recordUrl, typeIndexUrl, lensUrl, relFor, typeLabel } from "./lib/model.mjs";
import { shell, renderNav } from "./lib/render.mjs";
import {
  renderHome, renderRecord, renderTypeIndex, renderLensIndex, renderLens,
  renderReview, renderGlossary, renderSearch, searchIndexPayload,
} from "./lib/pages.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

function usage() {
  return `Usage: node tools/book/book.mjs --model <model.json> --out <folder> [--findings <file>]

Options:
  --model <file>     The model.json written by the model builder (required).
  --out <folder>     The folder to write the static site to (required).
  --findings <file>  The JSON output of the model check, for the review page.
`;
}

function parseArgs(argv) {
  const args = { model: null, out: null, findings: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--model" || arg === "--out" || arg === "--findings") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) return { error: `Option ${arg} needs a value.` };
      args[arg.slice(2)] = value;
      index += 1;
    } else {
      return { error: `Unknown argument '${arg}'.` };
    }
  }
  if (!args.model) return { error: "Missing --model <model.json>." };
  if (!args.out) return { error: "Missing --out <folder>." };
  return { args };
}

async function readJson(path) {
  const text = await readFile(path, "utf8");
  return JSON.parse(text);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    process.stdout.write(usage());
    return 0;
  }
  if (parsed.error) {
    process.stderr.write(`${parsed.error}\n${usage()}`);
    return 2;
  }
  const { model: modelPath, out: outDir, findings: findingsPath } = parsed.args;

  let model;
  try {
    model = await readJson(modelPath);
  } catch (error) {
    process.stderr.write(`Cannot read model '${modelPath}': ${error.message}\n`);
    return 1;
  }
  if (!model || typeof model !== "object" || !Array.isArray(model.records)) {
    process.stderr.write(`Model '${modelPath}' holds no records array.\n`);
    return 1;
  }

  let findingsFile = null;
  if (findingsPath) {
    try {
      findingsFile = await readJson(findingsPath);
    } catch (error) {
      process.stderr.write(`Cannot read findings '${findingsPath}': ${error.message}\n`);
      return 1;
    }
  } else if (model.findings && typeof model.findings === "object") {
    findingsFile = model.findings;
  }

  const index = buildIndex(model);
  const generatedDate = new Date().toISOString();
  const review = reviewData(index, findingsFile, generatedDate);

  const pages = [];
  const addPage = (url, title, main, active, wide = false, bodyClass = "") => {
    pages.push({ url, title, main, active, wide, bodyClass });
  };

  const searchEntries = searchIndexPayload(index);
  addPage("index.html", "Project book", renderHome(index, ""), "home", true);
  addPage("search.html", "Search · Project book", renderSearch("", searchEntries), "search");
  addPage("glossary.html", "Glossary · Project book", renderGlossary(index, ""), "glossary");
  addPage("review/index.html", "Review · Project book",
    renderReview(index, "../", review, generatedDate), "review", true, "review-always");
  addPage("lens/index.html", "Lenses · Project book", renderLensIndex(index, "../"), "lens-index");

  for (const type of [...index.byType.keys()].sort()) {
    const url = typeIndexUrl(type);
    addPage(url, `${typeLabel(type, true)} · Project book`, renderTypeIndex(index, relFor(url), type), `type:${type}`, true);
  }
  for (const record of index.records) {
    if (!record || typeof record.id !== "string" || record.id.indexOf("/") < 0) continue;
    const url = recordUrl(record.id);
    addPage(url, `${record.title || record.id} · Project book`,
      renderRecord(index, relFor(url), record, review), `type:${record.type}`);
  }
  for (const actor of index.byType.get("actor") || []) {
    const url = lensUrl(actor.id);
    addPage(url, `${actor.title} · Lens · Project book`,
      renderLens(index, relFor(url), actor), actor.id);
  }

  try {
    for (const page of pages) {
      const rel = relFor(page.url);
      const nav = renderNav(index, review, page.active, rel);
      const html = shell({ rel, title: page.title, nav, main: page.main, wide: page.wide, bodyClass: page.bodyClass });
      const file = join(outDir, page.url);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html + "\n", "utf8");
    }
    await mkdir(join(outDir, "assets"), { recursive: true });
    await copyFile(join(HERE, "assets", "book.css"), join(outDir, "assets", "book.css"));
    await copyFile(join(HERE, "assets", "book.js"), join(outDir, "assets", "book.js"));
    await writeFile(join(outDir, "search.json"), JSON.stringify(searchEntries, null, 2) + "\n", "utf8");
  } catch (error) {
    process.stderr.write(`Cannot write to '${outDir}': ${error.message}\n`);
    return 1;
  }

  process.stdout.write(`${outDir}: ${pages.length} pages, ${index.records.length} records.\n`);
  return 0;
}

process.exit(await main());
