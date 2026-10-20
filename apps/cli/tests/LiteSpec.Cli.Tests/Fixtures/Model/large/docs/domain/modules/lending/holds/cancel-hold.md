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
    "event/hold.hold-canceled"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/borrowing.hold-pickup-window"
  ],
  "results": [
    "result/cancel-hold.canceled",
    "result/cancel-hold.hold-ended"
  ],
  "cases": [
    "case/cancel-hold.canceling-a-waiting-hold-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/cancel-hold.canceled",
      "title": "Canceled",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The hold is canceled."
    },
    {
      "type": "result",
      "id": "result/cancel-hold.hold-ended",
      "title": "Hold ended",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.hold_not_waiting",
      "httpStatus": 409,
      "meaning": "The hold already left the queue."
    },
    {
      "type": "case",
      "id": "case/cancel-hold.canceling-a-waiting-hold-succeeds",
      "title": "Canceling a waiting hold succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A reader holds a waiting hold.",
      "action": "The reader cancels the hold.",
      "result": "result/cancel-hold.canceled",
      "expect": "The hold is canceled."
    }
  ]
}
---

# Cancel hold

A reader cancels a waiting hold.
