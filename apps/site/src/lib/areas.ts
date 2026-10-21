// The areas of docs/ as the site presents them: order, label, icon and one-line
// note. The docs sidebar groups them into sections; the release home lists them.
import type { IconName } from "./icons";

export interface Area {
  /** The first folder under docs/, such as backend. */
  key: string;
  label: string;
  icon: IconName;
  note: string;
}

export const areas: Area[] = [
  { key: "learn", label: "Start", icon: "start", note: "What LiteSpec is, why it exists, and how its parts fit. Start here if you are new." },
  { key: "core", label: "Core", icon: "core", note: "Every project applies these: the system, scope, stacks, the project model, and agent and authoring rules." },
  { key: "workspace", label: "Workspace", icon: "folder", note: "Every project applies these: structure, naming, dependencies, and configuration." },
  { key: "backend", label: "Backend", icon: "server", note: "Backend principles for every backend, and the stacks that realize them." },
  { key: "frontend", label: "Frontend", icon: "monitor", note: "Frontend principles for every frontend, the stacks that realize them, and the UI patterns." },
  { key: "quality", label: "Quality", icon: "shield", note: "Every project applies these: security, operations, and continuous integration." },
  { key: "ext", label: "Extensions", icon: "plug", note: "Capabilities outside the baseline that a project selects explicitly." },
  { key: "tutorial", label: "Tutorials", icon: "book", note: "Take you through a first working result, one step at a time." },
  { key: "guide", label: "Guides", icon: "book", note: "Solve one stated problem each." },
  { key: "tools", label: "CLI", icon: "terminal", note: "One page per litespec command: options, exit codes, and what it runs." },
  { key: "reference", label: "Reference", icon: "book", note: "Lookup pages: the glossary, the provision index, and decision records." },
];

export function areaOf(key: string): Area {
  return areas.find((area) => area.key === key) ?? { key, label: key.charAt(0).toUpperCase() + key.slice(1), icon: "file", note: "" };
}

/** The docs sidebar sections, in order. Start is the learn area, opened by its overview;
 *  Guides joins the tutorials and how-to guides after the standard itself. */
const section = (key: string) => {
  const area = areaOf(key);
  return { key: area.key, label: area.label, icon: area.icon, areas: [area.key] };
};
export const sidebarSections: { key: string; label: string; icon: IconName; areas: string[] }[] = [
  { key: "start", label: "Start", icon: "start", areas: ["learn"] },
  ...["core", "workspace", "backend", "frontend", "quality", "ext"].map(section),
  { key: "guides", label: "Guides", icon: "book", areas: ["tutorial", "guide"] },
  ...["tools", "reference"].map(section),
];
