// Renders one standard page from Markdown to the HTML the site serves.
//
// The pipeline is: createMarkdownProcessor from @astrojs/markdown-remark with
// no syntax highlighting and no smart quotes, then post-processing that keeps
// the site and the standard in agreement: heading ids come from the same slug
// the CLI uses, relative links between docs pages become site URLs, each
// wireframe block becomes a drawn option figure with its text kept for agents,
// and each provision heading gains its card, badges and ID.
import { createMarkdownProcessor, type MarkdownRenderer } from "@astrojs/markdown-remark";
import path from "node:path";
import { pageByFile, pageUrl, slug, type Page } from "./spec";
import { paths } from "./icons";
import { parseWireframe, renderWireframe } from "./wireframe/index.js";
import { decorateCodeBlocks } from "./code-blocks";

let processor: MarkdownRenderer | null = null;

async function renderer(): Promise<MarkdownRenderer> {
  if (!processor) {
    // Shiki highlights every fenced block except wireframes, which become drawings.
    // Both themes are emitted as CSS variables; code.css picks one per color scheme.
    processor = await createMarkdownProcessor({
      syntaxHighlight: { type: "shiki", excludeLangs: ["wireframe"] },
      shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, defaultColor: false, wrap: false },
      smartypants: false,
    });
  }
  return processor;
}

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface RenderedPage {
  html: string;
  toc: TocEntry[];
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function unescape(value: string): string {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// One inline line icon on the 24px grid, drawn like the Icon component draws it.
function iconSvg(body: string): string {
  return (
    `<svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

interface WireframeBlock {
  compact: boolean;
  text: string;
  /** The H4 option id above the block, when the block sits under an option. */
  option: string | null;
  /** The H4 option name after the id, such as "Title, state, breadcrumb". */
  optionName: string | null;
  /** The H3 group default above the block, when the page names one. */
  groupDefault: string | null;
}

// Collects the fenced wireframe blocks of the Markdown in order, each with the
// option id and group default that select it, so the rendered figure can mark
// the default option.
function collectWireframes(markdown: string): WireframeBlock[] {
  const blocks: WireframeBlock[] = [];
  const lines = markdown.split("\n");
  let inFence: string | null = null;
  let fenceText: string[] = [];
  let groupDefault: string | null = null;
  let option: string | null = null;
  let optionName: string | null = null;
  for (const line of lines) {
    const fence = /^(\s*```)(.*)$/.exec(line);
    if (fence) {
      if (inFence === null) {
        inFence = fence[2].trim();
        fenceText = [];
      } else {
        if (inFence === "wireframe" || inFence.startsWith("wireframe ")) {
          blocks.push({
            compact: inFence !== "wireframe",
            text: fenceText.join("\n").replace(/\n+$/, ""),
            option,
            optionName,
            groupDefault,
          });
        }
        inFence = null;
      }
      continue;
    }
    if (inFence !== null) {
      fenceText.push(line);
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3 && !line.startsWith("####")) {
      groupDefault = null;
      option = null;
      optionName = null;
      continue;
    }
    const h4 = /^####\s+`([^`]+)`\s*:?\s*(.*?)\s*$/.exec(line);
    if (h4) {
      option = h4[1];
      optionName = h4[2] === "" ? null : h4[2];
      continue;
    }
    const def = /^\*\*Default:\*\*\s+`([^`]+)`/.exec(line);
    if (def) groupDefault = def[1];
  }
  return blocks;
}

// Numbers the option cards of one page, so the tab and panel ids are unique.
let optionIndex = 0;

// One option card: a header with Preview and Wireframe tabs and an expand
// button, a Preview panel with the desktop and phone drawings, and a
// Wireframe panel with the text and its Copy button. The tabs and the expand
// button carry a hidden attribute the viewer script removes, and the
// Wireframe panel is visible until that script hides it, so the card reads
// fully without JavaScript.
function wireframeFigure(main: WireframeBlock, compact: WireframeBlock | null): string | null {
  let desktop: string;
  let phone: string;
  try {
    desktop = renderWireframe(parseWireframe(main.text).page, false);
    phone = renderWireframe(parseWireframe(compact ? compact.text : main.text).page, true);
  } catch {
    return null;
  }
  optionIndex += 1;
  const uid = `opt${optionIndex}`;
  const isDefault = main.option !== null && main.groupDefault !== null && main.option === main.groupDefault;
  const label = main.option ?? "option";
  const badge = isDefault ? `<span class="badge badge-rule">Default</span>` : "";
  const name = main.optionName ? `<span class="option-name">${escape(main.optionName)}</span>` : "";
  const compactText = compact ? `\n\nCompact layout:\n\n${compact.text}` : "";
  const copyText = main.text + compactText;
  return (
    `<section class="option" aria-label="Option ${escape(label)}" data-option-id="${escape(label)}" data-option-name="${escape(main.optionName ?? "")}">` +
    `<div class="option-head"><code>${escape(label)}</code>${name}${badge}` +
    `<div class="option-tabs" role="tablist" aria-label="Option views" hidden>` +
    `<button type="button" class="option-tab" role="tab" id="${uid}-preview-tab" aria-selected="true" aria-controls="${uid}-preview" data-tab="preview">${iconSvg(paths.eye)}Preview</button>` +
    `<button type="button" class="option-tab" role="tab" id="${uid}-wireframe-tab" aria-selected="false" aria-controls="${uid}-wireframe" data-tab="wireframe">${iconSvg(paths.code)}Wireframe</button>` +
    `</div>` +
    `<button type="button" class="btn btn-ghost btn-icon option-expand" data-expand hidden aria-label="Open ${escape(label)} full screen">${iconSvg(paths.expand)}</button></div>` +
    `<div class="option-panel" role="tabpanel" id="${uid}-preview" aria-labelledby="${uid}-preview-tab" data-panel="preview" tabindex="0">` +
    `<div class="option-drawings">` +
    `<figure class="option-frame" data-view="desktop"><span class="option-enlarge" aria-hidden="true" title="Click to enlarge">${iconSvg(paths.expand)}</span><div class="option-drawing" role="img" aria-label="Wireframe drawing of ${escape(label)}">${desktop}</div></figure>` +
    `<figure class="option-frame option-frame-phone" data-view="phone"><span class="option-enlarge" aria-hidden="true" title="Click to enlarge">${iconSvg(paths.expand)}</span><div class="option-drawing" role="img" aria-label="Phone wireframe drawing of ${escape(label)}">${phone}</div></figure>` +
    `</div></div>` +
    `<div class="option-panel" role="tabpanel" id="${uid}-wireframe" aria-labelledby="${uid}-wireframe-tab" data-panel="wireframe" tabindex="0">` +
    `<div class="option-code"><div class="option-code-head"><span>Wireframe text</span>` +
    `<button type="button" class="btn btn-outline btn-sm" data-copy="${escape(copyText)}">${iconSvg(paths.copy)}<span class="copy-label">Copy</span></button></div>` +
    `<pre><code>${escape(copyText)}\n</code></pre></div></div>` +
    `<!--litespec-annotations-->` +
    `</section>`
  );
}

// Replaces the rendered wireframe code blocks in order. A compact block never
// renders alone: it replaces the phone drawing of the option block above it.
function renderWireframes(html: string, blocks: WireframeBlock[]): string {
  const pattern = /<pre><code class="language-wireframe">[\s\S]*?<\/code><\/pre>/g;
  optionIndex = 0;
  let index = 0;
  return html.replace(pattern, (match) => {
    if (index >= blocks.length) return match;
    const block = blocks[index];
    index += 1;
    // A compact block without an option block above it keeps its code listing.
    if (block.compact) return match;
    let compact: WireframeBlock | null = null;
    if (index < blocks.length && blocks[index].compact) {
      compact = blocks[index];
      index += 1;
    }
    return wireframeFigure(block, compact) ?? match;
  });
}

// Moves the Rationale, Cost and Reference paragraphs that follow an option
// card into its body, so each option holds its drawings, its reasoning and
// its wireframe text together.
function mergeOptionAnnotations(html: string): string {
  const pattern =
    /<!--litespec-annotations-->((?:(?!<\/section>)[\s\S])*?)<\/section>((?:\s*<p><strong>(?:Rationale|Cost|Reference):<\/strong>[\s\S]*?<\/p>)+)/g;
  return html.replace(pattern, "<!--litespec-annotations-->$2$1</section>");
}

// Removes the H4 line that directly precedes an option card. The card keeps the
// H4 id so existing links to the option still resolve.
function hoistOptionIds(html: string): string {
  return html.replace(
    /<h4 id="([^"]+)">[\s\S]*?<\/h4>\s*(<section class="option")/g,
    (_match, id: string, sectionStart: string) => `<section id="${id}" ${sectionStart.slice("<section ".length)}`,
  );
}

// Gives rendered tables a scrolling wrapper, so wide tables scroll inside
// their own region on small screens. A table whose first column holds
// provision IDs gains a marker class for mono styling.
function styleTables(html: string): string {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (match, inner: string) => {
    const wrap = /<td[^>]*>\s*litespec\//.test(inner) ? "table-wrap table-provisions" : "table-wrap";
    return `<div class="${wrap}"><table>${inner}</table></div>`;
  });
}

function rewriteLinks(html: string, page: Page): string {
  return html.replace(/<a href="([^"]*)">/g, (match, raw: string) => {
    const href = unescape(raw);
    if (href.startsWith("#") || /^(https?:|mailto:)/.test(href) || href === "") return match;
    const hash = href.indexOf("#");
    const target = hash < 0 ? href : href.slice(0, hash);
    const anchor = hash < 0 ? "" : href.slice(hash);
    if (!target.endsWith(".md")) return match;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(page.file), target));
    const found = pageByFile(resolved);
    if (!found) return match;
    return `<a href="${escape(pageUrl(found) + anchor)}">`;
  });
}

// The labels a provision paragraph can open with. Requirement, Default,
// Question and Compact keep full text color; the rest read as secondary notes.
const labelPattern =
  /<p><strong>(Requirement|Default|Replacement|Rationale|Cost|Reference|Evidence|Question|Compact|Example):<\/strong>/g;

function styleLabels(body: string): string {
  return body.replace(labelPattern, (_match, label: string) =>
    label === "Requirement" || label === "Default" || label === "Question" || label === "Compact"
      ? `<p class="note"><span class="lbl" data-pagefind-ignore>${label}</span>`
      : `<p class="note note-muted"><span class="lbl" data-pagefind-ignore>${label}</span>`);
}

const mustPattern = /\b(MUST\s+NOT|SHOULD\s+NOT|SHALL\s+NOT|MUST|SHOULD|MAY|REQUIRED|SHALL)\b/g;

// Highlights modal words in provision bodies. Code listings keep their text,
// and markup keeps its attributes: only text outside tags is touched.
function highlightMust(body: string): string {
  return body
    .split(/(<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>)/g)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(/<[^>]*>|[^<>]+/g, (token) =>
            token.startsWith("<") ? token : token.replace(mustPattern, `<span class="must">$1</span>`)))
    .join("");
}

// Wraps each provision H3 with the elements it owns, up to the next H2 or H3,
// in its card: the heading with kind and verification badges, the body with
// labels and modal words styled, and the ID footer with its copy button.
function wrapProvisions(html: string, page: Page): string {
  const provisions = new Map(page.provisions.map((provision) => [provision.slug, provision]));
  const pattern = /<h([23]) id="([^"]+)">[\s\S]*?<\/h\1>/g;
  const heads: { level: string; id: string; html: string; start: number; end: number }[] = [];
  for (const match of html.matchAll(pattern)) {
    const start = match.index ?? 0;
    heads.push({ level: match[1], id: match[2], html: match[0], start, end: start + match[0].length });
  }
  if (heads.length === 0) return html;
  let out = html.slice(0, heads[0].start);
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const next = i + 1 < heads.length ? heads[i + 1].start : html.length;
    const body = html.slice(head.end, next);
    const provision = head.level === "3" ? provisions.get(head.id) : undefined;
    if (!provision) {
      out += head.html + body;
      continue;
    }
    const kindModifier =
      provision.kind === "rule" ? "provision-rule" : provision.kind === "convention" ? "provision-convention" : "provision-pattern";
    const badgeModifier =
      provision.kind === "rule" ? "badge-rule" : provision.kind === "convention" ? "badge-convention" : "badge-pattern";
    const markBadge =
      provision.mark === ""
        ? ""
        : provision.mark === "checkable"
          ? `<span class="badge">${iconSvg(paths.check)}checkable</span>`
          : `<span class="badge">${escape(provision.mark)}</span>`;
    out +=
      `<section class="provision ${kindModifier}">` +
      `<header class="provision-head">${head.html}<span class="provision-badges" data-pagefind-ignore><span class="badge ${badgeModifier}">${provision.kind}</span>${markBadge}</span></header>` +
      `<div class="provision-body">${highlightMust(styleLabels(body))}</div>` +
      `<footer class="provision-id" data-pagefind-ignore><code>${escape(provision.id)}</code>` +
      `<button type="button" class="btn btn-ghost btn-icon btn-copy" data-copy="${escape(provision.id)}" aria-label="Copy provision ID">${iconSvg(paths.copy)}</button></footer>` +
      `</section>`;
  }
  return out;
}

const headingPattern = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g;

export async function renderPage(page: Page): Promise<RenderedPage> {
  const { code } = await (await renderer()).render(page.markdown);
  const provisions = new Map(page.provisions.map((provision) => [provision.slug, provision]));
  const used = new Map<string, number>();
  const toc: TocEntry[] = [];

  const unique = (id: string): string => {
    const seen = used.get(id) ?? 0;
    used.set(id, seen + 1);
    return seen === 0 ? id : `${id}-${seen + 1}`;
  };

  let firstH1 = true;
  let html = code.replace(headingPattern, (match, depth: string, inner: string) => {
    const text = unescape(stripTags(inner)).replace(/\s+\{#[^}]+\}\s*$/, "").trim();
    const id = unique(slug(text));
    const level = Number(depth);
    // The page template shows the title itself, so the Markdown H1 is dropped.
    if (level === 1 && firstH1) {
      firstH1 = false;
      return "";
    }
    const display = text.replace(/`/g, "").replace(/\s+/g, " ");
    if (level === 2) toc.push({ depth: 2, text: display, id });
    if (level === 3 && provisions.has(id)) toc.push({ depth: 3, text: display, id });
    return `<h${level} id="${escape(id)}">${inner}<a class="anchor" href="#${escape(id)}" aria-label="Link to this section" data-pagefind-ignore>#</a></h${level}>`;
  });

  html = rewriteLinks(html, page);
  html = renderWireframes(html, collectWireframes(page.markdown));
  html = mergeOptionAnnotations(html);
  html = hoistOptionIds(html);
  html = styleTables(html);
  html = decorateCodeBlocks(html);
  html = wrapProvisions(html, page);
  return { html, toc };
}

// Renders a short Markdown fragment such as a page intent to inline HTML.
export async function renderFragment(page: Page, markdown: string): Promise<string> {
  if (markdown === "") return "";
  const { code } = await (await renderer()).render(markdown);
  const withoutParagraph = code.replace(/^\s*<p>([\s\S]*?)<\/p>\s*$/g, "$1").trim();
  return rewriteLinks(withoutParagraph, page);
}
