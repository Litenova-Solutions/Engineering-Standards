// The wireframe module boundary: the parser and the SVG renderer meet here.
// Pattern pages import these names to draw each option at build time.
export { parseWireframe, WireframeNode } from "./parse.ts";
export { renderWireframe, DesktopWidth, PhoneWidth } from "./render.ts";
