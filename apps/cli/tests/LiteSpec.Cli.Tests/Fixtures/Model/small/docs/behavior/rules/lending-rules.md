---
{
  "type": "rule-set",
  "title": "Lending rules",
  "owner": "lending-team",
  "status": "reviewed",
  "records": [
    {
      "type": "rule",
      "id": "rule/lending.copy-barcode-unique",
      "title": "Copy barcode unique",
      "owner": "lending-team",
      "status": "reviewed",
      "kind": "cross-aggregate",
      "statement": "A copy barcode names one copy across the library.",
      "governs": [
        "aggregate/lending.copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.copy-shelf-home"
      ],
      "approvedBy": "lending-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "de2d1158"
    }
  ]
}
---

# Lending rules

Barcodes stay unique across the library.
