---
{
  "type": "use-case",
  "id": "use-case/spending.export-expenses",
  "title": "Export expenses",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
  "needs": [
    "permission/export-expenses"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [],
  "reactsTo": [],
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
      "httpStatus": 200,
      "meaning": "The approved expenses are exported."
    },
    {
      "type": "result",
      "id": "result/export-expenses.nothing-approved",
      "title": "Nothing approved",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.nothing_approved",
      "httpStatus": 409,
      "meaning": "No approved expense awaits export."
    },
    {
      "type": "case",
      "id": "case/export-expenses.exporting-approved-expenses-succeeds",
      "title": "Exporting approved expenses succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "Two expenses were approved this week.",
      "action": "Finance exports the approved expenses.",
      "result": "result/export-expenses.exported",
      "expect": "The approved expenses are exported."
    }
  ]
}
---

# Export expenses

Finance exports the approved expenses.
