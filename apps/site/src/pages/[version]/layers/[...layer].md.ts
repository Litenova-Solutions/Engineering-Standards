import type { APIRoute, GetStaticPaths } from "astro";
import { layerText } from "../../../lib/agent-text";
import { layers, version } from "../../../lib/spec";

export const getStaticPaths = (() =>
  layers().map((layer) => ({ params: { version, layer: layer.key } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const layer = layers().find((entry) => entry.key === params.layer);
  if (!layer) return new Response("Not found", { status: 404 });
  return new Response(layerText(layer), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
