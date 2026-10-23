---
{
  "type": "requirement-page",
  "title": "Borrowing",
  "owner": "lending-team",
  "status": "approved",
  "reviewBy": "2027-04-01",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/borrowing.max-active-loans",
      "title": "Max active loans",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A reader holds at most five active loans.",
      "basedOn": [],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "d60bf7a6",
      "except": {
        "when": "The reader is a librarian testing the desk."
      }
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.loan-period-days",
      "title": "Loan period days",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A loan lasts 21 days.",
      "basedOn": [],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "5a16abaa"
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.hold-pickup-window",
      "title": "Hold pickup window",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A ready hold waits seven days.",
      "basedOn": [],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "d41032c8"
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.copy-shelf-home",
      "title": "Copy shelf home",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A copy lives on one home shelf.",
      "basedOn": [],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "f39ea9be"
    }
  ]
}
---

# Borrowing

Borrowing covers loans and holds.
