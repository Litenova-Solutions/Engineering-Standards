# LiteSpec Agent Protocol

Read this file before changing this repository or a consumer application. (litespec/core/agent#select-task-context)

LiteSpec v2.0.0 covers one bounded-context business application. A consumer selects one size, small or large, the `dotnet` stack for its backend, and one stack per frontend. (litespec/core/scope#select-a-size-profile-and-stacks, litespec/core/scope#keep-one-bounded-context)

The canonical human index is `docs/README.md`. Exact versions, stacks, extensions, and switched-on types are in `litespec.manifest.json`. (litespec/backend/dotnet/packages#pin-every-dependency-centrally, litespec/core/scope#select-conditional-extensions-explicitly)

A provision ID is its page and heading: `litespec/<page>#<slug>` is the heading `<slug>` on `docs/<page>.md`, so `litespec/frontend/components#compose-composites-in-page-code` is in `docs/frontend/components.md`. Headings carry no ID. `docs/reference/provisions.md` lists every identifier with its heading. (litespec/core/authoring#use-the-declared-identifier-grammar, litespec/core/authoring#regenerate-the-provision-index)

## Writing

Read the [authoring standard](docs/core/authoring.md) before authoring standards or technical prose. Run its validation gates. (litespec/core/authoring#use-the-declared-page-contract, litespec/core/authoring#run-repeatable-authoring-checks)

Agent Summary sections and this file are informative projections. Follow the cited canonical provision when a projection omits detail. (litespec/core/authoring#keep-agent-summaries-informative, litespec/core/principles#keep-one-authored-source)

## Current Snapshot

Treat active standards as a complete current snapshot. (litespec/core/authoring#validate-current-standards-material)

Do not retain history-specific paths, IDs, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (litespec/core/authoring#exclude-historical-transition-material)

Each LiteSpec release states its complete contract. Do not add compatibility, migration, deprecation, or alias work between LiteSpec releases. (litespec/core/authoring#publish-each-release-as-a-complete-contract, litespec/core/authoring#exclude-cross-release-compatibility-work)

A consumer keeps a pinned release for as long as that consumer chooses. (litespec/core/authoring#keep-a-pinned-release-for-as-long-as-it-serves)

A consumer records the release it reviewed in `reviewedLiteSpecVersion`. (litespec/core/authoring#record-the-reviewed-litespec-release)

`litespec/core/authoring#exclude-cross-release-compatibility-work` covers LiteSpec releases only. Consumer product API compatibility, migration, and rollback provisions still apply. (litespec/core/authoring#exclude-cross-release-compatibility-work)

## Context Loading

1. Read the consumer `AGENTS.md` and `litespec.project.json`. (litespec/core/agent#select-task-context)
2. Query the model for the records the task touches. (litespec/core/agent#select-task-context)
3. Read the generated agent context for those records, then the records themselves. (litespec/core/agent#select-task-context)
4. Read the full standards pages the query names before generating files or changing public boundaries. (litespec/core/agent#select-task-context)
5. Read selected extensions and their switched-on types before editing inside their boundary. (litespec/core/agent#load-applicable-extensions, litespec/core/scope#record-selected-extensions)
6. Inspect neighboring consumer files after loading the applicable standard. (litespec/core/agent#inspect-local-examples-after-standards)

Run the query from the LiteSpec root as below, adding the `litespec/` prefix from a consumer root. (litespec/core/agent#select-task-context)

```bash
dotnet run --project src/LiteSpec.Cli -- model query <id>
```

The [command index](docs/tools/README.md) states how `litespec` runs in each repository. (litespec/core/agent#select-task-context)

Do not load unrelated conventions or inactive extensions. (litespec/core/agent#load-applicable-extensions, litespec/core/scope#record-selected-extensions)

## Source Precedence

Apply guidance in this order: project exception, baseline-replacing extension, selected stacks, then core page. (litespec/core/agent#apply-guidance-precedence)

A project exception with a reason and review date can replace a baseline rule. Stop when requirements conflict without declared precedence. (litespec/core/agent#apply-guidance-precedence, litespec/core/agent#stop-on-unresolved-conflict)

Quote both conflicting IDs and paths when requesting a decision. (litespec/core/agent#stop-on-unresolved-conflict)

## Editing Protocol

1. Confirm the requested scope and affected repositories. (litespec/core/agent#make-coherent-scoped-changes)
2. Read `git status` and preserve unrelated work. (litespec/core/agent#inspect-existing-work-before-editing)
3. Query the model for the active records and load the applicable extensions. (litespec/core/agent#select-task-context, litespec/core/agent#load-applicable-extensions)
4. Check the manifest before changing dependencies. (litespec/backend/dotnet/packages#pin-every-dependency-centrally, litespec/workspace/dependencies#approve-new-packages-explicitly)
5. Match compliant neighboring patterns. (litespec/core/agent#inspect-local-examples-after-standards)
6. Change records, code, tests, contracts, and operations as one unit. (litespec/core/system#update-records-with-behavior)

Do not add an unauthorized package, schema migration, authentication change, public break, or external side effect. (litespec/core/agent#inspect-existing-work-before-editing)

## Version Handling

The LiteSpec manifest carries a `version` field. The actual current version is the highest git tag in this repository. The agent reads the highest tag before assuming a version. It sets the manifest to the next release being prepared. It adds new `CHANGELOG.md` entries to the topmost entry under that release's heading. (litespec/core/maintaining#publish-a-litespec-release-from-a-tag)

The consumer template's `reviewedLiteSpecVersion` equals the manifest version, so a consumer created from the template passes the consumer check against the release it pins. The tag makes that release current. (litespec/core/maintaining#publish-a-litespec-release-from-a-tag, litespec/core/authoring#record-the-reviewed-litespec-release)

## High-Risk Boundaries

- Use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as the application projects. (litespec/backend/dotnet/architecture#use-five-application-projects)
- Place a type at the lowest folder holding every consumer that names it. (litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers)
- Keep Domain independent from persistence, web, mediator, logging, and dependency injection. (litespec/backend/architecture#point-dependencies-inward)
- Model aggregate lifecycles with an abstract state and sealed state records. (litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records)
- Model Domain closed sets as record hierarchies, never enums. (litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums)
- Give each layer ownership of its messages, results, and transport models. (litespec/backend/architecture#own-each-layers-contract-types)
- Give each rejected Domain rule its own exception type and stable failure code. (litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions)
- Organize each layer by the same modules, aggregates, and use cases. (litespec/backend/architecture#organize-every-layer-by-module-and-use-case)
- Write commands through repositories and commit through the command pipeline. (litespec/backend/application#keep-command-handlers-narrow, litespec/backend/persistence#commit-each-command-pipeline-once)
- Derive the actor from verified claims, and authorize each target from declared permissions. (litespec/backend/application#enforce-target-authorization-in-the-pipeline)
- Use the controlled shadcn/ui baseline for React web frontends. (litespec/frontend/ui#select-one-visual-authority, litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package)
- Use the controlled shadcn-svelte baseline for Svelte frontends. (litespec/frontend/ui#select-one-visual-authority, litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package)

Read the full cited provisions before applying these boundaries. (litespec/core/agent#select-task-context)

## Pattern feedback

Agents building UI follow the chosen pattern from the catalog. An agent that sees how a pattern could improve finishes its task on the chosen pattern, then reports a proposal in its completion report. It never changes a decision on its own and never stops mid-task to ask. A proposal that is not specific to one product goes to the pattern library after the owner accepts it. (litespec/frontend/patterns#report-pattern-feedback-after-the-work, litespec/frontend/patterns#promote-library-improvements)

## Repository Verification

Run these checks for the LiteSpec repository. (litespec/core/authoring#run-repeatable-authoring-checks)

```bash
dotnet build LiteSpec.slnx
dotnet test --solution LiteSpec.slnx
dotnet run --project src/LiteSpec.Cli -- provisions
dotnet run --project src/LiteSpec.Cli -- validate
node patterns/ui/library.mjs --check
git diff --check
```

The standards validator checks current schemas, manifest references, provision IDs, page contracts, links, prose, summaries, and verification marks. (litespec/core/authoring#run-repeatable-authoring-checks, litespec/core/authoring#validate-current-standards-material)

Run extension-specific checks when their rules, schemas, templates, or validators change. (litespec/core/release#run-boundary-selected-checks)

## Consumer Verification

`litespec/quality/ci#run-applicable-gates-on-every-pull-request` in [continuous integration](docs/quality/ci.md) owns the consumer gates. Run the gates its job table selects for each changed area. (litespec/core/release#run-boundary-selected-checks, litespec/quality/ci#run-applicable-gates-on-every-pull-request)

Run Playwright for affected browser flows and every applicable extension check. (litespec/core/release#run-boundary-selected-checks)

## Completion

Run every applicable check and compare observable behavior with the active records. (litespec/core/release#report-verification-exactly)

Inspect generated differences and report exact commands, results, evidence scope, and skipped checks. (litespec/core/release#report-verification-exactly)

Leave no placeholder implementation, `TODO`, or untracked generated output. (litespec/core/system#deliver-one-complete-use-case, litespec/core/release#regenerate-application-contracts)
