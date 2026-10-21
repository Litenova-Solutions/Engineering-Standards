---
{
  "type": "use-case",
  "id": "use-case/spending.reject-expense",
  "title": "Reject expense",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
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
  "reactsTo": [],
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
      "httpStatus": 200,
      "meaning": "The expense is rejected."
    },
    {
      "type": "result",
      "id": "result/reject-expense.not-submitted",
      "title": "Not submitted",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.not_submitted",
      "httpStatus": 409,
      "meaning": "The expense is already decided."
    },
    {
      "type": "case",
      "id": "case/reject-expense.rejecting-a-submitted-expense-succeeds",
      "title": "Rejecting a submitted expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "An employee submitted an expense outside the policy.",
      "action": "The manager rejects the expense with a reason.",
      "result": "result/reject-expense.rejected",
      "expect": "The expense is rejected."
    }
  ]
}
---

# Reject expense

A manager rejects a submitted expense.
