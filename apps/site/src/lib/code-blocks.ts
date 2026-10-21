// Wraps Shiki-highlighted code blocks in a figure with a header strip that
// shows the language name and a copy button. Plain wireframe text blocks are
// plain pre elements without the astro-code class, so they pass through.
import { paths } from "./icons";

function languageLabel(id: string): string {
  switch (id.toLowerCase()) {
    case "csharp":
      return "C#";
    case "bash":
    case "sh":
    case "shell":
      return "Shell";
    case "powershell":
      return "PowerShell";
    case "json":
    case "jsonc":
      return "JSON";
    case "ts":
    case "typescript":
      return "TypeScript";
    case "tsx":
      return "TSX";
    case "js":
    case "javascript":
      return "JavaScript";
    case "jsx":
      return "JSX";
    case "svelte":
      return "Svelte";
    case "html":
      return "HTML";
    case "xml":
      return "XML";
    case "css":
      return "CSS";
    case "yaml":
    case "yml":
      return "YAML";
    case "markdown":
    case "md":
      return "Markdown";
    case "sql":
      return "SQL";
    case "gitignore":
      return ".gitignore";
    case "plaintext":
    case "text":
      return "Text";
    default:
      return id;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, digits: string) =>
      String.fromCodePoint(Number.parseInt(digits, 16)),
    )
    .replace(/&#([0-9]+);/g, (_match, digits: string) =>
      String.fromCodePoint(Number.parseInt(digits, 10)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value: string): string {
  return escapeAttr(value);
}

function copySvg(): string {
  return (
    `<svg class="icon icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.copy}</svg>`
  );
}

const prePattern = /(<pre\b[^>]*class="[^"]*astro-code[^"]*"[^>]*>)([\s\S]*?)(<\/pre>)/g;

export function decorateCodeBlocks(html: string): string {
  return html.replace(prePattern, (_match, open: string, inner: string, close: string) => {
    const langMatch = /data-language="([^"]*)"/.exec(open);
    const lang = langMatch ? langMatch[1] : "plaintext";
    const text = decodeEntities(inner.replace(/<[^>]*>/g, ""))
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n+$/, "");
    const label = escapeHtml(languageLabel(lang));
    const copy = escapeAttr(lang);
    const dataCopy = escapeAttr(text);
    return (
      `<figure class="code-block" data-language="${copy}">` +
      `<figcaption class="code-head" data-pagefind-ignore>` +
      `<span class="code-lang">${label}</span>` +
      `<button type="button" class="btn btn-ghost btn-sm code-copy" data-copy="${dataCopy}" aria-label="Copy code">` +
      `${copySvg()}<span class="copy-label">Copy</span></button></figcaption>` +
      `${open}${inner}${close}</figure>`
    );
  });
}
