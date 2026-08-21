# Engineering Standards Documentation

## Intent

Use this index to load the canonical foundation, profile, convention, extension, guide, or reference page for current work.

## Foundations

- [Scope](foundations/scope.md)
- [Principles](foundations/principles.md)
- [Agentic Engineering System](foundations/engineering-system.md)
- [Agent protocol](foundations/agent-protocol.md)
- [Release standard](foundations/release-standard.md)
- [Authoring standard](foundations/authoring-standard.md)

## Platform Profiles

- [ASP.NET Core and Next.js profile](profile/dotnet-nextjs.md)
- [.NET and Blazor client profile](profile/dotnet-blazor.md)

The profile selects every baseline convention. Exact versions and composition remain in `standards.manifest.json`.

## Workspace Conventions

- [Workspace structure](conventions/workspace/structure.md)
- [Naming](conventions/workspace/naming.md)
- [Dependencies](conventions/workspace/dependencies.md)
- [Configuration](conventions/workspace/configuration.md)

## Backend Conventions

- [Architecture](conventions/backend/architecture.md)
- [Domain](conventions/backend/domain.md)
- [Application](conventions/backend/application.md)
- [Marten persistence](conventions/backend/persistence-marten.md)
- [HTTP API](conventions/backend/api.md)
- [Backend testing](conventions/backend/testing.md)

## Frontend Conventions

- [Frontend structure](conventions/frontend/structure.md)
- [Rendering](conventions/frontend/rendering.md)
- [Components](conventions/frontend/components.md)
- [Controlled UI governance](conventions/frontend/ui-governance.md)
- [Data and state](conventions/frontend/data-and-state.md)
- [Frontend testing](conventions/frontend/testing.md)

## Blazor Client Conventions

- [Client structure](conventions/frontend-blazor/structure.md)
- [Client rendering and routes](conventions/frontend-blazor/rendering.md)
- [Client components](conventions/frontend-blazor/components.md)
- [Client data and state](conventions/frontend-blazor/data-and-state.md)
- [Browser persistence](conventions/frontend-blazor/persistence-browser.md)
- [Client testing](conventions/frontend-blazor/testing.md)

## Quality and Operations

- [Security](conventions/quality/security.md)
- [Operations](conventions/quality/operations.md)
- [Continuous integration](conventions/quality/ci.md)

## Extensions

- [Extension catalog and selection](extensions/README.md)
- [Executable acceptance BDD](extensions/acceptance-bdd.md)
- [API compatibility](extensions/api-compatibility.md)
- [Caching](extensions/caching.md)
- [Concurrency and idempotency](extensions/concurrency-idempotency.md)
- [Data lifecycle](extensions/data-lifecycle.md)
- [Container deployment](extensions/deployment-containers.md)
- [External integrations](extensions/external-integrations.md)
- [Auth.js frontend authentication](extensions/frontend-authjs.md)
- [Localization](extensions/localization.md)
- [Multitenancy](extensions/multitenancy.md)
- [Outbox worker](extensions/outbox-worker.md)
- [EF Core persistence](extensions/persistence-ef-core.md)
- [Realtime updates](extensions/realtime.md)
- [Reporting](extensions/reporting.md)
- [Scheduled jobs](extensions/scheduled-jobs.md)

## Guides

- [Get started](guides/getting-started.md)
- [Model a domain](guides/model-domain.md)

## Reference and Templates

- [Glossary](reference/glossary.md)
- [Consumer templates](../templates/docs/README.md)
- [Reference validators](../tools/README.md)

Consumers pin a complete release. `CHANGELOG.md` is the only repository release note.
