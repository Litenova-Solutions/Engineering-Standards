---
{
  "kind": "use-case",
  "id": "__SUBJECT__.__USE_CASE__",
  "recordStatus": "current",
  "deliveryStatus": "planned",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "operationType": "__OPERATION_TYPE__",
  "actors": ["__ACTOR__"],
  "entryPoints": [],
  "risks": [],
  "applicableExtensions": []
}
---
# __TITLE__

## Goal

State the actor or system goal and its observable result.

## Trigger

State the actor action, Event, schedule, or system condition that starts this Use case.

## Authorization

State how actor identity is established and how target access is checked. Write `Not applicable` for a trusted system trigger with no actor decision.

## Input

| Field | Meaning | Input Rules |
|:---|:---|:---|
| `__FIELD__` | State its business meaning. | State required shape, range, or format. |

## Result

State the observable result without exposing persistence types.

## Rules

| Rule ID | Type | Required behavior |
|:---|:---|:---|
| `INV-__SUBJECT_ID__-01` | Aggregate Rule | State how this Use case applies the rule. |
| `POL-__SHARED_RULE_ID__-01` | Business Policy | Remove when no Shared Rule applies. |

## Successful path

1. Describe successful behavior in business terms.

## Domain behavior

For a Command, list every Aggregate changed. For a Query, write `No Domain transition` and name the Read Model.

| Aggregate | Source state | Business action | Target state | Rules | Event references |
|:---|:---|:---|:---|:---|:---|
| `__AGGREGATE__` | `__SOURCE_STATE__` | `__ACTION__` | `__TARGET_STATE__` | `INV-__SUBJECT_ID__-01` | `__SUBJECT__.__PAST_TENSE_EVENT__` |

When more than one Aggregate appears, state the rule that requires one transaction.

## Failures

| Code | Condition | Observable result | Recovery |
|:---|:---|:---|:---|
| `__ERROR_CODE__` | State the failed rule. | State the caller-visible result. | State retry, correction, or no recovery. |

## Acceptance criteria

- [AC-__SUBJECT_ID__-__USE_CASE_ID__-01] Replace with one observable criterion.

A `planned` Use case may have no test reference. A `verified` Use case has at least one acceptance criterion, every acceptance ID appears in automated test source, and applicable test commands have passed.

## Examples

### Successful example

Given the required starting state
When the actor performs the operation
Then the expected result is observable

### Rejected example

Given a state that violates `INV-__SUBJECT_ID__-01`
When the actor performs the operation
Then `__ERROR_CODE__` is returned without a state change

## Implementation mapping

| Role | Name or path |
|:---|:---|
| Command or Query | `__USE_CASE__Command` or `__USE_CASE__Query` |
| Handler | `__USE_CASE__CommandHandler` or `__USE_CASE__QueryHandler` |
| Aggregate method or Read Model | `__MAPPING__` |
| Entry Point | `__MAPPING__` |
| Automated tests | `__MAPPING__` |

Add this section when implementation begins. Do not use it as the source for business behavior.

## Risk and assurance

Add only sections required by `risks`: authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Operating impact

State schema, external dependency, diagnostic, deployment, recovery, or runbook changes. Write `None` when no operating change exists.

## Verification

- List exact commands and expected evidence for this Use case.
