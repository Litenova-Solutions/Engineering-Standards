---
{
  "type": "rule-set",
  "title": "Spending Rules",
  "owner": "expenses-team",
  "status": "approved",
  "records": [
    {
      "type": "rule",
      "id": "rule/spending.receipt-filed-once",
      "title": "Receipt filed once",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "cross-aggregate",
      "statement": "A receipt file supports one expense across spending.",
      "governs": [
        "aggregate/spending.receipt"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    }
  ]
}
---

# Spending Rules

## Summary

Receipt files are filed once across spending.
