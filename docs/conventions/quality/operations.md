# Operations

## Intent

Application v1 must be observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Agent Summary {#agent-summary}

- Use Aspire as the local entry point for API, PostgreSQL, and conditional workers.
- Emit structured logs, traces, and metrics with shared correlation.
- Expose separate liveness and readiness endpoints.
- Apply reviewed schema changes before traffic shifts.
- Document and test backup restore for required data.
- Use repeatable deployment, smoke test, and rollback commands.
- Operate Worker health and backlog separately from WebApi.

## Standards

### Use Aspire for local orchestration (OPS.LOCAL.001)

`{ProjectName}.AppHost` starts WebApi, PostgreSQL, and enabled Worker projects for local development. `{ProjectName}.ServiceDefaults` provides shared service discovery, health, resilience defaults, and OpenTelemetry registration.

Local orchestration does not define hosted deployment architecture.

### Emit correlated diagnostics (OPS.OBSERVABILITY.001)

Hosts emit structured logs, traces, and metrics through OpenTelemetry-compatible instrumentation. Logs include timestamp, level, message, service, environment, trace ID, and span ID where available.

Use stable event names or IDs for operationally relevant failures. Do not log complete request bodies or tokens.

### Separate liveness and readiness (OPS.HEALTH.001)

Expose:

- `/health/live` for process liveness without external dependency checks.
- `/health/ready` for readiness to receive traffic, including critical dependencies.

Readiness fails when the application cannot safely serve the primary journey. Health responses do not reveal connection strings or internal exception details.

### Apply schema changes outside request startup (OPS.SCHEMA.001)

Hosted schema changes run as a dedicated release step before traffic shifts. Review compatibility with both the new and rollback application versions.

WebApi and Worker replicas do not race to apply production schema changes during startup.

### Define backup and restore behavior (OPS.DATA.001)

Document backup owner, schedule, retention, encryption, storage location, restore command, and recovery objectives. Test a restore against representative data before application v1 and after material schema changes.

A backup without a verified restore does not satisfy the release standard.

### Use a repeatable deployment (OPS.DEPLOY.001)

Deployment uses versioned artifacts, declared configuration, a schema step, readiness checks, and a primary-journey smoke test. Do not deploy from an uncommitted working tree or a mutable branch reference.

The container deployment extension adds image-specific requirements.

### Keep rollback executable (OPS.ROLLBACK.001)

Document the previous artifact reference, rollback command, configuration compatibility, schema compatibility, and data recovery condition. Test the rollback path before application v1.

Destructive schema work requires an expand-and-contract sequence or an explicit recovery decision.

### Operate background work independently (OPS.WORKER.001)

When Worker exists, publish its liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior independently of WebApi.

WebApi readiness does not hide a failed durable-delivery Worker. The extension defines the business impact and alert threshold.

### Bound external calls (OPS.DEPENDENCIES.001)

Every network call has an explicit timeout and cancellation path. Retries apply only to safe operations and use bounded attempts. The external integrations extension defines provider-specific recovery and test requirements.

## Conventions

### Use one local start command

The consumer `AGENTS.md` names the AppHost command that starts all baseline local dependencies. A developer should not need to start PostgreSQL and WebApi through unrelated manual steps.

### Use stable service names

Service, resource, meter, and trace-source names remain stable across environments so dashboards and alerts do not depend on a deployment-generated identifier.

### Keep runbooks near project documentation

Use `docs/runbooks/` for restore, rollback, leaked secret, failed schema, and extension-specific recovery procedures that v1 needs. Each runbook states trigger, prerequisites, steps, verification, and escalation owner.

## Examples

A release applies a reviewed Marten schema plan, deploys the versioned API artifact, waits for `/health/ready`, runs the create-and-read primary journey, and retains one command that restores the previous artifact if the smoke test fails.

## Verification

- Start the application through AppHost from a clean checkout.
- Inspect logs and traces for correlation and sensitive-data redaction.
- Test liveness and readiness under dependency failure.
- Run schema application and rollback compatibility checks.
- Restore the latest backup into an isolated environment and verify the primary journey.
- Run deployment, smoke-test, and rollback procedures.
