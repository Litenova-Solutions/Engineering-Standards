# Document Templates

These files are optional starting points for consumer documentation. Copy only the files required by the current stage and replace every `__PLACEHOLDER__` before committing.

| Template | Purpose |
|:---|:---|
| `standards.project.json` | Selects the platform profile, paths, extensions, and standards overrides. |
| `project-agents.md` | Provides the short consumer agent entry point. |
| `product-brief.md` | Defines the application v1 product boundary and product and operating context. |
| `domain-index.md` | Maps the bounded context, subjects, and primary journey. |
| `glossary.md` | Defines shared domain language. |
| `subject.md` | Defines language, the primary aggregate root, states, transitions, invariants, events, reactions, and use cases. |
| `use-case.md` | Defines one command or query, its Domain behavior, and its acceptance criteria. |
| `page.md` | Defines non-trivial page composition when the ADDD page criteria apply. |
| `decision.md` | Records a standards override or expensive-to-reverse choice. |
| `runbook.md` | Records an operational trigger, procedure, verification, and recovery path. |
| `release-evidence.md` | Records verified artifacts, gates, recovery exercises, smoke tests, alerts, and skipped checks for one release. |

New and materially changed consumer documents use the metadata block defined by `WRITING.METADATA.001`. The JSON blocks in subject, use-case, and page documents route agents and record status. Their allowed fields are defined in [ADDD](../../docs/foundations/addd.md), not by a separate schema or CLI.

The standards do not generate application code. Agents read the selected profile, task conventions, active use case, and enabled extensions before implementing the smallest complete slice.
