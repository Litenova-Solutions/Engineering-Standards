---
{
  "type": "use-case",
  "id": "use-case/lending.retire-copy",
  "title": "Retire copy",
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
    "event/copy.copy-retired"
  ],
  "serves": [
    "goal/faster-pickup"
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
      "meaning": "The copy is retired.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "a2b8df6a"
    },
    {
      "type": "result",
      "id": "result/retire-copy.copy-on-loan",
      "title": "Copy on loan",
      "owner": "lending-team",
      "outcome": "refusal",
      "code": "lending.copy-on-loan",
      "meaning": "The copy is on loan.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "a8f80bec"
    },
    {
      "type": "scenario",
      "id": "scenario/retire-copy.retiring-an-available-copy-succeeds",
      "title": "Retiring an available copy succeeds",
      "owner": "lending-team",
      "status": "reviewed",
      "given": "A copy sits available past weeding.",
      "when": "The librarian retires the copy.",
      "result": "result/retire-copy.retired",
      "then": "The copy is retired.",
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "ea5fd93c"
    }
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ed810f0e"
}
---

# Retire copy

A librarian retires a copy.
