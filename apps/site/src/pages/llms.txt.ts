import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { rootLlmsText } from "../lib/agent-text";
import { root } from "../lib/spec";

export const GET: APIRoute = () => {
  const agentProtocol = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
  return new Response(rootLlmsText(agentProtocol), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
