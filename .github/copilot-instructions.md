# GitHub Copilot Instructions

Read `AGENTS.md` as the canonical agent protocol. In a consumer repository, read `standards/AGENTS.md`, `standards.project.json`, the matching manifest load plan, the active use case, and enabled extensions.

## Working in this repository

Every provision ID is `standards/<kind>/<page>.<heading-slug>`, and the page segment names the page path. `standards/rule/frontend-components.use-the-component-ownership-levels` lives in `docs/frontend/components.md`, so a citation needs no lookup step.

A changed assertion takes a new ID. Do not edit an active Requirement in place, and do not add an alias or a replacement map. `CONTRIBUTING.md` states the amendment order.

Every command is dependency-free Node with no install step. Do not add a package manifest, a lockfile, or a runtime dependency to `tools/`.

Run the four fixture suites and the repository validator before proposing a change:

```bash
node tools/validate-standards.cases.mjs
node tools/validate-ui.cases.mjs
node tools/validate-consumer.cases.mjs
node tools/validate-parity.cases.mjs
node tools/validate-standards.mjs
node tools/generate-provisions.mjs
```

Authored prose is ASCII, active voice, and bounded by the measures in `docs/core/authoring.md`. A list sentence has at most 20 words and any other sentence at most 25.
