# Litenova Engineering Standards Agent Protocol

Read this file before changing this repository or a consumer application. (standards/rule/core-agent.select-task-context)

Standards v2.0.0 covers one bounded-context business application. The `dotnet-nextjs` profile uses ASP.NET Core, PostgreSQL, Marten, and zero or more Next.js frontends. (standards/rule/core-scope.use-the-supported-application-profile, standards/rule/core-scope.keep-one-bounded-context)

The canonical human index is `docs/README.md`. Exact versions, profiles, extensions, and task load plans are in `standards.manifest.json`. (standards/rule/profile-nextjs.use-manifest-version-pins, standards/rule/profile-blazor.use-manifest-version-pins, standards/rule/core-agent.select-task-context)

A provision ID states its own page: `standards/<kind>/<page>.<heading-slug>` names `docs/<area>/<page>.md`, so `standards/rule/frontend-components.use-the-component-ownership-levels` is in `docs/frontend/components.md`. `docs/reference/provisions.md` lists every identifier with its heading. (standards/rule/core-authoring.use-the-declared-identifier-grammar, standards/rule/core-authoring.regenerate-the-provision-index)

## Writing

Read the [authoring standard](docs/core/authoring.md) before authoring standards or technical prose. Run its validation gates. (standards/rule/core-authoring.use-the-declared-page-contract, standards/rule/core-authoring.run-repeatable-authoring-checks)

Agent Summary sections and this file are informative projections. Follow the cited canonical provision when a projection omits detail. (standards/rule/core-authoring.keep-agent-summaries-informative, standards/rule/core-principles.keep-one-authored-source)

## Current Snapshot

Treat active standards as a complete current snapshot. (standards/rule/core-authoring.validate-current-standards-material)

Do not retain history-specific paths, IDs, aliases, maps, standards-release migration material, compatibility rules, or transition checks. (standards/rule/core-authoring.exclude-historical-transition-material)

Each standards release states its complete contract. Do not add compatibility, migration, deprecation, or alias work between standards releases. (standards/rule/core-authoring.publish-each-release-as-a-complete-contract, standards/rule/core-authoring.exclude-cross-release-compatibility-work)

A consumer keeps a pinned release for as long as that consumer chooses. (standards/rule/core-authoring.keep-a-pinned-release-for-as-long-as-it-serves)

A consumer records the release it reviewed in `reviewedStandardsVersion`. (standards/rule/core-authoring.record-the-reviewed-standards-release)

`standards/rule/core-authoring.exclude-cross-release-compatibility-work` covers standards releases only. Consumer product API compatibility, migration, and rollback provisions still apply. (standards/rule/core-authoring.exclude-cross-release-compatibility-work)

## Context Loading

1. Read the consumer `AGENTS.md` and `standards.project.json`. (standards/rule/core-agent.load-context-by-tier)
2. Read the active use-case specification before changing observable behavior. (standards/rule/core-agent.read-active-behavior-specifications)
3. Select the narrowest task under `loadPlans` in the manifest. (standards/rule/core-agent.select-task-context)
4. Read its Tier 1 Agent Summary sections. (standards/rule/core-agent.load-context-by-tier)
5. Read Tier 2 before generating files or changing public boundaries. (standards/rule/core-agent.escalate-from-summary-to-full-document)
6. Read selected project extensions and locally applicable extensions. (standards/rule/core-agent.load-applicable-extensions, standards/rule/core-system.select-extensions-before-applying-them)
7. Inspect neighboring consumer files after loading the applicable standard. (standards/rule/core-agent.inspect-local-examples-after-standards)

Do not load unrelated conventions or inactive extensions. (standards/rule/core-agent.load-applicable-extensions, standards/rule/core-system.select-extensions-before-applying-them)

## Source Precedence

Apply guidance in this order: consumer override, baseline-replacing extension, selected profile, then core page. (standards/rule/core-agent.apply-guidance-precedence)

A named local convention can replace a baseline convention. Stop when requirements conflict without declared precedence. (standards/rule/core-agent.apply-guidance-precedence, standards/rule/core-agent.stop-on-unresolved-conflict)

Quote both conflicting IDs and paths when requesting a decision. (standards/rule/core-agent.stop-on-unresolved-conflict)

## Editing Protocol

1. Confirm the requested scope and affected repositories. (standards/rule/core-agent.make-coherent-scoped-changes)
2. Read `git status` and preserve unrelated work. (standards/rule/core-agent.inspect-existing-work-before-editing)
3. Load the active specification and applicable extensions. (standards/rule/core-agent.load-applicable-extensions, standards/rule/core-agent.read-active-behavior-specifications)
4. Check the manifest before changing dependencies. (standards/rule/workspace-dependencies.pin-every-dependency-centrally, standards/rule/workspace-dependencies.approve-new-packages-explicitly)
5. Match compliant neighboring patterns. (standards/rule/core-agent.inspect-local-examples-after-standards)
6. Change documentation, code, tests, contracts, and operations as one unit. (standards/rule/core-agent.update-behavior-records-with-code)

Do not add an unauthorized package, schema migration, authentication change, public break, or external side effect. (standards/rule/core-agent.inspect-existing-work-before-editing)

## Version Handling

The standards manifest carries a `version` field. The actual current version is the highest git tag in this repository. The agent reads the highest tag before assuming a version. It sets the manifest to the next release being prepared. It adds new `CHANGELOG.md` entries to the topmost entry under that release's heading. (standards/rule/core-maintaining.publish-a-standards-release-from-a-tag)

A consumer template's `reviewedStandardsVersion` field is set to the latest released tag, never higher. Aspirational `CHANGELOG.md` entries for un-released versions move below the current release. (standards/rule/core-maintaining.record-the-release-a-consumer-adopts)

## High-Risk Boundaries

- Use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as the application projects. (standards/rule/backend-architecture.use-five-application-projects)
- Place a type at the lowest folder holding every consumer that names it. (standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers)
- Keep Domain independent from persistence, web, mediator, logging, and dependency injection. (standards/rule/backend-architecture.point-dependencies-inward)
- Model aggregate lifecycles with an abstract state and sealed state records. (standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)
- Model Domain closed sets as record hierarchies, never enums. (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
- Give each layer ownership of its messages, results, and transport models. (standards/rule/backend-architecture.own-each-layers-contract-types)
- Give each rejected Domain rule its own exception type and stable failure code. (standards/rule/backend-domain.reject-business-violations-with-domain-exceptions)
- Organize each layer by the same modules, aggregates, and use cases. (standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case)
- Write commands through repositories and commit through the command pipeline. (standards/rule/backend-application.keep-command-handlers-narrow, standards/rule/backend-persistence.commit-once-in-the-command-pipeline)
- Derive authenticated actors from verified claims and authorize target resources. (standards/rule/backend-api.derive-authenticated-identity-from-claims, standards/rule/backend-api.authorize-the-target-resource)
- Use the controlled shadcn/ui baseline for React web frontends. (standards/rule/frontend-ui.select-one-visual-authority, standards/rule/frontend-ui.use-the-pinned-shadcnui-baseline)

Read the full cited provisions before applying these boundaries. (standards/rule/core-agent.select-task-context)

## Repository Verification

Run these checks for the standards repository. (standards/rule/core-authoring.run-repeatable-authoring-checks)

```bash
node tools/validate-standards.cases.mjs
node tools/generate-provisions.mjs
node tools/validate-standards.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
git diff --check
```

The standards validator checks current schemas, manifest references, provision IDs, page contracts, links, prose, summaries, and evidence mappings. (standards/rule/core-authoring.run-repeatable-authoring-checks, standards/rule/core-authoring.validate-current-standards-material)

Run extension-specific checks when their rules, schemas, templates, or validators change. (standards/rule/core-release.run-boundary-selected-checks)

## Consumer Verification

`standards/rule/quality-ci.run-applicable-gates-on-every-pull-request` in [continuous integration](docs/quality/ci.md) owns the exact consumer gate commands. Run the gates its table selects for each changed area. (standards/rule/core-release.run-boundary-selected-checks, standards/rule/quality-ci.run-applicable-gates-on-every-pull-request)

Run the reference validators from the consumer root, then Playwright for affected browser flows and every applicable extension check. (standards/rule/core-release.run-boundary-selected-checks)

```bash
node standards/tools/validate-consumer.mjs
node standards/tools/validate-ui.mjs
```

## Completion

Run every applicable check and compare observable behavior with the active use case. (standards/rule/core-agent.run-and-report-verification)

Inspect generated differences and report exact commands, results, evidence scope, and skipped checks. (standards/rule/core-agent.run-and-report-verification, standards/rule/core-release.report-verification-exactly)

Leave no placeholder implementation, `TODO`, or untracked generated output. (standards/rule/core-release.complete-observable-use-case-slices, standards/rule/core-release.regenerate-application-contracts)
