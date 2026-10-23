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
    },
    {
      "type": "scenario",
      "id": "scenario/cancel-hold.canceling-a-waiting-hold-succeeds",
      "title": "Canceling a waiting hold succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A reader holds a waiting hold.",
      "when": "The reader cancels the hold.",
      "result": "result/cancel-hold.canceled",
      "then": "The hold is canceled."
    }
  ]
}
---

# Cancel hold

A reader cancels a waiting hold.
