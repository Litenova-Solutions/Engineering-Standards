---
{
  "kind": "product-topic",
  "id": "__TOPIC__",
  "specStatus": "draft",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD",
  "reviewBy": "YYYY-MM-DD"
}
---
# __TOPIC_TITLE__

## Summary

State the current position on this topic in one short paragraph. A reader who stops here knows what the product does on this topic and why.

## The situation

Tell what the customer faces on this topic, in their own words where a source quotes them. Give the numbers that size the problem, each with its source and date.

> "Quote a customer, a market voice, or an authority in their own words, with the source after the quote."

## What we do

Explain the choice and how it works, as a person would explain it to a colleague. Link the decision records that set it, so the reasoning is one click away.

## Why it is better

Compare the choice with what the customer uses today and with the options weighed. Show the arithmetic where money is involved.

## A worked example

Follow one customer from the reference cast through this topic, with real figures.

## Costs and risks

State what the choice gives up, what it costs, and what could go wrong.

## How sure we are

State which facts are verified, which are inferred, and which wait on an adviser. Name what would change the position.

## Rules

- `product/__TOPIC__.__RULE__`: State one testable commitment. A domain specification or a code element cites this identifier.

Each entry opens with one identifier of the form `product/<topic>.<rule>`, where `<topic>` is this page's `id`. Write `None.` when the page states no rule.

## Position

None.

Replace `None.` with one table row per choice the product owner made. Every row links the decision record that set it, and a row on an approved page links an approved decision.

```text
| Choice | Reason | Decision |
|:---|:---|:---|
| Flat rate costs EUR 149 a month. | One price per month is easier to budget. | LINK |
```

`LINK` stands for a Markdown link to the decision record, such as `../decisions/0003-monthly-plan.md`.

## Refusals

None.

Replace `None.` with one table row per thing this topic rules out, in the Position table shape: Refused, Reason, Decision.

## Open questions

None.

Replace `None.` with a table of Question, Owner, and What settles it, one row per undecided question.

## Next

None.

Replace `None.` with a table of Change and When, naming the milestone or the trigger for each planned change.

## History

None. No decision record names this page in its affects field.

## Evidence

- Link the research claim or record that supports a choice, with its confidence.
