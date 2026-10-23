# LiteSpec Documentation

## Intent

LiteSpec is a standard for building one business application from written rules that tools check, and this index lists every page of that standard grouped by the area it governs. Developers and agents open it at the start of a task to find the page that states the rules for that task. A project applies only the folders named by its selection in `litespec.project.json` (its size, shape, technology stacks, and extensions), so most readers need only a few groups. Readers who are new to LiteSpec start with the [Learn overview](learn/README.md).

## Which Page Do You Want

An **explanation** describes what LiteSpec is and how its parts fit, for a reader who is learning. Start with the [Learn overview](learn/README.md) when LiteSpec is new to you.
A **tutorial** takes you to a first working result, one step at a time.
A **how-to** solves one stated problem for a reader whose project already runs.
A **reference** lists exact values, options, and defaults for lookup.
A **command** page documents one command: its options, its exit codes, and what it runs underneath.
A standards page states the provisions a reader cites for one concern.

A project applies only some folders below. [Read the Standard](learn/reading-the-standard.md) explains which folders a selection applies and how a provision ID cites one rule.

## Learn

- [Learn overview](learn/README.md): the reading order for the explanation pages.
- [Why LiteSpec Exists](learn/why-litespec.md): the problem LiteSpec solves, for a team that is deciding whether LiteSpec fits.
- [How LiteSpec Works](learn/how-litespec-works.md): the standard, the records, the model, and the tools, traced through one Claimwick use case.
- [Read the Standard](learn/reading-the-standard.md): project selections, page arrangement, and provision IDs; how to find the rules that apply to a project.
- [Records and the Project Model](learn/records-and-the-model.md): the four layers, what a project writes down, who reviews each layer, and what the model builder computes.
- [Reading Tracks](learn/reading-tracks.md): which records to read in which order: why before how, one journey end to end, one module end to end, and the structural words.
- [How the Tools Fit Together](learn/the-tooling.md): the CLI, the analyzers, and the site, in the order one change moves through them.
- [How LiteSpec Compares](learn/how-litespec-compares.md): LiteSpec beside ten other approaches to spec-driven development, and when each fits.
- [Lineage](learn/lineage.md): the practices LiteSpec borrows from, the words it takes from each, and what it does differently.
- [Work with Agents](learn/working-with-agents.md): how an agent finds the rules, what it decides alone, and what it brings back.
- [Adopt LiteSpec](learn/adopting-litespec.md): what changes for a team, in the order teams usually do it.

## Example

One product worked end to end, from its first record to a passing check.

- [Example overview](example/README.md): the Claimwick product the example follows, and the reading order for its pages.
- [The Claimwick Product](example/the-product.md): the Intent records: brief, goal, problem, feature, requirements, research, decision, constraint, and journey.
- [Modules and Records](example/modules-and-records.md): the Behavior records: module, aggregates, rules, access chain, use cases, and the reaction, jobs, notifications, and setting around them.
- [A Use Case in Code](example/a-use-case-in-code.md): Submit expense from its record into .NET code and tests.
- [The Claimwick Screen](example/the-screen.md): the expenses list screen, the generated client it reads through, and the UI pattern it starts from.
- [The Model and Its Checks](example/model-and-checks.md): model build, check, and query runs, the book chapter and ballots, the diffs, and the CI jobs that run the checks.

## Core

- [Core overview](core/README.md): the system all projects share, and how its pages fit together.
- [LiteSpec](core/system.md): what LiteSpec coordinates and the parts it combines.
- [Supported Scope](core/scope.md): the size, shape, and stacks each project selects, with review and adoption settings.
- [Technology Stacks](core/stacks.md): what selecting a stack applies, and what each stack folder holds.
- [Engineering Principles](core/principles.md): the rules of thumb for choices no narrower rule covers.
- [Project Model](core/model.md): the four layers, the record types, their links, statuses, approval, questions, checks, and the book and diffs.
- [Intent Layer](core/intent.md): where a consumer states why it exists and what it promises, and what Intent never holds.
- [Behavior Records](core/behavior.md): how the system behaves to keep the promises: modules, aggregates, rules, events, use cases, reactions, jobs, notifications, and settings.
- [Access](core/access.md): the actors, roles, permissions, access each use case declares, entry points, and external systems.
- [Agent Operating Protocol](core/agent.md): how agents select context, write below decided Intent, raise questions, and report completion.
- [Authoring Standard](core/authoring.md): page styles, provision contracts, identifiers, and prose style; what `litespec validate` checks.
- [Maintaining the Standards](core/maintaining.md): the maintainer manual for provision lifecycle, renames, citations, and releases.
- [Product Release](core/release.md): who reviews each diff, how tiers and the veto window work, which checks each boundary runs, and what the release record lists.

## Workspace

- [Workspace overview](workspace/README.md): the shared repository shape, and how its pages fit together.
- [Workspace Structure](workspace/structure.md): the canonical monorepo tree for applications, packages, docs, and tests.
- [Naming and Code Style](workspace/naming.md): names, suffixes, and file conventions that expose intent and role.
- [Dependencies](workspace/dependencies.md): layer dependencies, package ownership, and approval of new packages.
- [Configuration](workspace/config.md): version pins, compiler rules, environment access, and secret handling.

## Backend

These principles hold for every backend. A backend stack folder states how its technology realizes them.

- [Backend overview](backend/README.md): the principles every backend shares and the stacks that realize them.
- [Backend Architecture](backend/architecture.md): the five layers, the direction references point, and the modules and use cases that organize every layer.
- [Domain Layer](backend/domain.md): aggregates, lifecycles, closed value sets, and repositories, and what Domain never references.
- [Application Layer](backend/application.md): use-case coordination, pipeline stages, ports, and event reactions.
- [Persistence](backend/persistence.md): repositories, the read session, the one commit per command, and the obligations on stored data.
- [HTTP API](backend/api.md): endpoints, routes, errors, collection paging, and the generated OpenAPI contract.
- [Backend Testing](backend/testing.md): the test suites each project size keeps and what each suite may use.
- [Record Identifiers](backend/identifiers.md): the identifier form for each record type and how citations resolve.

## .NET Stack

- [.NET Stack](backend/dotnet/stack.md): what the .NET backend binding covers and what the builder reads.
- [.NET Architecture](backend/dotnet/architecture.md): five projects and explicit composition roots.
- [.NET Domain Layer](backend/dotnet/domain.md): the C# types, references, and tooling for the Domain project.
- [.NET Application Layer](backend/dotnet/application.md): LiteBus dispatch and validity reporting.
- [.NET Persistence](backend/dotnet/persistence.md): the Marten baseline provider rules.
- [.NET HTTP API](backend/dotnet/api.md): endpoint classes and build-time OpenAPI generation.
- [.NET Testing](backend/dotnet/testing.md): xUnit, WebApplicationFactory, and the shared harness.
- [.NET Workspace](backend/dotnet/workspace.md): solutions and project files in the workspace tree.
- [.NET Naming and Code Style](backend/dotnet/naming.md): C# file, async method, and implementation style rules.
- [.NET Packages](backend/dotnet/packages.md): project references and NuGet central management.
- [.NET Configuration](backend/dotnet/config.md): SDK, build, package, and tool pins in MSBuild files.
- [EF Core Persistence](backend/dotnet/ext/efcore.md): the Entity Framework Core form of read, query, and mapping rules; an extension for this stack.
- [Executable BDD Acceptance Tests](backend/dotnet/ext/bdd.md): executable scenarios in Reqnroll or LightBDD; an extension for this stack.

## Frontend

These principles hold for every frontend, including the Blazor stack and a native client.

- [Frontend overview](frontend/README.md): the principles every frontend shares and the stacks that realize them.
- [Frontend Structure](frontend/structure.md): frame, routes, and use-case modules, and the module tree that mirrors the backend.
- [Frontend Rendering and Routes](frontend/rendering.md): route addresses, data loading, and how each route state renders.
- [Frontend Components](frontend/components.md): the shared UI package and how page code composes its parts.
- [Controlled UI Governance](frontend/ui.md): the visual authority, the design contract, the floorplans, and the route suite.
- [UI Patterns](frontend/patterns.md): the catalog that decides each recurring interface question once.
- [Frontend Data and State](frontend/data.md): the generated client, the query cache, command writes, and how failures reach the reader.
- [Frontend Testing](frontend/testing.md): unit tests, browser suites, and the contract check for every address.

## Web

The TypeScript web pages the React and Svelte stacks share. This folder is a group, not a stack: no project selects it directly.

- [Web Structure](frontend/web/structure.md): the folders, toolchain, import direction, and commands both stacks share.
- [Web Rendering and Routes](frontend/web/rendering.md): loaders, validated search, chunk splitting, and per-request caching.
- [TypeScript Web Components](frontend/web/components.md): the registry source, the closed element list, and the shared route checks.
- [Web UI](frontend/web/ui.md): the pinned baseline, tokens, registry, and browser suites for shared UI.
- [Web UI Patterns](frontend/web/patterns.md): one implementation per platform for each chosen pattern.
- [Web Data and State](frontend/web/data.md): the generated client, failure mapping, cache updates, and state ownership.
- [Web Testing](frontend/web/testing.md): Vitest beside the module and Playwright against a running stack.

## React Stack

- [React Stack](frontend/web/react/stack.md): the React binding and its three rendering modes.
- [React Components](frontend/web/react/components.md): function components with typed boundaries.

## Svelte Stack

- [Svelte Stack](frontend/web/svelte/stack.md): the Svelte binding and its three rendering modes.
- [Svelte Components](frontend/web/svelte/components.md): rune state with typed boundaries.

## Blazor Stack

The Blazor stack serves a product that has no server of its own.

- [Blazor Stack](frontend/blazor/stack.md): the client-side domain model, browser persistence, and WebAssembly application.
- [Blazor Structure](frontend/blazor/structure.md): pages, feature folders, and shared folders around modules and use cases.
- [Blazor Rendering and Routes](frontend/blazor/rendering.md): browser-only rendering, route templates, and offline behavior.
- [Blazor Components](frontend/blazor/components.md): components that render what they are given and report what the user did.
- [Blazor Data and State](frontend/blazor/data.md): use-case execution, state classification, and explicit failure.
- [Browser Persistence](frontend/blazor/browser.md): the versioned, migratable adapter over browser storage, with export.
- [Blazor Testing](frontend/blazor/testing.md): the four test projects for the four client boundaries.

## Quality

- [Quality overview](quality/README.md): what every release proves beyond behavior, and how its pages fit together.
- [Security](quality/security.md): identity, permissions, data classification, and trust transitions.
- [Operations](quality/operations.md): observability, deployability, recovery, and support by one maintainer.
- [Continuous Integration](quality/ci.md): the gates each pull request runs for its changed areas.

## Extensions

This folder holds extensions any stack can select. An extension for one stack sits in that stack's `ext/` folder and is listed with the stack.

- [Extensions overview](ext/README.md): activation criteria and how a consumer selects an extension.
- [API Compatibility](ext/compat.md): versioning and retirement for APIs with public, partner, mobile, or independently deployed consumers.
- [Caching](ext/cache.md): staleness contracts and recovery for a repeated expensive read that traces or load tests name.
- [Concurrency and Idempotency](ext/concurrency.md): versions, client keys, and fingerprints where writes can overlap or retries can duplicate an effect.
- [Data Lifecycle](ext/lifecycle.md): retention, deletion, archival, and restore behavior for records with a lifetime duty.
- [Container Deployment](ext/containers.md): images, rollouts, and runtime limits where staging or production ships containers.
- [External Integrations](ext/integrations.md): provider isolation, failure mapping, and boundary tests for use cases that call outside systems.
- [Audit Trail](ext/audit.md): tamper-resistant evidence of who attempted what in data another party owns.
- [Localization](ext/locale.md): locales, catalogs, and formatting for a product that ships in more than one locale.
- [Model Context Protocol](ext/mcp.md): the server a product ships so an LLM client can call its public API.
- [Multitenancy](ext/tenancy.md): tenant isolation across authorization, storage, jobs, and recovery for one shared deployment.
- [Plans and Entitlements](ext/plans.md): plans, entitlements, and feature gating for a product that sells tiers.
- [Outbox Worker](ext/outbox.md): one-transaction commits with dispatched messages where delivery must survive process failure.
- [Realtime Updates](ext/realtime.md): live transport where measured polling cannot meet the update target.
- [Reporting and Exports](ext/report.md): heavy queries and large exports moved off the request path.
- [Scheduled Jobs](ext/jobs.md): recurring, delayed, and calendar-based work with leases that survive restarts.
- [Static Marketing Site](ext/site.md): the static build for marketing pages, pricing, and help articles beside the application.
- [Release Stage](ext/stage.md): the pre-customer-data stage, what it defers, and the promotion that ends it.
- [Agent Delegation](ext/delegation.md): briefs and containment for one agent starting another on the same tree.
- [Privacy](ext/privacy.md): erasure positions, requested reach, export-first guards, restore sweeps, and conflict rules in depth.
- [Devices](ext/devices.md): the entry-point protocol block: messages, version rule, client rules, nonce, and offline uploads.
- [Customer Automation](ext/automation.md): customer-composed rules and hooks with a may and may-not contract.
- [Workflow Engine](ext/workflow-engine.md): engine-carried processes where each step maps to one use case with its compensation.
- [Ingest Pipelines](ext/pipeline.md): ingest steps, drop reasons, and buffer policy.
- [Human Queues](ext/queues.md): human work queues: claim, score, preview, and confirm-by.
- [Model Assistance](ext/ai.md): model-mediated queries with a closed tools set, structure-only scenarios, and a pinned stub.

## Guides

Tutorials take a reader to a first working result; how-to guides solve one stated problem in a running project.

- [Guides overview](guide/README.md): which to read when: tutorials for a first result, how-to guides for one goal.
- [Start a Consumer Repository](tutorial/getting-started.md): start a small consumer repository through one implemented use case.
- [Model a Behavior Module](tutorial/model-domain.md): specify one spending module the builder reads.
- [Add a Svelte Frontend](guide/add-a-svelte-frontend.md): declare a Svelte frontend on the web stack.
- [Add a Blazor Frontend](guide/add-a-blazor-frontend.md): declare a Blazor frontend outside the controlled UI contract.
- [Build an Audit Trail](guide/audit-trail.md): the audit extension on the .NET LiteBus pipeline, step by step.

## CLI

- [CLI overview](tools/README.md): every shipped command with its arguments, options, and exit codes.
- [Initialize Consumer](tools/init.md): writes `litespec.project.json` for a new consumer from a preset.
- [Validate Standards](tools/validate.md): checks the standards pages, templates, and identifiers against the authoring contract.
- [Generate Provisions](tools/provisions.md): rebuilds the provision index from the active standards.
- [Validate Consumer](tools/consumer.md): checks a consumer's pages, project record, and vocabulary.
- [Validate Controlled UI](tools/ui.md): checks the shared UI package and each controlled web frontend.
- [Model Builder](tools/model.md): builds, checks, and diffs the project model, renders generated regions, and answers record queries.
- [Book](tools/book.md): builds the project book from `model.json`: journey chapters, record pages, and the ballots inbox.
- [Draw Patterns](tools/patterns.md): draws, prints, and checks the UI pattern wireframes.

## Analyzers

The Roslyn analyzers that report LiteSpec rule breaks as compiler errors on .NET code.

- [Analyzers overview](analyzers/README.md): what the analyzers check, how a rule runs, and where each rule is documented.
- [Check .NET Code with the Analyzers](analyzers/check-dotnet-code-with-the-analyzers.md): install the package once, read the first findings, and raise enforced rules to build errors.
- [Analyzer rules overview](analyzers/rules/README.md): find the reference page for each of the 25 rules, grouped by layer.

## Reference

- [Reference overview](reference/README.md): the exact values to look up, and which page holds each.
- [Glossary](reference/glossary.md): the one term for each LiteSpec concept.
- [Provisions](reference/provisions.md): every provision ID resolved to its heading, page, and mark.
- [Audit Obligations](reference/audit-obligations.md): the external obligations the audit extension satisfies.
- [Decision Records](reference/decision-records.md): where a decision record lives, what it holds, and how it ends.
- [Project File](reference/project-file.md): every field of `litespec.project.json` and what reads it.
- [Release Manifest](reference/manifest.md): every field of `litespec.manifest.json` and how to add a stack or extension.
- [Schemas](reference/schemas.md): every JSON schema, the file it validates, and the command that checks it.
- [Published URLs](reference/published-urls.md): every URL the site serves for agents and people.
- [Document templates](../templates/consumer/README.md): the starting files for each consumer record type.

Consumers pin a complete release. `CHANGELOG.md` describes the current release.
