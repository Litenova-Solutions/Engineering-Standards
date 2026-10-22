# Scheduled Jobs

## Intent

Scheduled jobs start work from a timetable instead of from a request, such as nightly statements, delayed reminders, and calendar-based billing. This page states how a project records each schedule, runs it in a Worker with leases that survive restarts and overlapping replicas, and recovers missed occurrences (planned runs the outage skipped); durable event dispatch belongs to the outbox extension. A team applies it for recurring, delayed, or calendar-based work, so each occurrence runs once even when a replica fails mid-job.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `jobs` for recurring, delayed, or calendar-based work. Selecting it activates `litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request`: the project declares the execution host that runs the scheduler.

## Baseline relationship

This extension replaces no baseline provision.

This extension switches on `limit` and `runbook`: schedules bound their retention with Limit records and operators recover through Runbook records.

## Standards

### Record schedule behavior

**Statement:** A scheduled-job record MUST name schedule, time zone, delay, overlap, misfire, idempotency, retry, owners, and status, with a draft naming decider and decide-by date.

**Rationale:** The schedule record states when work may run and how it recovers from normal scheduling faults: schedule, time zone, delay, overlap, misfire, idempotency, retry, owners, and status. The owners are the operating owner and the record owner, and a draft names its decider and decide-by date. A schedule without that record leaves each fault for the on-call operator to invent around.

### Run jobs in Worker

**Statement:** A scheduled job MUST run in Worker outside WebApi request handling.

**Rationale:** Scheduled work runs in a Worker, outside WebApi request handling. The Worker owns the schedule's lifetime and shuts its replicas down in a controlled order. Request handling has neither a scheduler nor a shutdown order for background work.

### Bound job execution

**Statement:** A scheduled job MUST observe cancellation, have bounded duration, and stop accepting new work during graceful shutdown.

**Rationale:** Each job observes cancellation, bounds its duration, and stops accepting new work during graceful shutdown. Bounded execution lets a Worker stop without stranding work it can no longer watch. An unbounded job turns every deploy into a wait for work that never ends.

### Store execution leases

**Statement:** A scheduled-job store MUST record lease owner, expiry, and fencing value in PostgreSQL.

**Rationale:** Each planned occurrence carries a lease with its owner, expiry, and fencing value in PostgreSQL. The lease names the one replica that may complete that occurrence. The outbox extension cites this definition for its own claims.

### Renew only owned leases

**Statement:** A Worker replica MUST renew only its active lease and stop when renewal fails.

**Rationale:** A replica renews only the lease it holds and only while it stays active. A failed renewal means another replica owns the occurrence now. The loser stops instead of completing work it no longer owns.

### Prevent duplicate completion

**Statement:** A scheduled-job lease MUST prevent two replicas from completing the same occurrence.

**Rationale:** Overlapping replicas must not complete the same occurrence twice. The lease admits one completion per occurrence. Two completions would bill, notify, or reconcile the same planned work twice.

### Generate monotonic fencing values

**Statement:** A scheduled-job store MUST generate each fencing value monotonically per occurrence and check it on every completion write.

**Rationale:** Each fencing value rises monotonically per occurrence, and the store checks it on every completion write. A Worker that lost its lease presents a stale value the store rejects. The check closes the gap between losing the lease and learning about it.

### Scope occurrences and leases by tenant

**Statement:** A scheduled-job occurrence and its lease MUST carry tenant scope when the product isolates tenants.

**Rationale:** Products that isolate tenants scope each occurrence and its lease to one tenant. One tenant's schedules then never trigger, block, or expose another tenant's work. Unscoped leases would let a replica mix tenants inside one occurrence.

### Dispatch Application behavior

**Statement:** A scheduled job MUST dispatch an Application Command or approved Application port.

**Rationale:** The schedule triggers a use case, and the use case boundary lives in Application. Each job therefore dispatches an Application Command or an approved Application port. The schedule stays a trigger while the behavior stays owned.

### Exclude direct storage and HTTP execution

**Statement:** A scheduled job MUST NOT mutate a Marten session or DbContext directly, bypass Domain behavior, or call WebApi endpoints.

**Rationale:** A job that mutates a Marten session or DbContext directly, bypasses Domain behavior, or calls WebApi endpoints skips the command boundary. That boundary carries authorization, transaction, and validation the job would then lack. Jobs enter through Commands like every other caller.

### Bound job retries

**Statement:** A scheduled job MUST use bounded attempts, cancellation-aware backoff, and a poison state for permanent failure.

**Rationale:** Bounded attempts with cancellation-aware backoff cap what one failed occurrence consumes. A poison state parks the permanently failing occurrence instead of retrying it forever. Without the bound, one poison occurrence eats the Worker's whole capacity.

### Tolerate duplicate execution

**Statement:** A scheduled job Command and side effect MUST tolerate duplicate execution after lease or process failure.

**Rationale:** A lease or process failure can replay a job whose completion stayed uncertain. The job Command and its side effects tolerate that duplicate execution. Work that assumes exactly-once breaks on the first uncertain failure.

### Treat unavailable schedule stores as outages

**Statement:** A Worker MUST treat an unavailable scheduler store as the store outage `litespec/ext/outbox#distinguish-dependency-outage` defines, with backed-off, rate-limited logging.

**Rationale:** An unavailable scheduler store is an outage of the dependency, not a failed occurrence. The Worker treats it as the store outage `litespec/ext/outbox#distinguish-dependency-outage` defines, with backed-off, rate-limited logging. Retry and poison outcomes belong to claimed occurrences, not to a store nobody can reach.

### Persist occurrence recovery points

**Statement:** A scheduled-job store MUST persist each occurrence's last scheduled, started, and completed time.

**Rationale:** Last scheduled, started, and completed times persist per occurrence. After a restart, those points separate missed work from completed work. Memory alone cannot make that split, because the restart wipes it.

### Define misfire recovery

**Statement:** A scheduled-job specification MUST define skipped, once-replayed, or interval-replayed behavior for missed occurrences.

**Rationale:** Downtime and delay leave occurrences past their time. The specification states whether each missed occurrence is skipped, replayed once, or replayed per interval. The choice controls the business effect: a skipped reminder stays silent while a replayed one arrives late.

### Provide operational recovery procedures

**Statement:** A scheduled-job owner MUST provide Runbook records for inspection, manual replay, and disable.

**Rationale:** Stalled, failed, or unsafe schedules need controlled operator actions: inspection, manual replay, and disable. Runbook records carry those procedures. An operator without them improvises against the store during the incident.

Each procedure names the interface that performs it. A procedure that says "disable the schedule" without naming a command, an endpoint, or a configuration value remains undiscovered until the incident it was written for. Avoid an interface that writes to the schedule store directly, because it bypasses the occurrence identity `litespec/ext/jobs#derive-stable-occurrence-identity` depends on.

**Example:** A disable procedure names the configuration value or the administrative endpoint that stops the schedule. It states what happens to an occurrence already claimed.

### Derive stable occurrence identity

**Statement:** A scheduled-job store MUST derive each occurrence identity from its schedule ID and scheduled instant, removing occurrences older than the schedule's retention Limit record.

**Rationale:** Schedule ID plus scheduled instant gives each planned time one stable identity across retries and replicas. Retries of one occurrence then share their idempotency scope, and two replicas recognize the same occurrence. Occurrences older than the retention Limit record leave the store so the key space stays bounded.

The key space grows with the schedule's frequency and its retention. A per-second schedule kept for a year holds more than 30 million rows. [Quartz states the same practice](https://quartz-scheduler.net/documentation/best-practices.html) for a persistent job store.

**Example:** A daily schedule that retains occurrences for 90 days holds 90 rows. A minute schedule with the same retention holds more than 100,000 rows. That is a different storage decision.

### Persist occurrence state

**Statement:** A scheduled-job store MUST persist scheduled, processing, completed, and dead-letter state with safe execution details.

**Rationale:** Scheduled, processing, completed, and dead-letter states persist with attempt, lease, start, completion, and safe error data. The persisted state tells operators and recovery code where each occurrence stands. A store without states cannot separate work in flight from work never started.

### Scope command idempotency by occurrence

**Statement:** A scheduled job MUST use its occurrence identity as the command idempotency scope.

**Rationale:** The occurrence identity scopes the command idempotency key. Every retry of one occurrence then replays the same scheduled business action. A key scoped any wider would merge separate occurrences into one.

### Restrict completion by fencing value

**Statement:** A Worker MUST mark completion only while its fencing value remains current.

**Rationale:** The Worker marks completion only while its fencing value stays current. A stale value means another replica owns the occurrence now. Completing past that point would write one replica's result over another's ownership.

### Audit manual replay

**Statement:** A manual replay MUST create a new attempt for the same occurrence identity: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** A manual replay creates a new attempt under the same occurrence identity: an audit record where audit is selected, a standalone record otherwise. The replay keeps the original scheduled instant and its history. A replay recorded as a new occurrence would rewrite when the work was due.

### Prefer UTC schedules

**Statement:** A scheduled job MUST use a UTC schedule unless its specification names a business-local time requirement and its IANA time zone.

**Rationale:** A local schedule runs twice on one date each year and skips an hour on another. A daylight-saving transition does that to a wall clock. That behavior is correct for a job whose meaning is local, such as a nightly statement at 9 AM for a reader. It is a defect for every other job. Naming the time zone in the specification makes the transition behavior reviewable.

### Define business-local clock behavior

**Statement:** A business-local schedule MUST record an IANA time-zone identifier and define skipped and repeated local-time behavior.

**Rationale:** Daylight-saving transitions omit one local hour and repeat another. A business-local schedule records its IANA time-zone identifier and defines what happens to occurrences in the skipped and repeated hours. Without that definition, each transition silently drops or doubles the local work.

### Test time transitions

**Statement:** A scheduled-job test MUST use an injected clock and representative time-zone transitions.

**Rationale:** An injected clock lets tests move time to any transition on demand. Representative time-zone transitions then run deterministically instead of once a year in production. Tests on the real clock can only wait for the transition to arrive.

### Exclude machine-local time

**Statement:** Scheduled-job production code MUST NOT depend on machine-local time.

**Rationale:** Machine-local time follows each host's configuration. Production code that reads it schedules differently on a developer machine, in staging, and in production. Schedules read their time from the injected clock and the declared zone instead.

## Conventions

### Place handlers with owned behavior

**Default:** Create one job handler under the module that owns its behavior.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** One job handler lives under the module that owns its behavior. The module owns both the business action and what its schedule means. A handlers folder far from the behavior separates each schedule from its reason.

### Use execution scopes

**Default:** Resolve scoped dependencies inside an execution scope and dispose the scope after the Command completes.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Each occurrence resolves its scoped dependencies inside one execution scope and disposes it after the Command completes. The scope isolates one occurrence's dependencies from the next. A shared scope would leak one occurrence's state into another.

### Separate schedule definitions

**Default:** Keep schedule definitions separate from Command behavior.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Timing policy changes when operations needs a new rhythm, and Command behavior changes when the business needs a new outcome. Keeping schedule definitions separate from Command behavior lets each change alone. A schedule buried in the handler makes every timing change a code change.

## Dependencies

This extension adds no required package. Schedule state uses the selected persistence with PostgreSQL leases.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/jobs#record-schedule-behavior | guidance | Does each schedule record name every required field, its owner, and its status? |
| litespec/ext/jobs#run-jobs-in-worker | guidance | Does every scheduled job run in Worker, outside WebApi request handling? |
| litespec/ext/jobs#bound-job-execution | guidance | Does each job honor cancellation and duration bounds and stop during shutdown? |
| litespec/ext/jobs#store-execution-leases | guidance | Does the store record lease owner, expiry, and fencing value per occurrence? |
| litespec/ext/jobs#renew-only-owned-leases | guidance | Does a replica stop when its lease renewal fails? |
| litespec/ext/jobs#prevent-duplicate-completion | guidance | Does the lease prevent two replicas from completing one occurrence? |
| litespec/ext/jobs#generate-monotonic-fencing-values | guidance | Are fencing values monotonic per occurrence and checked on completion? |
| litespec/ext/jobs#scope-occurrences-and-leases-by-tenant | guidance | Do occurrences and leases carry tenant scope where tenants are isolated? |
| litespec/ext/jobs#dispatch-application-behavior | guidance | Does each job dispatch an Application Command or approved port? |
| litespec/ext/jobs#exclude-direct-storage-and-http-execution | guidance | Is job source free of direct storage mutation and WebApi calls? |
| litespec/ext/jobs#bound-job-retries | guidance | Are attempts bounded with cancellation-aware backoff and a poison state? |
| litespec/ext/jobs#tolerate-duplicate-execution | guidance | Do the job Command and side effect stay correct when a lease or process failure replays them? |
| litespec/ext/jobs#treat-unavailable-schedule-stores-as-outages | guidance | Does an unavailable store get backed-off, rate-limited logging? |
| litespec/ext/jobs#persist-occurrence-recovery-points | guidance | Does the store persist last scheduled, started, and completed times? |
| litespec/ext/jobs#define-misfire-recovery | guidance | Does the specification define skip or replay behavior for missed occurrences? |
| litespec/ext/jobs#provide-operational-recovery-procedures | guidance | Do Runbook records cover inspection, manual replay, and disable? |
| litespec/ext/jobs#derive-stable-occurrence-identity | guidance | Are occurrence identities stable per schedule and instant, with declared retention? |
| litespec/ext/jobs#persist-occurrence-state | guidance | Does the store persist scheduled, processing, completed, and dead-letter state? |
| litespec/ext/jobs#scope-command-idempotency-by-occurrence | guidance | Do retries of one occurrence share its idempotency scope? |
| litespec/ext/jobs#restrict-completion-by-fencing-value | guidance | Is completion refused once the fencing value is stale? |
| litespec/ext/jobs#audit-manual-replay | guidance | Does manual replay create a new audited attempt under the same identity? |
| litespec/ext/jobs#prefer-utc-schedules | guidance | Is each schedule UTC or a documented business-local deviation? |
| litespec/ext/jobs#define-business-local-clock-behavior | guidance | Does each local schedule name its zone and transition behavior? |
| litespec/ext/jobs#test-time-transitions | guidance | Do tests inject the clock and cover representative transitions? |
| litespec/ext/jobs#exclude-machine-local-time | guidance | Is production job code free of machine-local time reads? |
| litespec/ext/jobs#place-handlers-with-owned-behavior | guidance | Does each handler sit with its behavior's module or record an Exception? |
| litespec/ext/jobs#use-execution-scopes | guidance | Does each occurrence resolve scoped dependencies in one disposed scope? |
| litespec/ext/jobs#separate-schedule-definitions | guidance | Are schedule definitions separate from Command behavior or is an Exception recorded? |
