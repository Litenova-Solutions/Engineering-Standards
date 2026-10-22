# Release Manifest

## Intent

`litespec.manifest.json` is the inventory of one LiteSpec release (one published version of the standard): the technology stacks, project shapes, extensions, and pinned versions it ships. A LiteSpec maintainer edits it when the release gains a stack or an extension, while a consumer (an application repository built against one pinned release) never edits it and instead pins the whole release and records the version it reviewed. This page lists every field with the current release's real values, states what each field drives, and shows how to add a stack or an extension.

## Reference

A consumer selects from this manifest: the [supported scope](../core/scope.md) page states how a selection is made, and the [stacks](../core/stacks.md) page states what a selection applies. The [project file](project-file.md) page states what a consumer records, the [init](../tools/init.md) page states how a new project starts from a preset, the [consumer](../tools/consumer.md) page states how a selection is validated, and the [validate](../tools/validate.md) page states how the manifest itself is checked.

### File Location and Schema

| Item | Value |
|:---|:---|
| Path | `litespec.manifest.json` at the repository root |
| Schema | `schemas/litespec-manifest.schema.json` |
| Current version | `2.0.0` |
| Schema version | `5` |

The current release is `2.0.0`. Each release is a complete contract that states every active provision, so a consumer pins one release and adopts a later one by accepting that release as a whole.

### Top-Level Fields

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `$schema` | string | no | none |
| `schemaVersion` | constant `5` | yes | none |
| `version` | string | yes | none |
| `name` | string | yes | none |
| `agentsEntry` | string | yes | none |
| `stacks` | object | yes | none |
| `shapes` | object | yes | none |
| `extensions` | object | no | none |
| `stack` | object | no | none |
| `packages` | object | no | none |
| `uiBaseline` | object | yes | none |
| `uiBaselineSvelte` | object | no | none |

What each field means and what reads it:

- `$schema` holds the editor hint that points at the manifest schema. Only the editor reads it.
- `schemaVersion` is the constant `5`. It names the exact manifest shape this release uses, so a consumer adopting a later release absorbs every difference at that moment.
- `version` is the release version, currently `"2.0.0"`. `litespec init` stamps it into a new `litespec.project.json` as `reviewedLiteSpecVersion`, and `litespec consumer` compares the two and fails the run when they differ.
- `name` is the distribution name, currently `"litespec"`.
- `agentsEntry` points at the agent entry page, currently `"AGENTS.md"`. The authoring validator checks that the path exists.
- `stacks` lists the stacks the release ships, by stack id. See the stacks table below.
- `shapes` lists the project shapes the release ships, by shape id. See the shapes table below.
- `extensions` lists the extensions the release ships, by extension id. See the extensions table below.
- `stack` pins the toolchain versions. See the pins section below.
- `packages` pins the package versions. See the pins section below.
- `uiBaseline` pins the controlled React baseline that `litespec ui` checks the shared package against. See the baseline section below.
- `uiBaselineSvelte` pins the controlled Svelte baseline. It has the same shape as `uiBaseline`, with the Svelte system names.

### Stacks

| Stack | Folder | Requires | Pairs with |
|:---|:---|:---|:---|
| `dotnet` | `docs/backend/dotnet` | none | any backend |
| `react` | `docs/frontend/web/react` | none | any backend |
| `svelte` | `docs/frontend/web/svelte` | none | any backend |
| `blazor` | `docs/frontend/blazor` | none | any backend |

Each entry holds `folder`, which is required, and the optional `requires` and `pairsWith` lists. The folder is the stack folder under `docs/backend/` or `docs/frontend/`, and it holds a `stack.md` page: the [.NET stack](../backend/dotnet/stack.md), the [React stack](../frontend/web/react/stack.md), the [Svelte stack](../frontend/web/svelte/stack.md), and the [Blazor stack](../frontend/blazor/stack.md). `requires` names the stacks a project also selects with this one, and `pairsWith` names the only backend stacks a frontend stack works beside; absent `pairsWith` means any backend. This release ships no `requires` and no `pairsWith` values.

What the field drives:

- Selection: the folder chain decides which pages apply when a consumer names the stack. A selection applies the stack folder, every folder above it up to its area root, and their subfolders that hold no stack. `litespec/core/stacks#apply-the-complete-stack` requires the whole selection.
- Validation: `litespec consumer` refuses a stack id the manifest does not ship. The authoring validator reports a stack folder that sits outside `docs/backend/` or `docs/frontend/`, a folder that does not exist, and a folder that holds no `stack.md`.

### Shapes

| Shape | Backend stacks | Backend pages |
|:---|:---|:---|
| `server` | `1` | none |
| `client-only` | `0` | `docs/backend/architecture.md`, `docs/backend/domain.md`, `docs/backend/application.md`, `docs/backend/identifiers.md` |

Each entry holds `backendStacks`, which is required, and the optional `backendPages` list. The `server` shape names exactly one backend stack. The `client-only` shape names no backend stack and still applies the four backend pages in the table, because a client-only product keeps a domain model. The authoring validator requires each backend page to sit directly in `docs/backend/`.

What the field drives:

- Selection: the shape decides how many backend stacks the `stacks` list holds and which backend pages apply without one.
- Init: each preset selects the shape. `dotnet-react` and `dotnet-svelte` select `server`, and `blazor-client` selects `client-only`.
- Validation: `litespec consumer` refuses a `client-only` project that names a backend stack and a `server` project whose backend count differs from one.

### Extensions

| Extension | Path | Scope | Switches on |
|:---|:---|:---|:---|
| `bdd` | `docs/backend/dotnet/ext/bdd.md` | `local` | `scenario` |
| `compat` | `docs/ext/compat.md` | `project` | none |
| `cache` | `docs/ext/cache.md` | `local` | `limit` |
| `concurrency` | `docs/ext/concurrency.md` | `local` | `limit` |
| `lifecycle` | `docs/ext/lifecycle.md` | `local` | `limit` |
| `containers` | `docs/ext/containers.md` | `project` | `limit`, `runbook` |
| `integrations` | `docs/ext/integrations.md` | `local` | none |
| `audit` | `docs/ext/audit.md` | `project` | none |
| `locale` | `docs/ext/locale.md` | `project` | none |
| `mcp` | `docs/ext/mcp.md` | `project` | none |
| `tenancy` | `docs/ext/tenancy.md` | `project` | none |
| `outbox` | `docs/ext/outbox.md` | `local` | `event`, `limit`, `runbook` |
| `efcore` | `docs/backend/dotnet/ext/efcore.md` | `local` | none |
| `realtime` | `docs/ext/realtime.md` | `local` | `event`, `limit` |
| `report` | `docs/ext/report.md` | `local` | `limit` |
| `jobs` | `docs/ext/jobs.md` | `local` | `limit`, `runbook` |
| `stage` | `docs/ext/stage.md` | `project` | none |
| `delegation` | `docs/ext/delegation.md` | `project` | none |
| `site` | `docs/ext/site.md` | `project` | none |

Each entry holds `path`, which is required, and the optional `activationScope`, `applicableKinds`, `replaces`, and `switchesOn`. The path is the extension page: `docs/ext/<id>.md` for an extension that supports every stack, or `<stack folder>/ext/<id>.md` for one that supports a single stack, such as `bdd` and `efcore` under `docs/backend/dotnet/`. The file name is the extension id. The scope is `project` or `local`. The kinds name the record types the extension applies to, such as `use-case` and `journey` for `bdd`. `switchesOn` names the record types a selection requires, such as `scenario` for `bdd` and `event`, `limit`, and `runbook` for `outbox`. The [extensions index](../ext/README.md) states each extension with its activation criterion.

Three extensions replace baseline provisions, and the manifest repeats the list where checks read it:

- `audit` replaces `litespec/quality/security#record-security-audit-events`.
- `outbox` replaces `litespec/backend/persistence#collect-events-without-a-public-unit-of-work`.
- `efcore` replaces the persistence and dependency provisions its Baseline relationship section names.

What the field drives:

- Selection: naming an extension id in `selectedExtensions` applies its page. `litespec/core/scope#select-conditional-extensions-explicitly` requires selecting every extension whose criteria apply and none whose do not.
- Validation: `litespec consumer` refuses an id the manifest does not ship, rejects a selection whose stack does not support the extension, and expires review dates and stage deferrals. The authoring validator checks each path, scope, kind list, and replacement id.

### Version Pins

The `stack` object pins the toolchain this release builds with:

| Tool | Version |
|:---|:---|
| `dotnet` | `10` |
| `postgresql` | `18` |
| `node` | `24.22.0` |
| `pnpm` | `11.28.5` |

The `packages` object pins the package versions in two maps, `nuget` and `npm`. The current release pins a full set of `LiteBus`, `Marten`, `Microsoft`, and test packages on the NuGet side and the React, Svelte, Vite, and validation packages on the npm side, such as `Marten` `9.50.1` and `tailwindcss` `4.3.3`. Read the manifest file for the full list, because the list is long and each release updates it.

What the pins drive:

- Resolution: every SDK, framework, and package version resolves from the manifest. `litespec/core/stacks#use-manifest-version-pins` requires the pins over prose, examples, and agent memory.
- UI validation: `litespec ui` reads the pinned npm packages and the baselines below when it checks the shared package and the stylesheets.

### UI Baselines

The `uiBaseline` object pins the controlled React baseline, and `uiBaselineSvelte` pins the controlled Svelte baseline with the same fields. The values below are the real values of the current release.

| Item | React value | Svelte value |
|:---|:---|:---|
| `platform` | `react` | `svelte` |
| `system` | `shadcn/ui` | `shadcn-svelte` |
| `styling` | `tailwindcss-v4` | `tailwindcss-v4` |
| `base` | `base-ui` | `bits-ui` |
| `style` | `nova` | `nova` |
| `cssVariables` | `true` | `true` |
| `baseColor` | `neutral` | `neutral` |
| `theme` | `neutral` | `neutral` |
| `chartColor` | `neutral` | `neutral` |
| `font` | `geist` | `geist` |
| `fontHeading` | `inherit` | `inherit` |
| `icons` | `lucide` | `lucide` |
| `radius` | `default` | `default` |
| `menuAccent` | `subtle` | `subtle` |
| `menuColor` | `default` | `default` |
| `componentsStyle` | `base-nova` | `base-nova` |
| `sourceModel` | `shared-ui-package` | `shared-ui-package` |
| `profiles` | `public-light`, `application-balanced`, `admin-dense` | `public-light`, `application-balanced`, `admin-dense` |
| `nativeBoundary` | `separate-platform-profile` | `separate-platform-profile` |

The `registry` block names the component source:

| Item | React value | Svelte value |
|:---|:---|:---|
| `name` | `shadcn` | `shadcn-svelte` |
| `url` | `https://ui.shadcn.com` | `https://shadcn-svelte.com/registry` |
| `allowAdditional` | `true` | `true` |

`litespec ui` selects the baseline by the shared package platform: a Svelte package reads `uiBaselineSvelte`, and any other package reads `uiBaseline`. It checks the registry configuration, the source lock, the design contract, the token stylesheet, and each frontend boundary against the baseline. `litespec/frontend/ui#select-one-visual-authority` requires the one shared package, and `litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package` requires the pin.

### How to Add a Stack

A stack is added in three steps:

1. Add the stack folder under `docs/backend/` or `docs/frontend/` with a `stack.md` page that states what the stack adds: its rules, its version pins, and its checks.
2. Add the manifest entry with the stack id and its `folder`, plus `requires` when a project also selects another stack with this one and `pairsWith` when a frontend stack works beside only some backend stacks.
3. Run `litespec validate` and fix what it reports: a folder outside the two areas, a missing folder, a missing `stack.md`, an unknown `requires` or `pairsWith` name, and any backend or frontend page no selection reaches.

### How to Add an Extension

An extension is added in three steps:

1. Write the extension page at `docs/ext/<id>.md`, or at `<stack folder>/ext/<id>.md` when it supports one stack only. The page uses the extension style with `Activation`, `Baseline relationship`, and `Dependencies` sections, and the Activation states the scope and the criterion.
2. Add the manifest entry with the extension id and its `path`, `activationScope`, `applicableKinds` where the extension applies to specific record kinds, `replaces` where it replaces baseline provisions, and `switchesOn` where selecting it requires record types.
3. Run `litespec validate` and fix what it reports: a path that does not exist, a path outside the two allowed shapes, a scope the page does not state, kinds the page does not match, a missing criterion, and a replacement id that names no active provision.

## Notes

The field lists follow `schemas/litespec-manifest.schema.json` and the values follow `litespec.manifest.json` at version `2.0.0`. The selection behavior follows `apps/cli/src/LiteSpec.Cli/Authoring/Layout.cs`. The manifest checks follow `apps/cli/src/LiteSpec.Cli/Authoring/StandardsValidator.Manifest.cs`. The consumer checks follow `apps/cli/src/LiteSpec.Cli/Consumer/ConsumerValidator.Project.cs`. The baseline checks follow `apps/cli/src/LiteSpec.Cli/Ui/UiValidator.cs`. The [cache extension](../ext/cache.md) and the [site extension](../ext/site.md) show the two extension paths: a shared page under `docs/ext/` and the index that explains each selection.
