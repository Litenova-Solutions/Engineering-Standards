<!-- Last updated: (fill in date when first created in a project) -->
<!-- Required sections: Standards, Project Tech Stack, Project-Specific Rules -->
# {ProjectName} - Agent Context

> Copy this file to the project root as `AGENTS.md`. Fill in all `{placeholder}` values. Do not remove the reference to `standards/AGENTS.md`.

---

## Standards

This project follows the shared engineering standards. Read `standards/AGENTS.md` before touching any code. Then read the convention file for the layer you are editing. Then read the project-specific files listed below.

Read order:

1. `standards/AGENTS.md` - canonical rules, tech stack, non-negotiable rules.
2. `standards/docs/architecture/clean-architecture.md` - layer diagram and responsibilities.
3. `standards/docs/conventions/shared/agentic-guardrails.md` - scaffolding and verification.
4. The convention file for the layer you are editing (see index in `standards/AGENTS.md`).
5. `standards/docs/guides/definition-of-done.md` - before marking any feature complete.
6. The project-specific files below for domain context.

---

## Project Tech Stack

The base tech stack is defined in `standards/AGENTS.md`. This table lists only project-specific overrides or additions.

| Technology | Version / Notes |
|:---|:---|
| _(example) Authentication_ | _(example) JWT Bearer via Microsoft.AspNetCore.Authentication.JwtBearer_ |
| _(example) Blob Storage_ | _(example) Azure Blob Storage via Azure.Storage.Blobs - see `docs/decisions/turborepo-as-monorepo-tool.md`_ |

---

## Project-Specific Context

Read these files before generating any domain or application code. They contain the project's actual terms, aggregates, features, exceptions, and read models.

| File | Contents |
|:---|:---|
| `docs/domain/ubiquitous-language.md` | Glossary of domain terms and their code mappings. |
| `docs/domain/aggregate-inventory.md` | All aggregates, states, domain events, and repository interfaces. |
| `docs/domain/feature-inventory.md` | All implemented and planned use cases with handler class names. |
| `docs/domain/exception-inventory.md` | All custom exception types with categories and HTTP status codes. |
| `docs/domain/read-model-inventory.md` | `IDatabaseContext` properties, query handlers, and approved denormalized read models. |
| `docs/domain/frontend-feature-inventory.md` | Frontend routes and use cases aligned with backend. |
| `docs/domain/frontend-api-endpoints.md` | Consumed API endpoints and auth requirements. |
| `docs/decisions/` | Project-specific architecture decisions. |

---

## Non-Negotiable Project Rules

These rules extend the standards. They do not replace any rule in `standards/AGENTS.md`.

- MUST {placeholder: first project-specific rule, e.g., "use the `AuthorId` claim from the JWT for all author-scoped operations. Never accept `AuthorId` from the request body."}.
- MUST {placeholder: second project-specific rule, e.g., "store all uploaded files in Azure Blob Storage using the `IBlobStorageService` interface defined in `Application.Reactions`."}.
- MUST {placeholder: third project-specific rule, e.g., "include the `X-Correlation-Id` header in all outbound HTTP calls made by Infrastructure service clients."}.

---

## Commands

```bash
# See standards/docs/conventions/shared/ci.md for the full verification pipeline.
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm lint && pnpm type-check && pnpm test && pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
```
