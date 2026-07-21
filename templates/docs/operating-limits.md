---
{
  "kind": "operating-limits",
  "id": "operating-limits",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __LIMITS_TITLE__

## Supported envelope

State the pilot or release population, request rate, data volume, dependency availability, support hours, and recovery target.

## Limits

| Limit | Kind | Value | Scope | Observable behavior | Owner |
|:---|:---|:---|:---|:---|:---|
| `__LIMIT__` | `enforced`, `tested`, `supported`, or `alert-threshold` | `__VALUE__` | State the affected flow, Subject, or service. | State the caller or operator result. | `__OWNER__` |

- An enforced limit is actively rejected beyond its value.
- A tested limit has automated or operating evidence at its value.
- A supported limit is the maintainer's operating commitment.
- An alert threshold requires operator action when crossed.

One value may have more than one row when it has more than one classification. A tested value does not automatically become enforced or supported.

## Monitoring

| Signal | Source | Alert threshold | Evaluation window | Action owner | Runbook |
|:---|:---|:---|:---|:---|:---|
| `__SIGNAL__` | Name the metric, log, or alert. | State the threshold. | `__WINDOW__` | `__OWNER__` | Link the runbook. |

## Stop conditions

- State the condition that blocks release, suspends a Business Flow, or requires operator intervention.
- State who may declare the condition and who may resume work.

## Recovery

State the runbook, rollback, replay, compensation, backup, or provider escalation path.

## Verification

List load tests, operating checks, alert exercises, evidence, and the next review date.
