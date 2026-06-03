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
const buildProps = read("docs/templates/config/Directory.Build.props")
if (/LangVersion>\s*preview/i.test(buildProps)) {
  errors.push("docs/templates/config/Directory.Build.props must not set LangVersion to preview")
}

// 2. Manifest version
const manifest = JSON.parse(read("standards.manifest.json"))
if (!manifest.version) {
  errors.push("standards.manifest.json missing version")
}

// 2b. agentLoadPlans and conventionIndex paths exist
function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function fileHasAnchor(filePath, anchor) {
  const content = read(filePath)
  if (content.includes(`{#${anchor}}`)) return true
  const target = anchor.toLowerCase()
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*(?:\{#([^}]+)\})?\s*$/)
    if (m && slugifyHeading(m[1]) === target) return true
    if (m && m[2] === anchor) return true
  }
  return false
}

function validateLoadPlanPath(rel) {
  const [filePath, anchor] = rel.split("#")
  if (!exists(filePath)) {
    return `missing file: ${rel}`
  }
  if (anchor && !fileHasAnchor(filePath, anchor)) {
    return `missing anchor #${anchor} in ${filePath}`
  }
  return null
}

if (manifest.agentLoadPlans) {
  for (const [plan, config] of Object.entries(manifest.agentLoadPlans)) {
    const tiers = Array.isArray(config)
      ? { tier1: config }
      : config
    for (const tier of ["tier0", "tier1", "tier2", "blueprints"]) {
      for (const rel of tiers[tier] ?? []) {
        const err = validateLoadPlanPath(rel)
        if (err) errors.push(`agentLoadPlans.${plan}.${tier} ${err}`)
      }
    }
  }
}
if (manifest.conventionIndex) {
  for (const [key, rel] of Object.entries(manifest.conventionIndex)) {
    if (!exists(rel)) {
      errors.push(`conventionIndex.${key} references missing file: ${rel}`)
    }
  }
}

// 2c. Required governance and docs
const requiredDocs = [
  "standards.schema.json",
  "docs/glossary.md",
  "docs/guides/onboarding.md",
  "docs/governance/exceptions.md",
  "docs/conventions/backend/object-authorization.md",
  "docs/conventions/backend/api-acceptance-tests.md",
  "docs/conventions/backend/external-dependencies.md",
  "docs/conventions/frontend/state-management.md",
  "docs/conventions/shared/security-controls.md",
  "docs/conventions/shared/api-compatibility.md",
  "scripts/validate-feature-files.ps1",
  "scripts/validate-domain-docs.mjs",
]
for (const file of requiredDocs) {
  if (!exists(file)) {
    errors.push(`Missing required doc: ${file}`)
  }
}

// 2d. Removed legacy paths must not return
const forbiddenPaths = [
  "docs/controls/enforcement-matrix.md",
  "docs/governance/versioning.md",
  "RELEASES.md",
  "docs/conventions/00-principles.md",
  "docs/conventions/backend/08-testing.md",
]
for (const file of forbiddenPaths) {
  if (exists(file)) {
    errors.push(`Legacy path still exists (remove or rename): ${file}`)
  }
}

// 3. Required templates for bootstrap
const requiredTemplates = [
  "docs/templates/config/global.json",
  "docs/templates/config/Directory.Build.props",
  "docs/templates/config/Directory.Packages.props",
  "docs/templates/config/dotnet-tools.json",
  "docs/templates/config/package.json",
  "docs/templates/config/pnpm-workspace.yaml",
  "docs/templates/config/turbo.json",
  "docs/templates/config/.nvmrc",
  "docs/templates/config/ci-workflow.yml",
  "docs/templates/config/Dockerfile.api",
  "docs/templates/config/Dockerfile.web",
  "docs/templates/config/dockerignore",
  "docs/templates/config/playwright.config.ts",
  "docs/templates/config/eslint.config.ts",
  "docs/templates/config/packages/api-types/package.json",
  "docs/templates/config/packages/api-client/package.json",
  "docs/blueprints/backend/program-cs.md",
  "docs/blueprints/frontend/proxy-ts.md",
  "docs/blueprints/frontend/feature-use-case.md",
  "docs/conventions/frontend/feature-boundaries.md",
  "docs/templates/docs/domain-system-index.md",
  "docs/templates/docs/domain-agent-index.json",
  "docs/templates/docs/domain-feature.md",
  "docs/templates/docs/domain-use-case.md",
  "docs/templates/docs/domain-use-case.tests.md",
  "docs/guides/write-use-case-doc.md",
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
    } else if (
      target.startsWith("docs/") ||
      target.startsWith("AGENTS") ||
      target.startsWith("CONTRIBUTING") ||
      target.startsWith("standards.manifest")
    ) {
      resolved = path.join(root, target)
    } else {
      resolved = path.resolve(fromDir, target)
    }

    const key = `${file}:${target}`
    if (checked.has(key)) continue
    checked.add(key)

    if (!fs.existsSync(resolved)) {
      const rel = path.relative(root, file)
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
  if (content.includes("06-admin-api-auth") || content.includes("frontend/01-")) {
    errors.push(`Stale numbered convention reference in ${path.relative(root, file)}`)
  }
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
