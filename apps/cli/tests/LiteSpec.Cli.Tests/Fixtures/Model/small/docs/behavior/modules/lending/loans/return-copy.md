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
      "code": "lending.loan-not-active",
      "meaning": "The loan is inactive.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "f287c8b4"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "f21a3199"
}
---

# Return copy

A reader returns a borrowed copy.
