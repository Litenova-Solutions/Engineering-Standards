# Git Workflow

This document defines the branch naming, commit message, pull request, and merge conventions for all projects following these standards.

---

## Branch Naming

Branch names follow the pattern `{type}/{short-description}` where the description is lowercase kebab-case.

| Type | When to Use | Example |
|:---|:---|:---|
| `feat` | A new feature or user-facing functionality | `feat/add-post-publishing` |
| `fix` | A bug fix | `fix/post-not-found-returns-500` |
| `chore` | Maintenance tasks, dependency updates, CI changes | `chore/update-efcore-to-10-0-4` |
| `docs` | Documentation changes only | `docs/add-query-projection-examples` |
| `refactor` | Code restructuring with no behavior change | `refactor/extract-post-projection` |
| `test` | Adding or fixing tests | `test/add-publish-post-integration-test` |

Branch names MUST be all lowercase. Use hyphens, not underscores or spaces. Keep descriptions short (3-5 words).

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
|:---|:---|:---|
| `feat` | A new feature | `feat(posts): add publishing endpoint` |
| `fix` | A bug fix | `fix(posts): return 404 when post not found` |
| `chore` | Maintenance | `chore: update Npgsql to 10.0.3` |
| `docs` | Documentation | `docs(readme): add submodule setup instructions` |
| `refactor` | Refactoring | `refactor(posts): extract shared post projection` |
| `test` | Test changes | `test(posts): add integration test for publish endpoint` |
| `ci` | CI/CD pipeline | `ci: add vulnerability scan step` |
| `build` | Build system changes | `build: switch to slnx solution format` |
| `perf` | Performance improvements | `perf(posts): reduce post list projection fields` |

**Breaking changes** are indicated with a `!` after the type or with `BREAKING CHANGE:` in the footer:

```
feat(api)!: change post ID from int to guid
```

---

## Pull Request Rules

Every pull request MUST meet all of the following before it can be merged:

1. **Description:** The PR description explains what changed and why. Link to any related issues or ADRs.
2. **CI passes:** All build and test steps must be green. No exceptions.
3. **No test coverage decrease:** Adding code without tests for it is not acceptable. Integration tests are required for every new endpoint.
4. **Review:** At least one approval from another engineer before merge.
5. **No unresolved comments:** All review comments must be resolved or acknowledged before merging.

From **v2.0.0** onward, every PR that changes a convention MUST include a `CHANGELOG.md` entry under `[Unreleased]`. There is no changelog file before v2.

---

## Merge Strategy

- **Feature branches to `main`:** Squash and merge. The squashed commit message MUST follow the Conventional Commits format.
- **No merge commits on `main`.** The `main` branch history must be linear.
- **No force-pushes to `main`.**

The squash commit message MUST summarize the entire feature branch in one Conventional Commits line. If the branch contains multiple unrelated changes, it MUST have been split into multiple PRs.

---

## Tagging and Releases

Tags follow semantic versioning: `v{major}.{minor}.{patch}`

- Tags are created on `main` only.
- A tag marks a stable, releasable state of the repository.
- From **v2.0.0** onward, update `CHANGELOG.md` before tagging (move content from `[Unreleased]` to the new version section). v1.x releases use GitHub Release notes only.

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

