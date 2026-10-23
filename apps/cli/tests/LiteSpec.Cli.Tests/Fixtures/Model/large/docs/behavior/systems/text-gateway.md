---
{
  "type": "external-system",
  "id": "external-system/text-gateway",
  "title": "Text gateway",
  "owner": "lending-team",
  "status": "reviewed",
  "actor": "actor/reader",
  "operations": [
    {
      "name": "send-overdue-notice",
      "direction": "out",
      "timeout": "5 seconds",
      "onTimeout": "The notice queues for the next run.",
      "retries": 3,
      "response": "A delivery receipt."
    },
    {
      "name": "receive-delivery-receipt",
      "direction": "in",
      "timeout": "none",
      "onTimeout": "Receipts arrive when the gateway answers.",
      "retries": 0,
      "response": "The receipt id."
    }
  ],
  "failure": "Notices queue until the gateway answers.",
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "ae6b6ba9"
}
---

# Text gateway

## Summary

The text gateway sends overdue notices to readers.
