---
{
  "id": "__SUBJECT__",
  "status": "planned"
}
---
# __TITLE__

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Purpose

State the business subject and the user outcome it supports.

## Actors

- Name each actor and their responsibility in this subject.

## Terms

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| `__TERM__` | Define the term in business language. | List words that must not replace it. |

## Primary aggregate root

Name the aggregate root that owns state changes for this subject. Write `None` for a read-only subject.

| Aggregate root | Owns | References by ID | Consistency boundary |
|:---|:---|:---|:---|
| `__AGGREGATE__` | List child entities and values changed atomically. | List other aggregate IDs. | State the invariants protected in one command. |

The subject is a documentation and navigation boundary. The aggregate root remains the runtime consistency and mutation boundary. Do not introduce `Subject`, `ISubject`, or `SubjectRoot` runtime abstractions.

## State model

### __AGGREGATE__

Every state-changing aggregate has an explicit state record hierarchy, including an aggregate with one current state.

For a read-only subject, write `No domain state model` and remove the aggregate-specific placeholder rows.

| State record | Required data | Business meaning |
|:---|:---|:---|
| `__STATE_RECORD__` | List state-specific values or `None`. | Describe the complete lifecycle state. |

| From state | Business action | To state | Invariant IDs | Use cases |
|:---|:---|:---|:---|:---|
| `__FROM_STATE__` | `__ACTION__` | `__TO_STATE__` | `INV-__SUBJECT_ID__-01` | Link the command specification. |

## Invariants

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-__SUBJECT_ID__-01` | State one rule in business language. | Name the aggregate or value object. | Name the domain exception or rejected outcome. |

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
| `INV-__SUBJECT_ID__-01` | Link each owning use case. | List stable acceptance IDs. |

## Dependencies

- Link another subject only when this subject requires its public behavior.

## Open modeling questions

- Record an unresolved business definition that blocks a state, transition, invariant, or event. Remove the entry after a human decision updates the model.
