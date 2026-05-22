<!-- Copy to project root as AGENTS.md. Replace {ProjectName}. -->
# {ProjectName} - Agent Context

This project follows the shared engineering standards. Read `standards/AGENTS.md` before touching any code.

---

## Read Order

1. `standards/AGENTS.md`
2. `standards/docs/architecture/clean-architecture.md`
3. `standards/docs/conventions/shared/agentic-guardrails.md`
4. The convention file for the layer you are editing
5. `standards/docs/guides/definition-of-done.md`
6. Project files in `docs/domain/` below

---

## Project-Specific Context

| File | Contents |
|:---|:---|
| `docs/domain/ubiquitous-language.md` | Glossary |
| `docs/domain/aggregate-inventory.md` | Aggregates and events |
| `docs/domain/feature-inventory.md` | Use cases and handlers |
| `docs/domain/exception-inventory.md` | Exception types |
| `docs/domain/read-model-inventory.md` | Read models and queries |
| `docs/domain/frontend-feature-inventory.md` | Frontend routes |
| `docs/domain/frontend-api-endpoints.md` | API endpoints consumed |
| `docs/specs/` | Approved feature specifications |
| `docs/decisions/` | Project-specific ADRs |

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
