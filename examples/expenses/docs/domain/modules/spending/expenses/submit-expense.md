---
{
  "type": "use-case",
  "id": "use-case/spending.submit-expense",
  "title": "Submit Expense",
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
  "input": [
    {
      "name": "amount",
      "meaning": "The exact amount of the expense."
    },
    {
      "name": "currency",
      "meaning": "The ISO 4217 currency code of the amount."
    },
    {
      "name": "receipt",
      "meaning": "The proof of payment, required above the threshold."
    }
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

# Submit Expense

## Goal

An employee files a work expense so it can be decided and reimbursed.

## What Happens

The employee sends the amount with its currency and the receipt, if one is attached. Spending checks the receipt rule against the policy threshold. An expense above the threshold with no receipt is refused with `spending.receipt-missing`. Otherwise the expense is stored as Submitted and `event/expense.expense-submitted` is raised.

## Example

Ava takes the train to a client visit and keeps the ticket receipt. Back at the office she submits the 48.90 EUR fare with the receipt attached. The expense waits for Ben to decide.
