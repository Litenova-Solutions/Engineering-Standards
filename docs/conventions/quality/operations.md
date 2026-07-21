# Operations

## Intent

Application v1 must be observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Agent Summary {#agent-summary}

- Use Aspire as the local entry point for API, PostgreSQL, configured frontends, and conditional workers.
- Emit structured logs, traces, and metrics with shared correlation.
- Expose separate liveness and readiness endpoints.
- Apply reviewed schema changes before traffic shifts.
- Document and test backup restore for required data.
- Use repeatable deployment, smoke test, and rollback commands.
- Operate Worker health and backlog separately from WebApi.

## Standards

### Use Aspire for local orchestration (OPS.LOCAL.001)

`{ProjectName}.AppHost` starts WebApi, PostgreSQL, configured frontend applications, and enabled Worker projects for local development. `{ProjectName}.ServiceDefaults` provides shared service discovery, health, resilience defaults, and OpenTelemetry registration.

Local orchestration does not define hosted deployment architecture.

ServiceDefaults contains registration and instrumentation plumbing only. It does not own application configuration, authentication, authorization, persistence mappings, provider ports, or business metrics. Each host calls it explicitly and retains control of endpoint mapping and host-specific checks.

### Emit correlated diagnostics (OPS.OBSERVABILITY.001)

Hosts emit structured logs, traces, and metrics through OpenTelemetry-compatible instrumentation. Logs include timestamp, level, message, service, environment, trace ID, and span ID where available.

Use stable event names or IDs for operationally relevant failures. Do not log complete request bodies or tokens.

Use W3C trace context on inbound HTTP, outbound `HttpClient`, and asynchronous message boundaries. Preserve the trace relationship when work moves to Worker, but do not propagate authentication tokens or sensitive baggage. Record exceptions on the owning span and return the trace ID in public Problem Details.

Metric names and attributes remain stable across releases. Attributes use bounded values such as service, environment, operation, outcome, and error code. Do not use actor IDs, aggregate IDs, email addresses, raw URLs, exception messages, idempotency keys, or other unbounded values as metric attributes.

### Separate liveness and readiness (OPS.HEALTH.001)

Expose:

- `/health/live` for process liveness without external dependency checks.
- `/health/ready` for readiness to receive traffic, including critical dependencies.

Readiness fails when the application cannot safely serve the primary release flow. Health responses do not reveal connection strings or internal exception details.

Tag process-only checks for liveness and critical dependencies for readiness. Map each path with an explicit health-check predicate so adding a new check cannot silently change liveness behavior. Test the PostgreSQL readiness failure and recovery path.

### Apply schema changes outside request startup (OPS.SCHEMA.001)

Hosted schema changes run as a dedicated release step before traffic shifts. Review compatibility with both the new and rollback application versions.

WebApi and Worker replicas do not race to apply production schema changes during startup.

### Define backup and restore behavior (OPS.DATA.001)

Document backup owner, schedule, retention, encryption, storage location, restore command, and recovery objectives. Test a restore against representative data before application v1 and after material schema changes.

A backup without a verified restore does not satisfy the release standard.

### Use a repeatable deployment (OPS.DEPLOY.001)

Deployment uses versioned artifacts, declared configuration, a schema step, readiness checks, and the primary release flow's end-to-end test. Do not deploy from an uncommitted working tree or a mutable branch reference.

The container deployment extension adds image-specific requirements.

### Keep rollback executable (OPS.ROLLBACK.001)

Document the previous artifact reference, rollback command, configuration compatibility, schema compatibility, and data recovery condition. Test the rollback path before application v1.

Destructive schema work requires an expand-and-contract sequence or an explicit recovery decision.

### Operate background work independently (OPS.WORKER.001)

When Worker exists, publish its liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior independently of WebApi.

WebApi readiness does not hide a failed durable-delivery Worker. The extension defines the business impact and alert threshold.

### Bound external calls (OPS.DEPENDENCIES.001)

Every network call has an explicit timeout and cancellation path. Retries apply only to safe operations and use bounded attempts. The external integrations extension defines provider-specific recovery and test requirements.

### Define actionable baseline alerts (OPS.ALERTS.001)

Before application v1, define an owner, threshold, evaluation window, severity, and runbook for sustained readiness failure, elevated unexpected HTTP errors, primary release flow latency, PostgreSQL unavailability, failed deployed end-to-end tests, and stale or failed backups. Worker-enabled applications also alert on the delivery or schedule thresholds named by their extension.

Alert on user or recovery impact, not every logged exception. Test routing with a synthetic or controlled alert before release.

## Conventions

### Use one local start command

The consumer `AGENTS.md` names the AppHost command that starts all baseline local dependencies. A developer should not need to start PostgreSQL and WebApi through unrelated manual steps.

AppHost names the PostgreSQL server `postgres`, its application database `database`, and the API `api`. The API references and waits for the database. Add each frontend through `AddJavaScriptApp` from `Aspire.Hosting.JavaScript`, select pnpm with `WithPnpm`, reference the API, and inject its service URL through a server-only environment value. Do not hard-code an allocated local port.

Run the root frozen pnpm installation before AppHost so the workspace dependency graph is ready. Aspire runs the application's declared `dev` script; the root `package.json` remains the owner of toolchain versions and workspace scripts.

### Use stable service names

Service, resource, meter, and trace-source names remain stable across environments so dashboards and alerts do not depend on a deployment-generated identifier.

### Keep runbooks near project documentation

Use `docs/runbooks/` for backup restore, deployment rollback, failed schema application, leaked secret response, critical dependency outage, and extension-specific recovery procedures that v1 needs. Each runbook states trigger, impact, prerequisites, exact commands or platform actions, verification, recovery or stop condition, owner, last-tested date, and next review date.

Keep Operating Limits at `docs/operations/limits.md`. Classify each value as enforced, tested, supported, or an alert threshold. Do not treat a tested value as an enforced or supported commitment without a separate classification.

Keep a release record from the template. It links the immutable artifact, schema plan, automated gates, restore exercise, deployment result, primary release flow end-to-end test, rollback exercise, alert test, known limitations, and every skipped check.

## Examples

A release applies a reviewed Marten schema plan, deploys the versioned API artifact, waits for `/health/ready`, runs the primary release flow's end-to-end test, and retains one command that restores the previous artifact if the test fails.

## Verification

- Start the application through AppHost from a clean checkout.
- Inspect logs and traces for correlation and sensitive-data redaction.
- Inspect metric attributes for unbounded or sensitive values and verify cross-process trace context.
- Test liveness and readiness under dependency failure.
- Run schema application and rollback compatibility checks.
- Restore the latest backup into an isolated environment and run the primary release flow's end-to-end test.
- Run deployment, smoke-test, and rollback procedures.
- Exercise baseline alert routing and confirm each alert links to an owned runbook.
