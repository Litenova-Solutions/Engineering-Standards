# Worker and Background Host Projects

Long-running background processes (outbox dispatch, scheduled jobs, queue consumers) MUST live in dedicated worker host projects, not in `WebApi`.

---

## 1. Solution Layout

| Project | Responsibility |
|:---|:---|
| `{ProjectName}.Worker` | `Host` / `BackgroundService`, job loops, outbox dispatcher |
| `{ProjectName}.Infrastructure` | Shared EF Core, repositories, external clients (referenced by Worker) |
| `{ProjectName}.Application.Write` / `.Reactions` | Handlers invoked by worker via LiteBus or direct service calls |

`WebApi` MUST NOT host durable background loops except ASP.NET Core middleware and request-scoped work.

---

## 2. Dependencies

Worker projects MUST reference:

- `Infrastructure`
- `Application.Write` and/or `Application.Reactions` as needed
- MUST NOT reference `WebApi`

Worker projects MAY reference `Application.Read.Contracts` for read-only polling queries via `IDatabaseContext` implemented in Infrastructure.

---

## 3. Observability

Workers MUST use the same OpenTelemetry and Serilog conventions as `WebApi` (`docs/conventions/backend/09-observability.md`). Every job execution MUST emit:

- A trace span with job name
- Structured logs with correlation ID
- Metrics for success, failure, and duration

---

## 4. Hosting

- Development: `dotnet run --project apps/api/src/{ProjectName}.Worker`
- Production: container image per `docs/conventions/shared/containers.md`
- Scale workers independently of API replicas

---

## 5. Idempotency and Outbox

Jobs that react to domain events or external webhooks MUST be idempotent. Durable delivery MUST use the outbox pattern from `docs/conventions/backend/10-reliability.md` when events cannot be lost.
