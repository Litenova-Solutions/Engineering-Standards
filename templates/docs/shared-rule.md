---
{
  "kind": "shared-rule",
  "id": "__SHARED_RULE__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "ruleType": "business-policy",
  "appliesTo": ["__SUBJECT_ONE__", "__SUBJECT_TWO__"],
  "applicableExtensions": []
}
---
# __SHARED_RULE_TITLE__

## Business statement

State the rule in business language.

## Rules

| ID | Required behavior | Applies to | Failure result |
|:---|:---|:---|:---|
| `POL-__SHARED_RULE_ID__-01` | State one Business Policy. | List Subject IDs. | State the observable result. |

## Ownership and consistency

- Business owner: `__OWNER__`.
- Consistency requirement: State atomic, bounded eventual, or another measurable requirement.
- Enforcement point: Name the Aggregate, policy, Workflow, Application handler, or storage boundary.
- Failure behavior: State rejected work, pending state, retry, or operator alert.

## Subject boundaries

State which Subject owns each fact and which Commands, Queries, or Events cross the boundary.

## Verification

| Policy ID | Acceptance criteria or Flow checks | Automated or operating evidence |
|:---|:---|:---|
| `POL-__SHARED_RULE_ID__-01` | List IDs. | Link tests, alerts, or exercises. |

## Related decisions

- Link decisions that define or constrain this Shared Rule.
