# Scheduled Jobs

## Intent

Scheduled work runs independently of HTTP requests and must remain safe when replicas restart, overlap, or lose connectivity. This extension covers recurring and delayed jobs, not durable event dispatch, which remains in `outbox-worker`.

## Activation

Enable `scheduled-jobs` when a use case requires recurring, delayed, or calendar-based work. Add the Worker project permitted by `ARCH.WORKER.001`.

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define schedule owner, time zone, misfire policy, and completion target.
- Stop jobs on cancellation and graceful shutdown.
- Lease work through PostgreSQL so replicas do not overlap one execution.
- Dispatch Application commands instead of mutating persistence directly.
- Make executions idempotent and bound retries.
- Record missed, running, failed, and completed schedule state.

## Standards

### Record the schedule contract (EXT.JOBS.ADOPT.001)

The use case or decision MUST name the schedule, time zone, allowed delay, overlap behavior, misfire policy, idempotency key, retry horizon, and operating owner.

### Run jobs in Worker (EXT.JOBS.WORKER.001)

Scheduled jobs MUST run in the Worker process, not inside WebApi request handling. Each execution observes cancellation, has a bounded duration, and stops accepting new work during graceful shutdown.

### Lease executions across replicas (EXT.JOBS.LEASE.001)

Store a lease or claim in PostgreSQL with an owner, expiry, and fencing value. A replica MUST renew only its own active lease and MUST stop when renewal fails. The lease prevents two replicas from treating one schedule occurrence as successful.

### Dispatch commands through Application (EXT.JOBS.COMMAND.001)

A job dispatches an Application command or an approved Application port. It MUST NOT mutate a Marten session or DbContext directly, bypass Domain behavior, or call WebApi endpoints.

### Bound retries and require idempotency (EXT.JOBS.RETRY.001)

Executions MUST use bounded attempts, cancellation-aware backoff, and a poison state for permanent failure. The command and side effects MUST tolerate duplicate execution after a lease or process failure.

### Recover missed occurrences (EXT.JOBS.RECOVERY.001)

Persist the last scheduled, started, and completed occurrence. Define whether a missed occurrence is skipped, replayed once, or replayed for every interval. Provide inspection, manual replay, and disable procedures.

### Identify each occurrence (EXT.JOBS.OCCURRENCE.001)

Give each planned occurrence a stable identity derived from the schedule ID and scheduled instant. Persist `scheduled`, `processing`, `completed`, and `dead_letter` state with attempt, lease, start, completion, and safe error data. Use the occurrence identity as the command idempotency scope.

A worker may mark completion only while its fencing value remains current. Manual replay creates an audited new attempt for the same occurrence identity rather than inventing a second scheduled instant.

### Make time behavior deterministic (EXT.JOBS.TIME.001)

Prefer UTC schedules. A business-local schedule records an IANA time-zone identifier and defines behavior for skipped and repeated local times during clock changes. Tests use an injected clock and representative time-zone transitions; production code does not depend on machine-local time.

## Conventions

Create one handler per job under the module that owns the behavior. Resolve scoped dependencies inside an execution scope and dispose the scope after the command completes. Keep schedule definitions separate from command behavior.

## Dependencies

No additional baseline package is required. Use Marten or the selected persistence extension for schedule state and PostgreSQL for leases.

## Verification

- Run two Worker replicas and verify one lease owner per occurrence.
- Test cancellation, shutdown, lease expiry, renewal failure, and restart.
- Test duplicate execution, retry exhaustion, poison handling, and manual replay.
- Verify schedule state, metrics, alerts, and time-zone behavior.
- Verify fencing prevents a stale execution from recording completion.
