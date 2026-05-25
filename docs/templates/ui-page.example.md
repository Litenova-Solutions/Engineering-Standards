# {Entity} editor (`/{resource}/[id]`)

| Field | Value |
|:---|:---|
| App | `apps/{app}` |
| Route | `/{resource}/[id]` |
| Route shell | `app/(dashboard)/{resource}/[id]/page.tsx` |
| Feature entry | `features/{feature}/{use-case}/{Entity}Form.tsx` |
| Last updated | {YYYY-MM-DD} |

One page composes several domain operations. Domain rules stay in use-case and feature docs; this page doc maps which actions appear when.

---

## Use cases on this page

| Use case | Doc | Visible when |
|:---|:---|:---|
| Update {entity} | [update-{entity}.md](../../domain/{feature}/update-{entity}.md) | Editable state only |
| Publish {entity} | [publish-{entity}.md](../../domain/{feature}/publish-{entity}.md) | Draft — Publish action |
| Delete {entity} | [delete-{entity}.md](../../domain/{feature}/delete-{entity}.md) | When domain allows delete (see use-case doc) |

Do not restate invariants here. Use "Visible when" plus a link to the use-case or feature README.

---

## Screen states

| State | User sees |
|:---|:---|
| Loading | Placeholder while fetching by ID |
| Error | Toast or inline message with API problem detail |

---

## Content modes

| Mode | User sees |
|:---|:---|
| Draft | Editable form and publish/delete actions |
| Published | Read-only content; archive or similar terminal action |

---

## Shell

Inherits [{app} shell](../shell.md).

---

## Tests

| Type | Location |
|:---|:---|
| Playwright | `{e2e spec path}` or `Not yet added` |

Acceptance criteria: see each linked use-case doc § Acceptance Criteria.

See also: project-specific approved examples in consuming repos (for example LitePress `docs/ui/admin/pages/post-editor.md`).
