---
{
  "type": "decision",
  "id": "decision/0001-receipt-threshold",
  "title": "Receipt Threshold",
  "owner": "claimwick-team",
  "status": "approved",
  "decided": "2026-03-01",
  "options": [
    {
      "name": "0 EUR",
      "for": "Every expense carries proof.",
      "against": "Tiny expenses cost more to file than they pay."
    },
    {
      "name": "25 EUR",
      "for": "Small expenses stay light to submit.",
      "against": "Some fraud slips under the line."
    },
    {
      "name": "75 EUR",
      "for": "Almost nothing needs a receipt.",
      "against": "Finance cannot defend the tax file."
    }
  ],
  "chosen": "25 EUR",
  "changeWhen": "Finance sees abuse or friction.",
  "decides": [
    "requirement/approval.receipt-over-threshold"
  ],
  "basedOn": []
}
---

# Receipt Threshold

## Context

Small expenses need no proof, large ones do.

## Decision

Expenses above 25 EUR need a receipt.

## Consequences

Small expenses stay light to submit.

## Evidence with Confidence

Finance reviewed the filing cost against the fraud risk in February 2026 and stands behind 25 EUR.
