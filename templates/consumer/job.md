---
{
  "type": "job",
  "id": "job/<module>.<name>",
  "title": "<Job display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "kind": "<scheduled|one-off|operator>",
  "schedule": {
    "every": "<ISO duration, or replace this line with a cron expression line>",
    "timezone": "<IANA timezone>"
  },
  "scope": "<What each run selects>",
  "batchSize": "<number>",
  "lease": {
    "name": "<lock>",
    "duration": "<ISO duration>"
  },
  "issues": ["use-case/<module>.<name>"],
  "reads": ["aggregate/<module>.<name>"],
  "serviceLevel": "<The promise, citing a requirement>",
  "evidence": "<Where proof of a run lands>",
  "runbook": "runbook/<name>",
  "runsWhere": "<Deployment scope, or external:<timer>>",
  "guard": "<Guard when the kind is operator, otherwise remove this line>",
  "cursor": "<Where resume state lives when driving a process, otherwise remove this line>",
  "fulfills": ["requirement/<topic>.<name>"],
  "serves": ["journey/<name>#<step-id>"],
  "onFailure": "<retry (<attempts>, <backoff>) then dead-letter|skip-and-log|discard>",
  "onExhausted": "<What happens when retries run out, or remove this line>",
  "idempotency": {
    "mode": "<key|state|not-pending|none>",
    "key": "<Key template when the mode is key, otherwise remove this line>",
    "scope": "<Scope when the mode is key, otherwise remove this line>",
    "reason": "<Reason when the mode is none, otherwise remove this line>"
  },
  "risk": ["<money|door|personal-data|access, or remove this line>"],
  "terms": ["term/<term-name>"],
  "questions": [
    {
      "question": "<The open question, or remove the questions block>",
      "decider": "<owner>",
      "decideBy": "<YYYY-MM-DD>"
    }
  ]
}
---
# <Job Display Title>

## Summary

State what this job does on each run, in one sentence.

## Example

Optional. Show one realistic run of this job, drawing people, place, dates, and amounts from the example cast. Remove this section when no run adds to the record.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
