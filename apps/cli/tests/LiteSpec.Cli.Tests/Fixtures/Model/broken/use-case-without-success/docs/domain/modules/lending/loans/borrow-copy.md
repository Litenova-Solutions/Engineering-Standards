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
    "result/borrow-copy.copy-unavailable"
  ],
  "cases": [
    "case/borrow-copy.borrowing-an-available-copy-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.copy-unavailable",
      "title": "Copy unavailable",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.copy_not_available",
      "httpStatus": 409,
      "meaning": "The copy is unavailable."
    },
    {
      "type": "case",
      "id": "case/borrow-copy.borrowing-an-available-copy-succeeds",
      "title": "Borrowing an available copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A copy sits available on its shelf.",
      "action": "The reader borrows the copy.",
      "result": "result/borrow-copy.copy-unavailable",
      "expect": "The refusal names the code."
    }
  ]
}
---

# Borrow copy

A reader borrows an available copy.
