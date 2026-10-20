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
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "results": [
    "result/extend-loan.extended",
    "result/extend-loan.extension-refused"
  ],
  "cases": [
    "case/extend-loan.extending-an-active-loan-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/extend-loan.extended",
      "title": "Extended",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The loan is extended."
    },
    {
      "type": "result",
      "id": "result/extend-loan.extension-refused",
      "title": "Extension refused",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.extension_refused",
      "httpStatus": 409,
      "meaning": "The extension is refused."
    },
    {
      "type": "case",
      "id": "case/extend-loan.extending-an-active-loan-succeeds",
      "title": "Extending an active loan succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A reader holds an active loan.",
      "action": "The reader extends the loan.",
      "result": "result/extend-loan.extended",
      "expect": "The loan is extended."
    }
  ]
}
---

# Extend loan

A reader extends an active loan.
