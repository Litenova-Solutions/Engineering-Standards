---
{
  "kind": "decision",
  "id": "__PRODUCT_DECISION_ID__",
  "specStatus": "draft",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "affects": ["product/__PRODUCT_PAGE__.md"]
}
---
# __DECISION_TITLE__

## Context

State the business situation that forced a choice, with the facts that bound it.

## Options considered

| Option | For | Against |
|:---|:---|:---|
| State one option. | State its strongest reason. | State its strongest cost. |

## Decision

State the selected option in one paragraph. A proposal stays `draft`. The accountable person sets `specStatus` to `approved` and adds `decidedBy` and `decided`.

## Evidence

- Link each research claim or record the decision rests on, with its confidence.

## Consequences

State what the product, the company, or the code now has to do, and the cost accepted.

## What would change it

State the measurable condition that reopens this decision. A later choice that reverses it is a new record whose `supersedes` names this one; this record is then retired with `supersededBy`.
