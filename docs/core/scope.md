# Supported Scope

## Intent

Every project selects one size, one shape, and its stacks, so agents can make concrete decisions without inventing architecture for every task. A stack applies the pages in its own folder and in every folder above it; a preset only fills in a common selection.

Projects outside this boundary can use individual ideas but do not claim conformance.

## Standards

### Select a size, a shape and stacks

**Requirement:** A consumer MUST select a size, a shape, one stack per frontend, and one backend stack unless the shape is client-only.

**Rationale:** One size and explicit stacks tell every check which records and pages apply. The size decides which record types and test projects the project needs; each stack decides which technology pages and checks apply. Small needs the core types with Architecture and Integration test projects, while large adds problems, features, journeys, and cases with the Acceptance project. Each frontend declares react, svelte, or blazor.

**Example:** A library catalog with one web frontend selects small with the svelte stack; a clinic booking system with journeys selects large.

The running library example declares large with a server shape and two stacks in `litespec.project.json`:

```json
{
  "size": "large",
  "shape": "server",
  "stacks": ["dotnet", "svelte"],
  "optionalTypes": ["constraint", "research", "limit", "runbook"]
}
```

The size switches on the large record rows, the shape names a backend stack, and each stack switches on its technology pages, which satisfies this provision.

The three project choices and what each decides: size, shape, and stacks.

![Three project choices and what each decides: size, small or large, decides the record types and the test projects, with large adding problems, features, journeys, and cases; shape, server or client-only, decides whether the project names a backend stack; stacks, one backend stack and one stack per frontend, decide the technology pages and the checks that apply.](../assets/diagrams/core-scope-selection.svg)

### Keep one bounded context

**Requirement:** A consumer MUST keep one business language and deployment boundary.

**Rationale:** Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select conditional extensions explicitly

**Requirement:** A consumer MUST select every extension whose activation criteria apply, and no extension whose criteria do not.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition applies. The manifest's extension list is the closed set a project selects from.

**Example:** Caching, durable messaging, and multitenancy are extensions; the extension index lists each with its activation criteria.

### Record selected extensions

**Requirement:** A consumer MUST list every selected extension in `selectedExtensions` in `litespec.project.json`, each with its criterion and review date.

**Rationale:** The project record determines which extension boundaries apply to its work.

**Example:**

```json
{ "id": "cache", "criterion": "catalog reads miss the latency target", "reviewBy": "2027-01-15" }
```

### Answer the constraints question

**Requirement:** A consumer MUST state in `litespec.project.json` whether any outside constraint applies to the project.

**Rationale:** An empty answer is a stated answer: it records that no outside rule binds the project.

**Example:** A clinic booking system records that medical-device regulation does not apply to appointment scheduling.

### Declare a consumer that has no backend

**Requirement:** A consumer with no server of its own MUST declare the `client-only` shape and record a decision naming the surfaces left without coverage.

**Rationale:** The shape decides which backend pages still apply. A `client-only` product keeps a domain model, so it applies the backend architecture, domain, application, and identifier pages, which the manifest lists under `shapes`. Persistence, the HTTP API, and API testing have no target. Adding a server to obtain conformance contradicts `litespec/core/principles#require-current-complexity-activation`.

**Example:** `litespec/quality/ci#run-applicable-gates-on-every-pull-request` already permits skipping a gate whose surface does not exist, so a missing backend gate is a recorded consequence rather than an unexplained absence.

### Record unsupported scope decisions

**Requirement:** A consumer MUST record a separate project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** These architectures change the supported scope's assumptions and need their own boundaries.

## Conventions

### Start with one API and database

**Default:** Use one API deployable and one database.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A background job appears only when a process continues without an HTTP request.

### Measure capacity before expansion

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Measured evidence establishes which capacity change addresses the observed limitation.

## Reference example

This informative example demonstrates `litespec/core/scope#select-a-size-a-shape-and-stacks` and `litespec/core/scope#select-conditional-extensions-explicitly`.

A publishing product can support sign-in, draft creation, publication, and public reading. Multi-tenant publication, live editing, and bulk analytics fall within their selected extension boundaries.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/scope#select-a-size-a-shape-and-stacks | checkable | `litespec consumer` refuses a shape whose backend stack count is wrong and a platform that names no frontend stack. |
| litespec/core/scope#keep-one-bounded-context | guidance | Which second language or deployment boundary does the design introduce? |
| litespec/core/scope#select-conditional-extensions-explicitly | guidance | Which criterion justifies each selection, and which applicable extension stays unselected? |
| litespec/core/scope#record-selected-extensions | checkable | `litespec consumer` rejects a selection without a criterion or review date. |
| litespec/core/scope#answer-the-constraints-question | guidance | Where does the project state which outside constraints apply? |
| litespec/core/scope#declare-a-consumer-that-has-no-backend | checkable | `litespec consumer` refuses a `client-only` project that names a backend stack. |
| litespec/core/scope#record-unsupported-scope-decisions | guidance | Which decision records each architecture outside the supported boundary? |
| litespec/core/scope#start-with-one-api-and-database | guidance | Which second deployable or database does the topology add, and why? |
| litespec/core/scope#measure-capacity-before-expansion | guidance | Which load, target, and observed constraint justify the added capacity? |
