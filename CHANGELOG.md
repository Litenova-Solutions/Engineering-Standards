# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/2.0.0.html).

Nothing in this repository has been released to consumers yet. All work below targets the first release, **v1.0.0**.

---

## [1.0.0] - Unreleased

### Added

- `standards.manifest.json`: machine-readable version pins and paths.
- `docs/decisions/`: slug-based decision records (replaces numbered `docs/adr/`).
- `docs/decisions/README.md`: active index with canonical convention links.
- `docs/README.md`: documentation map for humans and agents.
- `docs/conventions/shared/forbidden-packages.md`: canonical forbidden NuGet and npm list.
- `docs/conventions/shared/writing-style.md`: forbidden words, punctuation, UI copy sourcing.
- `docs/conventions/shared/containers.md`: Dockerfile and runtime image rules.
- `docs/conventions/shared/infrastructure-as-code.md`: Terraform/Bicep baseline.
- `docs/conventions/shared/ci.md`: compact agent-consumable CI gate checklist.
- `docs/conventions/shared/supply-chain-security.md`: lockfile integrity and compromise response.
- `docs/conventions/shared/realtime-updates.md`: SignalR and TanStack Query integration.
- `docs/conventions/shared/naming.md`, `git-workflow.md`: shared naming and git conventions.
- `docs/conventions/backend/14-worker-projects.md`: worker host project layout.
- `docs/conventions/frontend/05-internationalization.md`: next-intl and message key rules.
- `docs/conventions/frontend/06-testing.md`: Vitest, RTL, and Playwright rules.
- `docs/conventions/frontend/07-feature-boundaries.md`: ESLint feature isolation.
- `docs/conventions/frontend/09-environment-and-runtime-config.md`: `lib/env.ts` pattern.
- `docs/guides/definition-of-done.md`: full-stack agent completion checklist.
- `docs/guides/add-new-feature.md`: step-by-step feature implementation guide.
- `docs/guides/spec-driven-development.md`: spec format, review gates, OpenAPI relationship.
- `docs/guides/single-project-setup.md`: repository root layout when not using monorepo nesting.
- `docs/templates/feature-spec.md`: structured feature specification template.
- `docs/templates/ci-workflow.yml`: GitHub Actions template with Playwright and OpenAPI gates.
- `docs/blueprints/frontend/feature-slice.md` and `server-action.md`: frontend scaffolds.
- Runbooks under `docs/runbooks/`: deploy, rollback, migrations, outbox recovery, secrets, incidents, npm compromise.
- `.cursor/rules/20-frontend-nextjs.mdc`: frontend critical rules for Cursor.
- `docs/conventions/backend/01-solution-structure.md` §8: pre-approved npm package table.
- Agent Quick Rules sections on large convention files (>300 lines).
- Expanded XML rules and anti-drift DO/DON'T blocks in `agentic-guardrails.md`.
- Domain services, value object collection equality, and Money precision conventions in `02-domain-layer.md`.
- Pagination query validator example in `03-application-layer.md`.
- Npgsql retry vs manual transaction guidance in `04-infrastructure-layer.md`.
- Background job idempotency pattern in `10-reliability.md`.
- Correlation ID propagation via `DelegatingHandler` in `09-observability.md`.
- Agent scaffolding checkpoints (`dotnet build`, `dotnet test`, `dotnet ef migrations add`) in `agentic-guardrails.md`.
- Idempotency single-transaction pipeline in `idempotency.md` blueprint (no separate `SaveChangesAsync` in endpoint).
- Outbox vs in-process dispatch: events dispatched only from `SaveChangesCommandPostHandler`, not `AppDbContext.SaveChangesAsync`.
- W3C trace context replaces custom `X-Correlation-ID` in `09-observability.md`.
- Query handler tests require PostgreSQL Testcontainers (`postgres:18-alpine`); SQLite mandate removed from `08-testing.md`.
- Route parameters use strongly typed `PostId` / `IParsable<T>` with OpenAPI transformer (not raw `Guid`).
- Protected route `layout.tsx` MUST call `auth()`; `proxy.ts` is UX-only.
- Pagination query validation exceptions in `06-exception-hierarchy.md`.
- `IClock` / `SystemClock` pattern in `03-application-layer.md`.
- Zod v4 cheat sheet in `04-state-and-forms.md`.
- Next.js `use cache` + authenticated fetch rules in `01-nextjs-app-router.md`.
- Outbox dispatcher graceful shutdown in `outbox.md` blueprint.
- `docs/templates/Directory.Build.props` and `Directory.Packages.props` copy-paste templates.
- Rate limiter ordered after CORS in `05-api-layer.md` and `program-cs.md`.
- `RaiseDomainEvent` fix in `18-soft-delete.md`; `AddDomainEvent` removed.

### Changed

- Monorepo layout: .NET solution lives under `apps/api/` (`src/`, `tests/`, `global.json`); Next.js under `apps/web/`; shared packages under `packages/`.
- `docs/conventions/shared/monorepo-structure.md`: authoritative `apps/api/` + `apps/web/` layout.
- `docs/conventions/backend/02-domain-layer.md`: `Publish()` and state transition examples use `DateTimeOffset utcNow` from `IClock`.
- `docs/architecture/clean-architecture.md`: transaction pipeline defers to Infrastructure doc; `IDomainEvent` cross-reference; section numbering fix.
- `docs/conventions/backend/04-infrastructure-layer.md`: canonical `NoOpEventPublisher` location.
- `docs/conventions/backend/05-api-layer.md` and `16-options-and-configuration.md`: `CorsOptions` `[MinLength(1)]` and startup validation.
- TanStack advisory framing in `03-data-fetching.md` and `standards.manifest.json` (`@tanstack/query*` confirmed clean).
- Aspire `AddNextJsApp` path corrected to `../../../apps/web` from AppHost.
- `AGENTS.md`: monorepo paths, security patch notes, frontend blueprints, convention index (147 lines).
- `README.md`: v1.0.0 baseline, consumption matrix, layout refresh; org-neutral wording.
- `docs/conventions/shared/agentic-guardrails.md`: full rule index, CI-aligned pipeline, stub/Tailwind guardrails.
- `docs/conventions/shared/ci-cd.md`: aligned with `apps/api/` paths.
- `docs/decisions/litebus-as-mediator.md`: `IMessageMediator` MUST NOT in production.
- `docs/conventions/frontend/03-data-fetching.md`: `useMutation` MUST use `getApiClient()`.
- `docs/conventions/frontend/01-nextjs-app-router.md`: `route.ts` allowed cases; RSC security patch note.
- `docs/conventions/00-principles.md`: RFC 2119 tightening on principles 1, 2, 4.
- `docs/templates/project-agents.md`: DoD and full verification commands.
- `.github/copilot-instructions.md`: guardrails, DoD, forbidden packages.
- RFC 2119 pass: `git-workflow.md`, `security.md`, `05-api-layer.md`, `02-components.md` (WCAG 2.2 AA default).
- All `ADR NNNN` references replaced with `docs/decisions/{slug}.md` paths.
- `docs/conventions/backend/06-exception-hierarchy.md`: canonical `GlobalExceptionHandler` implementation (single source; replaces duplicates in `05-api-layer.md` and `program-cs.md`).
- `docs/conventions/backend/05-api-layer.md`: validation error JSON schema aligned with frontend `invalidParams` array contract.

### Removed

- `docs/appendix-rationale.md`: redundant with `docs/philosophy.md`.
- Read-store ADR (former 0007): never part of the standards; `IDatabaseContext` is the only read-side decision (`idatabasecontext-over-per-aggregate-read-stores.md`).
- `docs/adr/` numbered directory (migrated to `docs/decisions/`).
