---
{
  "type": "use-case",
  "id": "use-case/lending.place-hold",
  "title": "Place hold",
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
    "event/hold.hold-placed"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/borrowing.hold-pickup-window"
  ],
  "results": [
    "result/place-hold.placed",
    "result/place-hold.hold-already-waiting"
  ],
  "cases": [],
  "records": [
    {
      "type": "result",
      "id": "result/place-hold.placed",
      "title": "Placed",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 201,
      "meaning": "The hold is placed."
    },
    {
      "type": "result",
      "id": "result/place-hold.hold-already-waiting",
      "title": "Hold already waiting",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.hold_already_waiting",
      "httpStatus": 409,
      "meaning": "A hold is already waiting."
    }
  ]
}
---

# Place hold

A reader places a hold on a copy.
