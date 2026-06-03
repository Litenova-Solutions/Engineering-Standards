<!-- Copy to project root as AGENTS.md. Replace {ProjectName}. -->
# {ProjectName} - Agent Context

This project follows the shared engineering standards. Read `standards/AGENTS.md` before touching any code.

These standards assume a single bounded context monolith. Multi-context decomposition is out of scope.

---

## Context tiers

1. `standards/AGENTS.md` (Tier 0)
2. `docs/domain/agent-index.json` (project domain map)
3. Tier 1 Quick Rules from `standards/standards.manifest.json` → `agentLoadPlans` (use frontmatter `conventions` on the use case doc when present)
4. Tier 2 full conventions only when a Quick Rule is unclear
5. Tier 3 blueprints only when generating new files

---

## Feature Context Map

When working on any use case in a feature, MUST load the Feature Spec before the Use Case Doc.

| Feature | Feature Spec | Use Cases | Load Also |
|:---|:---|:---|:---|
| `posts` | `docs/domain/posts/README.md` | `create-post`, `publish-post`, `list-posts` | `docs/domain/posts/*.md` |
| `authors` | `docs/domain/authors/README.md` | `register-author` | |

Update this table when adding or renaming features.

---

## Project Load Overrides

Extend `standards/standards.manifest.json` `agentLoadPlans` for project-specific context. Do not edit the standards submodule.

| Task | Also load | Reason |
|:---|:---|:---|
| `backend.infrastructure` | `docs/decisions/` (if outbox differs from standard blueprint) | Project-specific infrastructure ADR |
| `backend.domain` | `docs/domain/README.md` | Always load the project domain map |

Delete rows that do not apply. Add rows when the project diverges from standard blueprints.

---

## Read Order (always)

1. `standards/AGENTS.md`
2. `docs/domain/agent-index.json`
3. `standards/docs/conventions/shared/agentic-guardrails.md`
4. Tier 1 Quick Rules for the layer you are editing (from manifest or use case frontmatter)
5. `standards/docs/guides/definition-of-done.md`

---

## Read Order (use case implementation)

Follow this sequence when building or changing a use case. Do not skip to code without the Implementation Prerequisite Set.

1. `docs/domain/README.md`
2. `docs/domain/{feature}/README.md` (Feature Spec)
3. `docs/domain/{feature}/{use-case}.md` (read YAML frontmatter for convention references)
4. `docs/domain/{feature}/{use-case}.tests.md`
5. `standards/docs/guides/agentic-domain-driven-design.md`
6. `standards/docs/guides/add-new-use-case.md`
7. Follow the **Spec sync rule**: update domain and UI docs in the same PR as the implementation

---

## Project Domain Documentation

| Path | Contents |
|:---|:---|
| `docs/domain/README.md` | System map of features and use cases |
| `docs/domain/agent-index.json` | Machine-readable domain map for agents |
| `docs/domain/{feature}/README.md` | Feature Spec: language, aggregate, invariants, events |
| `docs/domain/{feature}/{use-case}.md` | Use Case Doc: commands, endpoints, domain behavior |
| `docs/domain/{feature}/{use-case}.tests.md` | Use Case Test Spec: Test Coverage table, variations |
| `docs/decisions/` | Project-specific ADRs |

Domain docs are the living source of truth. Follow the Spec sync rule on every change.

---

## Project-Specific Rules

Add rules here that extend (not replace) `standards/AGENTS.md`. Delete this section if none apply yet.

---

## Commands

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm lint && pnpm type-check && pnpm test && pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
node scripts/validate-domain-docs.mjs
```

Copy `scripts/validate-domain-docs.mjs` from the standards repository or invoke via submodule path.
