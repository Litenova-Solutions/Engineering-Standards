---
{
  "type": "use-case",
  "id": "use-case/spending.reimburse-expense",
  "title": "Reimburse expense",
  "owner": "expenses-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/reimburse-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/expenses-app"
  ],
  "raises": [
    "event/expense.expense-reimbursed"
  ],
  "fulfills": [
    "requirement/approval.single-reimbursement"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/reimburse-expense.reimbursed",
      "title": "Reimbursed",
      "owner": "expenses-team",
      "outcome": "success",
      "meaning": "The expense is reimbursed."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.not-approved",
      "title": "Not approved",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.not-approved",
      "meaning": "The expense is not approved."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.already-reimbursed",
      "title": "Already reimbursed",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "spending.already-reimbursed",
      "meaning": "The expense is already reimbursed."
    },
    {
      "type": "scenario",
      "id": "scenario/reimburse-expense.reimbursing-an-approved-expense-succeeds",
      "title": "Reimbursing an approved expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "given": "A manager approved an expense.",
      "when": "Finance reimburses the expense.",
      "result": "result/reimburse-expense.reimbursed",
      "then": "The expense is reimbursed."
    }
  ]
}
---

# Reimburse expense

Finance reimburses an approved expense.
