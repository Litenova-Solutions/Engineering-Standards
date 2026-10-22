---
{
  "type": "rule-set",
  "title": "Lending rules",
  "owner": "lending-team",
  "status": "approved",
  "records": [
    {
      "type": "rule",
      "id": "rule/lending.copy-barcode-unique",
      "title": "Copy barcode unique",
      "owner": "lending-team",
      "status": "approved",
      "kind": "cross-aggregate",
      "statement": "A copy barcode names one copy across the library.",
      "governs": [
        "aggregate/lending.copy"
      ],
      "basedOn": [],
      "fulfills": [
        "requirement/borrowing.copy-shelf-home"
      ]
    }
  ]
}
---

# Lending rules

Barcodes stay unique across the library.
