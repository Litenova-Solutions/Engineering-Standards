---
{
  "type": "use-case",
  "id": "use-case/spending.erase-personal-data",
  "title": "Erase Personal Data",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/erase-personal-data",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s8"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [],
  "fulfills": [
    "requirement/approval.erase-after-retention"
  ],
  "changes": [
    "aggregate/spending.expense"
  ],
  "risk": [
    "personal-data"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/erase-personal-data.erased",
      "title": "Erased",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The personal data of the expense is erased.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "621f4965"
    },
    {
      "type": "scenario",
      "id": "scenario/erase-personal-data.erasing-personal-data-succeeds",
      "title": "Erasing personal data succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "An expense was reimbursed and its retention ended.",
      "when": "Finance erases the personal data of the expense.",
      "result": "result/erase-personal-data.erased",
      "then": "The personal data of the expense is erased.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8f6cf1e9"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ab2a1e85"
}
---

# Erase Personal Data

## Goal

Finance erases the personal data of an old expense so nothing personal is kept past its need.

## What Happens

Finance names a decided expense whose retention ended. Spending erases the personal data the expense holds and keeps the bare business facts. The bare facts stay for the tax file.

## Risk

Personal data is erased here: erasing the wrong expense cannot be undone. Finance names one expense at a time, and only past its retention.
