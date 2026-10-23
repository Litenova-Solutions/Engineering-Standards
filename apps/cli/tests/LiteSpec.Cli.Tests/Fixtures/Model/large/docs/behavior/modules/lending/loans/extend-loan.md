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
  "serves": [
    "journey/borrow-and-return#s3"
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
    },
    {
      "type": "scenario",
      "id": "scenario/extend-loan.extending-an-active-loan-succeeds",
      "title": "Extending an active loan succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A reader holds an active loan.",
      "when": "The reader extends the loan.",
      "result": "result/extend-loan.extended",
      "then": "The loan is extended.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "e339eece"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "7dce9abf"
}
---

# Extend loan

A reader extends an active loan.
