---
{
  "type": "use-case",
  "id": "use-case/lending.remind-overdue",
  "title": "Remind overdue",
  "owner": "lending-team",
  "status": "approved",
  "kind": "reaction",
  "anonymous": false,
  "reachedThrough": [
    "entry-point/overdue-job"
  ],
  "raises": [],
  "records": [
    {
      "type": "result",
      "id": "result/remind-overdue.reminded",
      "title": "Reminded",
      "owner": "lending-team",
      "outcome": "success",
      "meaning": "The reader is reminded."
    },
    {
      "type": "scenario",
      "id": "scenario/remind-overdue.reminding-about-an-overdue-loan-succeeds",
      "title": "Reminding about an overdue loan succeeds",
      "owner": "lending-team",
      "status": "approved",
      "given": "A loan stands past its due date.",
      "when": "The overdue job runs.",
      "result": "result/remind-overdue.reminded",
      "then": "The reader is reminded."
    }
  ]
}
---

# Remind overdue

Readers with overdue loans get a reminder.
