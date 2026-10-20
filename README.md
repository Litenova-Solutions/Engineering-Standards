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

LiteSpec is the standards contract Litenova Solutions uses for software work by humans and AI agents.

LiteSpec v2.0.0 covers one bounded-context business application. A consumer selects one size, small or large, the `dotnet` stack for its backend, and one stack per frontend: `react`, `svelte`, or `blazor`.

## What It Defines

- Project records that own approved intent, from why through how the business works.
- A model builder that joins those records to code, screens, tests, and test runs.
- Domain, Application.Abstractions, Application, Infrastructure, and WebApi boundaries.
- Implementation conventions for backend and frontend work.
- Verification, security, operations, and release evidence.
- Conditional extensions for capabilities outside the baseline.
- Controlled technical prose for standards and agent instructions.

The stacks a consumer selects apply first. An extension or project exception names each Standard that it replaces.

## Documentation

- [Hosted documentation](https://litespec.dev)
- [Repository documentation index](docs/README.md)
- [LiteSpec](docs/core/system.md)
- [Project model](docs/core/model.md)
- [Authoring standard](docs/core/authoring.md)
- [Get started](docs/tutorial/getting-started.md)
- [Command index](docs/tools/README.md)

## Use LiteSpec

Pin a published release as a repository submodule:

```bash
git submodule add https://github.com/Litenova-Solutions/LiteSpec.git litespec
git -C litespec checkout --detach <approved-tag-or-commit>
```

Add `litespec.project.json`, a short root `AGENTS.md`, and the project records required by current work.

Follow [Get started](docs/tutorial/getting-started.md) when creating a consumer repository.

The [template index](templates/consumer/README.md) lists each consumer template and its target path.

## Repository Structure

The standard sits at the root, because the root is what a consumer pins at `litespec/`. Each deliverable beside it has its own folder.

```text
docs/                       The standard: core, workspace, quality, backend and frontend principles, stack folders, extensions
schemas/                    JSON contracts for the manifest, the project file, records, and UI files
templates/                  Consumer record templates, standard authoring templates, and project presets
litespec.manifest.json      Version, stacks, shapes, extensions, and package pins
apps/
  cli/                      The litespec command line
    LiteSpec.Cli.slnx
    src/LiteSpec.Cli/
    tests/LiteSpec.Cli.Tests/
packages/
  ui-patterns/              The UI pattern library, its data, and its viewer
LiteSpec.slnx               Every .NET project in the repository
```

## Project

- [Contributing](CONTRIBUTING.md)
- [MIT License](LICENSE)
