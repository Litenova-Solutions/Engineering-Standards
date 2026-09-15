---
{
  "kind": "aggregate",
  "id": "__MODULE__.__AGGREGATE_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "applicableExtensions": []
}
---
# __TITLE__

## Purpose

State what this aggregate root protects and the business decisions it owns. An aggregate is one transaction boundary. It is not the same boundary as its module.

## Scenario

Follow one instance of this root through the states below: what brings it into existence, what happens to it next, and where it ends. Use the people, dates, and amounts from the reference cast record, and name a person rather than a role. This section is informative. The tables below stay authoritative for states, transitions, and invariants.

## Ownership

| Owns | References by ID | Owning module |
|:---|:---|:---|
| List state changed atomically. | List other aggregate IDs. | `__MODULE__` |

The aggregate root is the only external mutation entry point. Child entities change through the root.

## Business states

| State | Meaning | Required facts |
|:---|:---|:---|
| `__STATE__` | State the business meaning. | List facts required in this state. |

List at least one business state, including an aggregate with one current state.

## Technical state mapping

| Abstract state base | Business state | Sealed state record |
|:---|:---|:---|
| `__AGGREGATE__State` | `__STATE__` | `__STATE____AGGREGATE__State` |

Define this mapping before the first Command implementation. Do not use an enum, status string, boolean flags, or nullable lifecycle fields as the aggregate lifecycle representation.

## Transitions

| From state | Business action | To state | Aggregate Invariants | Use case |
|:---|:---|:---|:---|:---|
| `__FROM_STATE__` | `__ACTION__` | `__TO_STATE__` | `INV-__MODULE_ID__-01` | Link the Command specification. |

## Aggregate invariants

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-__MODULE_ID__-01` | Reference the rule defined in the module specification. | Name the aggregate or Value Object. | Name the rejected outcome. |

Invariant IDs stay module-scoped. The module specification defines each rule once. This page references it.

## Events

| Event reference | Code type | Business meaning |
|:---|:---|:---|
| `__MODULE__.__PAST_TENSE_EVENT__` | `__PAST_TENSE_EVENT_TYPE__` | State what completed. |

Event references stay module-scoped. The module specification defines each event once.

## Use cases

| Use case | Operation | Implementation status |
|:---|:---|:---|
| `__MODULE__.__USE_CASE__` | `command` or `query` | `planned`, `implemented`, or `verified` |

## Open modeling questions

- Record an unresolved business definition that blocks a state, transition, aggregate invariant, or event.
