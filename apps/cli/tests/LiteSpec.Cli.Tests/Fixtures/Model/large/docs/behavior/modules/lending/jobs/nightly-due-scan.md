---
{
  "type": "job",
  "id": "job/lending.nightly-due-scan",
  "title": "Nightly due scan",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "scheduled",
  "schedule": {
    "every": "P1D",
    "timezone": "Europe/Amsterdam"
  },
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "9bd6482e"
}
---

# Nightly Due Scan

Each night the scan marks the loans that passed their due date.
