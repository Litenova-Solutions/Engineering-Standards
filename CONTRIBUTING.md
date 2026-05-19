# Contributing to Engineering Standards

This document explains how to contribute to this repository, how to create releases, and how to publish them on GitHub.

---

## 1. Who Can Contribute

Anyone working on a project that follows these standards can propose a change. Changes are proposed via pull requests against the `main` branch. No direct pushes to `main` are permitted, regardless of role.

---

## 2. What Requires a Pull Request

Everything requires a pull request. This includes:

- Adding or changing a convention file
- Adding or changing an ADR
- Adding or changing a template
- Updating agent context files (`AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.windsurfrules`, `CLAUDE.md`, `GEMINI.md`)
- Fixing typos or adding examples to existing documents
- Updating `README.md` or this file

---

## 3. Pull Request Requirements

Every pull request MUST:

1. Have a description explaining what changed and why. Reference the ADR if the change is architectural.
2. Pass all checks. This repository has no automated CI at this time; the author is responsible for verifying content manually before requesting review.
3. Include a `CHANGELOG.md` entry under `[Unreleased]` describing the change.
4. Receive at least one review approval before merging.
5. Have all review comments resolved before merging.
6. Use squash merge. The squash commit message MUST follow [Conventional Commits](https://www.conventionalcommits.org/) format.

Conventional Commits examples:

```
feat: add docs/templates/ directory with six project-specific templates
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

Breaking changes require a `MAJOR` version bump. Document breaking changes clearly in the `CHANGELOG.md` under `### Breaking Changes`. This affects downstream projects that pin to a version tag and must plan an upgrade.

---

## 5. The CHANGELOG Format

This repository follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format. The three sections used are:

- `### Breaking Changes` - convention updates that make previously compliant code non-compliant
- `### Added` - new files, new rules, new examples, new templates
- `### Changed` - updates to existing files, clarifications, corrections

Example entries for each section:

```markdown
### Breaking Changes
- `docs/conventions/backend/02-domain-layer.md`: Removed `ApplicationGuard` helper. Projects that
  reference this helper must switch to direct `if` + `throw` patterns with custom exception types.

### Added
- `docs/templates/` directory with six project-specific documentation templates.
- `CONTRIBUTING.md` with release process instructions.

### Changed
- `AGENTS.md`: Added `cancellationToken` naming rule and Reactions NuGet restriction.
- `docs/conventions/backend/05-api-layer.md`: Added route grouping section.
```

`[Unreleased]` entries are moved to a versioned section when a release is tagged.

---

## 6. Creating a Release

**Step 1:** Ensure `main` is up to date and all pull requests for this release are merged.

**Step 2:** Update `CHANGELOG.md`. Move all entries from `[Unreleased]` to a new versioned section. Set the date. Update the comparison links at the bottom of the file.

```markdown
## [1.1.0] - 2025-06-15

### Added
- docs/templates/ directory with six project-specific documentation templates.
- CONTRIBUTING.md with release process instructions.
```

**Step 3:** Commit the CHANGELOG update directly to `main`:

```bash
git commit -m "chore: prepare release v1.1.0"
```

**Step 4:** Create an annotated tag:

```bash
git tag -a v1.1.0 -m "Release v1.1.0

Added docs/templates/ directory.
Added CONTRIBUTING.md.
See CHANGELOG.md for full details."

git push origin v1.1.0
```

**Step 5:** Create a GitHub Release from the tag:

- Go to the repository on GitHub.
- Click "Releases" in the right sidebar.
- Click "Draft a new release".
- Select the tag you just pushed from the "Choose a tag" dropdown.
- Set the release title to `v1.1.0`.
- Paste the CHANGELOG entry for this version into the description field.
- For `MAJOR` version releases, check "Set as pre-release" until the release has been validated against at least one project. Uncheck it when confirmed stable.
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
- Renamed IXxxReadRepository to IXxxReadStore in Application.Read.Contracts.
  Updated IPostReadRepository -> IPostReadStore and IOrderReadRepository -> IOrderReadStore.
- Moved ApplicationGuard helper usages to direct if + throw patterns.
  Updated CreatePostCommandValidator, CreateOrderCommandValidator.
```
