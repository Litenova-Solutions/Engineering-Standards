// Port of apps/cli/src/LiteSpec.Cli/Patterns/WireframeRenderer.cs: draws one
// wireframe as an SVG sketch at a desktop or phone width. The sketch shows
// structure and copy in one neutral style; tones are its only colors. Text
// width is estimated from the character count, so nothing needs a font.
// Names below match the C# originals in camelCase. This module uses no Node
// API so it runs at build time and in the browser.
import { WireframeNode, tones, fieldKinds, overlays } from "./parse.ts";

// The desktop sketch width in pixels.
export const DesktopWidth = 1200;

// The phone sketch width in pixels.
export const PhoneWidth = 390;

const Gap = 12;
const Body = 14;
const Ink = "#344054";
const Muted = "#667085";
const Faint = "#98a2b3";
const Line = "#d0d5dd";
const Hairline = "#eaecf0";
const Wash = "#f9fafb";
const Bar = "#e4e7ec";

const toneColours: Record<string, { fill: string; text: string }> = {
  neutral: { fill: "#f2f4f7", text: "#344054" },
  positive: { fill: "#dcfae6", text: "#067647" },
  caution: { fill: "#fef0c7", text: "#93370d" },
  critical: { fill: "#fee4e2", text: "#b42318" },
  info: { fill: "#d1e9ff", text: "#175cd3" },
};

// Rounds to one decimal and prints the result as .NET does: Math.Round(value, 1)
// multiplies by 10 in double precision, rounds ties to even on that exact value,
// and divides back; the shortest round-trip string then matches the invariant culture.
function n(value: number): string {
  const scaled = value * 10;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;
  const whole = diff > 0.5 ? floor + 1 : diff < 0.5 ? floor : floor % 2 === 0 ? floor : floor + 1;
  const result = whole / 10;
  return Object.is(result, -0) ? "0" : String(result);
}

// Matches System.Net.WebUtility.HtmlEncode: it encodes &, <, >, " and ' (as &#39;),
// writes U+00A0 to U+00FF and every surrogate pair as a numeric entity, and leaves
// every other character untouched.
function htmlEncode(value: string): string {
  let out = "";

  for (let index = 0; index < value.length; index++) {
    const unit = value[index];

    if (unit === "&") {
      out += "&amp;";
    } else if (unit === "<") {
      out += "&lt;";
    } else if (unit === ">") {
      out += "&gt;";
    } else if (unit === '"') {
      out += "&quot;";
    } else if (unit === "'") {
      out += "&#39;";
    } else if (unit >= " " && unit <= "ÿ") {
      out += `&#${unit.charCodeAt(0)};`;
    } else if (unit >= "�" && unit <= "�" && index + 1 < value.length) {
      out += `&#${value.codePointAt(index)};`;
      index++;
    } else {
      out += unit;
    }
  }

  return out;
}

// The estimated width of the text at the size, in pixels, from
// per-character advances. Iterates UTF-16 units like the C# original.
function textWidth(value: string, size: number, bold = false): number {
  let total = 0;

  for (let index = 0; index < value.length; index++) {
    total += advance(value[index], size, bold);
  }

  return total;
}

// Advances of a common sans-serif, as fractions of the font size.
function advance(character: string, size: number, bold: boolean): number {
  let em: number;

  if (
    character === " " || character === "i" || character === "l" || character === "j" ||
    character === "." || character === "," || character === ":" || character === ";" ||
    character === "'" || character === "|" || character === "!"
  ) {
    em = 0.27;
  } else if (
    character === "f" || character === "t" || character === "r" || character === "I" ||
    character === "(" || character === ")" || character === "/" || character === "-"
  ) {
    em = 0.36;
  } else if (character === "m" || character === "w" || character === "M" || character === "W") {
    em = 0.84;
  } else if (character >= "A" && character <= "Z") {
    em = 0.66;
  } else if (character >= "0" && character <= "9") {
    em = 0.56;
  } else {
    em = 0.53;
  }

  return size * em * (bold ? 1.06 : 1);
}

function wrap(value: string, width: number, size: number): string[] {
  let lines: string[] = [];
  let current = "";

  for (const word of value.split(" ").filter((entry) => entry.length > 0)) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;

    if (current.length > 0 && textWidth(candidate, size) > width) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  if (lines.length > 4) {
    lines = [...lines.slice(0, 3), lines.slice(3).join(" ")];
  }

  return lines;
}

function fit(value: string, width: number, size: number, bold: boolean): string {
  if (textWidth(value, size, bold) <= width) {
    return value;
  }

  const ellipsis = textWidth("…", size, bold);
  let used = 0;
  let length = 0;

  while (length < value.length && used + advance(value[length], size, bold) + ellipsis <= width) {
    used += advance(value[length], size, bold);
    length++;
  }

  return length === 0 ? "" : value.slice(0, length).trimEnd() + "…";
}

function isStickyFooter(node: WireframeNode): boolean {
  return node.part === "footer" && node.has("sticky");
}

function isControl(node: WireframeNode): boolean {
  return node.part === "action" || node.part === "menu";
}

function isInline(node: WireframeNode): boolean {
  return node.part === "heading" || node.part === "status" || node.part === "avatar" ||
    node.part === "icon" || node.part === "link" || node.part === "action" || node.part === "menu";
}

// The width a part asks for in a horizontal arrangement; flexible parts
// share the rest.
function natural(node: WireframeNode): number {
  switch (node.part) {
    case "action":
      if (node.has("quiet")) {
        return textWidth(node.text, Body) + 8;
      }

      return textWidth(node.text, Body, true) + 28;
    case "menu":
      return textWidth(node.text, Body, true) + 44;
    case "status":
      return textWidth(node.text, 12, true) + 18;
    case "avatar":
      return 32;
    case "icon":
      return 18;
    case "image":
      return 96;
    case "figure":
      return Math.max(...node.strings.map((entry) => textWidth(entry, 22, true))) + 32;
    case "heading":
      return textWidth(node.text, node.has("small") ? 16 : 22, true);
    case "text":
      return textWidth(node.text, Body);
    case "link":
      return textWidth(node.text, Body);
    case "breadcrumb":
      return textWidth(node.strings.join(" / "), 13);
    case "field":
      if (node.has("checkbox") || node.has("radio") || node.has("toggle")) {
        return textWidth(node.text, Body) + 40;
      }

      return 220;
    case "fact":
      return textWidth(node.strings[0], 13) + textWidth(node.strings.length > 1 ? node.strings[1] : "", Body) + 16;
    default:
      return 0;
  }
}

function flexible(node: WireframeNode): boolean {
  return node.part !== "action" && node.part !== "menu" && node.part !== "status" &&
    node.part !== "avatar" && node.part !== "icon" && node.part !== "image" && node.part !== "figure" &&
    !(node.part === "field" && (node.has("checkbox") || node.has("radio") || node.has("toggle")));
}

function tone(node: WireframeNode): string {
  return node.modifiers.find((name) => tones.includes(name)) ?? "neutral";
}

// Renders the page at the width; phone applies the compact reflow rules.
export function renderWireframe(page: WireframeNode, phone: boolean): string {
  const renderer = new WireframeRenderer(phone);
  return renderer.draw(page);
}

class WireframeRenderer {
  phone = false;
  svg = "";
  lastControl: { x: number; y: number; w: number; h: number } | null = null;
  faded = 1;

  constructor(phone: boolean) {
    this.phone = phone;
  }

  draw(page: WireframeNode): string {
    const width = this.phone ? PhoneWidth : DesktopWidth;
    const padding = this.phone ? 16 : 28;
    const content = page.children.filter((child) => !overlays.includes(child.part) && !isStickyFooter(child));
    const sticky = page.children.filter(isStickyFooter);
    const overlayNodes = page.children.filter((child) => overlays.includes(child.part));
    let height = this.stack(this.reflow(content), padding, padding, width - 2 * padding) + 2 * padding;

    if (sticky.length > 0) {
      height -= padding / 2;

      for (const footer of sticky) {
        height += this.stickyFooter(footer, width, height, padding);
      }
    }

    height = Math.max(height, overlayNodes.length > 0 ? (this.phone ? 640 : 560) : 0);

    for (const overlay of overlayNodes) {
      height = Math.max(height, this.overlay(overlay, width, height));
    }

    let output = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${n(height)}" viewBox="0 0 ${width} ${n(height)}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" role="img">`;
    output += `<rect x="0.5" y="0.5" width="${width - 1}" height="${n(height - 1)}" rx="10" fill="#ffffff" stroke="${Line}"/>`;
    output += this.svg;
    output += "</svg>";
    return output;
  }

  // A sticky footer is a bar across the bottom edge of the screen; on a
  // phone its actions share the width.
  stickyFooter(footer: WireframeNode, width: number, top: number, padding: number): number {
    const mark = this.svg.length;
    const inner = width - 2 * padding;
    let height: number;

    if (this.phone && footer.children.every(isControl)) {
      const count = footer.children.length;
      const each = (inner - Gap * (count - 1)) / count;

      for (let index = 0; index < count; index++) {
        this.button(footer.children[index], padding + index * (each + Gap), top + 12, each);
      }

      height = 34 + 24;
    } else {
      height = this.flow(footer.children, padding, top + 12, inner, footer.children.every(isControl)) + 24;
    }

    this.svg = `${this.svg.slice(0, mark)}<rect x="1" y="${n(top)}" width="${width - 2}" height="${n(height)}" fill="#ffffff"/><rect x="1" y="${n(top)}" width="${width - 2}" height="1" fill="${Line}"/>${this.svg.slice(mark)}`;
    return height;
  }

  // At the phone width an aside follows the main content wherever it was
  // written.
  reflow(children: WireframeNode[]): WireframeNode[] {
    if (!this.phone) {
      return children;
    }

    return [...children.filter((child) => child.part !== "aside"), ...children.filter((child) => child.part === "aside")];
  }

  stack(children: WireframeNode[], x: number, y: number, width: number, gap: number = Gap * 1.5): number {
    const top = y;

    for (let index = 0; index < children.length; index++) {
      if (index > 0) {
        y += gap;
      }

      y += this.block(children[index], x, y, width);
    }

    return y - top;
  }

  // Draws a part in a box of the width and returns the height it used.
  block(node: WireframeNode, x: number, y: number, width: number): number {
    if (node.inlineChildren && node.part !== "table" && node.part !== "menu") {
      return this.container(node, x, y, width, (cx, cy, cw) => this.flex(node.children, cx, cy, cw));
    }

    switch (node.part) {
      case "header":
        return this.header(node, x, y, width);
      case "footer":
        return this.flow(node.children, x, y, width, node.children.every(isControl));
      case "toolbar":
        return this.flow(node.children, x, y, width, false);
      case "region":
        return this.region(node, x, y, width);
      case "aside":
        return this.aside(node, x, y, width);
      case "card":
        return this.card(node, x, y, width);
      case "item":
        return this.stack(node.children, x, y, width, Gap / 2);
      case "row":
        return this.phone
          ? this.stack(node.children, x, y, width)
          : this.columns(node.children, node.children.map(() => 1), x, y, width);
      case "split":
        return this.phone
          ? this.stack(this.reflow(node.children), x, y, width)
          : this.columns(node.children, node.ratio ?? [], x, y, width);
      case "tabs":
        return this.tabs(node, x, y, width);
      case "nav":
        return this.nav(node, x, y, width);
      case "breadcrumb":
        return this.breadcrumb(node, x, y, width);
      case "heading":
        return this.heading(node, x, y, width);
      case "text":
        return this.paragraph(node.text, x, y, width, node.has("muted") ? Muted : Ink, Body);
      case "fact":
        return this.fact(node, x, y, width);
      case "figure":
        return this.figure(node, x, y, width);
      case "status":
        return this.pill(node, x, y);
      case "message":
        return this.message(node, x, y, width);
      case "avatar":
        return this.avatar(node, x, y);
      case "image":
        return this.image(node, x, y, width, Math.min(180, Math.max(64, width * 0.56)));
      case "icon":
        return this.icon(node, x, y);
      case "link":
        return this.link(node, x, y, width);
      case "divider":
        return this.divider(x, y, width);
      case "action":
        return this.button(node, x, y, Math.min(width, natural(node)));
      case "menu":
        return this.button(node, x, y, Math.min(width, natural(node)));
      case "field":
        return this.field(node, x, y, width);
      case "list":
        return this.list(node, x, y, width);
      case "table":
        return this.table(node, x, y, width);
      case "grid":
        return this.grid(node, x, y, width);
      case "timeline":
        return this.timeline(node, x, y, width);
      default:
        return 0;
    }
  }

  // Side by side on one line: fixed parts take their width, flexible parts
  // share what is left.
  flex(children: WireframeNode[], x: number, y: number, width: number): number {
    if (children.length === 0) {
      return 0;
    }

    if (this.phone && children.filter(flexible).length >= 3) {
      return this.grouped(children, x, y, width);
    }

    const gap = Gap;
    let fixedWidth = 0;

    for (const child of children) {
      if (!flexible(child)) {
        fixedWidth += natural(child);
      }
    }

    let flexCount = 0;

    for (const child of children) {
      if (flexible(child)) {
        flexCount++;
      }
    }

    const spare = width - fixedWidth - gap * (children.length - 1);
    const share = flexCount > 0 ? Math.max(48, spare / flexCount) : 0;

    // Flexible parts that need less than their share give it back to the
    // last one.
    const widths = children.map((child) => (flexible(child) ? share : natural(child)));

    if (flexCount > 1) {
      const flexIndexes: number[] = [];

      for (let index = 0; index < children.length; index++) {
        if (flexible(children[index])) {
          flexIndexes.push(index);
        }
      }

      let saved = 0;

      for (const index of flexIndexes.slice(0, flexIndexes.length - 1)) {
        const want = Math.max(48, natural(children[index]));

        if (
          (children[index].part === "text" || children[index].part === "link" ||
            children[index].part === "heading" || children[index].part === "fact") && want < share
        ) {
          saved += share - want;
          widths[index] = want;
        }
      }

      widths[flexIndexes[flexIndexes.length - 1]] += saved;
    }

    const heights = children.map((child, index) => this.measure(child, widths[index]));
    let lineHeight = heights[0];

    for (const entry of heights) {
      if (entry > lineHeight) {
        lineHeight = entry;
      }
    }

    let cursor = x;

    for (let index = 0; index < children.length; index++) {
      const offset = (lineHeight - heights[index]) / 2;
      this.block(children[index], cursor, y + offset, widths[index]);
      cursor += widths[index] + gap;
    }

    return lineHeight;
  }

  // On a phone a crowded line keeps its leading and trailing fixed parts
  // and stacks the rest between them.
  grouped(children: WireframeNode[], x: number, y: number, width: number): number {
    const lead: WireframeNode[] = [];
    let start = 0;

    while (start < children.length && !flexible(children[start])) {
      lead.push(children[start]);
      start++;
    }

    const rest = children.slice(lead.length);
    const trailReversed: WireframeNode[] = [];

    for (let index = rest.length - 1; index >= 0; index--) {
      if (!flexible(rest[index])) {
        trailReversed.push(rest[index]);
      } else {
        break;
      }
    }

    const trail = trailReversed.reverse();
    const middle = children.slice(lead.length, children.length - trail.length);
    const leadWidth = lead.reduce((sum, child) => sum + natural(child), 0) + Gap * lead.length;
    const trailWidth = trail.reduce((sum, child) => sum + natural(child), 0) + Gap * trail.length;
    let cursor = x;

    for (const child of lead) {
      this.block(child, cursor, y, natural(child));
      cursor += natural(child) + Gap;
    }

    const height = this.stack(middle, x + leadWidth, y, width - leadWidth - trailWidth, 2);
    cursor = x + width - trailWidth + Gap;

    for (const child of trail) {
      this.block(child, cursor, y, natural(child));
      cursor += natural(child) + Gap;
    }

    const fixed = children.filter((child) => !flexible(child));

    if (fixed.length === 0) {
      return height;
    }

    let tallest = this.measure(fixed[0], natural(fixed[0]));

    for (const child of fixed) {
      const entry = this.measure(child, natural(child));

      if (entry > tallest) {
        tallest = entry;
      }
    }

    return Math.max(height, tallest);
  }

  // Left to right at natural width, wrapping onto a new line when the width
  // runs out.
  flow(children: WireframeNode[], x: number, y: number, width: number, alignEnd: boolean): number {
    const lines: { node: WireframeNode; width: number }[][] = [[]];
    let used = 0;

    for (const child of children) {
      const wanted = Math.min(width, child.part === "field" && flexible(child) ? Math.min(260, width) : Math.max(natural(child), 24));

      if (lines[lines.length - 1].length > 0 && used + Gap + wanted > width) {
        lines.push([]);
        used = 0;
      }

      used += (lines[lines.length - 1].length > 0 ? Gap : 0) + wanted;
      lines[lines.length - 1].push({ node: child, width: wanted });
    }

    const top = y;

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      const heights = line.map((item) => this.measure(item.node, item.width));
      let lineHeight = heights[0];

      for (const entry of heights) {
        if (entry > lineHeight) {
          lineHeight = entry;
        }
      }

      let total = Gap * (line.length - 1);

      for (const item of line) {
        total += item.width;
      }

      let cursor = alignEnd ? x + width - total : x;

      for (let index = 0; index < line.length; index++) {
        this.block(line[index].node, cursor, y + lineHeight - heights[index], line[index].width);
        cursor += line[index].width + Gap;
      }

      y += lineHeight + Gap / 2;
    }

    return y - top - Gap / 2;
  }

  // The height a part would use, found by drawing it into a scratch buffer.
  measure(node: WireframeNode, width: number): number {
    const mark = this.svg.length;
    const control = this.lastControl;
    const height = this.block(node, 0, 0, width);
    this.svg = this.svg.slice(0, mark);
    this.lastControl = control;
    return height;
  }

  header(node: WireframeNode, x: number, y: number, width: number): number {
    const lead = node.children.filter((child) => !isControl(child));
    const controls = node.children.filter(isControl);

    if (this.phone || controls.length === 0) {
      const leadHeight = this.lead(lead, x, y, width);
      const actionsHeight = controls.length > 0
        ? this.flow(controls, x, y + leadHeight + (lead.length > 0 ? Gap : 0), width, false) + (lead.length > 0 ? Gap : 0)
        : 0;
      return leadHeight + actionsHeight;
    }

    const controlsWidth = Math.min(width * 0.5, controls.reduce((sum, child) => sum + natural(child), 0) + Gap * (controls.length - 1));
    const controlsHeight = this.flow(controls, x + width - controlsWidth, y, controlsWidth, true);
    const height = this.lead(lead, x, y, width - controlsWidth - Gap * 2);
    return Math.max(height, controlsHeight);
  }

  // Inline parts share a line; block parts each take a line of their own.
  lead(children: WireframeNode[], x: number, y: number, width: number): number {
    const top = y;
    let run: WireframeNode[] = [];

    const emit = (): void => {
      if (run.length === 0) {
        return;
      }

      y += this.flow(run, x, y, width, false) + Gap / 2;
      run = [];
    };

    for (const child of children) {
      if (isInline(child)) {
        run.push(child);
        continue;
      }

      emit();
      y += this.block(child, x, y, width) + Gap / 2;
    }

    emit();
    return Math.max(0, y - top - Gap / 2);
  }

  container(node: WireframeNode, x: number, y: number, width: number, body: (cx: number, cy: number, cw: number) => number): number {
    if (
      node.part === "card" || node.part === "item" || node.part === "row" || node.part === "region" ||
      node.part === "aside" || node.part === "header" || node.part === "footer" || node.part === "toolbar"
    ) {
      if (node.part === "card") {
        return this.boxed(x, y, width, 16, (cx, cy, cw) => body(cx, cy, cw));
      }

      return body(x, y, width);
    }

    return body(x, y, width);
  }

  region(node: WireframeNode, x: number, y: number, width: number): number {
    const top = y;

    if (node.text.length > 0) {
      y += this.text(node.text, x, y, width, Ink, 16, true) + Gap;
    }

    y += this.stack(node.children, x, y, width, Gap);
    return y - top;
  }

  aside(node: WireframeNode, x: number, y: number, width: number): number {
    const mark = this.svg.length;
    const top = y;
    const inner = width - 32;

    if (node.text.length > 0) {
      y += 16 + this.text(node.text, x + 16, y + 16, inner, Ink, 15, true) + Gap - 16;
    }

    const height = this.stack(node.children, x + 16, y + 16, inner, Gap) + 32 + (y - top);
    this.svg = `${this.svg.slice(0, mark)}<rect x="${n(x)}" y="${n(top)}" width="${n(width)}" height="${n(height)}" rx="8" fill="${Wash}" stroke="${Hairline}"/>${this.svg.slice(mark)}`;
    return height;
  }

  card(node: WireframeNode, x: number, y: number, width: number): number {
    return this.boxed(x, y, width, 16, (cx, cy, cw) => {
      const top = cy;

      if (node.text.length > 0) {
        cy += this.text(node.text, cx, cy, cw, Ink, 15, true) + Gap;
      }

      return cy - top + this.stack(node.children, cx, cy, cw, Gap);
    });
  }

  boxed(x: number, y: number, width: number, padding: number, body: (cx: number, cy: number, cw: number) => number, fill = "#ffffff", stroke: string = Line): number {
    const mark = this.svg.length;
    const height = body(x + padding, y + padding, width - 2 * padding) + 2 * padding;
    this.svg = `${this.svg.slice(0, mark)}<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(width - 1)}" height="${n(height - 1)}" rx="8" fill="${fill}" stroke="${stroke}"${this.opacity()}/>${this.svg.slice(mark)}`;
    return height;
  }

  columns(children: WireframeNode[], ratio: number[], x: number, y: number, width: number): number {
    const gap = Gap * 2;
    let total = 0;

    for (const entry of ratio) {
      total += entry;
    }

    const usable = width - gap * (children.length - 1);
    let cursor = x;
    let height = 0;

    for (let index = 0; index < children.length; index++) {
      const columnWidth = (usable * ratio[index]) / total;
      const child = children[index];
      height = Math.max(height, child.part === "item" || child.part === "header"
        ? this.block(child, cursor, y, columnWidth)
        : this.stack([child], cursor, y, columnWidth));
      cursor += columnWidth + gap;
    }

    return height;
  }

  tabs(node: WireframeNode, x: number, y: number, width: number): number {
    let cursor = x;
    const visible = this.phone ? 3 : node.strings.length;

    for (let index = 0; index < node.strings.length && index < visible; index++) {
      const label = node.strings[index];
      const labelWidth = textWidth(label, Body, index === 0);

      if (cursor + labelWidth > x + width) {
        break;
      }

      this.text(label, cursor, y + 4, labelWidth + 2, index === 0 ? Ink : Muted, Body, index === 0);

      if (index === 0) {
        this.svg += `<rect x="${n(cursor)}" y="${n(y + 28)}" width="${n(labelWidth)}" height="2" fill="${Ink}"${this.opacity()}/>`;
      }

      cursor += labelWidth + 24;
    }

    if (visible < node.strings.length) {
      this.text("More ▾", cursor, y + 4, 60, Muted, Body);
    }

    this.divider(x, y + 30, width, 0);
    const below = node.children.length > 0 ? Gap * 1.5 + this.stack(node.children, x, y + 31 + Gap * 1.5, width, Gap) : 0;
    return 31 + below;
  }

  nav(node: WireframeNode, x: number, y: number, width: number): number {
    if (node.has("side")) {
      const top = y;

      for (const link of node.children) {
        if (link.has("current")) {
          this.svg += `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="30" rx="6" fill="#f2f4f7"${this.opacity()}/>`;
        }

        this.text(link.text, x + 10, y + 7, width - 20, link.has("current") ? Ink : Muted, Body, link.has("current"));
        y += 32;
      }

      return y - top;
    }

    let cursor = x;

    for (const link of node.children) {
      const labelWidth = textWidth(link.text, Body, link.has("current"));

      if (cursor + labelWidth > x + width) {
        break;
      }

      this.text(link.text, cursor, y + 4, labelWidth + 2, link.has("current") ? Ink : Muted, Body, link.has("current"));

      if (link.has("current")) {
        this.svg += `<rect x="${n(cursor)}" y="${n(y + 24)}" width="${n(labelWidth)}" height="2" fill="${Ink}"${this.opacity()}/>`;
      }

      cursor += labelWidth + 20;
    }

    return 26;
  }

  breadcrumb(node: WireframeNode, x: number, y: number, width: number): number {
    let cursor = x;

    for (let index = 0; index < node.strings.length; index++) {
      const last = index === node.strings.length - 1;
      const label = node.strings[index];
      const labelWidth = Math.min(textWidth(label, 13, last), x + width - cursor);

      if (labelWidth <= 8) {
        break;
      }

      this.text(label, cursor, y, labelWidth + 1, last ? Ink : Muted, 13, last, !last);
      cursor += labelWidth;

      if (!last) {
        this.text("/", cursor + 8, y, 12, Faint, 13);
        cursor += 24;
      }
    }

    return 18;
  }

  heading(node: WireframeNode, x: number, y: number, width: number): number {
    const size = node.has("small") ? 16 : this.phone ? 20 : 22;
    return this.text(node.text, x, y, width, Ink, size, true);
  }

  fact(node: WireframeNode, x: number, y: number, width: number): number {
    const label = node.strings[0];
    const value = node.strings[1];

    if (width < 280) {
      const top = y;
      y += this.text(label, x, y, width, Muted, 12) + 3;
      y += this.paragraph(value, x, y, width, Ink, Body);
      return y - top;
    }

    const labelWidth = Math.min(width * 0.38, 180);
    this.text(label, x, y + 1, labelWidth - 8, Muted, 13);
    return Math.max(20, this.paragraph(value, x + labelWidth, y, width - labelWidth, Ink, Body));
  }

  figure(node: WireframeNode, x: number, y: number, width: number): number {
    return this.boxed(x, y, width, 14, (cx, cy, cw) => {
      const top = cy;

      // One string is the value alone; two are a label and its value.
      if (node.strings.length > 1) {
        cy += this.text(node.strings[0], cx, cy, cw, Muted, 12) + 6;
      }

      cy += this.text(node.strings[node.strings.length > 1 ? 1 : 0], cx, cy, cw, Ink, 22, true);

      if (node.strings.length > 2) {
        cy += 4 + this.text(node.strings[2], cx, cy + 4, cw, Muted, 12);
      }

      return cy - top;
    });
  }

  pill(node: WireframeNode, x: number, y: number): number {
    const colours = toneColours[tone(node)];
    const width = natural(node);
    this.svg += `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="22" rx="11" fill="${colours.fill}"${this.opacity()}/>`;
    this.text(node.text, x + 9, y + 4, width - 16, colours.text, 12, true);
    return 22;
  }

  message(node: WireframeNode, x: number, y: number, width: number): number {
    const colours = toneColours[tone(node)];
    const mark = this.svg.length;
    const height = this.paragraph(node.text, x + 34, y + 12, width - 48, colours.text, Body) + 24;
    this.svg = `${this.svg.slice(0, mark)}<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="8" fill="${colours.fill}"${this.opacity()}/><circle cx="${n(x + 18)}" cy="${n(y + 22)}" r="6" fill="none" stroke="${colours.text}" stroke-width="1.5"${this.opacity()}/>${this.svg.slice(mark)}`;
    return height;
  }

  avatar(node: WireframeNode, x: number, y: number): number {
    this.svg += `<circle cx="${n(x + 16)}" cy="${n(y + 16)}" r="16" fill="#e4e7ec"${this.opacity()}/>`;
    const initials = node.text.length > 2 ? node.text.slice(0, 2) : node.text;
    const initialsWidth = textWidth(initials, 12, true);
    this.text(initials, x + 16 - initialsWidth / 2, y + 9, initialsWidth + 2, Ink, 12, true);
    return 32;
  }

  image(node: WireframeNode, x: number, y: number, width: number, height: number): number {
    this.svg += `<g${this.opacity()}><rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(width - 1)}" height="${n(height - 1)}" rx="6" fill="${Wash}" stroke="${Line}"/>`;
    this.svg += `<path d="M${n(x)} ${n(y)}L${n(x + width)} ${n(y + height)}M${n(x + width)} ${n(y)}L${n(x)} ${n(y + height)}" stroke="${Hairline}"/></g>`;
    const label = Math.min(textWidth(node.text, 12), width - 12);
    this.svg += `<rect x="${n((x + width / 2 - label / 2 - 6))}" y="${n(y + height / 2 - 10)}" width="${n(label + 12)}" height="20" rx="4" fill="#ffffff"${this.opacity()}/>`;
    this.text(node.text, x + width / 2 - label / 2, y + height / 2 - 7, label + 1, Muted, 12);
    return height;
  }

  icon(node: WireframeNode, x: number, y: number): number {
    this.svg += `<rect x="${n(x + 1)}" y="${n(y + 1)}" width="16" height="16" rx="4" fill="none" stroke="${Muted}" stroke-width="1.5"${this.opacity()}><title>${htmlEncode(node.text)}</title></rect>`;
    return 18;
  }

  link(node: WireframeNode, x: number, y: number, width: number): number {
    return this.text(node.text, x, y, width, "#175cd3", Body, node.has("current"), true);
  }

  divider(x: number, y: number, width: number, margin = 4): number {
    this.svg += `<rect x="${n(x)}" y="${n(y + margin)}" width="${n(width)}" height="1" fill="${Hairline}"${this.opacity()}/>`;
    return 1 + 2 * margin;
  }

  button(node: WireframeNode, x: number, y: number, width: number): number {
    this.lastControl = { x, y, w: width, h: 34 };
    const label = node.part === "menu" ? `${node.text}  ▾` : node.text;

    if (node.has("quiet")) {
      this.text(node.text, x + 4, y + 9, width - 4, Ink, Body, false, true);
      return 34;
    }

    if (node.has("disabled")) {
      this.svg += `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(width - 1)}" height="33" rx="7" fill="#f2f4f7" stroke="${Hairline}" stroke-dasharray="4 3"${this.opacity()}/>`;
      this.text(label, x + 14, y + 9, width - 20, Faint, Body, true);
      return 34;
    }

    const primary = node.has("primary");
    const destructive = node.has("destructive");
    const critical = toneColours["critical"].text;
    const fill = primary ? (destructive ? critical : Ink) : "#ffffff";
    const stroke = primary ? fill : destructive ? critical : Line;
    const ink = primary ? "#ffffff" : destructive ? critical : Ink;
    this.svg += `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(width - 1)}" height="33" rx="7" fill="${fill}" stroke="${stroke}"${this.opacity()}/>`;
    this.text(label, x + 14, y + 9, width - 20, ink, Body, true);
    return 34;
  }

  field(node: WireframeNode, x: number, y: number, width: number): number {
    this.lastControl = { x, y, w: width, h: 34 };
    const kind = node.modifiers.find((name) => fieldKinds.includes(name)) ?? "text";

    if (kind === "checkbox" || kind === "radio" || kind === "toggle") {
      const on = node.value === "on" || node.value === "true" || node.value === "yes" || node.value === "checked";

      if (kind === "radio") {
        this.svg += `<circle cx="${n(x + 9)}" cy="${n(y + 11)}" r="8" fill="#ffffff" stroke="${on ? Ink : Line}"${this.opacity()}/>${on ? `<circle cx="${n(x + 9)}" cy="${n(y + 11)}" r="4" fill="${Ink}"${this.opacity()}/>` : ""}`;
      } else if (kind === "checkbox") {
        this.svg += `<rect x="${n(x + 0.5)}" y="${n(y + 2.5)}" width="17" height="17" rx="4" fill="${on ? Ink : "#ffffff"}" stroke="${on ? Ink : Line}"${this.opacity()}/>`;
      } else {
        this.svg += `<rect x="${n(x + 0.5)}" y="${n(y + 2.5)}" width="31" height="17" rx="8.5" fill="${on ? Ink : Bar}"${this.opacity()}/><circle cx="${n(x + (on ? 23 : 9))}" cy="${n(y + 11)}" r="6" fill="#ffffff"${this.opacity()}/>`;
      }

      this.text(node.text, x + (kind === "toggle" ? 40 : 26), y + 3, width - 40, Ink, Body);
      return 22;
    }

    const top = y;
    let boxHeight: number;

    if (kind === "textarea") {
      boxHeight = 84;
    } else if (kind === "file") {
      boxHeight = 72;
    } else {
      boxHeight = 36;
    }

    if (kind !== "search" && kind !== "file") {
      y += this.text(node.text, x, y, width, Ink, 13, true) + 6;
    }

    const dash = kind === "file" ? ' stroke-dasharray="5 4"' : "";
    this.svg += `<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(width - 1)}" height="${n(boxHeight - 1)}" rx="7" fill="${kind === "file" ? Wash : "#ffffff"}" stroke="${Line}"${dash}${this.opacity()}/>`;

    if (kind === "search") {
      this.svg += `<circle cx="${n(x + 17)}" cy="${n(y + 16)}" r="5" fill="none" stroke="${Faint}" stroke-width="1.5"${this.opacity()}/><path d="M${n(x + 21)} ${n(y + 20)}l4 4" stroke="${Faint}" stroke-width="1.5"${this.opacity()}/>`;
      this.text(node.value ?? node.text, x + 32, y + 10, width - 40, node.value === null ? Faint : Ink, Body);
    } else if (kind === "file") {
      const labelWidth = Math.min(textWidth(node.text, 13), width - 24);
      this.text(node.text, x + width / 2 - labelWidth / 2, y + boxHeight / 2 - 8, labelWidth + 2, Muted, 13);
    } else {
      if (node.value !== null) {
        if (kind === "textarea") {
          this.paragraph(node.value, x + 12, y + 10, width - 24, Ink, Body);
        } else {
          this.text(node.value, x + 12, y + 10, width - 36, Ink, Body);
        }
      }

      if (kind === "select" || kind === "date") {
        this.text(kind === "select" ? "▾" : "▦", x + width - 22, y + 9, 14, Faint, Body);
      }
    }

    return y - top + boxHeight;
  }

  list(node: WireframeNode, x: number, y: number, width: number): number {
    const template = node.children[0];
    const top = y;
    const count = node.count ?? 1;

    for (let index = 0; index < count; index++) {
      if (index > 0) {
        this.divider(x, y + Gap / 2 - 0.5, width, 0);
      }

      const height = this.fadedDraw(index, () => this.block(template, x, y + Gap, width));
      y += height + Gap * 2;
    }

    return y - top - Gap;
  }

  table(node: WireframeNode, x: number, y: number, width: number): number {
    let columns = node.strings.slice();
    let overflow = false;

    if (this.phone && columns.length > 2) {
      columns = columns.slice(0, 2);
      overflow = true;
    }

    const cells = node.children.length > 0 ? node.children[0].children : [];
    const reserve = overflow ? 28 : 0;
    const columnWidth = (width - 24 - reserve) / columns.length;
    const top = y;
    this.svg += `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="34" rx="6" fill="${Wash}"${this.opacity()}/>`;

    for (let index = 0; index < columns.length; index++) {
      this.text(columns[index], x + 12 + index * columnWidth, y + 10, columnWidth - 12, Muted, 12, true);
    }

    if (overflow) {
      this.text("…", x + width - 22, y + 9, 16, Muted, Body, true);
    }

    y += 34;
    const count = node.count ?? 1;

    for (let row = 0; row < count; row++) {
      let rowHeight = 40;

      if (row === 0 && cells.length > 0) {
        for (let index = 0; index < columns.length && index < cells.length; index++) {
          const cellWidth = columnWidth - 12;
          const cell = cells[index];
          const height = this.measure(cell, Math.min(cellWidth, flexible(cell) ? cellWidth : natural(cell)));
          rowHeight = Math.max(rowHeight, height + 18);
        }

        for (let index = 0; index < columns.length && index < cells.length; index++) {
          const cellWidth = columnWidth - 12;
          const cell = cells[index];
          const drawWidth = Math.min(cellWidth, flexible(cell) ? cellWidth : natural(cell));
          const height = this.measure(cell, drawWidth);
          this.block(cell, x + 12 + index * columnWidth, y + (rowHeight - height) / 2, drawWidth);
        }
      } else {
        for (let index = 0; index < columns.length; index++) {
          const barWidth = (columnWidth - 24) * (0.45 + (0.4 * ((row * 7 + index * 3) % 5)) / 4);
          this.svg += `<rect x="${n(x + 12 + index * columnWidth)}" y="${n(y + 16)}" width="${n(barWidth)}" height="8" rx="4" fill="${Bar}"/>`;
        }
      }

      this.divider(x, y + rowHeight - 1, width, 0);
      y += rowHeight;
    }

    return y - top;
  }

  grid(node: WireframeNode, x: number, y: number, width: number): number {
    const template = node.children[0];
    const count = node.count ?? 1;
    const columns = this.phone ? 1 : Math.max(1, Math.min(count, Math.trunc((width + Gap) / (220 + Gap))));
    const cellWidth = (width - Gap * (columns - 1)) / columns;
    const top = y;

    for (let start = 0; start < count; start += columns) {
      let rowHeight = 0;

      for (let column = 0; column < columns && start + column < count; column++) {
        const at = start + column;
        const height = this.fadedDraw(at, () => template.part === "card" || template.part === "figure" || template.part === "image"
          ? this.block(template, x + column * (cellWidth + Gap), y, cellWidth)
          : this.boxed(x + column * (cellWidth + Gap), y, cellWidth, 14, (cx, cy, cw) => this.block(template, cx, cy, cw)));
        rowHeight = Math.max(rowHeight, height);
      }

      y += rowHeight + Gap;
    }

    return y - top - Gap;
  }

  timeline(node: WireframeNode, x: number, y: number, width: number): number {
    const template = node.children[0];
    const count = node.count ?? 1;
    const top = y;
    const mark = this.svg.length;
    let lastDot = y;

    for (let index = 0; index < count; index++) {
      lastDot = y + 8;
      const height = this.fadedDraw(index, () => {
        this.svg += `<circle cx="${n(x + 7)}" cy="${n(y + 8)}" r="5" fill="#ffffff" stroke="${Ink}" stroke-width="1.5"${this.opacity()}/>`;
        return this.block(template, x + 26, y, width - 26);
      });
      y += Math.max(height, 20) + Gap * 1.5;
    }

    this.svg = `${this.svg.slice(0, mark)}<rect x="${n(x + 6.25)}" y="${n(top + 8)}" width="1.5" height="${n(lastDot - top - 8)}" fill="${Hairline}"/>${this.svg.slice(mark)}`;
    return y - top - Gap * 1.5;
  }

  // A repeated entry after the first is drawn lighter: the first shows the
  // template, the rest its count. Named fadedDraw because the faded field
  // already carries the C# Faded name in camelCase.
  fadedDraw(index: number, draw: () => number): number {
    const before = this.faded;
    this.faded = index === 0 ? before : Math.max(0.35, before * (index === 1 ? 0.6 : 0.45));
    const height = draw();
    this.faded = before;
    return height;
  }

  overlay(node: WireframeNode, width: number, pageHeight: number): number {
    if (node.part === "toast") {
      const colours = toneColours[tone(node)];
      const actionsWidth = node.children.reduce((sum, child) => sum + textWidth(child.text, Body, true) + 16, 0);
      const toastWidth = this.phone ? width - 32 : Math.min(520, textWidth(node.text, Body) + 64 + actionsWidth);
      const tx = this.phone ? 16 : width - toastWidth - 24;
      const ty = pageHeight - 24 - 48;
      this.svg += `<rect x="${n(tx)}" y="${n(ty)}" width="${n(toastWidth)}" height="48" rx="10" fill="#1d2939"/><circle cx="${n(tx + 20)}" cy="${n(ty + 24)}" r="5" fill="${colours.fill}" stroke="${colours.text}"/>`;
      this.text(node.text, tx + 36, ty + 15, toastWidth - 48 - actionsWidth, "#ffffff", Body);

      // A toast's actions read as light text links at its right end.
      let cursor = tx + toastWidth - 16;

      for (const action of node.children.slice().reverse()) {
        const labelWidth = textWidth(action.text, Body, true);
        cursor -= labelWidth;
        this.text(action.text, cursor, ty + 15, labelWidth + 2, "#ffffff", Body, true, true);
        cursor -= 16;
      }

      return pageHeight;
    }

    if (node.part === "popover") {
      const anchor = this.lastControl ?? { x: width - 220, y: 80, w: 120, h: 34 };
      const popoverWidth = Math.min(this.phone ? width - 32 : 300, width - 32);
      const px = Math.min(Math.max(anchor.x + anchor.w - popoverWidth, 16), width - popoverWidth - 16);
      const py = anchor.y + anchor.h + 8;
      const height = this.boxed(px, py, popoverWidth, 14, (cx, cy, cw) => this.overlayBody(node, cx, cy, cw), "#ffffff", Muted);
      return Math.max(pageHeight, py + height + 16);
    }

    this.svg += `<rect x="0" y="0" width="${width}" height="${n(pageHeight)}" rx="10" fill="#101828" fill-opacity="0.38"/>`;

    if (node.part === "drawer") {
      const side = this.phone ? "bottom" : node.modifiers[0] ?? "right";

      if (side === "bottom") {
        const mark = this.svg.length;
        const bodyHeight = this.overlayBody(node, 20, 0, width - 40);
        this.svg = this.svg.slice(0, mark);
        const panelTop = Math.max(48, pageHeight - bodyHeight - 48);
        this.svg += `<rect x="0" y="${n(panelTop)}" width="${width}" height="${n(pageHeight - panelTop)}" rx="14" fill="#ffffff"/>`;
        this.svg += `<rect x="${n(width / 2 - 20)}" y="${n(panelTop + 8)}" width="40" height="4" rx="2" fill="${Bar}"/>`;
        const used = this.overlayBody(node, 20, panelTop + 24, width - 40);
        return Math.max(pageHeight, panelTop + used + 48);
      }

      const panelWidth = Math.min(420, width * 0.4);
      const left = side === "left" ? 0 : width - panelWidth;
      this.svg += `<rect x="${n(left)}" y="0" width="${n(panelWidth)}" height="${n(pageHeight)}" fill="#ffffff"/>`;
      const drawn = this.overlayBody(node, left + 24, 24, panelWidth - 48);
      return Math.max(pageHeight, drawn + 48);
    }

    const dialogWidth = this.phone ? width - 32 : Math.min(520, width - 64);
    const gauge = this.svg.length;
    const dialogHeight = this.overlayBody(node, 0, 0, dialogWidth - 48) + 48;
    this.svg = this.svg.slice(0, gauge);
    const dx = (width - dialogWidth) / 2;
    const dy = Math.max(32, (pageHeight - dialogHeight) / 2.5);
    this.svg += `<rect x="${n(dx)}" y="${n(dy)}" width="${n(dialogWidth)}" height="${n(dialogHeight)}" rx="12" fill="#ffffff"/>`;
    this.overlayBody(node, dx + 24, dy + 24, dialogWidth - 48);
    return Math.max(pageHeight, dy + dialogHeight + 32);
  }

  overlayBody(node: WireframeNode, x: number, y: number, width: number): number {
    const top = y;

    if (node.text.length > 0) {
      y += this.text(node.text, x, y, width - 24, Ink, 17, true) + Gap;

      if (node.part === "dialog" || node.part === "drawer") {
        this.text("×", x + width - 12, y - Gap - 20, 14, Muted, 18);
      }
    }

    // Actions that close the overlay's content read as its button row, as a
    // footer would.
    let body = node.children.filter((child) => child.part !== "footer");
    const trailing: WireframeNode[] = [];

    for (let index = body.length - 1; index >= 0; index--) {
      if (isControl(body[index])) {
        trailing.unshift(body[index]);
      } else {
        break;
      }
    }

    body = body.slice(0, body.length - trailing.length);
    const footer = node.children.filter((child) => child.part === "footer");
    y += this.stack(body, x, y, width, Gap);

    if (trailing.length > 0) {
      y += (body.length > 0 ? Gap * 1.5 : 0) + this.flow(trailing, x, y + (body.length > 0 ? Gap * 1.5 : 0), width, true);
    }

    if (footer.length > 0) {
      y += Gap * 1.5;
      y += this.stack(footer, x, y, width, Gap);
    }

    return y - top;
  }

  // One line of text in the box, truncated with an ellipsis when it would
  // overflow.
  text(value: string, x: number, y: number, width: number, color: string, size: number, bold = false, underline = false): number {
    const shown = fit(value, width, size, bold);

    if (shown.length === 0) {
      return size * 1.4;
    }

    const weight = bold ? ' font-weight="600"' : "";
    const decoration = underline ? ' text-decoration="underline"' : "";
    this.svg += `<text x="${n(x)}" y="${n(y + size)}" font-size="${n(size)}" fill="${color}"${weight}${decoration}${this.opacity()}>${htmlEncode(shown)}</text>`;
    return size * 1.4;
  }

  // Word-wrapped text, at most four lines, the last truncated.
  paragraph(value: string, x: number, y: number, width: number, color: string, size: number): number {
    const lines = wrap(value, width, size);
    const lineHeight = size * 1.45;

    for (let index = 0; index < lines.length; index++) {
      this.text(lines[index], x, y + index * lineHeight, width, color, size);
    }

    return Math.max(1, lines.length) * lineHeight - (lineHeight - size * 1.4);
  }

  opacity(): string {
    return this.faded < 1 ? ` opacity="${n(this.faded)}"` : "";
  }
}
