# Operations

## Intent


A released application is observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Agent Summary {#agent-summary}


- AppHost starts every baseline local resource. (standards/rule/quality-operations.use-aspire-for-local-orchestration)
- Diagnostics carry correlation identifiers and stable names. (standards/rule/quality-operations.emit-correlated-diagnostics)
- Liveness and readiness are separate endpoints. (standards/rule/quality-operations.separate-liveness-and-readiness)
- Schema changes run as a release step before traffic. (standards/rule/quality-operations.apply-schema-changes-outside-request-startup)
- Backups declare their owner, retention, and tested restore. (standards/rule/quality-operations.define-backup-and-restore-behavior)
- Deployments promote versioned artifacts with declared evidence. (standards/rule/quality-operations.use-a-repeatable-deployment)
- Rollback is documented and rehearsed before release. (standards/rule/quality-operations.keep-rollback-executable)
- Workers publish their own health and backlog signals. (standards/rule/quality-operations.operate-background-work-independently)
- External calls declare timeouts, cancellation, and bounded retries. (standards/rule/quality-operations.bound-external-calls)
- Every baseline alert declares owner, threshold, and runbook. (standards/rule/quality-operations.define-actionable-baseline-alerts)

## Standards


### Use Aspire for local orchestration (standards/rule/quality-operations.use-aspire-for-local-orchestration)

**Requirement:** A workspace MUST start WebApi, PostgreSQL, configured frontends, and its background execution host with one local command.

**Rationale:** The baseline command is Aspire's `AppHost`, and `ServiceDefaults` supplies the shared discovery, health, resilience, and telemetry defaults its resources rely on. A workspace that orchestrates the same set another way satisfies this rule with its own command. The obligation is that one command brings the stack up, not that one tool does.

### Emit correlated diagnostics (standards/rule/quality-operations.emit-correlated-diagnostics)

**Requirement:** A host MUST emit structured logs, traces, and metrics carrying timestamp, level, service, environment, trace identifier, and span identifier.

**Rationale:** Correlated identifiers let one request be followed across hosts. Stable event names keep dashboards working across releases.

### Pass trace context in the W3C format (standards/rule/quality-operations.pass-trace-context-in-the-w3c-format)

**Requirement:** A host MUST read and write trace context as the [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent` and `tracestate` headers, using one configured propagator.

**Rationale:** An identifier that each host formats its own way correlates nothing across the boundary between them. `traceparent` is the format OpenTelemetry implements and every managed backend accepts. A trace then crosses a frontend, an API, a background host, and a provider without translation.

One propagator is the part that matters. Two configured propagators produce two identifiers for one request, and the trace splits at whichever hop reads the other one.

**Example:** The trace identifier in a Problem Details response is the trace-id field of the current `traceparent`, which is what `standards/rule/backend-api.return-stable-problem-details` returns.

### Separate liveness and readiness (standards/rule/quality-operations.separate-liveness-and-readiness)

**Requirement:** A host MUST expose `/health/live` without dependency checks and `/health/ready` including its critical dependencies.

**Rationale:** Readiness fails when the application cannot safely serve traffic, while liveness stays true so the orchestrator does not restart a healthy process.

### Apply schema changes outside request startup (standards/rule/quality-operations.apply-schema-changes-outside-request-startup)

**Requirement:** A hosted schema change MUST run as a dedicated release step before traffic shifts, not during replica startup.

**Rationale:** Release review covers both the new and rollback application versions against that schema.

### Define backup and restore behavior (standards/rule/quality-operations.define-backup-and-restore-behavior)

**Requirement:** A release MUST document backup owner, schedule, retention, encryption, location, restore command, and recovery objectives.

**Rationale:** Restore tests run on representative data before production releases and after material schema changes. A backup without a tested restore is not a backup.

### Use a repeatable deployment (standards/rule/quality-operations.use-a-repeatable-deployment)

**Requirement:** A deployment MUST use versioned artifacts, declared configuration, a schema step, readiness checks, and declared end-to-end evidence.

**Rationale:** Deploying from an uncommitted tree or a mutable branch reference makes the deployed content unknowable afterwards.

### Keep rollback executable (standards/rule/quality-operations.keep-rollback-executable)

**Requirement:** A release MUST document the previous artifact reference, rollback command, configuration and schema compatibility, and data recovery condition.

**Rationale:** Rollback tests run before production releases. Destructive schema work requires an expand-and-contract sequence so the previous version still reads the data.

### Operate background work independently (standards/rule/quality-operations.operate-background-work-independently)

**Requirement:** A Worker MUST publish its own liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior.

**Rationale:** WebApi readiness otherwise hides a failed durable-delivery Worker while the queue grows unobserved.

### Bound external calls (standards/rule/quality-operations.bound-external-calls)

**Requirement:** Every network call MUST declare an explicit timeout and cancellation path, and retry only safe operations within bounded attempts.

**Rationale:** An unbounded call holds a request thread until an unrelated system recovers.

### Define actionable baseline alerts (standards/rule/quality-operations.define-actionable-baseline-alerts)

**Requirement:** A baseline alert MUST declare owner, threshold, evaluation window, severity, and runbook before a production release.

**Rationale:** Coverage includes sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments.

### Route each severity to a declared destination (standards/rule/quality-operations.route-each-severity-to-a-declared-destination)

**Requirement:** An alert inventory MUST state, for each severity it uses, the destination that receives the alert and the response time expected of it.

**Rationale:** A declared severity with no destination is a label. Every alert then arrives in the same place, and the page that wakes somebody is read beside the one that does not need to. [Prometheus alerting practice](https://prometheus.io/docs/practices/alerting/) states the same separation between a page and a ticket.

**Example:** A two-severity inventory routes `page` to the on-call destination with a stated response time, and `ticket` to the queue reviewed each working day.

## Conventions


### Use one local start command (standards/rule/quality-operations.use-one-local-start-command)

**Default:** Name one AppHost command in the consumer `AGENTS.md` that starts every baseline local dependency.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A developer starting PostgreSQL and WebApi through unrelated manual steps will eventually run a different combination than CI.

### Use stable service names (standards/rule/quality-operations.use-stable-service-names)

**Default:** Keep service, resource, meter, and trace-source names identical across environments.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A deployment-generated identifier breaks every dashboard and alert that referenced the previous name.

### Keep runbooks near project documentation (standards/rule/quality-operations.keep-runbooks-near-project-documentation)

**Default:** Place runbooks under `docs/runbooks/`, each stating trigger, impact, prerequisites, steps, and verification.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Coverage includes backup restore, rollback, failed schema application, leaked secret response, dependency outage, and extension recovery.

## Reference example

This informative example demonstrates `standards/rule/quality-operations.use-a-repeatable-deployment` and `standards/rule/quality-operations.keep-rollback-executable`.

A release applies a reviewed Marten schema plan and deploys the versioned API artifact. It waits for `/health/ready`, then runs the included end-to-end tests. One retained command restores the previous artifact when a test fails.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/quality-operations.use-aspire-for-local-orchestration | inspection | `AppHostTests` asserts the orchestration graph starts each baseline resource the solution declares. |
| standards/rule/quality-operations.emit-correlated-diagnostics | inspection | `TelemetryTests` asserts each emitted log and span carries the correlation fields. |
| standards/rule/quality-operations.separate-liveness-and-readiness | inspection | `HealthEndpointTests` asserts liveness ignores dependencies and readiness fails when a critical dependency is down. |
| standards/rule/quality-operations.apply-schema-changes-outside-request-startup | inspection | Deployment review confirms the schema step precedes traffic and no replica applies schema at startup. |
| standards/rule/quality-operations.define-backup-and-restore-behavior | operation | The release record names the restore test date and its representative data set. |
| standards/rule/quality-operations.use-a-repeatable-deployment | operation | The release record names the immutable artifact reference the deployment promoted. |
| standards/rule/quality-operations.keep-rollback-executable | operation | The release record names the rollback rehearsal result and the previous artifact reference. |
| standards/rule/quality-operations.operate-background-work-independently | inspection | `WorkerHealthTests` asserts the Worker publishes each signal independently of WebApi readiness. |
| standards/rule/quality-operations.bound-external-calls | inspection | `ResilienceTests` asserts each outbound call declares a timeout and bounded retry policy. |
| standards/rule/quality-operations.pass-trace-context-in-the-w3c-format | test | `TracePropagationTests` asserts an inbound `traceparent` reaches the outbound call unchanged in its trace-id, through one registered propagator. |
| standards/rule/quality-operations.define-actionable-baseline-alerts | operation | The alert inventory records owner, threshold, window, severity, and runbook for each baseline alert. |
| standards/rule/quality-operations.route-each-severity-to-a-declared-destination | operation | The alert inventory records a destination and an expected response time for each severity it uses. |
| standards/rule/quality-operations.use-one-local-start-command | inspection | Consumer `AGENTS.md` review confirms one start command covers the baseline dependencies. |
| standards/rule/quality-operations.use-stable-service-names | inspection | Telemetry review confirms each emitted name is environment-independent. |
| standards/rule/quality-operations.keep-runbooks-near-project-documentation | inspection | Runbook review confirms each procedure states its trigger, steps, and verification. |
