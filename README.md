<p align="center">
  <img src="assets/litespec-icon.svg" alt="LiteSpec" width="88" height="88">
</p>

<h1 align="center">LiteSpec</h1>

<p align="center">
  <a href="https://litespec.dev"><img src="https://img.shields.io/badge/docs-online-f8c258?labelColor=3e3643" alt="Documentation"></a>
  <a href="https://github.com/Litenova-Solutions/LiteSpec/releases/latest"><img src="https://img.shields.io/github/v/release/Litenova-Solutions/LiteSpec?label=version&color=3e3643" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Litenova-Solutions/LiteSpec" alt="MIT license"></a>
</p>

## Intent

LiteSpec is a standard for building one bounded-context business application with people and AI agents working from the same written rules and records.

A project names its size (small or large), its shape (server or client-only) and its stacks: `dotnet` for a backend, and `react`, `svelte` or `blazor` for each frontend. New to it? Read the [Learn overview](docs/learn/README.md).

## What It Defines

- Project records in four layers: Intent people approve, Behavior developers review, Implementation code, and Proof of tests and checks.
- A model builder that follows code and test anchors up to records, checks them in tiers, and renders the book.
- Domain, Application.Abstractions, Application, Infrastructure, and WebApi boundaries.
- Implementation conventions for backend and frontend work.
- Verification, security, operations, and release evidence.
- Conditional extensions for capabilities outside the baseline.
- UI patterns with drawn options for recurring interface questions.
- Pages for agents: `llms.txt` indexes and raw Markdown on [litespec.dev](https://litespec.dev).

The stacks a consumer selects apply first. An extension or project deviation names each Standard that it replaces.

## Documentation

- [Hosted documentation](https://litespec.dev)
- [Learn overview](docs/learn/README.md)
- [Repository documentation index](docs/README.md)
- [LiteSpec](docs/core/system.md)
- [Project model](docs/core/model.md)
- [Authoring standard](docs/core/authoring.md)
- [Start a consumer repository](docs/tutorial/getting-started.md)
- [CLI overview](docs/tools/README.md)

## Use LiteSpec

Install the adopted release as a local .NET tool:

```bash
dotnet new tool-manifest
dotnet tool install LiteSpec.Cli --version 3.0.0
dotnet tool restore
```

Run the first command only when the repository has no `.config/dotnet-tools.json` yet. Then start the consumer with `dotnet litespec init --preset dotnet-react --size small`, which writes `litespec.project.json`, a short root `AGENTS.md`, and the project records required by current work.

Follow [Start a consumer repository](docs/tutorial/getting-started.md) when creating a consumer repository.

The [template index](templates/consumer/README.md) lists each consumer template and its target path.

## Repository Structure

The standard sits at the root, because the root is what each release publishes: the tool package carries it, and the site renders it. Each deliverable beside it has its own folder.

```text
docs/                       The standard
  core/ workspace/ quality/   Pages every project applies
  backend/                  Backend principles
    dotnet/                 The dotnet stack, with ext/ for dotnet-only extensions
  frontend/                 Frontend principles
    patterns/               UI pattern pages with wireframes, one per group
    web/                    The shared TypeScript web realization
      react/ svelte/        The two web stacks
    blazor/                 The blazor stack
  ext/                      Extensions any stack can select
  reference/ tools/ tutorial/ guide/   Lookup, command, tutorial and how-to pages
schemas/                    JSON contracts for the manifest, the project file, records, and UI files
templates/
  consumer/                 Record, project and UI templates a consumer copies
  presets/                  The selections `litespec init` starts from
  standard/                 Seeds for LiteSpec's own pages
litespec.manifest.json      Version, stacks, shapes, extensions, and package pins
apps/
  analyzers/                LiteSpec.Analyzers, Roslyn rules for .NET applications: src and tests
  cli/                      The litespec command line: src/LiteSpec.Cli and tests/LiteSpec.Cli.Tests
  site/                     litespec.dev, a static Astro site built from the standard
LiteSpec.slnx               Every .NET project in the repository
AGENTS.md                   The agent protocol; CLAUDE.md, GEMINI.md and the other adapters point to it
```

## Project

- [Contributing](CONTRIBUTING.md)
- [MIT License](LICENSE)
