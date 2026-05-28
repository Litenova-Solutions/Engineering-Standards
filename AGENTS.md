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

When implementing a use case in a project that consumes these standards (for example [LitePress](https://github.com/Litenova-Solutions/LitePress)):

1. Project `docs/domain/README.md` and `docs/domain/{feature}/README.md`.
2. Use case doc at `docs/domain/{feature}/{use-case}.md` (`docs/guides/agentic-domain-driven-design.md`).
3. `docs/guides/add-new-use-case.md` and layer conventions for each step.
4. Update domain docs in the same PR as the code.

## Tech Stack

Package and framework versions are defined only in `standards.manifest.json`. Read `stack`, `pinnedNuGetPackages`, and `pinnedNpmPackages` before changing dependencies. Do not copy version numbers from prose in other files.

| Area | Source in manifest |
|:---|:---|
| .NET SDK | `stack.dotnet` → `global.json` |
| ASP.NET Core / EF Core | `stack.aspnetcore`, `stack.efcore`, `pinnedNuGetPackages` |
| Frontend | `stack.nextjs`, `stack.react`, `pinnedNpmPackages` |
| Tooling | `pinnedNuGetPackages`, `pinnedNpmPackages` |

Architectural constraints (not version pins): Minimal APIs only, PostgreSQL with `snake_case`, CQRS split Application projects, Scalar for dev API docs UI.

## Conflict Resolution

When two normative files conflict:

1. Stop. Do not invent a compromise.
2. Quote both conflicting rules with file paths.
3. Prefer the more specific project document only when it explicitly declares an override.
4. If no explicit override exists, ask for a human decision.

## Pre-Edit Checkpoint

Before editing code in a consumer repository:

1. Confirm task scope and planned files.
2. Load required conventions (see `agentLoadPlans` in `standards.manifest.json`).
3. Identify the layer and any project-specific overrides in `docs/domain/`.
4. Inspect existing local patterns; prefer minimal diffs.
5. Stop without approval if the change requires a new package, migration, auth model change, or public API break.

When existing code violates standards, report the deviation unless the task is explicitly a standards migration.

## Preserve Existing Patterns

- Read conventions before editing, but match established patterns in the target file when they differ from newer examples.
- Do not rewrite unrelated files to match standards unless the task is a standards migration.
- Do not mass-fix legacy violations unless asked.

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
| `apps/{name}/` | One or more frontends; each with `features/{feature}/{use-case}/` aligned to backend use cases |

Projects MAY define additional apps under `apps/` (multiple frontends, workers, or secondary APIs). See `docs/conventions/shared/monorepo-structure.md`.

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
- When project docs (`docs/domain/`, app READMEs, project ADRs) overlap these standards, project docs take precedence per `docs/conventions/00-principles.md#11-documentation-precedence`.
- MUST NOT accept actor IDs from request bodies when the actor is the authenticated user. Actor identity comes from validated JWT claims only.
- MUST NOT use `configuration["Key"]!` directly; all config access goes through validated options classes and `IOptions<T>`.
- MUST use `FromSqlInterpolated` for raw SQL; MUST NOT concatenate SQL strings.
- Frontend: await `params` / `searchParams` / `cookies` / `headers`; comment every `'use client'`; see `docs/conventions/frontend/` for data fetching, state, Tailwind, and file-size guidance; no cross-feature imports; env vars only via `lib/env.ts`.

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
| Object authorization | `docs/conventions/backend/20-object-authorization.md` |
| API compatibility | `docs/conventions/shared/api-compatibility.md` |
| Security controls | `docs/conventions/shared/security-controls.md` |
| CI / CD | `docs/conventions/shared/ci.md`, `ci-cd.md` |
| Local IDE setup | `docs/conventions/shared/local-ide-setup.md` |
| Security | `docs/conventions/shared/security.md` |
| Monorepo | `docs/conventions/shared/monorepo-structure.md` |
| Agentic guardrails | `docs/conventions/shared/agentic-guardrails.md` |
| Frontend App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Frontend testing | `docs/conventions/frontend/06-testing.md` |
| Admin API auth | `docs/conventions/frontend/10-admin-api-auth.md` |
| Frontend feature boundaries | `docs/conventions/frontend/07-feature-boundaries.md` |
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
pnpm exec playwright test --config apps/{frontend}/playwright.config.ts
```

Skip frontend commands when the project has no frontend apps under `apps/`. Run gates for every frontend app you changed.
