# Engineering Standards: Agent Context

Canonical contract for AI agents and engineers. Read before touching code.

## Read Order

1. This file in full.
2. `docs/architecture/clean-architecture.md`.
3. The convention file for the layer you are editing (index below).
4. `docs/conventions/shared/agentic-guardrails.md` for scaffolding and verification.
5. `docs/guides/definition-of-done.md` before marking any feature complete.
6. Topic-specific conventions when the task touches them (see index).
7. Do not load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding.
8. Cursor rules in `.cursor/rules/` when using Cursor.

### Use case implementation (consumer project)

When implementing a use case in a project that consumes these standards:

1. Project `docs/domain/README.md` and `docs/domain/{feature}/README.md`.
2. Use case doc at `docs/domain/{feature}/{use-case}.md` (`docs/guides/agentic-domain-driven-design.md`).
3. `docs/guides/add-new-use-case.md` and layer conventions for each step.
4. Update domain docs in the same PR as the code.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 (check `apps/api/global.json`) |
| ASP.NET Core | 10, Minimal APIs only |
| EF Core | 10 |
| LiteBus | 4.3.x modular packages; `ICommandMediator` / `IQueryMediator` only in endpoints |
| PostgreSQL | Primary database; `snake_case` via `.UseSnakeCaseNamingConventions()` |
| Next.js | 16.2.6 (latest 16.x security patch) |
| React | 19.2.6 (match react-server-dom patch with Next.js advisory) |
| TypeScript | 6.0.x, `moduleResolution: bundler` |
| TanStack Query | 5.100.10; `@tanstack/query*` confirmed clean in GHSA-g7cv-rxg3-hmpx |
| Zustand | 5.0.13 (UI state only) |
| Zod | 4.4.3; import from `"zod"`; `z.email()`, `z.uuid()`, `z.url()` |
| Tailwind CSS | 4.3.x, CSS-first `@theme`, no `tailwind.config.js` |
| shadcn/ui | CLI v4, `sonner`, Radix from `radix-ui` |

## Project Map

| Project | Responsibility |
|:---|:---|
| `Domain` | Aggregates, value objects, events, exceptions, repositories, strongly typed IDs |
| `Application.Write.Contracts` | Commands, command results |
| `Application.Write` | Command handlers and validators |
| `Application.Read.Contracts` | Queries, results, `IDatabaseContext`, pagination |
| `Application.Read` | Query handlers; `IDatabaseContext` projections only |
| `Application.Reactions` | Event handlers; narrow side-effect interfaces only |
| `Infrastructure` | EF Core, repos, pipeline, outbox, jobs, external clients |
| `WebApi` | `IEndpoint`, request/response models, OpenAPI |
| `Worker` | Outbox dispatch, scheduled jobs (`14-worker-projects.md`) |
| `apps/api/` | .NET solution root (`src/`, `tests/`, `global.json`) |
| `apps/web/` | Next.js; `domain/{feature}/{use-case}/` aligned with backend |

## Non-Negotiable Rules

- MUST read the relevant convention before editing that layer.
- MUST check `standards.manifest.json` for pinned dependency versions before changing package references.
- MUST NOT upgrade framework versions unless the task is explicitly a standards upgrade.
- MUST use blueprints in `docs/blueprints/` for complete file generation (see `docs/blueprints/README.md`).
- MUST use `IEndpoint`; MUST NOT use MVC `Controller` / `ControllerBase`.
- MUST inject `IDatabaseContext` in query handlers; MUST NOT inject repositories or `AppDbContext`.
- MUST NOT add per-aggregate `IXxxReadStore` interfaces.
- MUST use correct exception subclasses; validators throw `CommandValidationException` / `QueryValidationException`.
- MUST NOT call `SaveChangesAsync` in handlers or repositories.
- MUST NOT put handlers or validators in Contracts projects.
- MUST NOT reference external libraries from `Application.Reactions`.
- WebApi endpoints MUST reference Contracts only; `Program.cs` registers implementations.
- MUST use `ICommandMediator` / `IQueryMediator`; MUST NOT inject unified message bus or `IMessageMediator`.
- MUST name async `CancellationToken` parameters `cancellationToken`.
- MUST NOT add packages outside pre-approved lists or without an ADR (`forbidden-packages.md`, `01-solution-structure.md`).
- MUST use `.AsNoTracking()` or projections in `Application.Read`.
- MUST follow `writing-style.md` (no forbidden words, no em/en dashes).
- MUST run gates in `docs/conventions/shared/ci.md` and complete `definition-of-done.md`.
- MUST NOT accept actor IDs from request bodies when the actor is the authenticated user. Actor identity comes from validated JWT claims only.
- MUST NOT use `configuration["Key"]!` directly; all config access goes through validated options classes and `IOptions<T>`.
- MUST use `FromSqlInterpolated` for raw SQL; MUST NOT concatenate SQL strings.
- Frontend: await `params` / `searchParams` / `cookies` / `headers`; comment every `'use client'`; no business logic in `proxy.ts`; no `useMemo`/`useCallback`/`React.memo` with React Compiler; no server data in Zustand or `useEffect` fetch; no cross-domain imports; no `TODO`/`FIXME`/stubs; max 300 lines per file; no arbitrary Tailwind values; env vars only via `lib/env.ts`.

## Convention File Index

| Topic | File |
|:---|:---|
| Architecture | `docs/architecture/clean-architecture.md` |
| Principles | `docs/conventions/00-principles.md` |
| Solution / packages | `docs/conventions/backend/01-solution-structure.md` |
| Domain | `docs/conventions/backend/02-domain-layer.md` |
| Application | `docs/conventions/backend/03-application-layer.md` |
| Infrastructure | `docs/conventions/backend/04-infrastructure-layer.md` |
| WebApi | `docs/conventions/backend/05-api-layer.md` |
| Exceptions | `docs/conventions/backend/06-exception-hierarchy.md` |
| Query/Read | `docs/conventions/backend/07-query-read-strategy.md` |
| Backend testing | `docs/conventions/backend/08-testing.md` |
| Observability | `docs/conventions/backend/09-observability.md` |
| Reliability | `docs/conventions/backend/10-reliability.md` |
| Background jobs | `docs/conventions/backend/11-background-jobs.md` |
| Caching | `docs/conventions/backend/12-caching.md` |
| Deployment | `docs/conventions/backend/13-deployment-and-migrations.md` |
| Worker projects | `docs/conventions/backend/14-worker-projects.md` |
| Authentication | `docs/conventions/backend/15-authentication-and-authorization.md` |
| Options / config | `docs/conventions/backend/16-options-and-configuration.md` |
| Concurrency | `docs/conventions/backend/17-concurrency.md` |
| Soft delete | `docs/conventions/backend/18-soft-delete.md` |
| Raw SQL | `docs/conventions/backend/19-raw-sql-and-reporting.md` |
| CI / CD | `docs/conventions/shared/ci.md`, `ci-cd.md` |
| Security | `docs/conventions/shared/security.md` |
| Monorepo | `docs/conventions/shared/monorepo-structure.md` |
| Agentic guardrails | `docs/conventions/shared/agentic-guardrails.md` |
| Frontend App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Frontend testing | `docs/conventions/frontend/06-testing.md` |
| Admin API auth | `docs/conventions/frontend/10-admin-api-auth.md` |
| Frontend domain boundaries | `docs/conventions/frontend/07-domain-boundaries.md` |
| Other frontend topics | `docs/conventions/frontend/` (02 through 09) |
| Agentic DDD | `docs/guides/agentic-domain-driven-design.md` |
| Guides | `docs/guides/` |
| Blueprints | `docs/blueprints/README.md` |
| Runbooks | `docs/runbooks/README.md` |

## Commands

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm install --frozen-lockfile
pnpm lint && pnpm type-check && pnpm test && pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
```

Skip frontend commands when the project has no `apps/web/`.
