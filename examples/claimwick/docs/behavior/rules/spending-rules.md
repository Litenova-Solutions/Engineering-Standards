---
{
  "type": "rule-set",
  "title": "Spending Rules",
  "owner": "claimwick-team",
  "status": "reviewed",
  "records": [
    {
      "type": "rule",
      "id": "rule/spending.receipt-filed-once",
      "title": "Receipt filed once",
      "owner": "claimwick-team",
      "status": "reviewed",
      "kind": "cross-aggregate",
      "statement": "A receipt file supports one expense across spending.",
      "governs": [
        "aggregate/spending.receipt"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "144ac574"
    }
  ]
}
---

# Spending Rules

## Summary

Receipt files are filed once across spending.
