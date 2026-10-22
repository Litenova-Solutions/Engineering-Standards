# Overview

## Intent

The Tools section documents the LiteSpec command line: one command for each repository check, generator, and lookup, from standards validation to generated files and pattern drawing. A developer or coding assistant opens this index to find the command that produces the check or file the task needs. On a command page, Name and Synopsis give the quick form, and Description and Examples give the detail.

## Run the CLI

In the LiteSpec repository, run `dotnet run --project apps/cli/src/LiteSpec.Cli -- <command>`. In a consumer that pins LiteSpec at `litespec/`, run `dotnet run --project litespec/apps/cli/src/LiteSpec.Cli -- <command>` from the consumer root, the folder that holds `litespec.project.json`. The command pages write both forms as `litespec <command>`.

The CLI needs the .NET 10 SDK and nothing else: no Node runtime, no package install. By default it reads the LiteSpec checkout above its own binary; set `LITESPEC_HOME` to point it at another checkout. Set `LITESPEC_TIMING` to print the phase timings of `litespec model` on standard error.

Every command accepts `--help`, and every validator accepts `--format json` for a caller that reads the result rather than the text.

## LiteSpec Repository

- [Validate Standards](validate.md): checks the standards pages, templates, and identifiers against the authoring contract.
- [Generate Provisions](provisions.md): rebuilds the provision index from the active standards.

## Consumer Repository

- [Initialize Consumer](init.md): writes `litespec.project.json` for a new consumer from a preset.
- [Validate Consumer](consumer.md): checks a consumer's pages, project record, and vocabulary.
- [Validate Controlled UI](ui.md): checks the shared UI package and each controlled web frontend.
- [Model Builder](model.md): builds, checks, and diffs the project model, renders generated regions, and answers record queries.
- [Book](book.md): generates a static site from `model.json` for reviewers.

## Anywhere

- [Draw Patterns](patterns.md): draws, prints, and checks the UI pattern wireframes.
