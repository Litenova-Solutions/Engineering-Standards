---
{
  "type": "business-record",
  "id": "business-record/<module>.<name>",
  "title": "<Business record display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "codeName": "<AggregateRootType>",
  "states": ["<state>"],
  "records": [
    {
      "type": "rule",
      "id": "rule/<record>.<name>",
      "title": "<Rule display title>",
      "kind": "<always-true|checked-before|across-records>",
      "enforcedBy": "<validator|aggregate|store|guard|reaction>",
      "statement": "<The rule in one sentence>",
      "governs": ["business-record/<module>.<name>"],
      "refusal": "<result id or failure code, or remove this line>",
      "basedOn": ["<constraint or research id, or remove this line>"],
      "fulfills": ["requirement/<topic>.<name>"]
    },
    {
      "type": "event",
      "id": "event/<record>.<past-tense>",
      "title": "<Event display title>",
      "meaning": "<What completed, in one sentence>",
      "carries": ["<field-name>"]
    }
  ],
  "terms": ["term/<term-name>"]
}
---
# <Business record display title>

## Purpose

State what this record keeps consistent and the decisions it owns. One record changes in one step.

## Lifecycle

Follow one instance through its states: what brings it into existence, what happens next, and where it ends. Name a person from the scenario cast rather than a role.
