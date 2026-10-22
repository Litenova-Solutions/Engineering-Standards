---
{
  "type": "use-case",
  "id": "use-case/spending.approve-expense",
  "title": "Approve expense",
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
    "event/expense.expense-approved"
  ],
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
      "meaning": "The expense is approved."
    },
    {
      "type": "result",
      "id": "result/approve-expense.own-expense",
      "title": "Own expense",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.own-expense",
      "meaning": "The approver submitted the expense."
    },
    {
      "type": "scenario",
      "id": "scenario/approve-expense.approving-a-submitted-expense-succeeds",
      "title": "Approving a submitted expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "An employee submitted an expense with its receipt.",
      "when": "The manager approves the expense.",
      "result": "result/approve-expense.approved",
      "then": "The expense is approved."
    }
  ]
}
---

# Approve expense

A manager approves a submitted expense.
