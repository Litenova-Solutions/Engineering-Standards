# V1 Release Scope

## Purpose

The standards v1 release gives one maintainer and collaborating agents a complete, bounded way to build and operate one business web application. It is a documentation and contract release, not a generated application scaffold.

Exact versions, profile composition, extension paths, and task load plans live in `standards.manifest.json`.

## Release contents

V1 contains:

- The root agent protocol and source-precedence rules.
- A machine-readable manifest plus schemas for the standards manifest and consumer selection file.
- Foundations for supported scope, engineering principles, ADDD, agent work, and application release evidence.
- One `dotnet-nextjs` platform profile.
- Fine-grained repository, backend, frontend, testing, security, operations, and CI conventions with stable rule IDs.
- Conditional extension standards selected by current use-case requirements and risk.
- Guides for greenfield adoption and tactical Domain modeling.
- Consumer templates for product, domain, use-case, page, decision, runbook, release-evidence, and agent documentation.
- Reference decisions and a shared glossary.

The standards repository does not include a CLI, generated catalog, or application code generator. Consumers remain normal source repositories and pin this repository as a standards dependency.

## Mandatory consumer baseline

| Area | V1 contains |
|:---|:---|
| Product delivery | One bounded context, one deployed primary journey, short inception documents, use-case specifications, stable acceptance IDs, and risk-driven assurance |
| Backend shape | Domain, Application, Infrastructure, and WebApi projects, plus AppHost and ServiceDefaults; capability-first folders; inward references; internal sealed implementations |
| Domain model | Aggregate roots, typed IDs, value objects, explicit state record hierarchies, transitions, invariants, domain events, repository boundaries, and safe Domain failures |
| Application | LiteBus commands and queries, structural validators, handlers, transport-neutral results and failures, target authorization, narrow ports, and explicit reactions |
| Persistence | PostgreSQL and Marten, scoped sessions, aggregate repositories, direct query projections, one post-handler commit, explicit JSON contracts, document evolution, indexes, and release-time schema application |
| HTTP | Minimal API endpoint classes, deterministic discovery, claims-derived actors, resource authorization, exact Problem Details and pagination contracts, documented statuses, and deterministic OpenAPI |
| Frontend | Optional Next.js App Router applications, server-first rendering, capability isolation, generated API types, one typed client, serializable action results, explicit route states, accessibility, and layered tests |
| Verification | Domain, Application, Integration, and Architecture test projects; real PostgreSQL and API harnesses; acceptance trace; generated-contract freshness; browser tests for critical journeys |
| Security | Provider-neutral JWT validation, deny-by-default access, resource authorization, safe errors, input and browser boundaries, secret handling, abuse controls, CORS, audit events, rotation, and supply-chain gates |
| Operations | Aspire local orchestration, W3C-correlated diagnostics, low-cardinality metrics, liveness and readiness, schema rollout, tested restore, repeatable deployment and rollback, alerts, runbooks, and release evidence |
| CI and release | Locked restores, applicable backend and frontend jobs, contract and schema checks, dependency inventory, immutable artifacts, readiness, deployed smoke testing, and branch protection |

A frontend is optional. Worker and Acceptance.Tests projects are conditional. The baseline uses one API process and one PostgreSQL database.

## Conditional catalog

V1 includes extension standards for:

- Executable BDD acceptance tests.
- API compatibility and versioning.
- Caching.
- Concurrency and idempotency.
- Data lifecycle.
- Container deployment.
- External integrations.
- Auth.js frontend authentication.
- Localization.
- Multitenancy.
- Durable outbox delivery and Worker operation.
- EF Core persistence for named aggregate paths.
- Realtime updates.
- Reporting and large exports.
- Scheduled or delayed Worker jobs.

An extension is available in v1 but inactive until its activation rule applies and the consumer lists it. Availability is not a recommendation to enable it.

## Application v1 claim

A consumer may claim application v1 only after its primary journey is deployed and the complete [release gate](../foundations/release-standard.md) passes. The claim includes automated acceptance evidence, security for restricted access, schema repeatability, tested restore, diagnostics, CI, deployment, rollback, and a deployed smoke test.

Passing the standards repository checks proves the standards package is internally consistent. It does not prove a consumer application is release-ready.

## Outside v1

V1 does not standardize microservices, several bounded contexts, event sourcing, native application architecture, non-.NET backends, non-Next.js frontends, active-active regions, large data pipelines, or a general platform engineering layer. A consumer may record a local decision for an unsupported boundary, but it cannot claim that boundary is covered by the v1 profile.

V2 candidates are recorded in the [root roadmap](../../ROADMAP.md) and require adoption evidence before they become standards.
