// Renders a `trail` fence: a slice of the specification tree, written in the Markdown
// as a plain outline so agents and raw readers get the same facts.
//
//   product      Claimwick: submit, approve, reimburse
//     goal       Decided in days
//   --- Review line: records above, code below
//   code         Aggregate, command, endpoint, test
//   facet  Where it lives  spending module > expense aggregate
//
// A node line is a record type, two or more spaces, and its text; indentation nests
// it. A `---` line is the review line, and a `facet` line is a label and a path. The
// site draws the outline as a tree.

export interface TrailNode {
  type: string;
  text: string;
  children: TrailItem[];
}

export type TrailItem = { kind: "node"; node: TrailNode } | { kind: "divider"; label: string };

export interface Trail {
  items: TrailItem[];
  facets: { label: string; path: string[] }[];
}

/** Parses the outline of a trail fence. Lines it cannot read are reported, never dropped silently. */
export function parseTrail(text: string): { trail: Trail; errors: string[] } {
  const trail: Trail = { items: [], facets: [] };
  const errors: string[] = [];
  // The open lists by indentation: the list a node at that indentation joins.
  const stack: { indent: number; items: TrailItem[] }[] = [{ indent: -1, items: trail.items }];
  let pendingDivider: string | null = null;

  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    if (raw.trim() === "") continue;

    const divider = /^\s*---\s*(.*)$/.exec(raw);
    if (divider) {
      pendingDivider = divider[1].trim() || "Review line";
      continue;
    }

    const facet = /^facet\s+(.+?)\s{2,}(.+)$/.exec(raw);
    if (facet) {
      trail.facets.push({ label: facet[1].trim(), path: facet[2].split(">").map((part) => part.trim()).filter(Boolean) });
      continue;
    }

    const node = /^(\s*)([a-z][a-z-]*)\s{2,}(.+)$/.exec(raw);
    if (!node) {
      errors.push(`line ${index + 1}: expected "<type>  <text>", "--- <label>" or "facet <label>  <path>": ${raw.trim()}`);
      continue;
    }

    const indent = node[1].length;
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1];

    // A review line lands where the next node does, so it divides siblings.
    if (pendingDivider !== null) {
      parent.items.push({ kind: "divider", label: pendingDivider });
      pendingDivider = null;
    }

    const entry: TrailNode = { type: node[2], text: node[3].trim(), children: [] };
    parent.items.push({ kind: "node", node: entry });
    stack.push({ indent, items: entry.children });
  }

  if (pendingDivider !== null) trail.items.push({ kind: "divider", label: pendingDivider });
  return { trail, errors };
}

// Record types grouped by what they answer, which picks the chip color.
const GROUPS: Record<string, string> = {
  product: "intent", goal: "intent", problem: "intent", feature: "intent", research: "intent",
  decision: "intent", constraint: "intent", requirement: "intent", journey: "intent",
  module: "behavior", aggregate: "behavior", rule: "behavior", event: "behavior", "use-case": "behavior",
  result: "outcome", scenario: "outcome",
};

function typeLabel(type: string): string {
  const words = type.split("-").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderItems(items: TrailItem[]): string {
  return `<ul class="trail-list">${items.map(renderItem).join("")}</ul>`;
}

function renderItem(item: TrailItem): string {
  if (item.kind === "divider") {
    const [title, ...rest] = item.label.split(":");
    const note = rest.join(":").trim();
    return (
      `<li class="trail-divider" role="separator" aria-label="${escape(item.label)}">` +
      `<span class="trail-divider-label">${escape(title.trim())}</span>` +
      (note ? `<span class="trail-divider-note">${escape(note)}</span>` : "") +
      `</li>`
    );
  }

  const { node } = item;
  const group = GROUPS[node.type] ?? "build";
  const children = node.children.length > 0 ? renderItems(node.children) : "";
  return (
    `<li class="trail-node trail-${group}">` +
    `<div class="trail-row"><span class="trail-type">${escape(typeLabel(node.type))}</span>` +
    `<span class="trail-text">${escape(node.text)}</span></div>${children}</li>`
  );
}

function renderFacets(facets: Trail["facets"]): string {
  if (facets.length === 0) return "";
  const cards = facets
    .map(
      (facet) =>
        `<div class="trail-facet"><dt>${escape(facet.label)}</dt><dd>` +
        `<ol class="trail-path">${facet.path.map((part) => `<li class="trail-crumb">${escape(part)}</li>`).join("")}</ol>` +
        `</dd></div>`,
    )
    .join("");
  return `<dl class="trail-facets">${cards}</dl>`;
}

/** Draws one trail: the record tree and the facet cards. */
export function renderTrail(trail: Trail): string {
  return `<figure class="trail"><div class="trail-tree">${renderItems(trail.items)}</div>${renderFacets(trail.facets)}</figure>`;
}
