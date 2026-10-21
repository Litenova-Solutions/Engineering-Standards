// Reads the LiteSpec standard from the repository root at build time: the manifest,
// every page under docs/, its provisions, and which pages a selection applies.
// Every page and endpoint of the site reads from here, so the site and the
// release it is built from cannot disagree.
import fs from "node:fs";
import path from "node:path";
// The repository root is the nearest folder above the working directory that holds
// litespec.manifest.json. A bundled build moves this file, so its own URL cannot be used.
function findRoot(): string {
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "litespec.manifest.json"))) return dir;
    if (path.dirname(dir) === dir) throw new Error(`No litespec.manifest.json above ${process.cwd()}`);
  }
}

/** The repository root that holds the standard. */
export const root = findRoot();

const slash = (value: string) => value.replace(/\\/g, "/");

export interface Manifest {
  version: string;
  stacks: Record<string, { folder: string; requires?: string[]; pairsWith?: string[] }>;
  shapes: Record<string, { backendStacks: number; backendPages?: string[] }>;
  extensions: Record<string, { path: string; activationScope?: string; replaces?: string[]; applicableKinds?: string[] }>;
}

export const manifest: Manifest = JSON.parse(fs.readFileSync(path.join(root, "litespec.manifest.json"), "utf8"));

/** The release this build publishes, such as 2.0.0. */
export const version = manifest.version;

/** The heading slug LiteSpec uses for provision IDs and anchors (Provisions.HeadingSlug in the CLI). */
export function slug(heading: string): string {
  return heading
    .replace(/\s+\{#[^}]+\}\s*$/, "")
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type ProvisionKind = "rule" | "convention" | "pattern";

export interface Provision {
  /** litespec/<page>#<slug> */
  id: string;
  slug: string;
  heading: string;
  kind: ProvisionKind;
  /** The Verification mark, or empty when the page has no row for it. */
  mark: string;
  evidence: string;
}

export type PageStyle = "topic" | "stack" | "extension" | "pattern" | "reference" | "command" | "how-to" | "tutorial" | "explanation" | "index" | "glossary";

export interface Page {
  /** Repository-relative file path, such as docs/backend/domain.md. */
  file: string;
  /** The path under docs/ without .md, such as backend/domain. The ID page segment and the URL path. */
  path: string;
  style: PageStyle;
  /** The area: learn, core, workspace, quality, backend, frontend, ext, reference, tools, tutorial or guide. */
  area: string;
  title: string;
  /** The first paragraph of the Intent or Purpose section, as Markdown. */
  intent: string;
  /** The H2 section names, in order. */
  sections: string[];
  provisions: Provision[];
  /** The raw Markdown file. */
  markdown: string;
}

function styleOf(rel: string): PageStyle {
  const segments = rel.split("/");
  if (rel.endsWith("/README.md")) return "index";
  if (rel === "docs/reference/glossary.md") return "glossary";
  if (rel.includes("/ext/")) return "extension";
  if (rel.startsWith("docs/frontend/patterns/")) return "pattern";
  if (segments[1] === "tools") return "command";
  if (segments[1] === "reference") return "reference";
  if (segments[1] === "tutorial") return "tutorial";
  if (segments[1] === "guide") return "how-to";
  if (segments[1] === "learn") return "explanation";
  if (segments.at(-1) === "stack.md") return "stack";
  return "topic";
}

function firstParagraph(lines: string[], section: string): string {
  const start = lines.findIndex((line) => line.replace(/\s+\{#[^}]+\}\s*$/, "").trim() === `## ${section}`);
  if (start < 0) return "";
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    if (line.trim() === "") {
      if (body.length > 0) break;
      continue;
    }
    body.push(line.trim());
  }
  return body.join(" ");
}

function parsePage(rel: string): Page {
  const markdown = fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
  const lines = markdown.split("\n");
  const pagePath = rel.slice("docs/".length, -".md".length);
  const style = styleOf(rel);
  const sections: string[] = [];
  const provisions: Provision[] = [];
  const marks = new Map<string, { mark: string; evidence: string }>();
  let section = "";
  let fenced = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const h2 = /^##\s+(.+?)\s*(?:\{#.*\})?\s*$/.exec(line);
    if (h2 && !line.startsWith("###")) {
      section = h2[1].trim();
      sections.push(section);
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3 && !line.startsWith("####")) {
      const kind: ProvisionKind | null = section === "Standards" ? "rule" : section === "Conventions" ? "convention" : section === "Patterns" && style === "pattern" ? "pattern" : null;
      if (kind && style !== "index" && !["reference", "command", "tutorial", "how-to"].includes(style)) {
        const s = slug(h3[1]);
        provisions.push({ id: `litespec/${pagePath}#${s}`, slug: s, heading: h3[1].trim(), kind, mark: "", evidence: "" });
      }
      continue;
    }
    if (section === "Verification") {
      const row = /^\|\s*(litespec\/[^|\s]+)\s*\|\s*([^|]*?)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
      if (row) marks.set(row[1], { mark: row[2], evidence: row[3] });
    }
  }

  for (const provision of provisions) {
    const found = marks.get(provision.id);
    if (found) Object.assign(provision, found);
  }

  const h1 = lines.find((line) => line.startsWith("# "));
  return {
    file: rel,
    path: pagePath,
    style,
    area: pagePath.split("/")[0],
    title: h1 ? h1.slice(2).trim() : pagePath,
    intent: firstParagraph(lines, "Intent") || firstParagraph(lines, "Purpose") || firstParagraph(lines, "Name"),
    sections,
    provisions,
    markdown,
  };
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".md")) out.push(slash(path.relative(root, full)));
  }
  return out;
}

// The learn/ pages read in the order their index lists them; every other page sorts by path.
function readingOrder(all: Page[]): Page[] {
  const index = all.find((page) => page.file === "docs/learn/README.md");
  if (!index) return all;
  const listed = [...index.markdown.matchAll(/\]\(([a-z0-9-]+)\.md\)/g)].map((match) => `docs/learn/${match[1]}.md`);
  const rank = (page: Page) => (page.file === index.file ? -1 : listed.indexOf(page.file) < 0 ? listed.length : listed.indexOf(page.file));
  const learn = all.filter((page) => page.area === "learn").sort((x, y) => rank(x) - rank(y));
  const first = all.findIndex((page) => page.area === "learn");
  const rest = all.filter((page) => page.area !== "learn");
  return [...rest.slice(0, first), ...learn, ...rest.slice(first)];
}

/** Every page under docs/: the learn/ pages in reading order, the rest in ordinal path order. */
export const pages: Page[] = readingOrder(walk(path.join(root, "docs")).map(parsePage));

const byFile = new Map(pages.map((page) => [page.file, page]));

/** The page for a repository-relative file path, such as docs/core/scope.md. */
export function pageByFile(file: string): Page | undefined {
  return byFile.get(file);
}

/** Every provision of the release, keyed by ID. */
export const provisions = new Map(pages.flatMap((page) => page.provisions.map((provision) => [provision.id, { provision, page }] as const)));

// ---- Selection: which pages a project applies (Layout.AppliedPages in the CLI) ----

export interface Selection {
  /** The project size. It decides record types, not pages, so selection URLs leave it out. */
  size?: "small" | "large";
  shape: string;
  stacks: string[];
  extensions: string[];
}

const kindOf = (folder: string) => (folder === "docs/backend" || folder.startsWith("docs/backend/") ? "backend" : folder === "docs/frontend" || folder.startsWith("docs/frontend/") ? "frontend" : "");

function holdsStack(dir: string): boolean {
  if (fs.existsSync(path.join(dir, "stack.md"))) return true;
  return fs.readdirSync(dir, { withFileTypes: true }).some((entry) => entry.isDirectory() && entry.name !== "ext" && holdsStack(path.join(dir, entry.name)));
}

/** Subfolders, at any depth, that apply with a folder: not ext/ and holding no stack. */
export function companionFolders(folder: string): string[] {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (entry.name === "ext" || holdsStack(path.join(dir, entry.name))) continue;
    const rel = `${folder}/${entry.name}`;
    out.push(rel, ...companionFolders(rel));
  }
  return out;
}

function chain(folder: string, area: string): string[] {
  const out: string[] = [];
  let current = folder.replace(/\/+$/, "");
  while (current === area || current.startsWith(area + "/")) {
    out.push(current);
    if (current === area) break;
    current = current.slice(0, current.lastIndexOf("/"));
  }
  return out;
}

const directPages = (folder: string) => pages.filter((page) => path.posix.dirname(page.file) === folder && page.style !== "index").map((page) => page.file);

/** The repository-relative pages a selection applies, in ordinal order. */
export function appliedPages(selection: Selection): string[] {
  const applied = new Set<string>();
  for (const area of ["docs/core", "docs/workspace", "docs/quality"]) directPages(area).forEach((file) => applied.add(file));
  for (const id of selection.stacks) {
    const stack = manifest.stacks[id];
    if (!stack) continue;
    const kind = kindOf(stack.folder);
    if (!kind) continue;
    for (const folder of chain(stack.folder, `docs/${kind}`)) {
      for (const f of [folder, ...companionFolders(folder)]) directPages(f).forEach((file) => applied.add(file));
    }
  }
  for (const file of manifest.shapes[selection.shape]?.backendPages ?? []) applied.add(file);
  for (const id of selection.extensions) {
    const extension = manifest.extensions[id];
    if (extension) applied.add(extension.path);
  }
  return [...applied].sort();
}

/** The backend and frontend stack ids the manifest ships. */
export const backendStacks = Object.keys(manifest.stacks).filter((id) => kindOf(manifest.stacks[id].folder) === "backend");
export const frontendStacks = Object.keys(manifest.stacks).filter((id) => kindOf(manifest.stacks[id].folder) === "frontend");

/** The stack folder an extension supports, or null when it supports every stack. */
export function extensionStack(id: string): string | null {
  const file = manifest.extensions[id]?.path ?? "";
  const owner = Object.entries(manifest.stacks).find(([, stack]) => file.startsWith(stack.folder + "/ext/"));
  return owner ? owner[0] : null;
}

/**
 * Every selection the site publishes an index for: each shape, one
 * backend stack for a server project or none for a client-only one, and zero or
 * one frontend stack. Extensions are separate lines in the AGENTS.md block, so
 * they do not multiply the selections.
 */
export function selections(): Selection[] {
  const out: Selection[] = [];
  {
    for (const [shape, def] of Object.entries(manifest.shapes)) {
      const backends = def.backendStacks > 0 ? backendStacks : [null];
      for (const backend of backends) {
        for (const frontend of [null, ...frontendStacks]) {
          const stacks = [backend, frontend].filter((s): s is string => s !== null);
          if (stacks.length === 0) continue;
          if (shape !== "server" && frontend === null) continue;
          const ok = stacks.every((id) => {
            const stack = manifest.stacks[id];
            return (stack.requires ?? []).every((r) => stacks.includes(r)) && (!backend || !stack.pairsWith || stack.pairsWith.includes(backend));
          });
          if (ok) out.push({ shape, stacks, extensions: [] });
        }
      }
    }
  }
  return out;
}

/** The URL key of a selection, such as server.dotnet.react. */
export const selectionKey = (selection: Selection) => [selection.shape, ...selection.stacks].join(".");

// ---- URLs ----

/** The HTML URL of a page: /2.0.0/backend/domain/ */
/** A page's path in HTML URLs: a folder index is served at its folder, so learn/README is learn. */
export const htmlPath = (page: Page | string) => (typeof page === "string" ? page : page.path).replace(/(^|\/)README$/, "");

export const pageUrl = (page: Page | string) => `/${version}/${htmlPath(page)}/`.replace(/\/\/$/, "/");

/** The raw Markdown URL of a page: /2.0.0/backend/domain.md */
export const rawUrl = (page: Page | string) => `/${version}/${typeof page === "string" ? page : page.path}.md`;

// ---- Layers: the bundles a selection is made of ----

export interface Layer {
  /** The URL key, such as core, backend/dotnet or ext/outbox. */
  key: string;
  title: string;
  /** Repository-relative pages in the layer, in ordinal order. */
  files: string[];
}

const stackLayerTitle = (id: string) => `${id[0].toUpperCase()}${id.slice(1)} stack`;

/**
 * Every layer the site publishes. A layer is one folder's pages: the always-applied
 * areas together, each principle folder, each stack folder, each extension and each
 * UI pattern group. Pattern groups are separate because they are large and only UI
 * work needs them.
 */
export function layers(): Layer[] {
  const out: Layer[] = [
    { key: "core", title: "Core, workspace and quality", files: ["docs/core", "docs/workspace", "docs/quality"].flatMap(directPages) },
    { key: "backend", title: "Backend principles", files: directPages("docs/backend") },
    { key: "frontend", title: "Frontend principles", files: directPages("docs/frontend") },
  ];
  const groups = new Set<string>();
  for (const [id, stack] of Object.entries(manifest.stacks)) {
    // The folders between the area root and the stack folder, such as docs/frontend/web.
    for (const folder of chain(stack.folder, `docs/${kindOf(stack.folder)}`).reverse().slice(1, -1)) {
      const key = folder.slice("docs/".length);
      if (key === "backend" || key === "frontend" || groups.has(key)) continue;
      groups.add(key);
      out.push({ key, title: `${key.split("/").at(-1)!.replace(/^./, (c) => c.toUpperCase())} shared pages`, files: directPages(folder) });
    }
    out.push({ key: stack.folder.slice("docs/".length), title: stackLayerTitle(id), files: [stack.folder, ...companionFolders(stack.folder)].flatMap(directPages) });
  }
  for (const page of pages.filter((p) => p.style === "pattern")) {
    out.push({ key: `patterns/${page.path.split("/").at(-1)}`, title: page.title, files: [page.file] });
  }
  for (const [id, extension] of Object.entries(manifest.extensions)) {
    out.push({ key: `ext/${id}`, title: pageByFile(extension.path)?.title ?? id, files: [extension.path] });
  }
  return out.filter((layer) => layer.files.length > 0);
}

/** The layer keys a selection applies, without extensions and pattern groups, in reading order. */
export function selectionLayers(selection: Selection): string[] {
  const applied = new Set(appliedPages(selection));
  return layers()
    .filter((layer) => !layer.key.startsWith("ext/") && !layer.key.startsWith("patterns/"))
    .filter((layer) => layer.files.some((file) => applied.has(file)))
    .map((layer) => layer.key);
}

/** The bundle URL of a layer: /2.0.0/layers/backend/dotnet.md */
export const layerUrl = (key: string) => `/${version}/layers/${key}.md`;

/** The index URL of a selection: /2.0.0/select/server.dotnet.react/llms.txt */
export const selectionIndexUrl = (selection: Selection | string) => `/${version}/select/${typeof selection === "string" ? selection : selectionKey(selection)}/llms.txt`;

/** The schema files the release ships, from schemas/. */
export const schemaFiles = fs.readdirSync(path.join(root, "schemas")).filter((file) => file.endsWith(".json")).sort();
