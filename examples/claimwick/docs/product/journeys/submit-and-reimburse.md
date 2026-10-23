---
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and Reimburse",
  "owner": "claimwick-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "steps": [
    {
      "useCase": "use-case/spending.submit-expense",
      "actor": "actor/employee",
      "requires": [],
      "gives": "A submitted expense."
    },
    {
      "useCase": "use-case/spending.attach-receipt",
      "actor": "actor/employee",
      "requires": [],
      "gives": "A receipt on the expense."
    },
    {
      "useCase": "use-case/spending.approve-expense",
      "actor": "actor/manager",
      "requires": [],
      "gives": "An approved expense."
    },
    {
      "useCase": "use-case/spending.reject-expense",
      "actor": "actor/manager",
      "requires": [],
      "gives": "A rejected expense."
    },
    {
      "useCase": "use-case/spending.reimburse-expense",
      "actor": "actor/finance",
      "requires": [],
      "gives": "A reimbursed expense."
    },
    {
      "useCase": "use-case/spending.list-expenses",
      "actor": "actor/employee",
      "requires": [],
      "gives": "The employee expense list."
    },
    {
      "useCase": "use-case/spending.set-receipt-threshold",
      "actor": "actor/manager",
      "requires": [],
      "gives": "A new receipt threshold."
    },
    {
      "useCase": "use-case/spending.export-expenses",
      "actor": "actor/finance",
      "requires": [],
      "gives": "An export batch."
    },
    {
      "useCase": "use-case/spending.erase-personal-data",
      "actor": "actor/finance",
      "requires": [],
      "gives": "An expense without personal data."
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ]
}
---

# Submit and Reimburse

## Example

Ava submits a train fare on Monday with the receipt attached. Ben approves it on Tuesday, and Cara reimburses it on Friday. Ava watches each step in her own expense list.

## Before It Starts

Ava signed in as an employee. The policy carries its receipt threshold.

## Between the Steps

Ben may reject instead of approve; then the journey ends with the rejection and no payout. Cara reimburses only approved expenses, and anything else waits. Finance exports approved expenses in one batch and erases personal data past its retention.
