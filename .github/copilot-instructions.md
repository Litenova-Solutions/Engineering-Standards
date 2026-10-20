# GitHub Copilot Instructions

Read `AGENTS.md` as the canonical agent protocol. In a consumer repository, read `litespec/AGENTS.md`, `litespec.project.json`, the model query result for the active records, and enabled extensions.

## Working in this repository

Every provision ID is `litespec/<kind>/<page>.<heading-slug>`, and the page segment names the page path. `litespec/rule/frontend-components.compose-composites-in-page-code` lives in `docs/frontend/components.md`, so a citation needs no lookup step.

A changed assertion takes a new ID. Do not edit an active Requirement in place, and do not add an alias or a replacement map. `CONTRIBUTING.md` states the amendment order.

Node tools stay dependency-free with no install step. Do not add a package manifest, a lockfile, or a runtime dependency to `tools/`. The model builder is the one .NET project, under `tools/model/`.

Run the fixture suites and the repository validator before proposing a change:

```bash
node tools/validate-standards.cases.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
dotnet build tools/model/Litenova.Model
node tools/model.cases.mjs
node tools/validate-standards.mjs
node tools/generate-provisions.mjs
```

Authored prose is ASCII, active voice, and bounded by the measures in `docs/core/authoring.md`. A list sentence has at most 20 words and any other sentence at most 25.
