---
{
  "type": "use-case",
  "id": "use-case/lending.cancel-hold",
  "title": "Cancel hold",
  "owner": "lending-team",
  "status": "approved",
  "operation": "command",
  "needs": [
    "permission/place-hold"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [
    "event/hold.hold-cancelled"
  ],
  "reactsTo": [],
  "fulfils": [
    "requirement/borrowing.hold-pickup-window"
  ],
  "results": [
    "result/cancel-hold.cancelled",
    "result/cancel-hold.hold-ended"
  ],
  "cases": [
    "case/cancel-hold.cancelling-a-waiting-hold-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/cancel-hold.cancelled",
      "title": "Cancelled",
      "owner": "lending-team",
      "outcome": "success",
      "status": 200,
      "meaning": "The hold is cancelled."
    },
    {
      "type": "result",
      "id": "result/cancel-hold.hold-ended",
      "title": "Hold ended",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.hold_not_waiting",
      "status": 409,
      "meaning": "The hold already left the queue."
    },
    {
      "type": "case",
      "id": "case/cancel-hold.cancelling-a-waiting-hold-succeeds",
      "title": "Cancelling a waiting hold succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A reader holds a waiting hold.",
      "action": "The reader cancels the hold.",
      "result": "result/cancel-hold.cancelled",
      "expect": "The hold is cancelled."
    }
  ]
}
---

# Cancel hold

A reader cancels a waiting hold.
