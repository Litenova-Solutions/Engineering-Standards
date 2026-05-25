# {Page title} (`{route}`)

| Field | Value |
|:---|:---|
| App | `apps/{app}` |
| Route | `{route}` |
| Route shell | `{app route file}` |
| Feature entry | `{feature component path(s)}` or `(none — {reason})` or `(inline in route shell)` |
| Last updated | {YYYY-MM-DD} |

---

## Use cases on this page

| Use case | Doc | Notes |
|:---|:---|:---|
| {Use case name} | [use-case.md](../../domain/{feature}/{use-case}.md) | {when visible; optional} |

Add rows for every domain operation this page invokes. Link to domain docs; do not restate invariants here.

---

## Screen states

What the user sees for this route (loading, empty, error). Not aggregate lifecycle (Draft/Published); use **Content modes** below when those change visible actions.

| State | User sees |
|:---|:---|
| Loading | {description} |
| Loaded | {description} |
| Empty | {description} |
| Error | {description} |

---

## Content modes

Optional. Use when aggregate state on the page changes which actions or fields are visible (for example Draft vs Published on an editor). Link to use-case docs for domain rules.

| Mode | User sees |
|:---|:---|
| {Mode} | {description} |

---

## Shell

Inherits [{app} shell](../shell.md).

---

## Tests

| Type | Location |
|:---|:---|
| Playwright | `{e2e spec path}` or `Not yet added` |

Acceptance criteria: link to use-case doc § Acceptance Criteria.

In consuming projects, copy this template from the standards submodule (for example `{project}/standards/docs/templates/ui-page.md`).
