# Changelog

## v2.0.0

LiteSpec 2.0.0 is the standards contract for one bounded-context business application, built by people and agents. People and agents write intent records; the model builder reads the code, screens, tests, and test runs and computes the links between the two. A consumer installs this release as the `LiteSpec.Cli` local .NET tool at the release version, records it in `reviewedLiteSpecVersion`, and keeps it for as long as it serves. The release takes effect as the `v2.0.0` tag.

### Structure

- The folder a page sits in decides who applies it. `core/`, `workspace/` and `quality/` apply to every project. Pages directly in `backend/` and `frontend/` are the principles every backend and every frontend follows.
- A stack is a folder inside its area: `backend/dotnet/`, `frontend/web/react/`, `frontend/web/svelte/` and `frontend/blazor/`. Selecting a stack applies its folder and every folder above it, so `frontend/web/` holds the TypeScript web pages React and Svelte share.
- A deeper page, an extension's `replaces`, or a project deviation record replaces a named provision of a shallower page.
- An extension for every stack sits in `ext/`; an extension for one stack sits in that stack's `ext/` folder, such as `backend/dotnet/ext/efcore.md`. Extensions ship for outbox, tenancy, plans, audit, caching, realtime, jobs, stage and delegation, among others.
- A provision ID is its page and heading: `litespec/<page>#<slug>`, such as `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`. Headings carry no ID; the ID, the file and the published address follow one rule. `docs/reference/provisions.md` lists every provision with its verification mark.
- Pages follow the page contract in `docs/core/authoring.md`: ASCII only, one term per concept, capitalized modals only inside a Statement, a Default or a Replacement, Title Case on every heading, an `Overview` title on every section index, and nothing about other releases. LiteSpec writes US English.
- Every provision is marked `checkable`, naming the command that checks it and the finding it reports, or `guidance`, naming the observable evidence and where to look.

### Selection

- A project names a size, a shape, and its stacks in `litespec.project.json`. Size is `small` or `large` and decides the record types and test projects. Shape is `server`, with one backend stack, or `client-only`, with none, which applies the backend architecture, domain, application and identifier principles.
- `litespec init --preset dotnet-react|dotnet-svelte|blazor-client --size small|large` writes a starting `litespec.project.json`. A preset adds no rule.
- A departure from a rule is a deviation record with its reason and review date. A finding the project accepts for now is a known gap record with an owner and an end date.

### Records and the Model

- `docs/core/model.md` defines the record types, each answering one question: product, goal, problem, feature, constraint, research, decision and requirement for why; journey for the steps toward one goal; module, aggregate, rule, event, use case, result and scenario for how the business works; actor, role, permission, entry point and external system for who acts and how they arrive; limit and runbook for operation; deviation, known gap and glossary term for how the project builds and speaks.
- Every record carries an owner and a status of draft, approved or retired. A draft names its decider and decide-by date, an approved record is replaced rather than edited, and only a decision carries `replaces`.
- Identifiers use the `type/home.name` form, chosen by a person and stable once approved.
- An aggregate names its states, the transitions between them, and its classified data. A rule is an invariant, a precondition, a calculation or a cross-aggregate rule. A use case is a command, a query or a reaction, and carries its input and output. A result is a success or a refusal with a stable code. A scenario states its given, when and then, with an optional examples table.
- A requirement is functional, quality or business, and names the feature that delivers it. A measured quality requirement carries its measure, target, conditions, check and evidence.
- The builder computes implemented, verified and reachable over the records, and the effective status of each record. `docs/core/product.md` places business intent in a product brief and requirement pages, `docs/core/domain.md` states the domain records, and `docs/core/access.md` states who may act and how each use case is reached.

### The Command Line

- One .NET 10 command line, `litespec`, with `validate`, `provisions`, `consumer`, `ui`, `model`, `book`, `init` and `patterns`. The reporting commands take `--root <path>` and `--format json`, and every command writes UTF-8 with `\n` line ends on every platform.
- `litespec model build` writes `model.json` with the computed `implements`, `calls` and `proves` links; `check` reports open findings and expired known gaps; `render` writes the generated page regions; `query` prints one record with its links both ways; `diff` reports the records a change adds, changes and removes for review. It reads C# through Roslyn, React and Svelte routes, and TRX or JUnit XML test results, each stack through its own reader.
- `litespec book` generates the project book, a static site with one page per record, an index per type, a lens per actor, a review page, a glossary and search.
- `litespec consumer` checks the project file, the selection of size, shape, stacks and extensions, every record page against `schemas/record.schema.json`, and the project vocabulary. `litespec ui` checks the controlled web UI contract.
- `litespec validate` and `litespec provisions` check this repository's own pages, schemas, manifest and provision index.
- `litespec patterns` draws the UI pattern wireframes for a person to choose from. `preview` writes one offline page with every option at desktop and phone width, `svg` prints one option, and `check` reports broken wireframes.

### Analyzers

- `LiteSpec.Analyzers` is a NuGet package of Roslyn analyzers that report a breach of a .NET provision as an error in the editor and the build, each diagnostic linking to its provision. Rules cover Domain (outer-layer references, closed value sets, state records, Domain exceptions, events and their placement, binary floating point, clock and random reads, repositories, documentation, and typed identifiers), the outer layers (implementation shape, handler and endpoint naming, reactions and jobs), naming and style, and one assertion rule for test projects.
- A rule runs only in the layers its provision covers. The layer comes from the `LiteSpecLayer` MSBuild property or the assembly name suffix. The package runs on the .NET 9.0.300 SDK, Visual Studio 17.14, and later.
- `docs/backend/dotnet/packages.md` adds the convention to reference the package from the five application projects, the manifest pins it, and the rules the analyzers check completely are marked `checkable`.

### The Site

- litespec.dev publishes every page of the release for people, with a navigation tree, provision cards, highlighted code, tabbed UI pattern options with a full-screen viewer, search, and light and dark themes.
- Agents read `/llms.txt`, a raw Markdown copy of every page, one index per selection of shape and stacks, one bundle per layer, and the schemas. `/latest` redirects to the current release.
- `docs/learn/` holds explanation pages that teach what LiteSpec is, why it exists, and how its parts and tools fit together, among them the reading tracks and the lineage of borrowed practices.

### UI Patterns

- A pattern page in `docs/frontend/patterns/` answers one group of recurring interface questions. Each pattern names its question, its default option, its compact behavior and its rationale. Each option carries a wireframe in a closed text language, its rationale and its cost.
- The wireframe language, defined in `docs/frontend/patterns.md`, states structure and real copy, never style. An agent builds an option in its own stack and design system. A pattern ID is `litespec/frontend/patterns/<group>#<pattern>`.
- Ten groups ship: page frames, lists and tables, record detail, forms and fields, dialogs and overlays, create, edit and remove, feedback and states, navigation, money, time and density, and admin screens. A project catalog cites a pattern by its ID in `library`.

### Pins

- `litespec.manifest.json` pins the .NET 10 workspace (ASP.NET Core 10.0.13, Marten 9.50.1, Aspire 13.6.1, OpenTelemetry 1.19, Testcontainers 4.16.0, LiteBus `7.0.0-preview.6`), xUnit v3 on Microsoft.Testing.Platform with Reqnroll and LightBDD, and the web toolchain (Node 24.22.0, pnpm 11.28.5, Vite 8.3.4, TypeScript 6.0.3).
- Every schema's `$id` is its address on the published site: `https://litespec.dev/2.0.0/schemas/<file>`.
