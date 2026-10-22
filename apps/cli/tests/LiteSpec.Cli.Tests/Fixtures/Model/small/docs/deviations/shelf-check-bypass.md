---
{
  "type": "deviation",
  "id": "deviation/shelf-check-bypass",
  "title": "Shelf check bypass",
  "owner": "lending-team",
  "status": "approved",
  "provision": "litespec/backend/application#enforce-target-authorization-in-the-pipeline",
  "reason": "The import runs before opening.",
  "reviewBy": "2027-01-01",
  "removeWhen": "The import moves after opening."
}
---

# Shelf check bypass

The morning import skips the quiet check.
