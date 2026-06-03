# Engineering Standards: Agent Context

Canonical contract for AI agents and engineers. Read before touching code.

## Read Order

1. This file in full.
2. `docs/architecture/clean-architecture.md`.
3. Convention files for your layer (`conventionIndex` and `agentLoadPlans` in `standards.manifest.json`).
4. `docs/conventions/shared/agentic-guardrails.md` for scaffolding and verification.
5. `docs/guides/definition-of-done.md` before marking any feature complete.
6. Do not load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding.
7. Cursor rules in `.cursor/rules/` when using Cursor.

### Use case implementation (consumer project)

1. Project `docs/domain/README.md` and `docs/domain/{feature}/README.md`.
2. `docs/domain/{feature}/{use-case}.md` and `{use-case}.tests.md`.
3. `docs/guides/write-use-case-doc.md` (authoring); `docs/guides/add-new-use-case.md` (implementation).
4. Update operation docs, test specs, and UI docs in the same PR as the code.

## Tech Stack

Versions: `standards.manifest.json` only (`stack`, `pinnedNuGetPackages`, `pinnedNpmPackages`). Do not copy versions from prose.

Architectural constraints: Minimal APIs only, PostgreSQL `snake_case`, CQRS split Application projects, Scalar for dev API docs.

## Conflict Resolution

1. Stop. Do not invent a compromise.
2. Quote both conflicting rules with file paths.
3. Prefer project docs only when they explicitly override.
4. If no override exists, ask for a human decision.

## Pre-Edit Checkpoint

1. Confirm scope and planned files.
2. Load `agentLoadPlans` from `standards.manifest.json`.
3. Read project `docs/domain/` overrides.
4. Match local patterns; prefer minimal diffs.
5. Stop without approval for new packages, migrations, auth model changes, or public API breaks.

Report legacy violations unless the task is a standards migration.

## Project Map

| Project | Responsibility |
|:---|:---|
| `Domain` | Aggregates, value objects, events, exceptions, repositories, strongly typed IDs |
| `Application.Write.Contracts` | Commands, command results, `ValidationError` |
| `Application.Write` | Command handlers and validators |
| `Application.Read.Contracts` | Queries, results, `IDatabaseContext`, `ValidationError` |
| `Application.Read` | Query handlers; projections only |
| `Application.Reactions` | Event handlers; narrow side-effect interfaces only |
| `Infrastructure` | EF Core, repos, pipeline, outbox, jobs, external clients |
| `WebApi` | `IEndpoint`, request/response models, OpenAPI |
| `Worker` | Outbox dispatch, scheduled jobs (`worker-projects.md`) |
| `apps/api/` | .NET solution root |
| `apps/{name}/` | Frontends; `features/{feature}/{use-case}/` aligned to backend |

See `docs/conventions/shared/monorepo-structure.md` for multiple apps.

## Non-Negotiable Rules

### Domain and application

- MUST read the relevant convention before editing that layer. (Prevents layer violations.)
- MUST use correct exception subclasses; validators throw `CommandValidationException` / `QueryValidationException`. (Correct HTTP status mapping.)
- MUST NOT call `SaveChangesAsync` in handlers or repositories. (Single commit boundary in pipeline.)
- MUST NOT put handlers or validators in Contracts projects. (Contracts stay reference-safe from WebApi.)
- MUST NOT reference external libraries from `Application.Reactions`. (Reactions stay testable and narrow.)
- MUST use `ICommandMediator` / `IQueryMediator`; MUST NOT inject unified bus or `IMessageMediator`. (Explicit read vs write intent.)
- MUST inject `IDatabaseContext` in query handlers; MUST NOT inject repositories or `AppDbContext`. (Read path isolation.)
- MUST NOT add per-aggregate `IXxxReadStore` interfaces. (One read abstraction.)
- MUST use `.AsNoTracking()` or projections in `Application.Read`. (No accidental tracking on reads.)
- MUST maintain Test Coverage in `{use-case}.tests.md` per `TEST_SPEC_TRACEABILITY` in `agentic-guardrails.md`. (No orphan tests.)

### API layer

- MUST use `IEndpoint`; MUST NOT use MVC `Controller` / `ControllerBase`. (Thin adapter pattern.)
- WebApi endpoints MUST reference Contracts only; `Program.cs` registers implementations. (No handler leakage.)

### Security and configuration

- MUST NOT accept actor IDs from request bodies when the actor is the authenticated user. (BOLA prevention.)
- MUST NOT use `configuration["Key"]!` directly; use `IOptions<T>`. (Fail-fast validated config.)
- MUST use `FromSqlInterpolated` for raw SQL; MUST NOT concatenate SQL strings. (Injection prevention.)

### Frontend

- MUST await `params` / `searchParams` / `cookies` / `headers`. (Next.js async dynamic APIs.)
- MUST comment every `'use client'`. (Documents client boundary.)
- MUST NOT cross-import `features/{a}/` from `features/{b}/`. (Feature isolation.)
- Env vars only via `lib/env.ts`. (Validated public config.)
- See `docs/conventions/frontend/` for data fetching, state, Tailwind, file size.

### Process and dependencies

- MUST check `standards.manifest.json` before changing package references. (Pin integrity.)
- MUST NOT upgrade framework versions unless task is standards upgrade. (Controlled stack.)
- MUST use blueprints in `docs/blueprints/` for complete file generation. (Consistent scaffolds.)
- MUST NOT add packages outside approved lists without ADR (`forbidden-packages.md`, `solution-structure.md`).
- MUST follow `writing-style.md`. (Consistent agent and human prose.)
- MUST run gates in `docs/conventions/shared/ci.md` and `definition-of-done.md`.
- Project `docs/domain/` wins over standards when overlapping (`principles.md` documentation precedence).

## Conventions and load plans

All normative convention paths are listed in `standards.manifest.json` under `conventionIndex`. Scoped agent loads use `agentLoadPlans` in the same file. Glossary: `docs/glossary.md`.

## Commands

Replace `{ProjectName}` with the .NET solution name from the consumer repo (for example `LitePress` → `LitePress.slnx` under `apps/api/`). Replace `{frontend}` with the app folder name (`web`, `admin`, etc.). The project `AGENTS.md` shim MUST document these substitutions.

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm install --frozen-lockfile
pnpm lint && pnpm type-check && pnpm test && pnpm build
pnpm exec playwright test --config apps/{frontend}/playwright.config.ts
```

Skip frontend commands when the project has no apps under `apps/`. Run gates for every frontend app you changed.
