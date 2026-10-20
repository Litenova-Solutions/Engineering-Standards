---
{
  "type": "runbook",
  "id": "runbook/<name>",
  "title": "<Runbook display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "limit": "<limit id, or remove this line>",
  "trigger": "<alert or request, or remove this line>",
  "terms": ["term/<term-name>"]
}
---
# <Runbook display title>

Keep either `limit` or `trigger` in the frontmatter, and remove the other line.

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

## Rollback or recovery

State the rollback command, restore condition, and data compatibility limit.

## Escalation

State the owner, backup contact, evidence to attach, and stop condition.
