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
      "approvedHash": "5de82a4d"
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
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.list-loans-latency",
      "title": "List loans latency",
      "owner": "lending-team",
      "status": "approved",
      "kind": "quality",
      "statement": "Listing loans answers quickly.",
      "measure": "p95 latency",
      "by": "under 200 ms",
      "basedOn": [],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "fcb7bef8"
    }
  ]
}
---

# Borrowing

Borrowing covers loans and holds.
