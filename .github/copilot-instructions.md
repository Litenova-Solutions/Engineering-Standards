# GitHub Copilot Instructions

The canonical agent guide is `AGENTS.md` at the repository root (or `standards/AGENTS.md` when this repository is included as a submodule).

## Before Generating Code

1. Read `AGENTS.md` in full.
2. Read `docs/conventions/shared/agentic-guardrails.md` for scaffolding and verification.
3. Read `docs/guides/definition-of-done.md` before marking work complete.
4. Read the convention file for the layer you edit (backend or frontend index in `AGENTS.md`).
5. For consuming projects, read `docs/domain/` inventories and the project `AGENTS.md` shim.

## Non-Negotiable Rules

- **IEndpoint only.** Never generate MVC controllers.
- **IDatabaseContext for queries.** Never load aggregates or inject repositories in query handlers.
- **Correct exceptions.** See `docs/conventions/backend/06-exception-hierarchy.md`.
- **No handlers in Contracts.** Records and interfaces only in Contracts projects.
- **No external libraries in Application.Reactions.** Narrow interfaces in Reactions; implementations in Infrastructure.
- **`cancellationToken` naming.** Exact name on all async methods.
- **Forbidden packages.** `docs/conventions/shared/forbidden-packages.md`.
- **Frontend boundaries.** No cross-feature imports; use `getApiClient()`; complete DoD checklist.

## Verification

Run gates in `docs/conventions/shared/ci.md` (including Playwright when `apps/web/` exists).
