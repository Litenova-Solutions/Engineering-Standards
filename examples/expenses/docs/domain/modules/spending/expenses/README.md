---
{
  "type": "aggregate",
  "id": "aggregate/spending.expense",
  "title": "Expense",
  "owner": "expenses-team",
  "status": "approved",
  "summary": "An expense is one work cost an employee submitted.",
  "states": [
    {
      "name": "Submitted",
      "meaning": "The expense waits for a decision."
    },
    {
      "name": "Approved",
      "meaning": "A manager approved the expense."
    },
    {
      "name": "Rejected",
      "meaning": "A manager rejected the expense."
    },
    {
      "name": "Reimbursed",
      "meaning": "Finance reimbursed the expense."
    }
  ],
  "transitions": [
    {
      "from": "Submitted",
      "to": "Approved",
      "by": "use-case/spending.approve-expense"
    },
    {
      "from": "Submitted",
      "to": "Rejected",
      "by": "use-case/spending.reject-expense"
    },
    {
      "from": "Approved",
      "to": "Reimbursed",
      "by": "use-case/spending.reimburse-expense"
    }
  ],
  "data": [
    {
      "name": "employee",
      "meaning": "The employee who submitted the expense.",
      "classification": "personal"
    },
    {
      "name": "amount",
      "meaning": "The exact amount with its currency.",
      "classification": "internal"
    },
    {
      "name": "receipt",
      "meaning": "The proof of payment, when one is attached.",
      "classification": "internal"
    },
    {
      "name": "state",
      "meaning": "The lifecycle state of the expense.",
      "classification": "internal"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/expense.receipt-required-above-threshold",
      "title": "Receipt required above threshold",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An expense above the policy threshold needs a receipt.",
      "governs": [
        "use-case/spending.submit-expense"
      ],
      "refusal": "result/submit-expense.receipt-missing",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approver-is-not-submitter",
      "title": "Approver is not submitter",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An approver is not the submitter.",
      "governs": [
        "use-case/spending.approve-expense"
      ],
      "refusal": "result/approve-expense.own-expense",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.no-self-approval"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.reimbursed-once",
      "title": "Reimbursed once",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "invariant",
      "statement": "An expense is reimbursed at most once.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.already-reimbursed",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "rule",
      "id": "rule/expense.approved-before-reimbursement",
      "title": "Approved before reimbursement",
      "owner": "expenses-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "An expense is reimbursed only after approval.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.not-approved",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-submitted",
      "title": "Expense submitted",
      "owner": "expenses-team",
      "status": "approved",
      "meaning": "An expense was submitted.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "employeeId"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-approved",
      "title": "Expense approved",
      "owner": "expenses-team",
      "status": "approved",
      "meaning": "An expense was approved.",
      "carries": [
        "expenseId",
        "approvedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-rejected",
      "title": "Expense rejected",
      "owner": "expenses-team",
      "status": "approved",
      "meaning": "An expense was rejected.",
      "carries": [
        "expenseId",
        "rejectedBy",
        "decidedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/expense.expense-reimbursed",
      "title": "Expense reimbursed",
      "owner": "expenses-team",
      "status": "approved",
      "meaning": "An expense was reimbursed.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "reimbursedAt"
      ]
    }
  ]
}
---

# Expense

An expense is one work cost an employee submitted.

## Transitions

| From | To | By |
|:--|:--|:--|
| Submitted | Approved | `use-case/spending.approve-expense` |
| Submitted | Rejected | `use-case/spending.reject-expense` |
| Approved | Reimbursed | `use-case/spending.reimburse-expense` |

## Data

| Name | Meaning | Classification |
|:--|:--|:--|
| employee | The employee who submitted the expense. | personal |
| amount | The exact amount with its currency. | internal |
| receipt | The proof of payment, when one is attached. | internal |
| state | The lifecycle state of the expense. | internal |
