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
      "statement": "A copy has one home shelf.",
      "governs": [
        "use-case/lending.register-copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.copy-shelf-home"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "975318c6"
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
    },
    {
      "type": "rule",
      "id": "rule/copy.hold-reservation",
      "title": "Hold reservation",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "reservation",
      "statement": "A placed hold reserves its copy.",
      "governs": [
        "use-case/lending.place-hold"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.hold-pickup-window"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "f42ce465"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "961af180"
}
---

# Copy

A copy is one physical item the library lends.
