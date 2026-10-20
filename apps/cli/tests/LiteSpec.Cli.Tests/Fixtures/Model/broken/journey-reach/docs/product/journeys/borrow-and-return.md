---
{
  "type": "journey",
  "id": "journey/borrow-and-return",
  "title": "Borrow and return",
  "owner": "lending-team",
  "status": "approved",
  "actor": "actor/reader",
  "goal": "Borrow and return a copy.",
  "steps": [
    {
      "useCase": "use-case/lending.register-copy",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.borrow-copy",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.extend-loan",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.return-copy",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.place-hold",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.cancel-hold",
      "actor": "actor/reader",
      "requires": []
    },
    {
      "useCase": "use-case/lending.retire-copy",
      "actor": "actor/reader",
      "requires": []
    }
  ],
  "fulfills": [
    "requirement/borrowing.max-active-loans"
  ]
}
---

# Borrow and return

A reader borrows a copy and returns it.
