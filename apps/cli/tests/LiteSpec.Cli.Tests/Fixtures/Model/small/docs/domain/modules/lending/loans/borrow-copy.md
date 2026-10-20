---
{
  "type": "use-case",
  "id": "use-case/lending.borrow-copy",
  "title": "Borrow copy",
  "owner": "lending-team",
  "status": "approved",
  "operation": "command",
  "needs": [
    "permission/borrow-copy"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [
    "event/loan.loan-borrowed"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "results": [
    "result/borrow-copy.borrowed",
    "result/borrow-copy.copy-unavailable"
  ],
  "cases": [],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.borrowed",
      "title": "Borrowed",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 201,
      "meaning": "The copy is lent."
    },
    {
      "type": "result",
      "id": "result/borrow-copy.copy-unavailable",
      "title": "Copy unavailable",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.copy_not_available",
      "httpStatus": 409,
      "meaning": "The copy is unavailable."
    }
  ]
}
---

# Borrow copy

A reader borrows an available copy.
