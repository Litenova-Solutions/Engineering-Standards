---
{
  "type": "setting-set",
  "title": "Settings",
  "owner": "lending-team",
  "status": "reviewed",
  "records": [
    {
      "type": "setting",
      "id": "setting/lending.active-loans-per-reader",
      "title": "Active loans per reader",
      "owner": "lending-team",
      "status": "reviewed",
      "valueType": "integer",
      "default": 5,
      "range": "1 to 20",
      "unit": "loans",
      "setBy": "founder",
      "fulfills": [
        "requirement/borrowing.max-active-loans"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "19e6bb03"
    }
  ]
}
---

# Settings

Lending runs within these settings.
