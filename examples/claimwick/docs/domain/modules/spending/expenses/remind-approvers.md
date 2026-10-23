---
{
  "type": "use-case",
  "id": "use-case/spending.remind-approvers",
  "title": "Remind Approvers",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "reaction",
  "reachedThrough": [
    "entry-point/reminder-job"
  ],
  "raises": [],
  "trigger": {
    "deadline": "Three business days after submission without a decision."
  },
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/remind-approvers.reminded",
      "title": "Reminded",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The approver is reminded."
    },
    {
      "type": "scenario",
      "id": "scenario/remind-approvers.reminding-an-approver-succeeds",
      "title": "Reminding an approver succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "An expense waited three business days with no decision.",
      "when": "The reminder job runs.",
      "result": "result/remind-approvers.reminded",
      "then": "The approver is reminded."
    }
  ]
}
---

# Remind Approvers

## Goal

An approver learns that an expense still waits for a decision.

## What Happens

The reminder job scans the submitted expenses each night. Every expense past the deadline without a decision earns one reminder to its approver. Decided expenses are left alone.
