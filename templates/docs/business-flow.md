---
{
  "kind": "business-flow",
  "id": "__BUSINESS_FLOW__",
  "recordStatus": "current",
  "deliveryStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "releaseRole": "primary",
  "useCases": ["__SUBJECT__.__USE_CASE__"],
  "applicableExtensions": []
}
---
# __BUSINESS_FLOW_TITLE__

## Outcome

State one observable product outcome.

## Starting and completion conditions

- Starting condition: State what allows the Business Flow to begin.
- Completion condition: State what an actor or operator observes at success.

## Actors

- Name each actor involved in the complete flow.

## Connected Use cases

| Step | Use-case ID | Subject | Actor or trigger | Observable result |
|:---|:---|:---|:---|:---|
| 1 | `__SUBJECT__.__USE_CASE__` | `__SUBJECT__` | `__ACTOR_OR_TRIGGER__` | State the result. |

Link Use-case specifications. Do not copy their inputs, rules, failures, or acceptance criteria.

## Branches and waiting points

| After step | Condition | Next Use case or wait | Owner |
|:---|:---|:---|:---|
| 1 | State the condition. | Link the next Use case, Workflow, Event, or time. | Name the actor or system owner. |

## Automated Workflows

- Link each Workflow that advances part of this Business Flow. Write `None` when actors invoke every step.

## Failure and recovery paths

| Failure point | Observable effect | Recovery path | Owner |
|:---|:---|:---|:---|
| Name the step. | State what is visible. | Link a Use case, Workflow, or runbook. | Name the owner. |

## Flow checks

- [FC-__BUSINESS_FLOW_ID__-01] Replace with one end-to-end outcome checked through a public boundary.

## Release scope

State what this flow includes, which supporting flows it requires, and what remains excluded.
