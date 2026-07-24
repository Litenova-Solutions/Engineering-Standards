# Litenova Engineering Standards Agent Protocol

Read this file before changing this repository or a consumer application.

Version 1 covers one bounded-context business application built with ASP.NET Core, PostgreSQL, Marten, and optional Next.js frontends. The canonical human index is `docs/README.md`. Exact versions, profile composition, extensions, and task load plans live in `standards.manifest.json`.

## Writing Style (documentation and prose)

Write for experienced software engineers and agent authors who understand DDD, CQS, HTTP APIs, persistence, testing, and software operations.

- Use plain ASCII punctuation. Do not use em dashes, smart quotes, emoji, or decorative symbols.
- Lead with the exact rule or capability, then a concrete example, then constraints and explanation. Keep reference pages dense and precise.
- Prefer nouns and verbs over slogans or taglines. Headings name the concept or boundary.
- Do not use sales cadence, rhetorical fragments, filler jargon, or unsupported superlatives.
- Use established engineering terms for their technical meaning. Do not present DDD, CQS, workflow, aggregate, invariant, or agent concepts as branding.
- Define a repository-specific term in one plain sentence on first use. Explain each part of a compound term when the combination is not self-evident.
- Use Title Case for the root README and consumer-facing navigation. Use sentence case for normative rule headings and body text.
- Use exact, sourced numbers. Label illustrative examples as illustrative and do not present them as measurements.
- State limitations, excluded scope, and opt-in extension boundaries beside the related rule.
- Keep the root README short. Put detailed standards, adoption steps, and migration instructions in the hosted documentation and canonical repository documents.

## Documentation model

Each topic document separates:

- `Intent`: nonnormative explanation.
- `Agent Summary`: Tier 1 task context.
- `Standards`: required boundaries. Deviation requires a named override and decision.
- `Conventions`: default names, locations, and implementation patterns. A consumer may replace one with an explicit local convention.
- `Verification`: required evidence.

Canonical rule IDs appear in parentheses after human titles.

## Standards evolution

Treat this repository as an authored specification, not a runtime compatibility surface. Prefer the clearest current rule, vocabulary, template, and repository structure even when the edit requires consumer migration.

Do not preserve obsolete rule IDs, document paths, templates, aliases, or terminology solely for backward compatibility. Rename or remove them in the same change, update every current standards reference, and record required consumer work in the changelog and an upgrade guide. Historical changelogs, upgrade guides, and accepted decisions may name the removed contract. Version numbers identify standards releases; they do not promise backward compatibility.

## Context loading

1. Read the consumer root `AGENTS.md` and `standards.project.json`.
2. Read the active use-case specification before changing observable behavior.
3. Select the narrowest task under `loadPlans` in `standards.manifest.json`.
4. Read the listed Tier 1 `Agent Summary` sections.
5. Read Tier 2 before generating a file, changing a public boundary, or choosing between patterns.
6. Read every project-scoped extension selected by the consumer and every local extension applicable to the active specification.
7. Inspect neighboring consumer files after loading the applicable standard.

Do not load unrelated conventions or inactive extensions.

## Source precedence

Apply applicable guidance in this order:

1. Consumer override backed by a decision and named rule ID.
2. Applicable extension that names a baseline replacement.
3. Selected platform profile and its conventions.
4. Foundation standards.

An explicit consumer convention may replace a baseline convention. Stop when applicable requirements conflict without declared precedence. Quote both rule IDs and paths before requesting a decision.

## Before editing

1. Confirm the requested scope and affected repositories.
2. Read `git status` and preserve unrelated work.
3. Load the task context, active Use case, selected project extensions, and locally applicable extensions.
4. Check the manifest before changing dependencies.
5. Match compliant local patterns.
6. Plan documentation, code, tests, generated contracts, and operating impact as one unit.

Do not add a package, migration, authentication model change, public API break, or external side effect unless the request or an accepted decision authorizes it.

## Baseline boundaries

- Use `apps/api/{ProjectName}.slnx`, production projects under `apps/api/src/`, and tests under `apps/api/tests/`.
- Use Domain, Application, Infrastructure, and WebApi as the four application projects.
- Keep Domain free of persistence, web, mediator, logging, and dependency injection packages.
- Give every Aggregate an abstract state base and at least one sealed state record; do not use lifecycle enums, status strings, or status flags.
- Model every closed set of Domain values as a discriminated union of records or a typed value object; declare no `enum` in Domain.
- Mirror a Domain closed set in each outer layer with a type of the same shape: an Application result union and a transport `oneOf` polymorphic model with a discriminator; reduce a set to an `enum` only when it is label-only or a decision narrows it. Do not collapse a data-bearing union to an `enum` or serialize a Domain type directly as the wire contract.
- Own each layer's contract types: an Application message or result exposes no Domain aggregate, closed set, or result record, and a WebApi transport model reuses no Application or Domain type. Mirror the shape per layer; Shared-kernel typed IDs and value objects are the one sanctioned crossing, and the wire contract reduces even those to primitives.
- Give each rejected Domain rule its own exception type that owns its stable failure code and message; do not pass code or message strings into a shared exception.
- Place one primary top-level type per C# file; do not bundle types by kind in `*Enums.cs` or `*ValueObjects.cs` files.
- Organize every layer by the same domain modules and use cases.
- Name Application handlers, validators, results, and query result items with explicit `Command` or `Query` role suffixes.
- Name HTTP transport DTOs with a concrete boundary role ending in `Model`, including `RequestModel` and `ResponseModel`; name operation mappings with `ApiMappings`.
- Keep handlers, validators, endpoints, and persistence implementations internal sealed.
- Write commands through aggregate repositories and read queries through `IQuerySession`.
- Do not call `SaveChangesAsync` from handlers, repositories, endpoints, event reaction implementations, or workflow orchestrators.
- Commit once through the LiteBus command post-handler.
- Use Minimal API `IEndpoint`; MVC controllers are outside the profile.
- Derive authenticated actor IDs from verified claims and authorize the target resource.
- Keep frontend module internals isolated and route files focused on composition.
- Validate backend options and frontend environment access through owned modules.
- Cite every acceptance-criterion ID from verified Use cases in automated tests.
- Regenerate OpenAPI and typed consumers with their sources.

Read the full task conventions before applying any boundary from this summary.

## Repository verification

For this standards repository:

- Validate the two tracked schema consumers.
- Check manifest paths and `#agent-summary` anchors.
- Check rule-ID uniqueness and extension references.
- Check internal links, ASCII writing rules, Specification Metadata, code-document consistency, and stale terminology.
- Confirm removed terminology, rule IDs, templates, and aliases have no current standards references.
- Run `git diff --check`.

The repository ships one reference consumer validator at `tools/validate-consumer.mjs`. It validates Specification Metadata against the schema and runs the cross-file checks the foundation Verification lists require (flow use-case references, module and use-case path alignment, acceptance and end-to-end ID uniqueness, domain-policy and workflow references, and local extension scope). It has no other standards CLI, generated index, or application scaffold. JSON schemas define machine-readable file shape; the reference validator is the baseline cross-file check, and consumer CI may extend it.

## Consumer verification

Replace `{ProjectName}` with the consumer solution name:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
```

For every changed frontend:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Run the reference consumer validator from the consumer root:

```bash
node standards/tools/validate-consumer.mjs
```

Run Playwright for affected browser end-to-end flows and extension-specific verification for every applicable extension affected by the change.

## Completion

- Run every applicable check.
- Confirm the use-case specification matches observable behavior.
- Inspect generated application differences.
- Report exact commands, outcomes, and skipped checks.
- Leave no placeholder implementation, `TODO`, or untracked generated output.
