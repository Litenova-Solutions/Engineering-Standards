---
{
  "type": "business-record",
  "id": "business-record/lending.copy",
  "title": "Copy",
  "owner": "lending-team",
  "status": "approved",
  "codeName": "Copy",
  "states": [
    "Available",
    "OnLoan",
    "Retired"
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/copy.has-one-home-shelf",
      "title": "Has one home shelf",
      "owner": "lending-team",
      "status": "approved",
      "kind": "always-true",
      "enforcedBy": "aggregate",
      "statement": "A copy has no home shelf when retired.",
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
