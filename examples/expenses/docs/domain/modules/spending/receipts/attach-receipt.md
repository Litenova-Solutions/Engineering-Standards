---
{
  "type": "use-case",
  "id": "use-case/spending.attach-receipt",
  "title": "Attach receipt",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
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
  "reactsTo": [],
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
      "httpStatus": 201,
      "meaning": "The receipt is attached."
    },
    {
      "type": "result",
      "id": "result/attach-receipt.expense-decided",
      "title": "Expense decided",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.expense_decided",
      "httpStatus": 409,
      "meaning": "The expense is already decided."
    },
    {
      "type": "case",
      "id": "case/attach-receipt.attaching-a-receipt-succeeds",
      "title": "Attaching a receipt succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "An employee submitted an expense below the threshold with no receipt.",
      "action": "The employee attaches the receipt.",
      "result": "result/attach-receipt.attached",
      "expect": "The receipt is attached."
    }
  ]
}
---

# Attach receipt

An employee attaches a receipt to a submitted expense.
