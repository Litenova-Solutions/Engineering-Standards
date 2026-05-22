# Runbook: Recover an Outbox Message

This runbook covers recovering outbox messages that have reached `DeadLettered` status and have not been processed automatically.

---

## When to Use This

Use this runbook when:

- Monitoring shows one or more outbox messages in `DeadLettered` status.
- A business process is stalled because an event was not dispatched.
- A downstream service was unavailable and messages need to be re-queued after recovery.

---

## Step 1: Identify Dead-Lettered Messages

```sql
-- Find dead-lettered messages
SELECT
    id,
    event_type,
    created_at_utc,
    attempt_count,
    last_error,
    payload
FROM outbox_messages
WHERE status = 2  -- DeadLettered = 2
ORDER BY created_at_utc DESC;
```

Review the `event_type` and `last_error` columns to understand why the messages failed.

---

## Step 2: Investigate the Root Cause

Common causes:

| Last Error | Likely cause | Resolution |
|:---|:---|:---|
| Unknown event type | Event type name changed after messages were written | Restore the old type name or add a type alias |
| Deserialization returned null | Event schema changed incompatibly | Manually transform payload or rewrite event |
| HTTP timeout / connection refused | Downstream service was unavailable | Verify the downstream service is healthy |
| 5xx from downstream | Downstream service is failing | Fix the downstream service first |

Do not re-queue messages until the root cause is resolved. Requeuing into a still-broken system wastes retries.

---

## Step 3: Re-Queue Messages

After resolving the root cause, reset the dead-lettered messages to `Pending`:

```sql
-- Re-queue specific messages by ID
UPDATE outbox_messages
SET
    status = 0,               -- Pending = 0
    attempt_count = 0,
    next_attempt_at_utc = now(),
    last_error = NULL
WHERE id IN (
    'message-id-1',
    'message-id-2'
);
```

```sql
-- Re-queue all dead-lettered messages of a specific event type
UPDATE outbox_messages
SET
    status = 0,
    attempt_count = 0,
    next_attempt_at_utc = now(),
    last_error = NULL
WHERE status = 2
  AND event_type = 'MyProject.Domain.Posts.Events.PostPublished';
```

The outbox dispatcher runs every 5 seconds (default). The re-queued messages will be picked up on the next poll cycle.

---

## Step 4: Monitor Re-Processing

Watch the outbox metrics or query the table directly:

```sql
-- Monitor processing progress
SELECT status, COUNT(*) AS count
FROM outbox_messages
WHERE created_at_utc > now() - interval '24 hours'
GROUP BY status;
```

Statuses:
- `0` = Pending
- `1` = Processed
- `2` = DeadLettered

---

## Step 5: Handle Unrecoverable Messages

If a message cannot be processed automatically (for example, the downstream service no longer exists, or the event schema is permanently incompatible), mark it as permanently dead-lettered with a note:

```sql
UPDATE outbox_messages
SET last_error = 'Permanently dead-lettered: <reason>. Reviewed by <name> on <date>.'
WHERE id = 'message-id';
```

Document the decision in an incident ticket. If the event represents a business operation that must be completed (for example, a payment notification), the business operation may need to be replayed manually through the application.

---

## Preventing Recurrence

- If the root cause was a schema change breaking deserialization, add a migration that transforms the payload before deploying the schema change.
- If the root cause was a downstream outage, confirm the dispatcher's retry backoff is sufficient and alert thresholds are tuned correctly.
- If the root cause was an unknown event type, implement a stable event type registry and migration strategy before changing event type names.
