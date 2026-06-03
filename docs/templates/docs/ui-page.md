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

Inherits the app shell at `docs/ui/{app}/shell.md` (copy from [ui-shell.md](ui-shell.md)).

---

## Tests

| Type | Location | Traces to |
|:---|:---|:---|
| Playwright | `{e2e spec path}` or `Not yet added` | Rows in linked test specs below |
| Vitest | `{unit test path}` or `Not yet added` | Zod schema or hook for this page |

### Acceptance criteria coverage

For each use case on this page, map UI-visible outcomes to test spec rows (not duplicate full tables here).

| Use case | Test spec | AC rows exercised on this page |
|:---|:---|:---|
| `{use-case}` | [`{use-case}.tests.md`](../../domain/{feature}/{use-case}.tests.md) | AC-001, AC-002 |

Add a Playwright spec comment header: `// Page: docs/ui/{app}/pages/{page}.md`.

In consuming projects, copy this template from the standards submodule (for example `{project}/standards/docs/templates/docs/ui-page.md`).
