// The sitemap: every HTML page of the release, with its last change date from git.
// Raw Markdown, llms.txt indexes, layer bundles and schemas are for agents and stay out.
import type { APIRoute } from "astro";
import { htmlPath, pages, pageUrl, version } from "../lib/spec";
import { absoluteUrl, lastModified } from "../lib/seo";

export const GET: APIRoute = () => {
  const entries: { path: string; modified?: string }[] = [
    { path: "/", modified: lastModified("apps/site/src/pages/index.astro") },
    { path: `/${version}/select/`, modified: lastModified("apps/site/src/components/SelectForm.astro") },
    ...pages
      .filter((page) => htmlPath(page) !== "")
      .map((page) => ({ path: pageUrl(page), modified: lastModified(page.file) })),
  ];
  const urls = entries
    .map((entry) =>
      [
        "  <url>",
        `    <loc>${absoluteUrl(entry.path)}</loc>`,
        ...(entry.modified ? [`    <lastmod>${entry.modified}</lastmod>`] : []),
        "  </url>",
      ].join("\n"),
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
