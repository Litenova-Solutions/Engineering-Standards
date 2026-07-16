---
{
  "id": "__CAPABILITY__",
  "status": "planned"
}
---
# __TITLE__

## Purpose

State the business capability and the user outcome it supports.

## Actors

- Name each actor and their responsibility in this capability.

## Terms

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| `__TERM__` | Define the term in business language. | List words that must not replace it. |

## Aggregate boundaries

| Aggregate root | Owns | References by ID | Consistency boundary |
|:---|:---|:---|:---|
| `__AGGREGATE__` | List child entities and values changed atomically. | List other aggregate IDs. | State the invariants protected in one command. |

## State model

### __AGGREGATE__

Every aggregate has an explicit state record hierarchy, including an aggregate with one current state.

| State record | Required data | Business meaning |
|:---|:---|:---|
| `__STATE_RECORD__` | List state-specific values or `None`. | Describe the complete lifecycle state. |

| From state | Business action | To state | Invariant IDs | Use cases |
|:---|:---|:---|:---|:---|
| `__FROM_STATE__` | `__ACTION__` | `__TO_STATE__` | `INV-__CAPABILITY_ID__-01` | Link the command specification. |

## Invariants

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-__CAPABILITY_ID__-01` | State one rule in business language. | Name the aggregate or value object. | Name the domain exception or rejected outcome. |

Do not renumber or reuse an accepted invariant ID.

## Domain events and reactions

| Domain event | Business fact | Known reactions | Delivery requirement |
|:---|:---|:---|:---|
| `__PAST_TENSE_EVENT__` | State what completed. | Link or name each reaction. | State best-effort, durable, or none. |

## Use cases

- Link each use-case specification and state whether it is planned, active, or retired.

## Invariant and transition coverage

| Invariant or transition | Use cases | Acceptance criteria |
|:---|:---|:---|
| `INV-__CAPABILITY_ID__-01` | Link each owning use case. | List stable acceptance IDs. |

## Dependencies

- Link another capability only when this capability requires its public behavior.

## Open modeling questions

- Record an unresolved business definition that blocks a state, transition, invariant, or event. Remove the entry after a human decision updates the model.
