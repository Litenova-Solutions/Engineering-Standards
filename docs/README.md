# LiteSpec Documentation

## Intent

Use this index to load the canonical page for current work.

The folder a page sits in decides who applies it. Pages in `core/`, `workspace/` and `quality/` apply to every project. Pages directly in `backend/` and `frontend/` are principles for every backend and every frontend. A stack folder such as `backend/dotnet/` holds how one stack realizes them, and a project applies its stack's folder and every folder above it.

A provision ID is its page and heading, so `litespec/frontend/components#compose-composites-in-page-code` is a heading in `frontend/components.md`. The [provision index](reference/provisions.md) lists them all. The `tools/`, `guide/`, `tutorial/` and `reference/` folders carry no provisions.

## Which page do you want

A **tutorial** takes you through a first working result, one step at a time.
A **how-to** solves one stated problem for a reader who already has it running.
A **reference** states exact values, options, and defaults, and is read by looking up.
A **command** page documents one command: its options, its exit codes, and what it runs underneath.
A standards page owns the provisions a reader cites for one concern.

## Core

- [LiteSpec](core/system.md)
- [Supported scope](core/scope.md)
- [Stacks](core/stacks.md)
- [Principles](core/principles.md)
- [Project model](core/model.md)
- [Product intent](core/product.md)
- [Agent protocol](core/agent.md)
- [Authoring standard](core/authoring.md)
- [Maintaining the standards](core/maintaining.md)
- [Release standard](core/release.md)

## Workspace

- [Workspace structure](workspace/structure.md)
- [Naming](workspace/naming.md)
- [Dependencies](workspace/dependencies.md)
- [Configuration](workspace/config.md)

## Quality

- [Security](quality/security.md)
- [Operations](quality/operations.md)
- [Continuous integration](quality/ci.md)

## Backend

These principles hold for every backend. A backend stack folder states how its technology realizes them.

- [Architecture](backend/architecture.md)
- [Domain](backend/domain.md)
- [Application](backend/application.md)
- [Persistence](backend/persistence.md)
- [HTTP API](backend/api.md)
- [Backend testing](backend/testing.md)
- [Identifiers](backend/identifiers.md)

## Dotnet stack

- [.NET stack](backend/dotnet/stack.md)
- [.NET architecture](backend/dotnet/architecture.md)
- [.NET domain](backend/dotnet/domain.md)
- [.NET application](backend/dotnet/application.md)
- [.NET persistence](backend/dotnet/persistence.md)
- [.NET HTTP API](backend/dotnet/api.md)
- [.NET testing](backend/dotnet/testing.md)
- [.NET workspace](backend/dotnet/workspace.md)
- [.NET naming](backend/dotnet/naming.md)
- [.NET packages](backend/dotnet/packages.md)
- [.NET configuration](backend/dotnet/config.md)
- [EF Core persistence](backend/dotnet/ext/efcore.md), an extension for this stack
- [Executable acceptance BDD](backend/dotnet/ext/bdd.md), an extension for this stack

## Frontend

These principles hold for every frontend, the Blazor stack and a native client included.

- [Frontend structure](frontend/structure.md)
- [Frontend rendering and routes](frontend/rendering.md)
- [Frontend components](frontend/components.md)
- [Controlled UI governance](frontend/ui.md)
- [UI pattern decisions](frontend/patterns.md)
- [Frontend data and state](frontend/data.md)
- [Frontend testing](frontend/testing.md)

## Web

The TypeScript web pages that the React and Svelte stacks share. This folder is a group, not a stack: no project selects it directly.

- [Web structure](frontend/web/structure.md)
- [Web rendering and routes](frontend/web/rendering.md)
- [TypeScript web components](frontend/web/components.md)
- [Web UI](frontend/web/ui.md)
- [Web UI pattern decisions](frontend/web/patterns.md)
- [Web data and state](frontend/web/data.md)
- [Web testing](frontend/web/testing.md)

## React stack

- [React stack](frontend/web/react/stack.md)
- [React components](frontend/web/react/components.md)

## Svelte stack

- [Svelte stack](frontend/web/svelte/stack.md)
- [Svelte components](frontend/web/svelte/components.md)

## Blazor stack

- [Blazor stack](frontend/blazor/stack.md)
- [Blazor structure](frontend/blazor/structure.md)
- [Blazor rendering and routes](frontend/blazor/rendering.md)
- [Blazor components](frontend/blazor/components.md)
- [Blazor data and state](frontend/blazor/data.md)
- [Browser persistence](frontend/blazor/browser.md)
- [Blazor testing](frontend/blazor/testing.md)

## Ext

Extensions any stack can select. An extension for one stack sits in that stack's `ext/` folder and is listed with the stack.

- [Extension catalog and selection](ext/README.md)
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
- [Realtime updates](ext/realtime.md)
- [Reporting](ext/report.md)
- [Scheduled jobs](ext/jobs.md)
- [Static marketing site](ext/site.md)
- [Release stage](ext/stage.md)
- [Agent delegation](ext/delegation.md)

## Tools

- [Command index](tools/README.md)
- [Initialize Consumer](tools/init.md)
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
