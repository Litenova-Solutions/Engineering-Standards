---
{
  "type": "use-case",
  "id": "use-case/lending.extend-loan",
  "title": "Extend loan",
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
    "event/loan.loan-extended"
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/extend-loan.extended",
      "title": "Extended",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The loan is extended.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "51ed9b1a"
    },
    {
      "type": "result",
      "id": "result/extend-loan.extension-refused",
      "title": "Extension refused",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.extension-refused",
      "meaning": "The extension is refused.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "982f84f8"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "c3962116"
}
---

# Extend loan

A reader extends an active loan.
