---
{
  "id": "recipe.reporting",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure", "delivery"],
  "recipes": ["reporting"]
}
---
# Reporting and Exports

## RECIPE.REPORT.ADOPT.001 - Separate reporting after a real query requires it

Keep normal request reads in `IQuerySession`. Enable this recipe for complex joins, aggregate reports, large exports, or work that exceeds the normal request latency budget.

## RECIPE.REPORT.SQL.001 - Keep SQL parameterized and reviewed

Infrastructure owns raw SQL. Use parameters for every external value. Review query plans and indexes with representative data.

## RECIPE.REPORT.AUTHZ.001 - Apply the same data authorization

Exports and reports enforce actor, role, ownership, tenant, and sensitive-field rules. A bulk endpoint cannot bypass checks applied to item reads.

## RECIPE.REPORT.EXPORT.001 - Move long work outside the request

Run large exports through Worker, store the output in approved object storage, and provide a short-lived authorized download. Support cancellation and expiry.

## RECIPE.REPORT.GATES.001 - Test cost and cancellation

Test results, authorization, cancellation, timeout, maximum range, maximum rows, and execution plan. Record the representative data volume used by the performance check.

