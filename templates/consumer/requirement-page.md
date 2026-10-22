---
{
  "type": "requirement-page",
  "title": "<Topic display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "reviewBy": "<YYYY-MM-DD>",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/<topic>.<name>",
      "title": "<Functional display title>",
      "kind": "functional",
      "statement": "<The commitment in one sentence>",
      "rationale": "<Why this commitment holds, in one line>",
      "feature": ["feature/<name>"],
      "basedOn": ["<constraint or research id, or remove this line>"]
    },
    {
      "type": "requirement",
      "id": "requirement/<topic>.<name>",
      "title": "<Quality display title>",
      "kind": "quality",
      "statement": "<The measurable commitment in one sentence>",
      "rationale": "<Why this commitment holds, in one line>",
      "measure": "<What is counted>",
      "by": "<The date or milestone the target is met>",
      "feature": ["feature/<name>"],
      "basedOn": ["<constraint or research id, or remove this line>"]
    },
    {
      "type": "requirement",
      "id": "requirement/<topic>.<name>",
      "title": "<Business display title>",
      "kind": "business",
      "statement": "<The guaranteed value in one sentence>",
      "rationale": "<Why this commitment holds, in one line>",
      "values": [
        {
          "value": "<value>",
          "effectiveFrom": "<YYYY-MM-DD>"
        }
      ],
      "feature": ["feature/<name>"],
      "basedOn": ["<constraint or research id, or remove this line>"]
    }
  ]
}
---
# <Topic display title>

## Summary

State the current position on this topic in one short paragraph.

## The Situation

Tell what the customer faces on this topic. Give the numbers that size the problem, each with its source and date.

## What We Do

Explain the choice and how it works, as a person would explain it to a colleague. Link the decision records that set it.

## Why It Is Better

Compare the choice with the main alternative, with the numbers that favor it.

## Example

Show one realistic case walking through the choice from start to finish, drawing people, place, dates, and amounts from the example cast.

## Costs and Risks

State what the choice gives up, what it costs, and what could go wrong.

## How Sure We Are

State the confidence in the choice and what would raise it.

## Position

Link each decision that sets a choice on this topic, including choices no system carries.

## Refusals

State what was refused with the decision behind each refusal, linking refused features instead of restating them.
