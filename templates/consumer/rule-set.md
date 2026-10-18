---
{
  "type": "rule-set",
  "title": "<Rule set display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "records": [
    {
      "type": "rule",
      "id": "rule/<home>.<name>",
      "title": "<Rule display title>",
      "kind": "<always-true|checked-before|across-records>",
      "enforcedBy": "<validator|aggregate|store|guard|reaction>",
      "statement": "<The rule in one sentence>",
      "governs": ["<business-record or use-case id>"],
      "refusal": "<result id or failure code, or remove this line>",
      "basedOn": ["<constraint or research id, or remove this line>"],
      "fulfils": ["requirement/<topic>.<name>"]
    }
  ]
}
---
# <Rule set display title>

## Summary

State which records these rules govern and why they sit together on one page.
