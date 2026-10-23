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
  "serves": [
    "journey/borrow-and-return#s4"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
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
    },
    {
      "type": "scenario",
      "id": "scenario/list-loans.listing-own-loans-succeeds",
      "title": "Listing own loans succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A reader holds two active loans.",
      "when": "The reader lists their loans.",
      "result": "result/list-loans.listed",
      "then": "Both loans are listed.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "bdf248e0"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "c489dbda"
}
---

# List loans

A reader lists their own loans.
