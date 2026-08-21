# Contributing

Submit changes through a branch and pull request against `main`. Direct pushes to `main` are outside the release process.

## Authoring Contract

Follow the [authoring standard](docs/foundations/authoring-standard.md) for every active standards page, template, instruction, and release note.

Keep one canonical source for each provision, version, extension, and technical fact. Link to that source instead of copying it. (CORE.SOURCE.001)

## Current Snapshot

Treat active standards as the complete current contract. (WRITING.SNAPSHOT.001)

Do not retain history-specific paths, IDs, terminology, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (WRITING.SNAPSHOT.002)

Keep release context in `CHANGELOG.md` and Git history. The repository validator evaluates current material only. (WRITING.SNAPSHOT.001)

## Provision Changes

A new or changed Standard includes:

- One atomic Requirement with one rule ID.
- An informative example when `WRITING.EXAMPLE.001` requires one.
- One exact Verification row.
- A current changelog entry.

Assign a new ID to each changed Standard assertion. (WRITING.REQUIREMENT.001)

Do not add aliases, replacement maps, alternate paths, compatibility terms, or transition material. (WRITING.SNAPSHOT.002)

An actionable Convention includes one convention ID, Default statement, Replacement statement, and Verification row.

## Extension Changes

An extension page declares Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, and Verification.

The extension document names each baseline provision it replaces. The manifest records its path, activation scope, and applicable specification kinds.

Do not create a separate extension descriptor. The Markdown page and manifest entry form the extension contract.

## Required Review

Before review:

- Inspect changed links, anchors, provision IDs, and evidence rows.
- Confirm manifest paths and `#agent-summary` anchors.
- Confirm extension declarations match the manifest.
- Validate the two tracked schema consumers.
- Update affected templates and validator cases.
- Update the changelog.
- Run `git diff --check`.

A changed validator rule includes one passing case and one failing case. A rule without both cases is unverified.

The pull request checklist records the manual active-voice, terminology, atomicity, example, and quality review.

## Release Numbering

The [authoring standard](docs/foundations/authoring-standard.md) owns the release model, including the meaning of each version number. This section projects that model for contributors.

Each release states its complete contract without depending on an earlier release. (WRITING.SNAPSHOT.003)

Do not add a compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between standards releases. (WRITING.SNAPSHOT.004)

A consumer keeps a pinned release for as long as that consumer chooses, and absorbs every difference when adopting a later release. (WRITING.SNAPSHOT.005)

`WRITING.SNAPSHOT.004` covers standards releases only. A consumer product is a running service, and its own API compatibility, migration, deprecation, and rollback provisions still apply.

`CHANGELOG.md` is the repository release note. The changelog describes the current contract without prescribing a transition path. (WRITING.SNAPSHOT.001)

## Maintainer Review

The maintainer can merge their own pull request after every required check passes and an AI reviewer examines the complete diff.

Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve necessary review evidence.
