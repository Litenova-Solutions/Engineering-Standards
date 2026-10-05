# Document Templates

## Intent

These files are starting points for consumer documentation. Copy only the files required by the current stage and replace every `__PLACEHOLDER__` before committing.

Read [Get started](../../docs/guide/getting-started.md) before creating a consumer repository.

## Inception files

| Template | Target | Purpose |
|:---|:---|:---|
| `standards.project.json` | `standards.project.json` | Selects the profile, reviewed standards release, paths, allowed extensions, and standards overrides. |
| `project-agents.md` | `AGENTS.md` | Provides the short consumer agent entry point. |
| `product-brief.md` | `docs/product/brief.md` | Defines the product boundary and linked end-to-end flows. |
| `domain-index.md` | `docs/domain/README.md` | Lists modules, workflows, and domain policies. |
| `glossary.md` | `docs/domain/glossary.md` | Defines shared domain language. |
| `language.json` | `docs/language.json` | Closes the vocabulary prose is checked against: terms, rejected synonyms, each rejection's scope, and the mannered terms. |
| `scenario-cast.md` | `docs/domain/scenarios.md` | Fixes the people, place, dates, and amounts every `Scenario` section draws from. |
| `modules-index.md` | `docs/domain/modules/README.md` | Defines the module documentation boundary. |

## Add when required

| Template | Typical target | Trigger |
|:---|:---|:---|
| `module.md` | `docs/domain/modules/{module}/README.md` | The first use case for a module is approved. |
| `aggregate.md` | `docs/domain/modules/{module}/{aggregates}/README.md` | A module groups use cases under an aggregate-root subdirectory. |
| `use-case.md` | `docs/domain/modules/{module}/{use-case}.md` | One Command or Query goal is approved. |
| `end-to-end-flow.md` | `docs/product/flows/{flow}.md` | Use cases connect to one product outcome. |
| `workflow.md` | `docs/domain/workflows/{workflow}.md` | System progress crosses a transaction or time boundary. |
| `domain-policy.md` | `docs/domain/policies/{policy}.md` | A business rule is not owned by one aggregate invariant. |
| `decision-evidence.md` | `docs/research/{record}.md` | A large external investigation needs its own owner and lifecycle. |
| `operating-limits.md` | `docs/operations/limits.md` | A pilot or release has enforced, tested, supported, or alert values. |
| `section-index.md` | `docs/{section}/README.md` | A directory needs an index and owns no aggregate, use case, or policy. |
| `design-contract.md` | `packages/ui/DESIGN.md` | States the brand, tokens, composites, floorplans, do list, refusals, motion, and voice every frontend composes from. |
| `ui-source-lock.json` | `packages/ui/ui-source-lock.json` | Records the installed registry source, the decoded preset, the registry address, the digests, and the dependencies. |
| `decision.md` | `docs/decisions/{id}.md` | A standards override or expensive-to-reverse choice is required. |
| `ui-override-decision.md` | `docs/decisions/{id}.md` | A shared UI package visual authority, registry, or specialist-control override is required. |
| `runbook.md` | `docs/runbooks/{runbook}.md` | An operator needs a repeatable recovery or operating procedure. |
| `release-record.md` | `docs/releases/{release}.md` | One immutable release artifact is evaluated. |
| `tutorial.md` | `docs/guide/{tutorial}.md` | A newcomer needs one path to a first working result. |
| `how-to.md` | `docs/guide/{how-to}.md` | A reader who is already running needs one stated goal solved. |
| `command.md` | `docs/tools/{command}.md` | The repository ships a command a reader runs. |
| `reference.md` | `docs/reference/{record}.md` | A reader looks up exact values rather than reading a procedure. |
| `configuration.md` | `docs/tools/configuration.md` | A setting a reader can change needs its default, scope, and precedence. |

A template `id` is not always the filename. The operating-limits record lives at `docs/operations/limits.md` but keeps the fixed metadata `id` of `operating-limits`. The record kind, not the filename, sets the id. Use-case, module, flow, workflow, and policy ids follow their own kind rules in the Agentic Engineering System page.

Markdown specification templates begin with Specification Metadata validated by [the schema](../../schemas/specification-metadata.schema.json). The Agentic Engineering System page defines semantic relationships that JSON Schema cannot prove across files.

A workspace with controlled React web frontends also validates the shared UI package with `schemas/design-contract.schema.json` and `schemas/ui-source-lock.schema.json`. Run `node standards/tools/validate-ui.mjs` from the consumer root after adding or changing those files.

The design contract and the source lock are a coherent pair, and both travel with the shared package rather than with an application. A workspace names the package once in `paths.uiPackage`, and each controlled frontend declares its density profile and its own stylesheet entry. Replace the placeholder digest in `ui-source-lock.json` with the digest of the normalized installed source before validating.

The standards do not generate application code. Agents load the active specification, selected profile, task conventions, and applicable extensions before implementing one complete slice.
