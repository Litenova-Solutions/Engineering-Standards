# Supported Scope

## Intent

Version 1 supports one application class so agents can make concrete decisions without inventing an architecture for every task. The profile covers a small business web application that one maintainer can build and operate with extensive AI assistance.

The boundary is deliberate. Applications outside it may still use individual ideas from this repository, but they do not claim conformance with the version 1 profile.

## Agent Summary {#agent-summary}

- Apply version 1 to one bounded-context business application.
- Use the selected ASP.NET Core, PostgreSQL, Marten, and optional Next.js profile.
- Deliver one release-ready primary release flow before secondary product outcomes.
- Activate conditional behavior through named extensions.
- Record a decision before departing from a required standard.

## Standards

### Use the supported application profile (SCOPE.APPLICATION.001)

The application is a business web system with an ASP.NET Core API, PostgreSQL, Marten document persistence, and zero or more Next.js frontends in one repository.

An API-only catalog fits. A native mobile application without the supported API and web profile does not.

### Keep one bounded context (SCOPE.CONTEXT.001)

The application has one business language and one deployment boundary. Modules group cohesive domain language, models, use cases, and code inside that context. They do not become independent services or bounded contexts.

Posts, Authors, and Comments may be separate modules in one publishing context.

### Deliver a release-ready primary release flow (SCOPE.V1.001)

Application v1 includes one deployed primary release flow plus its required security, persistence, diagnostics, automated evidence, backup, deployment, rollback, and operating instructions.

V1 does not require speculative scale, multi-region operation, or optional product areas.

### Activate conditional behavior explicitly (SCOPE.EXTENSIONS.001)

Caching, durable messaging, executable BDD, realtime updates, multi-tenancy, reporting, provider-specific deployment, alternative persistence, and other conditional concerns remain inactive until their extension criteria apply.

The consumer lists every selected extension in `selectedExtensions` in `standards.project.json`.

### Record work outside the profile (SCOPE.OUTSIDE.001)

Microservices, multiple bounded contexts, native clients, other backend platforms, other frontend frameworks, event sourcing, active-active regions, and large data pipelines require a separate profile or a project decision that defines the unsupported boundary.

## Conventions

### Keep the first deployment small

Use one API deployable and one database by default. Add a Worker only for a process that must continue independently of an HTTP request.

### Defer capacity work until measured

Record the current load, latency target, and observed constraint before introducing caches, replicas, queues, or partitioning.

## Examples

A publishing v1 may support author sign-in, draft creation, publication, and public reading. Multi-tenant publications, live collaborative editing, and bulk analytics remain outside the primary release flow unless the product brief makes one of them essential.

## Verification

- Confirm the product brief names one primary release flow.
- Confirm `standards.project.json` selects `dotnet-nextjs`.
- Confirm each active conditional concern appears in `selectedExtensions` and each local extension appears on its applicable specifications.
- Confirm unsupported architecture choices have a project decision.
