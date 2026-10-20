# GitHub Copilot Instructions

Read `AGENTS.md` as the canonical agent protocol. In a consumer repository, read `litespec/AGENTS.md`, `litespec.project.json`, the model query result for the active records, and enabled extensions.

## Working in this repository

Every provision ID is `litespec/<kind>/<page>.<heading-slug>`, and the page segment names the page path. `litespec/rule/frontend-components.compose-composites-in-page-code` lives in `docs/frontend/components.md`, so a citation needs no lookup step.

A changed assertion takes a new ID. Do not edit an active Requirement in place, and do not add an alias or a replacement map. `CONTRIBUTING.md` states the amendment order.

The CLI is the one .NET project under `src/LiteSpec.Cli`, its tests are under `tests/LiteSpec.Cli.Tests`, and a new package needs the owner's approval in `Directory.Packages.props`.

Run the test suite and the repository validator before proposing a change:

```bash
dotnet build LiteSpec.slnx
dotnet test --solution LiteSpec.slnx
dotnet run --project src/LiteSpec.Cli -- provisions
dotnet run --project src/LiteSpec.Cli -- validate
node patterns/ui/library.mjs --check
git diff --check
```

The [command index](../docs/tools/README.md) states how `litespec` runs in each repository.

Authored prose is ASCII, active voice, and bounded by the measures in `docs/core/authoring.md`. A list sentence has at most 20 words and any other sentence at most 25.
