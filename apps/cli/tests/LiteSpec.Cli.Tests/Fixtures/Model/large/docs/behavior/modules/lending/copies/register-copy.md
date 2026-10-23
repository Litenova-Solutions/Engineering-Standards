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
  "serves": [
    "journey/borrow-and-return#s1"
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
    },
    {
      "type": "scenario",
      "id": "scenario/register-copy.registering-a-new-copy-succeeds",
      "title": "Registering a new copy succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A new copy arrives at the desk.",
      "when": "The librarian registers the copy.",
      "result": "result/register-copy.registered",
      "then": "The copy is registered.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "d5b0cd27"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "dd11381e"
}
---

# Register copy

A librarian registers a new copy.
