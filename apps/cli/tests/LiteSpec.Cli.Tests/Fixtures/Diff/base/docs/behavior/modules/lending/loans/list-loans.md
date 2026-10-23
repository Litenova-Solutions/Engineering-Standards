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
    "grant": "permission/borrow-copy",
    "tenant": "own"
  },
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/list-loans.listed",
      "title": "Listed",
      "owner": "lending-team",
      "status": "reviewed",
      "outcome": "success",
      "meaning": "The reader sees the loans."
    },
    {
      "type": "scenario",
      "id": "scenario/list-loans.listing-loans-succeeds",
      "title": "Listing loans succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "The reader holds two loans.",
      "when": "The reader lists the loans.",
      "then": "The reader sees two loans.",
      "result": "result/list-loans.listed"
    }
  ]
}
---

# List loans

A reader lists the loans held.
