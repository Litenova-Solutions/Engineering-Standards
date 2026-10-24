---
{
  "type": "requirement-page",
  "title": "Approval",
  "owner": "claimwick-team",
  "status": "approved",
  "reviewBy": "2027-04-01",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/approval.decided-within-five-days",
      "title": "Decided within five days",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "Each submitted expense is decided within five business days.",
      "rationale": "Late decisions stall employees and payouts.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [
        "research/approval-time-benchmarks"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8633bda2"
    },
    {
      "type": "requirement",
      "id": "requirement/approval.receipt-over-threshold",
      "title": "Receipt over threshold",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "An expense above the receipt threshold carries a receipt.",
      "rationale": "Proof above the line keeps the tax file defensible.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [
        "constraint/tax-receipt-retention"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "1767aa48"
    },
    {
      "type": "requirement",
      "id": "requirement/approval.no-self-approval",
      "title": "No self approval",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "Nobody approves their own expense.",
      "rationale": "A second pair of eyes keeps approvals honest.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "2dca57ec"
    },
    {
      "type": "requirement",
      "id": "requirement/approval.single-reimbursement",
      "title": "Single reimbursement",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "An approved expense is reimbursed at most once.",
      "rationale": "A double payment is hard to take back.",
      "feature": [
        "feature/approval-reminders"
      ],
      "basedOn": [],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "0d1c59cb"
    },
    {
      "type": "requirement",
      "id": "requirement/approval.erase-after-retention",
      "title": "Erase after retention",
      "owner": "claimwick-team",
      "status": "approved",
      "kind": "functional",
      "statement": "The personal data of a decided expense is erased after its retention.",
      "rationale": "Past its need, personal data is a risk with no use.",
      "basedOn": [
        "constraint/tax-receipt-retention"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "d94fb08d"
    }
  ]
}
---

# Approval

## Summary

Approval covers decisions, receipts, and reimbursements.

## The Situation

Expenses arrive daily, and each one needs a timely decision with proof where the policy asks for it.

## What We Do

Every submitted expense is decided within five business days. Expenses above the receipt threshold carry a receipt. Nobody approves their own expense, and each approved expense is reimbursed at most once. The personal data of a decided expense is erased after its retention.

## Why It Is Better

Employees learn the outcome within days instead of weeks, and finance pays from a file it can defend.

## Example

Ava submits a 48.90 EUR train fare with its receipt on Monday. Ben approves it on Tuesday. Cara reimburses it on Friday, and Ava sees the paid state in her list.

## Costs and Risks

Managers spend a few minutes daily on decisions. A missed reminder still stalls an expense until the next run.

## How Sure We Are

The decision in decision/0001-receipt-threshold sets the threshold, and research/approval-time-benchmarks backs the five-day target.

## Position

Approval is the heart of Claimwick: submit, decide, reimburse, then export.

## Refusals

Expenses above the threshold with no receipt are refused. Self-approval is refused. A second reimbursement of one expense is refused.
