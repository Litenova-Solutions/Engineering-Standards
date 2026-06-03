#!/usr/bin/env node
/**
 * Structural completeness checks for ADDD domain documentation.
 * Consumer projects: node scripts/validate-domain-docs.mjs [--root .]
 * Standards repo: validates templates only when run from repo root without docs/domain/.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const rootFlag = args.indexOf("--root")
const root =
  rootFlag >= 0 && args[rootFlag + 1]
    ? path.resolve(args[rootFlag + 1])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const domainRoot = path.join(root, "docs/domain")
const errors = []
const warnings = []

function read(file) {
  return fs.readFileSync(file, "utf8")
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const fm = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean)
    } else {
      val = val.replace(/^['"]|['"]$/g, "")
    }
    fm[key] = val
  }
  return fm
}

const USE_CASE_REQUIRED = [
  "doc-type",
  "feature",
  "aggregate",
  "operation",
  "layer-context",
  "conventions",
  "test-spec",
  "risk-level",
  "status",
]

const FEATURE_REQUIRED = [
  "doc-type",
  "feature",
  "aggregate",
  "use-cases",
  "layer-context",
  "conventions",
  "status",
]

function listMarkdown(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listMarkdown(full))
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") out.push(full)
  }
  return out
}

function rel(f) {
  return path.relative(root, f).replace(/\\/g, "/")
}

if (!fs.existsSync(domainRoot)) {
  console.log("No docs/domain/ tree found; skipping consumer domain validation.")
  process.exit(0)
}

const featureDirs = fs
  .readdirSync(domainRoot, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(domainRoot, e.name))

for (const featureDir of featureDirs) {
  const featureName = path.basename(featureDir)
  const featureReadme = path.join(featureDir, "README.md")

  if (!fs.existsSync(featureReadme)) {
    errors.push(`Missing Feature Spec: ${rel(featureReadme)}`)
    continue
  }

  const featureContent = read(featureReadme)
  const featureFm = parseFrontmatter(featureContent)
  if (!featureFm) {
    warnings.push(`Feature Spec missing YAML frontmatter: ${rel(featureReadme)}`)
  } else {
    for (const key of FEATURE_REQUIRED) {
      if (featureFm[key] === undefined || featureFm[key] === "") {
        errors.push(`Feature Spec frontmatter missing '${key}': ${rel(featureReadme)}`)
      }
    }
    if (featureFm["doc-type"] && featureFm["doc-type"] !== "feature-spec") {
      errors.push(`Feature Spec doc-type must be 'feature-spec': ${rel(featureReadme)}`)
    }
  }

  const invariantRows =
    featureContent.match(/\| Invariant \| Use case doc[\s\S]*?\n\n/)?.[0] ?? ""
  const listedInvariants = [...invariantRows.matchAll(/\|\s*(.+?)\s*\|/g)]
    .slice(1)
    .map((m) => m[1].trim())
    .filter((s) => s && !s.startsWith(":") && s !== "Invariant")

  const stateBlock = featureContent.match(/```mermaid\s*\nstateDiagram-v2([\s\S]*?)```/)?.[1] ?? ""
  const transitions = [...stateBlock.matchAll(/:\s*([^(|\n]+)/g)].map((m) =>
    m[1].trim(),
  )

  const useCaseDocs = listMarkdown(featureDir).filter((f) => !f.endsWith(".tests.md"))

  for (const transition of transitions) {
    const slug = transition.toLowerCase().replace(/\s+/g, "-")
    const covered = useCaseDocs.some((doc) => {
      const base = path.basename(doc, ".md")
      return base.includes(slug) || read(doc).toLowerCase().includes(transition.toLowerCase())
    })
    if (!covered) {
      warnings.push(
        `State transition '${transition}' in ${featureName} may have no use case doc (${rel(featureReadme)})`,
      )
    }
  }

  for (const docPath of useCaseDocs) {
    const base = path.basename(docPath, ".md")
    const testSpecPath = path.join(featureDir, `${base}.tests.md`)
    const content = read(docPath)
    const fm = parseFrontmatter(content)

    if (!fm) {
      warnings.push(`Use Case Doc missing YAML frontmatter: ${rel(docPath)}`)
    } else {
      for (const key of USE_CASE_REQUIRED) {
        if (fm[key] === undefined || fm[key] === "") {
          errors.push(`Use Case Doc frontmatter missing '${key}': ${rel(docPath)}`)
        }
      }
      if (fm["doc-type"] && fm["doc-type"] !== "use-case") {
        errors.push(`Use Case Doc doc-type must be 'use-case': ${rel(docPath)}`)
      }
      if (fm["test-spec"] && fm["test-spec"] !== `${base}.tests.md`) {
        warnings.push(
          `test-spec frontmatter '${fm["test-spec"]}' does not match expected '${base}.tests.md' (${rel(docPath)})`,
        )
      }
    }

    if (!fs.existsSync(testSpecPath)) {
      errors.push(`Missing Use Case Test Spec for ${rel(docPath)}: expected ${rel(testSpecPath)}`)
    } else {
      const testContent = read(testSpecPath)
      for (const inv of listedInvariants) {
        if (inv.length > 3 && !testContent.includes(inv.slice(0, 20))) {
          warnings.push(
            `Invariant '${inv}' from Feature Spec may lack test spec coverage (${base}.tests.md)`,
          )
        }
      }

      const rows = [...testContent.matchAll(/\|\s*\d+\s*\|/g)]
      if (rows.length === 0) {
        warnings.push(`Test spec has no Test Coverage rows: ${rel(testSpecPath)}`)
      }
    }

    const isWrite =
      /Command|POST|PUT|PATCH|DELETE/i.test(content) &&
      !/Query|GET/i.test(content.split("## Command or Query")[1]?.slice(0, 500) ?? "")
    if (isWrite && fm?.operation) {
      const readCandidates = useCaseDocs.filter(
        (d) => d !== docPath && /Query|GET|list|get-/i.test(read(d)),
      )
      if (readCandidates.length === 0) {
        warnings.push(
          `Write use case '${base}' may have no corresponding read use case to observe results (${rel(docPath)})`,
        )
      }
    }
  }
}

const agentIndexPath = path.join(domainRoot, "agent-index.json")
if (!fs.existsSync(agentIndexPath)) {
  warnings.push("Missing docs/domain/agent-index.json (machine-readable domain map)")
} else {
  try {
    JSON.parse(read(agentIndexPath))
  } catch {
    errors.push("Invalid JSON in docs/domain/agent-index.json")
  }
}

console.log(`Validated domain docs under ${domainRoot}`)
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`)
  for (const w of warnings) console.log(`  - ${w}`)
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log("\nDomain documentation validation passed (no errors).")
