---
{
  "type": "use-case",
  "id": "use-case/lending.retire-copy",
  "title": "Retire copy",
  "owner": "lending-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/manage-copies"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [
    "event/copy.copy-retired"
  ],
  "fulfills": [
    "requirement/borrowing.copy-shelf-home"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/retire-copy.retired",
      "title": "Retired",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The copy is retired."
    },
    {
      "type": "result",
      "id": "result/retire-copy.copy-on-loan",
      "title": "Copy on loan",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-on-loan",
      "meaning": "The copy is on loan."
    }
  ]
}
---

# Retire copy

A librarian retires a copy.
