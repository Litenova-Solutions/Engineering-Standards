---
{
  "type": "product-topic",
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
      "title": "<Requirement display title>",
      "kind": "behavior",
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

## Why it is better

Compare the choice with the main alternative, with the numbers that favor it.

## A worked example

Show one realistic case walking through the choice from start to finish.

## Costs and risks

State what the choice gives up, what it costs, and what could go wrong.

## How sure we are

State the confidence in the choice and what would raise it.

## Rules

The frontmatter records hold every testable commitment as a Requirement entry.

## Position

State each choice with the decision that set it, including choices no system carries.

## Refusals

State what was refused with the decision behind each refusal.

## Open questions

List the questions still open with who answers each one.

## Next

State the next planned change with its date or milestone.

## History

The model lists the decisions that decide this page.

<!-- generated:history -->
<!-- /generated:history -->

## Evidence

Link the research record that supports a choice, with its confidence.
