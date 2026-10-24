---
{
  "type": "reaction",
  "id": "reaction/spending.remind-approvers",
  "title": "Remind Approvers",
  "owner": "claimwick-team",
  "status": "reviewed",
  "on": [
    "event/expense.submitted"
  ],
  "if": "The expense waits past three business days with no decision.",
  "sends": "notification/spending.approval-reminder",
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ccefadbf"
}
---

# Remind Approvers

A submitted expense that waits past three business days without a decision earns one reminder to its approver. Decided expenses are left alone.
