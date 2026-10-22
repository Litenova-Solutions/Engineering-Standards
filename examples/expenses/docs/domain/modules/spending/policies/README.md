---
{
  "type": "aggregate",
  "id": "aggregate/spending.policy",
  "title": "Policy",
  "owner": "expenses-team",
  "status": "approved",
  "states": [
    {
      "name": "Active",
      "meaning": "The policy threshold applies."
    },
    {
      "name": "Retired",
      "meaning": "The policy no longer applies."
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/policy.threshold-never-negative",
      "title": "Threshold never negative",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "invariant",
      "statement": "A threshold is never negative.",
      "governs": [
        "use-case/spending.set-receipt-threshold"
      ],
      "refusal": "result/set-receipt-threshold.negative-threshold",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    }
  ]
}
---

# Policy

The policy is the company spending policy and its receipt threshold.
