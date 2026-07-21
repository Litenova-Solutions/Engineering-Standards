# V1 Release Scope

## Purpose

Standards v1 gives one maintainer and collaborating agents a bounded way to build and operate one business web application. It is a documentation and contract release, not generated application code.

Exact versions, profile composition, extension paths, scopes, and task load plans live in `standards.manifest.json`.

## Release contents

V1 contains:

- The root agent protocol and source-precedence rules.
- A machine-readable manifest plus schemas for the manifest, consumer selection, and Specification Metadata.
- Foundations for supported scope, engineering principles, ADDD, agent work, and application release evidence.
- One `dotnet-nextjs` platform profile.
- Repository, backend, frontend, testing, security, operations, and CI conventions with canonical rule IDs.
- Project-scoped and locally applicable extension standards.
- Guides for adoption, Domain modeling, and release migration.
- Templates for Product, Business Flow, Subject, Use case, Workflow, Shared Rule, Claims and Evidence, Operating Limits, Page, decision, runbook, and release evidence records.
- Reference decisions and a shared glossary.

The standards repository has no CLI, generated catalog, application generator, or bundled consumer validator. Consumers remain normal source repositories and pin this repository as a standards dependency.

## Mandatory consumer baseline

| Area | V1 contains |
|:---|:---|
| Product delivery | One bounded context, one deployed Primary Business Flow, Use-case specifications, stable acceptance and Flow-check IDs, and Risk-driven assurance |
| Backend shape | Domain, Application, Infrastructure, and WebApi projects, plus AppHost and ServiceDefaults; Subject-first folders; inward references; internal sealed implementations |
| Domain model | Aggregate roots, typed IDs, Value Objects, selected lifecycle representations, transitions, Aggregate Rules, Domain Events, repository boundaries, and safe Domain failures |
| Application | LiteBus Commands and Queries, validators, handlers, transport-neutral results and failures, target authorization, narrow ports, Follow-ups, and durable Workflow orchestration |
| Persistence | PostgreSQL and Marten, scoped sessions, Aggregate repositories, direct Query projections, one post-handler commit, explicit JSON contracts, document evolution, indexes, and release-time schema application |
| HTTP | Minimal API endpoints, deterministic discovery, claims-derived actors, resource authorization, Problem Details, pagination, documented statuses, and deterministic OpenAPI |
| Frontend | Optional Next.js App Router applications, server-first rendering, Subject isolation, generated API types, one typed client, serializable action results, explicit route states, accessibility, and layered tests |
| Verification | Domain, Application, Integration, and Architecture tests; real PostgreSQL and API harnesses; acceptance trace; generated-contract freshness; Flow checks for Business Flows |
| Security | Provider-neutral JWT validation, deny-by-default access, resource authorization, safe errors, input and browser boundaries, secret handling, abuse controls, CORS, audit Events, rotation, and supply-chain gates |
| Operations | Aspire local orchestration, trace-correlated diagnostics, bounded metrics, liveness and readiness, schema rollout, tested restore, repeatable deployment and rollback, alerts, Operating Limits, runbooks, and release evidence |
| CI and release | Locked restores, applicable jobs, contract and schema checks, dependency inventory, immutable artifacts, readiness, deployed Flow checks, and branch protection |

A frontend is optional. Worker and Acceptance.Tests projects are conditional. The baseline uses one API process and one PostgreSQL database.

## Conditional catalog

V1 includes extensions for BDD acceptance tests, API compatibility, caching, concurrency, data lifecycle, container deployment, external integrations, Auth.js, localization, multitenancy, outbox delivery, EF Core, realtime updates, reporting, and scheduled jobs.

An extension remains inactive until its activation rule applies and the consumer selects it. Project-scoped extensions then apply across affected project work. Local extensions apply only to allowed specifications that list them.

## Application v1 claim

A consumer may claim application v1 only after its Primary Business Flow is deployed and the complete [release gate](../foundations/release-standard.md) passes. The claim includes verified behavior specifications, a deployed Flow check, access control, schema repeatability, tested restore, diagnostics, CI, deployment, rollback, Operating Limits, runbooks, and release evidence for one artifact.

Passing standards repository checks proves the standards package is internally consistent. It does not prove a consumer application is release-ready.

## Outside v1

V1 does not standardize microservices, multiple bounded contexts, event sourcing, native application architecture, non-.NET backends, non-Next.js frontends, active-active regions, large data pipelines, or a general platform engineering layer. A consumer may record a local decision for an unsupported boundary, but it cannot claim that boundary is covered by the v1 profile.

V2 candidates are recorded in the [root roadmap](../../ROADMAP.md) and require adoption evidence before they become standards.
