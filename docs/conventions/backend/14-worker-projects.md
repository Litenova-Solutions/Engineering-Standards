# Worker and Background Host Projects

Long-running background processes (outbox dispatch, scheduled jobs, queue consumers) MUST live in dedicated worker host projects, not in `WebApi`.

Job loop **implementations** live in `Infrastructure/BackgroundJobs/`. The **Worker host** registers and runs them. See `docs/conventions/backend/11-background-jobs.md` for implementation patterns.

---

## 1. Solution Layout

| Project | Responsibility |
|:---|:---|
| `{ProjectName}.Worker` | `Host` / `BackgroundService` registration, job loops, outbox dispatcher |
| `{ProjectName}.Infrastructure` | Shared EF Core, repositories, job implementation classes (referenced by Worker) |
| `{ProjectName}.Application.Write` / `.Reactions` | Handlers invoked by worker via LiteBus or direct service calls |
| `{ProjectName}.WebApi` | HTTP endpoints only; MUST NOT register durable `BackgroundService` loops |

`WebApi` MUST NOT host durable background loops. ASP.NET Core middleware and request-scoped work are the only background processing allowed in WebApi unless a project ADR documents a narrow exception.

---

## 2. Dependencies

Worker projects MUST reference:

- `Infrastructure`
- `Application.Write` and/or `Application.Reactions` as needed
- MUST NOT reference `WebApi`

Worker projects MAY reference `Application.Read.Contracts` for read-only polling queries via `IDatabaseContext` implemented in Infrastructure.

---

## 3. Registration Split

| Registration | Where |
|:---|:---|
| `AddScoped<IOutboxDispatcher, OutboxDispatcher>()` and other job services | Infrastructure extension method |
| `AddHostedService<OutboxDispatcherHostedService>()` | Worker `Program.cs` only |

Architecture tests SHOULD fail when `WebApi` references or registers `BackgroundService` implementations except allow-listed framework services.

---

## 4. Observability

Workers MUST use the same OpenTelemetry and Serilog conventions as `WebApi` (`docs/conventions/backend/09-observability.md`). Every job execution MUST emit:

- A trace span with job name
- Structured logs with correlation ID
- Metrics for success, failure, and duration

---

## 5. Hosting

- Development: `dotnet run --project apps/api/src/{ProjectName}.Worker` (or via AppHost when the worker is modeled there)
- Production: container image per `docs/conventions/shared/containers.md`
- Scale workers independently of API replicas

---

## 6. Idempotency and Outbox

Jobs that react to domain events or external webhooks MUST be idempotent. Durable delivery MUST use the outbox pattern from `docs/conventions/backend/10-reliability.md` when events cannot be lost.
