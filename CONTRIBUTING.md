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

Version numbers identify complete pinned standards contracts. They do not claim Semantic Versioning compatibility.

- Patch releases correct or clarify a narrow contract area.
- Minor releases make one coherent standards evolution.
- Major releases replace supported scope, method, or platform profile.

Release changes require no transition instructions, aliases, or compatibility layers.

Consumers can remain on a pinned release. They can select another release when they choose to adopt its complete contract.

`CHANGELOG.md` is the repository release note. It describes the current contract without prescribing a transition path.

## Maintainer Review

The maintainer can merge their own pull request after every required check passes and an AI reviewer examines the complete diff.

Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve necessary review evidence.
