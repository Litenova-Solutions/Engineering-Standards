<!-- Copy to project root as AGENTS.md. Replace {ProjectName}. -->
# {ProjectName} - Agent Context

This project follows the shared engineering standards. Read `standards/AGENTS.md` before touching any code.

---

## Read Order (always)

1. `standards/AGENTS.md`
2. `standards/docs/architecture/clean-architecture.md`
3. `standards/docs/conventions/shared/agentic-guardrails.md`
4. The convention file for the layer you are editing
5. `standards/docs/guides/definition-of-done.md`

---

## Read Order (use case implementation)

Follow this sequence when building or changing a use case. Do not skip to code without a use case doc.

1. `docs/domain/README.md`
2. `docs/domain/{feature}/README.md`
3. `docs/domain/{feature}/{use-case}.md`
4. `standards/docs/guides/agentic-domain-driven-design.md`
5. `standards/docs/guides/add-new-use-case.md`
6. Update domain docs in the same PR as the implementation

---

## Project Domain Documentation

| Path | Contents |
|:---|:---|
| `docs/domain/README.md` | System map of features and use cases |
| `docs/domain/{feature}/README.md` | Feature domain: language, aggregate, invariants, events |
| `docs/domain/{feature}/{use-case}.md` | Use case: commands, endpoints, UI, acceptance criteria |
| `docs/decisions/` | Project-specific ADRs |

Domain docs are the living source of truth. Update them in the same PR as code changes.

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
```
