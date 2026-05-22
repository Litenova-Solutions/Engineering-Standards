# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/2.0.0.html).

---

## [Unreleased]

---

## [1.1.0] - 2026-05-22

### Added

- `docs/conventions/shared/forbidden-packages.md`: canonical forbidden NuGet and npm list.
- `docs/conventions/shared/writing-style.md`: forbidden words, punctuation, UI copy sourcing.
- `docs/conventions/shared/containers.md`: Dockerfile and runtime image rules.
- `docs/conventions/shared/infrastructure-as-code.md`: Terraform/Bicep baseline.
- `docs/conventions/backend/14-worker-projects.md`: worker host project layout.
- `docs/conventions/frontend/06-testing.md`: Vitest, RTL, and Playwright rules.
- `docs/conventions/frontend/07-feature-boundaries.md`: ESLint feature isolation.
- `docs/guides/definition-of-done.md`: full-stack agent completion checklist.
- `docs/templates/ci-workflow.yml`: GitHub Actions template with Playwright and OpenAPI gates.
- `docs/README.md`: documentation map for humans and agents.
- `docs/decisions/`: slug-based decision records (replaces numbered `docs/adr/`).
- `docs/decisions/README.md`: active index with canonical convention links.
- `standards.manifest.json`: machine-readable version and paths.
- `.cursor/rules/20-frontend-nextjs.mdc`: frontend critical rules for Cursor.
- `docs/conventions/backend/01-solution-structure.md` §8: pre-approved npm package table.
- Agent Quick Rules sections on large convention files (>300 lines).
- Expanded XML rules and anti-drift DO/DON'T blocks in `agentic-guardrails.md`.

### Changed

- `AGENTS.md`: slimmed to 104 lines; forbidden packages moved out; index expanded; security patch note for Next.js 16.2.6.
- `README.md`: Version 1.0.0 baseline, consumption matrix, layout refresh; org-neutral wording.
- `docs/conventions/shared/agentic-guardrails.md`: full rule index, CI-aligned pipeline, stub/Tailwind guardrails.
- `docs/conventions/shared/ci.md`: Playwright and OpenAPI required; template workflow reference.
- `docs/architecture/clean-architecture.md`: fixed section numbering (§7–9); links to `docs/decisions/`.
- `docs/decisions/litebus-as-mediator.md`: `IMessageMediator` MUST NOT in production.
- `docs/conventions/frontend/03-data-fetching.md`: `useMutation` MUST use `getApiClient()`.
- `docs/conventions/frontend/01-nextjs-app-router.md`: `route.ts` allowed cases; Agent Quick Rules.
- `docs/conventions/00-principles.md`: RFC 2119 tightening on principles 1, 2, 4.
- `docs/guides/add-new-feature.md`: DoD, Playwright, and `ci.md` alignment.
- `docs/templates/project-agents.md`: DoD and full verification commands.
- `.github/copilot-instructions.md`: guardrails, DoD, forbidden packages.
- RFC 2119 pass: `git-workflow.md`, `security.md`, `05-api-layer.md`, `02-components.md` (WCAG 2.2 AA default).
- All `ADR NNNN` references replaced with `docs/decisions/{slug}.md` paths.

### Removed

- `docs/appendix-rationale.md`: redundant with `docs/philosophy.md`.
- Read-store ADR (former 0007): never part of the standards; `IDatabaseContext` is the only read-side decision (`idatabasecontext-over-per-aggregate-read-stores.md`).
- `docs/adr/` numbered directory (migrated to `docs/decisions/`).

---

## [1.0.0] - 2026-05-20

Initial public baseline.

[1.1.0]: compare/v1.0.0...v1.1.0
[1.0.0]: releases/tag/v1.0.0
