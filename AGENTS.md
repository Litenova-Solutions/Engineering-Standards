# Litenova Engineering Standards Agent Protocol

Read this file before changing this repository or a consumer application. (CORE.AGENT.LOAD.001)

Standards v1.14.0 covers one bounded-context business application. The `dotnet-nextjs` profile uses ASP.NET Core, PostgreSQL, Marten, and zero or more Next.js frontends. (CORE.SCOPE.APPLICATION.001, CORE.SCOPE.CONTEXT.001)

The canonical human index is `docs/README.md`. Exact versions, profiles, extensions, and task load plans are in `standards.manifest.json`. (PLATFORM.NEXTJS.VERSION.001, PLATFORM.BLAZOR.VERSION.001, CORE.AGENT.LOAD.001)

## Writing

Read the [authoring standard](docs/foundations/authoring-standard.md) before authoring standards or technical prose. Run its validation gates. (CORE.AUTHORING.PAGE.001, CORE.AUTHORING.VALIDATION.001)

Agent Summary sections and this file are informative projections. Follow the cited canonical provision when a projection omits detail. (CORE.AUTHORING.SUMMARY.001, CORE.PRINCIPLES.SOURCE.001)

## Current Snapshot

Treat active standards as a complete current snapshot. (CORE.AUTHORING.SNAPSHOT.001)

Do not retain history-specific paths, IDs, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (CORE.AUTHORING.SNAPSHOT.002)

Each standards release states its complete contract. Do not add compatibility, migration, deprecation, or alias work between standards releases. (CORE.AUTHORING.SNAPSHOT.003, CORE.AUTHORING.SNAPSHOT.004)

A consumer keeps a pinned release for as long as that consumer chooses. (CORE.AUTHORING.SNAPSHOT.005)

A consumer records the release it reviewed in `reviewedStandardsVersion`. (CORE.AUTHORING.SNAPSHOT.006)

`CORE.AUTHORING.SNAPSHOT.004` covers standards releases only. Consumer product API compatibility, migration, and rollback provisions still apply. (CORE.AUTHORING.SNAPSHOT.004)

## Context Loading

1. Read the consumer `AGENTS.md` and `standards.project.json`. (CORE.AGENT.LOAD.002)
2. Read the active use-case specification before changing observable behavior. (CORE.AGENT.LOAD.004)
3. Select the narrowest task under `loadPlans` in the manifest. (CORE.AGENT.LOAD.001)
4. Read its Tier 1 Agent Summary sections. (CORE.AGENT.LOAD.002)
5. Read Tier 2 before generating files or changing public boundaries. (CORE.AGENT.CONVENTION.002)
6. Read selected project extensions and locally applicable extensions. (CORE.AGENT.LOAD.003, CORE.SYSTEM.EXTENSIONS.001)
7. Inspect neighboring consumer files after loading the applicable standard. (CORE.AGENT.CONVENTION.003)

Do not load unrelated conventions or inactive extensions. (CORE.AGENT.LOAD.003, CORE.SYSTEM.EXTENSIONS.001)

## Source Precedence

Apply guidance in this order: consumer override, baseline-replacing extension, selected profile, then foundation. (CORE.AGENT.PRECEDENCE.001)

A named local convention can replace a baseline convention. Stop when requirements conflict without declared precedence. (CORE.AGENT.PRECEDENCE.001, CORE.AGENT.CONFLICT.001)

Quote both conflicting IDs and paths when requesting a decision. (CORE.AGENT.CONFLICT.001)

## Editing Protocol

1. Confirm the requested scope and affected repositories. (CORE.AGENT.EDIT.003)
2. Read `git status` and preserve unrelated work. (CORE.AGENT.EDIT.001)
3. Load the active specification and applicable extensions. (CORE.AGENT.LOAD.003, CORE.AGENT.LOAD.004)
4. Check the manifest before changing dependencies. (WORKSPACE.DEPENDENCIES.PINS.001, WORKSPACE.DEPENDENCIES.APPROVAL.001)
5. Match compliant neighboring patterns. (CORE.AGENT.CONVENTION.003)
6. Change documentation, code, tests, contracts, and operations as one unit. (CORE.AGENT.SYNC.001)

Do not add an unauthorized package, schema migration, authentication change, public break, or external side effect. (CORE.AGENT.EDIT.001)

## High-Risk Boundaries

- Use Domain, Application, Infrastructure, and WebApi as the application projects. (BACKEND.ARCHITECTURE.PROJECTS.001)
- Keep Domain independent from persistence, web, mediator, logging, and dependency injection. (BACKEND.ARCHITECTURE.DEPENDENCIES.001)
- Model aggregate lifecycles with an abstract state and sealed state records. (BACKEND.DOMAIN.STATE.001)
- Model Domain closed sets as record hierarchies, never enums. (BACKEND.DOMAIN.CLOSEDSET.001)
- Give each layer ownership of its messages, results, and transport models. (BACKEND.ARCHITECTURE.CONTRACTS.001)
- Give each rejected Domain rule its own exception type and stable failure code. (BACKEND.DOMAIN.ERROR.001)
- Organize each layer by the same modules, aggregates, and use cases. (BACKEND.ARCHITECTURE.MODULE.001)
- Write commands through repositories and commit through the command pipeline. (BACKEND.APPLICATION.COMMAND.001, BACKEND.PERSISTENCE.COMMIT.001)
- Derive authenticated actors from verified claims and authorize target resources. (BACKEND.API.ACTOR.001, BACKEND.API.AUTHZ.001)
- Use the controlled shadcn/ui baseline for React web frontends. (FRONTEND.UI.GOVERNANCE.001, FRONTEND.UI.SHADCN.001)

Read the full cited provisions before applying these boundaries. (CORE.AGENT.LOAD.001)

## Repository Verification

Run these checks for the standards repository. (CORE.AUTHORING.VALIDATION.001)

```bash
node tools/validate-standards.cases.mjs
node tools/generate-provisions.mjs
node tools/validate-standards.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
git diff --check
```

The standards validator checks current schemas, manifest references, provision IDs, page contracts, links, prose, summaries, and evidence mappings. (CORE.AUTHORING.VALIDATION.001, CORE.AUTHORING.SNAPSHOT.001)

Run extension-specific checks when their rules, schemas, templates, or validators change. (CORE.RELEASE.GATES.001)

## Consumer Verification

`QUALITY.CI.GATES.001` in [continuous integration](docs/conventions/quality/ci.md) owns the exact consumer gate commands. Run the gates its table selects for each changed area. (CORE.RELEASE.GATES.001, QUALITY.CI.GATES.001)

Run the reference validators from the consumer root, then Playwright for affected browser flows and every applicable extension check. (CORE.RELEASE.GATES.001)

```bash
node standards/tools/validate-consumer.mjs
node standards/tools/validate-ui.mjs
```

## Completion

Run every applicable check and compare observable behavior with the active use case. (CORE.AGENT.COMPLETE.001)

Inspect generated differences and report exact commands, results, evidence scope, and skipped checks. (CORE.AGENT.COMPLETE.001, CORE.RELEASE.REPORT.001)

Leave no placeholder implementation, `TODO`, or untracked generated output. (CORE.RELEASE.SLICE.001, CORE.RELEASE.DERIVED.001)
