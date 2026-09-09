---
{
  "kind": "domain-policy",
  "id": "__POLICY__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "appliesToModules": ["__MODULE__"],
  "applicableExtensions": []
}
---
# __POLICY_TITLE__

A domain policy is a business rule not owned by one aggregate invariant. `Domain` identifies business behavior. `Policy` means the rule selects, permits, limits, or requires behavior from known facts.

## Business statement

State the rule in business language.

## Scenario

State one case where this rule decides the outcome: the situation, the decision the rule forces, and the result the business rejects without it. Draw the people, place, dates, and amounts from the reference cast record. This section is informative and carries no rule identifier.

## Rules

| ID | Required behavior | Applies to | Failure result |
|:---|:---|:---|:---|
| `POL-__POLICY_ID__-01` | State one domain policy. | List module IDs. | State the observable result. |

## Ownership and consistency

- Business owner: `__OWNER__`.
- Consistency requirement: State atomic, bounded eventual, or another measurable requirement.
- Enforcement point: Name the aggregate, policy component, workflow, Application handler, or persistence boundary.
- Failure behavior: State rejected work, pending state, retry, or operator alert.

## Module boundaries

State which module owns each fact and which Commands, Queries, or events cross the boundary. A policy may apply within one module when its facts span aggregates.

## Verification

| Policy ID | Acceptance criteria or end-to-end tests | Automated or operating evidence |
|:---|:---|:---|
| `POL-__POLICY_ID__-01` | List IDs. | Link tests, alerts, or exercises. |

## Related decisions

- Link decisions that define or constrain this domain policy.
