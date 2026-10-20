# Standards Commands

## Intent

Each page here documents one command the repository ships: its arguments, its options, its exit codes, and what it runs underneath.

Every command accepts `--help`, and every validator accepts `--format json` for a caller that reads the result rather than the text.

## Run the CLI

In the LiteSpec repository, run `dotnet run --project apps/cli/src/LiteSpec.Cli -- <command>`. In a consumer that pins LiteSpec at `litespec/`, run `dotnet run --project litespec/apps/cli/src/LiteSpec.Cli -- <command>`. The pages write both forms as `litespec <command>`.

The CLI needs the .NET 10 SDK and no Node runtime or package install. `dotnet test --solution LiteSpec.slnx` runs the test suite of the CLI.

The CLI finds its LiteSpec checkout above its own binary. Set `LITESPEC_HOME` to a checkout folder to read another one. Set `LITESPEC_TIMING` to print the phase timings of `litespec model` on standard error.

## LiteSpec repository

- [Validate Standards](validate.md)
- [Generate Provisions](provisions.md)

## Consumer repository

- [Initialize Consumer](init.md)
- [Validate Consumer](consumer.md)
- [Validate Controlled UI](ui.md)
- [Model Builder](model.md)
- [Book](book.md)

## Anywhere

- [Draw Patterns](patterns.md)

A consumer runs its commands from the consumer root, where `litespec.project.json` sits.
