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
  "serves": [
    "journey/borrow-and-return#s2"
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
      "outcome": "success",
      "meaning": "The copy is lent to the reader.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "a1559ff6"
    },
    {
      "type": "result",
      "id": "result/borrow-copy.copy-unavailable",
      "title": "Copy unavailable",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-not-available",
      "meaning": "The copy is unavailable.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "198ca19a"
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
      "title": "Borrowing an available copy succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A copy sits available on its shelf.",
      "when": "The reader borrows the copy.",
      "result": "result/borrow-copy.borrowed",
      "then": "The loan is active.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "08e05b3c"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "0cd75a65"
}
---

# Borrow copy

A reader borrows an available copy.
