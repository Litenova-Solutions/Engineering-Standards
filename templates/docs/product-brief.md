---
{
  "kind": "product",
  "id": "__PROJECT_ID__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "primaryBusinessFlow": "__PRIMARY_BUSINESS_FLOW__"
}
---
# __PROJECT__ Product Brief

## Target user

Name the first user group and the situation in which they use the product.

## Problem

State the current user problem without describing the implementation.

## Product outcome

State the first observable product outcome. Link `docs/product/flows/__PRIMARY_BUSINESS_FLOW__.md` as the Primary Business Flow.

## Success measure

Name an observable product or operating result.

## Product and operating context

- Commercial model: pricing, billing, fees, or `None`.
- Legal and regulatory boundary: legal entity, jurisdiction, regulated responsibilities, and data obligations.
- External systems: providers, their responsibilities, and which system owns each fact.
- Money movement and Risk: custody, settlement, payout, refund, reserve, chargeback, fraud, or `None`.
- Audit and support: required records, retention, support owner, and recovery obligations.
- Current versus planned: label future assumptions as planned behavior.

## Non-goals

- List behavior that will not enter v1.

## Operating target

Name the deployment environment, availability expectation, and support owner.

## Data classification

List public, internal, personal, sensitive, and regulated data handled by v1.

## Constraints

- Record fixed platform, legal, budget, schedule, integration, or operating constraints.

## Open decisions

- Link expensive-to-reverse choices that require a decision before implementation.
