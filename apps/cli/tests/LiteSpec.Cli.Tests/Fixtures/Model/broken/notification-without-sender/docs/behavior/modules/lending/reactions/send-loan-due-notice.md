---
{
  "type": "reaction",
  "id": "reaction/lending.send-loan-due-notice",
  "title": "Send loan due notice",
  "owner": "lending-team",
  "status": "reviewed",
  "on": [
    "event/loan.loan-borrowed"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "7337e44f",
  "effects": [
    {
      "issues": "use-case/lending.return-copy",
      "timing": "async"
    }
  ]
}
---

# Send Loan Due Notice

Every borrowed loan earns one due notice for its reader.
