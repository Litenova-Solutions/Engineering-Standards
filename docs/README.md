# Engineering Standards Documentation

## Intent

Use this index to load the canonical page for current work.

Each directory under `docs/` is one provision area. A page path states the scope its provisions carry, so `frontend/components.md` owns `FRONTEND.COMPONENTS`. The [provision index](reference/provisions.md) resolves any identifier to its page.

## Core

- [Scope](core/scope.md)
- [Principles](core/principles.md)
- [Agentic Engineering System](core/system.md)
- [Agent protocol](core/agent.md)
- [Release standard](core/release.md)
- [Authoring standard](core/authoring.md)

## Profile

- [.NET and Next.js platform profile](profile/nextjs.md)
- [.NET and Blazor platform profile](profile/blazor.md)

The profile selects every baseline page. Exact versions and composition remain in `standards.manifest.json`.

## Workspace

- [Workspace structure](workspace/structure.md)
- [Naming](workspace/naming.md)
- [Dependencies](workspace/dependencies.md)
- [Configuration](workspace/config.md)

## Backend

- [Architecture](backend/architecture.md)
- [Domain](backend/domain.md)
- [Application](backend/application.md)
- [Marten persistence](backend/persistence.md)
- [HTTP API](backend/api.md)
- [Backend testing](backend/testing.md)

## Frontend

- [Frontend structure](frontend/structure.md)
- [Frontend rendering and routes](frontend/rendering.md)
- [Frontend components](frontend/components.md)
- [Controlled UI governance](frontend/ui.md)
- [Frontend data and state](frontend/data.md)
- [Frontend testing](frontend/testing.md)

## Blazor

- [Blazor structure](blazor/structure.md)
- [Blazor rendering and routes](blazor/rendering.md)
- [Blazor components](blazor/components.md)
- [Blazor data and state](blazor/data.md)
- [Browser persistence](blazor/browser.md)
- [Blazor testing](blazor/testing.md)

## Quality

- [Security](quality/security.md)
- [Operations](quality/operations.md)
- [Continuous integration](quality/ci.md)

## Ext

- [Extension catalog and selection](ext/README.md)
- [Executable acceptance BDD](ext/bdd.md)
- [API compatibility](ext/compat.md)
- [Caching](ext/cache.md)
- [Concurrency and idempotency](ext/concurrency.md)
- [Data lifecycle](ext/lifecycle.md)
- [Container deployment](ext/containers.md)
- [External integrations](ext/integrations.md)
- [Audit trail](ext/audit.md)
- [Auth.js frontend authentication](ext/authjs.md)
- [Localization](ext/locale.md)
- [Multitenancy](ext/tenancy.md)
- [Outbox worker](ext/outbox.md)
- [EF Core persistence](ext/efcore.md)
- [Realtime updates](ext/realtime.md)
- [Reporting](ext/report.md)
- [Scheduled jobs](ext/jobs.md)

## Guide

- [Get started](guide/getting-started.md)
- [Model a domain](guide/model-domain.md)
- [Build an audit trail](guide/audit-trail.md)

## Reference

- [Glossary](reference/glossary.md)
- [Provision index](reference/provisions.md)
- [Audit obligations](reference/audit-obligations.md)
- [Consumer templates](../templates/consumer/README.md)
- [Reference validators](../tools/README.md)

Consumers pin a complete release. `CHANGELOG.md` is the only repository release note.
