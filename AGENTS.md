# Engineering Standards: Agent Context

This is the canonical contract for AI agents and engineers working on projects that follow these standards. Read it before touching code.

## Read Order

1. Read this file in full.
2. Read `docs/architecture/clean-architecture.md`.
3. Read the convention file for the layer you are editing.
4. Read `docs/conventions/shared/agentic-guardrails.md` to understand strict dependency lockdowns and scaffolding constraints.
5. If the task involves exceptions, read `docs/conventions/backend/06-exception-hierarchy.md`.
6. If it involves logging, metrics, tracing, health checks, or alerts, read `docs/conventions/backend/09-observability.md`.
7. If it involves query handlers, read `docs/conventions/backend/07-query-read-strategy.md`.
8. If it involves retries, idempotency, outbox, background jobs, caching, realtime, migrations, or security, read the matching convention file from the index below.
9. Do not load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding tasks. They are human-facing rationale docs.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 (check `global.json` for pinned SDK version) |
| ASP.NET Core | 10, Minimal APIs only |
| EF Core | 10 |
| LiteBus | Modular packages, specific mediators only. Check LiteBus docs for the current version. |
| Ardalis.GuardClauses | Project-owned custom domain guard extensions only |
| OpenTelemetry | Traces and metrics via OTLP |
| PostgreSQL | Primary database |
| .NET Aspire | Local development orchestration (replaces Docker Compose). AppHost project per solution. |
| Next.js | App Router only, `proxy.ts` not `middleware.ts`. Check `package.json` for pinned version. |
| React | React Compiler stable. Check `package.json` for pinned version. |
| TypeScript | `moduleResolution: bundler`. Check `package.json` for pinned version. |
| TanStack Query | Verify lockfile against current GHSA advisories. |
| Zustand | Check `package.json` for pinned version. |
| Zod | Use `z.email()`, `z.uuid()`, `z.url()`. Check `package.json` for pinned version. |
| Tailwind CSS | CSS-first `@theme`, no `tailwind.config.js`. Check `package.json` for pinned version. |
| shadcn/ui | CLI v4 or later, use `sonner`, import Radix from `radix-ui`. |

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
- MUST NOT use forbidden packages under any circumstances (e.g. AutoMapper, MediatR, FluentValidation, Newtonsoft.Json, Axios, Lodash, Moment.js).
- MUST map all PostgreSQL tables, columns, keys, and index names using `snake_case`. Use the `EFCore.NamingConventions` package when it is compatible with the EF Core version in use. When the package is unavailable, apply snake_case manually in `OnModelCreating` (see `docs/conventions/backend/04-infrastructure-layer.md`).
- MUST use `.AsNoTracking()` or select-projections for all query handler queries in `Application.Read`.
- MUST NOT use em dashes, en dashes, cliches, or AI slop wording in generated docs or comments.
- MUST run the mandatory verification pipeline commands (e.g., `dotnet build`, `dotnet test`) before completing code tasks.
- MUST await `cookies()`, `headers()`, `params`, and `searchParams` in Next.js 15 and later.
- MUST NOT use server-only modules in `'use client'` files.
- MUST add a comment to every `'use client'` directive explaining why the client boundary is needed.
- MUST NOT put business logic in `proxy.ts`. Optimistic checks only.
- MUST NOT add `useMemo`, `useCallback`, or `React.memo` when React Compiler is enabled.
- MUST NOT put server data in Zustand or fetch data in `useEffect`.
- MUST place all React feature components in `features/{feature}/{usecase}/`. Never put feature components in `app/`, root-level `components/`, or any non-feature directory. `page.tsx` files are thin shells only.
- MUST NOT import React components from a shared workspace package (`@litenova/ui`, `@workspace/ui`, or similar). Each app owns its `components/ui/` via the shadcn/ui CLI.
- MUST NOT define inline TypeScript interfaces or type aliases for API response shapes. All API types come from the generated `openapi-typescript` output. Generate before writing any fetch call.
- MUST NOT use `NEXT_PUBLIC_` prefix for `API_URL` or `API_JWT_SECRET`. Both are server-only values.

## Common Mistakes To Avoid

- Using `IMessageBus` instead of the specific LiteBus mediator.
- Importing forbidden libraries (AutoMapper, MediatR, FluentValidation, Axios, Lodash, Moment.js) instead of standard/lite alternatives.
- Allowing PascalCase mappings in PostgreSQL, leading to double-quote sql queries.
- Failing to use `.AsNoTracking()` in read-side query projections.
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
| Agentic Guardrails | `docs/conventions/shared/agentic-guardrails.md` |
| Frontend/App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Frontend/Components | `docs/conventions/frontend/02-components.md` |
| Frontend/Data Fetching | `docs/conventions/frontend/03-data-fetching.md` |
| Frontend/State and Forms | `docs/conventions/frontend/04-state-and-forms.md` |
| Frontend/Internationalization | `docs/conventions/frontend/05-internationalization.md` |
| Frontend/Admin API Auth | `docs/conventions/frontend/06-admin-api-auth.md` |

## Commands

```bash
# Build and test
dotnet build src/{ProjectName}.slnx
dotnet test src/{ProjectName}.slnx

# Run via Aspire AppHost (starts all services, including PostgreSQL)
dotnet run --project src/{ProjectName}.AppHost

# Run API directly (requires infrastructure running separately)
dotnet run --project src/{ProjectName}.WebApi

# EF Core migrations
dotnet ef migrations add {MigrationName} --project src/{ProjectName}.Infrastructure --startup-project src/{ProjectName}.WebApi
dotnet ef database update --project src/{ProjectName}.Infrastructure --startup-project src/{ProjectName}.WebApi
```

> **dotnet ef tool version.** The `dotnet-ef` global tool version must match the EF Core runtime version. Install with:
> `dotnet tool install --global dotnet-ef --version <same as Microsoft.EntityFrameworkCore package version>`
> A mismatch causes cryptic errors at migration generation time.

> **LiteBus assembly markers.** Handler classes are `internal sealed`. Each implementation project exposes a public `{Layer}AssemblyMarker` static class so `Program.cs` can reference the assembly without importing internal types. See `docs/conventions/backend/04-infrastructure-layer.md`.

> **LiteBus domain events.** Domain events are plain C# records. They do not implement any LiteBus interface. `IDomainEvent` is a project-defined marker with no framework dependency. Publish via `IEventPublisher.PublishAsync(domainEvent, cancellationToken: cancellationToken)`. LiteBus silently ignores events with no handlers by default.
