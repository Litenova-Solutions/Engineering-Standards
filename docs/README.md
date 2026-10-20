# LiteSpec Documentation

## Intent

Use this index to load the canonical page for current work.

The provision areas are BACKEND, BLAZOR, CORE, EXT, FRONTEND, PROFILE, QUALITY, REACT, SVELTE, and WORKSPACE, one directory each under `docs/`. A page path states the scope its provisions carry, so `frontend/components.md` owns `frontend-components`. The [provision index](reference/provisions.md) resolves any identifier to its page. The `tools/`, `guide/`, `tutorial/`, and `reference/` directories carry no provisions.

## Which page do you want

A **tutorial** takes you through a first working result, one step at a time.
A **how-to** solves one stated problem for a reader who already has it running.
A **reference** states exact values, options, and defaults, and is read by looking up.
A **command** page documents one command: its options, its exit codes, and what it runs underneath.
A standards page owns the provisions a reader cites for one concern.

## Core

- [Scope](core/scope.md)
- [Principles](core/principles.md)
- [LiteSpec](core/system.md)
- [Agent protocol](core/agent.md)
- [Product intent](core/product.md)
- [Release standard](core/release.md)
- [Authoring standard](core/authoring.md)
- [Maintaining the standards](core/maintaining.md)
- [Project model](core/model.md)

## Profile

- [React stack](profile/react.md)
- [Svelte stack](profile/svelte.md)
- [Blazor stack](profile/blazor.md)

Each stack page states what selecting that stack adds: its pages, its pins, and its checks. Exact versions and composition remain in `litespec.manifest.json`.

## Workspace

- [Workspace structure](workspace/structure.md)
- [Naming](workspace/naming.md)
- [Dependencies](workspace/dependencies.md)
- [Configuration](workspace/config.md)

## Backend

- [Architecture](backend/architecture.md)
- [Domain](backend/domain.md)
- [Application](backend/application.md)
- [Persistence](backend/persistence.md)
- [HTTP API](backend/api.md)
- [Backend testing](backend/testing.md)
- [Identifiers](backend/identifiers.md)

## Frontend

- [Frontend structure](frontend/structure.md)
- [Frontend rendering and routes](frontend/rendering.md)
- [Frontend components](frontend/components.md)
- [Controlled UI governance](frontend/ui.md)
- [UI pattern decisions](frontend/patterns.md)
- [Frontend data and state](frontend/data.md)
- [Frontend testing](frontend/testing.md)

Each frontend page is stack-neutral, with short per-stack sections for what differs between React, Svelte, and Blazor.

## React

- [React components](react/components.md)

## Svelte

- [Svelte components](svelte/components.md)

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
- [Localization](ext/locale.md)
- [Model Context Protocol](ext/mcp.md)
- [Multitenancy](ext/tenancy.md)
- [Outbox worker](ext/outbox.md)
- [EF Core persistence](ext/efcore.md)
- [Realtime updates](ext/realtime.md)
- [Reporting](ext/report.md)
- [Scheduled jobs](ext/jobs.md)
- [Static marketing site](ext/site.md)
- [Release stage](ext/stage.md)
- [Agent delegation](ext/delegation.md)

## Tools

- [Command index](tools/README.md)
- [Validate Standards](tools/validate.md)
- [Generate Provisions](tools/provisions.md)
- [Validate Consumer](tools/consumer.md)
- [Validate Controlled UI](tools/ui.md)
- [Project model builder](tools/model.md)

## Guide

- [Build an audit trail](guide/audit-trail.md)

## Tutorial

- [Get started](tutorial/getting-started.md)
- [Model a domain](tutorial/model-domain.md)

## Reference

- [Glossary](reference/glossary.md)
- [Provision index](reference/provisions.md)
- [Audit obligations](reference/audit-obligations.md)
- [Decision records](reference/decision-records.md)
- [Consumer templates](../templates/consumer/README.md)

Consumers pin a complete release. `CHANGELOG.md` is the repository release note for the current major version, and `changelog/v<major>.md` holds each earlier major version.
