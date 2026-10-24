---
{
  "type": "use-case",
  "id": "use-case/spending.set-receipt-threshold",
  "title": "Set Receipt Threshold",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/manage-policy",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s6"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "changes": [
    "aggregate/spending.policy"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/set-receipt-threshold.threshold-set",
      "title": "Threshold set",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The receipt threshold is set.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "bac7afcc"
    },
    {
      "type": "result",
      "id": "result/set-receipt-threshold.negative-threshold",
      "title": "Negative threshold",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.negative-threshold",
      "meaning": "The threshold is negative.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "6688dc4e"
    },
    {
      "type": "scenario",
      "id": "scenario/set-receipt-threshold.setting-the-threshold-succeeds",
      "title": "Setting the threshold succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "Finance agreed a new receipt threshold with the managers.",
      "when": "The manager sets the receipt threshold.",
      "result": "result/set-receipt-threshold.threshold-set",
      "then": "The receipt threshold is set.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "6acb36e6"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "14d07e70"
}
---

# Set Receipt Threshold

## Goal

A manager sets the receipt threshold so small expenses stay light to submit.

## What Happens

The manager sends the new threshold with its currency. Spending refuses a negative threshold. Otherwise the policy carries the new threshold from now on.
