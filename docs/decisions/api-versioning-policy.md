# API Versioning Policy

**Status:** Accepted

**Date:** 2026-05-19

## Context

HTTP APIs change over time. Internal full-stack applications can often update frontend and backend together, but public clients, mobile apps, partner integrations, and background workers may lag behind backend deployments.

Versioning too early adds route and OpenAPI complexity. Versioning too late forces breaking changes on clients. The standards need a clear default and an escalation path.

Options considered:

1. No versioning. Simple, but no documented path for breaking API changes.
2. Query-string or header versioning. Keeps URLs stable, but is less visible in logs, browser inspection, and client examples.
3. URL path versioning such as `/api/v1`. Explicit, cache-friendly, and easy to reason about in Minimal API route groups.

## Decision

Internal applications start with unversioned routes. Any API consumed by external clients, mobile apps, partners, or independently deployed services uses URL path versioning from the first public release.

When a project needs more than one active API version, use the ASP.NET API Versioning Minimal API package and document the package adoption in the project ADR. The shared standard prefers URL path versioning with route groups such as `/api/v1`.

Breaking changes require a new version. Additive changes do not.

## Consequences

### Positive

- Simple internal projects do not carry versioning ceremony.
- Public APIs have an explicit compatibility contract.
- URL path versioning is visible in routes, logs, OpenAPI documents, and generated clients.
- Minimal API route groups can keep versioned endpoints organized by feature.

### Negative

- Supporting multiple active versions increases test and maintenance cost.
- URL versioning duplicates routes when versions diverge.
- API clients must choose a version explicitly once versioning is introduced.

### Risks

- Teams may call a breaking response-shape change "additive" to avoid a new version. Contract tests and OpenAPI diff checks must catch this before merge.