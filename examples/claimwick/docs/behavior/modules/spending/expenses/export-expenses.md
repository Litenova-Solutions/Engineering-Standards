---
{
  "type": "use-case",
  "id": "use-case/spending.export-expenses",
  "title": "Export Expenses",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/export-expenses",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s7"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "reads": [
    "aggregate/spending.expense"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/export-expenses.exported",
      "title": "Exported",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The approved expenses are exported.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "0f8eff75"
    },
    {
      "type": "result",
      "id": "result/export-expenses.nothing-approved",
      "title": "Nothing approved",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.nothing-approved",
      "meaning": "No approved expense awaits export.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "bde9550b"
    },
    {
      "type": "scenario",
      "id": "scenario/export-expenses.exporting-approved-expenses-succeeds",
      "title": "Exporting approved expenses succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "Two expenses were approved this week.",
      "when": "Finance exports the approved expenses.",
      "result": "result/export-expenses.exported",
      "then": "The approved expenses are exported.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "cd3206cd"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "efea29a3"
}
---

# Export Expenses

## Goal

Finance collects the approved expenses so the payout batch can run.

## What Happens

Finance asks for every approved expense since the last export. Spending refuses the export when no approved expense awaits it. Otherwise the approved expenses are handed over as one batch.
