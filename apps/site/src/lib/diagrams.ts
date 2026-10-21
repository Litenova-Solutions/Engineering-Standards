// Inlines the SVG diagrams under docs/assets/diagrams/ into the rendered page.
//
// A page links a diagram as an ordinary Markdown image, so the raw Markdown an agent
// reads and the GitHub view both show it. On the site the SVG is inlined instead of
// loaded with <img>, so its colors, written as the site's CSS custom properties with
// fallbacks, follow the light and dark theme.
import fs from "node:fs";
import path from "node:path";
import { root, type Page } from "./spec";

const imagePattern = /<p>\s*<img src="([^"]+\.svg)" alt="([^"]*)"\s*\/?>\s*<\/p>/g;
const diagramsFolder = "docs/assets/diagrams/";

/** The repository-relative path of an image a page links, or null outside the diagrams folder. */
export function diagramPath(page: Page, src: string): string | null {
  if (/^(https?:)?\/\//.test(src)) return null;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(page.file), decodeURI(src)));
  return resolved.startsWith(diagramsFolder) ? resolved : null;
}

export function inlineDiagrams(html: string, page: Page): string {
  return html.replace(imagePattern, (match, src: string, alt: string) => {
    const file = diagramPath(page, src);
    if (!file) return match;
    const full = path.join(root, file);
    if (!fs.existsSync(full)) throw new Error(`${page.file} links a missing diagram: ${file}`);
    const svg = fs
      .readFileSync(full, "utf8")
      .replace(/<\?xml[^>]*\?>\s*/, "")
      .replace(/<svg\b/, '<svg class="diagram-art"');
    return `<figure class="diagram">${svg}<figcaption>${alt}</figcaption></figure>`;
  });
}
