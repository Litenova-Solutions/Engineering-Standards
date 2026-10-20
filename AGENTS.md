# LiteSpec Agent Protocol

Read this file before you change the LiteSpec repository or a consumer application. It summarizes the provisions that govern agent work. Each section ends with the provisions it draws on, and the provision wins wherever this file is shorter.

## What LiteSpec covers

LiteSpec 2.0.0 is the contract for one bounded-context business application. A project names one size (small or large), one shape (server or client-only) and its stacks: one backend stack for a server project, and one stack per frontend.

A stack is a folder with a `stack.md` page: `docs/backend/dotnet/`, `docs/frontend/web/react/`, `docs/frontend/web/svelte/` and `docs/frontend/blazor/`. Selecting a stack applies its folder, every folder above it, and their subfolders that hold no stack. An extension applies only when the project selects it.

`litespec.manifest.json` lists the stacks, shapes, extensions and pinned versions. `docs/README.md` is the human index. A provision ID is `litespec/<page>#<slug>`, the heading `<slug>` on `docs/<page>.md`, and `docs/reference/provisions.md` lists them all.

Sources: `litespec/core/scope#keep-one-bounded-context`, `litespec/core/scope#select-a-size-a-shape-and-stacks`, `litespec/core/stacks#apply-the-complete-stack`, `litespec/core/scope#select-conditional-extensions-explicitly`, `litespec/core/authoring#use-the-declared-identifier-grammar`.

## Which repository you are in

| Repository | You change | You run |
|:---|:---|:---|
| LiteSpec | The standard (`docs/`, `schemas/`, `templates/`, the manifest) and the CLI in `apps/cli/` | `litespec validate`, `litespec provisions`, `litespec patterns check`, the tests |
| A consumer | Its records, code, tests and contracts, against the LiteSpec release it pins at `litespec/` | `litespec consumer`, `litespec ui`, `litespec model`, and the gates its CI selects |

In this repository, run the CLI with `dotnet run --project apps/cli/src/LiteSpec.Cli -- <command>`. The [command index](docs/tools/README.md) shows how to run it from a consumer.

## Loading context

In a consumer:

1. Read the consumer's `AGENTS.md` and `litespec.project.json`.
2. Find the records the task touches with `litespec model query <id>`, read their generated context, then the records themselves.
3. Before you generate files or change a public boundary, read the full standards pages those records cite.
4. Before you edit inside an extension's boundary, read the extension.
5. Then look at neighboring files and follow a local pattern that complies.

In this repository, read the [authoring standard](docs/core/authoring.md) and the whole page you're changing first.

Don't load conventions the task doesn't touch, or extensions the project hasn't selected.

Sources: `litespec/core/agent#select-task-context`, `litespec/core/agent#read-the-full-record-before-changing-a-boundary`, `litespec/core/agent#load-applicable-extensions`, `litespec/core/agent#inspect-local-examples-after-standards`.

## Precedence

When guidance overlaps, apply it in this order: a project Exception record, a selected extension's replacement, a deeper page, then a shallower page. An Exception record carries a reason and a review date.

If two requirements conflict and nothing above decides, stop. Quote both provision IDs and their paths, and ask for a decision.

Sources: `litespec/core/agent#apply-guidance-precedence`, `litespec/core/agent#stop-on-unresolved-conflict`.

## Making a change

1. Confirm the scope of the request and which repositories it touches.
2. Read `git status` and leave unrelated work alone.
3. Check the manifest before you change a dependency. Add a package only with approval.
4. Change the records, code, tests, contracts and operations that belong together in one change.
5. Keep your working files under `.agents/`.

Don't add an unapproved package, schema migration, authentication change, public break or external side effect.

Sources: `litespec/core/agent#make-coherent-scoped-changes`, `litespec/core/agent#inspect-existing-work-before-editing`, `litespec/workspace/dependencies#approve-new-packages-explicitly`, `litespec/core/system#update-records-with-behavior`, `litespec/core/agent#keep-agent-working-files-under-agents`, `litespec/core/agent#restrict-unapproved-side-effects`.

## Writing

Write prose the way the [Google developer documentation style guide](https://developers.google.com/style) says, plus the few rules the [authoring standard](docs/core/authoring.md) adds: ASCII only, one term per concept, capitalized modal words only inside a Standard's Requirement, and nothing about earlier releases.

Each page uses the sections of its page style. A Standard states one testable obligation. When you rename a provision, replace every citation of the old ID in the same change.

Sources: `litespec/core/authoring#follow-the-google-developer-documentation-style-guide`, `litespec/core/authoring#use-the-declared-page-contract`, `litespec/core/authoring#write-atomic-standards-provisions`, `litespec/core/maintaining#replace-every-citation-on-a-rename`.

## Releases

Each LiteSpec release is a complete contract. Don't add compatibility, migration, deprecation or alias work between LiteSpec releases, and keep no history-specific paths, IDs or transition checks. That rule covers LiteSpec's own releases only: a consumer product's API compatibility, migration and rollback provisions still apply.

The highest git tag is the current release. The manifest, `CHANGELOG.md` and the consumer template carry the release being prepared, and tagging it makes it current. A consumer keeps a pinned release for as long as it wants and records it in `reviewedLiteSpecVersion`.

Sources: `litespec/core/authoring#publish-each-release-as-a-complete-contract`, `litespec/core/authoring#exclude-cross-release-compatibility-work`, `litespec/core/authoring#exclude-historical-transition-material`, `litespec/core/maintaining#publish-a-litespec-release-from-a-tag`, `litespec/core/authoring#record-the-reviewed-litespec-release`.

## High-risk boundaries

Read the full provision before you apply any of these:

- Use Domain, Application.Abstractions, Application, Infrastructure and WebApi as the application projects. (`litespec/backend/dotnet/architecture#use-five-application-projects`)
- Put a type in the lowest folder that holds every consumer naming it. (`litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`)
- Keep Domain free of persistence, web, mediator, logging and dependency injection. (`litespec/backend/architecture#point-dependencies-inward`)
- Model each aggregate lifecycle with an abstract state and sealed state records. (`litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records`)
- Model each closed set in Domain as a record hierarchy, never an enum. (`litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`)
- Give each layer its own messages, results and transport models. (`litespec/backend/architecture#own-each-layers-contract-types`)
- Give each rejected Domain rule its own exception type and stable failure code. (`litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions`)
- Organize every layer by the same modules, aggregates and use cases. (`litespec/backend/architecture#organize-every-layer-by-module-and-use-case`)
- Write commands through repositories, and commit once in the command pipeline. (`litespec/backend/application#keep-command-handlers-narrow`, `litespec/backend/persistence#commit-each-command-pipeline-once`)
- Derive the actor from verified claims, and authorize each target from declared permissions. (`litespec/backend/application#enforce-target-authorization-in-the-pipeline`)
- Use the controlled shadcn/ui baseline for React and the shadcn-svelte baseline for Svelte. (`litespec/frontend/ui#select-one-visual-authority`, `litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package`)

## UI patterns

A consumer keeps one pattern catalog. Each entry starts from a LiteSpec pattern in `docs/frontend/patterns/`, cites it by ID, and records the chosen option and who chose it.

To help an owner choose, show the options with `litespec patterns preview <group>` and recommend one. Then build the chosen option from its wireframe text with the project's own components, style and design system.

If you see how a pattern could be better, finish the task on the chosen option and put the proposal in your completion report. Never change a decision yourself, and never stop mid-task to ask. A proposal that isn't specific to one product goes to the LiteSpec pattern page once the owner accepts it.

Sources: `litespec/frontend/patterns#keep-one-pattern-catalog`, `litespec/frontend/patterns#start-from-a-litespec-pattern`, `litespec/frontend/patterns#record-who-chose`, `litespec/frontend/patterns#keep-a-visual-registry`, `litespec/frontend/patterns#report-pattern-feedback-after-the-work`, `litespec/frontend/patterns#promote-pattern-improvements`.

## Verification

In this repository, run these before a change is done:

```bash
dotnet build LiteSpec.slnx
dotnet test --solution LiteSpec.slnx
dotnet run --project apps/cli/src/LiteSpec.Cli -- provisions
dotnet run --project apps/cli/src/LiteSpec.Cli -- validate
git diff --check
```

`litespec validate` checks schemas, manifest references, provision IDs, page contracts, pattern pages and their wireframes, links and verification marks.

In a consumer, run the gates that the job table in [continuous integration](docs/quality/ci.md) selects for each changed area, Playwright for the browser flows the change affects, and the checks of every selected extension.

Sources: `litespec/core/authoring#run-repeatable-authoring-checks`, `litespec/quality/ci#run-applicable-gates-on-every-pull-request`, `litespec/core/release#run-boundary-selected-checks`.

## Finishing

Compare what the change does with the active records. Report each exact command, its result, what the evidence covers, and every check you skipped with the reason.

Leave no placeholder implementation, `TODO` or untracked generated output.

Sources: `litespec/core/release#report-verification-exactly`, `litespec/core/system#deliver-one-complete-use-case`, `litespec/core/release#regenerate-application-contracts`.
