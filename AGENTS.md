# Litenova Engineering Standards Agent Protocol

Read this file before changing this repository or a consumer application. (AGENT.LOAD.001)

Standards v1.11.1 covers one bounded-context business application. The baseline uses ASP.NET Core, PostgreSQL, Marten, and optional Next.js frontends. (SCOPE.APPLICATION.001, SCOPE.CONTEXT.001)

The canonical human index is `docs/README.md`. Exact versions, profiles, extensions, and task load plans are in `standards.manifest.json`. (PROFILE.VERSIONS.001, AGENT.LOAD.001)

## Writing

Read the [authoring standard](docs/foundations/authoring-standard.md) before authoring standards or technical prose. Run its validation gates. (WRITING.PAGE.001, WRITING.VALIDATION.001)

Agent Summary sections and this file are informative projections. Follow the cited canonical provision when a projection omits detail. (WRITING.SUMMARY.001, CORE.SOURCE.001)

## Current Snapshot

Treat active standards as a complete current snapshot. (WRITING.SNAPSHOT.001)

Do not retain history-specific paths, IDs, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (WRITING.SNAPSHOT.002)

Each standards release states its complete contract. Do not add compatibility, migration, deprecation, or alias work between standards releases. (WRITING.SNAPSHOT.003, WRITING.SNAPSHOT.004)

A consumer keeps a pinned release for as long as that consumer chooses. (WRITING.SNAPSHOT.005)

`WRITING.SNAPSHOT.004` covers standards releases only. Consumer product API compatibility, migration, and rollback provisions still apply. (WRITING.SNAPSHOT.004)

## Context Loading

1. Read the consumer `AGENTS.md` and `standards.project.json`. (AGENT.LOAD.002)
2. Read the active use-case specification before changing observable behavior. (AGENT.LOAD.004)
3. Select the narrowest task under `loadPlans` in the manifest. (AGENT.LOAD.001)
4. Read its Tier 1 Agent Summary sections. (AGENT.LOAD.002)
5. Read Tier 2 before generating files or changing public boundaries. (AGENT.CONVENTION.002)
6. Read selected project extensions and locally applicable extensions. (AGENT.LOAD.003, AGENTIC.EXTENSIONS.001)
7. Inspect neighboring consumer files after loading the applicable standard. (AGENT.CONVENTION.003)

Do not load unrelated conventions or inactive extensions. (AGENT.LOAD.003, AGENTIC.EXTENSIONS.001)

## Source Precedence

Apply guidance in this order: consumer override, baseline-replacing extension, selected profile, then foundation. (AGENT.PRECEDENCE.001)

A named local convention can replace a baseline convention. Stop when requirements conflict without declared precedence. (AGENT.PRECEDENCE.001, AGENT.CONFLICT.001)

Quote both conflicting IDs and paths when requesting a decision. (AGENT.CONFLICT.001)

## Editing Protocol

1. Confirm the requested scope and affected repositories. (AGENT.EDIT.003)
2. Read `git status` and preserve unrelated work. (AGENT.EDIT.001)
3. Load the active specification and applicable extensions. (AGENT.LOAD.003, AGENT.LOAD.004)
4. Check the manifest before changing dependencies. (DEP.PINS.001, DEP.APPROVAL.001)
5. Match compliant neighboring patterns. (AGENT.CONVENTION.003)
6. Change documentation, code, tests, contracts, and operations as one unit. (AGENT.SYNC.001)

Do not add an unauthorized package, schema migration, authentication change, public break, or external side effect. (AGENT.EDIT.001)

## High-Risk Boundaries

- Use Domain, Application, Infrastructure, and WebApi as the application projects. (ARCH.PROJECTS.001)
- Keep Domain independent from persistence, web, mediator, logging, and dependency injection. (ARCH.DEPENDENCIES.001)
- Model aggregate lifecycles with an abstract state and sealed state records. (DOMAIN.STATE.001)
- Model Domain closed sets with records or typed value objects, never enums. (DOMAIN.CLOSEDSET.001)
- Give each layer ownership of its messages, results, and transport models. (ARCH.CONTRACTS.001)
- Give each rejected Domain rule its own exception type and stable failure code. (DOMAIN.ERROR.001)
- Organize each layer by the same modules, aggregates, and use cases. (ARCH.MODULES.001)
- Write commands through repositories and commit through the command pipeline. (APP.COMMAND.001, PERSIST.COMMIT.001)
- Derive authenticated actors from verified claims and authorize target resources. (API.ACTOR.001, API.AUTHZ.001)
- Use the controlled shadcn/ui baseline for React web frontends. (UI.GOVERNANCE.001, UI.SHADCN.001)

Read the full cited provisions before applying these boundaries. (AGENT.LOAD.001)

## Repository Verification

Run these checks for the standards repository. (WRITING.VALIDATION.001)

```bash
node tools/validate-standards.cases.mjs
node tools/validate-standards.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
git diff --check
```

The standards validator checks current schemas, manifest references, provision IDs, page contracts, links, prose, summaries, and evidence mappings. (WRITING.VALIDATION.001, WRITING.SNAPSHOT.001)

Run extension-specific checks when their rules, schemas, templates, or validators change. (RELEASE.GATES.001)

## Consumer Verification

Replace `{ProjectName}` with the consumer solution name. (RELEASE.GATES.001)

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
```

For each changed frontend, run its complete gate. (RELEASE.GATES.001)

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Run the reference validators from the consumer root. (RELEASE.GATES.001)

```bash
node standards/tools/validate-consumer.mjs
node standards/tools/validate-ui.mjs
```

Run Playwright for affected browser flows. Run every applicable extension check. (RELEASE.GATES.001)

## Completion

Run every applicable check and compare observable behavior with the active use case. (AGENT.COMPLETE.001)

Inspect generated differences and report exact commands, results, evidence scope, and skipped checks. (AGENT.COMPLETE.001, RELEASE.REPORT.001)

Leave no placeholder implementation, `TODO`, or untracked generated output. (RELEASE.SLICE.001, RELEASE.DERIVED.001)
