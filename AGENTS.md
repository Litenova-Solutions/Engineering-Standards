# Engineering Standards: Agent Context

Canonical contract for AI agents and engineers. Read before touching code.

## Read Order

1. This file in full.
2. `docs/architecture/clean-architecture.md`.
3. The convention file for the layer you are editing (index below).
4. `docs/conventions/shared/agentic-guardrails.md` for scaffolding and verification.
5. `docs/guides/definition-of-done.md` before marking any feature complete.
6. Topic-specific conventions (exceptions, observability, queries, security, etc.) when the task touches them.
7. Do not load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 (check `global.json` for pinned SDK version) |
| ASP.NET Core | 10, Minimal APIs only |
| EF Core | 10 |
| LiteBus | Modular packages; `ICommandMediator` / `IQueryMediator` only in endpoints |
| PostgreSQL | Primary database; `snake_case` via `.UseSnakeCaseNamingConventions()` |
| Next.js | 16.2.6 (security patch), App Router, `proxy.ts` not `middleware.ts` |
| React | 19.2.6, React Compiler stable |
| TypeScript | 6.0.x, `moduleResolution: bundler` |
| TanStack Query | 5.100.10; verify lockfile against GHSA-g7cv-rxg3-hmpx |
| Zustand | 5.0.13 (UI state only) |
| Zod | 4.4.3; `z.email()`, `z.uuid()`, `z.url()` |
| Tailwind CSS | 4.3.x, CSS-first `@theme`, no `tailwind.config.js` |
| shadcn/ui | CLI v4, `sonner`, Radix from `radix-ui` |
| Frontend tests | Vitest + RTL; Playwright E2E |

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
| `apps/web/` | Next.js; `features/{name}/` vertical slices |

## Non-Negotiable Rules

- MUST read the relevant convention before editing that layer.
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
- Frontend: await `params` / `searchParams` / `cookies` / `headers`; comment every `'use client'`; no business logic in `proxy.ts`; no `useMemo`/`useCallback`/`React.memo` with React Compiler; no server data in Zustand or `useEffect` fetch; no cross-feature imports; no `TODO`/`FIXME`/stubs; max 300 lines per file; no arbitrary Tailwind values.

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
| Naming | `docs/conventions/shared/naming.md` |
| Git | `docs/conventions/shared/git-workflow.md` |
| CI gates | `docs/conventions/shared/ci.md` |
| Security | `docs/conventions/shared/security.md` |
| Realtime | `docs/conventions/shared/realtime-updates.md` |
| Forbidden packages | `docs/conventions/shared/forbidden-packages.md` |
| Decisions (rationale) | `docs/decisions/README.md` (do not load for routine coding) |
| Writing style | `docs/conventions/shared/writing-style.md` |
| Agentic guardrails | `docs/conventions/shared/agentic-guardrails.md` |
| Containers | `docs/conventions/shared/containers.md` |
| IaC | `docs/conventions/shared/infrastructure-as-code.md` |
| Definition of Done | `docs/guides/definition-of-done.md` |
| Add feature guide | `docs/guides/add-new-feature.md` |
| App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Components | `docs/conventions/frontend/02-components.md` |
| Data fetching | `docs/conventions/frontend/03-data-fetching.md` |
| State and forms | `docs/conventions/frontend/04-state-and-forms.md` |
| i18n | `docs/conventions/frontend/05-internationalization.md` |
| Frontend testing | `docs/conventions/frontend/06-testing.md` |
| Feature boundaries | `docs/conventions/frontend/07-feature-boundaries.md` |

## Commands

Run the full pipeline in `docs/conventions/shared/ci.md`. Minimum:

```bash
dotnet build src/{ProjectName}.slnx --configuration Release
dotnet test src/{ProjectName}.slnx --configuration Release --no-build
pnpm install --frozen-lockfile
pnpm lint && pnpm type-check && pnpm test && pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
```

Skip frontend commands when the project has no `apps/web/`.
