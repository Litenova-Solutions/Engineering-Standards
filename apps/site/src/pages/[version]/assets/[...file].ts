// Serves the files under docs/assets/ at /<version>/assets/<path>, so the image links in a
// page's raw Markdown copy resolve for an agent exactly as they do in the repository.
import type { APIRoute, GetStaticPaths } from "astro";
import fs from "node:fs";
import path from "node:path";
import { root, version } from "../../../lib/spec";

const assetsRoot = path.join(root, "docs", "assets");
const contentTypes: Record<string, string> = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [path.relative(assetsRoot, full).split(path.sep).join("/")];
  });
}

const files = walk(assetsRoot).filter((file) => path.extname(file) in contentTypes);

export const getStaticPaths = (() => files.map((file) => ({ params: { version, file } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  if (!params.file || !files.includes(params.file)) return new Response("Not found", { status: 404 });
  const bytes = fs.readFileSync(path.join(assetsRoot, params.file));
  return new Response(new Uint8Array(bytes), { headers: { "Content-Type": contentTypes[path.extname(params.file)] } });
};
