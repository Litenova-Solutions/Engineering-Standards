---
{
  "type": "use-case",
  "id": "use-case/<module>.<name>",
  "title": "<Use case display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "kind": "<command|query|reaction>",
  "needs": ["permission/<name, or empty with anonymous true>"],
  "anonymous": false,
  "reachedThrough": ["entry-point/<name>"],
  "raises": ["event/<aggregate>.<past-tense>"],
  "trigger": {
    "events": ["event/<aggregate>.<past-tense>"],
    "schedule": "<schedule in words, or remove this line>",
    "deadline": "<deadline in words; remove this object when the kind is not reaction>"
  },
  "fulfills": ["requirement/<topic>.<name>"],
  "input": [
    {
      "name": "<field>",
      "meaning": "<What this field means>",
      "rules": ["<The shape each value obeys>"]
    }
  ],
  "output": [
    {
      "name": "<field>",
      "meaning": "<What this returned field means>"
    }
  ],
  "records": [
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Success display title>",
      "outcome": "success",
      "meaning": "<The observable result in one sentence>"
    },
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Refusal display title>",
      "outcome": "refusal",
      "code": "<module>.<reason>",
      "meaning": "<What the caller sees in one sentence>"
    },
    {
      "type": "scenario",
      "id": "scenario/<use-case>.<name>",
      "title": "<Scenario display title>",
      "given": "<The starting state>",
      "when": "<What the actor does>",
      "then": "<The observable result>",
      "result": "result/<use-case>.<name>",
      "examples": [
        {
          "<column>": "<value>"
        }
      ]
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
# <Use Case Display Title>

## Goal

State the actor goal in one sentence.

## What Happens

State the behavior in order, in plain sentences. Remove this section when the kind is query.

## Risk

Optional. State what money, personal data, or concurrency this use case touches. Remove this section when it touches none.

## Example

Optional. Show one realistic run of this use case, drawing people, place, dates, and amounts from the example cast. Remove this section when no run adds to the scenarios.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
