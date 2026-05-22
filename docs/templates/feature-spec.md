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

| Event | Raised when | Payload | Outbox required |
|:---|:---|:---|:---:|
| `{Aggregate}{PastTenseVerb}` | | | Yes / No |

### Reactions (if any)

| Event | Handler | Side effect interface | Notes |
|:---|:---|:---|:---|
| `{EventName}` | `{HandlerName}` | `I{NarrowInterface}` | |

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

| Method | Path | Auth | Rate limit | Idempotency-Key | Notes |
|:---|:---|:---|:---|:---|:---|
| POST | `/api/v1/...` | RequireAuthenticatedUser | authenticated-api | Yes / No | |

---

## Persistence and Migrations

| Change | Migration strategy | Rollback notes |
|:---|:---|:---|
| New table `{table}` | Expand | Drop table in down migration |

---

## Background Jobs / Worker (if any)

| Job | Trigger | Idempotent | Notes |
|:---|:---|:---|:---|
| | Outbox / schedule | Yes / No | |

---

## UI Flows

### {Screen name}

- Route: `app/(main)/...`
- Feature entry: `features/{feature}/...`
- States: loading, empty, error, loaded (describe each)
- Mutations: Server Action or `useMutation` (justify choice)

---

## Realtime (if any)

| Event | Client behavior |
|:---|:---|
| | Invalidate query key / `router.refresh()` |

---

## Acceptance Criteria

1. Given ... when ... then ...
2. ...

Map each criterion to test type: Domain / Application / Integration / Playwright.

---

## Inventories to Update

- [ ] `docs/domain/ubiquitous-language.md`
- [ ] `docs/domain/aggregate-inventory.md`
- [ ] `docs/domain/feature-inventory.md`
- [ ] `docs/domain/exception-inventory.md`
- [ ] `docs/domain/read-model-inventory.md`
- [ ] `docs/domain/frontend-feature-inventory.md`
- [ ] `docs/domain/frontend-api-endpoints.md`

---

## Out of Scope

List explicit exclusions to prevent scope creep.

---

## Open Questions

| Question | Owner | Resolution |
|:---|:---|:---|
| | | |
