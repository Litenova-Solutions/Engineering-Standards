# LiteSpec Agent Protocol

Read this file before changing this repository or a consumer application. (litespec/rule/core-agent.select-task-context)

LiteSpec v2.0.0 covers one bounded-context business application. A consumer selects one size, small or large, the `dotnet` stack for its backend, and one stack per frontend. (litespec/rule/core-scope.select-a-size-profile-and-stacks, litespec/rule/core-scope.keep-one-bounded-context)

The canonical human index is `docs/README.md`. Exact versions, stacks, extensions, and switched-on types are in `litespec.manifest.json`. (litespec/rule/workspace-dependencies.pin-every-dependency-centrally, litespec/rule/core-scope.select-conditional-extensions-explicitly)

A provision ID states its own page: `litespec/<kind>/<page>.<heading-slug>` names `docs/<area>/<page>.md`, so `litespec/rule/frontend-components.compose-composites-in-page-code` is in `docs/frontend/components.md`. `docs/reference/provisions.md` lists every identifier with its heading. (litespec/rule/core-authoring.use-the-declared-identifier-grammar, litespec/rule/core-authoring.regenerate-the-provision-index)

## Writing

Read the [authoring standard](docs/core/authoring.md) before authoring standards or technical prose. Run its validation gates. (litespec/rule/core-authoring.use-the-declared-page-contract, litespec/rule/core-authoring.run-repeatable-authoring-checks)

Agent Summary sections and this file are informative projections. Follow the cited canonical provision when a projection omits detail. (litespec/rule/core-authoring.keep-agent-summaries-informative, litespec/rule/core-principles.keep-one-authored-source)

## Current Snapshot

Treat active standards as a complete current snapshot. (litespec/rule/core-authoring.validate-current-standards-material)

Do not retain history-specific paths, IDs, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (litespec/rule/core-authoring.exclude-historical-transition-material)

Each LiteSpec release states its complete contract. Do not add compatibility, migration, deprecation, or alias work between LiteSpec releases. (litespec/rule/core-authoring.publish-each-release-as-a-complete-contract, litespec/rule/core-authoring.exclude-cross-release-compatibility-work)

A consumer keeps a pinned release for as long as that consumer chooses. (litespec/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves)

A consumer records the release it reviewed in `reviewedLiteSpecVersion`. (litespec/rule/core-authoring.record-the-reviewed-litespec-release)

`litespec/rule/core-authoring.exclude-cross-release-compatibility-work` covers LiteSpec releases only. Consumer product API compatibility, migration, and rollback provisions still apply. (litespec/rule/core-authoring.exclude-cross-release-compatibility-work)

## Context Loading

1. Read the consumer `AGENTS.md` and `litespec.project.json`. (litespec/rule/core-agent.select-task-context)
2. Query the model for the records the task touches. (litespec/rule/core-agent.select-task-context)
3. Read the generated agent context for those records, then the records themselves. (litespec/rule/core-agent.select-task-context)
4. Read the full standards pages the query names before generating files or changing public boundaries. (litespec/rule/core-agent.select-task-context)
5. Read selected extensions and their switched-on types before editing inside their boundary. (litespec/rule/core-agent.load-applicable-extensions, litespec/rule/core-scope.record-selected-extensions)
6. Inspect neighboring consumer files after loading the applicable standard. (litespec/rule/core-agent.inspect-local-examples-after-standards)

Run the query from the LiteSpec root as below, adding the `litespec/` prefix from a consumer root. (litespec/rule/core-agent.select-task-context)

```bash
dotnet run --project tools/model/Litenova.Model -- query <id>
```

Do not load unrelated conventions or inactive extensions. (litespec/rule/core-agent.load-applicable-extensions, litespec/rule/core-scope.record-selected-extensions)

## Source Precedence

Apply guidance in this order: project exception, baseline-replacing extension, selected stacks, then core page. (litespec/rule/core-agent.apply-guidance-precedence)

A project exception with a reason and review date can replace a baseline rule. Stop when requirements conflict without declared precedence. (litespec/rule/core-agent.apply-guidance-precedence, litespec/rule/core-agent.stop-on-unresolved-conflict)

Quote both conflicting IDs and paths when requesting a decision. (litespec/rule/core-agent.stop-on-unresolved-conflict)

## Editing Protocol

1. Confirm the requested scope and affected repositories. (litespec/rule/core-agent.make-coherent-scoped-changes)
2. Read `git status` and preserve unrelated work. (litespec/rule/core-agent.inspect-existing-work-before-editing)
3. Query the model for the active records and load the applicable extensions. (litespec/rule/core-agent.select-task-context, litespec/rule/core-agent.load-applicable-extensions)
4. Check the manifest before changing dependencies. (litespec/rule/workspace-dependencies.pin-every-dependency-centrally, litespec/rule/workspace-dependencies.approve-new-packages-explicitly)
5. Match compliant neighboring patterns. (litespec/rule/core-agent.inspect-local-examples-after-standards)
6. Change records, code, tests, contracts, and operations as one unit. (litespec/rule/core-system.update-records-with-behavior)

Do not add an unauthorized package, schema migration, authentication change, public break, or external side effect. (litespec/rule/core-agent.inspect-existing-work-before-editing)

## Version Handling

The LiteSpec manifest carries a `version` field. The actual current version is the highest git tag in this repository. The agent reads the highest tag before assuming a version. It sets the manifest to the next release being prepared. It adds new `CHANGELOG.md` entries to the topmost entry under that release's heading. (litespec/rule/core-maintaining.publish-a-litespec-release-from-a-tag)

A consumer template's `reviewedLiteSpecVersion` field is set to the latest released tag, never higher. Aspirational `CHANGELOG.md` entries for un-released versions move below the current release. (litespec/rule/core-authoring.record-the-reviewed-litespec-release)

## High-Risk Boundaries

- Use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as the application projects. (litespec/rule/backend-architecture.use-five-application-projects)
- Place a type at the lowest folder holding every consumer that names it. (litespec/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers)
- Keep Domain independent from persistence, web, mediator, logging, and dependency injection. (litespec/rule/backend-architecture.point-dependencies-inward)
- Model aggregate lifecycles with an abstract state and sealed state records. (litespec/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)
- Model Domain closed sets as record hierarchies, never enums. (litespec/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
- Give each layer ownership of its messages, results, and transport models. (litespec/rule/backend-architecture.own-each-layers-contract-types)
- Give each rejected Domain rule its own exception type and stable failure code. (litespec/rule/backend-domain.reject-business-violations-with-domain-exceptions)
- Organize each layer by the same modules, aggregates, and use cases. (litespec/rule/backend-architecture.organize-every-layer-by-module-and-use-case)
- Write commands through repositories and commit through the command pipeline. (litespec/rule/backend-application.keep-command-handlers-narrow, litespec/rule/backend-persistence.commit-once-in-the-command-pipeline)
- Derive the actor from verified claims, and authorize each target from declared permissions. (litespec/rule/backend-application.enforce-target-authorization-in-the-pipeline)
- Use the controlled shadcn/ui baseline for React web frontends. (litespec/rule/frontend-ui.select-one-visual-authority, litespec/rule/frontend-ui.pin-the-baseline-in-the-shared-package)
- Use the controlled shadcn-svelte baseline for Svelte frontends. (litespec/rule/frontend-ui.select-one-visual-authority, litespec/rule/frontend-ui.pin-the-baseline-in-the-shared-package)

Read the full cited provisions before applying these boundaries. (litespec/rule/core-agent.select-task-context)

## Pattern feedback

Agents building UI follow the chosen pattern from the catalog. An agent that sees how a pattern could improve finishes its task on the chosen pattern, then reports a proposal in its completion report. It never changes a decision on its own and never stops mid-task to ask. A proposal that is not specific to one product goes to the pattern library after the owner accepts it. (litespec/rule/frontend-patterns.report-pattern-feedback-after-the-work, litespec/rule/frontend-patterns.promote-library-improvements)

## Repository Verification

Run these checks for the LiteSpec repository. (litespec/rule/core-authoring.run-repeatable-authoring-checks)

```bash
node tools/validate-standards.cases.mjs
node tools/generate-provisions.mjs
node tools/validate-standards.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
dotnet build tools/model/Litenova.Model
node tools/model.cases.mjs
node patterns/ui/library.mjs --check
git diff --check
```

The standards validator checks current schemas, manifest references, provision IDs, page contracts, links, prose, summaries, and verification marks. (litespec/rule/core-authoring.run-repeatable-authoring-checks, litespec/rule/core-authoring.validate-current-standards-material)

Run extension-specific checks when their rules, schemas, templates, or validators change. (litespec/rule/core-release.run-boundary-selected-checks)

## Consumer Verification

`litespec/rule/quality-ci.run-applicable-gates-on-every-pull-request` in [continuous integration](docs/quality/ci.md) owns the consumer gates. Run the gates its job table selects for each changed area. (litespec/rule/core-release.run-boundary-selected-checks, litespec/rule/quality-ci.run-applicable-gates-on-every-pull-request)

Run Playwright for affected browser flows and every applicable extension check. (litespec/rule/core-release.run-boundary-selected-checks)

## Completion

Run every applicable check and compare observable behavior with the active records. (litespec/rule/core-release.report-verification-exactly)

Inspect generated differences and report exact commands, results, evidence scope, and skipped checks. (litespec/rule/core-release.report-verification-exactly)

Leave no placeholder implementation, `TODO`, or untracked generated output. (litespec/rule/core-system.deliver-one-complete-use-case, litespec/rule/core-release.regenerate-application-contracts)
