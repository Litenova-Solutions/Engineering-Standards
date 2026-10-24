---
{
  "type": "deviation",
  "id": "deviation/export-review-bypass",
  "title": "Export Review Bypass",
  "owner": "claimwick-team",
  "status": "approved",
  "provision": "litespec/backend/application#enforce-target-authorization-in-the-pipeline",
  "reason": "The weekend export runs with no reviewer on shift.",
  "reviewBy": "2027-01-01",
  "removeWhen": "A reviewer covers weekends.",
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "82e28f59"
}
---

# Export Review Bypass

## Consequences

The weekend export skips the daily review. Finance runs the export alone, and a Monday review covers each weekend batch after the fact. The bypass ends when a reviewer covers weekends.
