// The docs sections as the site presents them: order, label, icon and the areas of
// docs/ each one holds. The sidebar, the breadcrumb and the page metadata all take
// a section's label from here, and every page is named by its own title, so one
// page has one name everywhere.
import type { IconName } from "./icons";
import { pages, type Page } from "./spec";

export interface Section {
  key: string;
  label: string;
  icon: IconName;
  /** The first folders under docs/ this section holds, such as backend. */
  areas: string[];
}

export const sections: Section[] = [
  { key: "learn", label: "Learn", icon: "start", areas: ["learn"] },
  { key: "example", label: "Example", icon: "layout", areas: ["example"] },
  { key: "core", label: "Core", icon: "core", areas: ["core"] },
  { key: "workspace", label: "Workspace", icon: "folder", areas: ["workspace"] },
  { key: "backend", label: "Backend", icon: "server", areas: ["backend"] },
  { key: "frontend", label: "Frontend", icon: "monitor", areas: ["frontend"] },
  { key: "quality", label: "Quality", icon: "shield", areas: ["quality"] },
  { key: "ext", label: "Extensions", icon: "plug", areas: ["ext"] },
  { key: "guides", label: "Guides", icon: "book", areas: ["tutorial", "guide"] },
  { key: "tools", label: "CLI", icon: "terminal", areas: ["tools"] },
  { key: "analyzers", label: "Analyzers", icon: "code", areas: ["analyzers"] },
  { key: "reference", label: "Reference", icon: "book", areas: ["reference"] },
];

export function sectionOf(area: string): Section {
  return sections.find((section) => section.areas.includes(area)) ?? { key: area, label: area, icon: "file", areas: [area] };
}

const byFile = new Map(pages.map((page) => [page.file, page]));

/** Pages directly in a folder, in reading order. */
export const inDir = (dir: string): Page[] =>
  pages.filter((page) => page.file.startsWith(`${dir}/`) && !page.file.slice(dir.length + 1).includes("/"));

/** A folder's overview page: its stack page, its README, or the page beside the
 *  folder that carries its name, such as frontend/patterns.md for frontend/patterns/. */
export function folderOverview(dir: string): Page | undefined {
  return byFile.get(`${dir}/stack.md`) ?? byFile.get(`${dir}/README.md`) ?? byFile.get(`${dir}.md`);
}

/** A section's overview page: the README of the first of its areas that has one. */
export function sectionOverview(section: Section): Page | undefined {
  for (const area of section.areas) {
    const readme = byFile.get(`docs/${area}/README.md`);
    if (readme) return readme;
  }
  return undefined;
}

/** The label of a folder below a section: a stack folder takes its stack's name. */
export function folderLabel(dir: string): { label: string; stack: boolean } {
  const stack = byFile.get(`${dir}/stack.md`);
  if (stack) return { label: stack.title.replace(/ Stack$/, ""), stack: true };
  const name = dir.slice(dir.lastIndexOf("/") + 1);
  if (name === "ext") return { label: "Extensions", stack: false };
  return { label: name.charAt(0).toUpperCase() + name.slice(1), stack: false };
}

/** The page a section's breadcrumb links to: its overview, or the first page of its first area. */
export function sectionHome(section: Section): Page | undefined {
  return sectionOverview(section) ?? inDir(`docs/${section.areas[0]}`)[0];
}

/** A page's name where it appears without its section around it: in the browser
 *  tab, search results and Previous / Next cards. An overview page is titled
 *  Overview, so there it carries its section's or folder's name: Backend Overview. */
export function pageName(page: Page): string {
  if (page.style !== "index" || !page.file.endsWith("/README.md")) return page.title;
  const dir = page.file.slice(0, -"/README.md".length);
  const isArea = dir.split("/").length === 2;
  const label = isArea ? sectionOf(page.area).label : folderLabel(dir).label;
  return `${label} ${page.title}`;
}

/** The folders between a page's area and the page, such as docs/backend/dotnet. */
export function foldersOf(page: Page): string[] {
  const parts = page.file.split("/").slice(0, -1);
  const out: string[] = [];
  for (let i = 3; i <= parts.length; i++) out.push(parts.slice(0, i).join("/"));
  return out;
}
