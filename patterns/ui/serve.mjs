/**
 * Serves the registry on localhost and writes the reviewer's choices to
 * ui-pattern-choices.json beside it, on every change.
 *
 *   node standards/patterns/ui/serve.mjs [port]
 *
 * Opened from disk, the registry can only write a file the reviewer picks in a
 * dialog. Opened through this server, the file always lands at the same path
 * in the repository, where an implementing agent can read it.
 */

import { createServer } from "node:http";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(HERE, "dist", "ui-patterns.html");
const CHOICES = path.join(HERE, "dist", "reviewer-choices.json");
const PORT = Number(process.argv[2] ?? 4815);
const SHOWN = path.relative(path.resolve(HERE, "../.."), CHOICES).replaceAll("\\", "/");

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(readFileSync(PAGE));
    return;
  }
  if (url.pathname === "/choices" && req.method === "GET") {
    const data = existsSync(CHOICES) ? JSON.parse(readFileSync(CHOICES, "utf8")) : null;
    res.writeHead(200, { "Content-Type": "application/json", "X-Registry-Server": "1" });
    res.end(JSON.stringify({ path: SHOWN, data }));
    return;
  }
  if (url.pathname === "/choices" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        JSON.parse(body);
        // Written beside, then renamed, so a reader never sees half a file.
        writeFileSync(`${CHOICES}.tmp`, body, "utf8");
        renameSync(`${CHOICES}.tmp`, CHOICES);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ path: SHOWN }));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(error.message) }));
      }
    });
    return;
  }
  res.writeHead(404).end();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Pattern registry: http://localhost:${PORT}/`);
  console.log(`Choices are written to ${SHOWN}`);
});
