---
{
  "type": "aggregate",
  "id": "aggregate/lending.loan",
  "title": "Loan",
  "owner": "lending-team",
  "status": "approved",
  "states": [
    {
      "name": "Active",
      "meaning": "The loan is open."
    },
    {
      "name": "Returned",
      "meaning": "The copy came back."
    },
    {
      "name": "Overdue",
      "meaning": "The loan passed its due date."
    }
  ],
  "transitions": [
    {
      "from": "Active",
      "to": "Returned",
      "by": "use-case/lending.return-copy"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/loan.has-one-borrower",
      "title": "Has one borrower",
      "owner": "lending-team",
      "status": "approved",
      "kind": "invariant",
      "statement": "A loan has one borrower.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "refusal": "result/borrow-copy.copy-unavailable",
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ]
    },
    {
      "type": "rule",
      "id": "rule/loan.borrowed-copy-never-leaves-unscanned",
      "title": "Borrowed copy never leaves unscanned",
      "owner": "lending-team",
      "status": "approved",
      "kind": "precondition",
      "statement": "A borrowed copy never leaves unscanned.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "basedOn": [],
      "fulfills": [
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
