---
{
  "type": "use-case",
  "id": "use-case/spending.reject-expense",
  "title": "Reject expense",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/approve-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [
    "event/expense.expense-rejected"
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/reject-expense.rejected",
      "title": "Rejected",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The expense is rejected."
    },
    {
      "type": "result",
      "id": "result/reject-expense.not-submitted",
      "title": "Not submitted",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.not-submitted",
      "meaning": "The expense is already decided."
    },
    {
      "type": "scenario",
      "id": "scenario/reject-expense.rejecting-a-submitted-expense-succeeds",
      "title": "Rejecting a submitted expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An employee submitted an expense outside the policy.",
      "when": "The manager rejects the expense with a reason.",
      "result": "result/reject-expense.rejected",
      "then": "The expense is rejected."
    }
  ]
}
---

# Reject expense

A manager rejects a submitted expense.
