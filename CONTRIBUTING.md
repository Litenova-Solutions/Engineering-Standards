# Contributing

Submit changes through a branch and pull request against `main`. Direct pushes to `main` are outside the release process.

## Authoring Contract

Follow the [authoring standard](docs/core/authoring.md) for every active standards page, template, instruction, and release note.

Keep one canonical source for each provision, version, extension, and technical fact. Link to that source instead of copying it. (litespec/core/principles#keep-one-authored-source)

## Current Snapshot

Treat active standards as the complete current contract. (litespec/core/authoring#validate-current-standards-material)

Do not retain history-specific paths, IDs, terminology, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (litespec/core/authoring#exclude-historical-transition-material)

Keep release context in `CHANGELOG.md`, the `changelog/` archives, and Git history. The repository validator evaluates current material only. (litespec/core/authoring#validate-current-standards-material)

## Provision Changes

A new or changed Standard includes:

- One atomic Requirement with one provision ID under the page scope the manifest declares. (litespec/core/authoring#use-the-declared-identifier-grammar)
- An informative example when `litespec/core/authoring#attach-examples-to-their-provisions` requires one.
- One exact Verification row with the checkable or guidance mark.
- A current changelog entry.

Assign a new ID to each changed Standard assertion. (litespec/core/authoring#write-atomic-standards-provisions)

A provision ID is `litespec/<page>#<slug>`, computed from the page path and the heading; write no ID in the heading. Keep a replaceable default under a `## Conventions` heading. (litespec/core/authoring#use-the-declared-identifier-grammar, litespec/core/authoring#identify-actionable-conventions)

Place a new page where it applies: a principle in its area folder, a realization in its stack folder, such as `docs/backend/dotnet/`. The path states the provision scope. (litespec/core/authoring#use-the-declared-identifier-grammar)

The page segment of an ID is the page path, so two pages never share one. (litespec/core/authoring#name-the-owning-page-in-the-identifier)

Do not add aliases, replacement maps, alternate paths, compatibility terms, or transition material. (litespec/core/authoring#exclude-historical-transition-material)

An actionable Convention includes one convention ID, Default statement, Replacement statement, and Verification row.

### Amend an active provision

An active provision ID identifies its current assertion, so amending the assertion is not an edit in place. (litespec/core/authoring#write-atomic-standards-provisions)

Amend a Standard in this order:

1. Decide whether the assertion changes. A reworded Requirement that obliges the same action keeps its ID. A Requirement that obliges a different action, a wider scope, or a different actor takes a new ID.
2. Write the new provision under a new heading on its page. Do not reuse the retired heading.
3. Delete the retired provision, its Agent Summary citation, and its Verification row. Leave no alias, no replacement map, and no note that the identifier moved. (litespec/core/authoring#exclude-historical-transition-material)
4. Update each page that cited the retired ID. `docs/reference/provisions.md` resolves every citation to its page, and the repository validator reports a citation with no owner.
5. Update the validator case that covers the rule, in both directions.
6. Record the change in `CHANGELOG.md` as the current contract, without a transition path.

A consumer that pinned the earlier release keeps that release and its own exceptions. Adopting this release means re-reading the amended provision and any exception that named the retired ID. (litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves, litespec/core/authoring#record-the-reviewed-litespec-release)

## Extension Changes

An extension page declares Activation, Baseline relationship, Agent Summary, Standards, Conventions, Dependencies, and Verification.

The extension document names each baseline provision it replaces. The manifest records its path, activation scope, replaced provisions, and switched-on record types.

Do not create a separate extension descriptor. The Markdown page and manifest entry form the extension contract.

## Required Review

Before review:

- Inspect changed links, anchors, provision IDs, and evidence rows.
- Confirm manifest paths and `#agent-summary` anchors.
- Confirm extension declarations match the manifest.
- Validate the two tracked schema consumers.
- Update affected templates and validator cases.
- Run `dotnet test --solution LiteSpec.slnx` and the pattern library check.
- Run `litespec provisions` and commit the regenerated index. The [command index](docs/tools/README.md) states how `litespec` runs. (litespec/core/authoring#regenerate-the-provision-index)
- Update the changelog.
- Run `git diff --check`.

A changed validator rule includes one passing case and one failing case. A rule without both cases is unverified.

Every authoring rule is an error. `WARNING_DIAGNOSTIC_CODES` is empty and holds a rule only while a newly added check is burned down against existing content.

The pull request checklist records the manual active-voice, terminology, atomicity, example, and quality review.

## Release Numbering

The [authoring standard](docs/core/authoring.md) owns the release model, including the meaning of each version number. This section projects that model for contributors.

Each release states its complete contract without depending on an earlier release. (litespec/core/authoring#publish-each-release-as-a-complete-contract)

Do not add a compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between LiteSpec releases. (litespec/core/authoring#exclude-cross-release-compatibility-work)

A consumer keeps a pinned release for as long as that consumer chooses, and absorbs every difference when adopting a later release. (litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves)

A consumer records the release it reviewed in `reviewedLiteSpecVersion`, so adopting a later release is an explicit act. (litespec/core/authoring#record-the-reviewed-litespec-release)

`litespec/core/authoring#exclude-cross-release-compatibility-work` covers LiteSpec releases only. A consumer product is a running service, and its own API compatibility, migration, deprecation, and rollback provisions still apply.

`CHANGELOG.md` is the repository release note for the current major version. When a new major version starts, the previous major version's entries move to `changelog/v<major>.md`, linked from the top of `CHANGELOG.md`. The changelog describes the current contract without prescribing a transition path. An entry states one change and who it affects. It links to the page holding the detail rather than restating it. (litespec/core/authoring#validate-current-standards-material)

## Maintainer Review

The maintainer can merge their own pull request after every required check passes and an AI reviewer examines the complete diff.

Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve necessary review evidence.
