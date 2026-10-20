# LiteSpec 2.0.0 structure and identifier grammar

Status: built on `release/v2.0.0` (2026-10-20), approved by the owner. This page is the target the tree and the tools follow. Where it and older pages disagree, this page wins.

## 1. The tree

```
docs/
├─ core/                 always applies: system, model, principles, scope, stacks, agent, authoring, maintaining, release, product
├─ workspace/            always applies: repository, naming, dependency and configuration principles
├─ quality/              always applies: security, operations, ci
├─ ext/                  extensions any stack can select
├─ backend/              backend principles: apply through a backend stack (or the client-only subset, section 4)
│  └─ dotnet/            the dotnet stack: stack.md + architecture, domain, application, persistence, api, testing,
│     │                  workspace, naming, packages, config
│     └─ ext/            extensions for dotnet only: efcore.md, bdd.md
├─ frontend/             frontend principles: apply through any frontend stack
│  ├─ web/               shared TypeScript web realization (generated TS client, TanStack, shadcn, Vitest, pnpm).
│  │  │                  A group, not a stack: it has no stack.md and cannot be selected.
│  │  ├─ react/          the react stack: stack.md, components.md
│  │  └─ svelte/         the svelte stack: stack.md, components.md
│  ├─ blazor/            the blazor stack: stack.md, structure, rendering, components, data, browser, testing
│  └─ patterns/          UI pattern pages, one per group (record-detail.md). Holds no stack, so it applies
│                        wherever frontend/ applies.
├─ tools/  reference/  tutorial/  guide/      no provisions are applied from here by selection
└─ README.md
```

Moves from the 2.0.0 working tree:

| From | To |
|:---|:---|
| `docs/dotnet/*.md` | `docs/backend/dotnet/*.md` |
| `docs/profile/dotnet.md` | `docs/backend/dotnet/stack.md` |
| `docs/profile/stacks.md` | `docs/core/stacks.md` (its Composition section is dropped) |
| `docs/react/components.md`, `docs/profile/react.md` | `docs/frontend/web/react/components.md`, `.../react/stack.md` |
| `docs/svelte/components.md`, `docs/profile/svelte.md` | `docs/frontend/web/svelte/components.md`, `.../svelte/stack.md` |
| `docs/blazor/*.md`, `docs/profile/blazor.md` | `docs/frontend/blazor/*.md`, `.../blazor/stack.md` |
| `docs/ext/efcore.md`, `docs/ext/bdd.md` | `docs/backend/dotnet/ext/efcore.md`, `.../ext/bdd.md` |
| `docs/frontend/*.md` | split: principles stay in `docs/frontend/`, the TypeScript web realization moves to `docs/frontend/web/` |

The `profile/` area and the stack pages' Composition sections no longer exist.

## 2. Provision identifiers

- A **provision** is a `###` heading inside a page's `## Standards` (a rule) or `## Conventions` (a convention) section, on any page under `docs/` except `docs/tools/`, `docs/reference/`, `docs/tutorial/`, `docs/guide/` and `README.md` files.
- Its **ID** is `litespec/<page>#<slug>`:
  - `<page>` is the page's path relative to `docs/`, forward slashes, without `.md`: `backend/dotnet/domain`.
  - `<slug>` is the heading's slug: lowercase, backticks removed, every character other than `a-z`, `0-9`, space and hyphen removed, trimmed, runs of spaces replaced by one hyphen, runs of hyphens collapsed. This equals GitHub's and the site's heading anchor.
  - Example: `docs/backend/dotnet/domain.md`, heading `Model every closed set of domain values without enums` → `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`.
- **The heading carries no ID text.** `### Retire records with replaces`, never `### Retire records with replaces (litespec/...)`. The ID is computed from the path and the heading.
- Two provisions on one page with the same slug are a duplicate.
- The pattern that recognizes an ID in text: `litespec/[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*#[a-z0-9]+(?:-[a-z0-9]+)*`.
- A **citation** is any occurrence of that pattern in a page, template, schema, manifest, test fixture, code string or the model. Every citation must resolve to a provision in the release.
- Agent Summary bullets end with the full IDs they summarize in parentheses, as before. The Verification table's first column holds full IDs, as before.
- A provision's kind is its section: `rule` under Standards, `convention` under Conventions.

## 3. The manifest

```json
{
  "stacks": {
    "dotnet": { "folder": "docs/backend/dotnet" },
    "react":  { "folder": "docs/frontend/web/react" },
    "svelte": { "folder": "docs/frontend/web/svelte" },
    "blazor": { "folder": "docs/frontend/blazor" }
  },
  "shapes": {
    "server":      { "backendStacks": 1 },
    "client-only": { "backendStacks": 0, "backendPages": ["docs/backend/architecture.md", "docs/backend/domain.md", "docs/backend/application.md", "docs/backend/identifiers.md"] }
  },
  "extensions": { "efcore": { "path": "docs/backend/dotnet/ext/efcore.md", "...": "..." } }
}
```

- A stack's **kind** is the area its folder sits in: `docs/backend/...` is a backend stack, `docs/frontend/...` a frontend stack.
- A stack folder holds a `stack.md`; a group folder (`docs/frontend/web/`) does not.
- `requires` (optional) names stacks a project must also select with this one, and `pairsWith` (optional) names the only backend stacks a frontend stack works beside; absent means any. No 2.0.0 stack uses either; both exist so a later pairing rule has a checked home.
- An extension under a stack folder's `ext/` supports that stack only; an extension under `docs/ext/` supports every stack. The location replaces the `stacks` field.
- `specification`, `kind`, `entry`, `pages` and `provisionRegistry` no longer exist. The pages a selection applies are computed (section 4).

## 4. What a project applies

Given `size`, `shape` (default `server`), `stacks` and `selectedExtensions`:

1. Every page directly in `docs/core/`, `docs/workspace/` and `docs/quality/`.
2. For each selected stack with folder `F`: every page **directly** in `F` and in each folder between `docs/<area>/` and `F`, inclusive of `docs/<area>/` itself. Pages in sibling folders, in nested stack folders and in `ext/` folders are not included. Selecting `react` applies `docs/frontend/*.md`, `docs/frontend/web/*.md` and `docs/frontend/web/react/*.md`. A subfolder of any of those folders that holds no stack, such as `docs/frontend/patterns/`, applies with it; a stack folder is one with a `stack.md` page.
3. In the `client-only` shape: no backend stack, and the backend pages the shape lists.
4. Each selected extension's page.
5. A deeper page, a selected extension's `replaces`, and a project Exception record replace the named provision of a shallower page. Order of precedence: project exception, extension, deeper page, shallower page.

## 5. The project file

```json
{
  "size": "small",
  "shape": "server",
  "stacks": ["dotnet", "react"],
  "paths": { "frontends": [{ "name": "web", "path": "apps/web", "platform": "react" }] },
  "selectedExtensions": ["outbox"]
}
```

`litespec consumer` refuses: a stack the release does not ship; a `server` project naming other than exactly one backend stack; a `client-only` project naming a backend stack; a frontend `platform` that is not a frontend stack the project names; a stack whose `requires` is not also named; a frontend stack whose `pairsWith` excludes the project's backend stack; an extension whose stack the project does not name.

## 6. Presets

`templates/presets/<name>.json` holds a ready-made `stacks`, `shape` and frontend list: `dotnet-react`, `dotnet-svelte`, and `blazor-client` (shape `client-only`, stacks `["blazor"]`). `litespec init --preset <name> --size <small|large> [--root <path>]` writes `litespec.project.json` from it with the release's `reviewedLiteSpecVersion`, and refuses to overwrite an existing file. A preset adds no rule.

## 7. The provision index

`docs/reference/provisions.md` lists every provision: one `##` section per top-level area (`core`, `workspace`, `quality`, `ext`, `backend`, `frontend`), rows sorted by ID ordinally, columns `ID | Provision | Kind | Mark | Evidence`, the Provision cell linking `[heading](../<page>.md#<slug>)`.


## 9. How it was built

- 7 Muse workers split the 7 frontend pages into principles and `frontend/web/` pages and folded the 5 matching Blazor pages into realizations: all 156 original frontend and Blazor provisions are mapped, 51 of them split.
- 5 Muse workers moved the code: `litespec validate` and `litespec provisions` to the new grammar (`ID_IN_HEADING` added), the manifest checks to folder stacks (`STACK_FOLDER`, `STACK_REFERENCE`, `EXTENSION_LOCATION`, `EXTENSION_UNLISTED`, `LAYER_UNREACHABLE`, `SHAPE_PAGE`) with a shared `Layout` computation, `litespec consumer` and `litespec ui` to shapes and stacks, `litespec model` to the new citations, and the new `litespec init` with three presets.
- The judge converted the tree with one script: page moves with history, IDs stripped from headings, 2186 citations and every relative link rewritten, the manifest reshaped.
- Retired: `profile/`, every Composition section, Blazor's "List excluded baselines" rule (the client-only shape replaces it), and the dead provision-registry code.
- Added: `litespec/core/authoring#keep-identifiers-out-of-provision-headings`.
- Found while verifying, and fixed: `litespec ui` matched exception records by the old ID layout, so no UI exception ever expired; `litespec init --preset blazor-client` kept a UI package no frontend uses.
- Clean slate (2026-10-20, owner): 2.0.0 carries no migration or compatibility material. Removed the checks that refused 1.x identifier forms (`REMOVED_IDENTIFIER`, `WORKFLOW_KIND`, `identifier-refused-form`, the old-form deferral refusal), the provision "Reject the retired identifier forms", the 1.x changelog archive, the old-to-new ID map, the `defaultProfile` manifest field, and the default that read a project without `stacks` as dotnet. The changelog describes 2.0.0 as a first release.
- Result: 1103 provisions, `litespec validate` clean, 419 tests pass.
