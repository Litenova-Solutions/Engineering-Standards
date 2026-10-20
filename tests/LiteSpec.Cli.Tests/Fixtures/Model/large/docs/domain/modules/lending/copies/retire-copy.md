---
{
  "type": "use-case",
  "id": "use-case/lending.retire-copy",
  "title": "Retire copy",
  "owner": "lending-team",
  "status": "approved",
  "operation": "command",
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
  "reactsTo": [],
  "fulfils": [
    "requirement/borrowing.copy-shelf-home"
  ],
  "results": [
    "result/retire-copy.retired",
    "result/retire-copy.copy-on-loan"
  ],
  "cases": [
    "case/retire-copy.retiring-an-available-copy-succeeds"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/retire-copy.retired",
      "title": "Retired",
      "owner": "lending-team",
      "outcome": "success",
      "status": 200,
      "meaning": "The copy is retired."
    },
    {
      "type": "result",
      "id": "result/retire-copy.copy-on-loan",
      "title": "Copy on loan",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.copy_on_loan",
      "status": 409,
      "meaning": "The copy is on loan."
    },
    {
      "type": "case",
      "id": "case/retire-copy.retiring-an-available-copy-succeeds",
      "title": "Retiring an available copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "situation": "A copy sits available past weeding.",
      "action": "The librarian retires the copy.",
      "result": "result/retire-copy.retired",
      "expect": "The copy is retired."
    }
  ]
}
---

# Retire copy

A librarian retires a copy.
