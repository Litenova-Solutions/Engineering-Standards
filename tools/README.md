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

## Modules and fixtures

`prose.mjs` and `provisions.mjs` are modules that the commands import. They have no entry point of their own.

Each `*.cases.mjs` file is the fixture suite for the command beside it. Run the suite after changing the rule, schema, template, or validator behavior it covers.

```bash
node tools/validate-standards.cases.mjs
node tools/validate-consumer.cases.mjs
node tools/validate-ui.cases.mjs
node tools/validate-parity.cases.mjs
```

Reference validators do not run application builds, browser tests, deployment checks, or operating evidence gates.
