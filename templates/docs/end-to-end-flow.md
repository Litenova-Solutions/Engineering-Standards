---
{
  "kind": "end-to-end-flow",
  "id": "__FLOW__",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "releaseRole": "primary",
  "useCases": ["__MODULE__.__USE_CASE__"],
  "applicableExtensions": []
}
---
# __FLOW_TITLE__

## Outcome

State one observable product outcome.

## Starting and completion conditions

- Starting condition: State what allows the end-to-end flow to begin.
- Completion condition: State what an actor or operator observes at success.

## Actors

- Name each actor involved in the complete flow.

## Connected use cases

| Step | Use-case ID | Module | Actor or trigger | Observable result |
|:---|:---|:---|:---|:---|
| 1 | `__MODULE__.__USE_CASE__` | `__MODULE__` | `__ACTOR_OR_TRIGGER__` | State the result. |

Link Use-case specifications. Do not copy their inputs, rules, failures, or acceptance criteria.

## Branches and waiting points

| After step | Condition | Next Use case or wait | Owner |
|:---|:---|:---|:---|
| 1 | State the condition. | Link the next use case, workflow, event, or time. | Name the actor or system owner. |

## Automated workflows

- Link each workflow that advances part of this end-to-end flow. Write `None` when actors invoke every step.

## Failure and recovery paths

| Failure point | Observable effect | Recovery path | Owner |
|:---|:---|:---|:---|
| Name the step. | State what is visible. | Link a use case, workflow, or runbook. | Name the owner. |

## End-to-end tests

- [E2E-__FLOW_ID__-01] Replace with one complete outcome verified through a deployed public boundary.

## Release scope

State what the primary or supporting flow includes, which other flows it requires, and what remains excluded.
