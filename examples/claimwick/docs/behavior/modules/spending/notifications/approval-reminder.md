---
{
  "type": "notification",
  "id": "notification/spending.approval-reminder",
  "title": "Approval Reminder",
  "owner": "claimwick-team",
  "status": "reviewed",
  "template": "Approval reminder",
  "audience": [
    "actor/manager"
  ],
  "channel": [
    "email"
  ],
  "consent": "Managers accept reminders with the approver role.",
  "frequency": "once",
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "e5ae0fec"
}
---

# Approval Reminder

The reminder names the expense and its waiting time. Each waiting expense earns one reminder.
