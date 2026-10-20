# Design: the specification and its stack bindings

Status: built on `release/v2.0.0` (2026-10-20). The owner approved the direction and asked for the recommended answers: the area is `dotnet`, a principle and its realization are two provisions with two IDs, and workspace splits the same way.

## Problem

LiteSpec should accept other backends later (Go, Java, Python, Node) without a second rewrite. Today it can't:

- `litespec/rule/core-scope.select-a-size-profile-and-stacks` requires "the backend stack always dotnet".
- `docs/backend/` mixes stack-neutral rules ("Point dependencies inward", "Treat aggregates as consistency boundaries") with .NET realizations ("Use five application projects", "Use one public assembly marker per scanned project").
- `docs/workspace/` mixes the same way ("Pin every dependency centrally" next to "Centralize NuGet versions" and "Commit the tool manifest").
- The manifest's `stacks.dotnet.pages` lists 30 pages, including the frontend pages, so a stack is "everything" rather than its own binding.
- The model builder reads C# (Roslyn), TypeScript and Svelte routes, TRX results and Reqnroll or LightBDD scenarios, with no seam between the stack-neutral checks and the per-language reading.

Frontend already shows the right pattern: stack-neutral pages under `docs/frontend/` and per-stack pages under `docs/react/`, `docs/svelte/` and `docs/blazor/`. The design applies that pattern everywhere.

Measured on 2026-10-20: of 1010 provisions, about 600 are written without a stack (core 182, most of ext's 397, quality 57, profile 13), and about 340 assume .NET (backend 140, workspace 52, blazor 48, efcore 95, part of bdd). Counts come from term searches, not a reading of every rule.

## Decisions

### S1. Two layers

1. **The specification** applies to every consumer: records and the model, authoring, product, quality, the sizes, the stack-neutral backend and frontend rules, and the stack-neutral extensions.
2. **A stack binding** applies when a consumer selects that stack. Each binding has a kind, `backend` or `frontend`. A consumer selects exactly one backend binding and one frontend binding per frontend.

2.0.0 ships one backend binding (`dotnet`) and three frontend bindings (`react`, `svelte`, `blazor-web`). A later release adds a backend binding without changing the specification layer.

### S2. Docs layout: one area per binding, flat

- Specification areas keep their names: `core`, `profile`, `quality`, `backend`, `frontend`, `workspace`, `ext`, `reference`, `tutorial`, `tools`.
- Binding areas are named after the stack: `docs/dotnet/` (new), `docs/react/`, `docs/svelte/`, `docs/blazor/`. A future `docs/go/` sits beside them.
- Areas stay flat, so provision IDs keep the `<area>-<stem>` page segment: a moved rule becomes `litespec/rule/dotnet-domain.<slug>`.
- `docs/backend/<page>.md` keeps the rule as a principle; `docs/dotnet/<page>.md` states how .NET realizes it and cites the principle. Example:
  - Specification: "Model every closed set of domain values as a closed type hierarchy" (`backend-domain`).
  - .NET binding: "Model a closed set as an abstract record with sealed record cases, never an enum" (`dotnet-domain`).
- Where a rule has no stack-neutral core ("Use one public assembly marker per scanned project"), it moves to the binding whole.
- An extension that is binding-only says so: `efcore` becomes a `dotnet` extension; `bdd` keeps its neutral rules and moves the Reqnroll and LightBDD runner rules into the `dotnet` binding.

Provision IDs of moved rules change. That is allowed now and costly after the `v2.0.0` tag (`litespec/rule/core-authoring.exclude-cross-release-compatibility-work` forbids aliases, so a later move would break every consumer citation).

### S3. Manifest shape

```json
{
  "specification": { "pages": ["docs/core/model.md", "docs/backend/domain.md", "..."] },
  "stacks": {
    "dotnet":     { "kind": "backend",  "pages": ["docs/dotnet/domain.md", "..."], "readers": ["csharp", "trx", "openapi"] },
    "react":      { "kind": "frontend", "pages": ["docs/react/components.md", "..."], "readers": ["typescript-routes"] },
    "svelte":     { "kind": "frontend", "pages": ["..."], "readers": ["svelte-routes"] },
    "blazor-web": { "kind": "frontend", "pages": ["..."], "readers": ["razor-routes"] }
  },
  "extensions": { "efcore": { "stack": "dotnet", "...": "..." } }
}
```

- The pages a consumer must apply are the specification pages, plus the pages of each selected stack, plus the selected extensions.
- Package pins move under their stack, so a Go binding later brings its own pins without touching .NET's.
- `litespec validate` checks that every page under `docs/` is listed exactly once (specification or one stack), and that a binding page cites the specification provision it realizes.

### S4. The scope rule

`core-scope.select-a-size-profile-and-stacks` becomes: "A consumer MUST select the small or large size, one backend stack, and one frontend stack per frontend, from the stacks the release ships." The 2.0.0 manifest ships one backend stack, so the effect today is unchanged.

### S5. The binding contract for the model builder

The model check is the product's core promise, so a binding is defined by what the builder can read for it. Each backend binding answers six questions; each frontend binding answers one:

| Question | Neutral form | 2.0.0 .NET answer |
|:---|:---|:---|
| Which code implements a use case? | A handler found by the module and use-case folder rule, or an `<implements>use-case/...</implements>` tag in any comment | Roslyn over `*.Application` |
| Which code raises a refusal? | The failure code as a string literal | Roslyn literals |
| Which reactions and jobs exist? | A reaction or job type with an `<implements>` tag | Roslyn, by interface |
| Which endpoint reaches a use case? | The OpenAPI document: operation to use case | Roslyn over `*.WebApi` (move to OpenAPI) |
| Which test proves a case? | A `<proves>case/...</proves>` tag in any comment | Reqnroll and LightBDD readers |
| Did the test pass? | A JUnit XML or TRX result file | TRX |
| Which screen calls which operation? (frontend) | The route's calls into the generated client | TypeScript, Svelte, Razor readers |

Two choices make the next backend cheap:

- **The tags are plain text in comments.** `<implements>` and `<proves>` already work in a `//`, `#` or `--` comment in any language, so the contract needs no per-language syntax.
- **JUnit XML is the neutral result format.** Every major test runner writes it (Go, JUnit, pytest, Jest, Vitest, and .NET through a logger). Adding a JUnit reader beside TRX makes "did it pass" stack-neutral in 2.0.0.

### S6. The builder's code layout

```
src/LiteSpec.Cli/Model/            records, links, checks, rendering, query: stack-neutral
src/LiteSpec.Cli/Model/Readers/    the reader contract: IBackendReader, IFrontendReader, ITestReader, ITestRunReader
src/LiteSpec.Cli/Model/Readers/Dotnet/      C#, Reqnroll, LightBDD, TRX
src/LiteSpec.Cli/Model/Readers/TypeScript/  React and Svelte routes, generated client
src/LiteSpec.Cli/Model/Readers/Razor/       Blazor routes
src/LiteSpec.Cli/Model/Readers/JUnit/       JUnit XML results
```

The manifest's `readers` list picks the readers for a consumer's stacks. Readers ship inside the CLI for each release; there is no plugin loading. `model.json` stays stack-neutral: it records handlers, events, routes and scenarios, not C# types.

### S7. Enforcement packages per binding

Each binding may ship its own enforcement in its ecosystem's tool, with every diagnostic naming its provision ID and linking to `litespec.dev`:

- `dotnet`: `LiteSpec.Analyzers` on NuGet (planned for 2.1).
- A future `go` binding: a `go vet` analyzer; a future TypeScript backend: an ESLint plugin.

The CLI stays the one cross-stack tool.

### S8. The site

The litespec.dev contents page (direction A, chosen 2026-10-20) has two parts:

1. **Specification:** core, records and the model, product, quality, sizes, the backend and frontend principles, and extensions.
2. **Stacks:** one entry per binding (`dotnet`, `react`, `svelte`, `blazor-web`), each listing its pages, what the model builder reads for it, and its tools.

URLs keep the release and page: `litespec.dev/2.0.0/dotnet/domain`.

## Scope for 2.0.0

| Work | In 2.0.0 | Later |
|:---|:---|:---|
| Two-layer manifest, stack `kind`, per-stack pins, validator checks (S3) | yes | |
| Scope rule wording (S4) | yes | |
| `docs/dotnet/` area; split `backend/*`, `workspace/*`, `bdd`, `efcore` (S2) | yes | |
| Reader contract and moving today's readers behind it (S6) | yes | |
| JUnit XML result reader (S5) | yes | |
| Endpoint mapping from OpenAPI (S5) | | 2.1 |
| `LiteSpec.Analyzers` (S7) | | 2.1 |
| A second backend binding | | when needed |

## How the split would be done

1. Classify every provision on `docs/backend/*.md`, `docs/workspace/*.md`, `docs/ext/bdd.md` and `docs/ext/efcore.md` as `specification`, `binding`, or `both` (principle stays, realization moves), into one reviewable table. The owner reviews the table before any page moves.
2. Move and rewrite per the table, one page per worker, each binding provision citing the principle it realizes.
3. Restructure the manifest, the scope rule, the stack composition page `docs/profile/stacks.md`, and the CLI's stack composition check.
4. Regenerate the provision index, and update every citation of a moved ID across `docs/`, `templates/`, `AGENTS.md` and the tests.
5. Refactor the builder behind the reader contract and add the JUnit reader, with the model fixtures proving the readers produce the same model as before.

## Built

- 192 provisions classified by 11 Muse workers: 139 stay as specification, 13 moved to `dotnet-*`, 40 split into a neutral principle and a .NET realization; 37 citations rewritten across the repository (neutral pages cite the principle, everything else the realization, plus the workers' per-line requests).
- `docs/dotnet/` holds 10 pages (`architecture`, `domain`, `application`, `persistence`, `api`, `testing`, `workspace`, `naming`, `packages`, `config`); `docs/profile/dotnet.md` is the stack page. `backend/identifiers.md` had no .NET rule, so it has no binding page.
- The manifest has `specification` (24 pages) and stacks with `kind`, `entry` and their own pages; `efcore` and `bdd` declare `stacks: ["dotnet"]`. The React and Svelte stacks share the `frontend/` pages; Blazor has its own.
- `litespec validate` checks each layer's Composition section against the manifest (the check existed but never ran, because no stack had an `entry`), reports a page in no layer (`LAYER_UNLISTED`) or in both (`LAYER_OVERLAP`), and an extension naming an unknown stack (`EXTENSION_STACK_UNKNOWN`).
- `litespec consumer` requires exactly one backend stack, refuses a stack the release does not ship, and no longer accepts `dotnet` as a frontend platform (it did before, because it treated every manifest stack as a platform).
- The model builder reads through `IBackendReader`, `IFrontendReader`, `IScenarioReader` and `ITestRunReader` (`src/LiteSpec.Cli/Model/Readers/`), and reads JUnit XML beside TRX. `model.json` and `model check` output are byte-identical to the previous build on both fixtures.
- 1052 provisions; 366 tests pass.

## Limits fixed on 2026-10-20

- The builder read screens for Svelte frontends only. It now reads React routes too: a file under `src/routes` declaring `createFileRoute("...")` is a screen at that address, without pathless `_layout` segments and route groups; `__root`, `.lazy.` files and `-` prefixed paths declare no screen of their own, and a lazy file is followed as part of its route.
- Two neutral verification rows on `backend/application.md` named `dotnet test`. They are guidance rows now, since a stack-neutral rule cannot name one stack's command.
- `litespec consumer` refuses a stack-scoped extension (`stacks` in the manifest) when the project names none of its stacks.

## Questions that were open

1. **Area name for the .NET binding:** `dotnet` (matches the stack ID; recommended) or `backend-dotnet`.
2. **`both` rules:** keep the principle and the realization as two provisions with two IDs (recommended, since a future Go binding cites the same principle), or keep one provision with a per-stack section, the way frontend pages do today.
3. **Workspace:** split it the same way (recommended), or treat the whole workspace area as the .NET binding for now.
