# Maintaining the Standards

## Intent

LiteSpec publishes each release as one complete contract, so the repository holding the standard needs its own operating rules. This page states them: how a provision, one identified rule on a page, moves from draft to active to retired, how a rename replaces every citation of the old name in one change, and how a maintainer publishes a release from a git tag. The rules keep every provision identifier resolvable and every release reproducible from its tag.

## Concepts

### The provision lifecycle

A provision passes through three states.

| State | Meaning |
|:---|:---|
| draft | The provision text is being written and nothing cites it yet. |
| active | A Verification row or a validator case cites the provision. |
| retired | The provision no longer holds and nothing cites it. |

A provision moves from draft to active when its first citation lands, and from active to retired when a richer rule folds its assertion in. It never moves back to draft, and retirement is permanent: a retired identifier stays gone, so a reader who meets one knows it names nothing current.

### The identifier

Every provision ID is `litespec/<page>#<slug>`, computed from the page path and the heading, as `litespec/core/authoring#use-the-declared-identifier-grammar` states. A rename replaces the identifier outright: the repository keeps no alias and no map from the old identifier to the new one. That is why a rename replaces every citation in the same change.

### Citations

A citation names the cited provision by its current identifier, whether the citation sits on the same page or another one. Because no alias exists, a citation that names a retired identifier resolves nowhere, and `litespec validate` reports it.

### The LiteSpec release

A LiteSpec release is a tagged snapshot of the repository, and the highest git tag names the current release. Between releases, three places name the release being prepared: the version in `litespec.manifest.json`, the topmost `CHANGELOG.md` entry, and the consumer template's `reviewedLiteSpecVersion`. Tagging that version number makes it current. Each schema `$id` carries that release under `https://litespec.dev/<version>/schemas/`, so a consumer that pins the release keeps resolving the shapes it reviewed.

## Standards

### State the provision lifecycle

**Requirement:** A maintainer MUST keep each provision in exactly one of three states: draft, active, or retired.

**Rationale:** The three states tell a maintainer what an identifier promises. An active identifier names a rule that holds and that a Verification row or validator case cites. A retired identifier names nothing, so a citation to it is a defect rather than a reference. Without the lifecycle, a half-written provision and a removed one look identical to a cited one.

**Example:** A provision is added in draft. When cited from a Verification row it becomes active. When its assertion is folded into a richer rule, the provision is retired.

### Replace every citation on a rename

**Requirement:** A provision rename MUST replace every citation of the old identifier in one change.

**Rationale:** A heading rename renames the identifier, and the repository keeps no alias to catch stragglers. Every citation the rename misses names a provision that no longer exists, and readers follow it nowhere. Replacing all of them in one change keeps the repository resolvable at every commit.

**Example:** Renaming a provision changes its heading, its ID, its Verification row, and every citation together.

### Publish a LiteSpec release from a tag

**Requirement:** A LiteSpec release MUST carry the highest git tag in the manifest version, the changelog entry, and the consumer template version.

**Rationale:** A git tag is the only durable artifact that names a release: branches move and files change, but the tag stays. Reading the current release from the highest tag gives maintainers, consumers, and tools one shared answer. Writing that version into the manifest, the changelog, and the template in the same release keeps the three from disagreeing.

## Conventions

None.

## Reference example

This informative example demonstrates `litespec/core/maintaining#state-the-provision-lifecycle`, `litespec/core/maintaining#replace-every-citation-on-a-rename`, and `litespec/core/maintaining#publish-a-litespec-release-from-a-tag`.

### Step one, adding a provision

A maintainer writes a new provision on a page. The provision stays in `draft` until a Verification row or a validator case cites it.

```text
### State the rule
**Requirement:** A consumer MUST do the thing.
**Rationale:** The thing matters.
```

The validator reports the new provision as uncited. The maintainer adds the Verification row that names the rule, and the provision becomes `active`.

### Step two, renaming

A rule changes, so the maintainer updates the heading and replaces the identifier and every citation of it in one change. When the change lands, no citation names the old identifier.

### Step three, releasing

The maintainer runs `git describe --tags --abbrev=0` to find the tag with the highest version number. That tag names the current release. The maintainer sets the manifest version, adds the changelog entry, and tags the commit with the new version number.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/maintaining#state-the-provision-lifecycle | guidance | Is every provision in exactly one lifecycle state, with retired identifiers cited nowhere? |
| litespec/core/maintaining#replace-every-citation-on-a-rename | checkable | `litespec validate` emits no `ID_UNKNOWN_REFERENCE` diagnostic. |
| litespec/core/maintaining#publish-a-litespec-release-from-a-tag | guidance | Does one new tag carry the current version across the manifest, the changelog, and the template? |
