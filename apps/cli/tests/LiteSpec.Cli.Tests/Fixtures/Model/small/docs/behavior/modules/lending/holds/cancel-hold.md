---
{
  "type": "use-case",
  "id": "use-case/lending.cancel-hold",
  "title": "Cancel hold",
  "owner": "lending-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/place-hold"
  ],
  "anonymous": false,
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
      "meaning": "The hold is canceled."
    },
    {
      "type": "result",
      "id": "result/cancel-hold.hold-ended",
      "title": "Hold ended",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.hold-not-waiting",
      "meaning": "The hold already left the queue."
    }
  ]
}
---

# Cancel hold

A reader cancels a waiting hold.
