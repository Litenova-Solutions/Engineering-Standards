# LiteSpec.Cli

The `litespec` command line for applications that follow [LiteSpec](https://litespec.dev), the specification standard for one bounded-context business application built by people and agents. The package carries the LiteSpec release it checks against, so a project needs no copy of the standard.

## Install

Install the tool in the project, at the release the project follows:

```bash
dotnet new tool-manifest
dotnet tool install LiteSpec.Cli --local --version 2.0.0
```

A teammate or a build restores it with `dotnet tool restore`.

## Use

Run each command from the project root, the folder that holds `litespec.project.json`:

```bash
dotnet litespec init --preset dotnet-svelte --size small
dotnet litespec consumer
dotnet litespec ui
dotnet litespec model check
```

| Command | What it does |
|:---|:---|
| `init` | Writes `litespec.project.json`, the record scaffold, the tool manifest, and the `## LiteSpec` block of `AGENTS.md`. |
| `consumer` | Checks the project file, every record page against the record schema, and the project glossary. |
| `ui` | Checks the shared UI package and each controlled web frontend. |
| `model` | Builds the project model from the records, the code, the screens and the tests; `check` reports where they disagree, `render` writes the generated page regions, `query` prints one record with its links. |
| `book` | Generates a static site of the records for reviewers. |
| `patterns` | Draws the UI pattern wireframes to choose from. |

Every command accepts `--help`, and the checks accept `--format json`.

## Learn More

- [Adopting LiteSpec](https://litespec.dev/2.0.0/learn/adopting-litespec/)
- [The command reference](https://litespec.dev/2.0.0/tools/)
- [The source and issues](https://github.com/Litenova-Solutions/LiteSpec)
