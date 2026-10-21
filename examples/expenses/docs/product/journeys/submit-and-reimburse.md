---
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and reimburse",
  "owner": "expenses-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "steps": [
    {
      "useCase": "use-case/spending.submit-expense",
      "actor": "actor/employee",
      "requires": []
    },
    {
      "useCase": "use-case/spending.attach-receipt",
      "actor": "actor/employee",
      "requires": []
    },
    {
      "useCase": "use-case/spending.approve-expense",
      "actor": "actor/manager",
      "requires": []
    },
    {
      "useCase": "use-case/spending.reject-expense",
      "actor": "actor/manager",
      "requires": []
    },
    {
      "useCase": "use-case/spending.reimburse-expense",
      "actor": "actor/finance",
      "requires": []
    },
    {
      "useCase": "use-case/spending.list-expenses",
      "actor": "actor/employee",
      "requires": []
    },
    {
      "useCase": "use-case/spending.set-receipt-threshold",
      "actor": "actor/manager",
      "requires": []
    },
    {
      "useCase": "use-case/spending.export-expenses",
      "actor": "actor/finance",
      "requires": []
    }
  ],
  "fulfills": [
    "requirement/approval.decided-within-five-days"
  ]
}
---

# Submit and reimburse

An employee submits an expense and finance reimburses it.
