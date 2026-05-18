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

## [1.0.0] - TBD

> This section will be filled in when the first tagged release is made. All entries from `[Unreleased]` will be moved here at that point.

### Added

- (entries will be listed here when the release is tagged)

[Unreleased]: https://github.com/Litenova-Solutions/engineering-standards/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Litenova-Solutions/engineering-standards/releases/tag/v1.0.0
