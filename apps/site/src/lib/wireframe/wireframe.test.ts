// Golden tests for the wireframe parser and SVG renderer: every fixture
// wireframe must draw its checked-in desktop and phone SVGs byte for byte,
// and every errors.json entry must fail to parse.
import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { parseWireframe } from "./parse.ts";
import { renderWireframe } from "./render.ts";

const fixtureDir = new URL("./fixtures/", import.meta.url);

function readFixture(name: string): string {
  return fs.readFileSync(new URL(name, fixtureDir), "utf8");
}

const wireframeNames = fs
  .readdirSync(fixtureDir)
  .filter((file) => file.endsWith(".wireframe") && !file.endsWith(".compact.wireframe"))
  .map((file) => file.slice(0, -".wireframe".length))
  .sort();

describe("wireframe goldens", () => {
  for (const name of wireframeNames) {
    it(`draws ${name} at both widths`, () => {
      const text = readFixture(`${name}.wireframe`);
      const parsed = parseWireframe(text);
      assert.deepStrictEqual(parsed.errors, []);
      const page = parsed.page;
      assert.ok(page !== null);
      assert.strictEqual(renderWireframe(page, false), readFixture(`${name}.desktop.svg`));

      const source = fs.existsSync(new URL(`${name}.compact.wireframe`, fixtureDir))
        ? readFixture(`${name}.compact.wireframe`)
        : text;
      const compact = parseWireframe(source);
      assert.deepStrictEqual(compact.errors, []);
      const phonePage = compact.page;
      assert.ok(phonePage !== null);
      assert.strictEqual(renderWireframe(phonePage, true), readFixture(`${name}.phone.svg`));
    });
  }
});

describe("wireframe errors", () => {
  const cases: Record<string, string> = JSON.parse(readFixture("errors.json"));

  for (const entry of Object.entries(cases)) {
    it(`rejects ${entry[0]}`, () => {
      const parsed = parseWireframe(entry[1]);
      assert.strictEqual(parsed.page, null);
      assert.ok(parsed.errors.length > 0);
    });
  }
});
