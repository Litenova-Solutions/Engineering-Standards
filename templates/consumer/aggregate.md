---
{
  "type": "aggregate",
  "id": "aggregate/<module>.<name>",
  "title": "<Aggregate display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "summary": "<What this aggregate keeps consistent in one sentence>",
  "states": [
    {
      "name": "<state>",
      "meaning": "<What it means for an instance to sit in this state>"
    }
  ],
  "records": [
    {
      "type": "rule",
      "id": "rule/<aggregate>.<name>",
      "title": "<Rule display title>",
      "kind": "<invariant|precondition|calculation|cross-aggregate>",
      "statement": "<The rule in one sentence>",
      "governs": ["aggregate/<module>.<name>"],
      "refusal": "<result id or refusal code, or remove this line>",
      "basedOn": ["<constraint or research id, or remove this line>"],
      "fulfills": ["requirement/<topic>.<name>"]
    },
    {
      "type": "event",
      "id": "event/<aggregate>.<past-tense>",
      "title": "<Event display title>",
      "meaning": "<What completed, in one sentence>",
      "carries": ["<field-name>"]
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
# <Aggregate display title>

## Transitions

List every allowed state change with the use case that moves it.

| From | To | Triggered by |
|:---|:---|:---|
| <state> | <state> | use-case/<module>.<name> |

## Data

List every stored field with its meaning and classification.

| Name | Meaning | Classification |
|:---|:---|:---|
| <field> | <What this field means> | <public\|internal\|personal\|sensitive> |

## Example

Optional. Show one realistic life of an instance of this aggregate, drawing people, place, dates, and amounts from the example cast. Remove this section when no life adds to the tables.

## Known Limits

Optional. State the deliberate boundaries of this aggregate, each linking the decision behind it. Remove this section when the aggregate holds no deliberate boundary.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
