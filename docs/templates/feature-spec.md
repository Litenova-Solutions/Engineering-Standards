<!-- Copy to docs/specs/{feature-name}.md in the project repository -->
# Feature Spec: {Feature Name}

| Field | Value |
|:---|:---|
| Status | Draft / Review / Approved |
| Author | |
| Reviewed against glossary | Yes / No |

---

## Summary

One paragraph describing the business outcome and the primary user flow.

---

## Aggregates Affected

| Aggregate | Change type | Notes |
|:---|:---|:---|
| `{AggregateName}` | New / Modified | |

---

## Domain Model

### New or changed types

Describe aggregates, value objects, state transitions, and invariants. Use terms from `docs/domain/ubiquitous-language.md`.

### Domain events

| Event | Raised when | Payload |
|:---|:---|:---|
| `{Aggregate}{PastTenseVerb}` | | |

---

## Commands

| Command | Input | Output | Idempotency required |
|:---|:---|:---|:---:|
| `{Verb}{Aggregate}Command` | | | Yes / No |

### Validation rules (structural)

List rules enforced in command validators, not business rules enforced in aggregates.

---

## Queries

| Query | Filters / pagination | Result shape |
|:---|:---|:---|
| `Get{Aggregate}ByIdQuery` | | |
| `GetAll{Aggregate}sQuery` | PageNumber, PageSize (max 100) | `PagedResult<{Aggregate}Summary>` |

---

## HTTP Endpoints

| Method | Path | Auth | Notes |
|:---|:---|:---|:---|
| POST | `/api/v1/...` | | |

---

## UI Flows

### {Screen name}

- Route: `app/(main)/...`
- Feature entry: `features/{feature}/...`
- States: loading, empty, error, loaded (describe each)
- Mutations: Server Action or `useMutation` (justify choice)

---

## Acceptance Criteria

1. Given ... when ... then ...
2. ...

---

## Out of Scope

List explicit exclusions to prevent scope creep.

---

## Open Questions

| Question | Owner | Resolution |
|:---|:---|:---|
