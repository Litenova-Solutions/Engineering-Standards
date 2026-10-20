---
{
  "type": "use-case",
  "id": "use-case/lending.register-copy",
  "title": "Register copy",
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
    "event/copy.copy-registered"
  ],
  "reactsTo": [],
  "fulfills": [
    "requirement/borrowing.copy-shelf-home"
  ],
  "results": [
    "result/register-copy.registered",
    "result/register-copy.copy-already-registered"
  ],
  "cases": [],
  "records": [
    {
      "type": "result",
      "id": "result/register-copy.registered",
      "title": "Registered",
      "owner": "lending-team",
      "outcome": "success",
      "httpStatus": 201,
      "meaning": "The copy is registered."
    },
    {
      "type": "result",
      "id": "result/register-copy.copy-already-registered",
      "title": "Copy already registered",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "failure/lending.copy_already_registered",
      "httpStatus": 409,
      "meaning": "The copy is already registered."
    }
  ]
}
---

# Register copy

A librarian registers a new copy.
