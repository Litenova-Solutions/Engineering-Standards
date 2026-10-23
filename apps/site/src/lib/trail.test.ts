// Tests for the trail fence: the outline parses into nested nodes, a review line and
// facets, an unreadable line is reported, and each node draws with its type.
import { describe, it } from "node:test";
import assert from "node:assert";
import { parseTrail, renderTrail } from "./trail.ts";

const outline = [
  "use-case       Submit expense (command)",
  "  result       Submitted, Receipt missing",
  "    scenario   Submitting with a receipt succeeds",
  "--- Review line: people review the records above, code proves the scenarios below",
  "code           Aggregate, command, endpoint, acceptance test",
  "facet Where it lives  spending module > expense aggregate",
].join("\n");

describe("trail", () => {
  it("nests nodes by indentation and places the review line before the next node", () => {
    const { trail, errors } = parseTrail(outline);
    assert.deepStrictEqual(errors, []);
    assert.strictEqual(trail.items.length, 3);
    const [useCase, divider, code] = trail.items;
    assert.ok(useCase.kind === "node" && useCase.node.type === "use-case");
    assert.ok(useCase.kind === "node" && useCase.node.children[0].kind === "node");
    assert.ok(divider.kind === "divider" && divider.label.startsWith("Review line"));
    assert.ok(code.kind === "node" && code.node.text === "Aggregate, command, endpoint, acceptance test");
  });

  it("reads facets as a label and a path", () => {
    const { trail } = parseTrail(outline);
    assert.deepStrictEqual(trail.facets, [{ label: "Where it lives", path: ["spending module", "expense aggregate"] }]);
  });

  it("reports a line it cannot read", () => {
    const { errors } = parseTrail("product Claimwick");
    assert.strictEqual(errors.length, 1);
  });

  it("draws each node with its type and colors it by group", () => {
    const { trail } = parseTrail(outline);
    const html = renderTrail(trail);
    assert.match(html, /<li class="trail-node trail-behavior"><div class="trail-row"><span class="trail-type">Use case<\/span>/);
    assert.match(html, /<li class="trail-node trail-build">/);
    assert.match(html, /role="separator"/);
  });
});
