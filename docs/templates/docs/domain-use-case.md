<!-- Copy to docs/domain/{feature}/{use-case}.md in the project repository -->
---
doc-type: use-case
feature: {feature}
aggregate: {AggregateName}
operation: {Verb}{Aggregate}
layer-context: [backend.write, backend.read, frontend.form]
conventions: [backend.domainLayer, backend.applicationLayer, backend.apiLayer]
test-spec: {use-case}.tests.md
risk-level: medium
status: active
---
# {Use Case Name}

| Field | Value |
|:---|:---|
| Feature | `{feature}` |
| Status | Active / Deprecated |
| Risk Level | Low / Medium / High |
| Last updated | |

---

## Summary

<!-- One paragraph: business outcome and primary user flow.
Example: Authenticated authors create draft posts with a title and body.
The post appears in the author's draft list immediately after creation. -->

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

## UI

See [`docs/ui/{app}/pages/{page}.md`](../../ui/{app}/pages/{page}.md) when the project uses page composition docs.

Operation-level notes only: loading trigger, empty state source, error mapping. Route, screen states, and mutations belong in the page doc.

---

## Out of Scope

Explicit exclusions to prevent scope creep.

---

## Test Specification

See [`{use-case}.tests.md`]({use-case}.tests.md). Write and update the test spec in the same PR as tests and behavior changes.
