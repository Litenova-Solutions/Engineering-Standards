# Glossary

Canonical definitions for terms coined or specialized in Agentic Domain-Driven Design (ADDD) and this standards repository. Agents SHOULD load this file when a term is ambiguous. Do not load for routine layer edits unless the task touches documentation or cross-layer naming.

---

## Architecture and process

| Term | Definition |
|:---|:---|
| **ADDD** | Agentic Domain-Driven Design: spec-anchored domain docs, tri-layer naming alignment, and agent-first conventions in this repository. |
| **Agentic guardrails** | Normative rules in `docs/conventions/shared/agentic-guardrails.md`: scaffolding sequence, XML rules, anti-drift patterns, verification checkpoints. |
| **Agent load plan** | Named file list in `standards.manifest.json` → `agentLoadPlans` that scopes which standards an agent loads for a task type (for example `backend.domain`). |
| **Scoped loading** | Loading only the convention files required for the current layer or task, not the entire `docs/conventions/` tree. |
| **Spec-anchored** | Domain and test documentation updated in the same pull request as the code they describe. |
| **Strike 0 / 1 / 2** | Promotion rule for shared frontend code: use case local (0), feature `shared/` after two uses (2). Strike 1 is the first duplicate that triggers planning for promotion. |
| **Tier** | Project risk classification for coverage thresholds: **production** (default), **internal**, **prototype**. Declared in project `docs/domain/README.md` or project README. |

---

## Documentation artifacts (consumer projects)

| Term | Definition |
|:---|:---|
| **System index** | `docs/domain/README.md`: map of features, use cases, and documentation completeness status. |
| **Feature README** | `docs/domain/{feature}/README.md`: ubiquitous language, aggregate invariants, events, use case index. |
| **Use case doc** (operation doc) | `docs/domain/{feature}/{use-case}.md`: one command or query contract, HTTP surface, domain behavior. |
| **Test spec** | `docs/domain/{feature}/{use-case}.tests.md`: Test Coverage table, variations, explicit exclusions. |
| **UI projection doc** | `docs/ui/{app}/pages/{page}.md` or `shell.md`: route composition linking to use cases; not a second domain layer. |
| **Test Coverage table** | Rows in a test spec; each row maps to tests and, for acceptance tests, to `AC-00N` criterion IDs. |

---

## Backend layers

| Term | Definition |
|:---|:---|
| **Reactions** | `Application.Reactions` project: domain event handlers and narrow side-effect interfaces. Same role as policy handlers or integration event handlers in classic DDD; name is standards-specific. |
| **Contracts project** | `Application.Write.Contracts` or `Application.Read.Contracts`: commands, queries, results, shared validation types; no handlers. |
| **IDatabaseContext** | Read-side EF abstraction in `Application.Read.Contracts`; query handlers project through it only. |

---

## Testing and traceability

| Term | Definition |
|:---|:---|
| **API acceptance test** | HTTP-level test tracing to a Test Coverage row; may be plain xUnit or Reqnroll Gherkin. See `docs/conventions/backend/api-acceptance-tests.md`. |
| **`@usecase:` tag** | Reqnroll tag value `{feature}/{use-case}` matching the operation doc path without `.md` (for example `posts/publish-post`). |
| **`@ac:` tag** | Reqnroll tag value `AC-00N` matching row `N` in the test spec Test Coverage table. |
| **Executable acceptance** | Acceptance tests that fail when behavior diverges from the test spec; closes part of the Specification by Example gap. |

---

## Related documents

| Document | Purpose |
|:---|:---|
| `docs/guides/agentic-domain-driven-design.md` | Documentation tree and intellectual lineage |
| `docs/guides/onboarding.md` | Human engineer entry path |
| `standards.manifest.json` | Machine-readable paths and `agentLoadPlans` |
