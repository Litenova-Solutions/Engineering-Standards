// Port of apps/cli/src/LiteSpec.Cli/Patterns/Wireframe.cs: the wireframe
// language parser, part catalog and rules. The language is defined in
// docs/frontend/patterns.md. Names below match the C# originals in camelCase.
// This module uses no Node API so it runs at build time and in the browser.

// One part of a wireframe: its name, modifiers, visible copy and children.
export class WireframeNode {
  part: string;
  // The bare words after the part name, such as primary or positive.
  modifiers: string[] = [];
  // The quoted strings, in order: the visible copy.
  strings: string[] = [];
  // The value after =, for a field that shows one.
  value: string | null = null;
  // The bare integer, for a collection.
  count: number | null = null;
  // The width ratio, for a split.
  ratio: number[] | null = null;
  // The children, indented or inline.
  children: WireframeNode[] = [];
  // True when the children came inline after :, so they lay out side by side.
  inlineChildren = false;
  // The 1-based line inside the block.
  line: number;
  constructor(part: string, line: number) {
    this.part = part;
    this.line = line;
  }
  // The first quoted string, or empty.
  get text(): string {
    return this.strings.length > 0 ? this.strings[0] : "";
  }
  // Whether the part carries the modifier.
  has(modifier: string): boolean {
    return this.modifiers.includes(modifier);
  }
  // Every node below this one, depth first.
  *descendants(): Generator<WireframeNode> {
    for (const child of this.children) {
      yield child;
      yield* child.descendants();
    }
  }
}

// One problem in a wireframe block, at a 1-based line inside the block.
export interface WireframeError {
  line: number;
  message: string;
}

// What a part accepts: its modifiers, quoted strings, number and children.
interface PartSpec {
  // The bare words it accepts.
  modifiers: string[];
  // The fewest quoted strings.
  minStrings: number;
  // The most quoted strings.
  maxStrings: number;
  // "count" or "ratio" when the part requires one, otherwise null.
  number: string | null;
  // "none", "any", "one" or a comma-separated list of part names.
  children: string;
}

// The closed set of wireframe parts and what each one accepts.
export const tones = ["neutral", "positive", "caution", "critical", "info"];

export const fieldKinds = [
  "text",
  "number",
  "date",
  "select",
  "textarea",
  "checkbox",
  "radio",
  "toggle",
  "search",
  "file",
];

export const overlays = ["dialog", "drawer", "popover", "toast"];

const allParts: Record<string, PartSpec> = {
  page: { modifiers: [], minStrings: 0, maxStrings: 0, number: null, children: "any" },
  header: { modifiers: [], minStrings: 0, maxStrings: 0, number: null, children: "any" },
  footer: { modifiers: ["sticky"], minStrings: 0, maxStrings: 0, number: null, children: "any" },
  region: { modifiers: [], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  aside: { modifiers: ["sticky"], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  card: { modifiers: [], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  row: { modifiers: [], minStrings: 0, maxStrings: 0, number: null, children: "any" },
  split: { modifiers: [], minStrings: 0, maxStrings: 0, number: "ratio", children: "any" },
  tabs: { modifiers: [], minStrings: 1, maxStrings: 12, number: null, children: "any" },
  nav: { modifiers: ["side"], minStrings: 0, maxStrings: 0, number: null, children: "link" },
  breadcrumb: { modifiers: [], minStrings: 1, maxStrings: 8, number: null, children: "none" },
  toolbar: { modifiers: ["sticky"], minStrings: 0, maxStrings: 0, number: null, children: "action,field,menu,text,status" },
  heading: { modifiers: ["small"], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  text: { modifiers: ["muted"], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  fact: { modifiers: [], minStrings: 2, maxStrings: 2, number: null, children: "none" },
  figure: { modifiers: [], minStrings: 1, maxStrings: 3, number: null, children: "none" },
  status: { modifiers: tones, minStrings: 1, maxStrings: 1, number: null, children: "none" },
  message: { modifiers: tones, minStrings: 1, maxStrings: 1, number: null, children: "none" },
  avatar: { modifiers: [], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  image: { modifiers: [], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  icon: { modifiers: [], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  link: { modifiers: ["current"], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  divider: { modifiers: [], minStrings: 0, maxStrings: 0, number: null, children: "none" },
  action: { modifiers: ["primary", "secondary", "destructive", "quiet", "disabled"], minStrings: 1, maxStrings: 1, number: null, children: "none" },
  menu: { modifiers: [], minStrings: 1, maxStrings: 1, number: null, children: "action" },
  field: { modifiers: fieldKinds, minStrings: 1, maxStrings: 1, number: null, children: "none" },
  list: { modifiers: [], minStrings: 0, maxStrings: 0, number: "count", children: "one" },
  table: { modifiers: [], minStrings: 1, maxStrings: 12, number: "count", children: "item" },
  grid: { modifiers: [], minStrings: 0, maxStrings: 0, number: "count", children: "one" },
  timeline: { modifiers: [], minStrings: 0, maxStrings: 0, number: "count", children: "one" },
  item: { modifiers: [], minStrings: 0, maxStrings: 0, number: null, children: "any" },
  dialog: { modifiers: [], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  drawer: { modifiers: ["right", "left", "bottom"], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  popover: { modifiers: [], minStrings: 0, maxStrings: 1, number: null, children: "any" },
  toast: { modifiers: tones, minStrings: 1, maxStrings: 1, number: null, children: "action" },
};

// The parts whose single tone or kind modifier is exclusive.
function isExclusiveModifierPart(part: string): boolean {
  return part === "status" || part === "message" || part === "toast" || part === "field" || part === "drawer";
}

// Parses the text of one wireframe block and checks it against the rules.
export function parseWireframe(text: string): { page: WireframeNode | null; errors: WireframeError[] } {
  const errors: WireframeError[] = [];
  const roots: WireframeNode[] = [];
  const stack: { depth: number; node: WireframeNode }[] = [];
  const lines = text.split("\r\n").join("\n").split("\n");

  for (let index = 0; index < lines.length; index++) {
    const number = index + 1;
    const raw = lines[index].trimEnd();
    const content = raw.replace(/^ +/, "");

    if (content.length === 0 || content.startsWith("#")) {
      continue;
    }

    if (content.startsWith("\t") || raw.includes("\t")) {
      errors.push({ line: number, message: "indent with two spaces, not tabs" });
      continue;
    }

    const indent = raw.length - content.length;

    if (indent % 2 !== 0) {
      errors.push({ line: number, message: "indent by a multiple of two spaces" });
      continue;
    }

    const depth = indent / 2;
    const node = parseLine(content, number, errors);

    if (node === null) {
      continue;
    }

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      if (depth !== 0) {
        errors.push({ line: number, message: "the first part of a block starts at column one" });
      }

      roots.push(node);
    } else if (depth > stack[stack.length - 1].depth + 1) {
      errors.push({ line: number, message: "indent one level (two spaces) deeper than the parent" });
      continue;
    } else {
      if (stack[stack.length - 1].node.inlineChildren) {
        errors.push({ line: number, message: `'${stack[stack.length - 1].node.part}' already has inline children, so it takes no indented ones` });
      }

      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ depth, node });
  }

  if (roots.length !== 1 || roots[0].part !== "page") {
    errors.push({ line: roots.length > 1 ? roots[1].line : 1, message: "a wireframe has exactly one 'page' at the top" });
  }

  for (const root of roots) {
    check(root, null, errors);
  }

  if (roots.length === 1 && roots[0].part === "page") {
    checkPage(roots[0], errors);
  }

  errors.sort((left, right) => left.line - right.line);
  return { page: errors.length === 0 && roots.length === 1 ? roots[0] : null, errors };
}

function parseLine(content: string, number: number, errors: WireframeError[]): WireframeNode | null {
  const tokens = tokenize(content, number, errors);

  if (tokens === null) {
    return null;
  }

  const inlineAt = tokens.findIndex((token) => token.kind === "colon");
  const head = inlineAt < 0 ? tokens : tokens.slice(0, inlineAt);
  const node = build(head, number, errors);

  if (node === null || inlineAt < 0) {
    return node;
  }

  node.inlineChildren = true;
  const rest = tokens.slice(inlineAt + 1);
  let group: Token[] = [];
  const source: Token[] = [...rest, { kind: "separator", text: "" }];

  for (const token of source) {
    if (token.kind !== "separator") {
      group.push(token);
      continue;
    }

    if (group.length === 0) {
      errors.push({ line: number, message: "an inline list needs a part between each ' · '" });
      continue;
    }

    const child = build(group, number, errors);

    if (child !== null) {
      node.children.push(child);
    }

    group = [];
  }

  return node;
}

function build(tokens: Token[], number: number, errors: WireframeError[]): WireframeNode | null {
  if (tokens.length === 0 || tokens[0].kind !== "word") {
    errors.push({ line: number, message: "a line starts with a part name" });
    return null;
  }

  const part = tokens[0].text;

  if (!Object.hasOwn(allParts, part)) {
    errors.push({ line: number, message: `unknown part '${part}'` });
    return null;
  }

  const node = new WireframeNode(part, number);

  for (let index = 1; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.kind === "word") {
      node.modifiers.push(token.text);
    } else if (token.kind === "string") {
      node.strings.push(token.text);
    } else if (token.kind === "count") {
      node.count = parseInt(token.text, 10);
    } else if (token.kind === "ratio") {
      node.ratio = token.text.split(":").map((value) => parseInt(value, 10));
    } else if (token.kind === "equals") {
      if (index + 1 < tokens.length && tokens[index + 1].kind === "string") {
        index++;
        node.value = tokens[index].text;
      } else {
        errors.push({ line: number, message: "'=' is followed by a quoted value" });
      }
    } else {
      errors.push({ line: number, message: `unexpected '${token.text}'` });
    }
  }

  return node;
}

function check(node: WireframeNode, parent: WireframeNode | null, errors: WireframeError[]): void {
  const spec = allParts[node.part];

  for (const modifier of node.modifiers.filter((name) => !spec.modifiers.includes(name))) {
    errors.push({
      line: node.line,
      message: spec.modifiers.length === 0
        ? `'${node.part}' takes no modifier, so '${modifier}' is not allowed`
        : `'${node.part}' takes ${spec.modifiers.join(", ")}, not '${modifier}'`,
    });
  }

  if (isExclusiveModifierPart(node.part) && node.modifiers.length > 1) {
    errors.push({ line: node.line, message: `'${node.part}' takes one of ${spec.modifiers.join(", ")}` });
  }

  if (node.part === "action" && node.modifiers.filter((name) => name === "primary" || name === "secondary" || name === "quiet").length > 1) {
    errors.push({ line: node.line, message: "an action is one of primary, secondary or quiet" });
  }

  if (node.strings.length < spec.minStrings || node.strings.length > spec.maxStrings) {
    errors.push({
      line: node.line,
      message: spec.minStrings === spec.maxStrings
        ? `'${node.part}' takes ${quoted(spec.minStrings)}`
        : `'${node.part}' takes ${spec.minStrings} to ${spec.maxStrings} quoted strings`,
    });
  }

  if (node.value !== null && node.part !== "field") {
    errors.push({ line: node.line, message: "only a field takes a value after '='" });
  }

  if (spec.number === "count" && node.count === null) {
    errors.push({ line: node.line, message: `'${node.part}' needs a count, such as '${node.part} 3'` });
  }

  if (spec.number !== "count" && node.count !== null) {
    errors.push({ line: node.line, message: `'${node.part}' takes no count` });
  }

  if (spec.number === "ratio" && node.ratio === null) {
    errors.push({ line: node.line, message: "a split needs a ratio, such as 'split 2:1'" });
  }

  if (spec.number !== "ratio" && node.ratio !== null) {
    errors.push({ line: node.line, message: `'${node.part}' takes no ratio` });
  }

  if (node.count !== null && (node.count < 1 || node.count > 50)) {
    errors.push({ line: node.line, message: "a count is between 1 and 50" });
  }

  checkChildren(node, spec, errors);

  if (overlays.includes(node.part) && (parent === null || parent.part !== "page")) {
    errors.push({ line: node.line, message: `a ${node.part} is a child of 'page'` });
  }

  if (node.part === "page" && parent !== null) {
    errors.push({ line: node.line, message: "'page' is only the top part" });
  }

  if (node.part === "header" || node.part === "footer" || node.part === "toolbar" || overlays.includes(node.part)) {
    let primaries = 0;

    for (const child of node.descendants()) {
      if (child.part === "action" && child.has("primary")) {
        primaries++;
      }
    }

    if (primaries > 1) {
      errors.push({ line: node.line, message: `a ${node.part} holds at most one primary action, and this one holds ${primaries}` });
    }
  }

  for (const child of node.children) {
    check(child, node, errors);
  }
}

function checkChildren(node: WireframeNode, spec: PartSpec, errors: WireframeError[]): void {
  const count = node.children.length;

  if (spec.children === "any") {
    // Every child is welcome.
  } else if (spec.children === "none" && count > 0) {
    errors.push({ line: node.line, message: `'${node.part}' takes no children` });
  } else if (spec.children === "one" && count !== 1) {
    errors.push({ line: node.line, message: `'${node.part}' has exactly one child, the template for each entry` });
  } else if (spec.children !== "none" && spec.children !== "one") {
    const allowed = spec.children.split(",");

    for (const child of node.children.filter((entry) => !allowed.includes(entry.part))) {
      errors.push({ line: child.line, message: `'${node.part}' holds only ${allowed.join(", ")}, not '${child.part}'` });
    }

    if (node.part === "table" && count > 1) {
      errors.push({ line: node.line, message: "a table has at most one 'item', its first row" });
    }
  }

  if (node.part === "split" && node.ratio !== null && node.ratio.length !== count) {
    errors.push({ line: node.line, message: `split ${node.ratio.join(":")} has ${node.ratio.length} parts, so it holds ${node.ratio.length} children, not ${count}` });
  }

  if (node.part === "split" && node.ratio !== null && node.ratio.length < 2) {
    errors.push({ line: node.line, message: "a split ratio has at least two parts" });
  }

  if (node.part === "row" && count < 2) {
    errors.push({ line: node.line, message: "a row holds at least two children" });
  }
}

function checkPage(page: WireframeNode, errors: WireframeError[]): void {
  let seenOverlay = false;

  for (const child of page.children) {
    const overlay = overlays.includes(child.part);

    if (seenOverlay && !overlay) {
      errors.push({ line: child.line, message: "an overlay comes after the page content, so nothing follows it but another overlay" });
    }

    seenOverlay = seenOverlay || overlay;
  }
}

function quoted(count: number): string {
  if (count === 0) {
    return "no quoted string";
  }

  if (count === 1) {
    return "one quoted string";
  }

  return `${count} quoted strings`;
}

type TokenKind = "word" | "string" | "count" | "ratio" | "equals" | "colon" | "separator";

interface Token {
  kind: TokenKind;
  text: string;
}

const inlineSeparator = " · ";

function tokenize(content: string, number: number, errors: WireframeError[]): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < content.length) {
    const current = content[index];

    if (current === " ") {
      if (content.startsWith(inlineSeparator, index)) {
        tokens.push({ kind: "separator", text: "·" });
        index += inlineSeparator.length;
        continue;
      }

      index++;
      continue;
    }

    if (current === '"') {
      let text = "";
      index++;
      let closed = false;

      while (index < content.length) {
        if (content[index] === "\\" && index + 1 < content.length && (content[index + 1] === '"' || content[index + 1] === "\\")) {
          text += content[index + 1];
          index += 2;
          continue;
        }

        if (content[index] === '"') {
          closed = true;
          index++;
          break;
        }

        text += content[index];
        index++;
      }

      if (!closed) {
        errors.push({ line: number, message: "a quoted string is not closed" });
        return null;
      }

      tokens.push({ kind: "string", text });
      continue;
    }

    if (current === "=") {
      tokens.push({ kind: "equals", text: "=" });
      index++;
      continue;
    }

    const start = index;

    while (index < content.length && content[index] !== " " && content[index] !== '"' && content[index] !== "=") {
      index++;
    }

    const word = content.slice(start, index);

    if (word.endsWith(":")) {
      if (word.length > 1) {
        tokens.push(classify(word.slice(0, -1), number, errors));
      }

      tokens.push({ kind: "colon", text: ":" });
      continue;
    }

    tokens.push(classify(word, number, errors));
  }

  return tokens;
}

function classify(word: string, number: number, errors: WireframeError[]): Token {
  if (isAllAsciiDigits(word)) {
    return { kind: "count", text: word };
  }

  if (word.includes(":") && word.split(":").every((part) => part.length > 0 && isAllAsciiDigits(part))) {
    return { kind: "ratio", text: word };
  }

  if (!isAllLowerOrDash(word)) {
    errors.push({ line: number, message: `'${word}' is not a part, modifier, count or ratio; copy goes in double quotes` });
  }

  return { kind: "word", text: word };
}

function isAllAsciiDigits(word: string): boolean {
  if (word.length === 0) {
    return false;
  }

  for (let index = 0; index < word.length; index++) {
    const unit = word[index];

    if (unit < "0" || unit > "9") {
      return false;
    }
  }

  return true;
}

function isAllLowerOrDash(word: string): boolean {
  if (word.length === 0) {
    return false;
  }

  for (let index = 0; index < word.length; index++) {
    const unit = word[index];

    if (!((unit >= "a" && unit <= "z") || unit === "-")) {
      return false;
    }
  }

  return true;
}
