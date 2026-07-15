# Standards Documentation

## Intent

This index gives humans and AI agents one navigation map. Read foundation documents to understand the method, then load only the conventions related to the current task.

## Foundations

| Document | Read when |
|:---|:---|
| [Supported scope](foundations/scope.md) | Evaluating whether an application fits version 1. |
| [Engineering principles](foundations/principles.md) | Making a design choice not covered by a narrower convention. |
| [Agentic Domain-Driven Delivery](foundations/addd.md) | Planning, documenting, or implementing product behavior. |
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

## Backend conventions

| Document | Covers |
|:---|:---|
| [Architecture](conventions/backend/architecture.md) | Four-project modular monolith, dependency direction, capability slices, and Worker activation. |
| [Domain](conventions/backend/domain.md) | Aggregates, value objects, IDs, events, repositories, exceptions, time, and folders. |
| [Application](conventions/backend/application.md) | Commands, queries, handlers, validators, results, reactions, ports, and folders. |
| [Marten persistence](conventions/backend/persistence-marten.md) | Sessions, repositories, queries, commit pipeline, event collection, aliases, and schema changes. |
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

## Extensions

Extensions are inactive until a current requirement meets their activation criteria and the consumer lists the extension in `standards.project.json`.

Read the [extension index](extensions/README.md) to select conditional standards for authentication, BDD, caching, concurrency, deployment, external services, localization, tenancy, durable delivery, EF Core, realtime behavior, or reporting.

## Reference and templates

- [Glossary](reference/glossary.md) defines repository terms.
- [Decision records](reference/decisions/README.md) explain baseline choices.
- [Upgrade guides](reference/upgrade-guides/pre-v1-to-v1.md) describe consumer work across standards versions.
- [Document templates](../templates/docs/README.md) provide consumer starting points.

Schemas are not part of the human reading path. They validate only `standards.manifest.json` and consumer `standards.project.json` files.
