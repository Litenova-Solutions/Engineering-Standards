# Maintaining the Standards

## Intent

This page is the maintainer's manual for the standards repository itself. It states how a provision moves through its lifecycle. It states how an identifier rename is handled. It states how citations are written. It states how a standards release is published.

The page exists because `standards/rule/core-authoring.publish-each-release-as-a-complete-contract` requires each standards release to state its complete contract. A maintainer who follows those rules needs the procedures this page states.

## Agent Summary {#agent-summary}

- State the provision lifecycle. (standards/rule/core-maintaining.state-the-provision-lifecycle)
- Replace every citation on a rename. (standards/rule/core-maintaining.replace-every-citation-on-a-rename)
- Publish a standards release from a tag. (standards/rule/core-maintaining.publish-a-standards-release-from-a-tag)

## Concepts

### The provision lifecycle

A provision passes through three states.

| State | Meaning |
|:---|:---|
| draft | The provision text is being written. |
| active | The provision is cited from a validator case, a Verification row, or an Agent Summary. |
| retired | The provision has been replaced or removed. |

A provision never goes from active back to draft. A retirement is permanent.

### The identifier

Every provision ID is `standards/<kind>/<page>.<heading-slug>`, defined by `standards/rule/core-authoring.use-the-declared-identifier-grammar`. A rename replaces the identifier outright. The repository keeps no alias and no mapping from an old identifier.

### Citations

A citation from one page to another names the cited provision by its current identifier. A citation on the same page uses the same form.

### The standards release

A standards release is a tagged snapshot of the repository. The version in `standards.manifest.json` matches the tag with the highest version number. The changelog entry appears above the previous releases. The `reviewedStandardsVersion` in the consumer template is the latest released tag.

## Standards

### State the provision lifecycle (standards/rule/core-maintaining.state-the-provision-lifecycle)

**Requirement:** A maintainer MUST keep each provision in exactly one of three states: draft, active, or retired.

**Rationale:** The three states tell a maintainer what a provision's identifier means. An active identifier is stable. A retired identifier is gone.

**Example:** A provision is added in draft. When cited from a Verification row it becomes active. When its assertion is folded into a richer rule, the provision is retired.

### Replace every citation on a rename (standards/rule/core-maintaining.replace-every-citation-on-a-rename)

**Requirement:** A provision rename MUST replace every citation of the old identifier in one change.

**Rationale:** A citation names the provision it resolves to. An old identifier left behind names nothing, and the repository keeps no alias to resolve it. Citations always use current identifiers.

**Example:** Renaming a provision changes its heading, its ID, every Agent Summary bullet, every Verification row, and every cross-page citation together.

### Publish a standards release from a tag (standards/rule/core-maintaining.publish-a-standards-release-from-a-tag)

**Requirement:** A standards release MUST set one new git tag and carry it in the manifest version, the changelog entry, and the consumer template version.

**Rationale:** A git tag is the only durable artifact that names a release. The new tag carries the next version number. The manifest version, the changelog entry, and the tag are three views of the same fact.

## Conventions

None.

## Reference example

This informative example demonstrates `standards/rule/core-maintaining.state-the-provision-lifecycle`, `standards/rule/core-maintaining.replace-every-citation-on-a-rename`, and `standards/rule/core-maintaining.publish-a-standards-release-from-a-tag`.

### Step one, adding a provision

A maintainer writes a new provision on a page. The provision is in `draft` until a validator case, Verification row, or Agent Summary cites it.

```text
### State the rule (standards/rule/page.state-the-rule)

**Requirement:** A consumer MUST do the thing.
**Rationale:** The thing matters.
```

The validator finds the new provision uncited. The maintainer adds a Verification row that names the rule. The provision moves to `active`.

### Step two, renaming

A rule changes. The maintainer updates the heading, the identifier, and every citation in one change.

### Step three, releasing

The maintainer checks the tag with the highest version number with `git describe --tags --abbrev=0`. The tag is the next release. The manifest version is set, the changelog entry is added, and the commit is tagged.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/core-maintaining.state-the-provision-lifecycle | guidance | Is every provision in exactly one lifecycle state, with retired identifiers cited nowhere? |
| standards/rule/core-maintaining.replace-every-citation-on-a-rename | checkable | `node tools/validate-standards.mjs` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| standards/rule/core-maintaining.publish-a-standards-release-from-a-tag | guidance | Does one new tag carry the next version across the manifest, the changelog, and the template? |
