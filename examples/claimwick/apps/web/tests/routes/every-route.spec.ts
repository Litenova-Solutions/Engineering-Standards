import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Discovers every route from the route tree, so a new route is checked without a new test.
const routesRoot = join(__dirname, "..", "..", "src", "routes");

function discover(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) {
      return name.startsWith("-") ? [] : discover(path);
    }
    if (name !== "+page.svelte") {
      return [];
    }
    const address = relative(routesRoot, folder).split(sep).filter(Boolean).join("/");
    return [`/${address}`];
  });
}

for (const address of discover(routesRoot)) {
  test.describe(`route ${address}`, () => {
    test("renders one floorplan from a named registry item", async ({ page }) => {
      await page.goto(address);
      await expect(page.locator("[data-floorplan]")).toHaveCount(1);
      await expect(page.locator("[data-registry-item]")).toHaveCount(1);
    });

    test("has one heading and one main landmark", async ({ page }) => {
      await page.goto(address);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
    });

    test("reports zero WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto(address);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
      expect(results.violations).toEqual([]);
    });

    test("reflows at 320 CSS pixels without horizontal scrolling", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(address);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
    });

    test("shows a visible focus on the first interactive element", async ({ page }) => {
      await page.goto(address);
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus-visible");
      await expect(focused).toHaveCount(1);
    });
  });
}
