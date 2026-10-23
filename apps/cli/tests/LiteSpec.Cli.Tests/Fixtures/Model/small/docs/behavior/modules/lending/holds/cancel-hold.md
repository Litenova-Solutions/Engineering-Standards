---
{
  "type": "use-case",
  "id": "use-case/lending.cancel-hold",
  "title": "Cancel hold",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/place-hold",
    "tenant": "own"
  },
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [
    "event/hold.hold-canceled"
  ],
  "fulfills": [
    "requirement/borrowing.hold-pickup-window"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/cancel-hold.canceled",
      "title": "Canceled",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The hold is canceled.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "04cfe11e"
    },
    {
      "type": "result",
      "id": "result/cancel-hold.hold-ended",
      "title": "Hold ended",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.hold-not-waiting",
      "meaning": "The hold already left the queue.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "fcfc0b84"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "bad41e2c"
}
---

# Cancel hold

A reader cancels a waiting hold.
