---
{
  "type": "runbook",
  "id": "runbook/clear-stuck-reimbursements",
  "title": "Clear stuck reimbursements",
  "owner": "expenses-team",
  "status": "approved",
  "trigger": "A reimbursement stays queued past one business day."
}
---

# Clear stuck reimbursements

1. List queued reimbursements.
2. Retry each one.
3. Notify finance.
