// Shared plain-text builders for the agent-facing endpoints of the site.
//
// Every raw Markdown page, llms.txt index and layer bundle reads the release
// through lib/spec.ts and formats it here, so the plain-text URLs cannot
// disagree with each other. Endpoints stay thin: they pick a builder and set
// the content type.
import path from "node:path";
import {
  appliedPages,
  backendStacks,
  extensionStack,
  frontendStacks,
  layerUrl,
  layers,
  manifest,
  pageByFile,
  pages,
  rawUrl,
  selectionIndexUrl,
  selectionKey,
  selectionLayers,
  selections,
  version,
  type Layer,
  type Page,
  type Selection,
} from "./spec";

/** The public origin of the site, matching astro.config.mjs. */
export const SITE_ORIGIN = "https://litespec.dev";

/** Join the origin with a site path from the URL helpers in spec.ts. */
export function absoluteUrl(sitePath: string): string {
  return `${SITE_ORIGIN}${sitePath}`;
}

/** Collapse Markdown to one line for llms.txt descriptions. */
export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** The one-line description of a page: its intent, or a fixed fallback. */
export function describe(page: Page): string {
  const intent = oneLine(page.intent);
  if (intent) return intent;
  // Only the glossary reaches this fallback: it is the one page with no
  // Intent, Purpose or Name section. The wording follows the page-style
  // table in docs/core/authoring.md.
  if (page.style === "glossary") return "One heading per term, in alphabetical order.";
  return `The ${page.title} page of the LiteSpec ${version} release.`;
}

const EXTERNAL_TARGET = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/;

/** Resolve one Markdown link target to an absolute raw URL when it names a release page. */
function resolveTarget(target: string, page: Page, dir: string): string {
  if (target.startsWith("<") && target.endsWith(">")) {
    const inner = target.slice(1, -1);
    const resolved = resolveTarget(inner, page, dir);
    return resolved === inner ? target : `<${resolved}>`;
  }
  if (EXTERNAL_TARGET.test(target) || target.startsWith("/")) return target;
  const hashIndex = target.indexOf("#");
  const pathPart = hashIndex < 0 ? target : target.slice(0, hashIndex);
  const hash = hashIndex < 0 ? "" : target.slice(hashIndex);
  if (pathPart === "") return `${absoluteUrl(rawUrl(page))}${hash}`;
  if (!pathPart.endsWith(".md")) return target;
  const resolved = path.posix.normalize(path.posix.join(dir, pathPart));
  if (!resolved.startsWith("docs/")) return target;
  const found = pageByFile(resolved);
  if (!found) return target;
  return `${absoluteUrl(rawUrl(found))}${hash}`;
}

const INLINE_LINK = /(!?\[[^\]]*\]\(\s*)([^)\s]+)((?:\s+"[^"]*"\s*|\s+'[^']*'\s*)?\))/g;

/** Rewrite the relative page links of one line, leaving inline code untouched. */
function rewriteLine(line: string, page: Page, dir: string): string {
  return line
    .split("`")
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(
            INLINE_LINK,
            (match, open: string, target: string, close: string) =>
              `${open}${resolveTarget(target, page, dir)}${close}`,
          ),
    )
    .join("`");
}

/**
 * The file's Markdown exactly as it is in docs/, with relative links between
 * pages rewritten to absolute raw URLs. Fenced code blocks keep every byte.
 */
export function rawMarkdown(page: Page): string {
  const dir = path.posix.dirname(page.file);
  const lines = page.markdown.split("\n");
  let fenced = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      return rewriteLine(line, page, dir);
    })
    .join("\n");
}

/**
 * Concatenate pages in the given order. Every page opens with a comment that
 * names its raw source URL, and pages are separated by a line holding ---.
 */
export function concatenatedMarkdown(entries: Page[]): string {
  const body = entries
    .map((entry) => `<!-- ${absoluteUrl(rawUrl(entry))} -->\n${rawMarkdown(entry).replace(/\s+$/, "")}`)
    .join("\n---\n");
  return `${body.replace(/\s+$/, "")}\n`;
}

/** Every page of the release concatenated in index order, without the UI pattern pages. */
export function fullLlmsText(): string {
  return concatenatedMarkdown(pages.filter((page) => page.style !== "pattern"));
}

/** The concatenated Markdown of one layer, in the same format as llms-full.txt. */
export function layerText(layer: Layer): string {
  const entries = layer.files
    .map((file) => pageByFile(file))
    .filter((page): page is Page => page !== undefined);
  return concatenatedMarkdown(entries);
}

const AREA_ORDER = [
  "core",
  "workspace",
  "quality",
  "backend",
  "frontend",
  "ext",
  "reference",
  "tools",
  "tutorial",
  "guide",
];

const AREA_TITLES: Record<string, string> = {
  core: "Core",
  workspace: "Workspace",
  quality: "Quality",
  backend: "Backend",
  frontend: "Frontend",
  ext: "Extensions",
  reference: "Reference",
  tools: "Tools",
  tutorial: "Tutorial",
  guide: "Guide",
};

function finish(lines: string[]): string {
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

/** The /<version>/llms.txt index: every page grouped by area with its raw URL. */
export function versionLlmsText(): string {
  const lines = [`# LiteSpec ${version}`, ""];
  lines.push(
    `> LiteSpec ${version} is the contract for one bounded-context business application. Every page below links its raw Markdown, described in one line.`,
    "",
    "This index lists every page of the release in area order. Fetch a page's raw Markdown link to read it as plain text.",
    "",
    `To read the whole release as one file, fetch ${absoluteUrl(`/${version}/llms-full.txt`)}. It holds every page except the UI pattern pages. To read only what one project applies, start from the selection index in ${absoluteUrl("/llms.txt")} that matches the project's shape and stacks.`,
    "",
  );
  const rootIndex = pageByFile("docs/README.md");
  if (rootIndex) {
    lines.push(
      "## Start",
      "",
      `- [${rootIndex.title}](${absoluteUrl(rawUrl(rootIndex))}): ${describe(rootIndex)}`,
      "",
    );
  }
  for (const area of AREA_ORDER) {
    const group = pages.filter((page) => page.area === area);
    if (group.length === 0) continue;
    lines.push(`## ${AREA_TITLES[area]}`, "");
    for (const page of group) {
      lines.push(`- [${page.title}](${absoluteUrl(rawUrl(page))}): ${describe(page)}`);
    }
    lines.push("");
  }
  return finish(lines);
}

/** "Server with dotnet and react": the human title of a selection. */
export function selectionTitle(selection: Selection): string {
  const shape = selection.shape === "server" ? "Server" : "Client-only";
  return `${shape} with ${selection.stacks.join(" and ")}`;
}

function stackRole(id: string): string {
  if (backendStacks.includes(id)) return "backend";
  if (frontendStacks.includes(id)) return "frontend";
  return "stack";
}

/** "A server project using the dotnet backend stack and the react frontend stack." */
export function selectionLine(selection: Selection): string {
  const shape = selection.shape === "server" ? "A server project" : "A client-only project";
  const stacks = selection.stacks.map((id) => `the ${id} ${stackRole(id)} stack`);
  const list = stacks.length > 1 ? `${stacks.slice(0, -1).join(", ")} and ${stacks.at(-1)}` : stacks[0];
  return `${shape} using ${list}.`;
}

/** The /<version>/select/<key>/llms.txt index of one selection. */
export function selectionLlmsText(selection: Selection): string {
  const key = selectionKey(selection);
  const lines = [`# LiteSpec Selection: ${selectionTitle(selection)}`, ""];
  lines.push(
    `> ${selectionLine(selection)}`,
    "",
    `This index lists the pages the ${key} selection applies, grouped by layer. Each entry links the page's raw Markdown.`,
    "",
  );
  const applied = new Set(appliedPages(selection));
  for (const layerKey of selectionLayers(selection)) {
    const layer = layers().find((entry) => entry.key === layerKey);
    if (!layer) continue;
    const files = layer.files.filter((file) => applied.has(file));
    if (files.length === 0) continue;
    lines.push(`## [${layer.title}](${absoluteUrl(layerUrl(layer.key))})`, "");
    for (const file of files) {
      const page = pageByFile(file);
      if (!page) continue;
      lines.push(`- [${page.title}](${absoluteUrl(rawUrl(page))}): ${describe(page)}`);
    }
    lines.push("");
  }
  lines.push("## Extensions This Selection May Add", "");
  const addable = Object.entries(manifest.extensions).filter(([id]) => {
    const owner = extensionStack(id);
    return owner === null || selection.stacks.includes(owner);
  });
  for (const [id, extension] of addable) {
    const page = pageByFile(extension.path);
    lines.push(
      `- [${page?.title ?? id}](${absoluteUrl(layerUrl(`ext/${id}`))}): ${page ? describe(page) : `The ${id} extension.`}`,
    );
  }
  lines.push("");
  if (selection.stacks.some((stack) => frontendStacks.includes(stack))) {
    lines.push("## UI Pattern Groups", "");
    for (const layer of layers().filter((entry) => entry.key.startsWith("patterns/"))) {
      const page = pageByFile(layer.files[0]);
      lines.push(
        `- [${layer.title}](${absoluteUrl(layerUrl(layer.key))}): ${page ? describe(page) : layer.title}`,
      );
    }
    lines.push("");
  }
  lines.push(
    "## How to Read This",
    "",
    "Fetch the pages a task touches, not all of them. Start with the page that owns the decision, then follow its links. When a task spans a whole layer, each section heading links the layer bundle that carries the same text in fewer requests.",
    "",
  );
  return finish(lines);
}

/** The root /llms.txt index: what LiteSpec is, how to use it, and every selection and layer. */
export function rootLlmsText(agentProtocol: string): string {
  const lines = ["# LiteSpec", ""];
  lines.push(
    "> LiteSpec is the contract for one bounded-context business application. A project names one size, one shape, and its stacks, and the standard states every provision those choices apply.",
    "",
    "## How to Use This Site",
    "",
    "1. Pick the selection index below that matches the project's shape and stacks.",
    "2. Paste the AGENTS.md block under Agent protocol into the working context.",
    "3. Fetch only the pages a task touches, not the whole release. Every raw Markdown link below resolves without a browser.",
    "",
    "## Release",
    "",
    `- [LiteSpec ${version} index](${absoluteUrl(`/${version}/llms.txt`)}): every page of the current release with its raw Markdown URL.`,
    "",
    "## Selections",
    "",
  );
  for (const selection of selections()) {
    lines.push(
      `- [${selectionTitle(selection)}](${absoluteUrl(selectionIndexUrl(selection))}): ${selectionLine(selection)}`,
    );
  }
  lines.push("", "## Layer Bundles", "");
  for (const layer of layers()) {
    lines.push(
      `- [${layer.title}](${absoluteUrl(layerUrl(layer.key))}): ${layer.files.length} pages, concatenated in reading order.`,
    );
  }
  lines.push("", "## Agent Protocol", "", "Paste the block below into the working context. It is the repository AGENTS.md.", "", agentProtocol.trim(), "");
  return finish(lines);
}

