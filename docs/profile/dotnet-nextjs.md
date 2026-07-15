# .NET and Next.js Platform Profile

## Intent

This profile selects one supported platform so architecture and coding conventions can be concrete. It combines a .NET modular monolith, PostgreSQL, Marten, LiteBus, Aspire local orchestration, and optional Next.js frontends in one repository.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}

- Use one bounded-context modular monolith.
- Use Domain, Application, Infrastructure, and WebApi as the four application projects.
- Use PostgreSQL and Marten as baseline persistence.
- Use LiteBus command and query entry points with one command commit pipeline.
- Use Aspire for local service orchestration.
- Add Next.js frontends only when the product has a web surface.

## Standards

### Apply the complete profile (PROFILE.COMPOSITION.001)

Selecting `dotnet-nextjs` activates every baseline convention listed in this document. Consumers cannot claim the profile while silently omitting an applicable standard.

### Use manifest version pins (PROFILE.VERSIONS.001)

Resolve SDK, framework, NuGet, and npm versions from `standards.manifest.json`. Do not copy a version from prose, an example, package search results, or agent memory.

### Declare replacements (PROFILE.REPLACEMENT.001)

An extension or consumer override may replace a baseline choice only when it names every affected rule ID. Unrelated profile standards remain active.

## Included conventions

### Repository

- [Repository structure](../conventions/repository/structure.md)
- [Naming and code style](../conventions/repository/naming.md)
- [Dependencies](../conventions/repository/dependencies.md)
- [Configuration](../conventions/repository/configuration.md)

### Backend

- [Architecture](../conventions/backend/architecture.md)
- [Domain](../conventions/backend/domain.md)
- [Application](../conventions/backend/application.md)
- [Marten persistence](../conventions/backend/persistence-marten.md)
- [HTTP API](../conventions/backend/api.md)

### Frontend

- [Frontend structure](../conventions/frontend/structure.md)
- [Rendering and routes](../conventions/frontend/rendering.md)
- [Components and UI](../conventions/frontend/components.md)
- [Data, forms, and state](../conventions/frontend/data-and-state.md)
- [Frontend testing](../conventions/frontend/testing.md)

### Quality and operations

- [Backend testing](../conventions/quality/backend-testing.md)
- [Security](../conventions/quality/security.md)
- [Operations](../conventions/quality/operations.md)

## Conventions

### Keep the platform profile visible

Consumer `standards.project.json` names `dotnet-nextjs`. The root `AGENTS.md` identifies the .NET solution name, frontend app names, and commands that substitute project placeholders.

## Verification

- Confirm the consumer profile is `dotnet-nextjs`.
- Confirm dependency versions match the manifest.
- Confirm every declared extension exists and its replacements are explicit.
- Confirm project paths match the repository structure convention.
