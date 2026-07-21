# Outbox Worker

## Intent

The outbox makes a business or Workflow commit and its required outgoing message durable in one database transaction. A separate Worker dispatches pending records with retry, idempotency, visibility, and safe replay.

## Activation

Enable `outbox-worker` when a committed change requires an Integration Event, provider side effect, or Workflow Command that cannot be reconstructed or retried manually after process failure.

The Use case carries the `durable-delivery` Risk, or the Workflow lists the extension because its Commands require durable delivery. This extension:

- Replaces `PERSIST.EVENTS.001`.
- Activates the Worker boundary permitted by `ARCH.WORKER.001`.
- Adds `apps/api/src/{ProjectName}.Worker/`.

## Agent Summary {#agent-summary}

- Store outbox records in the same transaction as Aggregate changes or Workflow progress.
- Commit once through the LiteBus command post-handler.
- Dispatch from Worker in bounded claimed batches.
- Assume duplicate delivery and require consumer idempotency.
- Record attempt, error, schedule, and completion state.
- Publish backlog, failure, age, and duration diagnostics.
- Provide inspection, replay, and poison-message procedures.

## Standards

### Use outbox for required durable delivery (EXT.OUTBOX.ADOPT.001)

Document the required delivery guarantee, downstream boundary, duplicate behavior, retry horizon, and recovery owner. Do not activate outbox for `best-effort-optional` event reactions that can be repeated manually.

### Store messages with the committed change (EXT.OUTBOX.ATOMIC.001)

The command post-handler serializes pending durable messages into outbox records in the same Marten session as Aggregate changes or Workflow progress and calls `SaveChangesAsync` once after both are staged.

Each record contains message ID, message kind, stable type, schema version, occurrence time, payload, tenant when applicable, state, attempt count, next attempt, last error summary, and completion time. `messageKind` distinguishes `integration-event`, `workflow-command`, and a provider-specific side effect.

The outbox writer MUST stage through the same scoped `IDocumentSession` as the aggregate repository. A store that opens another connection or commits independently does not satisfy atomic delivery, even when it uses the same PostgreSQL database.

### Dispatch from Worker (EXT.OUTBOX.WORKER.001)

Worker claims pending records without allowing two workers to own the same attempt, dispatches a bounded batch, and records success or retry information.

WebApi does not dispatch durable messages inside the request transaction.

Claim records in a short database transaction with a unique lease owner, lease expiry, and fencing value. Do not hold the claim transaction open during the network call. A worker updates completion only while it still owns the matching lease and fencing value. Expired claims return to eligible work.

### Accept duplicate delivery (EXT.OUTBOX.IDEMPOTENCY.001)

Consumers handle the same message more than once. Use message ID or a business idempotency key at the Command or side-effect boundary. Do not mark a record complete before the target boundary accepts it.

### Bound retries and poison messages (EXT.OUTBOX.RETRY.001)

Use bounded exponential backoff with jitter. Classify permanent failures, stop automatic retry after the configured limit, and retain enough data for investigation and safe replay.

### Preserve message compatibility (EXT.OUTBOX.SCHEMA.001)

Use stable message type names and explicit schema versions. A deployed Worker must process records produced by every application version that may coexist during rollout or rollback.

### Expose backlog state (EXT.OUTBOX.OPERATIONS.001)

Publish pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate. Alert thresholds follow the use-case delivery target.

### Use an explicit record lifecycle (EXT.OUTBOX.STATE.001)

Use these logical states:

| State | Meaning | Allowed next state |
|:---|:---|:---|
| `pending` | Eligible when `nextAttemptAt` is due | `processing` |
| `processing` | Owned by one unexpired lease | `dispatched`, `pending`, `dead_letter` |
| `dispatched` | The target boundary accepted the message | None |
| `dead_letter` | Automatic attempts ended or failure is permanent | `pending` only through audited replay |

A crash after target acceptance but before `dispatched` may deliver the message again. Preserve the message ID across retry and replay so target idempotency can suppress the duplicate. Record replay actor, reason, time, and previous failure without editing the original payload.

### Keep dispatch compatibility during rollout (EXT.OUTBOX.ROLLOUT.001)

New WebApi code may emit a record only after every active Worker can read its type and schema version. Deploy compatible readers before writers for additive event versions. Rollback planning includes records created by the new writer but not yet dispatched.

## Conventions

Keep outbox record, storage, claim, and dispatch infrastructure under `Infrastructure/Messaging/Outbox/`. Keep the Worker host under its own project. Keep Integration Event-to-provider mapping in the integration that owns the side effect. Dispatch a Workflow Command through `ICommandMediator` in a fresh Worker scope.

The selected LiteBus release includes optional durable messaging packages, but this extension does not adopt them automatically. Add one only after the manifest pins it and an integration test proves that its writer shares the Marten business transaction. The core LiteBus command and event modules remain sufficient for the project-owned Marten record and Worker dispatcher.

## Dependencies

No additional baseline package is required. Provider-specific dispatch dependencies follow the external integrations extension.

## Verification

- Commit an aggregate and outbox record atomically.
- Stop the process after commit and verify Worker later dispatches the record.
- Fail between external acceptance and completion and verify duplicate-safe redelivery.
- Run two Worker instances and verify one claim per attempt.
- Expire a lease and verify a stale worker cannot complete the reclaimed record.
- Deliver the same Integration Event and Workflow Command more than once and verify idempotency.
- Test retry exhaustion, poison-message inspection, replay, and rollback compatibility.
- Verify backlog diagnostics and alerts.
- Verify old and new Workers against records produced during rollout and rollback.
