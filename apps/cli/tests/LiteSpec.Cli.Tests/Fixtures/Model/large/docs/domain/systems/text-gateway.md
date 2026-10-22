---
{
  "type": "external-system",
  "id": "external-system/text-gateway",
  "title": "Text gateway",
  "owner": "lending-team",
  "status": "approved",
  "actor": "actor/reader",
  "sends": [
    "Overdue notices"
  ],
  "receives": [
    "Delivery receipts"
  ],
  "failure": "Notices queue until the gateway answers."
}
---

# Text gateway

## Summary

The text gateway sends overdue notices to readers.
