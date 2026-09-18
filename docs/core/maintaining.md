# Maintaining the Standards

## Intent

This page is the maintainer's manual for the standards repository itself. It states how a provision moves through its lifecycle. It states how an identifier rename is handled. It states how cross-area citations are written. It states how a standards release is published and how a consumer migrates between releases.

The page exists because `standards/rule/core-authoring.publish-each-release-as-a-complete-contract` requires each standards release to state its complete contract. A maintainer who follows those rules needs the procedures this page states.

## Agent Summary {#agent-summary}

- State the provision lifecycle. (standards/rule/core-maintaining.state-the-provision-lifecycle)
- Replace every citation on a rename. (standards/rule/core-maintaining.replace-every-citation-on-a-rename)
- Cite cross-area provisions by identifier. (standards/rule/core-maintaining.cite-cross-area-provisions-by-identifier)
- Publish a standards release from a tag. (standards/rule/core-maintaining.publish-a-standards-release-from-a-tag)
- Migrate a consumer to a new release. (standards/rule/core-maintaining.record-the-release-a-consumer-adopts)

## Concepts

### The provision lifecycle

A provision passes through three states.

| State | Meaning |
|:---|:---|
| draft | The provision text is being written. |
| active | The provision is cited from a Validator, a Verification row, or an Agent Summary. |
| retired | The provision has been replaced or removed. |

A provision never goes from active back to draft. A retirement is permanent.

### The identifier

Every provision ID is `standards/<kind>/<page>.<heading-slug>`, defined by `standards/rule/core-authoring.use-the-declared-identifier-grammar`. A rename replaces the identifier outright. The repository keeps no alias and no mapping from an old identifier.

### Cross-area citations

A citation from one page to another names the cited provision by its current identifier.

### The standards release

A standards release is a tagged snapshot of the repository. The version in `standards.manifest.json` matches the highest git tag. The changelog entry appears above the previous releases. The `reviewedStandardsVersion` in the consumer template is the latest released tag.

### The consumer migration

A consumer migrates between releases by reading the release's changelog entry, updating the citations whose identifiers moved, and recording the new version in `reviewedStandardsVersion`.

## Standards

### State the provision lifecycle (standards/rule/core-maintaining.state-the-provision-lifecycle)

**Requirement:** A provision MUST pass through three states: draft, active, retired.

**Rationale:** The three states tell a maintainer what a provision's identifier means. An active identifier is stable. A retired identifier is gone.

**Example:** A provision is added in draft. When cited from a Verification row it becomes active. When its assertion is folded into a richer rule, the provision is retired.

### Replace every citation on a rename (standards/rule/core-maintaining.replace-every-citation-on-a-rename)

**Requirement:** A provision rename MUST replace every citation of the old identifier in one change.

**Rationale:** A citation names the provision it resolves to. An old identifier left behind names nothing, and the repository keeps no alias to resolve it.

**Example:** Renaming a provision changes its heading, its ID, every Agent Summary bullet, every Verification row, and every cross-page citation together.

### Cite cross-area provisions by identifier (standards/rule/core-maintaining.cite-cross-area-provisions-by-identifier)

**Requirement:** A cross-area citation MUST name the cited provision by its current identifier.

**Rationale:** A citation is the reader's path from one rule to another. The identifier is the path.

### Publish a standards release from a tag (standards/rule/core-maintaining.publish-a-standards-release-from-a-tag)

**Requirement:** A standards release MUST correspond to a git tag.

**Rationale:** A git tag is the only durable artifact that names a release. The manifest version, the changelog entry, and the tag are three views of the same fact. The tag is the canonical one.

### Record the release a consumer adopts (standards/rule/core-maintaining.record-the-release-a-consumer-adopts)

**Requirement:** A consumer migrating to a new release MUST record the new version in its `reviewedStandardsVersion`.

**Rationale:** The `reviewedStandardsVersion` field is the consumer's declaration that it has reviewed the new contract. The declaration is explicit so adopting a release is an act, not a silent default.

## Conventions

None.

## Reference example

This informative example demonstrates `standards/rule/core-maintaining.state-the-provision-lifecycle`, `standards/rule/core-maintaining.replace-every-citation-on-a-rename`, and `standards/rule/core-maintaining.publish-a-standards-release-from-a-tag`.

### Step one, adding a provision

A maintainer writes a new provision on a page. The provision is in `draft` until a Validator, Verification row, or Agent Summary cites it.

```text
### State the rule (standards/rule/page.state-the-rule)

**Requirement:** A consumer MUST do the thing.
**Rationale:** The thing matters.
```

The validator finds the new provision uncited. The maintainer adds a Verification row that names the rule. The provision moves to `active`.

### Step two, renaming

A rule changes. The maintainer updates the heading, the identifier, and every citation in one change.

### Step three, releasing

The maintainer checks the highest git tag with `git describe --tags --abbrev=0`. The tag is the next release. The manifest version is set, the changelog entry is added, and the commit is tagged.

### Step four, a consumer migrates

A consumer reads the new release's changelog entry, updates the citations whose identifiers moved, and records the new version in `reviewedStandardsVersion`.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-maintaining.state-the-provision-lifecycle | inspection | `ProvisionLifecycle` reports every active provision. |
| standards/rule/core-maintaining.replace-every-citation-on-a-rename | static | `node tools/validate-standards.mjs` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| standards/rule/core-maintaining.cite-cross-area-provisions-by-identifier | static | `CitationResolver` rejects an unknown citation. |
| standards/rule/core-maintaining.publish-a-standards-release-from-a-tag | inspection | `ReleaseCheck` confirms the manifest version matches the tag. |
| standards/rule/core-maintaining.record-the-release-a-consumer-adopts | inspection | `ConsumerCheck` reads each consumer's `reviewedStandardsVersion`. |
