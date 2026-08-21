# Scheduled Jobs

## Intent

Scheduled work runs independently of HTTP requests and remains safe when replicas restart, overlap, or lose connectivity. This extension covers recurring and delayed jobs, not durable event dispatch.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`.

The consumer enables `scheduled-jobs` for recurring, delayed, or calendar-based work. It adds the Worker project permitted by `ARCH.WORKER.001`.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record timing, overlap, retry, and owner behavior. (EXT.JOBS.ADOPT.001)
- Run jobs in Worker with bounded execution. (EXT.JOBS.WORKER.001, EXT.JOBS.WORKER.002)
- Lease an occurrence across replicas. (EXT.JOBS.LEASE.001)
- Dispatch Application commands without direct storage mutation. (EXT.JOBS.COMMAND.001, EXT.JOBS.COMMAND.002)
- Bound retry and support duplicate execution. (EXT.JOBS.RETRY.001, EXT.JOBS.RETRY.002)
- Define missed-occurrence and manual-replay behavior. (EXT.JOBS.RECOVERY.001, EXT.JOBS.RECOVERY.002)
- Use schedule-derived occurrence identities. (EXT.JOBS.OCCURRENCE.001)

## Standards

### Record schedule behavior (EXT.JOBS.ADOPT.001)

**Requirement:** A scheduled-job use case or decision MUST name schedule, time zone, delay, overlap, misfire, idempotency, retry, and operating owner.

**Rationale:** The contract describes when work may run and how it recovers from normal scheduling faults.

### Run jobs in Worker (EXT.JOBS.WORKER.001)

**Requirement:** A scheduled job MUST run in Worker outside WebApi request handling.

**Rationale:** Worker execution permits independent scheduling and controlled replica shutdown.

### Bound job execution (EXT.JOBS.WORKER.002)

**Requirement:** A scheduled job MUST observe cancellation, have bounded duration, and stop accepting new work during graceful shutdown.

**Rationale:** Bounded work lets a Worker stop without abandoning uncontrolled execution.

### Store execution leases (EXT.JOBS.LEASE.001)

**Requirement:** A scheduled-job store MUST record lease owner, expiry, and fencing value in PostgreSQL.

**Rationale:** The lease identifies the replica that can complete one planned occurrence.

### Renew only owned leases (EXT.JOBS.LEASE.002)

**Requirement:** A Worker replica MUST renew only its active lease and stop when renewal fails.

**Rationale:** Losing the lease ends authority to complete the scheduled occurrence.

### Prevent duplicate completion (EXT.JOBS.LEASE.003)

**Requirement:** A scheduled-job lease MUST prevent two replicas from completing the same occurrence.

**Rationale:** One occurrence needs one logical completion even when replicas overlap.

### Dispatch Application behavior (EXT.JOBS.COMMAND.001)

**Requirement:** A scheduled job MUST dispatch an Application Command or approved Application port.

**Rationale:** Application owns the use-case boundary that the schedule triggers.

### Exclude direct storage and HTTP execution (EXT.JOBS.COMMAND.002)

**Requirement:** A scheduled job MUST NOT mutate a Marten session or DbContext directly, bypass Domain behavior, or call WebApi endpoints.

**Rationale:** Direct storage and HTTP calls bypass the command boundary and its authorization, transaction, and validation behavior.

### Bound job retries (EXT.JOBS.RETRY.001)

**Requirement:** A scheduled job MUST use bounded attempts, cancellation-aware backoff, and a poison state for permanent failure.

**Rationale:** Bounded retries prevent one failed occurrence from consuming Worker capacity indefinitely.

### Tolerate duplicate execution (EXT.JOBS.RETRY.002)

**Requirement:** A scheduled job Command and side effect MUST tolerate duplicate execution after lease or process failure.

**Rationale:** A failed process can leave uncertain completion before its lease expires.

### Treat unavailable schedule stores as outages (EXT.JOBS.RETRY.003)

**Requirement:** A Worker MUST treat an unavailable scheduler store as a transient dependency outage with backed-off, rate-limited logging.

**Rationale:** The implementation stores availability differs from a claimed occurrence's retry or poison outcome.

### Persist occurrence recovery points (EXT.JOBS.RECOVERY.001)

**Requirement:** A scheduled-job store MUST persist each occurrence's last scheduled, started, and completed time.

**Rationale:** Persisted points identify missed work and completed work after restart.

### Define misfire recovery (EXT.JOBS.RECOVERY.002)

**Requirement:** A scheduled-job specification MUST define skipped, once-replayed, or interval-replayed behavior for missed occurrences.

**Rationale:** The selected policy controls the business effect of downtime and delay.

### Provide operational recovery procedures (EXT.JOBS.RECOVERY.003)

**Requirement:** A scheduled-job owner MUST provide inspection, manual replay, and disable procedures.

**Rationale:** Operators need controlled actions for stalled, failed, or unsafe schedules.

### Derive stable occurrence identity (EXT.JOBS.OCCURRENCE.001)

**Requirement:** A scheduled-job store MUST derive each occurrence identity from its schedule ID and scheduled instant.

**Rationale:** One planned time receives one stable identity across retries and Worker replicas.

### Persist occurrence state (EXT.JOBS.OCCURRENCE.002)

**Requirement:** A scheduled-job store MUST persist scheduled, processing, completed, and dead-letter state with safe execution details.

**Rationale:** State records include attempt, lease, start, completion, and safe error data.

### Scope command idempotency by occurrence (EXT.JOBS.OCCURRENCE.003)

**Requirement:** A scheduled job MUST use its occurrence identity as the command idempotency scope.

**Rationale:** Retries of one occurrence remain tied to the same scheduled business action.

### Restrict completion by fencing value (EXT.JOBS.OCCURRENCE.004)

**Requirement:** A Worker MUST mark completion only while its fencing value remains current.

**Rationale:** A stale worker does not complete work after another replica owns the occurrence.

### Audit manual replay (EXT.JOBS.OCCURRENCE.005)

**Requirement:** A manual replay MUST create an audited new attempt for the same occurrence identity.

**Rationale:** Replay preserves the original scheduled instant and its history.

### Prefer UTC schedules (EXT.JOBS.TIME.001)

**Requirement:** A scheduled job SHOULD use a UTC schedule.

**Deviation:** A documented business-local time requirement permits an IANA time-zone schedule.

**Rationale:** UTC avoids local clock ambiguity for most recurring work.

### Define business-local clock behavior (EXT.JOBS.TIME.002)

**Requirement:** A business-local schedule MUST record an IANA time-zone identifier and define skipped and repeated local-time behavior.

**Rationale:** Clock transitions can omit or repeat a local wall-clock time.

### Test time transitions (EXT.JOBS.TIME.003)

**Requirement:** A scheduled-job test MUST use an injected clock and representative time-zone transitions.

**Rationale:** A controllable clock exercises delayed and daylight-saving behavior deterministically.

### Exclude machine-local time (EXT.JOBS.TIME.004)

**Requirement:** Scheduled-job production code MUST NOT depend on machine-local time.

**Rationale:** Host-local configuration makes schedule behavior differ between environments.

## Conventions

### Place handlers with owned behavior (EXT.JOBS.CONVENTION.001)

**Default:** Create one job handler under the module that owns its behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The module owns the business action and its schedule meaning.

### Use execution scopes (EXT.JOBS.CONVENTION.002)

**Default:** Resolve scoped dependencies inside an execution scope and dispose the scope after the Command completes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One scope isolates a job occurrence's dependencies and disposal.

### Separate schedule definitions (EXT.JOBS.CONVENTION.003)

**Default:** Keep schedule definitions separate from Command behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Timing policy and business behavior change for different reasons.

## Dependencies

No additional baseline package is required. Schedule state uses selected persistence and PostgreSQL leases.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.JOBS.ADOPT.001 | inspection | Job documentation records each required schedule and operating field. |
| EXT.JOBS.WORKER.001 | test | `JobsWorkerTests` run through Worker rather than WebApi. |
| EXT.JOBS.WORKER.002 | test | `JobsWorkerTests` stop new job work and honor cancellation and duration bounds. |
| EXT.JOBS.LEASE.001 | test | `JobsLeaseTests` store owner, expiry, and fencing value. |
| EXT.JOBS.LEASE.002 | test | `JobsLeaseTests` stop the worker after ownership loss. |
| EXT.JOBS.LEASE.003 | test | `JobsLeaseTests` produce one completed occurrence. |
| EXT.JOBS.COMMAND.001 | static | `JobsCommandTests` asserts job source dispatches an Application Command or approved port. |
| EXT.JOBS.COMMAND.002 | static | `JobsCommandTests` asserts job source contains no direct session, DbContext, Domain bypass, or WebApi call. |
| EXT.JOBS.RETRY.001 | test | `JobsRetryTests` exercise attempt bounds, backoff, cancellation, and poison state. |
| EXT.JOBS.RETRY.002 | test | `JobsRetryTests` leave correct command and side-effect outcomes. |
| EXT.JOBS.RETRY.003 | test | `JobsRetryTests` use backed-off, rate-limited logging. |
| EXT.JOBS.RECOVERY.001 | test | `JobsRecoveryTests` retain scheduled, started, and completed occurrence times. |
| EXT.JOBS.RECOVERY.002 | test | `JobsRecoveryTests` follow the documented skip or replay policy. |
| EXT.JOBS.RECOVERY.003 | operation | Runbooks provide inspection, manual replay, and disable procedures. |
| EXT.JOBS.OCCURRENCE.001 | test | `JobsOccurrenceTests` derive stable IDs from schedule ID and instant. |
| EXT.JOBS.OCCURRENCE.002 | test | `JobsOccurrenceTests` persist all declared occurrence lifecycle states. |
| EXT.JOBS.OCCURRENCE.003 | test | `JobsOccurrenceTests` asserts duplicate occurrence commands use one idempotency scope. |
| EXT.JOBS.OCCURRENCE.004 | test | `JobsOccurrenceTests` cannot mark an occurrence complete. |
| EXT.JOBS.OCCURRENCE.005 | test | `JobsOccurrenceTests` asserts manual replay records a new audited attempt under the same identity. |
| EXT.JOBS.TIME.001 | inspection | Schedule review records UTC or a documented business-local deviation. |
| EXT.JOBS.TIME.002 | test | `JobsTimeTests` cover the named IANA zone's skipped and repeated times. |
| EXT.JOBS.TIME.003 | test | `JobsTimeTests` inject time and execute representative clock transitions. |
| EXT.JOBS.TIME.004 | static | `JobsTimeTests` asserts job source reads no machine-local clock. |
| EXT.JOBS.CONVENTION.001 | inspection | Job handler location follows module ownership or records replacement. |
| EXT.JOBS.CONVENTION.002 | test | `JobsTests` create and dispose a scope per Command. |
| EXT.JOBS.CONVENTION.003 | inspection | Schedule definition source remains separate from Command behavior. |
