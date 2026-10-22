---
{
  "type": "use-case",
  "id": "use-case/spending.export-expenses",
  "title": "Export Expenses",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/export-expenses"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/export-expenses.exported",
      "title": "Exported",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The approved expenses are exported."
    },
    {
      "type": "result",
      "id": "result/export-expenses.nothing-approved",
      "title": "Nothing approved",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.nothing-approved",
      "meaning": "No approved expense awaits export."
    },
    {
      "type": "scenario",
      "id": "scenario/export-expenses.exporting-approved-expenses-succeeds",
      "title": "Exporting approved expenses succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "Two expenses were approved this week.",
      "when": "Finance exports the approved expenses.",
      "result": "result/export-expenses.exported",
      "then": "The approved expenses are exported."
    }
  ]
}
---

# Export Expenses

## Goal

Finance collects the approved expenses so the payout batch can run.

## What Happens

Finance asks for every approved expense since the last export. Spending refuses the export when no approved expense awaits it. Otherwise the approved expenses are handed over as one batch.
