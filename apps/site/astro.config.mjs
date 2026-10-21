// The litespec.dev site: static output built from the standard at the repository root.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { version } = JSON.parse(fs.readFileSync(path.join(root, "litespec.manifest.json"), "utf8"));

// Cloudflare Pages reads _redirects from the output root. Astro ignores route files
// that start with an underscore, so the build writes it once the pages exist.
// A release root has no page of its own: it opens the learn overview.
const latestRedirects = {
  name: "litespec-latest-redirects",
  hooks: {
    "astro:build:done": ({ dir }) => {
      fs.writeFileSync(new URL("_redirects", dir), `/latest  /${version}/learn/  302\n/latest/*  /${version}/:splat  302\n/${version}/  /${version}/learn/  301\n`);
    },
  },
};

export default defineConfig({
  site: "https://litespec.dev",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [latestRedirects],
});
