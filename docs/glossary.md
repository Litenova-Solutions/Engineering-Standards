# Glossary

Terms defined here are ADDD-specific or specialized in this standards repository. Standard DDD terms (Aggregate, Value Object, Domain Event, etc.) use Evans/Vernon definitions unless noted otherwise. Agents SHOULD load this file when a term is ambiguous. Do not load for routine layer edits unless the task touches documentation or cross-layer naming.

---

## Architecture and process

| Term | Definition |
|:---|:---|
| **ADDD** | Agentic Domain-Driven Design: documentation and delivery model for single bounded-context monoliths. Combines spec sync, lexical alignment, tri-layer naming, and agent-first conventions. Not a distributed systems pattern, microservices strategy, or full DDD methodology. |
| **Agent load plan** | Machine-readable specification in `standards.manifest.json` → `agentLoadPlans` that maps a task type to Tier 0–3 resources an agent MUST load. See **Context tiers**. |
| **Agentic guardrails** | Normative rules in `docs/conventions/shared/agentic-guardrails.md`: scaffolding sequence, XML rules, anti-drift patterns, verification checkpoints. |
| **Context tiers** | Three-level loading strategy for agent documentation: **Tier 0** (`AGENTS.md`, always loaded), **Tier 1** (task-loaded Quick Rules sections), **Tier 2** (reference-loaded full conventions), **Tier 3** (blueprints for file generation only). See `docs/agentic-development.md` §6. |
| **Feature** | Folder grouping that contains one Aggregate and all its Use Cases. Not a bounded context, GitHub feature flag, or feature toggle. Multiple Features exist within a single bounded context. Example: `docs/domain/posts/`, `Posts/`, `features/posts/`. |
| **Implementation Prerequisite Set** | Minimum documents that MUST exist before an agent begins implementation: Feature Spec (`docs/domain/{feature}/README.md`), Use Case Doc, and Use Case Test Spec. See `docs/guides/agentic-domain-driven-design.md`. |
| **Invariant coverage** | Mapping between domain invariants declared in a Feature Spec and the specific tests that verify each invariant. Recorded in the Feature Spec **Invariants Under Test** table and Use Case Test Spec **Test Coverage** rows. |
| **Lexical alignment** | Property of a codebase where folder names, file names, class names, and method names use the same vocabulary as the domain ubiquitous language and the Feature Spec. Consequence of Screaming Architecture applied to docs, backend, and frontend. |
| **Page composition doc** | Document under `docs/ui/{app}/pages/` or `shell.md` that describes a single frontend route: which Use Cases compose on it, screen states, and content modes. Not a CQRS read model projection. Previously called "UI projection doc." |
| **Reactions** | ADDD-specific name for the `Application.Reactions` project layer. Handles domain event-driven side effects via narrow interfaces. In DDD literature this corresponds to policies or domain event handlers. |
| **Scoped loading** | Loading only the convention files or Quick Rules sections required for the current layer or task, not the entire `docs/conventions/` tree. |
| **Screaming architecture** | Bob Martin's term: folder structure communicates business intent without reading code. In ADDD it applies to docs (`docs/domain/{feature}/`), backend (`{Feature}/{UseCase}/`), and frontend (`features/{feature}/{use-case}/`), not code folders alone. |
| **Spec sync rule** | Convention that documentation and code MUST be updated in the same commit/PR. A document that describes behavior the code does not implement, or code that implements behavior no document describes, violates this rule. |
| **Spec-anchored** | Synonym for **Spec sync rule** when describing a repository or workflow: documentation and code cannot diverge by policy. |
| **Strike 0 / 1 / 2** | Promotion rule for shared frontend code: use case local (0), feature `shared/` after two uses (2). Strike 1 is the first duplicate that triggers planning for promotion. |
| **Tier** | Project risk classification for coverage thresholds: **production** (default), **internal**, **prototype**. Declared in project `docs/domain/README.md` or project README. Distinct from **Context tiers**. |

---

## Documentation artifacts (consumer projects)

| Term | Definition |
|:---|:---|
| **Agent index** | Machine-readable domain map at `docs/domain/agent-index.json`. Lists features, use cases, doc paths, risk levels, and layer context. Companion to `docs/domain/README.md`. |
| **Feature README** (Feature Spec) | `docs/domain/{feature}/README.md`: ubiquitous language, aggregate invariants, events, use case index. |
| **System index** | `docs/domain/README.md`: map of features, use cases, and documentation completeness status. |
| **Use case doc** (operation doc) | `docs/domain/{feature}/{use-case}.md`: operation specification for a single command or query. Contains business contract, HTTP interface, domain behavior, and pointer to Use Case Test Spec. Not a UML use case diagram. |
| **Use case test spec** | `docs/domain/{feature}/{use-case}.tests.md`: specifies which scenarios are tested, at which layer, with which variations, and what is explicitly not tested. |
| **Test Coverage table** | Rows in a test spec; each row maps to tests and, for acceptance tests, to `AC-00N` criterion IDs. |

---

## Backend layers

| Term | Definition |
|:---|:---|
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
| **Spec completeness checking** | Agent-assisted or CI structural audit of ADDD documents: invariant coverage gaps, state transition coverage, frontmatter completeness, test spec orphans. Not domain discovery. See `docs/guides/agentic-domain-driven-design.md` §12. |

---

## Related documents

| Document | Purpose |
|:---|:---|
| `docs/guides/agentic-domain-driven-design.md` | Documentation tree, scope, and agent workflow |
| `docs/guides/onboarding.md` | Human engineer entry path |
| `docs/agentic-development.md` | Context tiers and agent failure modes |
| `standards.manifest.json` | Machine-readable paths and `agentLoadPlans` |
