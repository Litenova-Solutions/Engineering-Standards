---
{
  "type": "aggregate",
  "id": "aggregate/spending.receipt",
  "title": "Receipt",
  "owner": "expenses-team",
  "status": "approved",
  "states": [
    {
      "name": "Attached",
      "meaning": "The receipt sits on the expense."
    },
    {
      "name": "Removed",
      "meaning": "The receipt left the expense."
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/receipt.attaches-before-decision",
      "title": "Attaches before decision",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "A receipt attaches before the expense is decided.",
      "governs": [
        "use-case/spending.attach-receipt"
      ],
      "refusal": "result/attach-receipt.expense-decided",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    },
    {
      "type": "event",
      "id": "event/receipt.receipt-attached",
      "title": "Receipt attached",
      "owner": "expenses-team",
      "status": "approved",
      "meaning": "A receipt was attached.",
      "carries": [
        "receiptId",
        "expenseId"
      ]
    }
  ]
}
---

# Receipt

A receipt is proof of payment attached to an expense.
