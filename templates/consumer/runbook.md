---
{
  "type": "runbook",
  "id": "runbook/<name>",
  "title": "<Runbook display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "trigger": "<alert or request>",
  "severity": "<How bad this is when it fires>",
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
# <Runbook Display Title>

## Impact

State what breaks and who feels it.

## Prerequisites

- Required access and approvals.
- Required artifact, database, or service identifiers.
- Safety checks and communication channel.

## Procedure

1. Record the current state and correlation identifiers.
2. Run the exact approved commands or platform actions for this environment.
3. Verify the result before continuing.

```text
<exact command or platform action>
```

## Verification

State the health checks, data checks, or metrics that prove recovery.

## Rollback or Recovery

State the rollback command, restore condition, and data compatibility limit.

## Escalation

State the owner, backup contact, evidence to attach, and stop condition.
