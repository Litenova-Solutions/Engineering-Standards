# Supported Scope

## Intent

Every LiteSpec project starts by declaring the same three choices: its size, shape, and stacks. This page states what each choice decides, which extensions and outside constraints the project also declares, what claiming conformance means, and where the supported boundary ends. A team declares them once during inception, before writing anything else down, so agents and checks apply exactly the pages the project selected.

## Concepts

### The Three Project Choices

Three choices in `litespec.project.json` decide everything the project must produce and every page that applies to it.

Size decides the record set and the test projects. A small project carries the core record types with Architecture and Integration test projects. A large project adds goals, problems, features, journeys, and scenarios with the Acceptance project. A project with one web frontend and no journeys fits small; the running Claimwick example, which needs journeys, selects large.

Shape decides the deployment boundary: `server` for a project with its own backend, `client-only` for one without. A server project names one backend stack. A client-only project names none, and records which backend surfaces stay uncovered.

Each stack decides which technology pages and checks apply. A project names one stack per frontend, choosing react, svelte, or blazor for each, and the stack applies its folder and every folder above it, as the [stacks page](stacks.md) states. A preset only fills in a common combination of these choices; the project record holds the result.

### Extensions, Constraints, and the Boundary

An extension is a conditional standards bundle that stays inactive until a documented condition holds. The Behavior extensions are `privacy`, `devices`, `automation`, `workflow-engine`, `pipeline`, `queues`, and `ai`, beside the existing `tenancy`, `compat`, `jobs`, `outbox`, `audit`, and `stage` extensions. A project selects an extension only when its activation criterion holds, and the [extension catalog](../ext/README.md) lists each extension with its criteria. Outside constraints work the same way: the project states in `litespec.project.json` whether any constraint applies, and an empty answer records that none does.

Some architectures fall outside what LiteSpec supports: microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, and large pipelines. A project that considers one records a separate project decision naming it. Projects outside the boundary can still use individual ideas without claiming conformance.

### Review and Adoption Settings

The project record carries its review settings under `review`: the veto window in days and the name of the security reviewer. Tier-3 questions with a recommendation auto-approve after the veto window, while tier-1 questions wait for explicit approval. A project that transcribes Behavior from working code names the ending decision under `adoption`, and points `paths.behaviorDocs` at the folder holding its Behavior records.

### What Claiming Conformance Means

A consumer claims conformance when it applies every page its size, shape, and stacks select, selects every extension whose criteria hold, records each deviation against the provision it departs from with its reason and review date, and passes the checks its changed boundaries select. A project outside the supported boundary, or one that skips an applicable page or check, makes no conformance claim.

## Standards

### Select a Size, a Shape and Stacks

**Statement:** A consumer MUST select a size, a shape, one stack per frontend, and one backend stack unless the shape is client-only.

**Rationale:** One size and explicit stacks tell every check which records and pages apply. The size decides which record types the project carries and which test projects prove them; each stack decides which technology pages and checks apply. Without the declaration, each agent infers the architecture from the directory tree, and two agents infer two architectures.

**Example:** A project with one web frontend and no journeys selects small with the svelte stack; the running Claimwick example, with journeys, selects large.

The running Claimwick example declares large with a server shape and two stacks in `litespec.project.json`:

```json
{
  "size": "large",
  "shape": "server",
  "stacks": ["dotnet", "svelte"],
  "optionalTypes": ["constraint", "research", "setting", "runbook"]
}
```

The size selects the large record set, the shape selects a backend stack, and each stack selects its technology pages, which satisfies this provision.

The diagram shows the three project choices and what each decides.

![Three project choices and what each decides: size, small or large, decides the record types and the test projects, with large adding goals, problems, features, journeys, and scenarios; shape, server or client-only, decides whether the project names a backend stack; stacks, one backend stack and one stack per frontend, decide the technology pages and the checks that apply.](../assets/diagrams/core-scope-selection.svg)

### Keep One Bounded Context

**Statement:** A consumer MUST keep one business language and deployment boundary.

**Rationale:** One business language and one deployment boundary keep every module, record, and use case in a single consistent model. Modules organize related language, models, use cases, and code without becoming independent services or bounded contexts. A second language or boundary splits the project into systems that the records, links, and checks can no longer hold together.

**Example:** Posts, Authors, and Comments can be modules in one publishing context.

### Select Conditional Extensions Explicitly

**Statement:** A consumer MUST select every extension whose activation criteria apply, and no extension whose criteria do not.

**Rationale:** Conditional capabilities stay inactive until a documented product or engineering condition applies, so no project carries caching, messaging, or tenancy machinery it never justified. Selecting exactly the extensions whose criteria hold keeps the active rule set minimal and reviewable. The manifest's extension list is the closed set a project selects from, so there is no informal extension.

**Example:** Caching, durable messaging, and multitenancy are extensions; the extension index lists each with its activation criteria.

### Record Selected Extensions

**Statement:** A consumer MUST list every selected extension in `selectedExtensions` in `litespec.project.json`, each with its criterion and review date.

**Rationale:** The project record determines which extension boundaries apply to the project's work. Writing each selection with its criterion and review date lets a later reader check whether the condition still holds. Without the record, extensions drift in through dependencies and prose while the checks apply a different set.

**Example:**

```json
{ "id": "cache", "criterion": "expense reads miss the latency target", "reviewBy": "2027-01-15" }
```

### Answer the Constraints Question

**Statement:** A consumer MUST state in `litespec.project.json` whether any outside constraint applies to the project.

**Rationale:** An outside rule the project never names is a law the product can break unknowingly. Recording the answer, even when it is empty, proves the team asked the question: an empty answer states that no outside rule binds the project. A later reader can then tell a project with no constraints from one that never looked.

**Example:** A clinic booking system records that medical-device regulation does not apply to appointment scheduling.

### Declare a Consumer That Has No Backend

**Statement:** A consumer with no server of its own MUST declare the `client-only` shape and record a decision naming the surfaces left without coverage.

**Rationale:** The shape decides which backend pages still apply. A `client-only` product keeps a domain model, so it applies the backend architecture, domain, application, and identifier pages that the manifest lists under `shapes`. Persistence, the HTTP API, and API testing have no target without a server, and the decision names those uncovered surfaces. Adding a server only to obtain conformance contradicts `litespec/core/principles#require-current-complexity-activation`, which permits new machinery only for a current documented requirement.

**Example:** `litespec/quality/ci#run-applicable-gates-on-every-pull-request` already permits skipping a gate whose surface does not exist, so a missing backend gate is a recorded consequence rather than an unexplained absence.

### Record Unsupported Scope Decisions

**Statement:** A consumer MUST record a separate project decision for microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, or large pipelines.

**Rationale:** Microservices, multiple contexts, native clients, other platforms, event sourcing, active-active regions, and large pipelines each change the assumptions this page rests on: one language, one deployment, one API and database. A separate project decision records that the team saw the boundary and chose deliberately. Without it, the project drifts outside the supported scope while claiming its checks still apply.

### Claim Conformance Only When Every Applicable Provision Holds

**Statement:** A consumer MUST meet every applicable provision before claiming conformance to LiteSpec.

**Rationale:** A conformance claim tells a reader that the whole selected contract holds, not only the parts the project chose to follow. A recorded deviation whose review date has not passed outranks the provision it cites, so a project that records its deviations still meets this provision; an unrecorded departure breaks the claim.

**Example:** A consumer that selects the dotnet stack and the caching extension claims conformance when every page those selections apply holds and their checks pass, with each departure recorded as a deviation.

### Record the Review Configuration

**Statement:** A consumer MUST record `review.vetoWindowDays` and `review.securityReviewer` in `litespec.project.json`.

**Rationale:** The veto window sets how long a tier-3 question waits before auto-approval, with seven days as the default, so every recommendation carries its own deadline. The security reviewer clears access widenings, new outside calls, and new personal-data flows apart from ordinary review. Recording both names the people and the pace before any ballot opens.

**Example:**

```json
{ "review": { "vetoWindowDays": 7, "securityReviewer": "__OWNER__" } }
```

### Record the Transcription Endpoint

**Statement:** A consumer that transcribes Behavior from code MUST record `adoption.transcriptionEndsWith` in `litespec.project.json`.

**Rationale:** Transcription mode ends when one named decision is approved, so every transcribed record has a date by which it gains an approved Intent parent or fails. Without the named endpoint, transcribed drafts linger beside reviewed records with nobody able to tell the mode is over.

**Example:**

```json
{ "adoption": { "transcriptionEndsWith": "decision/end-transcription" } }
```

### Point Behavior Docs at the Behavior Root

**Statement:** A consumer MUST set `paths.behaviorDocs` in `litespec.project.json` to the folder that holds its Behavior records.

**Rationale:** The builder joins records, queries, diffs, and the book from one declared root. A Behavior tree the project record never names is one the tools never see, so its records skip every check. One declared folder keeps authors and tools on the same tree.

**Example:**

```json
{ "paths": { "behaviorDocs": "docs/behavior" } }
```

## Conventions

### Start with One API and Database

**Default:** Use one API deployable and one database.

**Replacement:** A consumer records a topology convention naming the deployables and stores it runs instead.

**Rationale:** One API deployable and one database keep the first architecture reviewable and operable by a small team. Each additional deployable or store adds deployment, data-consistency, and operations work that a project rarely needs at the start. A background job appears only when a process continues without an HTTP request.

### Measure Capacity Before Expansion

**Default:** Record current load, latency target, and observed constraint before adding caches, replicas, queues, or partitioning.

**Replacement:** A consumer records a capacity convention naming what justifies expansion without measurements.

**Rationale:** Caches, replicas, queues, and partitioning each answer a different limitation, and only measurements show which one the project hit. Recording current load, the latency target, and the observed constraint before expanding proves the added capacity answers the observed limit. Expanding first and measuring later adds machinery that can hide the real bottleneck.

## Reference Example

This informative example demonstrates `litespec/core/scope#select-a-size-a-shape-and-stacks` and `litespec/core/scope#select-conditional-extensions-explicitly`.

A publishing product supports sign-in, draft creation, publication, and public reading inside one bounded context. Multi-tenant publication, live editing, and bulk analytics each fall inside a selected extension boundary with its own activation criterion.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/scope#select-a-size-a-shape-and-stacks | checkable | `litespec consumer` refuses a shape whose backend stack count is wrong and a platform that names no frontend stack. |
| litespec/core/scope#keep-one-bounded-context | guidance | Module pages and `litespec.project.json` name one business language and one deployment boundary, with no second of either. |
| litespec/core/scope#select-conditional-extensions-explicitly | guidance | Each entry in `selectedExtensions` carries a criterion that holds, and no applicable extension from the extension catalog stays unselected. |
| litespec/core/scope#record-selected-extensions | checkable | `litespec consumer` rejects a selection without a criterion or review date. |
| litespec/core/scope#answer-the-constraints-question | guidance | `litespec.project.json` states which outside constraints apply, or records an empty answer. |
| litespec/core/scope#declare-a-consumer-that-has-no-backend | checkable | `litespec consumer` refuses a `client-only` project that names a backend stack. |
| litespec/core/scope#record-unsupported-scope-decisions | guidance | A project decision names each architecture outside the supported boundary the project adopts. |
| litespec/core/scope#claim-conformance-only-when-every-applicable-provision-holds | guidance | `litespec.project.json` names the selected size, shape, stacks, and extensions; each departure from an applied page resolves to a deviation record under `docs/governance/deviations/`, and the selected checks pass. |
| litespec/core/scope#record-the-review-configuration | checkable | `litespec consumer` rejects a project record without `review.vetoWindowDays` or `review.securityReviewer`. |
| litespec/core/scope#record-the-transcription-endpoint | checkable | `litespec consumer` rejects a transcribed record in a project without `adoption.transcriptionEndsWith`. |
| litespec/core/scope#point-behavior-docs-at-the-behavior-root | checkable | `litespec consumer` rejects a project record without `paths.behaviorDocs`. |
| litespec/core/scope#start-with-one-api-and-database | guidance | The topology holds one API deployable and one database, or a topology convention records what runs instead. |
| litespec/core/scope#measure-capacity-before-expansion | guidance | Each added cache, replica, queue, or partition follows recorded load, latency target, and observed constraint, or a capacity convention. |
