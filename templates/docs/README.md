# Document Templates

These files are starting points for consumer documentation. Copy only the files required by the current stage and replace every `__PLACEHOLDER__` before committing.

## Inception files

| Template | Target | Purpose |
|:---|:---|:---|
| `standards.project.json` | `standards.project.json` | Selects the profile, paths, extensions allowed by the project, and standards overrides. |
| `project-agents.md` | `AGENTS.md` | Provides the short consumer agent entry point. |
| `product-brief.md` | `docs/product/brief.md` | Defines the product boundary and Primary Business Flow. |
| `domain-index.md` | `docs/domain/README.md` | Lists Subjects, Workflows, and Shared Rules. |
| `glossary.md` | `docs/domain/glossary.md` | Defines shared domain language. |
| `subjects-index.md` | `docs/domain/subjects/README.md` | Defines the Subject documentation boundary. |

## Add when required

| Template | Typical target | Trigger |
|:---|:---|:---|
| `subject.md` | `docs/domain/subjects/{subject}/README.md` | The first Use case for a Subject is approved. |
| `use-case.md` | `docs/domain/subjects/{subject}/{use-case}.md` | One Command or Query goal is approved. |
| `business-flow.md` | `docs/product/flows/{flow}.md` | Use cases must connect to one product outcome. |
| `workflow.md` | `docs/domain/workflows/{workflow}.md` | System progress crosses a transaction or time boundary. |
| `shared-rule.md` | `docs/domain/shared-rules/{rule}.md` | One rule applies to at least two Subjects. |
| `claims-and-evidence.md` | `docs/research/{record}.md` | Research, provider approval, legal review, or assumptions affect a decision. |
| `operating-limits.md` | `docs/operations/limits.md` | A pilot or release has enforced, tested, supported, or alert values. |
| `page.md` | `docs/ui/{app}/{page}.md` | A page composes non-trivial Use cases or interaction states. |
| `decision.md` | `docs/decisions/{id}.md` | A standards override or expensive-to-reverse choice is required. |
| `runbook.md` | `docs/runbooks/{runbook}.md` | An operator needs a repeatable recovery or operating procedure. |
| `release-evidence.md` | `docs/release/{release}.md` | One immutable release artifact is evaluated. |

Structured templates begin with Specification Metadata validated by [the schema](../../schemas/specification-metadata.schema.json). The ADDD foundation defines semantic relationships that JSON Schema cannot prove across files.

The standards do not generate application code. Agents load the active specification, selected profile, task conventions, and applicable extensions before implementing one complete slice.
