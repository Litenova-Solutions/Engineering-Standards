---
{
  "type": "use-case",
  "id": "use-case/lending.list-loans",
  "title": "List loans",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "query",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/read-loans",
    "tenant": "own"
  },
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "output": {
    "include": {
      "rows": {
        "fields": [
          {
            "name": "loans",
            "meaning": "One row per loan: its identity, copy, reader, and due date."
          }
        ],
        "classification": "internal",
        "source": [
          "aggregate/lending.loan"
        ],
        "freshness": "immediate"
      }
    }
  },
  "paging": {
    "order": "Due date, earliest first.",
    "cursor": "The due date and loan identity of the last row.",
    "defaultLimit": 25,
    "maxLimit": 100
  },
  "records": [
    {
      "type": "result",
      "id": "result/list-loans.listed",
      "title": "Listed",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The loans are listed.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "36e67f1d"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "f78bc612"
}
---

# List loans

A reader lists their own loans.
