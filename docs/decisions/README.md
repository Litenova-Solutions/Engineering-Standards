# Architecture Decisions (Standards Repository)

Decision records explain **why** a stack or pattern was chosen. They are **not** the agent contract.

| Load for coding | Document |
|:---|:---|
| MUST | `docs/conventions/` and `AGENTS.md` |
| MUST NOT (routine tasks) | `docs/decisions/` |
| MAY (new dependency, trade-off review) | Relevant decision below |

---

## Status lifecycle

| Status | Meaning |
|:---|:---|
| Proposed | Under discussion; not yet normative |
| Accepted | Active; canonical rules in conventions apply |
| Superseded | Replaced by another decision; link the successor in the old file header |
| Deprecated | No longer recommended; retained for history |

When superseding a decision, update the old file status in its header, add a row with status **Superseded**, and point **Canonical rules** at the new convention or decision.

---

## Concern tags

Filter the index by area: `backend`, `frontend`, `infrastructure`, `tooling`, `process`.

---

## When to Write a Decision Here

Write a new file in `docs/decisions/` when the standards repo adopts a new org-wide technology or reverses an existing one. Project-specific decisions belong in the **consumer repository** under `docs/decisions/`, not in this repo.

**Do not use `docs/adr/`.** All decision records for this repository live in `docs/decisions/` with kebab-case filenames (no numeric prefix). The manifest field `decisionsRoot` points here.

**File naming:** `docs/decisions/{kebab-case-topic}.md` (no numeric prefix).

**Filing steps:**

1. Copy the template from `docs/conventions/shared/adr-template.md`.
2. Add a row to the index table below with **Canonical rules** pointing at the convention file agents MUST follow.
3. Commit the decision and any convention updates in the same pull request.

---

## Active Decisions Index

| Decision | Status | Concern | Canonical rules (agents use this) |
|:---|:---|:---|:---|
| [agentic-development-as-primary-model](agentic-development-as-primary-model.md) | Accepted | process | `AGENTS.md`, `docs/conventions/shared/agentic-guardrails.md` |
| [clean-architecture-as-structural-foundation](clean-architecture-as-structural-foundation.md) | Accepted | backend | `docs/architecture/clean-architecture.md` |
| [cqrs-with-split-application-projects](cqrs-with-split-application-projects.md) | Accepted | backend | `docs/conventions/backend/application-layer.md` |
| [litebus-as-mediator](litebus-as-mediator.md) | Accepted | backend | `docs/conventions/backend/application-layer.md`, `api-layer.md` |
| [minimal-api-endpoint-classes](minimal-api-endpoint-classes.md) | Accepted | backend | `docs/conventions/backend/api-layer.md` |
| [contracts-projects-for-application-layer](contracts-projects-for-application-layer.md) | Accepted | backend | `docs/conventions/backend/application-layer.md` |
| [reactions-project-depends-only-on-abstractions](reactions-project-depends-only-on-abstractions.md) | Accepted | backend | `docs/conventions/backend/application-layer.md` |
| [architecture-tests-as-enforcement](architecture-tests-as-enforcement.md) | Accepted | backend | `docs/conventions/backend/testing.md` |
| [outbox-pattern-as-reliability-escalation](outbox-pattern-as-reliability-escalation.md) | Accepted | backend | `docs/conventions/backend/reliability.md` |
| [turborepo-as-monorepo-tool](turborepo-as-monorepo-tool.md) | Accepted | tooling | `docs/conventions/shared/monorepo-structure.md` |
| [openapi-typescript-client-generation](openapi-typescript-client-generation.md) | Accepted | frontend | `docs/conventions/frontend/data-fetching.md` |
| [authjs-v5-authentication](authjs-v5-authentication.md) | Accepted | frontend | `docs/conventions/frontend/nextjs-app-router.md`, `data-fetching.md` |
| [animation-tailwind-first-framer-motion-escalation](animation-tailwind-first-framer-motion-escalation.md) | Accepted | frontend | `docs/conventions/frontend/components.md` |
| [idatabasecontext-over-per-aggregate-read-stores](idatabasecontext-over-per-aggregate-read-stores.md) | Accepted | backend | `docs/conventions/backend/query-read-strategy.md` |
| [transaction-pipeline-behaviors](transaction-pipeline-behaviors.md) | Accepted | backend | `docs/architecture/clean-architecture.md`, `infrastructure-layer.md` |
| [pagination-convention](pagination-convention.md) | Accepted | backend | `docs/conventions/backend/query-read-strategy.md` |
| [opentelemetry-observability](opentelemetry-observability.md) | Accepted | infrastructure | `docs/conventions/backend/observability.md` |
| [api-versioning-policy](api-versioning-policy.md) | Accepted | backend | `docs/conventions/backend/api-layer.md` |
| [signalr-for-real-time-updates](signalr-for-real-time-updates.md) | Accepted | infrastructure | `docs/conventions/shared/realtime-updates.md` |
| [multi-tenancy-default](multi-tenancy-default.md) | Accepted | backend | Project ADR required before implementation |
| [adddd-executable-acceptance-tests](adddd-executable-acceptance-tests.md) | Accepted | backend | `docs/conventions/backend/api-acceptance-tests.md`, `testing.md` |
| [validation-error-dual-contracts-placement](validation-error-dual-contracts-placement.md) | Accepted | backend | `docs/conventions/backend/exception-hierarchy.md` |
