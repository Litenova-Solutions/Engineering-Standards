# Operations

## Intent


A released application is observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Agent Summary {#agent-summary}


- Use Aspire for local orchestration. (OPS.LOCAL.001)
- Emit correlated diagnostics. (OPS.OBSERVABILITY.001)
- Separate liveness and readiness. (OPS.HEALTH.001)
- Apply schema changes outside request startup. (OPS.SCHEMA.001)
- Define backup and restore behavior. (OPS.DATA.001)
- Use a repeatable deployment. (OPS.DEPLOY.001)
- Keep rollback executable. (OPS.ROLLBACK.001)
- Operate background work independently. (OPS.WORKER.001)
- Bound external calls. (OPS.DEPENDENCIES.001)
- Define actionable baseline alerts. (OPS.ALERTS.001)

## Standards


### Use Aspire for local orchestration (OPS.LOCAL.001)

**Requirement:** Applications MUST use Aspire for local orchestration.

**Rationale:** `{ProjectName}.AppHost` starts WebApi, PostgreSQL, configured frontend applications, and enabled Worker projects for local development. `{ProjectName}.ServiceDefaults` provides shared service discovery, health, resilience defaults, and OpenTelemetry registration.

Local orchestration does not define hosted deployment architecture.

ServiceDefaults contains registration and instrumentation plumbing only. It does not own application configuration, authentication, authorization, persistence mappings, provider ports, or business metrics. Each host calls it explicitly and retains control of endpoint mapping and host-specific checks.

### Emit correlated diagnostics (OPS.OBSERVABILITY.001)

**Requirement:** Applications MUST emit correlated diagnostics.

**Rationale:** Hosts emit structured logs, traces, and metrics through OpenTelemetry-compatible instrumentation. Logs include timestamp, level, message, service, environment, trace ID, and span ID where available.

The implementation uses stable event names or IDs for operationally relevant failures. The implementation does not log complete request bodies or tokens.

The implementation uses W3C trace context on inbound HTTP, outbound `HttpClient`, and asynchronous message boundaries. Worker transitions preserve trace relationships without propagating authentication tokens or sensitive baggage. The implementation records exceptions on the owning span and returns the trace ID in public Problem Details.

Metric names and attributes remain stable across releases. Attributes use bounded values such as service, environment, operation, outcome, and error code. The implementation does not use actor IDs, aggregate IDs, email addresses, raw URLs, exception messages, idempotency keys, or other unbounded values as metric attributes.

### Separate liveness and readiness (OPS.HEALTH.001)

**Requirement:** Applications MUST separate liveness and readiness.

**Rationale:** The application exposes:

- `/health/live` for process liveness without external dependency checks.
- `/health/ready` for readiness to receive traffic, including critical dependencies.

Readiness fails when the application cannot safely serve its included end-to-end flows. Health responses do not reveal connection strings or internal exception details.

Process-only checks carry the liveness tag, while critical dependencies carry the readiness tag. The implementation maps each path with an explicit health-check predicate. Tests cover PostgreSQL readiness failure and recovery.

### Apply schema changes outside request startup (OPS.SCHEMA.001)

**Requirement:** Applications MUST apply schema changes outside request startup.

**Rationale:** Hosted schema changes run as a dedicated release step before traffic shifts. Release review covers both new and rollback application versions.

WebApi and Worker replicas do not race to apply production schema changes during startup.

### Define backup and restore behavior (OPS.DATA.001)

**Requirement:** Applications MUST define backup and restore behavior.

**Rationale:** The implementation documents backup owner, schedule, retention, encryption, storage location, restore command, and recovery objectives. Restore tests use representative data before production releases and after material schema changes.

A backup without a verified restore does not satisfy the release standard.

### Use a repeatable deployment (OPS.DEPLOY.001)

**Requirement:** Applications MUST use a repeatable deployment.

**Rationale:** Deployment uses versioned artifacts, declared configuration, a schema step, readiness checks, and declared end-to-end evidence. The implementation does not deploy from an uncommitted working tree or mutable branch reference.

The container deployment extension adds image-specific requirements.

### Keep rollback executable (OPS.ROLLBACK.001)

**Requirement:** Applications MUST keep rollback executable.

**Rationale:** The implementation documents the previous artifact reference, rollback command, configuration compatibility, schema compatibility, and data recovery condition. Rollback tests run before production releases.

Destructive schema work requires an expand-and-contract sequence or an explicit recovery decision.

### Operate background work independently (OPS.WORKER.001)

**Requirement:** Applications MUST operate background work independently.

**Rationale:** When Worker exists, it publishes liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior independently of WebApi.

WebApi readiness does not hide a failed durable-delivery Worker. The extension defines the business impact and alert threshold.

### Bound external calls (OPS.DEPENDENCIES.001)

**Requirement:** Applications MUST bound external calls.

**Rationale:** Every network call has an explicit timeout and cancellation path. Retries apply only to safe operations and use bounded attempts. The external integrations extension defines provider-specific recovery and test requirements.

### Define actionable baseline alerts (OPS.ALERTS.001)

**Requirement:** Applications MUST define actionable baseline alerts.

**Rationale:** Before production releases, each baseline alert has an owner, threshold, evaluation window, severity, and runbook. Baseline alerts cover sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, failed deployed tests, and stale backups. Worker-enabled applications also cover delivery or schedule thresholds named by their extension.

Alerts focus on user or recovery impact, not every logged exception. Routing tests use a synthetic or controlled alert before release.

## Conventions


### Use one local start command (OPS.CONVENTION.001)

**Default:** Use one local start command.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The consumer `AGENTS.md` names the AppHost command that starts all baseline local dependencies. A developer should not need to start PostgreSQL and WebApi through unrelated manual steps.

AppHost names the PostgreSQL server `postgres` and its application database `database`. It names the API `api`, which references and waits for the database.

The implementation adds each frontend through `AddJavaScriptApp` from `Aspire.Hosting.JavaScript`. It selects pnpm with `WithPnpm`, references the API, and injects its service URL through a server-only environment value. The implementation does not hard-code an allocated local port.

The implementation runs the root frozen pnpm installation before AppHost so the workspace dependency graph is ready. Aspire runs the application's declared `dev` script. The root `package.json` remains the owner of toolchain versions and workspace scripts.

### Use stable service names (OPS.CONVENTION.002)

**Default:** Use stable service names.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Service, resource, meter, and trace-source names remain stable across environments so dashboards and alerts do not depend on a deployment-generated identifier.

### Keep runbooks near project documentation (OPS.CONVENTION.003)

**Default:** Keep runbooks near project documentation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses `docs/runbooks/` for backup restore, deployment rollback, failed schema application, leaked secret response, critical dependency outage, and selected-extension recovery procedures. Each runbook states trigger, impact, prerequisites, exact commands or platform actions, verification, recovery or stop condition, owner, last-tested date, and next review date.

The implementation keeps Operating Limits at `docs/operations/limits.md`. Each value is classified as enforced, tested, supported, or an alert threshold. The implementation does not treat a tested value as an enforced or supported commitment without a separate classification.

The implementation keeps a release record from the template. It links the artifact, schema plan, automated gates, restore exercise, and deployment result. It also links flow, rollback, and alert evidence, operating conditions, and skipped checks.

## Reference example

This informative example demonstrates `OPS.DEPLOY.001` and `OPS.ROLLBACK.001`.

A release applies a reviewed Marten schema plan and deploys the versioned API artifact. It waits for `/health/ready`, then runs the included end-to-end tests. One retained command restores the previous artifact when a test fails.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| OPS.LOCAL.001 | inspection | Pull request review asserts `use Aspire for local orchestration` in the owning specification and source paths. |
| OPS.OBSERVABILITY.001 | inspection | Pull request review asserts `emit correlated diagnostics` in the owning specification and source paths. |
| OPS.HEALTH.001 | inspection | Pull request review asserts `separate liveness and readiness` in the owning specification and source paths. |
| OPS.SCHEMA.001 | static | Repository static check asserts `apply schema changes outside request startup` for the owning paths. |
| OPS.DATA.001 | operation | The release record captures the observed `define backup and restore behavior` result and owning operation. |
| OPS.DEPLOY.001 | inspection | Pull request review asserts `use a repeatable deployment` in the owning specification and source paths. |
| OPS.ROLLBACK.001 | inspection | Pull request review asserts `keep rollback executable` in the owning specification and source paths. |
| OPS.WORKER.001 | inspection | Pull request review asserts `operate background work independently` in the owning specification and source paths. |
| OPS.DEPENDENCIES.001 | inspection | Pull request review asserts `bound external calls` in the owning specification and source paths. |
| OPS.ALERTS.001 | inspection | Pull request review asserts `define actionable baseline alerts` in the owning specification and source paths. |
| OPS.CONVENTION.001 | inspection | Pull request review asserts `use one local start command` in the owning specification and source paths. |
| OPS.CONVENTION.002 | inspection | Pull request review asserts `use stable service names` in the owning specification and source paths. |
| OPS.CONVENTION.003 | inspection | Pull request review asserts `keep runbooks near project documentation` in the owning specification and source paths. |
