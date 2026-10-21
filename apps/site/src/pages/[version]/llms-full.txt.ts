import type { APIRoute, GetStaticPaths } from "astro";
import { fullLlmsText } from "../../lib/agent-text";
import { version } from "../../lib/spec";

export const getStaticPaths = (() => [{ params: { version } }]) satisfies GetStaticPaths;

export const GET: APIRoute = () =>
  new Response(fullLlmsText(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
