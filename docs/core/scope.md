# Supported Scope

## Intent

Every project selects one size and declares its stacks, so agents can make concrete decisions without inventing architecture for every task.

Projects outside this boundary can use individual ideas but do not claim conformance.

## Agent Summary {#agent-summary}

- Select one size and declare one stack per frontend. (litespec/rule/core-scope.select-a-size-profile-and-stacks)
- Keep one business context and deployment boundary. (litespec/rule/core-scope.keep-one-bounded-context)
- Select conditional extensions only when criteria apply. (litespec/rule/core-scope.select-conditional-extensions-explicitly)
- Record every selection with its criterion and review date. (litespec/rule/core-scope.record-selected-extensions)
- State whether any outside constraint applies. (litespec/rule/core-scope.answer-the-constraints-question)
- Declare a consumer that ships no backend. (litespec/rule/core-scope.declare-a-consumer-that-has-no-backend)
- Record unsupported architecture decisions explicitly. (litespec/rule/core-scope.record-unsupported-scope-decisions)

## Standards

### Select a size profile and stacks (litespec/rule/core-scope.select-a-size-profile-and-stacks)

**Requirement:** A consumer MUST select the small or large size, one backend stack, and one stack per frontend, from the stacks its release ships.

**Rationale:** One size and explicit stacks let every check know which records and pages to require. The size decides which record types and test projects the project needs; each stack decides which technology pages and checks apply. Small needs the core types with Architecture and Integration test projects, while large adds problems, features, journeys, and cases with the Acceptance project. Each frontend declares react, svelte, or blazor-web.

**Example:** A library catalog with one web frontend selects small with the svelte stack; a clinic booking system with journeys selects large.

### Keep one bounded context (litespec/rule/core-scope.keep-one-bounded-context)

**Requirement:** A consumer MUST keep one business language and deployment boundary.

**Rationale:** Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select conditional extensions explicitly (litespec/rule/core-scope.select-conditional-extensions-explicitly)

**Requirement:** A consumer MUST select every extension whose activation criteria apply, and no extension whose criteria do not.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition requires them. The manifest's extension list is the closed set a project selects from.

**Example:** Caching, durable messaging, and multitenancy are extensions; the extension index lists each with its activation criteria.

### Record selected extensions (litespec/rule/core-scope.record-selected-extensions)

**Requirement:** A consumer MUST list every selected extension in `selectedExtensions` in `litespec.project.json`, each with its criterion and review date.

**Rationale:** The project record determines which extension boundaries apply to its work.

**Example:**

```json
{ "id": "cache", "criterion": "catalog reads miss the latency target", "reviewBy": "2027-01-15" }
```

### Answer the constraints question (litespec/rule/core-scope.answer-the-constraints-question)

**Requirement:** A consumer MUST state in `litespec.project.json` whether any outside constraint applies to the project.

**Rationale:** An empty answer is a stated answer: it records that no outside rule binds the project.

**Example:** A clinic booking system records that medical-device regulation does not apply to appointment scheduling.

### Declare a consumer that has no backend (litespec/rule/core-scope.declare-a-consumer-that-has-no-backend)

**Requirement:** A consumer with no backend MUST omit `paths.apiSolution` and record a decision naming the areas and surfaces left without coverage.

**Rationale:** A frontend and its build-time content can satisfy the workspace, frontend, security, operations, and continuous integration conventions with no API, database, or persistence layer. Adding a backend to obtain conformance contradicts `litespec/rule/core-principles.require-current-complexity-activation`.

**Example:** `litespec/rule/quality-ci.run-applicable-gates-on-every-pull-request` already permits skipping a gate whose surface does not exist, so a missing backend gate is a recorded consequence rather than an unexplained absence.

### Record unsupported scope decisions (litespec/rule/core-scope.record-unsupported-scope-decisions)

**Requirement:** A consumer MUST record a separate profile or project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** These architectures change the supported profile's assumptions and require their own boundaries.

## Conventions

### Start with one API and database (litespec/rule/core-scope.start-with-one-api-and-database)

**Default:** Use one API deployable and one database.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A background job appears only when a process continues without an HTTP request.

### Measure capacity before expansion (litespec/rule/core-scope.measure-capacity-before-expansion)

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Measured evidence establishes which capacity change addresses the observed limitation.

## Reference example

This informative example demonstrates `litespec/rule/core-scope.select-a-size-profile-and-stacks` and `litespec/rule/core-scope.select-conditional-extensions-explicitly`.

A publishing product can support sign-in, draft creation, publication, and public reading. Multi-tenant publication, live editing, and bulk analytics require their selected extension boundaries.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/core-scope.select-a-size-profile-and-stacks | guidance | Which size did the project select, and which stack does each frontend declare? |
| litespec/rule/core-scope.keep-one-bounded-context | guidance | Which second language or deployment boundary does the design introduce? |
| litespec/rule/core-scope.select-conditional-extensions-explicitly | guidance | Which criterion justifies each selection, and which applicable extension stays unselected? |
| litespec/rule/core-scope.record-selected-extensions | checkable | `litespec consumer` rejects a selection without a criterion or review date. |
| litespec/rule/core-scope.answer-the-constraints-question | guidance | Where does the project state which outside constraints apply? |
| litespec/rule/core-scope.declare-a-consumer-that-has-no-backend | checkable | `litespec consumer` accepts a missing `paths.apiSolution` only with its recorded decision. |
| litespec/rule/core-scope.record-unsupported-scope-decisions | guidance | Which decision records each architecture outside the supported boundary? |
| litespec/rule/core-scope.start-with-one-api-and-database | guidance | Which second deployable or database does the topology add, and why? |
| litespec/rule/core-scope.measure-capacity-before-expansion | guidance | Which load, target, and observed constraint justify the added capacity? |
