# V1 Release Scope

This page records the historical v1 scope. Standards v1.10.0 adds reference validators and the
controlled React web UI baseline; read [the v1.10 upgrade guide](upgrade-v1.10.md) for the current
consumer contract.

## Purpose

Standards v1 defines the Agentic Engineering System profile for one maintainer and collaborating agents building and operating one business web application. Litenova Solutions uses this standards repository as its engineering system for developing software. The model remains general enough for another technical team to adopt. It combines durable specifications, engineering rules, executable verification, and release records. It is a documentation and contract release, not generated application code.

Exact versions, profile composition, extension paths, scopes, and task load plans live in `standards.manifest.json`.

## Release contents

V1 contains:

- The root agent protocol and source-precedence rules.
- A machine-readable manifest plus schemas for the manifest, consumer selection, and Specification Metadata.
- Foundations for supported scope, engineering principles, the Agentic Engineering System, agent work, and application release control.
- One `dotnet-nextjs` platform profile.
- Repository, backend, frontend, testing, security, operations, and CI conventions with canonical rule IDs.
- Project-scoped and locally applicable extension standards.
- Guides for adoption, Domain modeling, and release migration.
- Templates for product, end-to-end flow, module, use case, workflow, domain policy, decision evidence, operating limits, page, decision, runbook, and release records.
- Reference decisions and a shared glossary.

The standards repository has no CLI, generated catalog, application generator, or bundled consumer validator. Consumers remain normal source repositories and pin this repository as a standards dependency.

## Mandatory consumer baseline

| Area | V1 contains |
|:---|:---|
| Product delivery | One bounded context, one deployed primary release flow, use-case specifications, stable acceptance and end-to-end test IDs, and risk-driven assurance |
| Backend shape | Domain, Application, Infrastructure, and WebApi projects, plus AppHost and ServiceDefaults; module-first folders; inward references; internal sealed implementations |
| Domain model | Aggregate roots, typed IDs, value objects, required state record hierarchies, transitions, aggregate invariants, domain events, repository boundaries, and safe domain failures |
| Application | LiteBus commands and queries, validators, handlers, transport-neutral results and failures, target authorization, narrow ports, event reactions, and durable workflow orchestration |
| Persistence | PostgreSQL and Marten, scoped sessions, Aggregate repositories, direct Query projections, one post-handler commit, explicit JSON contracts, document evolution, indexes, and release-time schema application |
| HTTP | Minimal API endpoints, deterministic discovery, claims-derived actors, resource authorization, Problem Details, pagination, documented statuses, and deterministic OpenAPI |
| Frontend | Optional Next.js App Router applications, server-first rendering, module isolation, generated API types, one typed client, serializable action results, explicit route states, accessibility, and layered tests |
| Verification | Domain, Application, Integration, and Architecture tests; real PostgreSQL and API harnesses; acceptance trace; generated-contract freshness; end-to-end tests for end-to-end flows |
| Security | Provider-neutral JWT validation, deny-by-default access, resource authorization, safe errors, input and browser boundaries, secret handling, abuse controls, CORS, audit Events, rotation, and supply-chain gates |
| Operations | Aspire local orchestration, trace-correlated diagnostics, bounded metrics, liveness and readiness, schema rollout, tested restore, repeatable deployment and rollback, alerts, operating limits, runbooks, and release records |
| CI and release | Locked restores, applicable jobs, contract and schema checks, dependency inventory, immutable artifacts, readiness, deployed end-to-end tests, and branch protection |

A frontend is optional. Worker and Acceptance.Tests projects are conditional. The baseline uses one API process and one PostgreSQL database.

## Conditional catalog

V1 includes extensions for BDD acceptance tests, API compatibility, caching, concurrency, data lifecycle, container deployment, external integrations, Auth.js, localization, multitenancy, outbox delivery, EF Core, realtime updates, reporting, and scheduled jobs.

An extension remains inactive until its activation rule applies and the consumer selects it. Project-scoped extensions then apply across affected project work. Local extensions apply only to allowed specifications that list them.

## Application v1 claim

A consumer may claim application v1 only after its primary release flow is deployed and the complete [release gate](../foundations/release-standard.md) passes. The claim includes verified behavior specifications, a deployed end-to-end test, access control, schema repeatability, tested restore, diagnostics, CI, deployment, rollback, operating limits, runbooks, and a release record for one artifact.

Passing standards repository checks proves the standards package is internally consistent. It does not prove a consumer application is release-ready.

## Outside v1

V1 does not standardize microservices, multiple bounded contexts, event sourcing, native application architecture, non-.NET backends, non-Next.js frontends, active-active regions, large data pipelines, or a general platform engineering layer. A consumer may record a local decision for an unsupported boundary, but it cannot claim that boundary is covered by the v1 profile.
