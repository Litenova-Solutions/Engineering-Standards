---
{
  "type": "reaction",
  "id": "reaction/lending.return-again",
  "title": "Return again",
  "owner": "lending-team",
  "status": "reviewed",
  "on": [
    "event/loan.loan-returned"
  ],
  "effects": [
    {
      "issues": "use-case/lending.return-copy",
      "timing": "async"
    }
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "0257a2e1"
}
---

# Return again

Every returned loan is returned again.
