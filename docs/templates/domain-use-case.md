<!-- Copy to docs/domain/{feature}/{use-case}.md in the project repository -->
# {Use Case Name}

| Field | Value |
|:---|:---|
| Feature | `{feature}` |
| Status | Active / Deprecated |
| Last updated | |

---

## Summary

One paragraph: business outcome and primary user flow.

---

## Command or Query

| Type | Name | Input | Output | Idempotency |
|:---|:---|:---|:---|:---:|
| Command / Query | `{Verb}{Aggregate}Command` | | | Yes / No |

### Structural validation

Rules enforced in validators, not aggregate invariants.

---

## Domain Behavior

Describe aggregate method(s) invoked and invariants enforced. Reference terms from the feature README in the same folder.

---

## Exceptions

| Exception | When | HTTP status |
|:---|:---:|---:|
| `{ExceptionName}` | | 404 / 409 / 422 |

---

## HTTP Endpoint

| Method | Path | Auth | Rate limit | Idempotency-Key |
|:---|:---|:---|:---|:---:|
| POST | `/api/v1/...` | RequireAuthenticatedUser | authenticated-api | Yes / No |

---

## Persistence (if schema changes)

| Change | Migration strategy |
|:---|:---|
| | Expand |

---

## UI (if applicable)

### Route and entry

- Route: `app/(main)/...`
- Feature entry: `features/{feature}/{use-case}/...`

### States

| State | Behavior |
|:---|:---|
| Loading | |
| Empty | |
| Error | |
| Loaded | |

### Mutations

Server Action or TanStack Query mutation (justify choice).

---

## Acceptance Criteria

1. Given ... when ... then ... (Domain test)
2. ... (Integration test)
3. ... (Playwright)

---

## Out of Scope

Explicit exclusions to prevent scope creep.
