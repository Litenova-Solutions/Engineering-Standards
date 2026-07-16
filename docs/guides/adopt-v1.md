# Adopt Standards v1

This guide creates a consumer repository that follows the `dotnet-nextjs` profile. Replace every placeholder with the consumer's project name and paths.

## Sequence

1. Create the repository and add the standards submodule at `standards/`. Pin the v1 tag or commit and add `standards.project.json` from `standards/templates/docs/standards.project.json`.
2. Copy `standards/templates/docs/project-agents.md` to the repository root as `AGENTS.md`. Fill in the solution name, frontend names, and local commands.
3. Create the root `global.json`, package configuration, and optional pnpm workspace. Keep version pins aligned with `standards.manifest.json`.
4. Create `apps/api/{ProjectName}.slnx` and the Domain, Application, Infrastructure, WebApi, AppHost, ServiceDefaults, and four baseline test projects under the paths in [Repository Structure](../conventions/repository/structure.md). Add Worker only when an extension requires it.
5. Add the project references from [Dependencies](../conventions/repository/dependencies.md). Keep Domain free of provider packages and keep provider registration in Infrastructure and hosts.
6. Configure PostgreSQL, Marten, LiteBus, health checks, diagnostics, and the commit post-handler. Apply the persistence and operations conventions before adding a second capability.
7. Create the product brief, domain index, capability document, and one use-case specification from the templates. Select only the extensions activated by the primary journey.
8. Implement one complete slice through Domain, Application, Infrastructure, WebApi, optional frontend, tests, generated contracts, and operating instructions. Cite each acceptance ID in automated tests.
9. Add CI, branch protection, backup and restore evidence, schema review, deployment, rollback, and primary-journey smoke testing before calling v1 complete.
10. Run the release gates from [Release Standard](../foundations/release-standard.md) and record exact commands and skipped checks in the release evidence.

## First-slice defaults

Use Marten document persistence, one aggregate repository per command-loaded aggregate, direct `IQuerySession` projections for baseline reads, and one LiteBus commit after a successful command. Enable `persistence-ef-core`, `api-compatibility`, `scheduled-jobs`, `data-lifecycle`, or another extension only after its activation criteria and decision are recorded.

## Verification

- Confirm the consumer configuration validates against the standards project schema.
- Confirm the solution and project paths match the repository structure convention.
- Confirm the primary use case has domain, persistence, API, test, generated-contract, and operating evidence.
- Run the complete baseline and enabled-extension checks before the first deployment.
