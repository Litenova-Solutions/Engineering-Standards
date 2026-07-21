# Standards Documentation

## Intent

This index gives humans and AI agents one navigation map. Read foundation documents to understand the method, then load only the conventions related to the current task.

## Foundations

| Document | Read when |
|:---|:---|
| [Supported scope](foundations/scope.md) | Evaluating whether an application fits version 1. |
| [Engineering principles](foundations/principles.md) | Making a design choice not covered by a narrower convention. |
| [Agentic Engineering System](foundations/engineering-system.md) | Understanding system context, vocabulary, specifications, agent work, or product delivery. |
| [Agent operating protocol](foundations/agent-protocol.md) | Configuring or reviewing agent behavior. |
| [Release standard](foundations/release-standard.md) | Deciding whether a use case or application v1 is complete. |

## Platform profile

The [dotnet-nextjs profile](profile/dotnet-nextjs.md) selects the baseline stack and lists every convention included in version 1.

## Repository conventions

| Document | Covers |
|:---|:---|
| [Repository structure](conventions/repository/structure.md) | Monorepo tree, app placement, solution placement, shared packages, and project documentation. |
| [Naming and code style](conventions/repository/naming.md) | Files, C# types, TypeScript files, suffixes, async methods, exceptions, and generic-name restrictions. |
| [Dependencies](conventions/repository/dependencies.md) | Project references, package ownership, version pins, and package approval. |
| [Configuration](conventions/repository/configuration.md) | SDK pins, central package files, build properties, environment access, and secrets. |
| [Repository writing](conventions/repository/writing.md) | ASCII-safe prose, normative language, document structure, and repeatable writing checks. |

## Backend conventions

| Document | Covers |
|:---|:---|
| [Architecture](conventions/backend/architecture.md) | Four-project modular monolith, dependency direction, module and use-case slices, and Worker activation. |
| [Domain](conventions/backend/domain.md) | Aggregate roots, required state record hierarchies, Value Objects, IDs, entities, services, Events, repositories, errors, and persistence-neutral object design. |
| [Application](conventions/backend/application.md) | Commands, queries, handlers, validators, results, event reactions, workflows, ports, and folders. |
| [Marten persistence](conventions/backend/persistence-marten.md) | Sessions, repositories, queries, commit pipeline, event collection, JSON contracts, document evolution, aliases, indexes, and schema changes. |
| [HTTP API](conventions/backend/api.md) | Minimal API endpoints, routes, transport models, status codes, Problem Details, authorization, and OpenAPI. |

## Frontend conventions

| Document | Covers |
|:---|:---|
| [Frontend structure](conventions/frontend/structure.md) | App tree, feature boundaries, shared code, generated types, and multiple frontends. |
| [Rendering and routes](conventions/frontend/rendering.md) | App Router, Server Components, client boundaries, route files, loading, errors, and metadata. |
| [Components and UI](conventions/frontend/components.md) | Component categories, props, shadcn/ui ownership, accessibility, variants, and content safety. |
| [Data, forms, and state](conventions/frontend/data-and-state.md) | Typed API access, reads, mutations, forms, URL state, local state, and optional client caches. |
| [Frontend testing](conventions/frontend/testing.md) | Vitest, Playwright, test placement, acceptance trace, and browser-risk boundaries. |

## Quality and operations

| Document | Covers |
|:---|:---|
| [Backend testing](conventions/quality/backend-testing.md) | Test projects, naming, fixtures, PostgreSQL integration, architecture tests, and acceptance trace. |
| [Security](conventions/quality/security.md) | Authentication, authorization, trust boundaries, secrets, SQL, errors, browser security, and dependencies. |
| [Operations](conventions/quality/operations.md) | Aspire, diagnostics, health, schema rollout, backup, deployment, rollback, and Worker operation. |
| [Continuous integration](conventions/quality/ci.md) | Pull request gates, generated contracts, supply-chain scans, schema artifacts, promotion, and branch protection. |

## Extensions

Extensions are inactive until a current requirement meets their activation criteria and the consumer lists the extension in `selectedExtensions` in `standards.project.json`.

Read the [extension index](extensions/README.md) to select conditional standards for API compatibility, authentication, BDD, caching, concurrency, data lifecycle, deployment, external services, localization, scheduled jobs, tenancy, durable delivery, EF Core, realtime behavior, or reporting.

## Reference and templates

- [Glossary](reference/glossary.md) defines repository terms.
- [Decision records](reference/decisions/README.md) explain baseline choices.
- [Adopt standards v1](guides/adopt-v1.md) gives a greenfield consumer sequence.
- [Upgrade to standards v1.1](guides/upgrade-v1.1.md) gives the consumer migration sequence for document metadata and consistency checks.
- [Upgrade to standards v1.2](guides/upgrade-v1.2.md) explains the Subject migration and aggregate root boundary.
- [Upgrade to standards v1.3](guides/upgrade-v1.3.md) explains the Agentic Engineering System vocabulary, document layout, metadata, extension, workflow, and state-record migration.
- [V1 release scope](guides/v1-release-scope.md) states the complete baseline, conditional catalog, release contents, and exclusions.
- [Model a domain module](guides/model-domain.md) turns known business language into aggregate, state, invariant, event, and use-case documentation.
- [Document templates](../templates/docs/README.md) provide consumer starting points.
- [Module index template](../templates/docs/modules-index.md) defines the module documentation boundary.
- [End-to-End Flow template](../templates/docs/end-to-end-flow.md) connects use cases to one product outcome.
- [Workflow template](../templates/docs/workflow.md) defines durable system-controlled progress.
- [Domain Policy template](../templates/docs/domain-policy.md) records a domain rule that applies within one module or across multiple modules.
- [Decision Evidence template](../templates/docs/decision-evidence.md) records evidence for a decision when the investigation needs its own document.
- [Operating limits template](../templates/docs/operating-limits.md) records the supported envelope and recovery limits.
- [Runbook template](../templates/docs/runbook.md) gives the required operational record shape.
- [V2 roadmap](../ROADMAP.md) records evidence-gated candidates after v1 adoption.

Schemas are not part of the human reading path. They validate the standards manifest, consumer `standards.project.json`, and kind-specific Specification Metadata defined by the Agentic Engineering System. Cross-file checks still resolve references and compare local extension applicability with the manifest and consumer selection.
