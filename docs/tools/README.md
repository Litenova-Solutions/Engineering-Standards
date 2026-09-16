# Standards Commands

## Intent

Each page here documents one command the repository ships: its arguments, its options, its exit codes, and what it runs underneath.

Every command is dependency-free Node and runs with no install step. The floor is Node 22. The workflow runs every fixture suite on Node 22 and on the pinned Node 24 release, so the floor is tested rather than asserted.

Every command accepts `--help`, and every validator accepts `--format=json` for a caller that reads the result rather than the text.

## Standards repository

- [Validate Standards](validate-standards.md)
- [Generate Provisions](generate-provisions.md)

## Consumer repository

- [Validate Consumer](validate-consumer.md)
- [Validate Controlled UI](validate-ui.md)
- [Validate Use-Case Parity](validate-parity.md)

A consumer runs its commands from the consumer root, where `standards.project.json` sits. The standards repository is a submodule at `standards/`, so the path carries that prefix.
