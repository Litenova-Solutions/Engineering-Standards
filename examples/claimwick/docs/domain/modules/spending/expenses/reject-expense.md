---
{
  "type": "use-case",
  "id": "use-case/spending.reject-expense",
  "title": "Reject Expense",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/approve-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [
    "event/expense.rejected"
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/reject-expense.rejected",
      "title": "Rejected",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expense is rejected."
    },
    {
      "type": "result",
      "id": "result/reject-expense.not-submitted",
      "title": "Not submitted",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.not-submitted",
      "meaning": "The expense is already decided."
    },
    {
      "type": "scenario",
      "id": "scenario/reject-expense.rejecting-a-submitted-expense-succeeds",
      "title": "Rejecting a submitted expense succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "An employee submitted an expense outside the policy.",
      "when": "The manager rejects the expense with a reason.",
      "result": "result/reject-expense.rejected",
      "then": "The expense is rejected."
    }
  ]
}
---

# Reject Expense

## Goal

A manager turns down a submitted expense that falls outside the policy.

## What Happens

The manager opens a submitted expense and gives a reason. Spending refuses the decision when the expense is already decided. Otherwise the expense moves to Rejected and `event/expense.rejected` is raised.
