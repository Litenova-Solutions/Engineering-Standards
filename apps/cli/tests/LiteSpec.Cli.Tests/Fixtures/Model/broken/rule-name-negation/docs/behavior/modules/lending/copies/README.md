---
{
  "type": "aggregate",
  "id": "aggregate/lending.copy",
  "title": "Copy",
  "owner": "lending-team",
  "status": "reviewed",
  "states": [
    {
      "name": "Available",
      "meaning": "The copy sits on its shelf."
    },
    {
      "name": "OnLoan",
      "meaning": "A reader holds the copy."
    },
    {
      "name": "Retired",
      "meaning": "The copy left lending."
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/copy.has-one-home-shelf",
      "title": "Has one home shelf",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "invariant",
      "statement": "A copy has no home shelf when retired.",
      "governs": [
        "use-case/lending.register-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.copy-shelf-home"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "518def7d"
    },
    {
      "type": "event",
      "id": "event/copy.copy-registered",
      "title": "Copy registered",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A copy was registered.",
      "carries": [
        "copyId",
        "shelf"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8acc02e9"
    },
    {
      "type": "event",
      "id": "event/copy.copy-retired",
      "title": "Copy retired",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A copy was retired.",
      "carries": [
        "copyId"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "60f77ccc"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "9b0025f9"
}
---

# Copy

A copy is one physical item the library lends.
