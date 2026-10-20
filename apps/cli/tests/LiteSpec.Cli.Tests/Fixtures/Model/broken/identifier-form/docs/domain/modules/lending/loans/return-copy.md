---
{
  "type": "use-case",
  "id": "use-case/lending.return-copy",
  "title": "Return copy",
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
    "event/loan.loan-returned"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "results": [
    "result/return-copy.returned",
    "result/return-copy.LOAN-INACTIVE"
  ],
  "cases": [
    "case/return-copy.returning-a-borrowed-copy-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/return-copy.returned",
      "title": "Returned",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The copy is returned."
    },
    {
      "type": "result",
      "id": "result/return-copy.LOAN-INACTIVE",
      "title": "Loan inactive",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.loan_not_active",
      "httpStatus": 409,
      "meaning": "The loan is inactive."
    },
    {
      "type": "case",
      "id": "case/return-copy.returning-a-borrowed-copy-succeeds",
      "title": "Returning a borrowed copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A reader holds an active loan.",
      "action": "The reader returns the copy.",
      "result": "result/return-copy.returned",
      "expect": "The loan is returned."
    }
  ]
}
---

# Return copy

A reader returns a borrowed copy.
