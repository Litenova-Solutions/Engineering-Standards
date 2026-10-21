# LiteSpec 2.0.0 repository outline

This page states what every folder and file in the repository holds and why it is there. The tree and the tools follow it. Where it and another page disagree, fix one of them.

## 1. The repository

```text
LiteSpec/
├─ docs/                     The standard: every page a project applies, plus lookup and how-to pages (section 2)
├─ schemas/                  JSON Schema contracts, each with $id https://litespec.dev/<version>/schemas/<file>
│  ├─ litespec-manifest.schema.json   the release manifest
│  ├─ litespec-project.schema.json    a consumer's litespec.project.json
│  ├─ record.schema.json              the JSON frontmatter of every consumer record page and page style
│  ├─ language.schema.json            a consumer's docs/language.json (terms, mannered terms, rejected synonyms)
│  ├─ design-contract.schema.json     the metadata block of a consumer's UI design contract
│  ├─ ui-pattern-catalog.schema.json  a consumer's UI pattern catalog (decisions that cite LiteSpec patterns)
│  └─ ui-source-lock.schema.json      the lock of a consumer's shared UI package sources
├─ templates/
│  ├─ consumer/              Starting points a consumer copies: one file per record type and page style, the
│  │                         project file, the language file, the design contract, the UI catalog and source lock.
│  │                         README.md maps each template to the path it is copied to.
│  ├─ presets/               dotnet-react, dotnet-svelte, blazor-client: the stacks, shape and frontends
│  │                         `litespec init` writes into a new project file. A preset adds no rule.
│  └─ standard/              Seeds for LiteSpec's own pages: topic, extension, command, how-to, tutorial.
│                            The validator parses each one as a virtual page, so a seed always passes.
├─ litespec.manifest.json    The release: version, stacks, shapes, extensions, toolchain and package pins, UI baselines
├─ apps/
│  ├─ analyzers/             LiteSpec.Analyzers: Roslyn rules for .NET applications (section 9)
│  ├─ cli/                   The `litespec` command line (section 5)
│  └─ site/                  litespec.dev: a static Astro site built from the standard (section 8)
├─ assets/litespec-icon.svg  The product mark
├─ .github/                  CI workflow, pull request template, issue forms, Copilot adapter
├─ .agents/records/          Release working records for the owner's review (this page and decisions.md).
│                            .agents/delegate/ is ignored scratch for worker runs.
├─ AGENTS.md                 The canonical agent protocol for this repository and for consumers
├─ CLAUDE.md, GEMINI.md, .windsurfrules, .github/copilot-instructions.md
│                            Short adapters that send each agent to AGENTS.md
├─ README.md                 What LiteSpec is, how a consumer pins it, and this layout in brief
├─ CONTRIBUTING.md           How to change the standard: amendment order, review gates, releases
├─ CHANGELOG.md              The 2.0.0 contract in release-note form
├─ LICENSE                   MIT
├─ LiteSpec.slnx             Every .NET project in the repository
├─ Directory.Build.props     Build settings that shield this checkout from a consumer's own root files
├─ Directory.Packages.props  Central package pins for the CLI and its tests
└─ global.json               Selects Microsoft.Testing.Platform as the test runner (no SDK pin)
```

A consumer pins the repository root as a submodule at `litespec/`, so every path a consumer reads starts with `litespec/docs/`, `litespec/schemas/` or `litespec/templates/`.

## 2. The standard: docs/

```text
docs/
├─ README.md                 The human index: one line per page, by area
├─ learn/                    Explanation pages for people new to LiteSpec; no selection applies them
├─ core/                     Applies to every project
│  ├─ system.md              What LiteSpec is, the record catalogue, the consumer documentation layout
│  ├─ model.md               Record types, their homes, fields, links and the checks the model builder runs
│  ├─ product.md             Where business intent lives: the product brief and product topic pages
│  ├─ scope.md               One bounded context; one size, one shape, its stacks and its extensions
│  ├─ stacks.md              What selecting a stack applies, version pins, and replacement between pages
│  ├─ principles.md          Engineering principles for choices no narrower rule covers
│  ├─ agent.md               How an agent loads context, resolves precedence, preserves work and reports
│  ├─ authoring.md           The page styles, controlled prose, provision IDs and verification marks
│  ├─ maintaining.md         Provision lifecycle and publishing a release from a tag
│  └─ release.md             What a release of a consumer joins and the evidence it ships
├─ workspace/                Applies to every project: structure, naming, dependencies, config
├─ quality/                  Applies to every project: security, operations, ci
├─ backend/                  Backend principles, applied through a backend stack
│  │                         (api, application, architecture, domain, identifiers, persistence, testing)
│  └─ dotnet/                The dotnet stack: stack.md and the .NET realization of each principle,
│     │                      plus config, naming, packages and workspace
│     └─ ext/                Extensions for dotnet only: bdd, efcore
├─ frontend/                 Frontend principles, applied through any frontend stack
│  │                         (components, data, patterns, rendering, structure, testing, ui)
│  ├─ patterns/              UI pattern pages, one per group (section 4). Holds no stack, so it applies
│  │                         wherever frontend/ applies.
│  ├─ web/                   The shared TypeScript web realization for React and Svelte. A group, not a stack.
│  │  ├─ react/              The react stack: stack.md, components.md
│  │  └─ svelte/             The svelte stack: stack.md, components.md
│  └─ blazor/                The blazor stack: stack.md and its structure, rendering, components, data,
│                            browser and testing pages
├─ ext/                      Extensions any stack can select, with README.md as their index:
│                            audit, cache, compat, concurrency, containers, delegation, integrations, jobs,
│                            lifecycle, locale, mcp, outbox, realtime, report, site, stage, tenancy
├─ reference/                Lookup pages that own no provisions: provisions.md (generated), glossary.md,
│                            decision-records.md, audit-obligations.md
├─ tools/                    One page per `litespec` command, with README.md as their index
├─ tutorial/                 getting-started.md, model-domain.md
└─ guide/                    How-to pages: audit-trail.md
```

### What a project applies

Given a size, a shape (default `server`), its stacks and its selected extensions:

1. Every page directly in `docs/core/`, `docs/workspace/` and `docs/quality/`.
2. For each selected stack with folder `F`, every page directly in `F` and in each folder above it up to `docs/<area>/`. Selecting `react` applies `docs/frontend/`, `docs/frontend/web/` and `docs/frontend/web/react/`.
3. Each subfolder of those folders that holds no stack, such as `docs/frontend/patterns/`. A stack folder is one with a `stack.md` page, and `ext/` folders apply only by selection.
4. In the `client-only` shape, no backend stack, and the backend pages the shape lists in the manifest.
5. Each selected extension's page.
6. Precedence: a project Exception record, then an extension's `replaces`, then a deeper page, then a shallower page.

## 3. Provision identifiers

- A provision is a `###` heading under a page's `## Standards` (kind `rule`), `## Conventions` (kind `convention`) or, on a pattern page, `## Patterns` (kind `pattern`).
- Its ID is `litespec/<page>#<slug>`. `<page>` is the path under `docs/` without `.md`. `<slug>` is the heading's anchor: lowercase, backticks removed, characters other than letters, digits, spaces and hyphens removed, spaces turned into hyphens.
- The heading carries no ID text. A rule or convention heading starts with an action verb. A pattern heading is the pattern's name, so its ID survives a change of default.
- `docs/reference/provisions.md` lists every provision with its kind and verification mark. `litespec provisions` writes it.

## 4. UI patterns

- `docs/frontend/patterns.md` defines the pattern catalog a consumer keeps, the pattern page format and the wireframe language.
- `docs/frontend/patterns/<group>.md` holds one group: page frames, lists and tables, record detail, forms and fields, dialogs and overlays, create, edit and remove, feedback and states, navigation, money, time and density, and admin screens.
- Each pattern names its question, its default option, its compact behaviour and its rationale. Each option carries a `wireframe` block, an optional `wireframe compact` block, its rationale and its cost.
- `litespec patterns preview` draws every option at 1200 and 390 pixels for a person to choose. No drawing is committed.
- A consumer's catalog cites a pattern by its ID in `library`, keeps its option ids and names, and records the option it chose.

## 5. The command line: apps/cli/

```text
apps/cli/
├─ src/LiteSpec.Cli/          The `litespec` tool (packable as a .NET tool)
│  ├─ Program.cs, CliArgs.cs, CliJson.cs, LiteSpecHome.cs
│  │                          Command dispatch, option parsing, JSON with \n line ends, and finding the checkout
│  ├─ Authoring/              `validate` and `provisions`: page styles, prose, IDs, manifest, stack layout
│  ├─ Consumer/               `consumer`: the project file, the selection, record pages, prose and language
│  ├─ Ui/                     `ui`: the controlled web UI contract, the pattern catalog and design contract
│  ├─ Model/                  `model build|check|render|query`: records, readers per stack, links and findings
│  │  └─ Readers/             Dotnet (Roslyn, TRX), TypeScript (React and Svelte routes), JUnit
│  ├─ Book/                   `book`: the static project book generated from model.json
│  ├─ Patterns/               `patterns preview|svg|check`: the pattern page reader, wireframe parser and renderer
│  ├─ Init/                   `init`: a project file from a preset
│  └─ Schemas/                The JSON Schema evaluator every validator uses
└─ tests/LiteSpec.Cli.Tests/  xUnit v3 on Microsoft.Testing.Platform, one folder per command
   ├─ Support/                The CLI runner and the input-error contract
   └─ Fixtures/               Model/ (small and large library consumers, broken/ overlays per finding code,
                              junit/ and trx/ results) and Book/ (frozen model and findings)
```

## 6. The manifest

- `stacks.<id>.folder` names each stack's folder, and its kind is the area that folder sits in. Optional `requires` and `pairsWith` hold pairing rules.
- `shapes` holds `server` (one backend stack) and `client-only` (no backend stack, with the backend pages it applies).
- `extensions.<id>.path` names each extension page. An extension under a stack's `ext/` folder supports that stack only.
- The pins: the .NET workspace, test, and web toolchain versions, and the UI baselines per web stack.

## 7. The project file

A consumer's `litespec.project.json` names its `size`, `shape`, `stacks`, `paths` (record roots, code roots, frontends, UI files) and `selectedExtensions`, and records `reviewedLiteSpecVersion`. `litespec init --preset <name> --size <small|large>` writes a first one. `litespec consumer` refuses a stack the release does not ship, a `server` project without exactly one backend stack, a `client-only` project naming one, a frontend platform the project does not name, an unmet `requires` or `pairsWith`, and an extension whose stack is not selected.

## 8. The site: apps/site/

```text
apps/site/
├─ astro.config.mjs          Static output; writes Cloudflare's _redirects (/latest -> the release) after the build
├─ package.json              Astro 7, @astrojs/markdown-remark, Pagefind
├─ pnpm-workspace.yaml       Allows esbuild's install script, which Astro's bundler needs
└─ src/
   ├─ lib/spec.ts            The one loader: manifest, pages, provisions, selections, layers and every URL
   ├─ lib/agent-text.ts      Text builders for llms.txt, indexes and bundles
   ├─ lib/render-markdown.ts Markdown to HTML with LiteSpec's heading slugs, provision cards and wireframe options
   ├─ lib/wireframe/         The TypeScript wireframe parser and renderer, tested against golden SVGs from the CLI
   ├─ lib/areas.ts, icons.ts Area order, labels and icons; the line icon set
   ├─ styles/                site.css (palette, tokens, frame, shared parts), docs.css, prose.css, select.css
   ├─ layouts/Base.astro     The framed column, header, footer and copy buttons
   ├─ components/            Icon, Mark, Search, ThemeSwitcher, the docs sidebar tree, the page contents list, the selection form
   └─ pages/                 The landing page, the release home, one page per spec page, the selection page,
                             and the agent endpoints: llms.txt, raw .md, selection indexes, layer bundles, schemas
```

`pnpm exec astro build` in `apps/site/` writes `dist/`. The CI job `site` runs the wireframe tests and the build.

## 9. The analyzers: apps/analyzers/

```text
apps/analyzers/
├─ src/LiteSpec.Analyzers/      The NuGet package: netstandard2.0, Roslyn 4.14
│  ├─ Layers/                   Layer and LayerResolver: the LiteSpecLayer property, else the assembly name suffix
│  ├─ Rules/                    Descriptors (every diagnostic and its provision), LayerAnalyzer (the shared base),
│  │                            and one analyzer per rule under Domain/, Layers/ and Style/
│  ├─ build/                    The props that make LiteSpecLayer visible to the analyzers
│  └─ AnalyzerReleases.*.md     Roslyn release tracking for the rule IDs
└─ tests/LiteSpec.Analyzers.Tests/  One test class per analyzer; Support/Verify compiles marked sources
```

`dotnet test --solution LiteSpec.slnx` runs the analyzer tests with the CLI tests, and the CI job packs the analyzer.
