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
      "statement": "A reader holds at most three active loans.",
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
      "measure": "p99 latency",
      "by": "under 200 ms",
      "basedOn": []
    }
  ]
}
---

# Borrowing

Borrowing covers loans and holds.
