---
{
  "type": "use-case",
  "id": "use-case/spending.erase-personal-data",
  "title": "Erase Personal Data",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/erase-personal-data"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [],
  "records": [
    {
      "type": "result",
      "id": "result/erase-personal-data.erased",
      "title": "Erased",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The personal data of the expense is erased."
    },
    {
      "type": "scenario",
      "id": "scenario/erase-personal-data.erasing-personal-data-succeeds",
      "title": "Erasing personal data succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An expense was reimbursed and its retention ended.",
      "when": "Finance erases the personal data of the expense.",
      "result": "result/erase-personal-data.erased",
      "then": "The personal data of the expense is erased."
    }
  ]
}
---

# Erase Personal Data

## Goal

Finance erases the personal data of an old expense so nothing personal is kept past its need.

## What Happens

Finance names a decided expense whose retention ended. Spending erases the personal data the expense holds and keeps the bare business facts. The bare facts stay for the tax file.

## Risk

Personal data is erased here: erasing the wrong expense cannot be undone. Finance names one expense at a time, and only past its retention.
