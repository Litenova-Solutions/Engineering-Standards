# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/2.0.0.html).

---

## [Unreleased]

Changes on `main` after v1.0.0 will be listed here.

---

## [1.0.0] - 2026-05-23

First pinned baseline for consumer projects. Pin this tag as a git submodule or subtree.

### Added

- `AGENTS.md` agent contract with full convention index and blueprint references.
- Backend conventions (01 through 19): domain, application, infrastructure, WebApi, exceptions, query/read, testing, observability, reliability, jobs, caching, deployment, worker, auth, options, concurrency, soft delete, raw SQL.
- Frontend conventions (01 through 10): App Router, components, data fetching, state/forms, i18n, testing, feature boundaries, error handling, environment config, admin API auth.
- Shared conventions: CI, CI/CD, security, monorepo, containers, IaC, git workflow, naming, forbidden packages, supply chain, realtime, agentic guardrails, writing style.
- Blueprints: Program.cs (sole composition root), AppHost, Worker, infrastructure DI, endpoints, outbox, idempotency, architecture tests, integration factory, frontend scaffolds, combined `proxy.ts` (auth + CSP).
- Templates: CI workflow, Dockerfiles, `global.json`, monorepo root files (`package.json`, `pnpm-workspace.yaml`, `turbo.json`), Playwright, ESLint, api-types/api-client packages, feature spec + example, inventories.
- Guides: create-new-project, add-new-feature, spec-driven development, definition-of-done, single-project-setup (legacy).
- Runbooks index and ten operational runbooks.
- Nineteen architecture decisions indexed in `docs/decisions/README.md`.
- `standards.manifest.json` with pinned NuGet and npm package versions.
- Standards repo CI: link check, template completeness, AGENTS.md line limit, bootstrap smoke test.

### Changed

- LiteBus pinned to 4.3.x (correct modular packages).
- OpenAPI freshness gate uses build output path `bin/Release/net10.0/openapi.json`.
- Admin API auth convention renumbered to `10-admin-api-auth.md`.
- Program.cs, LiteBus registration, and health check writer consolidated into blueprints.

[Unreleased]: https://github.com/Litenova-Solutions/Engineering-Standards/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Litenova-Solutions/Engineering-Standards/releases/tag/v1.0.0
