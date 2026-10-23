---
{
  "type": "use-case",
  "id": "use-case/lending.list-loans",
  "title": "List loans",
  "owner": "lending-team",
  "status": "approved",
  "kind": "query",
  "needs": [
    "permission/read-loans"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-loans.listed",
      "title": "Listed",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The loans are listed."
    },
    {
      "type": "scenario",
      "id": "scenario/list-loans.listing-own-loans-succeeds",
      "title": "Listing own loans succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A reader holds two active loans.",
      "when": "The reader lists their loans.",
      "result": "result/list-loans.listed",
      "then": "Both loans are listed."
    }
  ]
}
---

# List loans

A reader lists their own loans.
