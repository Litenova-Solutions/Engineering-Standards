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
    },
    {
      "type": "scenario",
      "id": "scenario/extend-loan.extending-an-active-loan-succeeds",
      "title": "Extending an active loan succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A reader holds an active loan.",
      "when": "The reader extends the loan.",
      "result": "result/extend-loan.extended",
      "then": "The loan is extended."
    }
  ]
}
---

# Extend loan

A reader extends an active loan.
