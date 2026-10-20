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
  "cases": [],
  "records": [
    {
      "type": "result",
      "id": "result/cancel-hold.cancelled",
      "title": "Cancelled",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 200,
      "meaning": "The hold is cancelled."
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
    }
  ]
}
---

# Cancel hold

A reader cancels a waiting hold.
