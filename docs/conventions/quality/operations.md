# Operations

## Intent


A released application is observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Agent Summary {#agent-summary}


- AppHost starts every baseline local resource. (OPS.LOCAL.001)
- Diagnostics carry correlation identifiers and stable names. (OPS.OBSERVABILITY.001)
- Liveness and readiness are separate endpoints. (OPS.HEALTH.001)
- Schema changes run as a release step before traffic. (OPS.SCHEMA.001)
- Backups declare their owner, retention, and tested restore. (OPS.DATA.001)
- Deployments promote versioned artifacts with declared evidence. (OPS.DEPLOY.001)
- Rollback is documented and rehearsed before release. (OPS.ROLLBACK.001)
- Workers publish their own health and backlog signals. (OPS.WORKER.001)
- External calls declare timeouts, cancellation, and bounded retries. (OPS.DEPENDENCIES.001)
- Every baseline alert declares owner, threshold, and runbook. (OPS.ALERTS.001)

## Standards


### Use Aspire for local orchestration (OPS.LOCAL.001)

**Requirement:** `AppHost` MUST start WebApi, PostgreSQL, configured frontends, and enabled Workers for local development.

**Rationale:** `ServiceDefaults` supplies the shared discovery, health, resilience, and telemetry defaults those resources rely on.

### Emit correlated diagnostics (OPS.OBSERVABILITY.001)

**Requirement:** A host MUST emit structured logs, traces, and metrics carrying timestamp, level, service, environment, trace identifier, and span identifier.

**Rationale:** Correlated identifiers let one request be followed across hosts. Stable event names keep dashboards working across releases.

### Separate liveness and readiness (OPS.HEALTH.001)

**Requirement:** A host MUST expose `/health/live` without dependency checks and `/health/ready` including its critical dependencies.

**Rationale:** Readiness fails when the application cannot safely serve traffic, while liveness stays true so the orchestrator does not restart a healthy process.

### Apply schema changes outside request startup (OPS.SCHEMA.001)

**Requirement:** A hosted schema change MUST run as a dedicated release step before traffic shifts, not during replica startup.

**Rationale:** Release review covers both the new and rollback application versions against that schema.

### Define backup and restore behavior (OPS.DATA.001)

**Requirement:** A release MUST document backup owner, schedule, retention, encryption, location, restore command, and recovery objectives.

**Rationale:** Restore tests run on representative data before production releases and after material schema changes. A backup without a tested restore is not a backup.

### Use a repeatable deployment (OPS.DEPLOY.001)

**Requirement:** A deployment MUST use versioned artifacts, declared configuration, a schema step, readiness checks, and declared end-to-end evidence.

**Rationale:** Deploying from an uncommitted tree or a mutable branch reference makes the deployed content unknowable afterwards.

### Keep rollback executable (OPS.ROLLBACK.001)

**Requirement:** A release MUST document the previous artifact reference, rollback command, configuration and schema compatibility, and data recovery condition.

**Rationale:** Rollback tests run before production releases. Destructive schema work requires an expand-and-contract sequence so the previous version still reads the data.

### Operate background work independently (OPS.WORKER.001)

**Requirement:** A Worker MUST publish its own liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior.

**Rationale:** WebApi readiness otherwise hides a failed durable-delivery Worker while the queue grows unobserved.

### Bound external calls (OPS.DEPENDENCIES.001)

**Requirement:** Every network call MUST declare an explicit timeout and cancellation path, and retry only safe operations within bounded attempts.

**Rationale:** An unbounded call holds a request thread until an unrelated system recovers.

### Define actionable baseline alerts (OPS.ALERTS.001)

**Requirement:** A baseline alert MUST declare owner, threshold, evaluation window, severity, and runbook before a production release.

**Rationale:** Coverage includes sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments.

## Conventions


### Use one local start command (OPS.CONVENTION.001)

**Default:** Name one AppHost command in the consumer `AGENTS.md` that starts every baseline local dependency.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A developer starting PostgreSQL and WebApi through unrelated manual steps will eventually run a different combination than CI.

### Use stable service names (OPS.CONVENTION.002)

**Default:** Keep service, resource, meter, and trace-source names identical across environments.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A deployment-generated identifier breaks every dashboard and alert that referenced the previous name.

### Keep runbooks near project documentation (OPS.CONVENTION.003)

**Default:** Place runbooks under `docs/runbooks/`, each stating trigger, impact, prerequisites, steps, and verification.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Coverage includes backup restore, rollback, failed schema application, leaked secret response, dependency outage, and extension recovery.

## Reference example

This informative example demonstrates `OPS.DEPLOY.001` and `OPS.ROLLBACK.001`.

A release applies a reviewed Marten schema plan and deploys the versioned API artifact. It waits for `/health/ready`, then runs the included end-to-end tests. One retained command restores the previous artifact when a test fails.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| OPS.LOCAL.001 | inspection | `AppHostTests` asserts the orchestration graph starts each baseline resource the solution declares. |
| OPS.OBSERVABILITY.001 | inspection | `TelemetryTests` asserts each emitted log and span carries the correlation fields. |
| OPS.HEALTH.001 | inspection | `HealthEndpointTests` asserts liveness ignores dependencies and readiness fails when a critical dependency is down. |
| OPS.SCHEMA.001 | inspection | Deployment review confirms the schema step precedes traffic and no replica applies schema at startup. |
| OPS.DATA.001 | operation | The release record names the restore test date and its representative data set. |
| OPS.DEPLOY.001 | operation | The release record names the immutable artifact reference the deployment promoted. |
| OPS.ROLLBACK.001 | operation | The release record names the rollback rehearsal result and the previous artifact reference. |
| OPS.WORKER.001 | inspection | `WorkerHealthTests` asserts the Worker publishes each signal independently of WebApi readiness. |
| OPS.DEPENDENCIES.001 | inspection | `ResilienceTests` asserts each outbound call declares a timeout and bounded retry policy. |
| OPS.ALERTS.001 | operation | The alert inventory records owner, threshold, window, severity, and runbook for each baseline alert. |
| OPS.CONVENTION.001 | inspection | Consumer `AGENTS.md` review confirms one start command covers the baseline dependencies. |
| OPS.CONVENTION.002 | inspection | Telemetry review confirms each emitted name is environment-independent. |
| OPS.CONVENTION.003 | inspection | Runbook review confirms each procedure states its trigger, steps, and verification. |
