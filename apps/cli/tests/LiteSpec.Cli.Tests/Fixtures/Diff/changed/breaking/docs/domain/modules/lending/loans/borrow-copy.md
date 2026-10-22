---
{
  "type": "use-case",
  "id": "use-case/lending.borrow-copy",
  "title": "Borrow copy",
  "owner": "lending-team",
  "status": "approved",
  "kind": "command",
  "needs": [
    "permission/borrow-copy"
  ],
  "anonymous": false,
  "reachedThrough": [
    "entry-point/library-app"
  ],
  "raises": [
    "event/loan.loan-borrowed"
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/borrow-copy.copy-unavailable",
      "title": "Copy unavailable",
      "owner": "lending-team",
      "status": "approved",
      "outcome": "refusal",
      "code": "lending.copy-not-available",
      "meaning": "The copy is on loan to another reader."
    },
    {
      "type": "result",
      "id": "result/borrow-copy.account-blocked",
      "title": "Account blocked",
      "owner": "lending-team",
      "status": "approved",
      "outcome": "refusal",
      "code": "lending.account-blocked",
      "meaning": "The account is blocked."
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
      "title": "Borrowing an available copy succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "An available copy sits on the shelf.",
      "when": "The reader borrows the copy.",
      "then": "The copy is lent.",
      "result": "result/borrow-copy.borrowed"
    },
    {
      "type": "scenario",
      "id": "scenario/borrow-copy.blocked-account-refuses",
      "title": "Blocked account refuses",
      "owner": "lending-team",
      "status": "approved",
      "given": "The account is blocked.",
      "when": "The reader borrows the copy.",
      "then": "The reader is told the account is blocked.",
      "result": "result/borrow-copy.account-blocked"
    }
  ]
}
---

# Borrow copy

A reader borrows an available copy.
