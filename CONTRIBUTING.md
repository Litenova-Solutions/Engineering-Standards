# Contributing

Changes use a branch and pull request against `main`. Direct pushes to `main` are outside the release process.

## Documentation contract

Each topic document begins with `Intent` and separates required `Standards` from replaceable `Conventions`. Actionable standards use a unique stable rule ID with the human title first.

Keep one canonical source for each rule, package version, extension, and upgrade requirement. Link instead of copying.

## Required review

Before requesting review:

- Inspect changed links and rule IDs.
- Confirm manifest paths and `#agent-summary` anchors exist.
- Confirm extension names match the manifest and consumer template.
- Validate `standards.manifest.json` and `templates/docs/standards.project.json` against their schemas.
- Update the changelog.
- Add an upgrade guide when compliant consumers must change.
- Update document templates when ADDD metadata or required sections change.
- Run `git diff --check`.

The repository intentionally has no standards CLI, generated catalog, or application scaffold.

## Normative changes

A new or changed standard includes:

- One canonical rule ID.
- Intent and at least one concrete example.
- Verification that can be performed by an agent, reviewer, compiler, test, or operating check.
- A changelog entry.
- An upgrade note when an existing compliant consumer must change.

A convention states how a consumer may document a local replacement. Do not use a convention to weaken a security, data, or architectural standard.

## Extensions

An extension document contains activation criteria, baseline relationship, agent summary, standards, conventions, dependencies, and verification. It names every baseline rule it replaces.

Do not add a separate extension descriptor or schema. The extension Markdown file is the contract, and the manifest maps its ID to that file.

## Solo-maintainer review

The maintainer may merge their own pull request after all required checks pass and an AI review examines the complete diff. A second human approval is encouraged when another maintainer is available, but it is not a merge requirement.

Resolve every actionable review comment before merge. Use squash merge unless preserving separate migration commits materially helps review.

## Versioning

- Patch releases clarify or correct existing behavior.
- Minor releases add backward-compatible standards, conventions, extensions, or capabilities.
- Major releases require consumer work.

Accepted decision records are historical. Add a replacement decision and mark the old record superseded rather than rewriting its outcome.

## Consumer upgrades

Consumers update the pinned standards commit in a dedicated pull request, read the changelog and applicable upgrade guide, apply required work, and run the complete application gate set.
