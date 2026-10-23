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
  "issues": [
    "use-case/lending.return-copy"
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "approvedBy": "lending-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "cb8d60f3"
}
---

# Return again

Every returned loan is returned again.
