# Supported Scope

## Intent

The selected profile supports one application class so agents can make concrete decisions without inventing architecture for every task. The profile fits a business web application.

Applications outside this boundary can use individual ideas but do not claim selected-profile conformance.

## Agent Summary {#agent-summary}

- Use the supported ASP.NET Core and PostgreSQL profile. (SCOPE.APPLICATION.001)
- Keep one business context and deployment boundary. (SCOPE.CONTEXT.001)
- Select conditional extensions only when criteria apply. (SCOPE.EXTENSIONS.001)
- Record unsupported architecture decisions explicitly. (SCOPE.OUTSIDE.001)

## Standards

### Use the supported application profile (SCOPE.APPLICATION.001)

**Requirement:** A `dotnet-nextjs` profile consumer MUST use one business web system with ASP.NET Core API, PostgreSQL, Marten, and zero or more Next.js frontends.

**Rationale:** The supported profile gives one repository, backend, persistence model, and optional web interface boundary.

**Example:** An API-only catalog fits; a native-only mobile application does not.

### Keep one bounded context (SCOPE.CONTEXT.001)

**Requirement:** A `dotnet-nextjs` profile consumer MUST keep one business language and deployment boundary.

**Rationale:** Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select conditional extensions explicitly (SCOPE.EXTENSIONS.001)

**Requirement:** A consumer MUST select caching, durable messaging, BDD, realtime, multi-tenancy, reporting, deployment, or alternate persistence only when their extension criteria apply.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition requires them.

### Record selected extensions (SCOPE.EXTENSIONS.002)

**Requirement:** A consumer MUST list every selected extension in `selectedExtensions` in `standards.project.json`.

**Rationale:** The project record determines which extension boundaries apply to its work.

### Record unsupported scope decisions (SCOPE.OUTSIDE.001)

**Requirement:** A consumer MUST record a separate profile or project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** These architectures change the supported profile's assumptions and require their own boundaries.

## Conventions

### Start with one API and database (SCOPE.CONVENTION.001)

**Default:** Use one API deployable and one database for the baseline profile.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A Worker appears only when a process continues independently of an HTTP request.

### Measure capacity before expansion (SCOPE.CONVENTION.002)

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Measured evidence establishes which capacity change addresses the observed limitation.

## Reference example

This informative example demonstrates `SCOPE.APPLICATION.001` and `SCOPE.EXTENSIONS.001`.

A publishing product can support sign-in, draft creation, publication, and public reading. Multi-tenant publication, live editing, and bulk analytics require their selected extension boundaries.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| SCOPE.APPLICATION.001 | inspection | Consumer profile and project structure match the supported application definition. |
| SCOPE.CONTEXT.001 | inspection | Architecture review identifies one business language and deployment boundary. |
| SCOPE.EXTENSIONS.001 | inspection | Every selected extension cites its activation condition. |
| SCOPE.EXTENSIONS.002 | static | Project schema validation resolves each selected extension. |
| SCOPE.OUTSIDE.001 | inspection | Unsupported architecture work cites a separate profile or project decision. |
| SCOPE.CONVENTION.001 | inspection | Baseline topology uses one API and database or records a replacement. |
| SCOPE.CONVENTION.002 | inspection | Capacity decision records load, target latency, and observed constraint. |
