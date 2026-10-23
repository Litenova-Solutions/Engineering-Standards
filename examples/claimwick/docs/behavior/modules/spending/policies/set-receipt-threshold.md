---
{
  "type": "use-case",
  "id": "use-case/spending.set-receipt-threshold",
  "title": "Set Receipt Threshold",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/manage-policy"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/set-receipt-threshold.threshold-set",
      "title": "Threshold set",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The receipt threshold is set."
    },
    {
      "type": "result",
      "id": "result/set-receipt-threshold.negative-threshold",
      "title": "Negative threshold",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.negative-threshold",
      "meaning": "The threshold is negative."
    },
    {
      "type": "scenario",
      "id": "scenario/set-receipt-threshold.setting-the-threshold-succeeds",
      "title": "Setting the threshold succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "Finance agreed a new receipt threshold with the managers.",
      "when": "The manager sets the receipt threshold.",
      "result": "result/set-receipt-threshold.threshold-set",
      "then": "The receipt threshold is set."
    }
  ]
}
---

# Set Receipt Threshold

## Goal

A manager sets the receipt threshold so small expenses stay light to submit.

## What Happens

The manager sends the new threshold with its currency. Spending refuses a negative threshold. Otherwise the policy carries the new threshold from now on.
