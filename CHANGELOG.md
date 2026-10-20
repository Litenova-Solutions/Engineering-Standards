# Changelog

## v2.0.0

The first release of LiteSpec: the standards contract for one bounded-context business application, built by people and agents. People and agents write intent records; the model builder reads the code, screens, tests, and test runs and computes the links between the two. A consumer pins this release as a submodule at `litespec/`, records it in `reviewedLiteSpecVersion`, and keeps it for as long as it serves. The release takes effect as the `v2.0.0` tag.

### Structure

- The folder a page sits in decides who applies it. `core/`, `workspace/` and `quality/` apply to every project. Pages directly in `backend/` and `frontend/` are the principles every backend and every frontend follows.
- A stack is a folder inside its area: `backend/dotnet/`, `frontend/web/react/`, `frontend/web/svelte/` and `frontend/blazor/`. Selecting a stack applies its folder and every folder above it, so `frontend/web/` holds the TypeScript web pages React and Svelte share.
- A deeper page, an extension's `replaces`, or a project Exception record replaces a named provision of a shallower page.
- An extension for every stack sits in `ext/`; an extension for one stack sits in that stack's `ext/` folder, such as `backend/dotnet/ext/efcore.md`. Nineteen extensions ship, among them outbox, tenancy, audit, caching, realtime, jobs, stage and delegation.
- A provision ID is its page and heading: `litespec/<page>#<slug>`, such as `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`. Headings carry no ID; the ID, the file and the published address follow one rule. `docs/reference/provisions.md` lists every provision with its verification mark.
- Every provision is marked `checkable`, naming the command that checks it, or `guidance`, stating the question a reviewer answers.

### Selection

- A project names a size, a shape, and its stacks in `litespec.project.json`. Size is `small` or `large` and decides the record types and test projects. Shape is `server`, with one backend stack, or `client-only`, with none, which applies the backend architecture, domain, application and identifier principles.
- `litespec init --preset dotnet-react|dotnet-svelte|blazor-client --size small|large` writes a starting `litespec.project.json`. A preset adds no rule.
- A departure from a rule is an Exception record with its reason and review date. A finding the project accepts for now is a Known gap record with an owner and an end date.

### Records and the model

- `docs/core/model.md` defines the record types, each answering one question: Product, Constraint, Research, Decision and Requirement for why; Problem and Feature for what is offered; Actor, Role and Permission for who acts; Journey and Entry point for how they arrive; Module, Business record, Rule, Use case, Result, Case and Event for how the business works; Limit and Runbook for operation; Standard, Exception, Known gap and Term for how the project builds and speaks.
- Every record carries an owner and a status of draft, approved or retired. A draft names its decider and decide-by date, an approved record is replaced rather than edited, and only a decision carries `replaces`.
- Identifiers use the `type/home.name` form, chosen by a person and stable once approved. A Result records its HTTP status in `httpStatus` when an HTTP entry point reaches its use case.
- `docs/core/product.md` places business intent in a product brief and product topic pages, and orders the work: intent, then specification, then code.

### The command line

- One .NET 10 command line, `litespec`, with `validate`, `provisions`, `consumer`, `ui`, `model`, `book` and `init`. The reporting commands take `--root <path>` and `--format json`, and every command writes UTF-8 with `\n` line ends on every platform.
- `litespec model build` writes `model.json` with the computed `implements`, `calls` and `proves` links; `check` reports open findings and expired Known gaps; `render` writes the generated page regions; `query` prints one record with its links both ways. It reads C# through Roslyn, React and Svelte routes, and TRX or JUnit XML test results, each stack through its own reader.
- `litespec book` generates the project book, a static site with one page per record, an index per type, a lens per actor, a review page, a glossary and search.
- `litespec consumer` checks the project file, the selection of size, shape, stacks and extensions, every record page against `schemas/record.schema.json`, the controlled prose measures and the project language. `litespec ui` checks the controlled web UI contract. `prose.enforcement: report` turns the prose measures into advisories.
- `litespec validate` and `litespec provisions` check this repository's own pages, schemas, manifest and provision index.
- `litespec patterns` draws the UI pattern wireframes for a person to choose from. `preview` writes one offline page with every option at desktop and phone width, `svg` prints one option, and `check` reports broken wireframes.

### UI patterns

- A pattern page in `docs/frontend/patterns/` answers one group of recurring interface questions. Each pattern names its question, its default option, its compact behaviour and its rationale. Each option carries a wireframe in a closed text language, its rationale and its cost.
- The wireframe language, defined in `docs/frontend/patterns.md`, states structure and real copy, never style. An agent builds an option in its own stack and design system. A pattern ID is `litespec/frontend/patterns/<group>#<pattern>`.
- Record detail is the first group: 14 patterns and 101 options.

### Pins

- `litespec.manifest.json` pins the .NET 10 workspace (ASP.NET Core 10.0.13, Marten 9.50.1, Aspire 13.6.1, OpenTelemetry 1.19, Testcontainers 4.16.0, LiteBus `7.0.0-preview.6`), xUnit v3 on Microsoft.Testing.Platform with Reqnroll and LightBDD, and the web toolchain (Node 24.22.0, pnpm 11.28.5, Vite 8.3.4, TypeScript 6.0.3).
- Every schema's `$id` is its address on the published site: `https://litespec.dev/2.0.0/schemas/<file>`.
