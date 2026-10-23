---
{
  "type": "reaction",
  "id": "reaction/<module>.<name>",
  "title": "<Reaction display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "on": ["<event/<aggregate>.<past-tense> or integration-event/<name>>"],
  "if": "<Skip condition in domain words, or remove this line>",
  "issues": "<use-case/<module>.<name>, or replace this key with sends naming a notification>",
  "forEach": "<Scope, or remove this line>",
  "reads": ["aggregate/<module>.<name>"],
  "fulfills": ["requirement/<topic>.<name>"],
  "serves": ["journey/<name>#<step-id>"],
  "idempotency": {
    "mode": "<key|state|not-pending|none>",
    "key": "<Key template when the mode is key, otherwise remove this line>",
    "scope": "<Scope when the mode is key, otherwise remove this line>",
    "reason": "<Reason when the mode is none, otherwise remove this line>"
  },
  "onFailure": "<retry (<attempts>, <backoff>) then dead-letter|skip-and-log|discard>",
  "onExhausted": "<What happens when retries run out, or remove this line>",
  "risk": ["<money|door|personal-data|access, or remove this line>"],
  "records": [
    {
      "type": "scenario",
      "id": "scenario/<reaction>.<name>",
      "title": "<Scenario display title>",
      "given": "<The starting state>",
      "when": "<What triggers the reaction>",
      "then": "<The observable result>",
      "result": "result/<use-case>.<name>"
    }
  ],
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
# <Reaction Display Title>

## Summary

State what this reaction does when its trigger fires, in one sentence.

## Example

Optional. Show one realistic firing of this reaction, drawing people, place, dates, and amounts from the example cast. Remove this section when no firing adds to the scenarios.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
