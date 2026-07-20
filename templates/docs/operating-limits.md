# __LIMITS_TITLE__

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Supported envelope

State the pilot or release population, request rate, data volume, dependency availability, support hours, and recovery target this document supports.

## Hard limits

| Limit | Value | Scope | Observable response | Owner |
|:---|:---|:---|:---|:---|
| `__LIMIT__` | `__VALUE__` | State the affected subject or service. | State the caller or operator result. | `__OWNER__` |

## Monitoring

| Signal | Source | Threshold | Action owner | Review interval |
|:---|:---|:---|:---|:---|
| `__SIGNAL__` | Name the metric, log, or alert. | State the threshold. | `__OWNER__` | `__INTERVAL__` |

## Stop conditions

- State the condition that pauses new work or blocks release.
- State who may declare the condition and who may resume work.

## Recovery

State the runbook, rollback, replay, compensation, backup, or provider escalation path. Link the relevant decision and release gate.

## Verification

List tests, operating checks, alert exercises, and the next review date.
