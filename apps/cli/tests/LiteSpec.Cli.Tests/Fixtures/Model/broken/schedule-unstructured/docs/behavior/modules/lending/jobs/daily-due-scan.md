---
{
  "type": "job",
  "id": "job/lending.daily-due-scan",
  "title": "Daily due scan",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "scheduled",
  "schedule": {
    "timezone": "Europe/Amsterdam"
  },
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "5798da8f"
}
---

# Daily due scan

Each day the scan marks the loans that passed their due date.
