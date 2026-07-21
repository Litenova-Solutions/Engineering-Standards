# Document Templates

These files are starting points for consumer documentation. Copy only the files required by the current stage and replace every `__PLACEHOLDER__` before committing.

## Inception files

| Template | Target | Purpose |
|:---|:---|:---|
| `standards.project.json` | `standards.project.json` | Selects the profile, paths, extensions allowed by the project, and standards overrides. |
| `project-agents.md` | `AGENTS.md` | Provides the short consumer agent entry point. |
| `product-brief.md` | `docs/product/brief.md` | Defines the product boundary and primary release flow. |
| `domain-index.md` | `docs/domain/README.md` | Lists modules, workflows, and domain policies. |
| `glossary.md` | `docs/domain/glossary.md` | Defines shared domain language. |
| `modules-index.md` | `docs/domain/modules/README.md` | Defines the module documentation boundary. |

## Add when required

| Template | Typical target | Trigger |
|:---|:---|:---|
| `module.md` | `docs/domain/modules/{module}/README.md` | The first use case for a module is approved. |
| `use-case.md` | `docs/domain/modules/{module}/{use-case}.md` | One Command or Query goal is approved. |
| `end-to-end-flow.md` | `docs/product/flows/{flow}.md` | Use cases must connect to one product outcome. |
| `workflow.md` | `docs/domain/workflows/{workflow}.md` | System progress crosses a transaction or time boundary. |
| `domain-policy.md` | `docs/domain/policies/{policy}.md` | A business rule is not owned by one aggregate invariant. |
| `decision-evidence.md` | `docs/research/{record}.md` | A large external investigation needs its own owner and lifecycle. |
| `operating-limits.md` | `docs/operations/limits.md` | A pilot or release has enforced, tested, supported, or alert values. |
| `page.md` | `docs/ui/{app}/{page}.md` | A page composes non-trivial use cases or interaction states. |
| `decision.md` | `docs/decisions/{id}.md` | A standards override or expensive-to-reverse choice is required. |
| `runbook.md` | `docs/runbooks/{runbook}.md` | An operator needs a repeatable recovery or operating procedure. |
| `release-record.md` | `docs/releases/{release}.md` | One immutable release artifact is evaluated. |

Structured templates begin with Specification Metadata validated by [the schema](../../schemas/specification-metadata.schema.json). The engineering system foundation defines semantic relationships that JSON Schema cannot prove across files.

The standards do not generate application code. Agents load the active specification, selected profile, task conventions, and applicable extensions before implementing one complete slice.
