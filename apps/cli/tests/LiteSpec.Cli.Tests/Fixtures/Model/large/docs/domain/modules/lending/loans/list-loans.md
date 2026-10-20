---
{
  "type": "use-case",
  "id": "use-case/lending.list-loans",
  "title": "List loans",
  "owner": "lending-team",
  "status": "approved",
  "operation": "query",
  "needs": [
    "permission/read-loans"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [],
  "reactsTo": [],
  "fulfils": [
    "requirement/borrowing.max-active-loans"
  ],
  "results": [
    "result/list-loans.listed"
  ],
  "cases": [
    "case/list-loans.listing-own-loans-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-loans.listed",
      "title": "Listed",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The loans are listed."
    },
    {
      "type": "case",
      "id": "case/list-loans.listing-own-loans-succeeds",
      "title": "Listing own loans succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A reader holds two active loans.",
      "action": "The reader lists their loans.",
      "result": "result/list-loans.listed",
      "expect": "Both loans are listed."
    }
  ]
}
---

# List loans

A reader lists their own loans.
