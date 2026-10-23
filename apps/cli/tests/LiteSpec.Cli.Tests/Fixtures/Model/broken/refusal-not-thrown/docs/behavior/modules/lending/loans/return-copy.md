---
{
  "type": "use-case",
  "id": "use-case/lending.return-copy",
  "title": "Return copy",
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
    "event/loan.loan-returned"
  ],
  "serves": [
    "journey/borrow-and-return#s5"
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/return-copy.returned",
      "title": "Returned",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The copy is returned.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "e86896a0"
    },
    {
      "type": "result",
      "id": "result/return-copy.loan-inactive",
      "title": "Loan inactive",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.loan-never-existed",
      "meaning": "The loan is inactive.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "c0a775fc"
    },
    {
      "type": "scenario",
      "id": "scenario/return-copy.returning-a-borrowed-copy-succeeds",
      "title": "Returning a borrowed copy succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A reader holds an active loan.",
      "when": "The reader returns the copy.",
      "result": "result/return-copy.returned",
      "then": "The loan is returned.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "b75c67b8"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "b3d019ee"
}
---

# Return copy

A reader returns a borrowed copy.
