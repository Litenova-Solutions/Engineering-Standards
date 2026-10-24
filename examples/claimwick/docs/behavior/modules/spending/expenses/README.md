---
{
  "type": "aggregate",
  "id": "aggregate/spending.expense",
  "title": "Expense",
  "owner": "claimwick-team",
  "status": "reviewed",
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
  "dataClasses": [
    {
      "name": "submitter-contact",
      "classification": "personal",
      "fields": [
        "employee"
      ],
      "onErasure": "pseudonymise",
      "basis": "business",
      "period": "P7Y",
      "enforcedBy": "job/spending.erase-expired-personal-data"
    },
    {
      "name": "expense-ledger",
      "classification": "internal",
      "fields": [
        "amount",
        "receipt",
        "state"
      ],
      "onErasure": "retain",
      "basis": "statute",
      "period": "P7Y",
      "enforcedBy": "record-expiry"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/expense.receipt-required-above-threshold",
      "title": "Receipt required above threshold",
      "owner": "claimwick-team",
      "status": "reviewed",
      "kind": "precondition",
      "statement": "An expense above the policy threshold needs a receipt.",
      "governs": [
        "use-case/spending.submit-expense"
      ],
      "refusal": "result/submit-expense.receipt-missing",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.receipt-over-threshold"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "240b4d9a"
    },
    {
      "type": "rule",
      "id": "rule/expense.approver-is-not-submitter",
      "title": "Approver is not submitter",
      "owner": "claimwick-team",
      "status": "reviewed",
      "kind": "precondition",
      "statement": "An approver is not the submitter.",
      "governs": [
        "use-case/spending.approve-expense"
      ],
      "refusal": "result/approve-expense.own-expense",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.no-self-approval"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8c4454b9"
    },
    {
      "type": "rule",
      "id": "rule/expense.reimbursed-once",
      "title": "Reimbursed once",
      "owner": "claimwick-team",
      "status": "reviewed",
      "kind": "invariant",
      "statement": "An expense is reimbursed at most once.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.already-reimbursed",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "0de76b31"
    },
    {
      "type": "rule",
      "id": "rule/expense.approved-before-reimbursement",
      "title": "Approved before reimbursement",
      "owner": "claimwick-team",
      "status": "reviewed",
      "kind": "precondition",
      "statement": "An expense is reimbursed only after approval.",
      "governs": [
        "use-case/spending.reimburse-expense"
      ],
      "refusal": "result/reimburse-expense.not-approved",
      "basedOn": [],
      "fulfills": [
        "requirement/approval.single-reimbursement"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "dafc1317"
    },
    {
      "type": "event",
      "id": "event/expense.submitted",
      "title": "Expense submitted",
      "owner": "claimwick-team",
      "status": "reviewed",
      "meaning": "An expense was submitted.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "employeeId"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "1a85c98d"
    },
    {
      "type": "event",
      "id": "event/expense.approved",
      "title": "Expense approved",
      "owner": "claimwick-team",
      "status": "reviewed",
      "meaning": "An expense was approved.",
      "carries": [
        "expenseId",
        "approvedBy",
        "decidedAt"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "4d4e789b"
    },
    {
      "type": "event",
      "id": "event/expense.rejected",
      "title": "Expense rejected",
      "owner": "claimwick-team",
      "status": "reviewed",
      "meaning": "An expense was rejected.",
      "carries": [
        "expenseId",
        "rejectedBy",
        "decidedAt"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "931fe322"
    },
    {
      "type": "event",
      "id": "event/expense.reimbursed",
      "title": "Expense reimbursed",
      "owner": "claimwick-team",
      "status": "reviewed",
      "meaning": "An expense was reimbursed.",
      "carries": [
        "expenseId",
        "amount",
        "currency",
        "reimbursedAt"
      ],
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "f2df7198"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ee9b2357"
}
---

# Expense

An expense is one work cost an employee submitted.

## Transitions

| From | To | Triggered By |
|:--|:--|:--|
| Submitted | Approved | `use-case/spending.approve-expense` |
| Submitted | Rejected | `use-case/spending.reject-expense` |
| Approved | Reimbursed | `use-case/spending.reimburse-expense` |

## Data

| Name | Meaning | Classification | Data Class |
|:--|:--|:--|:--|
| employee | The employee who submitted the expense. | personal | submitter-contact |
| amount | The exact amount with its currency. | internal | expense-ledger |
| receipt | The proof of payment, when one is attached. | internal | expense-ledger |
| state | The lifecycle state of the expense. | internal | expense-ledger |
