---
{
  "type": "use-case",
  "id": "use-case/spending.reject-expense",
  "title": "Reject Expense",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/approve-expense",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s3"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [
    "event/expense.rejected"
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "changes": [
    "aggregate/spending.expense"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/reject-expense.rejected",
      "title": "Rejected",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expense is rejected.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8a09db39"
    },
    {
      "type": "result",
      "id": "result/reject-expense.not-submitted",
      "title": "Not submitted",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.not-submitted",
      "meaning": "The expense is already decided.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "b2983ba6"
    },
    {
      "type": "scenario",
      "id": "scenario/reject-expense.rejecting-a-submitted-expense-succeeds",
      "title": "Rejecting a submitted expense succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "An employee submitted an expense outside the policy.",
      "when": "The manager rejects the expense with a reason.",
      "result": "result/reject-expense.rejected",
      "then": "The expense is rejected.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "69289937"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ec7a062f"
}
---

# Reject Expense

## Goal

A manager turns down a submitted expense that falls outside the policy.

## What Happens

The manager opens a submitted expense and gives a reason. Spending refuses the decision when the expense is already decided. Otherwise the expense moves to Rejected and `event/expense.rejected` is raised.
