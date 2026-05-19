# Architecture Decision Records

An Architecture Decision Record (ADR) is a document that captures a significant architectural decision, the context that led to it, and its consequences. ADRs are the written record of why the architecture looks the way it does. They are especially valuable when the original decision-makers are unavailable and when AI agents are working on the codebase.

See [`docs/conventions/shared/adr-template.md`](../conventions/shared/adr-template.md) for the full template, filing instructions, and a filled-in example.

---

## When to Write an ADR

Write an ADR any time a decision meets one or more of these criteria:

- It adds a new dependency (NuGet package, external service, infrastructure component).
- It involves a trade-off between at least two viable alternatives.
- A future engineer would wonder why this was done this way.
- It reverses or significantly changes an earlier decision.
- It affects multiple projects or teams.

---

## How to Create a New ADR

1. Copy the template block from `docs/conventions/shared/adr-template.md`.
2. Create a new file: `docs/adr/{NNNN}-{kebab-case-title}.md` using the next sequential number.
3. Fill in all sections: Context, Decision, and Consequences.
4. Add a row to the index table below.
5. Commit the ADR in the same pull request as the code change it documents.

---

## ADR Index

| Number | Title | Status | Date | Summary |
|:---|:---|:---|:---|:---|
| [0001](0001-agentic-development-as-primary-model.md) | Agentic Development as Primary Development Model | Accepted | 2025-01-01 | AI agents running in agentic mode are treated as the primary developer; all standards are designed to eliminate agent failure modes. |
| [0002](0002-clean-architecture-as-structural-foundation.md) | Clean Architecture as Structural Foundation | Accepted | 2025-01-01 | All projects use Clean Architecture to enforce a strict dependency inversion rule and isolate the domain from infrastructure. |
| [0003](0003-cqrs-with-split-application-projects.md) | CQRS with Split Application Projects | Accepted | 2025-01-01 | Commands and queries are separated into distinct projects to enforce the read/write boundary at the compiler level. |
| [0004](0004-litebus-as-mediator.md) | LiteBus as Mediator | Accepted | 2025-01-01 | LiteBus is the approved mediator library; MediatR is not used. |
| [0005](0005-minimal-api-endpoint-classes.md) | Minimal API Endpoint Classes | Accepted | 2025-01-01 | All HTTP endpoints implement `IEndpoint`; MVC controllers are not used. |
| [0006](0006-contracts-projects-for-application-layer.md) | Contracts Projects for the Application Layer | Accepted | 2025-01-01 | Dedicated Contracts projects isolate command/query types from handler implementations. |
| [0007](0007-read-store-pattern-for-queries.md) | Read Store Pattern for Queries | Superseded by ADR 0015 | 2025-01-01 | Original per-aggregate read store pattern. Superseded by the IDatabaseContext approach. |
| [0008](0008-reactions-project-depends-only-on-abstractions.md) | Reactions Project Depends Only on Abstractions | Accepted | 2025-01-01 | Event handlers define narrow interfaces for external capabilities; Infrastructure implements them. |
| [0009](0009-architecture-tests-as-enforcement.md) | Architecture Tests as Enforcement | Accepted | 2025-01-01 | NetArchTest architecture tests are a required part of the test suite and act as a second enforcement layer for structural rules. |
| [0010](0010-outbox-pattern-as-reliability-escalation.md) | Outbox Pattern as Reliability Escalation Path | Accepted | 2025-01-01 | The Outbox pattern is the approved escalation path when event delivery reliability becomes a requirement. |
| [0011](0011-turborepo-as-monorepo-tool.md) | Turborepo as Monorepo Tool | Accepted | 2026-01-01 | Turborepo with pnpm workspaces is the monorepo tool for co-locating Next.js and ASP.NET Core projects. |
| [0012](0012-openapi-typescript-client-generation.md) | OpenAPI TypeScript Client Generation | Accepted | 2026-01-01 | openapi-typescript generates types from the ASP.NET Core OpenAPI spec; openapi-fetch source is owned locally. |
| [0013](0013-authjs-v5-authentication.md) | Auth.js v5 Authentication | Accepted | 2026-01-01 | Auth.js v5 is the authentication standard; proxy.ts performs optimistic checks only. |
| [0014](0014-animation-tailwind-first-framer-motion-escalation.md) | Animation: Tailwind First, Framer Motion Escalation | Accepted | 2026-01-01 | Tailwind CSS transitions are the default; Framer Motion is added only when Tailwind is insufficient. |
| [0015](0015-idatabasecontext-over-per-aggregate-read-stores.md) | IDatabaseContext Over Per-Aggregate Read Stores | Accepted | 2026-01-01 | Replaces per-aggregate `IXxxReadStore` interfaces with a single `IDatabaseContext` exposing `IQueryable<T>` per aggregate. |
| [0016](0016-transaction-pipeline-behaviors.md) | Transaction Pipeline Behaviors | Accepted | 2026-01-01 | Transaction management handled by global LiteBus pre/post/error handlers; command handlers and repositories do not call `SaveChangesAsync`. |
| [0017](0017-pagination-convention.md) | Pagination Convention | Accepted | 2026-01-01 | Offset pagination with `PagedResult<T>` and `PaginationParameters` for HTTP list endpoints; `IStreamQuery` reserved for background processing. |
| [0018](0018-opentelemetry-observability.md) | OpenTelemetry as the Observability Standard | Accepted | 2026-05-19 | OpenTelemetry is the standard for traces and metrics; Serilog remains the structured logging provider. |
| [0019](0019-api-versioning-policy.md) | API Versioning Policy | Accepted | 2026-05-19 | Internal APIs start unversioned; public APIs use URL path versioning and new versions for breaking changes. |
| [0020](0020-signalr-for-real-time-updates.md) | SignalR for Real-Time Updates | Accepted | 2026-05-19 | SignalR is the real-time update standard; messages invalidate frontend server state rather than replace it. |
| [0021](0021-multi-tenancy-default.md) | Multi-Tenancy Default | Accepted | 2026-05-19 | Multi-tenancy is out of scope by default and requires a project ADR before implementation. |
