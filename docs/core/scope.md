# Supported Scope

## Intent

Every LiteSpec project starts by declaring the same 3 choices: its size, shape, and stacks. Size is small or large, shape is server or client-only, and a stack is the technology binding of one application. This page states what each choice decides, which extensions (conditional rule bundles selected only when their condition holds) and outside constraints the project also declares, and where the supported boundary ends. A team declares them once during inception, before writing anything else down, so agents and checks apply exactly the pages the project selected.

## Concepts

### The three project choices

Three choices in `litespec.project.json` decide everything the project must produce and every page that applies to it.

Size decides the record set and the test projects. A small project carries the core record types with Architecture and Integration test projects. A large project adds problems, features, journeys, and cases with the Acceptance project. A project with one web frontend and no journeys fits small; the running Expenses example, which needs journeys, selects large.

Shape decides the deployment boundary: `server` for a project with its own backend, `client-only` for one without. A server project names one backend stack. A client-only project names none, and records which backend surfaces stay uncovered.

Each stack decides which technology pages and checks apply. A project names one stack per frontend, choosing react, svelte, or blazor for each, and the stack applies its folder and every folder above it, as the [stacks page](stacks.md) states. A preset only fills in a common combination of these choices; the project record holds the result.

### Extensions, constraints, and the boundary

Capabilities a project needs only under a documented condition ship as extensions: caching, durable messaging, and multitenancy are examples. A project selects an extension only when its activation criterion holds, and the [extension catalog](../ext/README.md) lists each extension with its criteria. Outside rules work the same way: the project states in `litespec.project.json` whether any constraint applies, and an empty answer records that none does.

Some architectures fall outside what LiteSpec supports: microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, and large pipelines. A project that considers one records a separate project decision naming it. Projects outside the boundary can still use individual ideas, but they do not claim conformance.

## Standards

### Select a size, a shape and stacks

**Statement:** A consumer MUST select a size, a shape, one stack per frontend, and one backend stack unless the shape is client-only.

**Rationale:** One size and explicit stacks tell every check which records and pages apply. The size decides which record types the project carries and which test projects prove them; each stack decides which technology pages and checks apply. Without the declaration, each agent infers the architecture from the directory tree, and two agents infer two architectures.

**Example:** A project with one web frontend and no journeys selects small with the svelte stack; the running Expenses example, with journeys, selects large.

The running Expenses example declares large with a server shape and two stacks in `litespec.project.json`:

```json
{
  "size": "large",
  "shape": "server",
  "stacks": ["dotnet", "svelte"],
  "optionalTypes": ["constraint", "research", "limit", "runbook"]
}
```

The size selects the large record set, the shape selects a backend stack, and each stack selects its technology pages, which satisfies this provision.

The diagram shows the three project choices and what each decides.

![Three project choices and what each decides: size, small or large, decides the record types and the test projects, with large adding problems, features, journeys, and cases; shape, server or client-only, decides whether the project names a backend stack; stacks, one backend stack and one stack per frontend, decide the technology pages and the checks that apply.](../assets/diagrams/core-scope-selection.svg)

### Keep one bounded context

**Statement:** A consumer MUST keep one business language and deployment boundary.

**Rationale:** One business language and one deployment boundary keep every module, record, and use case in a single consistent model. Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts. A second language or boundary splits the project into systems that the records, links, and checks can no longer hold together.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select conditional extensions explicitly

**Statement:** A consumer MUST select every extension whose activation criteria apply, and no extension whose criteria do not.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition applies, so no project carries caching, messaging, or tenancy machinery it never justified. Selecting exactly the extensions whose criteria hold keeps the active rule set minimal and reviewable. The manifest's extension list is the closed set a project selects from, so there is no informal extension.

**Example:** Caching, durable messaging, and multitenancy are extensions; the extension index lists each with its activation criteria.

### Record selected extensions

**Statement:** A consumer MUST list every selected extension in `selectedExtensions` in `litespec.project.json`, each with its criterion and review date.

**Rationale:** The project record determines which extension boundaries apply to the project's work. Writing each selection with its criterion and review date lets a later reader check whether the condition still holds. Without the record, extensions drift in through dependencies and prose while the checks apply a different set.

**Example:**

```json
{ "id": "cache", "criterion": "expense reads miss the latency target", "reviewBy": "2027-01-15" }
```

### Answer the constraints question

**Statement:** A consumer MUST state in `litespec.project.json` whether any outside constraint applies to the project.

**Rationale:** An outside rule the project never names is a law the product can break unknowingly. Recording the answer, even when it is empty, proves the team asked the question: an empty answer states that no outside rule binds the project. A later reader can then tell a project with no constraints from one that never looked.

**Example:** A clinic booking system records that medical-device regulation does not apply to appointment scheduling.

### Declare a consumer that has no backend

**Statement:** A consumer with no server of its own MUST declare the `client-only` shape and record a decision naming the surfaces left without coverage.

**Rationale:** The shape decides which backend pages still apply. A `client-only` product keeps a domain model, so it applies the backend architecture, domain, application, and identifier pages that the manifest lists under `shapes`. Persistence, the HTTP API, and API testing have no target without a server, and the decision names those uncovered surfaces. Adding a server only to obtain conformance contradicts `litespec/core/principles#require-current-complexity-activation`, which permits new machinery only for a current documented requirement.

**Example:** `litespec/quality/ci#run-applicable-gates-on-every-pull-request` already permits skipping a gate whose surface does not exist, so a missing backend gate is a recorded consequence rather than an unexplained absence.

### Record unsupported scope decisions

**Statement:** A consumer MUST record a separate project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** Microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, and large pipelines each change the assumptions this page rests on: one language, one deployment, one API and database. A separate project decision records that the team saw the boundary and chose deliberately. Without it, the project drifts outside the supported scope while claiming its checks still apply.

## Conventions

### Start with one API and database

**Default:** Use one API deployable and one database.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** One API deployable and one database keep the first architecture reviewable and operable by a small team. Each additional deployable or store adds deployment, data-consistency, and operations work that a project rarely needs at the start. A background job appears only when a process continues without an HTTP request.

### Measure capacity before expansion

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Caches, replicas, queues, and partitioning each answer a different limitation, and only measurements show which one the project hit. Recording current load, the latency target, and the observed constraint before expanding proves the added capacity answers the observed limit. Expanding first and measuring later adds machinery that can hide the real bottleneck.

## Reference example

This informative example demonstrates `litespec/core/scope#select-a-size-a-shape-and-stacks` and `litespec/core/scope#select-conditional-extensions-explicitly`.

A publishing product supports sign-in, draft creation, publication, and public reading inside one bounded context. Multi-tenant publication, live editing, and bulk analytics each fall inside a selected extension boundary with its own activation criterion.

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
