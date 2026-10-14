/**
 * Finds Playwright for the audit and screenshot tools.
 *
 * The library ships no dependencies. A consumer workspace that runs browser
 * tests already has `@playwright/test` installed somewhere; this looks for it
 * from `UI_PATTERNS_PLAYWRIGHT_FROM` (a package.json path or a folder), then
 * from the current directory, and says what to do when neither has it.
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

function tryFrom(base) {
  const anchor = base.endsWith(".json") ? base : path.join(base, "package.json");
  if (!existsSync(anchor)) return null;
  try {
    return createRequire(anchor)("@playwright/test");
  } catch {
    return null;
  }
}

export function loadPlaywright() {
  const candidates = [process.env.UI_PATTERNS_PLAYWRIGHT_FROM, process.cwd()].filter(Boolean);
  for (const base of candidates) {
    const found = tryFrom(path.resolve(base));
    if (found) return found;
  }
  throw new Error(
    "Playwright was not found. Run from a workspace that has @playwright/test installed, or set UI_PATTERNS_PLAYWRIGHT_FROM to the package.json of a project that has it.",
  );
}
