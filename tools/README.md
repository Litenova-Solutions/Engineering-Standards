# Standards Tools

## Intent

This directory holds the commands the repository ships. Each one is documented as a command page under [docs/tools/](../docs/tools/README.md), with its arguments, its options, its exit codes, and what it runs underneath.

## Commands

| Command | Command page |
|:---|:---|
| `node tools/validate-standards.mjs` | [Validate Standards](../docs/tools/validate-standards.md) |
| `node tools/generate-provisions.mjs` | [Generate Provisions](../docs/tools/generate-provisions.md) |
| `node litespec/tools/validate-consumer.mjs` | [Validate Consumer](../docs/tools/validate-consumer.md) |
| `node litespec/tools/validate-ui.mjs` | [Validate Controlled UI](../docs/tools/validate-ui.md) |
| `dotnet run --project tools/model/Litenova.Model -- build\|check\|render\|query` | [Model Builder](../docs/tools/model.md) |

Every Node command is dependency-free with no install step, and the floor is Node 22. Nothing here reads a package manifest, a lockfile, or `node_modules`. The model builder is a .NET tool and needs the pinned SDK.

Every Node command accepts `--help`. Every validator accepts `--format=json`, which writes one object carrying the same problems the human output lists. The model builder's `check` accepts `--format json` with the same effect.

## Modules and fixtures

`prose.mjs`, `provisions.mjs`, and `schema.mjs` are modules that the commands import. They have no entry point of their own.

Each `*.cases.mjs` file is the fixture suite for the command beside it. Run the suite after changing the rule, schema, template, or validator behavior it covers.

```bash
node tools/validate-standards.cases.mjs
node tools/validate-consumer.cases.mjs
node tools/validate-ui.cases.mjs
node tools/model.cases.mjs
```

Each suite asserts the exit code beside the reported message. A run that prints a problem and exits zero passes every gate that matters.

The UI pattern checks under `patterns/ui/` carry their own self-test, `audit-selftest.mjs`, rather than a fixture suite.

Reference validators do not run application builds, browser tests, deployment checks, or operating evidence gates.
