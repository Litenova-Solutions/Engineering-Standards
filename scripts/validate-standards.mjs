#!/usr/bin/env node
/**
 * Validates engineering-standards repository integrity.
 * Run: node scripts/validate-standards.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const errors = []
const warnings = []

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8")
}

function exists(file) {
  return fs.existsSync(path.join(root, file))
}

// 1. AGENTS.md line limit
const agentsLines = read("AGENTS.md").split("\n").length
if (agentsLines > 165) {
  errors.push(`AGENTS.md has ${agentsLines} lines (limit: 165)`)
}

// 1b. No LangVersion preview in production template
const buildProps = read("docs/templates/Directory.Build.props")
if (/LangVersion>\s*preview/i.test(buildProps)) {
  errors.push("docs/templates/Directory.Build.props must not set LangVersion to preview")
}

// 2. Manifest version matches README release
const manifest = JSON.parse(read("standards.manifest.json"))
if (manifest.version !== "1.0.0") {
  errors.push(`standards.manifest.json version is ${manifest.version}, expected 1.0.0`)
}

// 2b. agentLoadPlans paths exist
if (manifest.agentLoadPlans) {
  for (const [plan, paths] of Object.entries(manifest.agentLoadPlans)) {
    for (const rel of paths) {
      if (!exists(rel)) {
        errors.push(`agentLoadPlans.${plan} references missing file: ${rel}`)
      }
    }
  }
}

// 2c. Required governance and control docs
const requiredDocs = [
  "RELEASES.md",
  "standards.schema.json",
  "docs/governance/exceptions.md",
  "docs/governance/versioning.md",
  "docs/controls/enforcement-matrix.md",
  "docs/conventions/backend/20-object-authorization.md",
  "docs/conventions/shared/security-controls.md",
  "docs/conventions/shared/api-compatibility.md",
]
for (const file of requiredDocs) {
  if (!exists(file)) {
    errors.push(`Missing required doc: ${file}`)
  }
}

// 3. Required templates for bootstrap
const requiredTemplates = [
  "docs/templates/global.json",
  "docs/templates/Directory.Build.props",
  "docs/templates/Directory.Packages.props",
  "docs/templates/dotnet-tools.json",
  "docs/templates/package.json",
  "docs/templates/pnpm-workspace.yaml",
  "docs/templates/turbo.json",
  "docs/templates/.nvmrc",
  "docs/templates/ci-workflow.yml",
  "docs/templates/Dockerfile.api",
  "docs/templates/Dockerfile.web",
  "docs/templates/dockerignore",
  "docs/templates/playwright.config.ts",
  "docs/templates/eslint.config.ts",
  "docs/templates/packages/api-types/package.json",
  "docs/templates/packages/api-client/package.json",
  "docs/blueprints/backend/program-cs.md",
  "docs/blueprints/frontend/proxy-ts.md",
  "docs/blueprints/frontend/feature-use-case.md",
  "docs/conventions/frontend/07-feature-boundaries.md",
  "docs/templates/domain-system-index.md",
  "docs/templates/domain-feature.md",
  "docs/templates/domain-use-case.md",
  "docs/guides/agentic-domain-driven-design.md",
  "docs/blueprints/README.md",
  "docs/runbooks/README.md",
]

for (const file of requiredTemplates) {
  if (!exists(file)) {
    errors.push(`Missing required file: ${file}`)
  }
}

// 4. Internal markdown link check
const mdFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".cursor") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith(".md")) mdFiles.push(full)
  }
}
walk(root)

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g
const checked = new Set()

for (const file of mdFiles) {
  const content = fs.readFileSync(file, "utf8")
  let match
  while ((match = linkPattern.exec(content)) !== null) {
    let target = match[1].split("#")[0].split("?")[0].trim()
    if (!target || target.startsWith("http")) continue
    if (target.includes("{") || target.includes("}")) continue

    const fromDir = path.dirname(file)
    let resolved

    if (target.startsWith("/")) {
      resolved = path.join(root, target.slice(1))
    } else if (target.startsWith("docs/") || target.startsWith("AGENTS") || target.startsWith("CONTRIBUTING") || target.startsWith("standards.manifest")) {
      resolved = path.join(root, target)
    } else {
      resolved = path.resolve(fromDir, target)
    }

    const key = `${file}:${target}`
    if (checked.has(key)) continue
    checked.add(key)

    if (!fs.existsSync(resolved)) {
      const rel = path.relative(root, file)
      // Skip intentional consumer-repo paths
      if (target.includes("docs/domain/") || target.includes("standards/AGENTS")) continue
      errors.push(`Broken link in ${rel}: (${target})`)
    }
  }
}

// 5. Forbidden words in docs (excluding writing-style definition file)
const forbiddenWords = [
  "comprehensive", "robust", "seamless", "streamlined", "powerful", "modern",
  "production-grade", "cutting-edge", "innovative", "best-in-class", "state-of-the-art",
  "game-changer", "leverage", "utilize", "facilitate", "ensure", "delve",
  "boilerplate", "straightforward", "intuitive", "holistic", "multifaceted",
  "pivotal", "navigate", "realm", "landscape", "tapestry",
]

const scanFiles = mdFiles.filter(
  (f) => !f.includes("writing-style.md") && !f.includes("node_modules"),
)

for (const file of scanFiles) {
  const content = fs.readFileSync(file, "utf8").toLowerCase()
  const rel = path.relative(root, file)
  for (const word of forbiddenWords) {
    const re = new RegExp(`\\b${word}\\b`, "i")
    if (re.test(content)) {
      warnings.push(`Forbidden word "${word}" in ${rel}`)
    }
  }
}

// 6. Stale admin auth path
for (const file of mdFiles) {
  const content = fs.readFileSync(file, "utf8")
  if (content.includes("06-admin-api-auth")) {
    errors.push(`Stale reference to 06-admin-api-auth in ${path.relative(root, file)}`)
  }
}

// 7. Duplicate frontend admin auth file
if (exists("docs/conventions/frontend/06-admin-api-auth.md")) {
  errors.push("Duplicate file docs/conventions/frontend/06-admin-api-auth.md still exists")
}
if (!exists("docs/conventions/frontend/10-admin-api-auth.md")) {
  errors.push("Missing docs/conventions/frontend/10-admin-api-auth.md")
}

console.log(`Validated ${mdFiles.length} markdown files`)
console.log(`Checked ${checked.size} internal links`)

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`)
  for (const w of warnings.slice(0, 20)) console.log(`  - ${w}`)
  if (warnings.length > 20) console.log(`  ... and ${warnings.length - 20} more`)
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log("\nAll validation checks passed.")
