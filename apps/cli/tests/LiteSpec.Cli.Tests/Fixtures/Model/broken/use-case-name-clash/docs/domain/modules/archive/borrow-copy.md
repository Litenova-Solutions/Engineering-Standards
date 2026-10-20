---
{
  "type": "use-case",
  "id": "use-case/archive.borrow-copy",
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
    "result/borrow-copy.archived-borrowed",
    "result/borrow-copy.archive-unavailable"
  ],
  "cases": [
    "case/borrow-copy.archiving-an-available-copy-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.archived-borrowed",
      "title": "Archived borrowed",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 201,
      "meaning": "The archived copy is lent."
    },
    {
      "type": "result",
      "id": "result/borrow-copy.archive-unavailable",
      "title": "Archive unavailable",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.copy_not_available",
      "httpStatus": 409,
      "meaning": "The archived copy is unavailable."
    },
    {
      "type": "case",
      "id": "case/borrow-copy.archiving-an-available-copy-succeeds",
      "title": "Archiving an available copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A copy sits available in the archive.",
      "action": "The reader borrows the archived copy.",
      "result": "result/borrow-copy.archived-borrowed",
      "expect": "The loan is active."
    }
  ]
}
---

# Borrow copy

A reader borrows an archived copy.
