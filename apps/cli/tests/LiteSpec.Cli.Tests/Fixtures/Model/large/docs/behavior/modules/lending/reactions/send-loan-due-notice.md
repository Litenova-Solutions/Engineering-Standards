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
  "sends": "notification/lending.loan-due",
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "dac45342"
}
---

# Send Loan Due Notice

Every borrowed loan earns one due notice for its reader.
