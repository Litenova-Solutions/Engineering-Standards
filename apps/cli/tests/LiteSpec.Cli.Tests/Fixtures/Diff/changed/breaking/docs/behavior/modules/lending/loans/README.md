---
{
  "type": "aggregate",
  "id": "aggregate/lending.loan",
  "title": "Loan",
  "owner": "lending-team",
  "status": "reviewed",
  "states": [
    {
      "name": "Active",
      "meaning": "The loan is open."
    },
    {
      "name": "Returned",
      "meaning": "The copy came back."
    }
  ],
  "transitions": [
    {
      "from": "Active",
      "to": "Returned",
      "by": "use-case/lending.borrow-copy"
    }
  ],
  "data": [
    {
      "name": "dueDate",
      "meaning": "When the copy is due.",
      "classification": "internal"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/loan.has-one-borrower",
      "title": "Has one borrower",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "precondition",
      "statement": "A loan has one borrower.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ]
    },
    {
      "type": "rule",
      "id": "rule/loan.scan-before-leaving",
      "title": "Scan before leaving",
      "owner": "lending-team",
      "status": "reviewed",
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
      "type": "rule",
      "id": "rule/loan.id-checked-at-desk",
      "title": "Id checked at desk",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "precondition",
      "statement": "The desk checks the reader id before lending.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ]
    },
    {
      "type": "event",
      "id": "event/loan.loan-borrowed",
      "title": "Loan borrowed",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A copy was lent.",
      "carries": [
        "loanId",
        "copyId",
        "readerId",
        "dueDate"
      ]
    }
  ]
}
---

# Loan

A loan lends one copy to one reader.
