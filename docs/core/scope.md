# Supported Scope

## Intent

The selected profile supports one application class so agents can make concrete decisions without inventing architecture for every task. The profile fits a business web application.

Applications outside this boundary can use individual ideas but do not claim selected-profile conformance.

## Agent Summary {#agent-summary}

- Use the supported ASP.NET Core and PostgreSQL profile. (standards/rule/core-scope.use-the-supported-application-profile)
- Keep one business context and deployment boundary. (standards/rule/core-scope.keep-one-bounded-context)
- Select conditional extensions only when criteria apply. (standards/rule/core-scope.select-conditional-extensions-explicitly)
- Record unsupported architecture decisions explicitly. (standards/rule/core-scope.record-unsupported-scope-decisions)
- Declare a consumer that ships no backend. (standards/rule/core-scope.declare-a-consumer-that-has-no-backend)

## Standards

### Use the supported application profile (standards/rule/core-scope.use-the-supported-application-profile)

**Requirement:** A `dotnet-nextjs` profile consumer MUST use one business web system with ASP.NET Core API, PostgreSQL, Marten, and zero or more Next.js frontends.

**Rationale:** The supported profile gives one repository, backend, persistence model, and optional web interface boundary.

**Example:** An API-only catalog fits; a native-only mobile application does not.

### Keep one bounded context (standards/rule/core-scope.keep-one-bounded-context)

**Requirement:** A `dotnet-nextjs` profile consumer MUST keep one business language and deployment boundary.

**Rationale:** Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select conditional extensions explicitly (standards/rule/core-scope.select-conditional-extensions-explicitly)

**Requirement:** A consumer MUST select an extension declared in `extensions` within `standards.manifest.json` only when that extension's stated activation criteria apply.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition requires them. The manifest is the authoritative list, so a release that adds an extension does not leave this rule naming a shorter set. A rule that enumerated capabilities instead would name seven of the sixteen the release ships.

**Example:** Caching, durable messaging, executable BDD, realtime delivery, multitenancy, reporting, and alternate persistence are extensions. [The extension index](../ext/README.md) groups every shipped extension by the capability it adds.

### Record selected extensions (standards/rule/core-scope.record-selected-extensions)

**Requirement:** A consumer MUST list every selected extension in `selectedExtensions` in `standards.project.json`.

**Rationale:** The project record determines which extension boundaries apply to its work.

### Declare a consumer that has no backend (standards/rule/core-scope.declare-a-consumer-that-has-no-backend)

**Requirement:** A consumer with no backend MUST omit `paths.apiSolution` and record a decision naming every baseline rule left without a surface.

**Rationale:** A frontend and its build-time content can satisfy the workspace, frontend, security, operations, and continuous integration conventions with no API, database, or persistence layer. Adding a backend to obtain conformance contradicts `standards/rule/core-principles.require-current-complexity-activation`.

**Example:** `standards/rule/quality-ci.run-applicable-gates-on-every-pull-request` already permits skipping a gate whose surface does not exist, so a missing backend gate is a recorded consequence rather than an unexplained absence.

### Record unsupported scope decisions (standards/rule/core-scope.record-unsupported-scope-decisions)

**Requirement:** A consumer MUST record a separate profile or project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** These architectures change the supported profile's assumptions and require their own boundaries.

## Conventions

### Start with one API and database (standards/rule/core-scope.start-with-one-api-and-database)

**Default:** Use one API deployable and one database for the baseline profile.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A Worker appears only when a process continues independently of an HTTP request.

### Measure capacity before expansion (standards/rule/core-scope.measure-capacity-before-expansion)

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Measured evidence establishes which capacity change addresses the observed limitation.

## Reference example

This informative example demonstrates `standards/rule/core-scope.use-the-supported-application-profile` and `standards/rule/core-scope.select-conditional-extensions-explicitly`.

A publishing product can support sign-in, draft creation, publication, and public reading. Multi-tenant publication, live editing, and bulk analytics require their selected extension boundaries.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-scope.use-the-supported-application-profile | inspection | Consumer profile and project structure match the supported application definition. |
| standards/rule/core-scope.keep-one-bounded-context | inspection | Architecture review identifies one business language and deployment boundary. |
| standards/rule/core-scope.select-conditional-extensions-explicitly | inspection | Every selected extension cites its activation condition. |
| standards/rule/core-scope.record-selected-extensions | static | `ScopeExtensionsTests` asserts project schema validation resolves each selected extension. |
| standards/rule/core-scope.declare-a-consumer-that-has-no-backend | static | `node standards/tools/validate-consumer.mjs` accepts an absent `paths.apiSolution` only alongside its recorded decision. |
| standards/rule/core-scope.record-unsupported-scope-decisions | inspection | Unsupported architecture work cites a separate profile or project decision. |
| standards/rule/core-scope.start-with-one-api-and-database | inspection | Baseline topology uses one API and database or records a replacement. |
| standards/rule/core-scope.measure-capacity-before-expansion | inspection | Capacity decision records load, target latency, and observed constraint. |
