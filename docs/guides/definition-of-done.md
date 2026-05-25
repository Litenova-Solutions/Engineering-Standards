# Agent Definition of Done (DoD)

Before an AI agent marks a feature task as complete, it MUST verify every applicable item. If an item does not apply, the agent MUST document why in the task summary.

---

## 1. Backend Contract

- [ ] EF Core migration generated when schema changed (`dotnet ef migrations add`).
- [ ] Command or query records added to the correct `.Contracts` project.
- [ ] Handler implemented; domain invariants enforced in aggregates, not handlers.
- [ ] `CommandValidationException` or `QueryValidationException` used for all structural input validation.
- [ ] Backend unit and integration tests written and passing (`dotnet test apps/api/{ProjectName}.slnx`).
- [ ] `{ProjectName}.Architecture.Tests` exists and passes (REQUIRED for standard solutions per `docs/decisions/architecture-tests-as-enforcement.md`).

---

## 2. API and Integration

- [ ] Minimal API `IEndpoint` created and mapped.
- [ ] OpenAPI spec regenerated and committed (`openapi.json` in `packages/api-types/` or project-equivalent path).
- [ ] Scalar or project-documented API reference UI available in Development when the WebApi project maps it.
- [ ] Frontend TypeScript types regenerated (`pnpm generate:api-types` or project-equivalent script).
- [ ] No drift between generated API types and committed files.

---

## 3. Frontend Execution

- [ ] Use case doc at `docs/domain/{feature}/{use-case}.md` updated to reflect current behavior.
- [ ] Feature README at `docs/domain/{feature}/README.md` updated when domain language or invariants changed.
- [ ] shadcn/ui bootstrapped in each touched frontend app (`components.json`, `components/ui/`, `lib/utils.ts`) unless a project ADR documents a different UI stack.
- [ ] Tailwind v4 entry CSS in each touched app: `@import "tailwindcss"` in `app/globals.css`, `@source` for `app/`, `components/`, and `domain/`, and `postcss.config.mjs` with `@tailwindcss/postcss`.
- [ ] Shared theme tokens imported from a workspace CSS package when all frontends use shadcn (project-specific; optional).
- [ ] Server Component used for initial data fetch on read-heavy pages.
- [ ] Server Action or typed client mutation pattern documented in the use-case doc; Zod validation at the mutation boundary.
- [ ] Error, loading, and empty states implemented (`error.tsx`, `loading.tsx`, or in-component equivalents).
- [ ] Playwright happy-path test added or updated for every new or changed user journey in the relevant app (`apps/{name}/e2e/`).
- [ ] Vitest tests added for new complex hooks, utilities, or Zod schemas.
- [ ] User-visible copy sourced per `docs/conventions/shared/writing-style.md` (UI_COPY_SOURCE rule).

---

## 4. Verification

- [ ] All applicable gates in `docs/conventions/shared/ci.md` passed locally or in CI.
- [ ] `dotnet build apps/api/{ProjectName}.slnx` succeeds.
- [ ] `dotnet test apps/api/{ProjectName}.slnx` succeeds, including Architecture.Tests.
- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build` succeed for every frontend app under `apps/` that changed.
- [ ] Playwright suite passes when E2E tests exist.
- [ ] No `TODO`, `FIXME`, or placeholder stub comments remain in changed files.
- [ ] No changed source file exceeds 300 lines.

---

## 5. Standards Compliance

- [ ] Relevant convention files read for every layer touched.
- [ ] No forbidden packages introduced (`docs/conventions/shared/forbidden-packages.md`).
- [ ] Domain folders do not import across domains (`docs/conventions/frontend/07-domain-boundaries.md`).
