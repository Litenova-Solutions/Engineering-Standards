---
{
  "type": "external-system",
  "id": "external-system/payout-bank",
  "title": "Payout Bank",
  "owner": "claimwick-team",
  "status": "reviewed",
  "actor": "actor/finance",
  "sends": [
    "Approved payouts as one bank file per batch."
  ],
  "receives": [
    "A settlement report per payout batch."
  ],
  "failure": "The bank rejects a payout file, and finance fixes the entry and re-sends the batch.",
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "40462387"
}
---

# Payout Bank

## Summary

The payout bank moves reimbursed money to employees. Claimwick sends one bank file per batch and reads back a settlement report.
