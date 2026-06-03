#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const blueprintHints = {
  "domain-layer.md": "docs/blueprints/backend/write-endpoint.md",
  "application-layer.md": "docs/blueprints/backend/write-endpoint.md",
  "api-layer.md": "docs/blueprints/backend/write-endpoint.md",
  "infrastructure-layer.md": "docs/blueprints/backend/infrastructure-service-registration.md",
  "testing.md": "docs/blueprints/backend/integration-test-factory.md",
  "api-acceptance-tests.md": "docs/blueprints/backend/api-acceptance-tests/acceptance-test-project.md",
  "nextjs-app-router.md": "docs/blueprints/frontend/feature-use-case.md",
  "data-fetching.md": "docs/blueprints/frontend/lib-api-client.md",
}

function relPath(abs) {
  return abs.replace(/\\/g, "/").replace(root.replace(/\\/g, "/") + "/", "")
}

function patchFile(abs) {
  let content = fs.readFileSync(abs, "utf8")
  if (!content.includes("## Agent Quick Rules")) return false

  content = content.replace(
    /## Agent Quick Rules(?!\s*\{#agent-quick-rules\})/g,
    "## Agent Quick Rules {#agent-quick-rules}",
  )

  const sectionRe = /## Agent Quick Rules \{#agent-quick-rules\}([\s\S]*?)(\r?\n---\r?\n)/
  const match = content.match(sectionRe)
  if (!match) return false
  if (match[1].includes("**Full convention:**")) return false

  const rel = relPath(abs)
  const blueprint = blueprintHints[path.basename(abs)]
  let footer = `\n\n**Full convention:** \`${rel}\``
  if (blueprint) {
    footer += `\n**When generating new files:** Load and copy from \`${blueprint}\` rather than assembling from examples in this file.`
  }
  footer += "\n"

  content = content.replace(sectionRe, `## Agent Quick Rules {#agent-quick-rules}${match[1]}${footer}$2`)
  fs.writeFileSync(abs, content)
  return true
}

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, fn)
    else if (entry.name.endsWith(".md")) fn(full)
  }
}

let patched = 0
for (const dir of ["docs/conventions", "docs/architecture", "docs/guides"]) {
  walk(path.join(root, dir), (f) => {
    if (patchFile(f)) patched++
  })
}

console.log(`Patched ${patched} files.`)
