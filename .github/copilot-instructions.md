# GitHub Copilot Instructions

Read `AGENTS.md` as the canonical agent protocol. In a consumer repository, read `litespec/AGENTS.md`, `litespec.project.json`, the model query result for the active records, and enabled extensions.

## Working in This Repository

Every provision ID is `litespec/<page>#<slug>`: the page path under `docs/` and the heading slug, with no ID written in the heading. `litespec/frontend/components#compose-composites-in-page-code` lives in `docs/frontend/components.md`, so a citation needs no lookup step.

A Requirement that obliges a different action, a wider scope, or a different actor takes a new ID. A reword that obliges the same action keeps its ID. Do not add an alias or a replacement map. `CONTRIBUTING.md` states the amendment order.

The `litespec` command lives at `apps/cli/src/LiteSpec.Cli` with tests at `apps/cli/tests/LiteSpec.Cli.Tests`, and a new package needs the owner's approval in `Directory.Packages.props`.

Run the test suite and the repository validator before proposing a change:

```bash
dotnet build LiteSpec.slnx
dotnet test --solution LiteSpec.slnx
dotnet run --project apps/cli/src/LiteSpec.Cli -- provisions
dotnet run --project apps/cli/src/LiteSpec.Cli -- validate
git diff --check
```

The [command index](../docs/tools/README.md) states how `litespec` runs in each repository.

Authored prose is ASCII, active voice, and bounded by the measures in `docs/core/authoring.md`. A list sentence has at most 20 words and any other sentence at most 25.
