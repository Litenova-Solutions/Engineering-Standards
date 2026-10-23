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
    },
    {
      "name": "Overdue",
      "meaning": "The loan passed its due date."
    }
  ],
  "data": [
    {
      "name": "borrower-email",
      "meaning": "The address overdue notices go to.",
      "classification": "personal",
      "dataClass": "Borrower identity"
    }
  ],
  "dataClasses": [
    {
      "name": "Borrower identity",
      "classification": "personal",
      "fields": [
        "borrower-email"
      ],
      "onErasure": "erase",
      "basis": "business",
      "period": "Until the loan closes plus 30 days.",
      "enforcedBy": "record-expiry"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/loan.has-one-borrower",
      "title": "Has one borrower",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "invariant",
      "statement": "A loan has one borrower.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "refusal": "result/borrow-copy.copy-unavailable",
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "b29a7276"
    },
    {
      "type": "rule",
      "id": "rule/loan.borrowed-copy-never-leaves-unscanned",
      "title": "Borrowed copy never leaves unscanned",
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
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "6d036cd3"
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
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "fa568448"
    },
    {
      "type": "event",
      "id": "event/loan.loan-returned",
      "title": "Loan returned",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A copy was returned.",
      "carries": [
        "loanId",
        "returnedAt"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "654dbb1f"
    },
    {
      "type": "event",
      "id": "event/loan.loan-extended",
      "title": "Loan extended",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A loan was extended.",
      "carries": [
        "loanId",
        "newDueDate"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "63471a18"
    },
    {
      "type": "rule",
      "id": "rule/loan.late-fee",
      "title": "Late fee",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "calculation",
      "statement": "A late fee is 10 cents per day past due.",
      "governs": [
        "use-case/lending.borrow-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.loan-period-days"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "948f0c71"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "00926daa"
}
---

# Loan

A loan lends one copy to one reader.
