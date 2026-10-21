---
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List expenses",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "query",
  "needs": [
    "permission/list-expenses"
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
      "id": "result/list-expenses.listed",
      "title": "Listed",
      "owner": "expenses-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The expenses are listed."
    },
    {
      "type": "case",
      "id": "case/list-expenses.listing-own-expenses-succeeds",
      "title": "Listing own expenses succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "An employee submitted two expenses.",
      "action": "The employee lists their expenses.",
      "result": "result/list-expenses.listed",
      "expect": "Both expenses are listed."
    }
  ]
}
---

# List expenses

An employee lists their own expenses.
