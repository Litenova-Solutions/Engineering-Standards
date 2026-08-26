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
| `page.md` | `docs/ui/{app}/{page}.md` | A page composes non-trivial use cases or interaction states. |
| `ui-page.json` | `docs/ui/{app}/{page}.ui.json` | Declares the page shell, regions, states, responsive modes, focus, and evidence. |
| `ui-vocabulary.json` | `docs/ui/{app}/vocabulary.json` | Closes the shells, patterns, components, tokens, states, forks, and evidence available to agents. |
| `ui-source-lock.json` | `apps/{app}/ui-source-lock.json` | Records generated shadcn source, preset, registry addresses, digests, and dependencies. |
| `decision.md` | `docs/decisions/{id}.md` | A standards override or expensive-to-reverse choice is required. |
| `ui-override-decision.md` | `docs/decisions/{id}.md` | A React web visual-system, component-base, registry, or specialist-control override is required. |
| `runbook.md` | `docs/runbooks/{runbook}.md` | An operator needs a repeatable recovery or operating procedure. |
| `release-record.md` | `docs/releases/{release}.md` | One immutable release artifact is evaluated. |

A template `id` is not always the filename. The operating-limits record lives at `docs/operations/limits.md` but keeps the fixed metadata `id` of `operating-limits`. The record kind, not the filename, sets the id. Use-case, module, flow, workflow, and policy ids follow their own kind rules in the Agentic Engineering System page.

Markdown specification templates begin with Specification Metadata validated by [the schema](../../schemas/specification-metadata.schema.json). The Agentic Engineering System page defines semantic relationships that JSON Schema cannot prove across files.

React web consumers also validate UI configuration and sidecar contracts with
`schemas/ui-vocabulary.schema.json`, `schemas/ui-page.schema.json`, and
`schemas/ui-source-lock.schema.json`. Run `node standards/tools/validate-ui.mjs` from the consumer root
after adding or changing these files.

The three UI templates are a coherent set for a frontend named `web`: the vocabulary, the page sidecar,
and the source lock reference each other. Rename the frontend, page id, and component entries together.
Replace the placeholder digest in `ui-source-lock.json` with the digest of the formatted installed source
before validating.

The standards do not generate application code. Agents load the active specification, selected profile, task conventions, and applicable extensions before implementing one complete slice.
