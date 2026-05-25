# Contributing to Engineering Standards

This document explains how to contribute to this repository, how to create releases, and how to publish them on GitHub.

---

## 1. Who Can Contribute

Anyone working on a project that follows these standards can propose a change. Changes are proposed via pull requests against the `main` branch. No direct pushes to `main` are permitted, regardless of role.

---

## 2. What Requires a Pull Request

Everything requires a pull request. This includes:

- Adding or changing a convention file
- Adding or changing a decision record in `docs/decisions/`
- Adding or changing a template
- Updating agent context files (`AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.windsurfrules`, `CLAUDE.md`, `GEMINI.md`)
- Fixing typos or adding examples to existing documents
- Updating `README.md` or this file

---

## 3. Pull Request Requirements

Every pull request MUST:

1. Have a description explaining what changed and why. Reference the ADR if the change is architectural.
2. Pass all checks. Run locally before opening a PR:

```bash
node scripts/validate-standards.mjs
node scripts/smoke-bootstrap.mjs
```

CI runs the same checks via `.github/workflows/standards-ci.yml`.
3. Receive at least one review approval before merging.
4. Have all review comments resolved before merging.
5. Use squash merge. The squash commit message MUST follow [Conventional Commits](https://www.conventionalcommits.org/) format.

From **v2.0.0** onward, every PR that changes a convention MUST also include a `CHANGELOG.md` entry under `[Unreleased]`. There is no changelog file before v2.

Conventional Commits examples:

```
feat: add domain doc templates for consumer projects
fix: correct CancellationToken naming rule in 03-application-layer.md
chore: prepare release v1.1.0
docs: add Guard.Against exception type warning to validators section
```

---

## 4. What Constitutes a Breaking Change

A breaking change is any convention update that makes previously compliant code non-compliant. Examples:

- Renaming a required interface (e.g., renaming `IXxxReadStore` to `IXxxQueryStore`)
- Changing a folder structure rule that affects existing file paths
- Removing a pattern that projects depend on (e.g., removing the `ApplicationGuard` helper that projects reference)
- Changing an exception base class location that projects import

Breaking changes require a `MAJOR` version bump. From v2.0.0 onward, document breaking changes in `CHANGELOG.md` under `### Breaking Changes`. Before v2, describe breaking changes in the GitHub Release notes and PR description.

---

## 5. Changelog (from v2.0.0 only)

This repository has no `CHANGELOG.md` before **v2.0.0**. Release notes for v1.x tags are written in GitHub Releases only.

From **v2.0.0** onward, add `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) with these sections:

- `### Breaking Changes`
- `### Added`
- `### Changed`

---

## 6. Creating a Release

**Step 1:** Ensure `main` is up to date and all pull requests for this release are merged.

**Step 2:** For **v2.0.0+**, update `CHANGELOG.md`. Move all entries from `[Unreleased]` to a new versioned section. Set the date.

**Step 3:** Create an annotated tag:

```bash
git tag -a v1.0.0 -m "Release v1.0.0

First pinned baseline for consumer projects."

git push origin v1.0.0
```

**Step 4:** Create a GitHub Release from the tag:

- Go to the repository on GitHub.
- Click "Releases" in the right sidebar.
- Click "Draft a new release".
- Select the tag from the "Choose a tag" dropdown.
- Write release notes in the description (required for v1.x; for v2.x paste the CHANGELOG section).
- For `MAJOR` version releases, check "Set as pre-release" until validated against at least one project.
- Click "Publish release".

---

## 7. Semantic Versioning Rules

A breaking change is any convention update that makes previously compliant code non-compliant.

| Increment | When to Use | Example |
|:---|:---|:---|
| `MAJOR` | A breaking change. Previously compliant code becomes non-compliant after upgrading. | Renaming a required interface, removing a pattern projects depend on. |
| `MINOR` | A new convention is added. Existing compliant code remains compliant after upgrading. | Adding a new template, adding a new rule that applies only to new code. |
| `PATCH` | A clarification, typo fix, new example, new ADR, or agent file improvement. No convention changes. | Fixing a typo in a code example, adding a `// BAD:` example to an existing rule. |

---

## 8. How Downstream Projects Stay Updated

Projects include this repository as a git submodule pinned to a specific tag. To upgrade a project to a newer tag:

```bash
cd standards
git fetch --tags
git checkout v1.1.0
cd ..
git add standards
git commit -m "chore: upgrade engineering-standards to v1.1.0"
```

For `MAJOR` version upgrades, the commit message should list the breaking changes and describe what was updated in the project to comply:

```
chore: upgrade engineering-standards to v2.0.0

Breaking changes addressed:
- Renamed apps/web/features/ to apps/web/features/.
  Updated imports and ESLint boundary zones.
- Moved project docs to docs/domain/{feature}/{use-case}.md tree.
```
