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
      "requires": ["<what must exist first>"]
    }
  ],
  "terms": ["term/<term-name>"]
}
---
# <Journey display title>

## Summary

State the actor, the goal, and the occasion in one paragraph.

## Situation

State what surrounds the actor and what they use today instead.
