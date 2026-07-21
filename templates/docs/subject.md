---
{
  "kind": "subject",
  "id": "__SUBJECT__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "applicableExtensions": []
}
---
# __TITLE__

## Purpose

State the business topic and the outcomes its Use cases support.

## Actors

- Name each actor and responsibility in this Subject.

## Terms

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| `__TERM__` | Define the term in business language. | List words that must not replace it. |

## Aggregate ownership

| Aggregate | Owns | References by ID | Aggregate Rules | Commands |
|:---|:---|:---|:---|:---|
| `__AGGREGATE__` | List state changed atomically. | List other Aggregate IDs. | `INV-__SUBJECT_ID__-01` | Link Command Use cases. |

Write `None` when the Subject has no Aggregate. A Subject may contain multiple related Aggregates. Each Aggregate remains one transaction boundary.

## Business states

| Aggregate | State | Meaning | Required facts |
|:---|:---|:---|:---|
| `__AGGREGATE__` | `__STATE__` | State the business meaning. | List facts required in this state. |

Remove this section when no business lifecycle exists. Do not prescribe a C# representation here.

## Technical state mapping

| Aggregate | Business state | Code representation |
|:---|:---|:---|
| `__AGGREGATE__` | `__STATE__` | `__STATE_TYPE_OR_ENUM__` |

Add this section only when implementation exists.

## Transitions

| Aggregate | From state | Business action | To state | Aggregate Rules | Use case |
|:---|:---|:---|:---|:---|:---|
| `__AGGREGATE__` | `__FROM_STATE__` | `__ACTION__` | `__TO_STATE__` | `INV-__SUBJECT_ID__-01` | Link the Command specification. |

## Aggregate Rules

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-__SUBJECT_ID__-01` | State one rule. | Name the Aggregate or Value Object. | Name the rejected outcome. |

Do not renumber or reuse an accepted Aggregate Rule ID.

## Events and Follow-ups

| Event reference | Code type | Business meaning | Follow-up | Owner | Delivery |
|:---|:---|:---|:---|:---|:---|
| `__SUBJECT__.__PAST_TENSE_EVENT__` | `__PAST_TENSE_EVENT_TYPE__` | State what completed. | State expected behavior or `None`. | Name the owner. | `atomic`, `durable`, `rebuildable`, or `best-effort-optional` |

## Use cases

| Use case | Operation | Delivery status |
|:---|:---|:---|
| `__SUBJECT__.__USE_CASE__` | `command` or `query` | `planned` or `verified` |

## Rule and transition coverage

| Rule or transition | Use cases | Acceptance criteria |
|:---|:---|:---|
| `INV-__SUBJECT_ID__-01` | Link each owning Use case. | List stable acceptance IDs. |

## Dependencies

- Link another Subject only when this Subject requires its public behavior.

## Open modeling questions

- Record an unresolved business definition that blocks a state, transition, Aggregate Rule, or Event.
