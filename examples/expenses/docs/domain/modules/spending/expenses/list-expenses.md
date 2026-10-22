---
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List expenses",
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

# List expenses

An employee lists their own expenses.
