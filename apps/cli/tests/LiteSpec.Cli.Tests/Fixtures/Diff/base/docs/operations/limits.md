---
{
  "type": "setting-set",
  "title": "Settings",
  "owner": "lending-team",
  "status": "approved",
  "records": [
    {
      "type": "setting",
      "id": "setting/lending.active-loans-default",
      "title": "Active loans default",
      "owner": "lending-team",
      "status": "reviewed",
      "meaning": "How many active loans a reader may hold.",
      "default": 5,
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ]
    }
  ]
}
---

# Settings

Lending runs within these bounds.
