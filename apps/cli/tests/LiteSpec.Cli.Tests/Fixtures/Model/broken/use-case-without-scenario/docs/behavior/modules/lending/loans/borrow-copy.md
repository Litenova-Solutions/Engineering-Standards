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
      "meaning": "The copy is lent.",
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
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "a1e62ef5"
}
---

# Borrow copy

A reader borrows an available copy.
