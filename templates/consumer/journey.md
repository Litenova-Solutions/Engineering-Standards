---
{
  "type": "journey",
  "id": "journey/<name>",
  "title": "<Journey display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "actor": "actor/<name>",
  "goal": "<The goal in one sentence>",
  "finishedWhen": "<The observable end in one sentence>",
  "fulfills": ["requirement/<topic>.<name>"],
  "steps": [
    {
      "id": "<s1>",
      "says": "<A product sentence>",
      "actor": "actor/<name>",
      "ifItGoesWrong": "<What the person experiences in one sentence, or remove this line>"
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
# <Journey Display Title>

## Example

State one concrete occasion for this journey, drawing people, place, dates, and amounts from the example cast.

## Before It Starts

Optional. State what must hold before this journey starts. Remove this section when the journey starts from nothing in particular.

## Between the Steps

State the failure branches and handoffs between the steps.
