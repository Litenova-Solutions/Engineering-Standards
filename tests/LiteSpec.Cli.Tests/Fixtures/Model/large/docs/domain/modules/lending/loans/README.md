---
{
  "type": "business-record",
  "id": "business-record/lending.loan",
  "title": "Loan",
  "owner": "lending-team",
  "status": "approved",
  "codeName": "Loan",
  "states": [
    "Active",
    "Returned",
    "Overdue"
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/loan.has-one-borrower",
      "title": "Has one borrower",
      "owner": "lending-team",
      "status": "approved",
      "kind": "always-true",
      "enforcedBy": "aggregate",
      "statement": "A loan has one borrower.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "refusal": "result/borrow-copy.copy-unavailable",
      "basedOn": [],
      "fulfils": [
        "requirement/borrowing.max-active-loans"
      ]
    },
    {
      "type": "rule",
      "id": "rule/loan.borrowed-copy-never-leaves-unscanned",
      "title": "Borrowed copy never leaves unscanned",
      "owner": "lending-team",
      "status": "approved",
      "kind": "checked-before",
      "enforcedBy": "validator",
      "statement": "A borrowed copy never leaves unscanned.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "basedOn": [],
      "fulfils": [
        "requirement/borrowing.loan-period-days"
      ]
    },
    {
      "type": "event",
      "id": "event/loan.loan-borrowed",
      "title": "Loan borrowed",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A copy was lent.",
      "carries": [
        "loanId",
        "copyId",
        "readerId",
        "dueDate"
      ]
    },
    {
      "type": "event",
      "id": "event/loan.loan-returned",
      "title": "Loan returned",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A copy was returned.",
      "carries": [
        "loanId",
        "returnedAt"
      ]
    },
    {
      "type": "event",
      "id": "event/loan.loan-extended",
      "title": "Loan extended",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A loan was extended.",
      "carries": [
        "loanId",
        "newDueDate"
      ]
    }
  ]
}
---

# Loan

A loan lends one copy to one reader.
