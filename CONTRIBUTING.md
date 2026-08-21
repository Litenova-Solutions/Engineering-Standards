# Contributing

Submit changes through a branch and pull request against `main`. Direct pushes to `main` are outside the release process.

## Authoring Contract

Follow the [authoring standard](docs/foundations/authoring-standard.md) for every active standards page, template, instruction, and release note.

Keep one canonical source for each provision, version, extension, and technical fact. Link to that source instead of copying it. (CORE.PRINCIPLES.SOURCE.001)

## Current Snapshot

Treat active standards as the complete current contract. (CORE.AUTHORING.SNAPSHOT.001)

Do not retain history-specific paths, IDs, terminology, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (CORE.AUTHORING.SNAPSHOT.002)

Keep release context in `CHANGELOG.md` and Git history. The repository validator evaluates current material only. (CORE.AUTHORING.SNAPSHOT.001)

## Provision Changes

A new or changed Standard includes:

- One atomic Requirement with one rule ID under the page scope the manifest declares. (CORE.AUTHORING.IDENTIFIER.001)
- An informative example when `CORE.AUTHORING.EXAMPLE.001` requires one.
- One exact Verification row.
- A current changelog entry.

Assign a new ID to each changed Standard assertion. (CORE.AUTHORING.REQUIREMENT.001)

A provision ID uses `AREA.PAGE.TOPIC.NNN`. Reserve the `CONVENTION` topic for replaceable defaults. (CORE.AUTHORING.IDENTIFIER.001, CORE.AUTHORING.IDENTIFIER.002)

Register a new page in `idRegistry` before adding its first provision. (CORE.AUTHORING.IDENTIFIER.001)

Register a new topic word in `idRegistry.topics`. Reuse the existing word when one already names the concept. (CORE.AUTHORING.IDENTIFIER.003)

Do not add aliases, replacement maps, alternate paths, compatibility terms, or transition material. (CORE.AUTHORING.SNAPSHOT.002)

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
- Run `node tools/generate-provisions.mjs` and commit the regenerated index. (CORE.AUTHORING.INDEX.001)
- Update the changelog.
- Run `git diff --check`.

A changed validator rule includes one passing case and one failing case. A rule without both cases is unverified.

Every authoring rule is an error. `WARNING_DIAGNOSTIC_CODES` is empty and holds a rule only while a newly added check is burned down against existing content.

The pull request checklist records the manual active-voice, terminology, atomicity, example, and quality review.

## Release Numbering

The [authoring standard](docs/foundations/authoring-standard.md) owns the release model, including the meaning of each version number. This section projects that model for contributors.

Each release states its complete contract without depending on an earlier release. (CORE.AUTHORING.SNAPSHOT.003)

Do not add a compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between standards releases. (CORE.AUTHORING.SNAPSHOT.004)

A consumer keeps a pinned release for as long as that consumer chooses, and absorbs every difference when adopting a later release. (CORE.AUTHORING.SNAPSHOT.005)

A consumer records the release it reviewed in `reviewedStandardsVersion`, so adopting a later release is an explicit act. (CORE.AUTHORING.SNAPSHOT.006)

`CORE.AUTHORING.SNAPSHOT.004` covers standards releases only. A consumer product is a running service, and its own API compatibility, migration, deprecation, and rollback provisions still apply.

`CHANGELOG.md` is the repository release note. The changelog describes the current contract without prescribing a transition path. (CORE.AUTHORING.SNAPSHOT.001)

## Maintainer Review

The maintainer can merge their own pull request after every required check passes and an AI reviewer examines the complete diff.

Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve necessary review evidence.
