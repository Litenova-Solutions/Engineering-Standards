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
      "title": "Maximum active loans",
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
      "id": "requirement/borrowing.search-speed",
      "title": "Search speed",
      "owner": "lending-team",
      "status": "approved",
      "kind": "quality",
      "statement": "Search answers quickly.",
      "measure": "p95 latency",
      "by": "under 200 ms",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.quiet-hours",
      "title": "Quiet hours",
      "owner": "lending-team",
      "status": "approved",
      "decider": "lending-team",
      "decideBy": "2027-01-01",
      "kind": "functional",
      "statement": "The library keeps quiet hours.",
      "basedOn": []
    },
    {
      "type": "requirement",
      "id": "requirement/borrowing.hold-pickup-window",
      "title": "Hold pickup window",
      "owner": "lending-team",
      "status": "draft",
      "decider": "lending-team",
      "decideBy": "2027-02-01",
      "kind": "functional",
      "statement": "A ready hold waits seven days.",
      "basedOn": []
    }
  ]
}
---

# Borrowing

Borrowing covers loans and holds.
