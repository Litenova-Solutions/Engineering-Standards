---
{
  "type": "use-case",
  "id": "use-case/spending.reimburse-expense",
  "title": "Reimburse Expense",
  "owner": "claimwick-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/reimburse-expense"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [
    "event/expense.reimbursed"
  ],
  "fulfills": [
    "requirement/approval.single-reimbursement"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/reimburse-expense.reimbursed",
      "title": "Reimbursed",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The expense is reimbursed."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.not-approved",
      "title": "Not approved",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.not-approved",
      "meaning": "The expense is not approved."
    },
    {
      "type": "result",
      "id": "result/reimburse-expense.already-reimbursed",
      "title": "Already reimbursed",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.already-reimbursed",
      "meaning": "The expense is already reimbursed."
    },
    {
      "type": "scenario",
      "id": "scenario/reimburse-expense.reimbursing-an-approved-expense-succeeds",
      "title": "Reimbursing an approved expense succeeds",
      "owner": "claimwick-team",
      "status": "approved",
      "given": "A manager approved an expense.",
      "when": "Finance reimburses the expense.",
      "result": "result/reimburse-expense.reimbursed",
      "then": "The expense is reimbursed."
    }
  ]
}
---

# Reimburse Expense

## Goal

Finance pays an approved expense so the employee gets the money back.

## What Happens

Finance picks an approved expense. Spending refuses the payment when the expense is not approved or is already reimbursed. Otherwise the expense moves to Reimbursed, `event/expense.reimbursed` is raised, and the payout batch carries it to `external-system/payout-bank`.

## Risk

Money moves here: a double payment reaches the employee twice. The `rule/expense.reimbursed-once` rule guards it, and the payout bank settles each batch once.
