---
{
  "type": "aggregate",
  "id": "aggregate/lending.copy",
  "title": "Copy",
  "owner": "lending-team",
  "status": "approved",
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
      "status": "approved",
      "kind": "invariant",
      "statement": "A copy has one home shelf.",
      "governs": [
        "use-case/lending.register-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.copy-shelf-home"
      ]
    },
    {
      "type": "event",
      "id": "event/copy.copy-registered",
      "title": "Copy registered",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A copy was registered.",
      "carries": [
        "copyId",
        "shelf"
      ]
    },
    {
      "type": "event",
      "id": "event/copy.copy-retired",
      "title": "Copy retired",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A copy was retired.",
      "carries": [
        "copyId"
      ]
    }
  ]
}
---

# Copy

A copy is one physical item the library lends.
