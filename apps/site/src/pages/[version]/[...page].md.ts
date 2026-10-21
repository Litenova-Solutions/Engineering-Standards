import type { APIRoute, GetStaticPaths } from "astro";
import { rawMarkdown } from "../../lib/agent-text";
import { pages, version } from "../../lib/spec";

export const getStaticPaths = (() =>
  pages.map((page) => ({ params: { version, page: page.path } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const page = pages.find((entry) => entry.path === params.page);
  if (!page) return new Response("Not found", { status: 404 });
  return new Response(rawMarkdown(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
