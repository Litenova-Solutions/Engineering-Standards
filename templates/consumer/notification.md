---
{
  "type": "notification",
  "id": "notification/<module>.<name>",
  "title": "<Notification display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "template": "<template key>",
  "audience": ["actor/<name>"],
  "channel": ["<email|sms|push|webhook>"],
  "consent": "<The rule, such as SMS only with consent>",
  "frequency": "<once|per-attempt>",
  "dedupKey": "<Template over the trigger payload>",
  "params": ["<name>"],
  "locale": "<Where the language comes from>",
  "suppressedWhen": "<Condition, or remove this line>",
  "claims": [
    {
      "claim": "<What the message must say>",
      "requirement": "requirement/<topic>.<name>"
    }
  ],
  "fulfills": ["requirement/<topic>.<name>"],
  "risk": ["<money|door|personal-data|access, or remove this line>"],
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
# <Notification Display Title>

## Summary

State what this message tells its audience and when it is sent, in one sentence.

## Example

Optional. Show one realistic sending of this message, drawing people, place, dates, and amounts from the example cast. Remove this section when no sending adds to the record.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
