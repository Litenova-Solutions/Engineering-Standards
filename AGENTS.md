# Engineering Standards: Agent Context

This is the canonical contract for AI agents and engineers working on projects that follow these standards. Read it before touching code.

## Read Order

1. Read this file in full.
2. Read `docs/architecture/clean-architecture.md`.
3. Read the convention file for the layer you are editing.
4. If the task involves exceptions, read `docs/conventions/backend/06-exception-hierarchy.md`.
5. If it involves logging, metrics, tracing, health checks, or alerts, read `docs/conventions/backend/09-observability.md`.
6. If it involves query handlers, read `docs/conventions/backend/07-query-read-strategy.md`.
7. If it involves retries, idempotency, outbox, background jobs, caching, realtime, migrations, or security, read the matching convention file from the index below.
8. Do not load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding tasks. They are human-facing rationale docs.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 |
| ASP.NET Core | 10, Minimal APIs only |
| EF Core | 10 |
| LiteBus | Modular packages, specific mediators only |
| Ardalis.GuardClauses | Project-owned custom domain guard extensions only |
| OpenTelemetry | Traces and metrics via OTLP |
| PostgreSQL | Primary database |
| Next.js | 16.2.6, App Router only, `proxy.ts` not `middleware.ts` |
| React | 19.2.6, React Compiler stable |
| TypeScript | 6.0.x, `moduleResolution: bundler` |
| TanStack Query | 5.100.10, verify lockfile against GHSA-g7cv-rxg3-hmpx |
| Zustand | 5.0.13 |
| Zod | 4.4.3, use `z.email()`, `z.uuid()`, `z.url()` |
| Tailwind CSS | 4.3.x, CSS-first `@theme`, no `tailwind.config.js` |
| shadcn/ui | CLI v4, use `sonner`, import Radix from `radix-ui` |

## Project Map

| Project | Responsibility |
|:---|:---|
| `Domain` | Aggregates, value objects, events, exceptions, repositories, strongly typed IDs |
| `Application.Write.Contracts` | Commands, command results, write-side contracts |
| `Application.Write` | Command handlers and validators |
| `Application.Read.Contracts` | Queries, results, `IDatabaseContext`, pagination, query validation |
| `Application.Read` | Query handlers and validators using `IDatabaseContext` projections |
| `Application.Reactions` | Event handlers and narrow side-effect interfaces |
| `Infrastructure` | EF Core, repositories, transactions, outbox, jobs, external clients |
| `WebApi` | `IEndpoint` classes, request/response models, mappings, OpenAPI |
| `apps/web/` | Next.js App Router frontend |

## Non-Negotiable Rules

- MUST read the relevant convention before editing that layer.
- MUST use `IEndpoint` for HTTP endpoints. Never use MVC controllers or `ControllerBase`.
- MUST inject `IDatabaseContext` in query handlers. Never inject repositories or `AppDbContext` there.
- MUST NOT add per-aggregate `IXxxReadStore` interfaces. Use `IDatabaseContext` with LINQ projections.
- MUST throw the correct exception subclass. Never throw generic domain or application exceptions.
- MUST throw `CommandValidationException` from command validators and `QueryValidationException` from query validators.
- MUST NOT use `Guard.Against` in validators. Direct guard calls throw argument exceptions.
- MUST NOT call `SaveChangesAsync` in command handlers or repositories. The command pipeline persists.
- MUST NOT put handlers or validators in Contracts projects.
- MUST NOT reference external side-effect libraries from `Application.Reactions`. Define narrow interfaces and implement them in Infrastructure.
- MUST NOT reference `Application.Write` or `Application.Read` from endpoint code. `Program.cs` may reference implementation projects only for DI registration.
- MUST use `ICommandMediator.SendAsync` for commands and `IQueryMediator.QueryAsync` for queries in endpoints. Never inject a unified message bus.
- MUST name every async `CancellationToken` parameter exactly `cancellationToken`.
- MUST NOT add a NuGet package without a corresponding ADR or pre-approved package row.
- MUST NOT use em dashes, en dashes, cliches, or AI slop wording in generated docs or comments.
- MUST run `dotnet build` and `dotnet test` before marking code tasks complete.
- MUST await `cookies()`, `headers()`, `params`, and `searchParams` in Next.js 15 and later.
- MUST NOT use server-only modules in `'use client'` files.
- MUST add a comment to every `'use client'` directive explaining why the client boundary is needed.
- MUST NOT put business logic in `proxy.ts`. Optimistic checks only.
- MUST NOT add `useMemo`, `useCallback`, or `React.memo` when React Compiler is enabled.
- MUST NOT put server data in Zustand or fetch data in `useEffect`.

## Common Mistakes To Avoid

- Using `IMessageBus` instead of the specific LiteBus mediator.
- Putting mappings inside endpoint handler methods instead of `ApiMappings`.
- Checking business rules in handlers instead of aggregates.
- Updating read model tables from Reactions without a project ADR.
- Adding external packages to `Application.Reactions`.
- Using Zod v3 string format syntax.
- Using `revalidateTag` without the required cache life argument.
- Importing individual `@radix-ui/react-*` packages.
- Using shadcn/ui `toast` instead of `sonner`.

## Convention File Index

| Layer / Topic | Convention File |
|:---|:---|
| Architecture | `docs/architecture/clean-architecture.md` |
| Principles | `docs/conventions/00-principles.md` |
| Solution Structure | `docs/conventions/backend/01-solution-structure.md` |
| Domain | `docs/conventions/backend/02-domain-layer.md` |
| Application | `docs/conventions/backend/03-application-layer.md` |
| Infrastructure | `docs/conventions/backend/04-infrastructure-layer.md` |
| WebApi | `docs/conventions/backend/05-api-layer.md` |
| Exceptions | `docs/conventions/backend/06-exception-hierarchy.md` |
| Query/Read Strategy | `docs/conventions/backend/07-query-read-strategy.md` |
| Testing | `docs/conventions/backend/08-testing.md` |
| Observability | `docs/conventions/backend/09-observability.md` |
| Reliability | `docs/conventions/backend/10-reliability.md` |
| Background Jobs | `docs/conventions/backend/11-background-jobs.md` |
| Caching | `docs/conventions/backend/12-caching.md` |
| Deployment and Migrations | `docs/conventions/backend/13-deployment-and-migrations.md` |
| Naming | `docs/conventions/shared/naming.md` |
| Git Workflow | `docs/conventions/shared/git-workflow.md` |
| CI and Local Gates | `docs/conventions/shared/ci.md` |
| Security | `docs/conventions/shared/security.md` |
| Real-Time Updates | `docs/conventions/shared/realtime-updates.md` |
| Frontend/App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Frontend/Components | `docs/conventions/frontend/02-components.md` |
| Frontend/Data Fetching | `docs/conventions/frontend/03-data-fetching.md` |
| Frontend/State and Forms | `docs/conventions/frontend/04-state-and-forms.md` |
| Frontend/Internationalization | `docs/conventions/frontend/05-internationalization.md` |

## Commands

```bash
dotnet build src/{ProjectName}.slnx
dotnet test src/{ProjectName}.slnx
dotnet run --project src/{ProjectName}.WebApi
dotnet ef migrations add {MigrationName} --project src/{ProjectName}.Infrastructure --startup-project src/{ProjectName}.WebApi
dotnet ef database update --project src/{ProjectName}.Infrastructure --startup-project src/{ProjectName}.WebApi
```
