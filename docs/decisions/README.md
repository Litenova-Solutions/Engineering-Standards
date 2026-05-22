# Architecture Decisions (Standards Repository)

Decision records explain **why** a stack or pattern was chosen. They are **not** the agent contract.

| Load for coding | Document |
|:---|:---|
| MUST | `docs/conventions/` and `AGENTS.md` |
| MUST NOT (routine tasks) | `docs/decisions/` |
| MAY (new dependency, trade-off review) | Relevant decision below |

---

## When to Write a Decision Here

Write a new file in `docs/decisions/` when the standards repo adopts a new org-wide technology or reverses an existing one. Project-specific decisions belong in the **consumer repository** under `docs/decisions/`, not in this repo.

**File naming:** `docs/decisions/{kebab-case-topic}.md` (no numeric prefix).

**Filing steps:**

1. Copy the template from `docs/conventions/shared/adr-template.md`.
2. Add a row to the index table below with **Canonical rules** pointing at the convention file agents MUST follow.
3. Commit the decision and any convention updates in the same pull request.

---

## Active Decisions Index

| Decision | Status | Canonical rules (agents use this) |
|:---|:---|:---|
| [agentic-development-as-primary-model](agentic-development-as-primary-model.md) | Accepted | `AGENTS.md`, `docs/conventions/shared/agentic-guardrails.md` |
| [clean-architecture-as-structural-foundation](clean-architecture-as-structural-foundation.md) | Accepted | `docs/architecture/clean-architecture.md` |
| [cqrs-with-split-application-projects](cqrs-with-split-application-projects.md) | Accepted | `docs/conventions/backend/03-application-layer.md` |
| [litebus-as-mediator](litebus-as-mediator.md) | Accepted | `docs/conventions/backend/03-application-layer.md`, `05-api-layer.md` |
| [minimal-api-endpoint-classes](minimal-api-endpoint-classes.md) | Accepted | `docs/conventions/backend/05-api-layer.md` |
| [contracts-projects-for-application-layer](contracts-projects-for-application-layer.md) | Accepted | `docs/conventions/backend/03-application-layer.md` |
| [reactions-project-depends-only-on-abstractions](reactions-project-depends-only-on-abstractions.md) | Accepted | `docs/conventions/backend/03-application-layer.md` |
| [architecture-tests-as-enforcement](architecture-tests-as-enforcement.md) | Accepted | `docs/conventions/backend/08-testing.md` |
| [outbox-pattern-as-reliability-escalation](outbox-pattern-as-reliability-escalation.md) | Accepted | `docs/conventions/backend/10-reliability.md` |
| [turborepo-as-monorepo-tool](turborepo-as-monorepo-tool.md) | Accepted | `docs/conventions/backend/01-solution-structure.md` |
| [openapi-typescript-client-generation](openapi-typescript-client-generation.md) | Accepted | `docs/conventions/frontend/03-data-fetching.md` |
| [authjs-v5-authentication](authjs-v5-authentication.md) | Accepted | `docs/conventions/frontend/01-nextjs-app-router.md`, `03-data-fetching.md` |
| [animation-tailwind-first-framer-motion-escalation](animation-tailwind-first-framer-motion-escalation.md) | Accepted | `docs/conventions/frontend/02-components.md` |
| [idatabasecontext-over-per-aggregate-read-stores](idatabasecontext-over-per-aggregate-read-stores.md) | Accepted | `docs/conventions/backend/07-query-read-strategy.md` |
| [transaction-pipeline-behaviors](transaction-pipeline-behaviors.md) | Accepted | `docs/architecture/clean-architecture.md`, `docs/conventions/backend/04-infrastructure-layer.md` |
| [pagination-convention](pagination-convention.md) | Accepted | `docs/conventions/backend/07-query-read-strategy.md` |
| [opentelemetry-observability](opentelemetry-observability.md) | Accepted | `docs/conventions/backend/09-observability.md` |
| [api-versioning-policy](api-versioning-policy.md) | Accepted | `docs/conventions/backend/05-api-layer.md` |
| [signalr-for-real-time-updates](signalr-for-real-time-updates.md) | Accepted | `docs/conventions/shared/realtime-updates.md` |
| [multi-tenancy-default](multi-tenancy-default.md) | Accepted | Project ADR required before implementation |
