# Litenova Engineering Standards Agent Protocol

Read this file before changing this repository or a consumer application.

Version 1 covers one bounded-context business application built with ASP.NET Core, PostgreSQL, Marten, and optional Next.js frontends. The canonical human index is `docs/README.md`. Exact versions, profile composition, extensions, and task load plans live in `standards.manifest.json`.

## Documentation model

Each topic document separates:

- `Intent`: nonnormative explanation.
- `Agent Summary`: Tier 1 task context.
- `Standards`: required boundaries. Deviation requires a named override and decision.
- `Conventions`: default names, locations, and implementation patterns. A consumer may replace one with an explicit local convention.
- `Verification`: required evidence.

Stable rule IDs appear in parentheses after human titles.

## Context loading

1. Read the consumer root `AGENTS.md` and `standards.project.json`.
2. Read the active use-case specification before changing observable behavior.
3. Select the narrowest task under `loadPlans` in `standards.manifest.json`.
4. Read the listed Tier 1 `Agent Summary` sections.
5. Read Tier 2 before generating a file, changing a public boundary, or choosing between patterns.
6. Read every extension enabled by the active use case or consumer configuration.
7. Inspect neighboring consumer files after loading the applicable standard.

Do not load unrelated conventions or inactive extensions.

## Source precedence

Apply applicable guidance in this order:

1. Consumer override backed by a decision and named rule ID.
2. Enabled extension that names a baseline replacement.
3. Selected platform profile and its conventions.
4. Foundation standards.

An explicit consumer convention may replace a baseline convention. Stop when applicable requirements conflict without declared precedence. Quote both rule IDs and paths before requesting a decision.

## Before editing

1. Confirm the requested scope and affected repositories.
2. Read `git status` and preserve unrelated work.
3. Load the task context, active use case, and enabled extensions.
4. Check the manifest before changing dependencies.
5. Match compliant local patterns.
6. Plan documentation, code, tests, generated contracts, and operating impact as one unit.

Do not add a package, migration, authentication model change, public API break, or external side effect unless the request or an accepted decision authorizes it.

## Baseline boundaries

- Use `apps/api/{ProjectName}.slnx`, production projects under `apps/api/src/`, and tests under `apps/api/tests/`.
- Use Domain, Application, Infrastructure, and WebApi as the four application projects.
- Keep Domain free of persistence, web, mediator, logging, and dependency injection packages.
- Organize every layer by the same business capabilities and use cases.
- Keep handlers, validators, endpoints, and persistence implementations internal sealed.
- Write commands through aggregate repositories and read queries through `IQuerySession`.
- Do not call `SaveChangesAsync` from handlers, repositories, endpoints, or reactions.
- Commit once through the LiteBus command post-handler.
- Use Minimal API `IEndpoint`; MVC controllers are outside the profile.
- Derive authenticated actor IDs from verified claims and authorize the target resource.
- Keep frontend capability internals isolated and route files focused on composition.
- Validate backend options and frontend environment access through owned modules.
- Cite every active acceptance-criterion ID from automated tests.
- Regenerate OpenAPI and typed consumers with their sources.

Read the full task conventions before applying any boundary from this summary.

## Repository verification

For this standards repository:

- Validate the two tracked schema consumers.
- Check manifest paths and `#agent-summary` anchors.
- Check rule-ID uniqueness and extension references.
- Check internal links, ASCII writing rules, document metadata, code-document consistency, and stale terminology.
- Run `git diff --check`.

The repository has no standards CLI, generated index, or application scaffold.

## Consumer verification

Replace `{ProjectName}` with the consumer solution name:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
```

For every changed frontend:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Run Playwright for critical browser journeys and extension-specific verification for every enabled extension affected by the change.

## Completion

- Run every applicable check.
- Confirm the use-case specification matches observable behavior.
- Inspect generated application differences.
- Report exact commands, outcomes, and skipped checks.
- Leave no placeholder implementation, `TODO`, or untracked generated output.
