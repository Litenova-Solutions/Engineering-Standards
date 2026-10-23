---
{
  "type": "aggregate",
  "id": "aggregate/lending.hold",
  "title": "Hold",
  "owner": "lending-team",
  "status": "reviewed",
  "states": [
    {
      "name": "Waiting",
      "meaning": "The hold waits for its copy."
    },
    {
      "name": "Ready",
      "meaning": "The copy waits on the pickup shelf."
    },
    {
      "name": "Canceled",
      "meaning": "The reader gave up the hold."
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/hold.names-one-copy",
      "title": "Names one copy",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "invariant",
      "statement": "A hold names one copy.",
      "governs": [
        "use-case/lending.place-hold"
      ],
      "refusal": "result/place-hold.hold-already-waiting",
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.hold-pickup-window"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "b0b109d2"
    },
    {
      "type": "event",
      "id": "event/hold.hold-placed",
      "title": "Hold placed",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A hold was placed.",
      "carries": [
        "holdId",
        "copyId",
        "readerId"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8c894da2"
    },
    {
      "type": "event",
      "id": "event/hold.hold-canceled",
      "title": "Hold canceled",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "A hold was canceled.",
      "carries": [
        "holdId"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "76cfa162"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "eaebf948"
}
---

# Hold

A hold queues one reader for one copy.
