# Git Workflow

This document defines the branch naming, commit message, pull request, and merge conventions for all Litenova Solutions projects.

---

## Branch Naming

Branch names follow the pattern `{type}/{short-description}` where the description is lowercase kebab-case.

| Type | When to Use | Example |
|---|---|---|
| `feat` | A new feature or user-facing functionality | `feat/add-post-publishing` |
| `fix` | A bug fix | `fix/post-not-found-returns-500` |
| `chore` | Maintenance tasks, dependency updates, CI changes | `chore/update-efcore-to-9-0-4` |
| `docs` | Documentation changes only | `docs/add-read-store-examples` |
| `refactor` | Code restructuring with no behavior change | `refactor/extract-post-read-store` |
| `test` | Adding or fixing tests | `test/add-publish-post-integration-test` |

Branch names MUST be all lowercase. Use hyphens, not underscores or spaces. Keep descriptions short (3–5 words).

---

## Commit Messages

All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
{type}({optional scope}): {short description}

{optional body}

{optional footer}
```

The short description is lowercase, imperative mood, no trailing period. Maximum 72 characters on the first line.

| Type | When to Use | Example |
|---|---|---|
| `feat` | A new feature | `feat(posts): add publishing endpoint` |
| `fix` | A bug fix | `fix(posts): return 404 when post not found` |
| `chore` | Maintenance | `chore: update Npgsql to 8.0.3` |
| `docs` | Documentation | `docs(readme): add submodule setup instructions` |
| `refactor` | Refactoring | `refactor(posts): extract IPostReadStore` |
| `test` | Test changes | `test(posts): add integration test for publish endpoint` |
| `ci` | CI/CD pipeline | `ci: add vulnerability scan step` |
| `build` | Build system changes | `build: switch to sdk-style csproj` |
| `perf` | Performance improvements | `perf(posts): use select projection in read store` |

**Breaking changes** are indicated with a `!` after the type or with `BREAKING CHANGE:` in the footer:

```
feat(api)!: change post ID from int to guid
```

---

## Pull Request Rules

Every pull request MUST meet all of the following before it can be merged:

1. **Description:** The PR description explains _what_ changed and _why_. Link to any related issues or ADRs.
2. **CI passes:** All build and test steps must be green. No exceptions.
3. **No test coverage decrease:** Adding code without tests for it is not acceptable. Integration tests are required for every new endpoint.
4. **CHANGELOG entry:** Every PR that changes a convention, adds a feature, or fixes a bug MUST include a corresponding entry in `CHANGELOG.md` under `[Unreleased]`.
5. **Review:** At least one approval from another engineer before merge.
6. **No unresolved comments:** All review comments must be resolved or acknowledged before merging.

---

## Merge Strategy

- **Feature branches → `main`:** Squash and merge. The squashed commit message MUST follow the Conventional Commits format.
- **No merge commits on `main`.** The `main` branch history must be linear.
- **No force-pushes to `main`.**

The squash commit message should summarize the entire feature branch in one Conventional Commits line. If the branch contains multiple unrelated changes, it should have been split into multiple PRs.

---

## Tagging and Releases

Tags follow semantic versioning: `v{major}.{minor}.{patch}`

- Tags are created on `main` only.
- A tag marks a stable, releasable state of the repository.
- The `CHANGELOG.md` entry for the release MUST be updated before tagging (move content from `[Unreleased]` to the new version section).

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

**When to bump:**
- `patch`: Bug fixes, documentation corrections, test additions with no behavior change.
- `minor`: New features that are backwards-compatible.
- `major`: Breaking changes to existing conventions or interfaces.

---

## Protected Branches

`main` is a protected branch. Direct pushes are not permitted. All changes to `main` MUST go through a pull request that passes CI and receives at least one approval.
