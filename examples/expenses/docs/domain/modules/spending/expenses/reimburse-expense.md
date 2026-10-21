---
{
  "type": "use-case",
  "id": "use-case/spending.reimburse-expense",
  "title": "Reimburse expense",
  "owner": "expenses-team",
  "status": "approved",
  "operation": "command",
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
  "reactsTo": [],
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
      "httpStatus": 200,
      "meaning": "The expense is reimbursed."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.not-approved",
      "title": "Not approved",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.not_approved",
      "httpStatus": 409,
      "meaning": "The expense is not approved."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.already-reimbursed",
      "title": "Already reimbursed",
      "owner": "expenses-team",
      "outcome": "refusal",
      "code": "failure/spending.already_reimbursed",
      "httpStatus": 409,
      "meaning": "The expense is already reimbursed."
    },
    {
      "type": "case",
      "id": "case/reimburse-expense.reimbursing-an-approved-expense-succeeds",
      "title": "Reimbursing an approved expense succeeds",
      "owner": "expenses-team",
      "status": "approved",
      "situation": "A manager approved an expense.",
      "action": "Finance reimburses the expense.",
      "result": "result/reimburse-expense.reimbursed",
      "expect": "The expense is reimbursed."
    }
  ]
}
---

# Reimburse expense

Finance reimburses an approved expense.
