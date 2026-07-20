# __JOURNEY_TITLE__

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Outcome

State the customer outcome in one sentence. Name the actor, the completed result, and the reason it matters.

## Entry and completion

- Entry condition: State what allows the journey to start.
- Completion condition: State what the actor can observe when the journey succeeds.
- Release boundary: State the smallest complete outcome that may be released.

## Ordered use cases

| Step | Use-case ID | Subject | Actor | Observable result | Status |
|:---|:---|:---|:---|:---|:---|
| 1 | `__SUBJECT__.__USE_CASE__` | `__SUBJECT__` | `__ACTOR__` | State the result. | `planned` |

## Exceptions and recovery

| Step | Failure | Customer result | Retry or recovery owner |
|:---|:---|:---|:---|
| 1 | `__ERROR_CODE__` | State what the actor sees. | Name the actor or operator. |

## Cross-subject coordination

Name the process coordinator when steps span subjects. State which subject owns each invariant and which steps can be retried independently.

## Evidence gates

| Gate | Required evidence | Owner | Status |
|:---|:---|:---|:---|
| `__GATE__` | Link acceptance IDs, tests, operating checks, or decisions. | `__OWNER__` | `planned` |

## Operating impact

State schema, dependency, diagnostic, deployment, support, and recovery changes. Write `None` when no operating change exists.

## Open decisions

- Link a decision record for any unresolved policy, provider, or release choice.
