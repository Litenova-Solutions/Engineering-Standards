---
{
  "id": "profile.dotnet-nextjs.operations",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["backend.infrastructure", "delivery", "security.review"],
  "recipes": []
}
---
# Operations

## Agent Quick Rules {#agent-quick-rules}

- Use Aspire for local orchestration and service discovery.
- Emit structured logs, traces, metrics, and health checks.
- Automate schema application as a deployment step.
- Document backup, restore, deployment, smoke test, and rollback.
- Use a deployment recipe for provider or container mechanics.

## OPS.LOCAL.001 - Use Aspire for local development

AppHost starts PostgreSQL, WebApi, optional Worker, and frontend applications. ServiceDefaults configures service discovery, resilience defaults, OpenTelemetry, and health endpoints.

Developers may run one project directly for focused work, but the documented full-system path uses AppHost.

## OPS.OBSERVABILITY.001 - Emit correlated diagnostics

Use `ILogger` structured properties and OpenTelemetry traces, metrics, and logs. Propagate the current trace ID to Problem Details and outbound HTTP calls.

Do not add Serilog to the default profile. Enable an integration only when a required sink or formatting behavior needs it.

## OPS.HEALTH.001 - Separate liveness and readiness

Liveness confirms the process can respond. Readiness checks required dependencies such as PostgreSQL. A failing optional external service does not make the API unready unless the primary journey depends on it.

## OPS.SCHEMA.001 - Apply schema changes outside request startup

Build and review Marten schema changes before deployment. Apply them through a deployment job or explicit release command. Do not let every WebApi replica race to modify production schema at startup.

## OPS.DATA.001 - Define backup and restore behavior

The deployment must configure PostgreSQL backups, retention, and encryption. The project runbook names the restore command and the latest environment where restore was verified.

## OPS.DEPLOY.001 - Require a repeatable deployment

The selected deployment recipe must produce immutable application artifacts, inject configuration and secrets, apply schema changes, wait for readiness, and run a primary-journey smoke test.

The profile defines these outcomes without selecting a cloud provider.

## OPS.ROLLBACK.001 - Keep rollback executable

Document how to return to the previous application artifact and how database compatibility affects rollback. Use expand-and-contract schema changes when an immediate database rollback would lose data.

## OPS.WORKER.001 - Operate background work independently

When Worker exists, expose its health and backlog metrics separately. Durable dispatch must be idempotent because a worker may process the same message more than once.
