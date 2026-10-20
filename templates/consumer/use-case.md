---
{
  "type": "use-case",
  "id": "use-case/<module>.<name>",
  "title": "<Use case display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "operation": "<command|query>",
  "needs": ["permission/<name, or empty with anonymous true>"],
  "anonymous": false,
  "reachedThrough": ["entry-point/<name>"],
  "raises": ["event/<record>.<past-tense>"],
  "reactsTo": ["<event id, or remove this line>"],
  "fulfils": ["requirement/<topic>.<name>"],
  "input": [
    {
      "name": "<field>",
      "meaning": "<What this field means>",
      "rules": ["<The shape each value obeys>"]
    }
  ],
  "records": [
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Success display title>",
      "outcome": "success",
      "httpStatus": "<HTTP status, or remove this line when no HTTP entry point reaches this use case>",
      "meaning": "<The observable result in one sentence>"
    },
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Refusal display title>",
      "outcome": "refusal",
      "code": "failure/<module>.<reason>",
      "httpStatus": "<HTTP status, or remove this line when no HTTP entry point reaches this use case>",
      "meaning": "<What the caller sees in one sentence>"
    },
    {
      "type": "case",
      "id": "case/<use-case>.<name>",
      "title": "<Case display title>",
      "situation": "<The starting state>",
      "action": "<What the actor does>",
      "result": "result/<use-case>.<name>",
      "expect": "<The observable result>"
    }
  ],
  "terms": ["term/<term-name>"]
}
---
# <Use case display title>

## Goal

State the actor goal and its observable result.

## Trigger

State the actor action, event, schedule, or system condition that starts this use case.
