---
{
  "type": "use-case",
  "id": "use-case/spending.attach-receipt",
  "title": "Attach Receipt",
  "owner": "claimwick-team",
  "status": "reviewed",
  "kind": "command",
  "access": {
    "auth": [
      "session"
    ],
    "grant": "permission/submit-expense",
    "tenant": "own"
  },
  "serves": [
    "journey/submit-and-reimburse#s2"
  ],
  "reachedThrough": [
    "entry-point/claimwick-app"
  ],
  "raises": [
    "event/receipt.attached"
  ],
  "fulfills": [
    "requirement/approval.receipt-over-threshold"
  ],
  "changes": [
    "aggregate/spending.expense"
  ],
  "records": [
    {
      "type": "result",
      "id": "result/attach-receipt.attached",
      "title": "Attached",
      "owner": "claimwick-team",
      "outcome": "success",
      "meaning": "The receipt is attached.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "8755a625"
    },
    {
      "type": "result",
      "id": "result/attach-receipt.expense-decided",
      "title": "Expense decided",
      "owner": "claimwick-team",
      "outcome": "refusal",
      "code": "spending.expense-decided",
      "meaning": "The expense is already decided.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "c438c043"
    },
    {
      "type": "scenario",
      "id": "scenario/attach-receipt.attaching-a-receipt-succeeds",
      "title": "Attaching a receipt succeeds",
      "owner": "claimwick-team",
      "status": "reviewed",
      "given": "An employee submitted an expense below the threshold with no receipt.",
      "when": "The employee attaches the receipt.",
      "result": "result/attach-receipt.attached",
      "then": "The receipt is attached.",
      "approvedBy": "claimwick-team",
      "approvedOn": "2026-10-01",
      "approvedHash": "70d59461"
    }
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "5001b790"
}
---

# Attach Receipt

## Goal

An employee adds a receipt to a submitted expense so it can be decided.

## What Happens

The employee sends the receipt for a submitted expense. Spending refuses the receipt when the expense is already decided. Otherwise the receipt sits on the expense and `event/receipt.attached` is raised.
