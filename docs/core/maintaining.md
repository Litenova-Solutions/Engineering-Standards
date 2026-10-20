# Maintaining the Standards

## Intent

This page is the maintainer's manual for the LiteSpec repository itself. It states how a provision moves through its lifecycle. It states how an identifier rename is handled. It states how citations are written. It states how a LiteSpec release is published.

The page exists because `litespec/core/authoring#publish-each-release-as-a-complete-contract` requires each LiteSpec release to state its complete contract. A maintainer who follows those rules needs the procedures this page states.

## Concepts

### The provision lifecycle

A provision passes through three states.

| State | Meaning |
|:---|:---|
| draft | The provision text is being written. |
| active | The provision is cited from a validator case or a Verification row. |
| retired | The provision has been replaced or removed. |

A provision never goes from active back to draft. A retirement is permanent.

### The identifier

Every provision ID is `litespec/<page>#<slug>`, defined by `litespec/core/authoring#use-the-declared-identifier-grammar`. A rename replaces the identifier outright. The repository keeps no alias and no mapping from an old identifier.

### Citations

A citation from one page to another names the cited provision by its current identifier. A citation on the same page uses the same form.

### The LiteSpec release

A LiteSpec release is a tagged snapshot of the repository. Between releases, `litespec.manifest.json`, the topmost changelog entry, and the consumer template's `reviewedLiteSpecVersion` name the release being prepared. The new tag carries that version number and makes the release current. Each schema `$id` names that release under `https://litespec.dev/<version>/schemas/`, so a pinned consumer keeps resolving the shapes it reviewed.

## Standards

### State the provision lifecycle

**Requirement:** A maintainer MUST keep each provision in exactly one of three states: draft, active, or retired.

**Rationale:** The three states tell a maintainer what a provision's identifier means. An active identifier is stable. A retired identifier is gone.

**Example:** A provision is added in draft. When cited from a Verification row it becomes active. When its assertion is folded into a richer rule, the provision is retired.

### Replace every citation on a rename

**Requirement:** A provision rename MUST replace every citation of the old identifier in one change.

**Rationale:** A citation names the provision it resolves to. An old identifier left behind names nothing, and the repository keeps no alias to resolve it. Citations always use current identifiers.

**Example:** Renaming a provision changes its heading, its ID, its Verification row, and every citation together.

### Publish a LiteSpec release from a tag

**Requirement:** A LiteSpec release MUST carry the highest git tag in the manifest version, the changelog entry, and the consumer template version.

**Rationale:** A git tag is the only durable artifact that names a release. The highest tag is the current release. The manifest version, the changelog entry, and the template version name that release.

## Conventions

None.

## Reference example

This informative example demonstrates `litespec/core/maintaining#state-the-provision-lifecycle`, `litespec/core/maintaining#replace-every-citation-on-a-rename`, and `litespec/core/maintaining#publish-a-litespec-release-from-a-tag`.

### Step one, adding a provision

A maintainer writes a new provision on a page. The provision is in `draft` until a validator case or a Verification row cites it.

```text
### State the rule
**Requirement:** A consumer MUST do the thing.
**Rationale:** The thing matters.
```

The validator finds the new provision uncited. The maintainer adds a Verification row that names the rule. The provision moves to `active`.

### Step two, renaming

A rule changes. The maintainer updates the heading, the identifier, and every citation in one change.

### Step three, releasing

The maintainer checks the tag with the highest version number with `git describe --tags --abbrev=0`. The tag is the current release. The manifest version names the release being prepared, the changelog entry is added, and the commit is tagged.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/maintaining#state-the-provision-lifecycle | guidance | Is every provision in exactly one lifecycle state, with retired identifiers cited nowhere? |
| litespec/core/maintaining#replace-every-citation-on-a-rename | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/maintaining#publish-a-litespec-release-from-a-tag | guidance | Does one new tag carry the current version across the manifest, the changelog, and the template? |
