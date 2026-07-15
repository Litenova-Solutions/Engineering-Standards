# Contributing

Changes use a branch and pull request against `main`. Direct pushes to `main` are not part of the release process.

## Required checks

Run before requesting review:

```bash
dotnet build tooling/Litenova.Standards.slnx --configuration Release
dotnet test tooling/Litenova.Standards.slnx --configuration Release --no-build
dotnet run --project tooling/src/Litenova.Standards.Tool -- check
```

A normative rule change must include:

- One canonical rule ID.
- Updated generated catalogs.
- A `CHANGELOG.md` entry.
- A migration note when a compliant consumer must change.
- Template and fixture updates when code shape changes.

## Review for a solo maintainer

The maintainer may merge their own pull request after all required checks pass and an AI review has examined the complete diff. A second human approval is encouraged when another maintainer is available, but it is not a merge requirement.

Resolve every actionable review comment before merge. Use squash merge unless preserving separate migration commits materially helps review.

## Versioning

- Patch releases clarify or correct existing behavior.
- Minor releases add backward-compatible rules or recipes.
- Major releases require consumer migration.

Accepted decision records are not rewritten to change their outcome. Add a new record that declares the old decision superseded.

## Consumer upgrades

Consumers update the pinned standards commit in a dedicated pull request, read the changelog and migration note, run `upgrade-check`, apply required work, and run their complete gate set.
