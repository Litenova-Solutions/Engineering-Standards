---
{
  "type": "use-case",
  "id": "use-case/spending.approve-expense",
  "title": "Approve expense",
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
    "event/expense.expense-approved"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/approval.no-self-approval"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/approve-expense.approved",
      "title": "Approved",
      "owner": "expenses-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The expense is approved."
    },
    {
      "type": "result",
      "id": "result/approve-expense.own-expense",
      "title": "Own expense",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.own_expense",
      "httpStatus": 403,
      "meaning": "The approver submitted the expense."
    },
    {
      "type": "case",
      "id": "case/approve-expense.approving-a-submitted-expense-succeeds",
      "title": "Approving a submitted expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "An employee submitted an expense with its receipt.",
      "action": "The manager approves the expense.",
      "result": "result/approve-expense.approved",
      "expect": "The expense is approved."
    }
  ]
}
---

# Approve expense

A manager approves a submitted expense.
