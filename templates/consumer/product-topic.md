---
{
  "type": "product-topic",
  "title": "<Topic display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "records": [
    {
      "type": "requirement",
      "id": "requirement/<topic>.<name>",
      "title": "<Requirement display title>",
      "kind": "behaviour",
      "statement": "<The commitment in one sentence>",
      "basedOn": ["<constraint or research id, or remove this line>"]
    },
    {
      "type": "requirement",
      "id": "requirement/<topic>.<name>",
      "title": "<Promise display title>",
      "kind": "promise",
      "statement": "<The guaranteed value in one sentence>",
      "values": [
        {
          "value": "<value>",
          "effectiveFrom": "<YYYY-MM-DD>"
        }
      ],
      "basedOn": ["<constraint or research id, or remove this line>"]
    }
  ]
}
---
# <Topic display title>

## Summary

State the current position on this topic in one short paragraph.

## The situation

Tell what the customer faces on this topic. Give the numbers that size the problem, each with its source and date.

## What we do

Explain the choice and how it works, as a person would explain it to a colleague. Link the decision records that set it.

## Costs and risks

State what the choice gives up, what it costs, and what could go wrong.

## Evidence

Link the research record that supports a choice, with its confidence.
