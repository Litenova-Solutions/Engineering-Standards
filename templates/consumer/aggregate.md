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
  "kind": "<process|store, or remove this line for an entity>",
  "states": [
    {
      "name": "<state>",
      "meaning": "<What it means for an instance to sit in this state>"
    }
  ],
  "dataClasses": [
    {
      "name": "<class>",
      "classification": "<public|internal|personal|sensitive>",
      "fields": ["<field>"],
      "onErasure": "<erase|pseudonymise|retain|exempt>",
      "basis": "<statute|business|engineering>",
      "period": "<ISO duration, or none (on-demand)>",
      "enforcedBy": "<job/<module>.<name>|record-expiry|store-ttl|query-filter>",
      "reason": "<Reason when exempt, otherwise remove this line>",
      "reviewBy": "<Date when exempt, otherwise remove this line>",
      "acceptedBy": "<Decision or requirement id when personal or sensitive with retain or exempt, otherwise remove this line>",
      "reach": "<own-tenant|subject-wide|platform-wide>",
      "exceptions": [
        {
          "field": "<field>",
          "onErasure": "<erase|pseudonymise|retain|exempt>"
        }
      ]
    }
  ],
  "steps": [
    {
      "name": "<step; remove the steps, exits, finishedWhen, driver, and cursor lines when the kind is not process>",
      "when": "<Guard, or remove this line>",
      "compensation": "<use-case/<module>.<name>, or none (<reason>)>"
    }
  ],
  "exits": [
    {
      "name": "<exit>",
      "trigger": "<Condition, decision by <actor>, or due <duration>>",
      "then": "<What happens>"
    }
  ],
  "finishedWhen": "<The observable end in one sentence>",
  "driver": ["<reaction/<module>.<name>, job/<module>.<name>, or operator: <who, via runbook/<name>, due <duration>>>"],
  "cursor": "<Where resume state lives, or remove this line>",
  "records": [
    {
      "type": "rule",
      "id": "rule/<aggregate>.<name>",
      "title": "<Rule display title>",
      "kind": "<invariant|precondition|calculation|cross-aggregate|atomicity|reservation|commercial-data|default>",
      "statement": "<The rule in one sentence>",
      "governs": ["aggregate/<module>.<name>"],
      "refusal": "<result id or refusal code, or remove this line>",
      "releasedBy": "<use-case/<module>.<name>, or never (<cost>), when the kind is reservation; otherwise remove this line>",
      "frozenWhen": "<When the value freezes, when the kind is commercial-data; otherwise remove this line>",
      "historyLink": "<Where past values live, when the kind is commercial-data; otherwise remove this line>",
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
# <Aggregate Display Title>

## Transitions

List every allowed state change with the use case that moves it.

| From | To | Triggered By |
|:---|:---|:---|
| <state> | <state> | use-case/<module>.<name> |

## Data

List every stored field with its meaning, data class, and classification.

| Name | Meaning | Data Class | Classification |
|:---|:---|:---|:---|
| <field> | <What this field means> | <class> | <public\|internal\|personal\|sensitive> |

## Example

Optional. Show one realistic life of an instance of this aggregate, drawing people, place, dates, and amounts from the example cast. Remove this section when no life adds to the tables.

## Known Limits

Optional. State the deliberate boundaries of this aggregate, each linking the decision behind it. Remove this section when the aggregate holds no deliberate boundary.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
