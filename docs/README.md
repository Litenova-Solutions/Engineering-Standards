# LiteSpec Documentation

## Intent

LiteSpec is a standard for building one business application from written rules that tools check, and this index lists every page of that standard grouped by the area it governs. Developers and agents open it at the start of a task to find the page that states the rules for that task. A project applies only the folders named by its selection in `litespec.project.json` (its size, shape, technology stacks, and extensions), so most readers need only a few groups. Readers who are new to LiteSpec start with the [Learn overview](learn/README.md).

## Which page do you want

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
- [How LiteSpec Works](learn/how-litespec-works.md): the standard, the records, the model, and the tools, traced through one Expenses use case.
- [Read the Standard](learn/reading-the-standard.md): project selections, page arrangement, and provision IDs; how to find the rules that apply to a project.
- [Records and the Project Model](learn/records-and-the-model.md): what a project writes down, and what the model builder works out from the code.
- [How the Tools Fit Together](learn/the-tooling.md): the CLI, the analyzers, and the site, in the order one change moves through them.
- [How LiteSpec Compares](learn/how-litespec-compares.md): LiteSpec beside ten other approaches to spec-driven development, and when each fits.
- [Work with Agents](learn/working-with-agents.md): how an agent finds the rules, what it decides alone, and what it brings back.
- [Adopt LiteSpec](learn/adopting-litespec.md): what changes for a team, in the order teams usually do it.

## Example

One product worked end to end, from its first record to a passing check.

- [Example overview](example/README.md): the Expenses product the example follows, and the reading order for its pages.
- [The Expenses Product](example/the-product.md): the product brief, requirements, decision, and constraint, shown as the records a project writes.
- [Modules and Records](example/modules-and-records.md): the spending module, its business records and rules, and the Submit expense use case that ties them together.
- [A Use Case in Code](example/a-use-case-in-code.md): Submit expense from its record into .NET code, tests, and scenarios.
- [The Expenses Screen](example/the-screen.md): the expenses list route, its reads through the generated client, and the UI pattern it starts from.
- [The Model and Its Checks](example/model-and-checks.md): what the model commands report, with real output, and which CI jobs run them.

## Core

- [Core overview](core/README.md): the system all projects share, and how its pages fit together.
- [LiteSpec](core/system.md): what LiteSpec coordinates and the parts it combines.
- [Supported Scope](core/scope.md): the one size, one shape, and stacks each project selects.
- [Technology Stacks](core/stacks.md): what selecting a stack applies, and what each stack folder holds.
- [Engineering Principles](core/principles.md): the rules of thumb for choices no narrower rule covers.
- [Project Model](core/model.md): the record types, their links, and what the builder computes.
- [Product Intent](core/product.md): where a consumer states its business intent and in what form.
- [Agent Operating Protocol](core/agent.md): how agents select context, resolve standards, and report completion.
- [Authoring Standard](core/authoring.md): page styles, provision contracts, identifiers, and prose style; what `litespec validate` checks.
- [Maintaining the Standards](core/maintaining.md): the maintainer manual for provision lifecycle, renames, citations, and releases.
- [Product Release](core/release.md): what a release joins to its evidence, and what a maintainer operates.

## Workspace

- [Workspace overview](workspace/README.md): the shared repository shape, and how its pages fit together.
- [Workspace Structure](workspace/structure.md): the canonical monorepo tree for applications, packages, docs, and tests.
- [Naming and Code Style](workspace/naming.md): names, suffixes, and file conventions that expose intent and role.
- [Dependencies](workspace/dependencies.md): layer dependencies, package ownership, and approval of new packages.
- [Configuration](workspace/config.md): version pins, compiler rules, environment access, and secret handling.

## Backend

These principles hold for every backend. A backend stack folder states how its technology realizes them.

- [Backend overview](backend/README.md): the principles every backend shares and the stacks that realize them.
- [Backend Architecture](backend/architecture.md): the five-part modular monolith, CQRS, modules, and use cases.
- [Domain Layer](backend/domain.md): the business model, aggregate invariants, and lifecycle state types.
- [Application Layer](backend/application.md): use-case coordination, input validation, and transport-neutral results.
- [Persistence](backend/persistence.md): aggregate storage through repositories and the transaction boundary.
- [HTTP API](backend/api.md): the thin transport adapter between HTTP and Application messages.
- [Backend Testing](backend/testing.md): test boundaries from Domain behavior to architecture.
- [Record Identifiers](backend/identifiers.md): the one identifier form per record type.

## .NET stack

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
- [Frontend Structure](frontend/structure.md): frame, routes, and use-case modules; the module tree that mirrors the backend.
- [Frontend Rendering and Routes](frontend/rendering.md): route addresses, data needs, and floorplans.
- [Frontend Components](frontend/components.md): the one shared UI package and composition in page code.
- [Controlled UI Governance](frontend/ui.md): the constrained construction language: primitives, behavior, layout, and tokens.
- [UI Patterns](frontend/patterns.md): the catalog that decides each recurring interface question once.
- [Frontend Data and State](frontend/data.md): the generated client, the query cache, and command writes.
- [Frontend Testing](frontend/testing.md): test kinds at the cheapest boundary that represents the risk.

## Web

The TypeScript web pages the React and Svelte stacks share. This folder is a group, not a stack: no project selects it directly.

- [Web Structure](frontend/web/structure.md): the toolchain, folders, and commands the web stacks share.
- [Web Rendering and Routes](frontend/web/rendering.md): loaders, queries, router files, and tooling.
- [TypeScript Web Components](frontend/web/components.md): the registry source, the closed element list, and visual file patterns.
- [Web UI](frontend/web/ui.md): the toolchain, registry, tokens, and suites for a web frontend.
- [Web UI Patterns](frontend/web/patterns.md): the React and Svelte bindings and widths for pattern implementations.
- [Web Data and State](frontend/web/data.md): the generated client, query cache behavior, and tooling.
- [Web Testing](frontend/web/testing.md): the runners, libraries, and commands for a web frontend.

## React stack

- [React Stack](frontend/web/react/stack.md): the React binding and its three rendering modes.
- [React Components](frontend/web/react/components.md): function components with typed boundaries.

## Svelte stack

- [Svelte Stack](frontend/web/svelte/stack.md): the Svelte binding and its three rendering modes.
- [Svelte Components](frontend/web/svelte/components.md): rune state with typed boundaries.

## Blazor stack

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
- [API Compatibility](ext/compat.md): keeping independently deployed consumers working across API changes.
- [Caching](ext/cache.md): measurement, staleness contracts, and recovery for cached reads.
- [Concurrency and Idempotency](ext/concurrency.md): overlapping writes and duplicate execution after retries.
- [Data Lifecycle](ext/lifecycle.md): retention, deletion, archival, and restore behavior.
- [Container Deployment](ext/containers.md): image and rollout requirements for hosted environments.
- [External Integrations](ext/integrations.md): provider isolation, failure mapping, and network boundary tests.
- [Audit Trail](ext/audit.md): evidence of who attempted what against which target, and what it produced.
- [Localization](ext/locale.md): locale-aware routes, messages, formatting, metadata, and tests.
- [Model Context Protocol](ext/mcp.md): presenting the product API to an outside LLM client.
- [Multitenancy](ext/tenancy.md): tenant identity across authorization, storage, jobs, and recovery.
- [Outbox Worker](ext/outbox.md): one-transaction business commits with dispatched outgoing messages.
- [Realtime Updates](ext/realtime.md): realtime transport where polling cannot meet an accepted requirement.
- [Reporting and Exports](ext/report.md): complex joins, analysis, and large exports off the request path.
- [Scheduled Jobs](ext/jobs.md): recurring and delayed jobs independent of HTTP requests.
- [Static Marketing Site](ext/site.md): the serverless public site build and what each page carries.
- [Release Stage](ext/stage.md): the pre-deployment stage, what it defers, and the promotion that ends it.
- [Agent Delegation](ext/delegation.md): briefs, containment, and acceptance checks for a fleet of agents.

## Guides

Tutorials take a reader to a first working result; how-to guides solve one stated problem in a running project.

- [Guides overview](guide/README.md): which to read when: tutorials for a first result, how-to guides for one goal.
- [Start a Consumer Repository](tutorial/getting-started.md): start a small consumer repository through one implemented use case.
- [Model a Domain Module](tutorial/model-domain.md): model one spending module the builder reads.
- [Build an Audit Trail](guide/audit-trail.md): the audit extension on the .NET LiteBus pipeline, step by step.

## CLI

- [CLI overview](tools/README.md): every shipped command with its arguments, options, and exit codes.
- [Initialize Consumer](tools/init.md): `litespec init` starts a consumer repository from a preset.
- [Validate Standards](tools/validate.md): `litespec validate` holds the LiteSpec repository to its authoring contract.
- [Generate Provisions](tools/provisions.md): `litespec provisions` writes the provision index.
- [Validate Consumer](tools/consumer.md): `litespec consumer` holds a consumer to its pinned release.
- [Validate Controlled UI](tools/ui.md): `litespec ui` checks a controlled web frontend against the UI contract.
- [Model Builder](tools/model.md): `litespec model` builds, checks, renders, and queries the project model.
- [Book](tools/book.md): `litespec book` turns `model.json` into a browsable site.
- [Draw Patterns](tools/patterns.md): `litespec patterns` draws, prints, and checks pattern wireframes.

## Analyzers

The Roslyn analyzers that report LiteSpec rule breaks as compiler diagnostics on .NET code.

- [Analyzers overview](analyzers/README.md): what the analyzers check, how a rule runs, and where each rule is documented.
- [Check .NET Code with the Analyzers](analyzers/check-dotnet-code-with-the-analyzers.md): run the Roslyn analyzers and fix or record each finding.
- [Analyzer rules overview](analyzers/rules/README.md): the 20 rules grouped by layer, each linked.

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
