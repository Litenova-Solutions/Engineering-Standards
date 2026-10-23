---
{
  "type": "reaction",
  "id": "reaction/lending.remind-overdue",
  "title": "Remind overdue",
  "owner": "lending-team",
  "status": "reviewed",
  "on": [
    "event/loan.no-such-event"
  ],
  "issues": [
    "use-case/lending.return-copy"
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "2f88c832"
}
---

# Remind overdue

Readers with overdue loans get a reminder.
