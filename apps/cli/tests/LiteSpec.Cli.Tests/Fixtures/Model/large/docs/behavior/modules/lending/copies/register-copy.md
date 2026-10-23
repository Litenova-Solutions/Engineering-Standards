---
{
  "type": "use-case",
  "id": "use-case/lending.register-copy",
  "title": "Register copy",
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
    "event/copy.copy-registered"
  ],
  "fulfills": [
    "requirement/borrowing.copy-shelf-home"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/register-copy.registered",
      "title": "Registered",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The copy is registered."
    },
    {
      "type": "result",
      "id": "result/register-copy.copy-already-registered",
      "title": "Copy already registered",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-already-registered",
      "meaning": "The copy is already registered."
    },
    {
      "type": "scenario",
      "id": "scenario/register-copy.registering-a-new-copy-succeeds",
      "title": "Registering a new copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A new copy arrives at the desk.",
      "when": "The librarian registers the copy.",
      "result": "result/register-copy.registered",
      "then": "The copy is registered."
    }
  ]
}
---

# Register copy

A librarian registers a new copy.
