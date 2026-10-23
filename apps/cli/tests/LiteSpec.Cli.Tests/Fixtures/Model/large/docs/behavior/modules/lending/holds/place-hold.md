---
{
  "type": "use-case",
  "id": "use-case/lending.place-hold",
  "title": "Place hold",
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
    "event/hold.hold-placed"
  ],
  "fulfills": [
    "requirement/borrowing.hold-pickup-window"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/place-hold.placed",
      "title": "Placed",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The hold is placed."
    },
    {
      "type": "result",
      "id": "result/place-hold.hold-already-waiting",
      "title": "Hold already waiting",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.hold-already-waiting",
      "meaning": "A hold is already waiting."
    },
    {
      "type": "scenario",
      "id": "scenario/place-hold.placing-a-hold-succeeds",
      "title": "Placing a hold succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A copy is on loan to another reader.",
      "when": "The reader places a hold.",
      "result": "result/place-hold.placed",
      "then": "The hold is placed."
    }
  ]
}
---

# Place hold

A reader places a hold on a copy.
