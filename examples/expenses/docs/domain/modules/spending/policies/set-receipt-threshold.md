---
{
  "type": "use-case",
  "id": "use-case/spending.set-receipt-threshold",
  "title": "Set receipt threshold",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
  "needs": [
    "permission/manage-policy"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [],
  "reactsTo": [],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/set-receipt-threshold.threshold-set",
      "title": "Threshold set",
      "owner": "expenses-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The receipt threshold is set."
    },
    {
      "type": "result",
      "id": "result/set-receipt-threshold.negative-threshold",
      "title": "Negative threshold",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.negative_threshold",
      "httpStatus": 422,
      "meaning": "The threshold is negative."
    },
    {
      "type": "case",
      "id": "case/set-receipt-threshold.setting-the-threshold-succeeds",
      "title": "Setting the threshold succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "Finance agreed a new receipt threshold with the managers.",
      "action": "The manager sets the receipt threshold.",
      "result": "result/set-receipt-threshold.threshold-set",
      "expect": "The receipt threshold is set."
    }
  ]
}
---

# Set receipt threshold

A manager sets the policy receipt threshold.
