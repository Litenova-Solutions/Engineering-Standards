---
{
  "type": "use-case",
  "id": "use-case/lending.place-hold",
  "title": "Place hold",
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
      "meaning": "The hold is placed.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "f1314eda"
    },
    {
      "type": "result",
      "id": "result/place-hold.hold-already-waiting",
      "title": "Hold already waiting",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.hold-already-waiting",
      "meaning": "A hold is already waiting.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "7b186cbc"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "b3ee3c96"
}
---

# Place hold

A reader places a hold on a copy.
