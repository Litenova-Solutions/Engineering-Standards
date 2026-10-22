---
{
  "type": "use-case",
  "id": "use-case/archive.borrow-copy",
  "title": "Borrow copy",
  "owner": "lending-team",
  "status": "approved",
  "kind": "command",
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
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.archived-borrowed",
      "title": "Archived borrowed",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The archived copy is lent."
    },
    {
      "type": "result",
      "id": "result/borrow-copy.archive-unavailable",
      "title": "Archive unavailable",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-not-available",
      "meaning": "The archived copy is unavailable."
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.archiving-an-available-copy-succeeds",
      "title": "Archiving an available copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A copy sits available in the archive.",
      "when": "The reader borrows the archived copy.",
      "result": "result/borrow-copy.archived-borrowed",
      "then": "The loan is active."
    }
  ]
}
---

# Borrow copy

A reader borrows an archived copy.
