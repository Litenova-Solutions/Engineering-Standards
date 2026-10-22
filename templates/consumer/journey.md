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
  "fulfills": ["requirement/<topic>.<name>"],
  "steps": [
    {
      "useCase": "use-case/<module>.<name>",
      "actor": "actor/<name>",
      "requires": ["<record id that must exist first, or remove this line>"],
      "gives": "<What this step produces>"
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
