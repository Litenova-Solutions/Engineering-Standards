import type { APIRoute, GetStaticPaths } from "astro";
import { selectionLlmsText } from "../../../../lib/agent-text";
import { selectionKey, selections, version } from "../../../../lib/spec";

export const getStaticPaths = (() =>
  selections().map((selection) => ({
    params: { version, key: selectionKey(selection) },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const selection = selections().find((entry) => selectionKey(entry) === params.key);
  if (!selection) return new Response("Not found", { status: 404 });
  return new Response(selectionLlmsText(selection), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
