#!/usr/bin/env node
/**
 * Smoke test: verify bootstrap template set is complete and copyable.
 * Run: node scripts/smoke-bootstrap.mjs
 */
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const templatesRoot = path.join(root, "docs/templates")
const errors = []

const copyMap = [
  [".nvmrc", ".nvmrc"],
  ["package.json", "package.json"],
  ["pnpm-workspace.yaml", "pnpm-workspace.yaml"],
  ["turbo.json", "turbo.json"],
  ["global.json", "apps/api/global.json"],
  ["Directory.Build.props", "apps/api/Directory.Build.props"],
  ["Directory.Packages.props", "apps/api/Directory.Packages.props"],
  ["dotnet-tools.json", "apps/api/.config/dotnet-tools.json"],
  ["ci-workflow.yml", ".github/workflows/ci.yml"],
  ["Dockerfile.api", "Dockerfile.api"],
  ["Dockerfile.web", "Dockerfile.web"],
  ["dockerignore", ".dockerignore"],
  ["playwright.config.ts", "apps/web/playwright.config.ts"],
  ["eslint.config.ts", "apps/web/eslint.config.ts"],
]

const copyDirs = [
  ["packages/api-types", "packages/api-types"],
  ["packages/api-client", "packages/api-client"],
]

function copyFile(src, dest, destRoot) {
  const srcPath = path.join(templatesRoot, src)
  const destPath = path.join(destRoot, dest)
  if (!fs.existsSync(srcPath)) {
    errors.push(`Source missing: docs/templates/${src}`)
    return
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.copyFileSync(srcPath, destPath)
}

function copyDir(src, dest, destRoot) {
  const srcPath = path.join(templatesRoot, src)
  const destPath = path.join(destRoot, dest)
  if (!fs.existsSync(srcPath)) {
    errors.push(`Source dir missing: docs/templates/${src}`)
    return
  }
  fs.mkdirSync(destPath, { recursive: true })
  for (const entry of fs.readdirSync(srcPath, { withFileTypes: true })) {
    const s = path.join(srcPath, entry.name)
    const d = path.join(destPath, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true })
      for (const child of fs.readdirSync(s)) {
        fs.copyFileSync(path.join(s, child), path.join(d, child))
      }
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "standards-bootstrap-"))
console.log(`Bootstrap smoke test dir: ${tmp}`)

for (const [src, dest] of copyMap) {
  copyFile(src, dest, tmp)
}

for (const [src, dest] of copyDirs) {
  copyDir(src, dest, tmp)
}

// Validate copied JSON parses
for (const jsonFile of ["package.json", "turbo.json", "apps/api/global.json"]) {
  const p = path.join(tmp, jsonFile)
  if (!fs.existsSync(p)) {
    errors.push(`Expected copied file missing: ${jsonFile}`)
    continue
  }
  try {
    JSON.parse(fs.readFileSync(p, "utf8"))
  } catch (e) {
    errors.push(`Invalid JSON after copy: ${jsonFile} (${e.message})`)
  }
}

// Validate global.json SDK version matches manifest
const manifest = JSON.parse(fs.readFileSync(path.join(root, "standards.manifest.json"), "utf8"))
const globalJson = JSON.parse(fs.readFileSync(path.join(tmp, "apps/api/global.json"), "utf8"))
if (globalJson.sdk.version !== manifest.stack.dotnet) {
  errors.push(
    `global.json SDK ${globalJson.sdk.version} != manifest ${manifest.stack.dotnet}`,
  )
}

// Validate ci workflow references apps/api/global.json
const ci = fs.readFileSync(path.join(tmp, ".github/workflows/ci.yml"), "utf8")
if (!ci.includes("apps/api/global.json")) {
  errors.push("CI workflow missing apps/api/global.json reference")
}
if (!ci.includes("generate:api-types")) {
  errors.push("CI workflow missing generate:api-types step")
}

// Cleanup
fs.rmSync(tmp, { recursive: true, force: true })

if (errors.length) {
  console.error("Bootstrap smoke test failed:")
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log("Bootstrap smoke test passed.")
