# Scheduled Jobs

## Intent

Scheduled work runs independently of HTTP requests and remains safe when replicas restart, overlap, or lose connectivity. This extension covers recurring and delayed jobs, not durable event dispatch.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`, `end-to-end-flow`.

The consumer enables `jobs` for recurring, delayed, or calendar-based work. It activates `standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request`, so the project declares the execution host that runs the scheduler.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record timing, overlap, retry, and owner behavior. (standards/rule/ext-jobs.record-schedule-behavior)
- Run jobs in Worker with bounded execution. (standards/rule/ext-jobs.run-jobs-in-worker, standards/rule/ext-jobs.bound-job-execution)
- Lease an occurrence across replicas. (standards/rule/ext-jobs.store-execution-leases)
- Dispatch Application commands without direct storage mutation. (standards/rule/ext-jobs.dispatch-application-behavior, standards/rule/ext-jobs.exclude-direct-storage-and-http-execution)
- Bound retry and support duplicate execution. (standards/rule/ext-jobs.bound-job-retries, standards/rule/ext-jobs.tolerate-duplicate-execution)
- Define missed-occurrence and manual-replay behavior. (standards/rule/ext-jobs.persist-occurrence-recovery-points, standards/rule/ext-jobs.define-misfire-recovery)
- Use schedule-derived occurrence identities. (standards/rule/ext-jobs.derive-stable-occurrence-identity)

## Standards

### Record schedule behavior (standards/rule/ext-jobs.record-schedule-behavior)

**Requirement:** A scheduled-job use case or decision MUST name schedule, time zone, delay, overlap, misfire, idempotency, retry, and operating owner.

**Rationale:** The contract describes when work may run and how it recovers from normal scheduling faults.

### Run jobs in Worker (standards/rule/ext-jobs.run-jobs-in-worker)

**Requirement:** A scheduled job MUST run in Worker outside WebApi request handling.

**Rationale:** Worker execution permits independent scheduling and controlled replica shutdown.

### Bound job execution (standards/rule/ext-jobs.bound-job-execution)

**Requirement:** A scheduled job MUST observe cancellation, have bounded duration, and stop accepting new work during graceful shutdown.

**Rationale:** Bounded work lets a Worker stop without abandoning uncontrolled execution.

### Store execution leases (standards/rule/ext-jobs.store-execution-leases)

**Requirement:** A scheduled-job store MUST record lease owner, expiry, and fencing value in PostgreSQL.

**Rationale:** The lease identifies the replica that can complete one planned occurrence.

### Renew only owned leases (standards/rule/ext-jobs.renew-only-owned-leases)

**Requirement:** A Worker replica MUST renew only its active lease and stop when renewal fails.

**Rationale:** Losing the lease ends authority to complete the scheduled occurrence.

### Prevent duplicate completion (standards/rule/ext-jobs.prevent-duplicate-completion)

**Requirement:** A scheduled-job lease MUST prevent two replicas from completing the same occurrence.

**Rationale:** One occurrence needs one logical completion even when replicas overlap.

### Dispatch Application behavior (standards/rule/ext-jobs.dispatch-application-behavior)

**Requirement:** A scheduled job MUST dispatch an Application Command or approved Application port.

**Rationale:** Application owns the use-case boundary that the schedule triggers.

### Exclude direct storage and HTTP execution (standards/rule/ext-jobs.exclude-direct-storage-and-http-execution)

**Requirement:** A scheduled job MUST NOT mutate a Marten session or DbContext directly, bypass Domain behavior, or call WebApi endpoints.

**Rationale:** Direct storage and HTTP calls bypass the command boundary and its authorization, transaction, and validation behavior.

### Bound job retries (standards/rule/ext-jobs.bound-job-retries)

**Requirement:** A scheduled job MUST use bounded attempts, cancellation-aware backoff, and a poison state for permanent failure.

**Rationale:** Bounded retries prevent one failed occurrence from consuming Worker capacity indefinitely.

### Tolerate duplicate execution (standards/rule/ext-jobs.tolerate-duplicate-execution)

**Requirement:** A scheduled job Command and side effect MUST tolerate duplicate execution after lease or process failure.

**Rationale:** A failed process can leave uncertain completion before its lease expires.

### Treat unavailable schedule stores as outages (standards/rule/ext-jobs.treat-unavailable-schedule-stores-as-outages)

**Requirement:** A Worker MUST treat an unavailable scheduler store as a transient dependency outage with backed-off, rate-limited logging.

**Rationale:** The implementation stores availability differs from a claimed occurrence's retry or poison outcome.

### Persist occurrence recovery points (standards/rule/ext-jobs.persist-occurrence-recovery-points)

**Requirement:** A scheduled-job store MUST persist each occurrence's last scheduled, started, and completed time.

**Rationale:** Persisted points identify missed work and completed work after restart.

### Define misfire recovery (standards/rule/ext-jobs.define-misfire-recovery)

**Requirement:** A scheduled-job specification MUST define skipped, once-replayed, or interval-replayed behavior for missed occurrences.

**Rationale:** The selected policy controls the business effect of downtime and delay.

### Provide operational recovery procedures (standards/rule/ext-jobs.provide-operational-recovery-procedures)

**Requirement:** A scheduled-job owner MUST provide inspection, manual replay, and disable procedures.

**Rationale:** Operators need controlled actions for stalled, failed, or unsafe schedules.

Each procedure names the interface that performs it. A procedure that reads "disable the schedule" with no command, endpoint, or configuration value behind it is discovered during the incident it was written for. An interface that writes to the schedule store directly is the one to avoid, because it bypasses the occurrence identity `standards/rule/ext-jobs.derive-stable-occurrence-identity` depends on.

**Example:** A disable procedure names the configuration value or the administrative endpoint that stops the schedule, and states what happens to an occurrence already claimed.

### Derive stable occurrence identity (standards/rule/ext-jobs.derive-stable-occurrence-identity)

**Requirement:** A scheduled-job store MUST derive each occurrence identity from its schedule ID and scheduled instant.

**Rationale:** One planned time receives one stable identity across retries and replicas.

The key space grows with the schedule's frequency and its retention, so a per-second schedule kept for a year is over thirty million rows. A schedule therefore declares how long its occurrences are retained, and the store removes the rest. [Quartz states the same practice](https://quartz-scheduler.net/documentation/best-practices.html) for a persistent job store.

**Example:** A daily schedule retaining occurrences for ninety days holds ninety rows. A minute schedule at the same retention holds over a hundred thousand, which is a different storage decision.

### Persist occurrence state (standards/rule/ext-jobs.persist-occurrence-state)

**Requirement:** A scheduled-job store MUST persist scheduled, processing, completed, and dead-letter state with safe execution details.

**Rationale:** State records include attempt, lease, start, completion, and safe error data.

### Scope command idempotency by occurrence (standards/rule/ext-jobs.scope-command-idempotency-by-occurrence)

**Requirement:** A scheduled job MUST use its occurrence identity as the command idempotency scope.

**Rationale:** Retries of one occurrence remain tied to the same scheduled business action.

### Restrict completion by fencing value (standards/rule/ext-jobs.restrict-completion-by-fencing-value)

**Requirement:** A Worker MUST mark completion only while its fencing value remains current.

**Rationale:** A stale worker does not complete work after another replica owns the occurrence.

### Audit manual replay (standards/rule/ext-jobs.audit-manual-replay)

**Requirement:** A manual replay MUST create an audited new attempt for the same occurrence identity.

**Rationale:** Replay preserves the original scheduled instant and its history.

### Prefer UTC schedules (standards/rule/ext-jobs.prefer-utc-schedules)

**Requirement:** A scheduled job MUST use a UTC schedule unless its specification names a business-local time requirement and its IANA time zone.

**Rationale:** A local schedule runs twice on one date each year and skips an hour on another. That is what a daylight-saving transition does to a wall clock. That behaviour is correct for a job whose meaning is local, such as a nightly statement at nine in the morning for a reader. It is a defect for every other job, and the earlier recommendation left the difference to a preference. Naming the time zone in the specification is what makes the transition behaviour reviewable.

### Define business-local clock behavior (standards/rule/ext-jobs.define-business-local-clock-behavior)

**Requirement:** A business-local schedule MUST record an IANA time-zone identifier and define skipped and repeated local-time behavior.

**Rationale:** Clock transitions can omit or repeat a local wall-clock time.

### Test time transitions (standards/rule/ext-jobs.test-time-transitions)

**Requirement:** A scheduled-job test MUST use an injected clock and representative time-zone transitions.

**Rationale:** A controllable clock exercises delayed and daylight-saving behavior deterministically.

### Exclude machine-local time (standards/rule/ext-jobs.exclude-machine-local-time)

**Requirement:** Scheduled-job production code MUST NOT depend on machine-local time.

**Rationale:** Host-local configuration makes schedule behavior differ between environments.

## Conventions

### Place handlers with owned behavior (standards/rule/ext-jobs.place-handlers-with-owned-behavior)

**Default:** Create one job handler under the module that owns its behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The module owns the business action and its schedule meaning.

### Use execution scopes (standards/rule/ext-jobs.use-execution-scopes)

**Default:** Resolve scoped dependencies inside an execution scope and dispose the scope after the Command completes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One scope isolates a job occurrence's dependencies and disposal.

### Separate schedule definitions (standards/rule/ext-jobs.separate-schedule-definitions)

**Default:** Keep schedule definitions separate from Command behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Timing policy and business behavior change for different reasons.

## Dependencies

No additional baseline package is required. Schedule state uses selected persistence and PostgreSQL leases.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-jobs.record-schedule-behavior | inspection | Job documentation records each required schedule and operating field. |
| standards/rule/ext-jobs.run-jobs-in-worker | test | `JobsWorkerTests` run through Worker rather than WebApi. |
| standards/rule/ext-jobs.bound-job-execution | test | `JobsWorkerTests` stop new job work and honor cancellation and duration bounds. |
| standards/rule/ext-jobs.store-execution-leases | test | `JobsLeaseTests` store owner, expiry, and fencing value. |
| standards/rule/ext-jobs.renew-only-owned-leases | test | `JobsLeaseTests` stop the worker after ownership loss. |
| standards/rule/ext-jobs.prevent-duplicate-completion | test | `JobsLeaseTests` produce one completed occurrence. |
| standards/rule/ext-jobs.dispatch-application-behavior | static | `JobsCommandTests` asserts job source dispatches an Application Command or approved port. |
| standards/rule/ext-jobs.exclude-direct-storage-and-http-execution | static | `JobsCommandTests` asserts job source contains no direct session, DbContext, Domain bypass, or WebApi call. |
| standards/rule/ext-jobs.bound-job-retries | test | `JobsRetryTests` exercise attempt bounds, backoff, cancellation, and poison state. |
| standards/rule/ext-jobs.tolerate-duplicate-execution | test | `JobsRetryTests` leave correct command and side-effect outcomes. |
| standards/rule/ext-jobs.treat-unavailable-schedule-stores-as-outages | test | `JobsRetryTests` use backed-off, rate-limited logging. |
| standards/rule/ext-jobs.persist-occurrence-recovery-points | test | `JobsRecoveryTests` retain scheduled, started, and completed occurrence times. |
| standards/rule/ext-jobs.define-misfire-recovery | test | `JobsRecoveryTests` follow the documented skip or replay policy. |
| standards/rule/ext-jobs.provide-operational-recovery-procedures | operation | Runbooks provide inspection, manual replay, and disable procedures. |
| standards/rule/ext-jobs.derive-stable-occurrence-identity | test | `JobsOccurrenceTests` derive stable IDs from schedule ID and instant. |
| standards/rule/ext-jobs.persist-occurrence-state | test | `JobsOccurrenceTests` persist all declared occurrence lifecycle states. |
| standards/rule/ext-jobs.scope-command-idempotency-by-occurrence | test | `JobsOccurrenceTests` asserts duplicate occurrence commands use one idempotency scope. |
| standards/rule/ext-jobs.restrict-completion-by-fencing-value | test | `JobsOccurrenceTests` cannot mark an occurrence complete. |
| standards/rule/ext-jobs.audit-manual-replay | test | `JobsOccurrenceTests` asserts manual replay records a new audited attempt under the same identity. |
| standards/rule/ext-jobs.prefer-utc-schedules | inspection | Schedule review records UTC or a documented business-local deviation. |
| standards/rule/ext-jobs.define-business-local-clock-behavior | test | `JobsTimeTests` cover the named IANA zone's skipped and repeated times. |
| standards/rule/ext-jobs.test-time-transitions | test | `JobsTimeTests` inject time and execute representative clock transitions. |
| standards/rule/ext-jobs.exclude-machine-local-time | static | `JobsTimeTests` asserts job source reads no machine-local clock. |
| standards/rule/ext-jobs.place-handlers-with-owned-behavior | inspection | Job handler location follows module ownership or records replacement. |
| standards/rule/ext-jobs.use-execution-scopes | test | `JobsTests` create and dispose a scope per Command. |
| standards/rule/ext-jobs.separate-schedule-definitions | inspection | Schedule definition source remains separate from Command behavior. |
