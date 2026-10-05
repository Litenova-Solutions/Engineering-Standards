# Standards Tools

## Intent

This directory holds the commands the repository ships. Each one is documented as a command page under [docs/tools/](../docs/tools/README.md), with its arguments, its options, its exit codes, and what it runs underneath.

## Commands

| File | Command page |
|:---|:---|
| `validate-standards.mjs` | [Validate Standards](../docs/tools/validate-standards.md) |
| `generate-provisions.mjs` | [Generate Provisions](../docs/tools/generate-provisions.md) |
| `validate-consumer.mjs` | [Validate Consumer](../docs/tools/validate-consumer.md) |
| `validate-ui.mjs` | [Validate Controlled UI](../docs/tools/validate-ui.md) |
| `validate-parity.mjs` | [Validate Use-Case Parity](../docs/tools/validate-parity.md) |

Every command is dependency-free Node with no install step, and the floor is Node 22. Nothing here reads a package manifest, a lockfile, or `node_modules`.

Every command accepts `--help`. Every validator accepts `--format=json`, which writes one object carrying the same problems the human output lists.

## Modules and fixtures

`prose.mjs` and `provisions.mjs` are modules that the commands import. They have no entry point of their own.

Each `*.cases.mjs` file is the fixture suite for the command beside it. Run the suite after changing the rule, schema, template, or validator behavior it covers.

```bash
node tools/validate-standards.cases.mjs
node tools/validate-consumer.cases.mjs
node tools/validate-ui.cases.mjs
node tools/validate-parity.cases.mjs
```

Each suite asserts the exit code beside the reported message. A run that prints a problem and exits zero passes every gate that reads the code.

Reference validators do not run application builds, browser tests, deployment checks, or operating evidence gates.
