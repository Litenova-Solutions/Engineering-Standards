---
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List Expenses",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "query",
  "needs": [
    "permission/list-expenses"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "output": [
    {
      "name": "expenses",
      "meaning": "One row per expense: its identity, amount, currency, state and submission time, newest first."
    }
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-expenses.listed",
      "title": "Listed",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The expenses are listed."
    },
    {
      "type": "scenario",
      "id": "scenario/list-expenses.listing-own-expenses-succeeds",
      "title": "Listing own expenses succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An employee submitted two expenses.",
      "when": "The employee lists their expenses.",
      "result": "result/list-expenses.listed",
      "then": "Both expenses are listed."
    }
  ]
}
---

# List Expenses

## Goal

An employee sees their own expenses with the latest state of each.
