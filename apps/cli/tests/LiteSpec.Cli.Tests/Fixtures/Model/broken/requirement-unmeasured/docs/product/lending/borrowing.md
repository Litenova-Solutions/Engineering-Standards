---
{
  "type": "requirement-page",
  "title": "Borrowing",
  "owner": "lending-team",
  "status": "approved",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/borrowing.max-active-loans",
      "title": "Max active loans",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A reader holds at most five active loans.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.loan-period-days",
      "title": "Loan period days",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A loan lasts 21 days.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.hold-pickup-window",
      "title": "Hold pickup window",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A ready hold waits seven days.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.copy-shelf-home",
      "title": "Copy shelf home",
      "owner": "lending-team",
      "status": "approved",
      "kind": "functional",
      "statement": "A copy lives on one home shelf.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.list-loans-latency",
      "title": "List loans latency",
      "owner": "lending-team",
      "status": "approved",
      "kind": "quality",
      "statement": "Listing loans answers within 300 milliseconds at p95.",
      "measure": "p95 latency of listing loans",
      "by": "2027-01-01",
      "basedOn": []
    }
  ]
}
---

# Borrowing

Borrowing covers loans and holds.
