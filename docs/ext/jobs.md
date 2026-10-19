# Scheduled Jobs

## Intent

Scheduled work runs independently of HTTP requests and remains safe when replicas restart, overlap, or lose connectivity. This extension covers recurring and delayed jobs, not durable event dispatch.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `jobs` for recurring, delayed, or calendar-based work. It activates `standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request`, so the project declares the execution host that runs the scheduler.

## Baseline relationship

This extension replaces no baseline rule.

This extension switches on the Limit and Runbook record types.

## Agent Summary {#agent-summary}

- Record timing, overlap, retry, and owner behavior. (standards/rule/ext-jobs.record-schedule-behavior)
- Run jobs in Worker with bounded execution. (standards/rule/ext-jobs.run-jobs-in-worker, standards/rule/ext-jobs.bound-job-execution)
- Lease an occurrence across replicas. (standards/rule/ext-jobs.store-execution-leases)
- Generate fencing values monotonically per occurrence. (standards/rule/ext-jobs.generate-monotonic-fencing-values)
- Scope occurrences and leases by tenant. (standards/rule/ext-jobs.scope-occurrences-and-leases-by-tenant)
- Dispatch Application commands without direct storage mutation. (standards/rule/ext-jobs.dispatch-application-behavior, standards/rule/ext-jobs.exclude-direct-storage-and-http-execution)
- Bound retry and support duplicate execution. (standards/rule/ext-jobs.bound-job-retries, standards/rule/ext-jobs.tolerate-duplicate-execution)
- Define missed-occurrence and manual-replay behavior. (standards/rule/ext-jobs.persist-occurrence-recovery-points, standards/rule/ext-jobs.define-misfire-recovery)
- Use schedule-derived occurrence identities. (standards/rule/ext-jobs.derive-stable-occurrence-identity)

## Standards

### Record schedule behavior (standards/rule/ext-jobs.record-schedule-behavior)

**Requirement:** A scheduled-job record MUST name schedule, time zone, delay, overlap, misfire, idempotency, retry, owners, and status, with a draft naming decider and decide-by date.

**Rationale:** The contract describes when work may run and how it recovers from normal scheduling faults. Owners are the operating owner and the record owner.

### Run jobs in Worker (standards/rule/ext-jobs.run-jobs-in-worker)

**Requirement:** A scheduled job MUST run in Worker outside WebApi request handling.

**Rationale:** Worker execution permits independent scheduling and controlled replica shutdown.

### Bound job execution (standards/rule/ext-jobs.bound-job-execution)

**Requirement:** A scheduled job MUST observe cancellation, have bounded duration, and stop accepting new work during graceful shutdown.

**Rationale:** Bounded work lets a Worker stop without abandoning uncontrolled execution.

### Store execution leases (standards/rule/ext-jobs.store-execution-leases)

**Requirement:** A scheduled-job store MUST record lease owner, expiry, and fencing value in PostgreSQL.

**Rationale:** The lease identifies the replica that can complete one planned occurrence. The outbox extension cites this definition for its own claims.

### Renew only owned leases (standards/rule/ext-jobs.renew-only-owned-leases)

**Requirement:** A Worker replica MUST renew only its active lease and stop when renewal fails.

**Rationale:** Losing the lease ends authority to complete the scheduled occurrence.

### Prevent duplicate completion (standards/rule/ext-jobs.prevent-duplicate-completion)

**Requirement:** A scheduled-job lease MUST prevent two replicas from completing the same occurrence.

**Rationale:** One occurrence needs one logical completion even when replicas overlap.

### Generate monotonic fencing values (standards/rule/ext-jobs.generate-monotonic-fencing-values)

**Requirement:** A scheduled-job store MUST generate each fencing value monotonically per occurrence and check it on every completion write.

**Rationale:** A monotonic value lets the store reject a completion from a worker that no longer owns the lease.

### Scope occurrences and leases by tenant (standards/rule/ext-jobs.scope-occurrences-and-leases-by-tenant)

**Requirement:** A scheduled-job occurrence and its lease MUST carry tenant scope when the product isolates tenants.

**Rationale:** Tenant scope keeps one tenant's scheduled work separate from another's.

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

**Requirement:** A Worker MUST treat an unavailable scheduler store as the store outage `standards/rule/ext-outbox.distinguish-dependency-outage` defines, with backed-off, rate-limited logging.

**Rationale:** Store availability differs from a claimed occurrence's retry or poison outcome.

### Persist occurrence recovery points (standards/rule/ext-jobs.persist-occurrence-recovery-points)

**Requirement:** A scheduled-job store MUST persist each occurrence's last scheduled, started, and completed time.

**Rationale:** Persisted points identify missed work and completed work after restart.

### Define misfire recovery (standards/rule/ext-jobs.define-misfire-recovery)

**Requirement:** A scheduled-job specification MUST define skipped, once-replayed, or interval-replayed behavior for missed occurrences.

**Rationale:** The selected policy controls the business effect of downtime and delay.

### Provide operational recovery procedures (standards/rule/ext-jobs.provide-operational-recovery-procedures)

**Requirement:** A scheduled-job owner MUST provide Runbook records for inspection, manual replay, and disable.

**Rationale:** Operators need controlled actions for stalled, failed, or unsafe schedules.

Each procedure names the interface that performs it. A procedure that reads "disable the schedule" with no command, endpoint, or configuration value behind it is discovered during the incident it was written for. An interface that writes to the schedule store directly is the one to avoid, because it bypasses the occurrence identity `standards/rule/ext-jobs.derive-stable-occurrence-identity` depends on.

**Example:** A disable procedure names the configuration value or the administrative endpoint that stops the schedule, and states what happens to an occurrence already claimed.

### Derive stable occurrence identity (standards/rule/ext-jobs.derive-stable-occurrence-identity)

**Requirement:** A scheduled-job store MUST derive each occurrence identity from its schedule ID and scheduled instant, removing occurrences older than the schedule's retention Limit record.

**Rationale:** One planned time receives one stable identity across retries and replicas.

The key space grows with the schedule's frequency and its retention, so a per-second schedule kept for a year is over thirty million rows. [Quartz states the same practice](https://quartz-scheduler.net/documentation/best-practices.html) for a persistent job store.

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

**Requirement:** A manual replay MUST create a new attempt for the same occurrence identity: an audit record when audit is selected, a standalone record otherwise.

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

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The module owns the business action and its schedule meaning.

### Use execution scopes (standards/rule/ext-jobs.use-execution-scopes)

**Default:** Resolve scoped dependencies inside an execution scope and dispose the scope after the Command completes.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** One scope isolates a job occurrence's dependencies and disposal.

### Separate schedule definitions (standards/rule/ext-jobs.separate-schedule-definitions)

**Default:** Keep schedule definitions separate from Command behavior.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Timing policy and business behavior change for different reasons.

## Dependencies

No additional baseline package is required. Schedule state uses selected persistence and PostgreSQL leases.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/ext-jobs.record-schedule-behavior | guidance | Does each schedule record name every required field, its owner, and its status? |
| standards/rule/ext-jobs.run-jobs-in-worker | guidance | Does every scheduled job run in Worker, outside WebApi request handling? |
| standards/rule/ext-jobs.bound-job-execution | guidance | Does each job honor cancellation and duration bounds and stop during shutdown? |
| standards/rule/ext-jobs.store-execution-leases | guidance | Does the store record lease owner, expiry, and fencing value per occurrence? |
| standards/rule/ext-jobs.renew-only-owned-leases | guidance | Does a replica stop when its lease renewal fails? |
| standards/rule/ext-jobs.prevent-duplicate-completion | guidance | Does the lease prevent two replicas completing one occurrence? |
| standards/rule/ext-jobs.generate-monotonic-fencing-values | guidance | Are fencing values monotonic per occurrence and checked on completion? |
| standards/rule/ext-jobs.scope-occurrences-and-leases-by-tenant | guidance | Do occurrences and leases carry tenant scope where tenants are isolated? |
| standards/rule/ext-jobs.dispatch-application-behavior | guidance | Does each job dispatch an Application Command or approved port? |
| standards/rule/ext-jobs.exclude-direct-storage-and-http-execution | guidance | Is job source free of direct storage mutation and WebApi calls? |
| standards/rule/ext-jobs.bound-job-retries | guidance | Are attempts bounded with cancellation-aware backoff and a poison state? |
| standards/rule/ext-jobs.tolerate-duplicate-execution | guidance | Do the job Command and side effect stay correct when a lease or process failure replays them? |
| standards/rule/ext-jobs.treat-unavailable-schedule-stores-as-outages | guidance | Does an unavailable store get backed-off, rate-limited logging? |
| standards/rule/ext-jobs.persist-occurrence-recovery-points | guidance | Does the store persist last scheduled, started, and completed times? |
| standards/rule/ext-jobs.define-misfire-recovery | guidance | Does the specification define skip or replay behavior for missed occurrences? |
| standards/rule/ext-jobs.provide-operational-recovery-procedures | guidance | Do Runbook records cover inspection, manual replay, and disable? |
| standards/rule/ext-jobs.derive-stable-occurrence-identity | guidance | Are occurrence identities stable per schedule and instant, with declared retention? |
| standards/rule/ext-jobs.persist-occurrence-state | guidance | Does the store persist scheduled, processing, completed, and dead-letter state? |
| standards/rule/ext-jobs.scope-command-idempotency-by-occurrence | guidance | Do retries of one occurrence share its idempotency scope? |
| standards/rule/ext-jobs.restrict-completion-by-fencing-value | guidance | Is completion refused once the fencing value is stale? |
| standards/rule/ext-jobs.audit-manual-replay | guidance | Does manual replay create a new audited attempt under the same identity? |
| standards/rule/ext-jobs.prefer-utc-schedules | guidance | Is each schedule UTC or a documented business-local deviation? |
| standards/rule/ext-jobs.define-business-local-clock-behavior | guidance | Does each local schedule name its zone and transition behavior? |
| standards/rule/ext-jobs.test-time-transitions | guidance | Do tests inject the clock and cover representative transitions? |
| standards/rule/ext-jobs.exclude-machine-local-time | guidance | Is production job code free of machine-local time reads? |
| standards/rule/ext-jobs.place-handlers-with-owned-behavior | guidance | Does each handler sit with its behavior's module or record an Exception? |
| standards/rule/ext-jobs.use-execution-scopes | guidance | Does each occurrence resolve scoped dependencies in one disposed scope? |
| standards/rule/ext-jobs.separate-schedule-definitions | guidance | Are schedule definitions separate from Command behavior or is an Exception recorded? |
