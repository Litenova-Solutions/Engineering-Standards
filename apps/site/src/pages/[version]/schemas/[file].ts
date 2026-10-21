import type { APIRoute, GetStaticPaths } from "astro";
import fs from "node:fs";
import path from "node:path";
import { root, schemaFiles, version } from "../../../lib/spec";

export const getStaticPaths = (() =>
  schemaFiles.map((file) => ({ params: { version, file } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  if (!params.file || !schemaFiles.includes(params.file)) {
    return new Response("Not found", { status: 404 });
  }
  const bytes = fs.readFileSync(path.join(root, "schemas", params.file));
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "application/json" },
  });
};
