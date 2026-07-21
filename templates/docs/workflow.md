---
{
  "kind": "workflow",
  "id": "__WORKFLOW__",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "participatingModules": ["__MODULE__"],
  "applicableExtensions": []
}
---
# __WORKFLOW_TITLE__

## Business purpose

State the system-controlled result and link each end-to-end flow that uses it.

## Ownership

- Business owner: `__OWNER__`.
- Workflow state owner: Name the Application and Infrastructure boundary.
- Participating modules: List module IDs.

## Start and completion

- Starting event, Command, or schedule: `__START__`.
- Completion condition: State the durable completed outcome.
- Failure condition: State when automatic progress stops.

## Workflow states

| State | Meaning | Required facts |
|:---|:---|:---|
| `__STATE__` | State the progress meaning. | List correlation and result facts. |

## Progression

| Current state | Received event reference or trigger | Command issued | Next state |
|:---|:---|:---|:---|
| `__STATE__` | `__MODULE__.__EVENT__` | `__MODULE__.__USE_CASE__` | `__NEXT_STATE__` |

Commands reference documented Command use cases. Events use stable business names and link to their owning module.

## Delivery and duplicate handling

- Idempotency key: State the stable key.
- Duplicate event behavior: State the result.
- Duplicate Command behavior: State the result.
- Outgoing delivery: State the outbox or scheduler boundary.

## Retries and timeouts

| Step | Retry horizon | Timeout | Exhausted result |
|:---|:---|:---|:---|
| Name the step. | State attempts and delay. | State the deadline. | State failure state and alert. |

## Compensation and operator actions

| Condition | Compensation or operator action | Owner | Verification |
|:---|:---|:---|:---|
| State the condition. | Link the Command or runbook. | Name the owner. | State the check. |

## Implementation mapping

```text
Application/Workflows/__WORKFLOW_PASCAL__/
  __WORKFLOW_PASCAL__Workflow.cs
  __WORKFLOW_PASCAL__WorkflowState.cs
  __WORKFLOW_PASCAL__WorkflowOrchestrator.cs
  Advance__WORKFLOW_PASCAL__WorkflowCommand.cs
  Advance__WORKFLOW_PASCAL__WorkflowCommandHandler.cs
```

## Verification

- Test successful progression, duplicate delivery, retry exhaustion, timeout, compensation, operator recovery, and restart from persisted progress.
