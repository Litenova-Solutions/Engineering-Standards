---
{
  "type": "use-case",
  "id": "use-case/archive.borrow-copy",
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
  "raises": [],
  "serves": [
    "journey/borrow-and-return#s2"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.archived",
      "title": "Archived",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The archived copy is lent.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "cc5d7d08"
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.archiving-a-borrow-succeeds",
      "title": "Archiving a borrow succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "An archived copy sits available.",
      "when": "The reader borrows the copy.",
      "result": "result/borrow-copy.archived",
      "then": "The loan is active.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "9d8e6c14"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "d21ff6b6"
}
---

# Borrow copy

A reader borrows an archived copy.
