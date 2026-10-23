---
{
  "type": "use-case",
  "id": "use-case/lending.register-copy",
  "title": "Register copy",
  "owner": "lending-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/manage-copies",
    "tenant": "own"
  },
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
      "meaning": "The copy is registered.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "30ca4281"
    },
    {
      "type": "result",
      "id": "result/register-copy.copy-already-registered",
      "title": "Copy already registered",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-already-registered",
      "meaning": "The copy is already registered.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "71afb1ee"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "54134e07"
}
---

# Register copy

A librarian registers a new copy.
