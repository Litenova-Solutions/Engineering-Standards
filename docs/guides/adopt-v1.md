# Adopt Standards v1

This guide creates a consumer repository that follows the `dotnet-nextjs` profile. Read [V1 Release Scope](v1-release-scope.md) before adopting the profile.

## Sequence

1. Add the standards submodule at `standards/` and pin an approved tag or exact commit.
2. Copy `standards.project.json` and `project-agents.md`. Fill in the project name, solution path, and local commands.
3. Create the root toolchain and package configuration from manifest pins.
4. Create `apps/api/{ProjectName}.slnx`, the four application projects, AppHost, ServiceDefaults, and four baseline test projects.
5. Add the required project references. Keep Domain free of outer-layer packages.
6. Configure PostgreSQL, Marten, LiteBus, diagnostics, the command commit post-handler, HTTP boundaries, and deterministic OpenAPI generation.
7. Create the Product brief, domain index, glossary, Subject index, first Subject, first Use case, and first Business Flow from templates.
8. Select only extensions justified by current requirements. Apply project-scoped extensions globally and list local extensions only on allowed specifications.
9. Implement one complete Use case through Domain, Application, Infrastructure, WebApi, optional frontend, tests, generated contracts, and operating impact.
10. Add a Workflow only when system-controlled progress crosses a transaction or time boundary.
11. Add CI, schema review, backup and restore, deployment, rollback, Operating Limits, runbooks, and a deployed Flow check.
12. Run the [Release Standard](../foundations/release-standard.md) and record exact results for one immutable artifact.

## Initial documentation shape

```text
docs/
  product/
    brief.md
    flows/
      first-outcome.md
  domain/
    README.md
    glossary.md
    subjects/
      README.md
      posts/
        README.md
        create-draft.md
```

Create `workflows/`, `shared-rules/`, `operations/`, `runbooks/`, `release/`, `research/`, and `ui/` only with their first real artifact.

## Bootstrap evidence

Before feature work expands beyond the first slice, confirm these outputs exist:

| Concern | Required output |
|:---|:---|
| Toolchain | SDK and package-manager pins, central NuGet versions, lock files, and the root pnpm lockfile when TypeScript exists |
| Composition | One visible WebApi composition root, Infrastructure registration, deterministic endpoint mapping, and no service locator |
| Documentation | Current Specification Metadata, one Primary Business Flow, one Subject specification, and one Use-case specification |
| Domain | Aggregate ownership, required state record hierarchies, `INV-*` rules, Events, and Follow-ups for the first Command |
| Persistence | Real Marten configuration, one scoped session, one command commit post-handler, explicit aliases and JSON contracts, and a reviewed schema plan |
| HTTP | Stable routes, actor mapping, target authorization, Problem Details, pagination, OpenAPI operation IDs, and documented responses |
| Testing | Four baseline test projects, PostgreSQL container fixture, real API factory, database reset, architecture rules, and acceptance-ID references |
| Frontend | Generated transport types, one typed client, normalized errors, serializable action results, and explicit route states when a frontend exists |
| Operations | Health endpoints, trace-correlated diagnostics, bounded metrics, alerts, required runbooks, and Operating Limits |
| Delivery | Required CI jobs, immutable artifact identity, deployment, Flow check, restore exercise, rollback exercise, and release evidence |

## First-slice defaults

Use Marten document persistence, one Aggregate repository per Command-loaded Aggregate, direct `IQuerySession` projections for baseline reads, and one LiteBus commit after a successful Command.

Do not enable conditional behavior in advance. Select `persistence-ef-core`, `api-compatibility`, `scheduled-jobs`, `data-lifecycle`, or another extension only after its activation criteria are met.

## Verification

- Validate the manifest and consumer configuration against their schemas.
- Validate each structured metadata block against the Specification Metadata schema.
- Confirm solution and project paths match the repository convention.
- Confirm the Primary Business Flow resolves to real Use-case specifications.
- Confirm the first Use case has Domain, persistence, API, test, generated-contract, and operating evidence before marking it verified.
- Confirm every bootstrap output has an owner and automated or recorded evidence.
- Run baseline and applicable extension checks before the first deployment.
