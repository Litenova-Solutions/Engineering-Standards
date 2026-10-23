# Project File

## Intent

`litespec.project.json` is the one record of what a consumer project (an application repository built against one pinned LiteSpec release) selected: its size, shape, technology stacks, extensions, owners, paths, and pinned release. The owner edits it when the selection changes and validates it with the `litespec consumer` command before relying on it. This page lists every field the file holds, states what reads each field, and shows the errors a wrong value produces.

## Reference

The [supported scope](../core/scope.md) page states which sizes, shapes, stacks, and extensions a project can select. The [stacks](../core/stacks.md) page states what selecting a stack applies. The [init](../tools/init.md) page states how a new file is written, the [consumer](../tools/consumer.md) page states how it is validated, and the [model](../tools/model.md) page states how paths feed the project model. Terms such as stack, shape, size, extension, and preset follow the [glossary](glossary.md).

### File Location and Schema

| Item | Value |
|:---|:---|
| Path | `litespec.project.json` at the consumer root |
| Schema | `schemas/litespec-project.schema.json` in the pinned release |
| Template | `templates/consumer/litespec.project.json` in the release the tool carries |
| Presets | `templates/presets/blazor-client.json`, `templates/presets/dotnet-react.json`, `templates/presets/dotnet-svelte.json` |

`litespec init` merges the template with one preset and stamps the size, name, and reviewed release. `litespec consumer` validates the written file against the schema and then runs the selection checks below. The model builder reads the paths, stack config, size, shape, stacks, and owners from the same file.

### Top-Level Fields

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `$schema` | string | no | none |
| `project` | object | yes | none |
| `size` | string | yes | none |
| `shape` | string | no | `"server"` |
| `stacks` | array of string | yes | none |
| `optionalTypes` | array of string | no | none |
| `proof` | object | no | none |
| `constraints` | object | no | none |
| `owners` | array of string or object | no | none |
| `review` | object | no | none |
| `adoption` | object | no | none |
| `refusals` | object | no | the default codes |
| `reviewedLiteSpecVersion` | string | yes | none |
| `paths` | object | yes | none |
| `exampleWordLimit` | integer | no | `120` |
| `prohibitedKinds` | array of string | no | none |
| `selectedExtensions` | array of object | yes | none |
| `stackConfig` | object | no | none |

What each field means and what reads it:

- `$schema` holds the editor hint that points at the project schema. Only the editor reads it.
- `project` names the project and its identifier sources. `litespec consumer` checks it against the schema. See the `project` object below.
- `size` is `small` or `large`. Small requires the core record types with Architecture and Integration test projects, and large adds goals, problems, features, journeys, and scenarios with the Acceptance project. `litespec consumer` checks the value, and the model builder sizes the record set it expects.
- `shape` is `server` or `client-only`. A server names exactly one backend stack, and a client-only project names no backend stack. `litespec init` writes it from the preset, `litespec consumer` checks the backend count, and the model builder applies the shape.
- `stacks` lists the selected stack ids: `dotnet` for the backend and one entry per frontend from its platform. `litespec consumer` refuses an id the pinned release does not ship.
- `optionalTypes` lists the extra record types written beside what the size requires: `goal`, `constraint`, `research`, `external-system`, `setting`, and `runbook`. The model builder reads the list when it collects records.
- `proof` tunes how the model builder confirms proof claims for the project. See the `proof` object below.
- `constraints` records whether any outside constraint applies to the project. See the `constraints` object below.
- `owners` is the closed list of names a record owner comes from. Each entry is a plain name, such as `"shop-team"`, or an object mapping a readable name to its CODEOWNERS handles, such as `{"name": "Shop engineering", "codeowners": ["@shop/team"]}`. The model builder reads the list and reports whether one is declared. See the `owners` entry below.
- `review` names the review settings: the veto window and the security reviewer. See the `review` object below.
- `adoption` names the decision that ends transcription mode. See the `adoption` object below.
- `refusals` names the codes the derived generic results carry. See the `refusals` object below.
- `reviewedLiteSpecVersion` records the LiteSpec release whose complete contract the project last reviewed, such as `"3.0.0"`. `litespec consumer` compares it with the release of the installed `litespec` tool and fails the run when the two differ.
- `paths` declares every location the tools read. See the `paths` object below.
- `exampleWordLimit` bounds the words in an Example section. When omitted, the recorded default of `120` applies, and the validator refuses a value below `40`.
- `prohibitedKinds` lists the record types or page styles the consumer does not use. A page that declares one is refused.
- `selectedExtensions` lists the extensions the project selected, each with its criterion and review date. See the extension entry below.
- `stackConfig` holds per-stack configuration keyed by stack id. See the `stackConfig.dotnet` object below.

### The `project` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `name` | string | yes | none |
| `identifierSource` | string | no | the project name in lower kebab case |
| `citedSources` | array of string | no | none |

What each field means and what reads it:

- `name` is the project name, such as `"shop"`. `litespec init` sets it from `--name` or from the root folder name. Use lower kebab case to match the default identifier source.
- `identifierSource` is the source segment the project's own identifiers carry in a cross-source citation. It matches `^[a-z][a-z0-9-]*$`.
- `citedSources` lists the other sources a citation in the project can name, beside `owasp`, `rfc`, and `litespec`. Each entry matches `^[a-z][a-z0-9-]*$`.

### The `proof` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `jobTriggerSteps` | array of string | no | none |
| `outcomeOnlySteps` | array of string | no | none |

What each field means and what reads it:

- `jobTriggerSteps` names the steps classes whose `when` steps run a job, such as one that moves a simulated clock. Each entry matches `^[A-Z][A-Za-z0-9]*$`.
- `outcomeOnlySteps` names the steps classes whose `then` steps state only that a request succeeded or was refused. Each entry matches `^[A-Z][A-Za-z0-9]*$`.
- The model builder reads both lists when it confirms proof claims for the project.

### The `constraints` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `answered` | boolean constant `true` | yes | none |

This object is included once the project states which outside constraints apply to it, possibly none. `litespec/core/scope#answer-the-constraints-question` requires the statement, and an empty answer records that no outside rule binds the project.

### The `review` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `vetoWindowDays` | integer | no | `7` |
| `securityReviewer` | string | no | none |

What each field means and what reads it:

- `vetoWindowDays` is the days after `decideBy` in which a tier-3 draft question carrying `recommended` auto-approves unless vetoed, recorded as `approvedBy: auto (veto window)`. The model builder reads it when it reports aged questions, and the book reads it for the auto-approval date on the ballots page.
- `securityReviewer` is the owner name holding the security reviewer role. The behavior diff lists the security queue for this reviewer: changes widening access tenant scope to cross, new `calls` effects, and new personal or sensitive data classes. `litespec model check` reports a name the owners list does not hold.

### The `adoption` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `transcriptionEndsWith` | string | yes | none |

`transcriptionEndsWith` names the decision that ends transcription mode, such as `"decision/0084-promote-to-production"`. Before that decision is approved, a Behavior record marked `source: transcribed` may be `draft` but never `reviewed`. After it is approved, any remaining transcribed record fails `transcribed-after-adoption`.

### The `refusals` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `forbidden` | string | no | `"authorization.forbidden"` |
| `invalidInput` | string | no | `"request.validation-failed"` |

What each field means and what reads it:

- `forbidden` is the code the derived `result/<use-case-home.name>.forbidden` carries, derived for a use case whose `access.grant` is a permission.
- `invalidInput` is the code the derived `result/<use-case-home.name>.invalid-input` carries, derived for a use case with any `input` field carrying `rules`.
- The model builder reads both when it derives the generic results. When the object is omitted, the defaults apply.

### An `owners` Entry

A plain entry is one name, such as `"shop-team"`. An object entry maps a readable name to its CODEOWNERS handles:

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `name` | string | yes | none |
| `codeowners` | array of string | yes | none |

What each field means and what reads it:

- `name` is the owner name records carry, such as `"Shop engineering"`. Names are unique across plain and object entries.
- `codeowners` lists the CODEOWNERS handles the name maps to, such as `["@shop/team"]`. Each entry is one handle from the CODEOWNERS file.
- A record's owner covers a path when the owner itself, or any handle its `owners` entry lists, is an owner of the last CODEOWNERS rule matching that path. `litespec model check` reports `owner-unknown` otherwise.

### The `paths` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `docs` | string | no | none |
| `glossary` | string | no | `docs/glossary.json` under the documentation root |
| `glossaryScan` | array of string | no | none |
| `unstructuredDocs` | array of string | no | none |
| `behaviorDocs` | string | yes | none |
| `records` | object | no | none |
| `testRoots` | array of string | no | none |
| `testResults` | string | no | `TestResults` |
| `apiClient` | string | no | `packages/api` |
| `surfaces` | array of object | no | none |
| `uiDocs` | string | yes | none |
| `uiPackage` | object | no | none |
| `uiPatterns` | string | no | none |
| `frontends` | array of object | yes | none |
| `sites` | array of object | no | none |

What each field means and what reads it:

- `docs` is the root of the specification tree. Every Markdown file under it carries a metadata block unless its path is listed in `unstructuredDocs`. When `docs` is omitted, the tools use `docs`.
- `glossary` names the project glossary. `litespec consumer` validates it and scans the pages and every `glossaryScan` surface against its rejected words and mannered terms.
- `glossaryScan` holds glob patterns that name the non-Markdown surfaces the vocabulary reaches: source, interface copy, the API contract, and acceptance tests. Each pattern matches repository-relative paths and matches at least one file, or `litespec consumer` reports that the check over that surface did not run.
- `unstructuredDocs` lists the paths whose Markdown is navigation or prose rather than specification.
- `behaviorDocs` and `uiDocs` name the behavior and UI documentation roots. Both are required.
- `records` maps a record type to its home folder where it differs from the default the model states. Keys come from the closed list `product`, `goal`, `constraint`, `research`, `decision`, `requirement`, `problem`, `feature`, `actor`, `role`, `permission`, `journey`, `module`, `aggregate`, `rule`, `use-case`, `result`, `scenario`, `event`, `entry-point`, `external-system`, `reaction`, `job`, `notification`, `setting`, `integration-event`, `runbook`, `deviation`, `known-gap`, and `term`.
- `testRoots` lists the directories that hold automated test source. The model builder reads scenarios from these roots.
- `testResults` names where the latest test run results live, so passing and failing proof is read from them.
- `apiClient` names the generated API client the frontends import, so route calls resolve to the use cases they reach. The model builder appends `src` to the configured path.
- `surfaces` names the surfaces outside `paths.frontends` that invoke a use case: a command-line tool, a distributed server, a background host, or an event reaction. Each entry holds `name`, `description`, and an optional `path`.
- `uiPackage` declares the one shared UI package of the workspace. A workspace with no controlled web frontend omits it. See the `uiPackage` object below.
- `uiPatterns` names the workspace UI pattern catalog. A workspace that records no pattern decisions omits it.
- `frontends` lists every browser frontend the project ships. See the frontend entry below.
- `sites` lists the static public websites the consumer ships beside its application. Each entry holds `name`, `path`, and `generator`, and the only generator is `astro`.

### The `stackConfig.dotnet` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `application` | string | no | `apps/api/src/*.Application` |
| `domain` | string | no | `apps/api/src/*.Domain` |
| `infrastructure` | string | no | `apps/api/src/*.Infrastructure` |
| `webapi` | string | no | `apps/api/src/*.WebApi` |
| `apiSolution` | string | no | none |

What each field means and what reads it:

- `application`, `domain`, `infrastructure`, and `webapi` name the backend projects the model builder reads. A `*` in one segment expands to the first matching folder.
- `apiSolution` names the API solution the model builder reads. A consumer with no backend omits `apiSolution` and records the decision that it has none.

### The `uiPackage` Object

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `name` | string | yes | none |
| `path` | string | yes | none |
| `componentsJson` | string | yes | none |
| `primitives` | string | yes | none |
| `tokens` | string | yes | none |
| `sourceLock` | string | yes | none |
| `designContract` | string | yes | none |
| `publicExports` | array of string | yes | none |

What each field means and what reads it:

- `name` is the package name, such as `"@shop/ui"`. `path` is the package root, such as `"packages/ui"`.
- `componentsJson` is the registry configuration, `primitives` is the directory that holds the registry source the pinned CLI copied in, `tokens` is the token stylesheet, `sourceLock` is the source lock, and `designContract` is the design contract.
- `publicExports` lists the entry points applications import, with at least one entry. A primitive the composites are built from is not one of them.
- `litespec consumer` reports a missing `paths.uiPackage` when a controlled frontend is declared without one, and `litespec ui` validates every listed file. A controlled frontend is one whose platform is `react` or `svelte`.

### A `frontends` Entry

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `name` | string | yes | none |
| `path` | string | yes | none |
| `platform` | string | yes | none |
| `ui` | object | no | none |

What each field means and what reads it:

- `name` is the frontend name, such as `"web"`. It matches `^[a-z][a-z0-9-]*$`.
- `path` is the frontend directory, such as `"apps/web"`. `litespec consumer` reports a frontend whose directory does not exist.
- `platform` is `react`, `svelte`, or `blazor`. Every entry declares it, so a frontend outside the controlled UI contract still declares that position instead of omitting the field. A `react` or `svelte` frontend is controlled and requires a `ui` block and the shared package. A `blazor` frontend is skipped by the controlled UI check.
- `ui` holds `profile`, which is required, and `globalCss`, which is optional. The profile is one of `public-light`, `application-balanced`, or `admin-dense`. The `globalCss` value is the one stylesheet the frontend declares, and it imports the shared package tokens. `litespec ui` checks the profile value and the stylesheet path.

### A `sites` Entry

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `name` | string | yes | none |
| `path` | string | yes | none |
| `generator` | string | yes | none |

The generator is `astro`. The [site extension](../ext/site.md) states when a public static website ships beside the application.

### A `selectedExtensions` Entry

| Field | Type | Required | Default |
|:---|:---|:---|:---|
| `id` | string | yes | none |
| `criterion` | string | yes | none |
| `reviewBy` | string | yes | none |
| `releaseStage` | string | no | none |
| `deferredProvisions` | array of object | no | none |

What each field means and what reads it:

- `id` is the extension id in the pinned manifest, such as `"locale"`. `litespec consumer` refuses an id the pinned release does not ship and lists the known ids.
- `criterion` states the criterion that was met, such as `"The product ships in English and Dutch."`. `litespec/core/scope#record-selected-extensions` requires the entry, and `litespec/core/scope#select-conditional-extensions-explicitly` requires selecting an extension only when its criteria apply.
- `reviewBy` is the date the selection is next reviewed, in `YYYY-MM-DD` form. `litespec consumer` reports a selection whose date has passed, because a selection that costs nothing to keep still expires.
- `releaseStage` belongs to the `stage` extension only. It is `pre-production` or `production`.
- `deferredProvisions` belongs to the `stage` extension only. Each entry holds `provision`, which is the deferred provision ID, and `until`, which is the date the deferral ends in `YYYY-MM-DD` form. A production project defers nothing.

### Placeholders and the Init Fill

The template names the project as `__PROJECT__` in paths and package names, and the first owner as `__OWNER__`. `litespec init` fills every `__PROJECT__` value with the `--name` value, or with the root folder name when `--name` is omitted; in an npm package scope such as `@__PROJECT__/ui` it writes that name in lowercase kebab case, because npm names are lowercase. It leaves every other placeholder to fill. After it writes the file it prints the unfilled placeholders:

```text
Fill these placeholders before validating: __OWNER__.
```

It also prints `Next step: dotnet litespec consumer`. `litespec consumer` treats a leftover placeholder as an error and names each one:

```text
litespec.project.json: template placeholder '__OWNER__' is not filled [litespec/core/scope#select-a-size-a-shape-and-stacks]
```

A preset without a controlled web frontend, such as `blazor-client`, declares no package that a frontend uses, so `litespec init` removes `paths.uiPackage` and `paths.uiPatterns` from the written file.

### A Complete Example

This example shows the file `litespec init --preset dotnet-react --size small --name shop` writes from the template and the `dotnet-react` preset, after replacing `__OWNER__` with the owner name. It ran against release `3.0.0`. The preset selects shape `server`, stacks `dotnet` and `react`, and one `react` frontend `web` at `apps/web`.

```json
{
  "$schema": "https://litespec.dev/3.0.0/schemas/litespec-project.schema.json",
  "project": {
    "name": "shop"
  },
  "size": "small",
  "shape": "server",
  "stacks": [
    "dotnet",
    "react"
  ],
  "reviewedLiteSpecVersion": "3.0.0",
  "optionalTypes": [],
  "constraints": {
    "answered": true
  },
  "owners": [
    "shop-team"
  ],
  "review": {
    "vetoWindowDays": 7,
    "securityReviewer": "shop-team"
  },
  "adoption": {
    "transcriptionEndsWith": "decision/0084-promote-to-production"
  },
  "paths": {
    "docs": "docs",
    "behaviorDocs": "docs/behavior",
    "uiDocs": "docs/ui",
    "unstructuredDocs": [],
    "testRoots": [
      "apps/api/tests"
    ],
    "uiPackage": {
      "name": "@shop/ui",
      "path": "packages/ui",
      "componentsJson": "packages/ui/components.json",
      "primitives": "packages/ui/src/components",
      "tokens": "packages/ui/src/styles/tokens.css",
      "sourceLock": "packages/ui/ui-source-lock.json",
      "designContract": "packages/ui/DESIGN.md",
      "publicExports": [
        "@shop/ui/floorplans"
      ]
    },
    "uiPatterns": "docs/ui/pattern-catalog.json",
    "frontends": [
      {
        "name": "web",
        "path": "apps/web",
        "platform": "react"
      }
    ],
    "sites": [],
    "glossaryScan": []
  },
  "stackConfig": {
    "dotnet": {
      "apiSolution": "apps/api/shop.slnx"
    }
  },
  "selectedExtensions": []
}
```

The other two presets differ only in shape, stacks, frontends, and the shared package. `dotnet-svelte` selects shape `server`, stacks `dotnet` and `svelte`, and one `svelte` frontend `web` at `apps/web`. `blazor-client` selects shape `client-only`, stack `blazor`, and one `blazor` frontend `app` at `apps/app`, with no `uiPackage` and no `uiPatterns`. The [init](../tools/init.md) page states all three presets.

### Validation Errors

`litespec consumer` validates the project record, the pinned release, the stacks, the extensions, and the frontends. The messages below are quoted from the validator. The schema check runs first, so a wrong type or an unknown field reports a schema problem before these messages appear.

| Mistake | Message |
|:---|:---|
| A placeholder is left in the file | `litespec.project.json: template placeholder '__OWNER__' is not filled [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| The installed release and the reviewed release differ | `litespec.project.json: reviewedLiteSpecVersion '3.1.0' does not match the installed LiteSpec tool release 3.0.0; install the reviewed release with 'dotnet tool update LiteSpec.Cli --version 3.1.0' and run 'dotnet tool restore', or re-review the contract and record 3.0.0` |
| The reviewed release is missing | `litespec.project.json: missing 'reviewedLiteSpecVersion'; the installed LiteSpec tool release is 3.0.0` |
| A stack id is unknown | `litespec.project.json: stack 'rails' is not a stack the pinned LiteSpec release ships [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| A client-only project names a backend stack | `litespec.project.json: shape 'client-only' names backend stack 'dotnet'; a client-only project names no backend stack [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| A server names zero or two backend stacks | `litespec.project.json: stacks name 0 backend stacks; name exactly one of dotnet [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| An extension id is unknown | `litespec.project.json: extensions 'search' is not an extension in the pinned LiteSpec release; known ids are ai, audit, automation, bdd, cache, compat, concurrency, containers, delegation, devices, efcore, integrations, jobs, lifecycle, locale, mcp, outbox, pipeline, privacy, queues, realtime, report, site, stage, tenancy, workflow-engine` |
| An extension review date has passed | `litespec.project.json: extensions 'locale' was due for review on 2026-01-01; confirm the criterion still applies or remove the selection` |
| A frontend declares no platform | `litespec.project.json: frontend 'web' declares no 'platform'; one of blazor, react, svelte is required [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| A frontend names a stack the project does not select | `litespec.project.json: frontend 'web' platform 'react' is not a stack the project names in stacks [litespec/core/scope#select-a-size-a-shape-and-stacks]` |
| A controlled frontend has no shared package | `litespec.project.json: 1 controlled frontend(s) and no 'paths.uiPackage'; the shared UI package every controlled web frontend composes is undeclared` |
| A configured path does not exist | `litespec.project.json: paths.docs 'docs' does not exist; the page scan finds no record to check` |

The last row stands for every configured path: the message names the field, the missing path, and the check that goes quiet. The docs root, the glossary, each frontend directory, each `uiPackage` file, and each frontend stylesheet follow this shape.

## Notes

The field lists follow `schemas/litespec-project.schema.json` and the consumer template. The init behavior follows `apps/cli/src/LiteSpec.Cli/Init/InitCommand.cs`. The validation messages follow `apps/cli/src/LiteSpec.Cli/Consumer/ConsumerValidator.Project.cs` and `apps/cli/src/LiteSpec.Cli/Consumer/ConsumerValidator.Glossary.cs`. The path defaults follow `apps/cli/src/LiteSpec.Cli/Model/ConsumerConfig.cs`. The presets are `templates/presets/dotnet-react.json`, `templates/presets/dotnet-svelte.json`, and `templates/presets/blazor-client.json`, read with `templates/consumer/litespec.project.json`.
