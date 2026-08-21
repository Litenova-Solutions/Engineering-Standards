---
{
  "kind": "module",
  "id": "__MODULE__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "applicableExtensions": []
}
---
# __TITLE__

## Purpose

State the domain area, its language, and the outcomes its use cases support. A module organizes specifications and code. It is not a transaction or deployment boundary.

## Actors

- Name each actor and responsibility in this module.

## Terms

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| `__TERM__` | Define the term in business language. | List words that do not replace it. |

## Aggregate ownership

| Aggregate | Owns | References by ID | Aggregate Invariants | Commands |
|:---|:---|:---|:---|:---|
| `__AGGREGATE__` | List state changed atomically. | List other aggregate IDs. | `INV-__MODULE_ID__-01` | Link Command use cases. |

Write `None` when the module has no aggregate. A module may contain multiple related aggregates. Each aggregate remains one transaction boundary.

## Business states

| Aggregate | State | Meaning | Required facts |
|:---|:---|:---|:---|
| `__AGGREGATE__` | `__STATE__` | State the business meaning. | List facts required in this state. |

Every aggregate lists at least one business state, including an aggregate with one current state. Remove this section only when the module has no aggregate.

## Technical state mapping

| Aggregate | Abstract state base | Business state | Sealed state record |
|:---|:---|:---|:---|
| `__AGGREGATE__` | `__AGGREGATE__State` | `__STATE__` | `__STATE____AGGREGATE__State` |

Define this mapping before the first Command implementation. Do not use an enum, status string, boolean flags, or nullable lifecycle fields as the aggregate lifecycle representation.

## Transitions

| Aggregate | From state | Business action | To state | Aggregate Invariants | Use case |
|:---|:---|:---|:---|:---|:---|
| `__AGGREGATE__` | `__FROM_STATE__` | `__ACTION__` | `__TO_STATE__` | `INV-__MODULE_ID__-01` | Link the Command specification. |

## Aggregate invariants

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-__MODULE_ID__-01` | State one invariant. | Name the aggregate or Value Object. | Name the rejected outcome. |

Do not renumber or reuse an approved aggregate invariant ID.

## Events and event reactions

| Event reference | Code type | Business meaning | Event reaction | Owner | Delivery |
|:---|:---|:---|:---|:---|:---|
| `__MODULE__.__PAST_TENSE_EVENT__` | `__PAST_TENSE_EVENT_TYPE__` | State what completed. | State caused behavior or `None`. | Name the owner. | `atomic`, `durable`, `rebuildable`, or `best-effort-optional` |

## Use cases

| Use case | Operation | Implementation status |
|:---|:---|:---|
| `__MODULE__.__USE_CASE__` | `command` or `query` | `planned` or `verified` |

## Rule and transition coverage

| Rule or transition | Use cases | Acceptance criteria |
|:---|:---|:---|
| `INV-__MODULE_ID__-01` | Link each owning use case. | List stable acceptance IDs. |

## Dependencies

- Link another module only when this module requires its public behavior.

## Open modeling questions

- Record an unresolved business definition that blocks a state, transition, aggregate invariant, policy, or event.
