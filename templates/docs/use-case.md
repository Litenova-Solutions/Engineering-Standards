---
{
  "id": "__CAPABILITY__.__USE_CASE__",
  "operationType": "__OPERATION_TYPE__",
  "status": "planned",
  "actors": ["__ACTOR__"],
  "deliverySurfaces": [],
  "riskFlags": [],
  "extensions": []
}
---
# __TITLE__

## Intent

State the actor's observable outcome and why it matters.

## Authorization

State who may perform or observe this operation, how actor identity is established, and how target ownership or policy is checked.

## Preconditions

- List required business state.

## Input

| Field | Meaning | Constraints |
|:---|:---|:---|
| `__FIELD__` | State its business meaning. | State structural limits. |

## Output

State the observable result without exposing internal persistence types.

## Business rules

- State each invariant or decision that changes the outcome.

## Main flow

1. Describe successful behavior in domain terms.

## Failures

| Code | Condition | Observable result |
|:---|:---|:---|
| `__ERROR_CODE__` | State the failed rule. | State the caller-visible behavior. |

## Acceptance criteria

- [AC-__CAPABILITY_ID__-__USE_CASE_ID__-01] Replace with one observable criterion.

## Examples

### Successful example

Given the required starting state
When the actor performs the operation
Then the expected result is observable

## Risk and assurance

Add only the sections required by `riskFlags`: ownership and abuse cases, money and reconciliation, sensitive-data handling, irreversible recovery, concurrency, durable delivery, or availability failure.

## Operating impact

State schema, external dependency, diagnostic, deployment, recovery, or runbook changes. Write `None` when the use case has no operating impact.
