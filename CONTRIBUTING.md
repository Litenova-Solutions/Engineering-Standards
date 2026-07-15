# Contributing

Changes use a branch and pull request against `main`. Direct pushes to `main` are not part of the release process.

## Required review

Before requesting review, inspect changed links, rule IDs, frontmatter, manifest paths, recipe references, and migration notes. Run `git diff --check`. The repository intentionally has no standards CLI or application scaffold.

A normative rule change must include:

- One canonical rule ID.
- A `CHANGELOG.md` entry.
- A migration note when a compliant consumer must change.
- Document template updates when the ADDD document shape changes.

## Review for a solo maintainer

The maintainer may merge their own pull request after all required checks pass and an AI review has examined the complete diff. A second human approval is encouraged when another maintainer is available, but it is not a merge requirement.

Resolve every actionable review comment before merge. Use squash merge unless preserving separate migration commits materially helps review.

## Versioning

- Patch releases clarify or correct existing behavior.
- Minor releases add backward-compatible rules or recipes.
- Major releases require consumer migration.

Accepted decision records are not rewritten to change their outcome. Add a new record that declares the old decision superseded.

## Consumer upgrades

Consumers update the pinned standards commit in a dedicated pull request, read the changelog and migration note, apply required work, and run their complete application gate set.
