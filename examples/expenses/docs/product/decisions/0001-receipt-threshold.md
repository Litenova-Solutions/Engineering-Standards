---
{
  "type": "decision",
  "id": "decision/0001-receipt-threshold",
  "title": "Receipt threshold",
  "owner": "expenses-team",
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

# Receipt threshold

## Context

Small expenses need no proof, large ones do.

## Options

Zero, 25, or 75 EUR.

## Decision

Expenses above 25 EUR need a receipt.

## Consequences

Small expenses stay light to submit.

## Evidence

Finance review, February 2026.
