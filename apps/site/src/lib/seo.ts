// Search and sharing metadata: canonical URLs, meta descriptions, the social image,
// and the schema.org objects every page writes as JSON-LD.
import { execFileSync } from "node:child_process";
import { root, version } from "./spec";

export const siteUrl = "https://litespec.dev";
const github = "https://github.com/Litenova-Solutions/LiteSpec";

/** The absolute URL of a site path. */
export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteUrl).toString();
}

/**
 * A meta description of at most 160 characters: the text up to its last sentence end
 * that fits, otherwise up to the last whole word, with an ellipsis written as three dots.
 */
export function metaDescription(text: string, limit = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const sentence = cut.lastIndexOf(". ");
  if (sentence >= 80) return cut.slice(0, sentence + 1);
  const word = cut.slice(0, limit - 3).lastIndexOf(" ");
  return `${cut.slice(0, word > 0 ? word : limit - 3).replace(/[,;:]$/, "")}...`;
}

export const socialImage = {
  url: absoluteUrl("/og.png"),
  width: 1200,
  height: 630,
  alt: "LiteSpec: the specification standard for building business applications with AI agents",
};

export const organization = {
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Litenova Solutions",
  url: "https://litenova.solutions",
  sameAs: [github],
};

export const website = {
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "LiteSpec",
  url: `${siteUrl}/`,
  description:
    "The specification standard for building business applications with AI agents: versioned rules for architecture, code, records, and tests, with tools that verify a project against them.",
  inLanguage: "en",
  publisher: { "@id": `${siteUrl}/#organization` },
};

export const softwareSource = {
  "@type": "SoftwareSourceCode",
  "@id": `${siteUrl}/#source`,
  name: "LiteSpec",
  codeRepository: github,
  license: "https://opensource.org/licenses/MIT",
  version,
  programmingLanguage: ["C#", "TypeScript"],
  author: { "@id": `${siteUrl}/#organization` },
};

/** A breadcrumb trail, each item a name and a site path. */
export function breadcrumbs(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A docs page as a technical article in the LiteSpec website. */
export function techArticle(options: {
  title: string;
  description: string;
  path: string;
  modified?: string;
  section: string;
}): Record<string, unknown> {
  return {
    "@type": "TechArticle",
    "@id": `${absoluteUrl(options.path)}#article`,
    headline: options.title,
    description: metaDescription(options.description),
    url: absoluteUrl(options.path),
    inLanguage: "en",
    articleSection: options.section,
    version,
    ...(options.modified ? { dateModified: options.modified } : {}),
    image: socialImage.url,
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: { "@id": `${siteUrl}/#organization` },
    author: { "@id": `${siteUrl}/#organization` },
  };
}

const modifiedCache = new Map<string, string | undefined>();

/**
 * The date of the last commit that changed a repository file, as YYYY-MM-DD, or undefined
 * when git is unavailable or the file is not committed yet.
 */
export function lastModified(file: string): string | undefined {
  if (modifiedCache.has(file)) return modifiedCache.get(file);
  let date: string | undefined;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: root, encoding: "utf8" }).trim();
    date = /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    date = undefined;
  }
  modifiedCache.set(file, date);
  return date;
}
