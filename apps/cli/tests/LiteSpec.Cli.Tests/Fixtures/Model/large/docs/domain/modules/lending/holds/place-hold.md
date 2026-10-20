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
  "cases": [
    "case/place-hold.placing-a-hold-succeeds"
  ],
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
    },
    {
      "type": "case",
      "id": "case/place-hold.placing-a-hold-succeeds",
      "title": "Placing a hold succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A copy is on loan to another reader.",
      "action": "The reader places a hold.",
      "result": "result/place-hold.placed",
      "expect": "The hold is placed."
    }
  ]
}
---

# Place hold

A reader places a hold on a copy.
