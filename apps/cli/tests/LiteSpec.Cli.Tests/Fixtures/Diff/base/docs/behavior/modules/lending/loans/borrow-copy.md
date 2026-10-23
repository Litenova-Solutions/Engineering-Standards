---
{
  "type": "use-case",
  "id": "use-case/lending.borrow-copy",
  "title": "Borrow copy",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "command",
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
  "raises": [
    "event/loan.loan-borrowed"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.borrowed",
      "title": "Borrowed",
      "owner": "lending-team",
      "status": "reviewed",
      "outcome": "success",
      "meaning": "The copy is lent."
    },
    {
      "type": "result",
      "id": "result/borrow-copy.copy-unavailable",
      "title": "Copy unavailable",
      "owner": "lending-team",
      "status": "reviewed",
      "outcome": "refusal",
      "code": "lending.copy-not-available",
      "meaning": "The copy is on loan."
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
      "title": "Borrowing an available copy succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "An available copy sits on the shelf.",
      "when": "The reader borrows the copy.",
      "then": "The copy is lent.",
      "result": "result/borrow-copy.borrowed"
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.borrowing-a-loaned-copy-refuses",
      "title": "Borrowing a loaned copy refuses",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A copy is on loan.",
      "when": "The reader borrows the copy.",
      "then": "The reader is told the copy is on loan.",
      "result": "result/borrow-copy.copy-unavailable"
    }
  ]
}
---

# Borrow copy

A reader borrows an available copy.
