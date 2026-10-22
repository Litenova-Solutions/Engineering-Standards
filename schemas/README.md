# Schemas

## Intent

You maintain the LiteSpec repository and change a JSON contract, or you build a consumer tool that reads one. After reading this page you know what each schema owns, which command reads it, and how to change it without breaking either side.

## What it is

`schemas/` holds the seven JSON Schema contracts of the release. Each file validates one JSON artifact: the release manifest, the consumer project file, the record frontmatter, the glossary, the design contract, the pattern catalog, or the source lock. Every schema `$id` names the release under `https://litespec.dev/<version>/schemas/`, so a pinned consumer keeps resolving the shape it reviewed.

## Quick start

Check every schema and its consumers from the repository root:

```bash
dotnet run --project apps/cli/src/LiteSpec.Cli -- validate
```

The command checks each `$id` against the manifest version, validates the manifest and the shipped project template against their schemas, and reports every schema, template, and keyword problem with its diagnostic code.

## How it is organized

| Schema | Validates | Read by |
|:---|:---|:---|
| `litespec-manifest.schema.json` | `litespec.manifest.json` | `litespec validate` |
| `litespec-project.schema.json` | `litespec.project.json` | `litespec consumer`, `litespec init` |
| `record.schema.json` | Frontmatter of every consumer record page | `litespec consumer` |
| `glossary.schema.json` | `docs/glossary.json` | `litespec consumer` |
| `design-contract.schema.json` | Metadata block of `DESIGN.md` | `litespec ui` |
| `ui-pattern-catalog.schema.json` | `docs/ui/pattern-catalog.json` | `litespec ui` |
| `ui-source-lock.schema.json` | `packages/ui/ui-source-lock.json` | `litespec ui` |

The shared evaluator lives in `apps/cli/src/LiteSpec.Cli/Schemas/JsonSchema.cs`. Every reader above calls it, so one keyword gate and one validation path serve all seven schemas.

### Litespec manifest schema

`litespec-manifest.schema.json` (`schemaVersion` 5) owns the shape of [litespec.manifest.json](../litespec.manifest.json): the version, the stacks with their folders and pairing rules, the shapes, the extensions with their paths and activation scopes, and the toolchain, package, and UI baseline pins. `litespec validate` reads the manifest through it, and the `$id` check ties every schema file to the manifest version.

### Litespec project schema

`litespec-project.schema.json` owns the shape of the consumer project file: the project name, the size, the stacks, the reviewed LiteSpec release, the documentation and code paths, the owners, and the selected extensions. `litespec consumer` validates the consumer file through it, `litespec init` writes that file from a preset, and `litespec validate` proves the shipped template in [templates/consumer/litespec.project.json](../templates/consumer/litespec.project.json) meets it.

### Record schema

`record.schema.json` owns the frontmatter of every consumer record page: 24 page shapes from product brief through business record and use case to reference, each with its entry records for rules, events, results, and cases. `litespec consumer` validates each page frontmatter through it and then checks the body sections the schema cannot see.

### Language schema

`glossary.schema.json` (`schemaVersion` 2) owns the shape of the consumer glossary: one Term entry per concept with its meaning, labels, rejected synonyms, broader and narrower terms, and closed-set values, plus the mannered terms no page may use. `litespec consumer` validates the record through it and then checks prose against the terms.

### Design contract schema

`design-contract.schema.json` (`schemaVersion` 1, `kind` design-contract) owns the metadata block that opens the `DESIGN.md` a shared UI package ships: the package name, the density profile, the shell, and the floorplans it provides. `litespec ui` validates the block through it and then checks that the package implements what the block promises.

### UI pattern catalog schema

`ui-pattern-catalog.schema.json` (`schemaVersion` 1, `kind` ui-pattern-catalog) owns the shape of the consumer pattern catalog: the breakpoints, the groups, and one decision per recurring interface question with its options, its choice, its compact behavior, and its implementations per platform. `litespec ui` validates the catalog through it and then checks the references the schema cannot see across properties.

### UI source lock schema

`ui-source-lock.schema.json` (`schemaVersion` 1) owns the shape of the lock beside the one copy of the registry source: the generator (`shadcn/ui` or `shadcn-svelte`), the CLI version, the decoded preset, the registry, and the digest of every installed primitive. `litespec ui` validates the lock through it, so a hand edit to copied source reports instead of passing unreviewed.

## How it works

Each reader loads its schema file and passes values to the shared evaluator. The evaluator first runs the keyword gate: a schema carrying a keyword the evaluator does not implement fails with `SCHEMA_UNSUPPORTED_KEYWORD` instead of validating. It then validates the value and reports each mismatch with its location. The readers add the checks JSON Schema cannot express: the manifest `$id` home and version, the project selection rules, the record body sections, the glossary prose check, the design contract implementation check, the catalog cross-property references, and the lock digest check.

## How to change one safely

- Read the readers first: the validator files named in the table and their tests under `apps/cli/tests/LiteSpec.Cli.Tests/` (`Authoring/StandardsValidatorTests.Schemas.cs`, `Consumer/`, `Ui/`), with fixtures under `Fixtures/`.
- Keep to implemented keywords. When the shape needs a keyword the evaluator lacks, extend `Schemas/JsonSchema.cs` first, with passing and failing cases.
- Update every consumer of the shape in the same change: the shipped template in [templates/](../templates/README.md), the CLI reader, and the fixtures that cover it.
- Keep the `$id` on the published home with the manifest version. Change the `schemaVersion` const only together with the template, reader, and fixture updates the new shape needs.
- Run the verification steps in [CONTRIBUTING.md](../CONTRIBUTING.md).

## How to test it

- `litespec validate` covers the manifest, the shipped project template, the schema IDs, and the template index.
- `dotnet test --solution LiteSpec.slnx` runs the Authoring, Consumer, Ui, Model, and Init suites with their fixtures.
- Add one passing case and one failing case for a new rule, in both directions like the existing schema tests.

## Limits

- The evaluator implements a subset of JSON Schema draft 2020-12. A schema carrying another keyword fails with `SCHEMA_UNSUPPORTED_KEYWORD` instead of validating.
- Validation proves shape only. Cross-file references stay the job of the owning validator, as the reader column shows.
- Schemas never migrate a consumer. A consumer pins a release and adopts the next whole contract at once.
