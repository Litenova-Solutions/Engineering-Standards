# Standards Commands

## Intent

Each page here documents one command the repository ships: its arguments, its options, its exit codes, and what it runs underneath.

Every command is dependency-free Node and runs with no install step.

## Standards repository

- [Validate Standards](validate-standards.md)
- [Generate Provisions](generate-provisions.md)

## Consumer repository

- [Validate Consumer](validate-consumer.md)
- [Validate Controlled UI](validate-ui.md)
- [Validate Use-Case Parity](validate-parity.md)

A consumer runs its commands from the consumer root, where `standards.project.json` sits. The standards repository is a submodule at `standards/`, so the path carries that prefix.
