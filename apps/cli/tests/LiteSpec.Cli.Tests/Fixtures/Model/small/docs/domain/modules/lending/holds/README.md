---
{
  "type": "business-record",
  "id": "business-record/lending.hold",
  "title": "Hold",
  "owner": "lending-team",
  "status": "approved",
  "codeName": "Hold",
  "states": [
    "Waiting",
    "Ready",
    "Canceled"
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/hold.names-one-copy",
      "title": "Names one copy",
      "owner": "lending-team",
      "status": "approved",
      "kind": "always-true",
      "enforcedBy": "aggregate",
      "statement": "A hold names one copy.",
      "governs": [
        "use-case/lending.place-hold"
      ],
      "refusal": "result/place-hold.hold-already-waiting",
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.hold-pickup-window"
      ]
    },
    {
      "type": "event",
      "id": "event/hold.hold-placed",
      "title": "Hold placed",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A hold was placed.",
      "carries": [
        "holdId",
        "copyId",
        "readerId"
      ]
    },
    {
      "type": "event",
      "id": "event/hold.hold-canceled",
      "title": "Hold canceled",
      "owner": "lending-team",
      "status": "approved",
      "meaning": "A hold was canceled.",
      "carries": [
        "holdId"
      ]
    }
  ]
}
---

# Hold

A hold queues one reader for one copy.
