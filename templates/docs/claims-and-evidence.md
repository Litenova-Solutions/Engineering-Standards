---
{
  "kind": "claims-and-evidence",
  "id": "__CLAIMS_RECORD__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __CLAIMS_TITLE__

## Purpose

State the decision, Business Flow, or release condition supported by this record.

## Claims

| Claim ID | Claim | Basis | Evidence | Confidence | Decision impact |
|:---|:---|:---|:---|:---|:---|
| `CLM-01` | State one claim. | `observed`, `calculated`, `inferred`, or `hypothesis` | Link the source or calculation. | State confidence and reason. | State the affected decision or release condition. |

A calculated claim identifies its source observations and formula. A hypothesis names the work required to confirm or reject it.

## Decision conditions

| Condition | Required claims | Owner | Status |
|:---|:---|:---|:---|
| `DECISION-CONDITION-01` | `CLM-01` | `__OWNER__` | `pending`, `met`, or `rejected` |

A condition is not evidence. It references the claims that support a decision.

## Gaps

- State a missing source, conflict, or hypothesis that blocks a decision.

## Verification

State who reviews each source, what makes a claim current, and when the condition may change.
