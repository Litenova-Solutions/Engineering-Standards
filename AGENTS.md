# Litenova Engineering Standards Agent Contract

Read this file before changing this repository or a consumer application.

These standards cover a single bounded-context business application built with ASP.NET Core, PostgreSQL, Marten, and an optional Next.js frontend. Other architectures require a separate profile or an explicit project decision.

## Context loading

1. Read the consumer repository `AGENTS.md` and `standards.project.json`.
2. Run the context command for the task when the standards tool is available.
3. Read Tier 1 quick rules.
4. Read full Tier 2 documents when the task changes that area or a quick rule needs detail.
5. Read a recipe only when `standards.project.json` enables it.
6. Read the active use-case specification before changing application behavior.

```bash
dotnet run --project standards/tooling/src/Litenova.Standards.Tool -- \
  context --task backend.application \
  --project standards.project.json \
  --use-case posts.create
```

When editing this standards repository, omit `standards/` from the project path.

## Source precedence

Apply rules in this order:

1. Consumer override backed by a decision record and named rule ID.
2. Enabled recipe that declares it replaces a profile rule.
3. Selected profile.
4. Core standard.

Stop when two rules conflict without an explicit replacement. Quote both rule IDs and paths before requesting a decision.

## Before editing

1. Confirm the requested scope and affected repositories.
2. Check `git status` and preserve unrelated work.
3. Load the task context and active use-case specification.
4. Check `standards.manifest.json` before changing dependencies.
5. Match established project patterns unless the task is a standards migration.
6. Plan documentation, implementation, tests, and generated artifacts as one unit.

Do not add a package, migration, authentication model change, or public API break unless the request includes it or an accepted decision authorizes it.

## Non-negotiable boundaries

- Domain stays free of persistence, web, and mediator packages.
- Application commands write through aggregate repositories.
- Application queries read through Marten `IQuerySession`.
- Handlers and repositories do not call `SaveChangesAsync`.
- The LiteBus command pipeline owns the single commit.
- Endpoints dispatch through `ICommandMediator` or `IQueryMediator`.
- Endpoints derive the authenticated actor from claims.
- Minimal APIs use `IEndpoint`; MVC controllers are outside this profile.
- Frontend features do not import another feature's internal files.
- Environment variables pass through the validated environment module.
- Active acceptance-criterion IDs must appear in automated tests.
- Generated files must be regenerated in the same change as their sources.

The canonical rules and their reasons live under `docs/core/` and `docs/profile/`. Do not copy this list into consumer documentation.

## Required verification

For this repository:

```bash
dotnet build tooling/Litenova.Standards.slnx --configuration Release
dotnet test tooling/Litenova.Standards.slnx --configuration Release --no-build
dotnet run --project tooling/src/Litenova.Standards.Tool -- check
```

For a consumer backend:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
```

For each changed frontend:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Run Playwright when the project contains critical browser journeys. Run recipe-specific gates declared by each enabled recipe.

## Completion rule

Before reporting completion:

- Run every applicable gate.
- Regenerate indexes, trace reports, OpenAPI, and API types.
- Confirm the active use-case document matches observable behavior.
- Report skipped gates and the exact reason.
- Leave no placeholder implementation, `TODO`, or untracked generated output.
