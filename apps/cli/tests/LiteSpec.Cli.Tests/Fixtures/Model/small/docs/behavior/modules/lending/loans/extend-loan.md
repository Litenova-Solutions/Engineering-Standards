---
{
  "type": "use-case",
  "id": "use-case/lending.extend-loan",
  "title": "Extend loan",
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
      "meaning": "The loan is extended."
    },
    {
      "type": "result",
      "id": "result/extend-loan.extension-refused",
      "title": "Extension refused",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.extension-refused",
      "meaning": "The extension is refused."
    }
  ]
}
---

# Extend loan

A reader extends an active loan.
