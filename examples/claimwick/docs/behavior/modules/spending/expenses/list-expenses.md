---
{
  "type": "use-case",
  "id": "use-case/spending.list-expenses",
  "title": "List Expenses",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "query",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/list-expenses",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s5"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "output": {
    "include": {
      "rows": {
        "fields": [
          {
            "name": "expenses",
            "meaning": "One row per expense: its identity, amount, currency, state and submission time, newest first."
          }
        ],
        "classification": "internal",
        "source": [
          "aggregate/spending.expense"
        ],
        "freshness": "immediate"
      }
    }
  },
  "paging": {
    "order": "Submission time, newest first.",
    "cursor": "The submission time and identity of the last row.",
    "defaultLimit": 25,
    "maxLimit": 100
  },
  "reads": [
    "aggregate/spending.expense"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-expenses.listed",
      "title": "Listed",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expenses are listed.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "86b26cfd"
    },
    {
      "type": "scenario",
      "id": "scenario/list-expenses.listing-own-expenses-succeeds",
      "title": "Listing own expenses succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "An employee submitted two expenses.",
      "when": "The employee lists their expenses.",
      "result": "result/list-expenses.listed",
      "then": "Both expenses are listed.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "e9f8e65e"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ddacd257"
}
---

# List Expenses

## Goal

An employee sees their own expenses with the latest state of each.
