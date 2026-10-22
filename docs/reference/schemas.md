# Schemas

## Intent

Every JSON file a LiteSpec tool reads has one schema (a contract stating its exact shape), and the checking command and the editor validate the same contract. This page lists every schema the release ships: the file it validates, the command that checks it, its published URL, its top-level properties, and a real example. An author in a consumer project uses it to wire editor validation and to look up a field, and a tool author uses it to find which command owns which file.

## Reference

Every schema lives in `schemas/` at the repository root and uses JSON Schema draft 2020-12. Each schema carries an `$id` that equals its published URL, so the copy at `https://litespec.dev/2.0.0/schemas/<file>` and the file in `schemas/` state the same contract. The [validate](../tools/validate.md), [consumer](../tools/consumer.md), and [ui](../tools/ui.md) pages state the commands that check each file. The release ships seven schemas, one per section below.

### Manifest Schema

| Item | Value |
|:---|:---|
| File | `schemas/litespec-manifest.schema.json` |
| Validates | `litespec.manifest.json` in the LiteSpec repository |
| Checked by | `litespec validate` |
| Published URL | `https://litespec.dev/2.0.0/schemas/litespec-manifest.schema.json` |

The top-level properties name the release and what it ships. `schemaVersion` is the constant `5`. `version` is the release, such as `2.0.0`. `name` and `agentsEntry` name the standard and its agent entry point. `stacks`, `shapes`, and `extensions` list what a consumer project selects from. `stack` and `packages` pin the tool versions. `uiBaseline` and `uiBaselineSvelte` pin the controlled UI presets.

The release manifest opens with these fields:

```json
{
  "$schema": "./schemas/litespec-manifest.schema.json",
  "schemaVersion": 5,
  "version": "2.0.0",
  "name": "litespec",
  "agentsEntry": "AGENTS.md"
}
```

### Consumer Project Schema

| Item | Value |
|:---|:---|
| File | `schemas/litespec-project.schema.json` |
| Validates | `litespec.project.json` in a consumer repository |
| Checked by | `litespec consumer`, and `litespec validate` for the template copy |
| Published URL | `https://litespec.dev/2.0.0/schemas/litespec-project.schema.json` |

The top-level properties describe the project. `project` holds the project name. `size` is `small` or `large`. `shape` is `server` or `client-only`. `stacks` lists the selected stacks. `reviewedLiteSpecVersion` records the LiteSpec release the project last reviewed. `paths` locates the specification tree, the glossary, the UI package, and the frontends. `stackConfig` holds per-stack configuration, such as the .NET backend paths. `selectedExtensions` lists the active extensions with their criterion and review date. `optionalTypes`, `proof`, `constraints`, `owners`, `exampleWordLimit`, and `prohibitedKinds` carry further project choices.

The consumer template opens with these fields:

```json
{
  "$schema": "./litespec/schemas/litespec-project.schema.json",
  "project": { "name": "__PROJECT__" },
  "size": "small",
  "shape": "server",
  "stacks": ["dotnet", "react"],
  "reviewedLiteSpecVersion": "2.0.0"
}
```

### Record Schema

| Item | Value |
|:---|:---|
| File | `schemas/record.schema.json` |
| Validates | The JSON metadata block that opens a consumer documentation page |
| Checked by | `litespec consumer` |
| Published URL | `https://litespec.dev/2.0.0/schemas/record.schema.json` |

The schema holds no single property list. Instead it carries a `oneOf` across 30 page variants, one per record type and page style, so each opening block matches exactly one variant: `productPage`, `goalPage`, `constraintPage`, `researchPage`, `decisionPage`, `problemPage`, `featurePage`, `actorPage`, `rolePage`, `journeyPage`, `modulePage`, `aggregatePage`, `useCasePage`, `externalSystemPage`, `runbookPage`, `deviationPage`, `knownGapPage`, `requirementPage`, `permissionListPage`, `entryPointListPage`, `limitSetPage`, `ruleSetPage`, `indexPage`, `tutorialPage`, `howToPage`, `referencePage`, `commandPage`, `configurationPage`, `glossaryPage`, and `exampleCastPage`. Each variant requires `type` plus its own fields, such as `id`, `title`, `owner`, and `status`. The identifier patterns sit beside the variants in `$defs`, such as `useCaseId` for `use-case/<module>.<name>`.

A use case page opens with this block:

```json
{
  "type": "use-case",
  "id": "use-case/<module>.<name>",
  "title": "<Use case display title>",
  "owner": "<owner>",
  "status": "draft",
  "kind": "command"
}
```

### Glossary Schema

| Item | Value |
|:---|:---|
| File | `schemas/glossary.schema.json` |
| Validates | The project glossary, by default `glossary.json` under the documentation root |
| Checked by | `litespec consumer` |
| Published URL | `https://litespec.dev/2.0.0/schemas/glossary.schema.json` |

The top-level properties hold the closed vocabulary. `schemaVersion` is the constant `2`. `terms` holds one entry per concept, each with its `id`, `term`, `meaning`, `labels`, `rejected` synonyms, `broader` and `narrower` terms, closed-set `values`, `owner`, and `status`. `mannered` holds the metaphor terms the project rejects everywhere, each with its `term` and its `instead`.

The consumer glossary template carries real mannered entries:

```json
"mannered": [
  { "term": "load-bearing", "instead": "required" },
  { "term": "one-way door", "instead": "irreversible" }
]
```

### Design Contract Schema

| Item | Value |
|:---|:---|
| File | `schemas/design-contract.schema.json` |
| Validates | The JSON metadata block that opens the `DESIGN.md` a shared UI package ships |
| Checked by | `litespec ui` (`litespec/frontend/ui#publish-a-design-contract`) |
| Published URL | `https://litespec.dev/2.0.0/schemas/design-contract.schema.json` |

The top-level properties bind the contract to its package. `kind` is the constant `design-contract`. `schemaVersion` is the constant `1`. `package` names the shared UI package. `profile` names the density the worked example uses. `shell` names the application shell. `patterns` lists the floorplans the package provides.

The consumer template opens its design contract with these fields:

```json
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "package": "@__PROJECT__/ui",
  "profile": "application-balanced",
  "shell": "application-shell/default",
  "patterns": ["list-page", "entity-page"]
}
```

### UI Pattern Catalog Schema

| Item | Value |
|:---|:---|
| File | `schemas/ui-pattern-catalog.schema.json` |
| Validates | The workspace UI pattern catalog at `paths.uiPatterns` |
| Checked by | `litespec ui` (`litespec/frontend/patterns#keep-one-pattern-catalog`) |
| Published URL | `https://litespec.dev/2.0.0/schemas/ui-pattern-catalog.schema.json` |

The top-level properties hold one decision per recurring UI question. `kind` is the constant `ui-pattern-catalog`. `schemaVersion` is the constant `1`. `registry` names the command that renders every option for visual review. `breakpoints` names the viewport widths in CSS pixels. `groups` holds the catalog groups. `patterns` holds the decisions, each with its `options`, chosen `decision`, `compact` behavior, and per-platform `implementations`.

The consumer template catalog opens with these fields:

```json
{
  "$schema": "../../litespec/schemas/ui-pattern-catalog.schema.json",
  "kind": "ui-pattern-catalog",
  "schemaVersion": 1,
  "breakpoints": { "compact": 768 }
}
```

### UI Source Lock Schema

| Item | Value |
|:---|:---|
| File | `schemas/ui-source-lock.schema.json` |
| Validates | The source lock beside the one copy of the registry source |
| Checked by | `litespec ui` (`litespec/frontend/web/ui#track-source-changes`) |
| Published URL | `https://litespec.dev/2.0.0/schemas/ui-source-lock.schema.json` |

The top-level properties pin what was installed. `schemaVersion` is the constant `1`. `generator` is `shadcn/ui` or `shadcn-svelte`. `cli` is the pinned CLI version. `preset` repeats the manifest baseline the package installs. `registry` names where the source came from. `formatter` names the code formatter. `components` lists every installed primitive with its `name`, `address`, `status`, `paths`, `digest`, and `dependencies`.

The consumer template lock opens with these fields:

```json
{
  "$schema": "../../litespec/schemas/ui-source-lock.schema.json",
  "schemaVersion": 1,
  "generator": "shadcn/ui",
  "cli": "4.21.5"
}
```

## Notes

A schema states one exact shape per release, with no compatible range between releases. A consumer adopting a later release absorbs every difference at that moment, under `litespec/core/authoring#publish-each-release-as-a-complete-contract` and `litespec/core/authoring#exclude-cross-release-compatibility-work`. When the published copy and the repository copy disagree, the repository copy wins, because every check reads `schemas/` from the checkout its tool belongs to.
