---
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit expense",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/submit-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [
    "event/expense.expense-submitted"
  ],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/submit-expense.submitted",
      "title": "Submitted",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The expense is submitted."
    },
    {
      "type": "result",
      "id": "result/submit-expense.receipt-missing",
      "title": "Receipt missing",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.receipt-missing",
      "meaning": "The expense is above the receipt threshold and carries no receipt."
    },
    {
      "type": "scenario",
      "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
      "title": "Submitting with a receipt succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An employee paid for a train ticket and kept the receipt.",
      "when": "The employee submits the expense with the receipt.",
      "result": "result/submit-expense.submitted",
      "then": "The expense is submitted."
    }
  ]
}
---

# Submit expense

An employee submits a work expense.
