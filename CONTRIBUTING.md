# Contributing

Submit changes through a branch and pull request against `main`. Direct pushes to `main` are outside the release process.

## Authoring Contract

Follow the [authoring standard](docs/core/authoring.md) for every active standards page, template, instruction, and release note.

Keep one canonical source for each provision, version, extension, and technical fact. Link to that source instead of copying it. (standards/rule/core-principles.keep-one-authored-source)

## Current Snapshot

Treat active standards as the complete current contract. (standards/rule/core-authoring.validate-current-standards-material)

Do not retain history-specific paths, IDs, terminology, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (standards/rule/core-authoring.exclude-historical-transition-material)

Keep release context in `CHANGELOG.md` and Git history. The repository validator evaluates current material only. (standards/rule/core-authoring.validate-current-standards-material)

## Provision Changes

A new or changed Standard includes:

- One atomic Requirement with one provision ID under the page scope the manifest declares. (standards/rule/core-authoring.use-the-declared-identifier-grammar)
- An informative example when `standards/rule/core-authoring.attach-examples-to-their-provisions` requires one.
- One exact Verification row.
- A current changelog entry.

Assign a new ID to each changed Standard assertion. (standards/rule/core-authoring.write-atomic-standards-provisions)

A provision ID uses `standards/<kind>/<page>.<heading-slug>`. Keep a replaceable default under a `## Conventions` heading. (standards/rule/core-authoring.use-the-declared-identifier-grammar, standards/rule/core-authoring.identify-actionable-conventions)

Place a new page at `docs/<area>/<page>.md`, where each part is one lowercase word. The path states the provision scope. (standards/rule/core-authoring.use-the-declared-identifier-grammar)

Name the owning page in the identifier as `<area>-<stem>`. Two pages with one stem in two areas stay distinct. (standards/rule/core-authoring.name-the-owning-page-in-the-identifier)

Do not add aliases, replacement maps, alternate paths, compatibility terms, or transition material. (standards/rule/core-authoring.exclude-historical-transition-material)

An actionable Convention includes one convention ID, Default statement, Replacement statement, and Verification row.

### Amend an active provision

An active provision ID identifies its current assertion, so amending the assertion is not an edit in place. (standards/rule/core-authoring.write-atomic-standards-provisions)

Amend a Standard in this order:

1. Decide whether the assertion changes. A reworded Requirement that obliges the same action keeps its ID. A Requirement that obliges a different action, a wider scope, or a different actor takes a new ID.
2. Write the new provision with the next free number under its topic. Do not reuse the retired number.
3. Delete the retired provision, its Agent Summary citation, and its Verification row. Leave no alias, no replacement map, and no note that the number moved. (standards/rule/core-authoring.exclude-historical-transition-material)
4. Update each page that cited the retired ID. `docs/reference/provisions.md` resolves every citation to its page, and the repository validator reports a citation with no owner.
5. Update the validator case that covers the rule, in both directions.
6. Record the change in `CHANGELOG.md` as the current contract, without a transition path.

A consumer that pinned the earlier release keeps that release and its own overrides. Adopting this release means re-reading the amended provision and any override that named the retired ID. (standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves, standards/rule/core-authoring.record-the-reviewed-standards-release)

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
- Run every fixture suite: the standards, UI, consumer, and parity cases.
- Run `node tools/generate-provisions.mjs` and commit the regenerated index. (standards/rule/core-authoring.regenerate-the-provision-index)
- Update the changelog.
- Run `git diff --check`.

A changed validator rule includes one passing case and one failing case. A rule without both cases is unverified.

Every authoring rule is an error. `WARNING_DIAGNOSTIC_CODES` is empty and holds a rule only while a newly added check is burned down against existing content.

The pull request checklist records the manual active-voice, terminology, atomicity, example, and quality review.

## Release Numbering

The [authoring standard](docs/core/authoring.md) owns the release model, including the meaning of each version number. This section projects that model for contributors.

Each release states its complete contract without depending on an earlier release. (standards/rule/core-authoring.publish-each-release-as-a-complete-contract)

Do not add a compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between standards releases. (standards/rule/core-authoring.exclude-cross-release-compatibility-work)

A consumer keeps a pinned release for as long as that consumer chooses, and absorbs every difference when adopting a later release. (standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves)

A consumer records the release it reviewed in `reviewedStandardsVersion`, so adopting a later release is an explicit act. (standards/rule/core-authoring.record-the-reviewed-standards-release)

`standards/rule/core-authoring.exclude-cross-release-compatibility-work` covers standards releases only. A consumer product is a running service, and its own API compatibility, migration, deprecation, and rollback provisions still apply.

`CHANGELOG.md` is the repository release note. The changelog describes the current contract without prescribing a transition path. (standards/rule/core-authoring.validate-current-standards-material)

## Maintainer Review

The maintainer can merge their own pull request after every required check passes and an AI reviewer examines the complete diff.

Resolve each actionable review comment before merge. Use squash merge unless separate commits preserve necessary review evidence.
