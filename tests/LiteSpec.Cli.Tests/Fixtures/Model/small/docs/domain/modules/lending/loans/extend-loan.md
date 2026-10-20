---
{
  "type": "use-case",
  "id": "use-case/lending.extend-loan",
  "title": "Extend loan",
  "owner": "lending-team",
  "status": "approved",
  "operation": "command",
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
  "reactsTo": [],
  "fulfils": [
    "requirement/borrowing.loan-period-days"
  ],
  "results": [
    "result/extend-loan.extended",
    "result/extend-loan.extension-refused"
  ],
  "cases": [],
  "records": [
    {
      "type": "result",
      "id": "result/extend-loan.extended",
      "title": "Extended",
      "owner": "lending-team",
      "outcome": "success",
      "status": 200,
      "meaning": "The loan is extended."
    },
    {
      "type": "result",
      "id": "result/extend-loan.extension-refused",
      "title": "Extension refused",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.extension_refused",
      "status": 409,
      "meaning": "The extension is refused."
    }
  ]
}
---

# Extend loan

A reader extends an active loan.
