---
{
  "type": "use-case",
  "id": "use-case/spending.attach-receipt",
  "title": "Attach receipt",
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
    "event/receipt.receipt-attached"
  ],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/attach-receipt.attached",
      "title": "Attached",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The receipt is attached."
    },
    {
      "type": "result",
      "id": "result/attach-receipt.expense-decided",
      "title": "Expense decided",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.expense-decided",
      "meaning": "The expense is already decided."
    },
    {
      "type": "scenario",
      "id": "scenario/attach-receipt.attaching-a-receipt-succeeds",
      "title": "Attaching a receipt succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An employee submitted an expense below the threshold with no receipt.",
      "when": "The employee attaches the receipt.",
      "result": "result/attach-receipt.attached",
      "then": "The receipt is attached."
    }
  ]
}
---

# Attach receipt

An employee attaches a receipt to a submitted expense.
