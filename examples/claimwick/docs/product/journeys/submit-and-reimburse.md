---
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and Reimburse",
  "owner": "claimwick-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "finishedWhen": "The employee holds the reimbursement, and the personal data of old expenses is erased past retention.",
  "steps": [
    {
      "id": "s1",
      "says": "The employee submits the expense with its amount and currency.",
      "actor": "actor/employee"
    },
    {
      "id": "s2",
      "says": "The employee attaches the receipt to the expense.",
      "actor": "actor/employee"
    },
    {
      "id": "s3",
      "says": "The manager approves or rejects the expense within five business days.",
      "actor": "actor/manager",
      "ifItGoesWrong": "The expense waits past three business days, and the approver is reminded."
    },
    {
      "id": "s4",
      "says": "Finance reimburses the approved expense.",
      "actor": "actor/finance"
    },
    {
      "id": "s5",
      "says": "The employee watches each expense in their own list.",
      "actor": "actor/employee"
    },
    {
      "id": "s6",
      "says": "The manager sets the receipt threshold for the policy.",
      "actor": "actor/manager"
    },
    {
      "id": "s7",
      "says": "Finance exports the approved expenses in one batch.",
      "actor": "actor/finance"
    },
    {
      "id": "s8",
      "says": "Finance erases the personal data of expenses past retention.",
      "actor": "actor/finance"
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ],
  "approvedBy": "claimwick-team",
  "approvedOn": "2026-10-01",
  "approvedHash": "0e4812e7"
}
---

# Submit and Reimburse

## Example

Ava submits a train fare on Monday with the receipt attached. Ben approves it on Tuesday, and Cara reimburses it on Friday. Ava watches each step in her own expense list.

## Before It Starts

Ava signed in as an employee. The policy carries its receipt threshold.

## Between the Steps

Ben may reject instead of approve; then the journey ends with the rejection and no payout. Cara reimburses only approved expenses, and anything else waits. Finance exports approved expenses in one batch and erases personal data past its retention.
