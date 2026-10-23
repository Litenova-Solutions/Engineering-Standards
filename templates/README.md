# Templates

## Intent

You maintain the LiteSpec repository and change a seed file, or you author a consumer repository and copy one. After reading this page you know which folder holds the file you need, who copies it, and how a change is proved.

## What It Is

`templates/` holds three folders of seed files. Consumer authors copy them by hand or through `litespec init`. The seeds for LiteSpec pages live here too, so the validator parses them as the pages they produce and a seed always passes the contract it teaches.

## Quick Start

From the repository root, write a starting project file into a new consumer folder:

```bash
dotnet run --project apps/cli/src/LiteSpec.Cli -- init --preset dotnet-react --size small --root ../sample-store
```

The command merges the preset over `consumer/litespec.project.json`, stamps the release version and the project name, and writes `litespec.project.json`. It never overwrites an existing project file.

## How It Is Organized

### Consumer Templates

`consumer/` holds one starting point per record type and page style, plus the project file, the language file, the design contract, the UI catalog, and the source lock. [consumer/README.md](consumer/README.md) maps each file to the consumer path it targets, from `docs/product/brief.md` to `packages/ui/ui-source-lock.json`.

Each record template carries JSON frontmatter valid against [record.schema.json](../schemas/record.schema.json) plus the body sections of its page style. Each JSON template carries working example values. Replace every `<placeholder>`, `__PROJECT__`, and `__OWNER__` value before committing. `litespec init` fills the project placeholders in `litespec.project.json` and lists the ones it leaves, and `litespec consumer` refuses a project file that still holds one. Do not edit [consumer/README.md](consumer/README.md): it is the template index the validator checks.

### Presets

`presets/` holds three JSON files: `blazor-client.json`, `dotnet-react.json`, and `dotnet-svelte.json`. Each one names the shape, the stacks, and the frontends a new project starts from. `litespec init --preset <name> --size <small|large>` reads the preset, merges it over `consumer/litespec.project.json`, and stamps the release version. A preset adds no rule: switching presets changes the starting file only.

### Standard Seeds

`standard/` holds the seeds for LiteSpec pages: `topic.md`, `extension.md`, `command.md`, `how-to.md`, and `tutorial.md`. The validator parses each seed as the page class it produces, so the seed always passes the contract it teaches: `command.md` as a tools page, `extension.md` as an extension page, `how-to.md` as a guide page, `tutorial.md` as a tutorial page, and `topic.md` as a core page.

## How It Works

`litespec init` accepts only the three shipped preset names and the two sizes, `small` and `large`. It reads `templates/presets/<name>.json` and `templates/consumer/litespec.project.json` from the release the tool carries, or from `LITESPEC_HOME` when set. It fills the project name from `--name` or from the target folder name, stamps `reviewedLiteSpecVersion` with the release the tool carries, writes the file, copies the scaffold with the `## LiteSpec` block of `AGENTS.md` filled, and writes `.config/dotnet-tools.json` pinning the tool at the release. It reports an unreadable template, preset, or scaffold file with exit code 1, and an existing project file or an invalid option with exit code 2.

Record authors copy templates by hand into the paths [consumer/README.md](consumer/README.md) maps. The standard seeds are never copied into consumers: the validator reads them directly as virtual pages.

## How to Change One Safely

- For a record template, keep the frontmatter valid against [record.schema.json](../schemas/record.schema.json) and the body sections matching the page style the [authoring standard](../docs/core/authoring.md) defines. Copy the changed file into a scratch consumer and run `litespec consumer --root <folder>` there.
- For `litespec.project.json` or a preset, keep both valid against the project schema. `litespec validate` checks the shipped template. Keep [consumer/README.md](consumer/README.md) rows in sync: every row names a file that exists, and every shipped file appears in a row.
- For a standard seed, keep it passing its virtual page contract. `litespec validate` parses each one.
- Update the CLI reader and its tests when the shape changes, with one passing case and one failing case.
- Run the verification steps in [CONTRIBUTING.md](../CONTRIBUTING.md).

## How to Test It

- `litespec validate` covers the shipped project template, the template index in both directions, and the standard seeds as virtual pages.
- `litespec consumer --root <folder>` proves a changed record template validates in place.
- `dotnet test --solution LiteSpec.slnx` runs the Init, Consumer, and Authoring suites with their fixtures.

## Limits

- Templates carry example values, not a migration. Adopting a new release means re-reading the templates, not diffing them.
- `litespec init` never overwrites an existing project file. Remove the existing file before running it again.
- Placeholders are author input, not defaults. A committed file holding one is unfinished.
