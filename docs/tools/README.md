# Standards Commands

## Intent

Each page here documents one command the repository ships: its arguments, its options, its exit codes, and what it runs underneath.

Every command accepts `--help`, and every validator accepts `--format json` for a caller that reads the result rather than the text.

## Run the CLI

In the LiteSpec repository, run `dotnet run --project src/LiteSpec.Cli -- <command>`. In a consumer that pins LiteSpec at `litespec/`, run `dotnet run --project litespec/src/LiteSpec.Cli -- <command>`. The pages write both forms as `litespec <command>`.

The CLI needs the .NET 10 SDK and no Node runtime or package install. `dotnet test --solution LiteSpec.slnx` runs the test suite of the CLI.

The UI pattern library under `patterns/ui/` keeps its Node tooling (`node patterns/ui/library.mjs --check`), because its items are JavaScript modules that draw HTML for a browser viewer.

## LiteSpec repository

- [Validate Standards](validate.md)
- [Generate Provisions](provisions.md)

## Consumer repository

- [Validate Consumer](consumer.md)
- [Validate Controlled UI](ui.md)
- [Model Builder](model.md)
- [Book](book.md)

A consumer runs its commands from the consumer root, where `litespec.project.json` sits.
