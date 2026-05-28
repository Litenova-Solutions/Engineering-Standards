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
2. ... (API acceptance / Integration test)
3. ... (Playwright)

---

## Acceptance Coverage

Map each criterion to executable coverage. Critical criteria MUST have automated coverage or documented manual-only rationale.

| ID | Criterion summary | Risk | Required test type | BDD scenario | Plain API test | Domain/Application test | Manual only |
|:---|:---|:---|:---|:---|:---|:---|:---:|
| AC-001 | | Critical / High / Medium / Low | BDD / API acceptance / Integration / Domain / Application / Playwright | | | | |
| AC-002 | | | | | | | |

**BDD decision:** No BDD / Plain API acceptance / BDD acceptance (justify in Risk or Required test type column).

Policy:

- Critical acceptance criteria MUST have executable coverage.
- Business-readable criteria SHOULD have BDD scenario coverage when an acceptance test project exists.
- Validation matrices SHOULD use Application validator tests or parameterized API tests, not Gherkin.
- Domain invariants SHOULD use Domain tests; MAY add one API acceptance scenario proving enforcement through the API.

---

## Out of Scope

Explicit exclusions to prevent scope creep.
