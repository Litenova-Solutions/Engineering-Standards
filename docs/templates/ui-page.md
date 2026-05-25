# {Page title} (`{route}`)

| Field | Value |
|:---|:---|
| App | `apps/{app}` |
| Route | `{route}` |
| Route shell | `{app route file}` |
| Domain entry | `{domain component path(s)}` |

---

## Use cases on this page

| Use case | Doc | Notes |
|:---|:---|:---|
| {Use case name} | [use-case.md](../../domain/{feature}/{use-case}.md) | {when visible, optional} |

Add rows for every domain operation this page invokes. Link to domain docs; do not restate invariants here.

---

## Visible states

| State | User sees |
|:---|:---|
| Loaded | {description} |
| Empty | {description} |
| Error | {description} |

---

## Shell

Inherits [{app} shell](../shell.md).

---

## Tests

| Type | Location |
|:---|:---|
| Playwright | `{e2e spec path}` |

Acceptance criteria: link to use-case doc § Acceptance Criteria.
