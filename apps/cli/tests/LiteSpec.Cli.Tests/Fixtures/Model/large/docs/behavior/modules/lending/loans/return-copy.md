---
{
  "type": "use-case",
  "id": "use-case/lending.return-copy",
  "title": "Return copy",
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
      "meaning": "The copy is returned."
    },
    {
      "type": "result",
      "id": "result/return-copy.loan-inactive",
      "title": "Loan inactive",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.loan-not-active",
      "meaning": "The loan is inactive."
    },
    {
      "type": "scenario",
      "id": "scenario/return-copy.returning-a-borrowed-copy-succeeds",
      "title": "Returning a borrowed copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A reader holds an active loan.",
      "when": "The reader returns the copy.",
      "result": "result/return-copy.returned",
      "then": "The loan is returned."
    }
  ]
}
---

# Return copy

A reader returns a borrowed copy.
