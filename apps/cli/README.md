# Litespec CLI

## Audience

You maintain the `litespec` command line in `apps/cli/src/LiteSpec.Cli/`. You add a command, add an authoring check, add a model finding, or change a validator message. After reading this page you know which file owns the behavior, how to change it, and how to cover the change with a fixture.

## What It Is

The CLI is a .NET 10 console tool named `litespec`. It checks the LiteSpec repository against its own authoring contract, writes the generated provision index, scaffolds and validates consumer repositories, builds and checks the consumer project model, generates the project book, and draws the UI pattern wireframes. The project file is `apps/cli/src/LiteSpec.Cli/LiteSpec.Cli.csproj`. It sets `OutputType` to `Exe`, `AssemblyName` to `litespec`, `PackAsTool` to `true`, and `ToolCommandName` to `litespec`. The package id is `LiteSpec.Cli`. The tool references `Microsoft.CodeAnalysis.CSharp` for the code readers and embeds `Book/Assets/**` as `LiteSpec.Book.Assets.*` for the generated book site.

The user-facing contract of each command lives in `docs/tools/`. Read those pages before you change behavior:

- [Validate Standards](../../docs/tools/validate.md) and [Generate Provisions](../../docs/tools/provisions.md) for the repository commands.
- [Initialize Consumer](../../docs/tools/init.md), [Validate Consumer](../../docs/tools/consumer.md), [Validate Controlled UI](../../docs/tools/ui.md), [Model Builder](../../docs/tools/model.md), and [Book](../../docs/tools/book.md) for the consumer commands.
- [Draw Patterns](../../docs/tools/patterns.md) for the wireframe command.
- [CLI overview](../../docs/tools/README.md) for how to run the CLI from this repository and from a consumer, and for the `LITESPEC_HOME` and `LITESPEC_TIMING` environment variables.

## Quick Start

Run every command in this section from the repository root, `D:/Personal-Projects/LiteSpec`.

Build the solution:

```bash
dotnet build LiteSpec.slnx
```

Check the authoring contract of this repository:

```bash
dotnet run --project apps/cli/src/LiteSpec.Cli -- validate
```

Run the CLI test suite with the analyzer tests:

```bash
dotnet test --solution LiteSpec.slnx
```

Print the help of one command, for example the model command:

```bash
dotnet run --project apps/cli/src/LiteSpec.Cli -- model --help
```

Check the small model fixture directly, without copying it first:

```bash
dotnet run --project apps/cli/src/LiteSpec.Cli -- model check --root apps/cli/tests/LiteSpec.Cli.Tests/Fixtures/Model/small
```

## Layout

The entry files sit at the top of `apps/cli/src/LiteSpec.Cli/`. Each command lives in its own folder with its validator, its helpers, and its usage text.

| Path | What it owns |
|:---|:---|
| `Program.cs` | Command dispatch and the top-level usage text. It sets UTF-8 console output, handles `--help` and `--version`, and routes `validate`, `provisions`, `init`, `consumer`, `ui`, `model`, `book`, and `patterns` to their `Run` methods. Unknown commands print usage to standard error and exit 2. |
| `CliArgs.cs` | Option parsing for every command. It parses `--name value` and `--name=value` forms, recognizes flags, collects positionals, and reports the first usage error. It exposes `Has`, `Value`, `Json`, `FormatError`, and `Root`. |
| `CliJson.cs` | The JSON shape every command writes and reads. It serializes with two-space indentation, a `\n` line end on every operating system, and no escaping of quotes, apostrophes, or angle brackets. `TryRead` returns null when a file is missing or holds no JSON. |
| `LiteSpecHome.cs` | Location of the LiteSpec release the tool carries. It reads `LITESPEC_HOME` when set, else walks up from the tool binary for `litespec.manifest.json`. It exposes `Root`, `RequireRoot`, `Version`, and `PathTo`. |
| `Authoring/` | The `validate` and `provisions` commands. `StandardsValidator.cs` holds the usage text, the full `StableDiagnosticCodes` list, and `Run`. `StandardsValidator.Pages.cs`, `.Provisions.cs`, `.Manifest.cs`, and `.Repository.cs` hold the page, provision, manifest, and repository checks. `Layout.cs`, `Prose.cs`, and `ProseLanguage.cs` hold the section, ASCII, and language checks. `Provisions.cs` builds the index, and `ProvisionsCommand.cs` writes or checks it. |
| `Consumer/` | The `consumer` command. `ConsumerValidator.cs` holds the usage text, the `Run` entry point, and the `RunState` carrier with its text cache, findings, and report writer. `ConsumerValidator.Project.cs` checks the project record and manifest version, `.Glob.cs` expands path globs, `.Pages.cs` checks record pages, and `.Language.cs` checks the language record. |
| `Ui/` | The `ui` command and the in-process check the consumer validator calls. `UiValidator.cs` holds the usage text, `Run`, and `Validate`. `UiValidator.Package.cs` checks the shared package configuration and source lock, `.Json.cs` evaluates the design contract and catalog JSON, `.Styles.cs` checks token and shared stylesheets, `.Classes.cs` checks class strings and imports, `.Catalog.cs` checks the pattern catalog, and `.Scan.cs` walks the consumer files. |
| `Model/` | The `model build`, `check`, `render`, and `query` subcommands. `ModelCommand.cs` parses the subcommand and the `--root`, `--out`, and `--format` options. `ConsumerConfig.cs` loads `litespec.project.json` into record roots, code roots, frontends, and test roots. `ModelBuilder.cs` builds `ProjectModel.cs`, `Checker.cs` runs every check, `Finding.cs` carries one finding, `Renderer.cs` rewrites generated regions, `Querier.cs` prints one record, and `Readers/` reads Dotnet, TypeScript, and JUnit inputs. |
| `Book/` | The `book` command. `BookCommand.cs` parses `--model`, `--out`, and `--findings` and writes each page. `BookModel.cs` builds the index and the review data, `BookPages*.cs` render the page bodies, and `BookRender.cs` shells pages and writes `search.json`. `Assets/book.css` and `Assets/book.js` ship inside the binary. |
| `Patterns/` | The `patterns preview`, `svg`, and `check` subcommands. `PatternsCommand.cs` resolves targets and writes the offline HTML preview. `PatternPage.cs` parses a pattern page, `Wireframe.cs` parses a fenced `wireframe` block, and `WireframeRenderer.cs` draws the SVG sketch. |
| `Init/` | The `init` command. `InitCommand.cs` reads the preset from `templates/presets/`, merges it over `templates/consumer/litespec.project.json`, stamps the release version, fills the project name, and writes `litespec.project.json` without overwriting an existing file. |
| `Schemas/` | The JSON Schema evaluator every validator uses to check project, record, language, design contract, catalog, and lock files. |

The solution file `LiteSpec.slnx` lists the CLI, the CLI tests, the analyzers, and the analyzer tests. `Directory.Build.props` pins the target framework to `net10.0` with nullable reference types and implicit usings, and stops MSBuild files in parent folders from applying inside this repository. `Directory.Packages.props` pins `Microsoft.CodeAnalysis.CSharp` and `xunit.v3`. `global.json` selects `Microsoft.Testing.Platform` as the test runner and pins no SDK.

## Dispatch and Option Parsing

`Program.cs` matches `args[0]` in a switch expression. `--help`, `-h`, and `help` print the top-level usage and exit 0. `--version` prints `LiteSpecHome.Version`, which is the `version` field of `litespec.manifest.json`, and exits 0. Each command name calls that command's static `Run` with the remaining arguments. Anything else prints `Unknown command '<name>'.` plus the usage to standard error and exits 2.

Each command parses its own tail with `CliArgs.Parse`, declaring the flag names and the value-option names it accepts. Names include their dashes, such as `--check` or `--root`. An option accepts `--name value` and `--name=value`. A flag stands alone. `CliArgs` treats `--help` and `-h` as help wherever they appear. Anything the command does not declare becomes a usage error such as `Unknown option '--foo'.`, and an option with no value becomes `Option --root needs a value.`. A positional beyond `maxPositionals` becomes `Unexpected argument '<value>'.`. Every `Run` prints its own `Usage` constant after a usage error and exits 2.

Two helpers apply across commands. `Json` is true when `--format json` or `--format=json` was passed, and `FormatError` reports any other `--format` value with `Unknown format '<value>'; use json or text.`. `Root` returns the full path of `--root` or the working directory. `model` and `book` parse their subcommand or their `--model` and `--out` options by hand and then delegate the shared flags to `CliArgs`.

The `--help` text of each command is the contract quoted in `docs/tools/`. Quote it when you document behavior, and change the `Usage` constant and the docs page together when you change options. Exit codes are stable: 0 for success, 1 for a finding or a failed check, and 2 for a usage error or an unreadable input. `init` exits 1 when the release's template, preset, or scaffold file is unreadable, and 2 when the project file exists or an option is invalid. `book` exits 1 for unreadable input or unwritable output. `model query` exits 1 when no record holds the id.

## Findings and Diagnostic Codes

Authoring diagnostics and model findings share one reporting shape: a stable code, a one-sentence message, a file path, and a 1-based line. Human output prints one line per finding to standard error. JSON output prints one object to standard output so a caller never parses the human lines back apart.

`StandardsValidator.StableDiagnosticCodes` lists every code `validate` may emit, in declaration order, from `ANCHOR_BROKEN` to `LAYER_UNLISTED`. `Validate` throws `InvalidOperationException` when a check emits a code the list does not declare, so an undeclared code fails fast in tests instead of shipping as a typo. `WarningDiagnosticCodes` is the burn-down list for rules that warn without failing the build; it is empty today, and `Run` splits diagnostics into errors and warnings against it. Human output writes `Relative:Line [CODE] Message` per error, then a warning count section with `Run with --warnings to list every occurrence.` JSON output writes `tool`, `root`, `ok`, an `errors` array of `file`, `line`, `code`, and `message` objects, and a `warnings` array of the same shape. A passing human run prints `LiteSpec authoring checks passed.` A failing run appends `LiteSpec authoring checks failed with N error(s).` after the lines.

`Checker.Codes` in `Model/Checker.cs` lists every model finding code, from `record-shape` to `link-unresolved`. The full table of codes and meanings lives on the [Model Builder](../../docs/tools/model.md) page. `Finding` carries `Code`, `Message`, `Path` as an absolute path, `Line`, and `Subject` as the record id the finding is about, or null. `Check` sorts findings by path, line, code, and message so parallel checks print in the same order on every run, then `Suppress` partitions open findings from known ones. A `known-gap` record covers a finding when its `check` equals the finding code, its `subject` lists the finding subject, its status is not `retired`, and its end date has not passed. `model check` prints `path:line [code] message` per open finding and `path:line [known code] message` per covered one, then `N findings, M known.` JSON output writes `findings` and `known` arrays of `code`, `message`, `path`, `line`, and `subject` objects. Covered findings exit 0. Open findings and expired gaps exit 1.

`consumer` and `ui` report problems as plain strings rather than coded findings: `Consumer: <root>`, `Files scanned: N under <docs>, frontmatter pages: M`, the language summary, an `ADVISORY` section, and a `FAIL (N problem(s)):` section, or `PASS: project configuration, page frontmatter and glossary are valid.` JSON output writes `tool`, `consumer`, `ok`, a `scanned` object, a `problems` array, and an `advisories` array.

## Release and Consumer Roots

Two roots meet in most commands: the LiteSpec release the tool carries, and the repository under check.

`LiteSpecHome` finds the release from the tool binary, not from the working directory, so the tool resolves the release it carries beside its binary at any working directory. `LITESPEC_HOME` overrides the search; when set, the folder must hold `litespec.manifest.json`, else `Root` is null. Without the variable, `Locate` walks up from `AppContext.BaseDirectory` for the manifest, which reaches the repository root in a repository checkout. `RequireRoot` throws `No LiteSpec release was found above '<dir>'. Set LITESPEC_HOME to the folder that holds litespec.manifest.json.` when no release resolves, and each command converts that into exit 2 with its usage text. `Version` reads the `version` field for `--version` and for the `reviewedLiteSpecVersion` stamp that `init` writes. `PathTo` joins a forward-slash relative path such as `docs/reference/provisions.md` onto the release root. The tests set `LITESPEC_HOME` to the repository root in `Support/Cli.cs`, so every test runs against this repository.

`validate` and `provisions` read the LiteSpec repository at `--root`, which defaults to the `LiteSpecHome` release root. `validate` refuses a root that is not a directory or is unreadable with `Repository root is not a directory: <path>` or `Repository root is unreadable: <path>: <reason>`. `provisions --check` refuses a root without a `docs` folder with `Root '<path>' holds no docs folder.`

`consumer`, `ui`, and `model` read the consumer repository at `--root`, which defaults to the working directory. Each one refuses a root without `litespec.project.json`: `consumer` writes `No litespec.project.json at <root>` and exits 2, `model` writes `Root '<root>' holds no litespec.project.json.` and exits 2, and `ui` writes `No litespec.project.json at <root>` and exits 2. `model` then loads `ConsumerConfig` from that file: record roots, language path, application, domain, web API, and infrastructure roots, test roots, frontends, API client sources, test results directory, size, shape, and stacks. The builder reads shared provisions from the release docs the tool carries and the test run from TRX or JUnit XML files under `paths.testResults`. `book` reads neither root: it takes `--model <model.json>` and `--out <folder>`, with an optional `--findings <file>` for the review page, and falls back to findings embedded in the model when the flag is absent. `patterns` resolves its targets through `LiteSpecHome`: a group name such as `record-detail`, a pattern id such as `litespec/frontend/patterns/record-detail#record-header`, or a page path. Set `LITESPEC_TIMING` to any value to print `model` phase timings such as `[time] check-schema 0.1s` on standard error; normal runs print nothing besides their findings.

## Test Harness and Fixtures

The tests live in `apps/cli/tests/LiteSpec.Cli.Tests/`. The test project targets the CLI binary as a project reference, uses `xunit.v3`, and excludes `Fixtures/**` from compilation so fixture files stay data. One folder covers each command: `Authoring/`, `Consumer/`, `Ui/`, `Model/`, `Book/`, `Init/`, and `Patterns/`. `Support/Cli.cs` runs the built `litespec.dll` with `dotnet` as its own process, the way a consumer runs the tool, and asserts the exit code with both streams. It sets `LITESPEC_HOME` to the repository root, finds the root by walking up for `litespec.manifest.json`, and offers `Fixture` for a path under `Fixtures/` and `Temp` for a fresh folder that is deleted on dispose unless `KEEP_FIXTURE` is set. `Support/InputErrorTests.cs` proves that ordinary user error reaches a message and a documented exit code, never an unhandled exception: a malformed percent escape in a link, a `provisions` root without docs, a malformed project file, a missing project file, and an equals-form book option.

Authoring tests start from `Authoring/StandardsFixture.cs`. `Base` writes a minimal repository into a temp folder: a topic page, an extension page, a stack page, a pattern page, a guide page, a tutorial page, a reference page, a command page, a glossary, a docs index with routing, and a rebuilt provision index. Each test mutates one file and runs `validate` or `provisions`. The fixture carries checkable evidence that names `litespec validate`, so the tree needs no tools stub.

Model tests start from `Model/ModelFixture.cs` and `Fixtures/Model/`. `small/` is a library loans system at size small with one module, three business records, eight use cases, and one open known gap; seven use cases have handlers and the eighth is covered by the gap. `large/` holds the same records plus problems, features, journeys, one case per use case, constraints, research, limits, runbooks, and a frontend route that imports a generated client operation. Both fixtures exit 0 under `model check`. `Fixtures/Model/README.md` documents the contents, the finding codes, and the overlay mechanism. `broken/<code>/` holds one overlay per finding code with only the files that differ from `large/`; `Prepare` copies `large/` to a temp folder, copies the overlay over it, deletes the paths in `DELETES.txt` when present, and returns the folder. `ModelCheckTests.cs` runs one theory row per code and expects exit 1 with that code. `WriteKnownGap` adds a covering gap for the suppression tests. `junit/` and `trx/` hold sample test results the proof checks read.

Book tests read the frozen `Fixtures/Book/model.json` with `Fixtures/Book/findings.json` and assert the generated pages. Pattern and wireframe tests parse the sample pages and compare rendered SVG against golden files.

To add a fixture repository for a new case, follow the harness the area already uses. For a new model finding, copy `large/` by hand into a new `broken/<code>/` overlay that holds only the differing files, add `DELETES.txt` with one relative path per line when the case deletes files, and add the code to the theory list in `ModelCheckTests.cs`. For a new authoring rule, extend `StandardsFixture.Base` only when the rule needs a new page shape; otherwise mutate one page from `Base` inside the test. For a new book shape, extend the frozen model only when the shape needs a new record type, and keep the existing file byte-identical otherwise.

## Common Changes

### Add a Command

1. Add the usage text as a `Usage` constant on the new command class, with synopsis, options, and exit codes in the shape of the neighboring commands.
2. Add the dispatch arm in `Program.cs` and route unknown subcommands to exit 2 with the usage text.
3. Parse the tail with `CliArgs.Parse`, declaring every flag and value option. Print `Usage` on `--help` with exit 0 and on any parse error with exit 2.
4. Resolve roots through `LiteSpecHome` for the release and `CliArgs.Root` for the consumer. Convert a missing release into exit 2 with the usage text.
5. Write human lines to standard output or error and one JSON object to standard output under `--format json`, using `CliJson`.
6. Document the command on a new page under `docs/tools/` with the command page sections, and link it from `docs/tools/README.md`.

### Add an Authoring Diagnostic Code End to End

1. Add the code to `StableDiagnosticCodes` in `Authoring/StandardsValidator.cs`, in declaration order.
2. Emit it through the `Add` callback inside `Validate` with the repository-relative file, the 1-based line, the code, and a message that names the file and the fix. Never construct a `StandardsDiagnostic` with a code the list does not hold.
3. Decide the severity: codes in `WarningDiagnosticCodes` print under a warning count and exit 0; every other code exits 1. The list is empty today, so a new rule fails the build unless you add it there deliberately.
4. Add a test under `Authoring/` that starts from `StandardsFixture.Base`, mutates one file, and asserts the `file:line [CODE] message` line and the exit code. Add the mirror test that the clean tree passes.
5. Quote the code on the affected `docs/tools/validate.md` behavior or the relevant standard page when the rule restates visible behavior.

### Add a Model Finding

1. Add the code to `Checker.Codes` in `Model/Checker.cs`.
2. Append the finding with its absolute path, 1-based line, message, and subject record id to the `findings` list in the matching `Check*` method. Keep the message to one sentence that names the record and the fix.
3. Honor known gaps: findings with a null subject always stay open; findings with a subject are suppressible by a `known-gap` record whose `check` equals the code and whose `subject` lists the id. Add `known-gap-expired` when a gap passes its end date with the check still red, and `gap-unknown-check` when a gap names a code no check uses.
4. Add a `broken/<code>/` overlay under `Fixtures/Model/` with only the differing files, and add the code to `FindingCodeList` in `Model/ModelCheckTests.cs`. Add the open-gap and expired-gap rows when the finding is suppressible.
5. Document the code and its meaning in the finding table on the [Model Builder](../../docs/tools/model.md) page.

### Change a Message

1. Edit the message at its emission site, not in the test. Keep it to one sentence, name the file or record and the action the reader takes next.
2. Update every test that asserts the old text, including `Support/InputErrorTests.cs` when the message covers user error.
3. Check that JSON output needs no change: messages stay inside `message` fields, and codes, paths, and field names stay stable. Rename a code only as a new code with a new overlay, never by editing the old string in place.

## Wireframe Renderer and the TypeScript Port

`Patterns/WireframeRenderer.cs` draws one parsed wireframe page as an SVG sketch at `DesktopWidth` 1200 or `PhoneWidth` 390 pixels. The sketch shows structure and copy in one neutral style with tone fills for `neutral`, `positive`, `caution`, `critical`, and `info` meanings. Text width comes from the character count, so rendering needs no font. The `phone` flag applies the compact reflow rules and prefers the option `Compact` block when present. `PatternsCommand.Preview` draws every option at both widths into one offline HTML file with the default option outlined, and `Svg` prints one option to standard output.

`apps/site/src/lib/wireframe/` holds the TypeScript port the site uses to draw the same sketches at build time: `parse.ts` parses the fenced text, `render.ts` lays out the SVG, `index.ts` re-exports the boundary, and `wireframe.test.ts` locks the behavior. `fixtures/` holds one `.wireframe` input per option with its golden `.desktop.svg` and `.phone.svg` outputs plus `errors.json` for the failure cases. The two renderers must draw the same boxes for the same text: when you change layout, tone, width estimation, or the wireframe language in `Wireframe.cs` or `WireframeRenderer.cs`, mirror the change in `render.ts` and `parse.ts`, regenerate the golden SVGs from the CLI output, and run both suites. The CLI suite lives in `Patterns/`; the site suite runs with the site build.

## Packing

`LiteSpec.Cli.csproj` sets `PackAsTool` to `true` with `ToolCommandName` `litespec`, so packing produces the `LiteSpec.Cli` tool package described as `The LiteSpec command line: authoring checks, the provision index, consumer and UI validation, the project model, and the project book.` `dotnet pack apps/cli/src/LiteSpec.Cli -c Release -o artifacts/packages` produces `LiteSpec.Cli.<version>.nupkg` with the release under `tools/net10.0/any/`, as the [CLI overview](../../docs/tools/README.md) shows. A consumer installs it with `dotnet tool install LiteSpec.Cli --version <version>`, adding `--add-source <folder>` for a local package folder. Keep `PackageId`, `ToolCommandName`, and `Description` stable: install scripts and the consumer docs name them.

## Limits

The CLI reads text and JSON and writes text, JSON, HTML, and SVG. It runs no server, migrates no data, and publishes no package on your behalf. `validate` reads the working tree only; it evaluates current standards material and skips `apps/`, `packages/`, `CHANGELOG.md`, and `LICENSE.md`. `consumer` and `ui` validate the declared contract and scan no route, environment, naming, secret, storage, or HTML sink beyond the controlled UI boundary the usage text lists. `model` builds from the declared roots and the latest TRX or JUnit files; it does not execute tests. `book` renders the model it is given; it does not rebuild the model. `patterns preview` writes to the system temp folder unless `--out` names a file. Generated regions belong to their owning tool: `model render` rewrites only the text between `<!-- generated:<name> -->` fences for the region names in `Renderer.KnownRegions`, and authoring checks skip those regions.
