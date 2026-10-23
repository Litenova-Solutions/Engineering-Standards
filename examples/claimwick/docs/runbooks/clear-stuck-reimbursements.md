---
{
  "type": "runbook",
  "id": "runbook/clear-stuck-reimbursements",
  "title": "Clear Stuck Reimbursements",
  "owner": "claimwick-team",
  "status": "approved",
  "trigger": "A reimbursement stays queued past one business day.",
  "severity": "high"
}
---

# Clear Stuck Reimbursements

## Impact

Queued reimbursements pile up, and employees wait for money past the promised days.

## Prerequisites

Access to the payout queue and the finance contact list.

## Procedure

List the queued reimbursements. Retry each one. Notify finance of the batch that still stands.

## Verification

The queue holds no reimbursement older than one business day.

## Rollback or Recovery

A retried payout that doubled is reclaimed through `external-system/payout-bank`.

## Escalation

When the queue still stands after one retry round, finance calls the bank and freezes new batches.
