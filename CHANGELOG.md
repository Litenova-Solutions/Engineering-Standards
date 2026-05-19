# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Full rewrite of the initial repository structure incorporating:
  - Contracts projects for the application layer (`Application.Write.Contracts`, `Application.Read.Contracts`).
  - Five-project application layer split enforcing CQRS at the compiler level.
  - Mermaid diagrams replacing all ASCII art diagrams throughout convention files.
  - .NET 10 target framework and `global.json` with SDK pinning.
  - `.slnx` solution format and central package management via `Directory.Packages.props`.
  - ADR files for all architectural decisions (ADR 0001 through 0010).
  - `docs/philosophy.md` explaining the architectural reasoning for humans.
  - `docs/agentic-development.md` explaining the standards design for agentic development.
  - AwesomeAssertions replacing FluentAssertions in all test examples.
  - Architecture tests section in `08-testing.md` using NetArchTest.
  - `Guid.CreateVersion7()` in strongly-typed ID examples.
  - Narrow interface pattern for `Application.Reactions` documented with full examples.
  - LiteBus package-per-layer mapping table in `01-solution-structure.md`.
  - Principle 9 (Contracts Before Implementation) added to `00-principles.md`.
- `.windsurfrules` shim file for Windsurf agent tooling.
- `.cursor/rules/00-standards-meta.mdc` for Cursor meta-rules when editing this standards repository.
- `.cursor/rules/10-backend-csharp.mdc` for Cursor backend C# rules summary (twelve critical rules).
- `CONTRIBUTING.md` with full release process documentation, semantic versioning rules, and downstream project update instructions.
- `docs/templates/` directory with six project-specific documentation templates: `ubiquitous-language.md`, `aggregate-inventory.md`, `feature-inventory.md`, `exception-inventory.md`, `read-store-inventory.md`, `project-agents.md`.

### Changed

- `README.md`: submodule path changed from `.standards/` to `standards/` in all code blocks and prose. Versioning section replaced with a three-row MAJOR/MINOR/PATCH table. Contributing section updated to reference `CONTRIBUTING.md`. Project-specific documentation section added. Templates listed in the repository structure tree and convention files table.
- `AGENTS.md`: Read order step 6 added (do not load philosophy files for routine tasks). `cancellationToken` naming rule added. Reactions NuGet restriction added as explicit rule. `Guard.Against` exception type warning added to common mistakes. `ct` naming mistake added to common mistakes. Project-specific content in convention files added as a mistake.
- All convention files updated to remove project-specific placeholder sections. Project-specific content now belongs in project repositories using `docs/templates/`.
- `docs/conventions/backend/02-domain-layer.md`: `AggregateRoot<TId>` base class subsection added. Repository interface rationale subsection added. `IXxxReadStore` naming note added. Ubiquitous language glossary placeholder section removed.
- `docs/conventions/backend/03-application-layer.md`: `Guard.Against` exception type warning added to validators section. Feature inventory placeholder section removed.
- `docs/conventions/backend/04-infrastructure-layer.md`: EF Core owned entities for value objects section added. Project-specific configuration placeholder section removed.
- `docs/conventions/backend/05-api-layer.md`: `internal` added to all `ApiMappings` class declarations. Route grouping section added. Mediator specificity note added. Project-specific configuration placeholder section removed.
- `docs/conventions/backend/06-exception-hierarchy.md`: `ApplicationGuard` helper section replaced with `Guard.Against` exception type warning. Project-specific exception types placeholder section removed.
- `docs/conventions/backend/07-query-read-strategy.md`: `IReadStore` vs `IReadRepository` naming rationale added. Three-options comparison section removed (see ADR 0007). Contracts project placement note added. Project-specific inventory placeholder section removed.
- `docs/conventions/backend/08-testing.md`: All assertions updated to AwesomeAssertions syntax. `{ProjectName}.Architecture.Tests/` added as fourth test project. Architecture tests section present and confirmed. Project-specific configuration placeholder section removed.
- `docs/conventions/shared/naming.md`: Layer-specific suffixes table updated with three columns and all rows including `EventHandler`, `ReadStore`, and `ApiMappings`. Event handler naming subsection added. Narrow interface naming subsection added.
- `docs/conventions/shared/adr-template.md`: Filled-in example replaced with ADR 0003 (CQRS with Split Application Projects).
- `docs/architecture/clean-architecture.md`: Layer diagram already shows all five application projects. Layer responsibilities section shows all five application projects. `AggregateRoot<TId>` base class section added.

## [1.0.0] - TBD

> This section will be filled in when the first tagged release is made. All entries from `[Unreleased]` will be moved here at that point.

### Added

- (entries will be listed here when the release is tagged)

[Unreleased]: https://github.com/Litenova-Solutions/engineering-standards/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Litenova-Solutions/engineering-standards/releases/tag/v1.0.0
