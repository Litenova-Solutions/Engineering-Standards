---
{
  "type": "journey",
  "id": "journey/borrow-and-return",
  "title": "Borrow and return",
  "owner": "lending-team",
  "status": "approved",
  "actor": "actor/reader",
  "goal": "Borrow and return a copy.",
  "finishedWhen": "The reader holds the copy, then the copy sits back on its shelf.",
  "steps": [
    {
      "id": "s1",
      "says": "The librarian registers the copy on its home shelf.",
      "actor": "actor/librarian"
    },
    {
      "id": "s2",
      "says": "The reader borrows the copy from the shelf.",
      "actor": "actor/reader",
      "ifItGoesWrong": "The copy is lent out, so the reader places a hold instead."
    },
    {
      "id": "s3",
      "says": "The reader renews the loan before it ends.",
      "actor": "actor/reader",
      "ifItGoesWrong": "The loan already ended, so the reader returns the copy late."
    },
    {
      "id": "s4",
      "says": "The reader reviews their loans and due dates.",
      "actor": "actor/reader"
    },
    {
      "id": "s5",
      "says": "The reader returns the copy to the desk.",
      "actor": "actor/reader",
      "ifItGoesWrong": "The copy is damaged, so the librarian retires it."
    },
    {
      "id": "s6",
      "says": "The reader places a hold on a lent copy.",
      "actor": "actor/reader"
    },
    {
      "id": "s7",
      "says": "The reader cancels a hold they no longer need.",
      "actor": "actor/reader"
    },
    {
      "id": "s8",
      "says": "The librarian retires a worn copy.",
      "actor": "actor/librarian"
    }
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "db5cb3b0"
}
---

# Borrow and return

A reader borrows a copy and returns it.
