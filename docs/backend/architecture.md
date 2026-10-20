# Backend Architecture

## Intent

The backend is a five-part modular monolith. Part boundaries separate business rules, the contracts every layer names, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a deployable unit.

CQRS separates write and read behavior inside one Application part. Modules and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}

- Five baseline parts form the modular monolith. (litespec/backend/architecture#use-five-application-parts)
- References point inward while each layer owns its contracts. (litespec/backend/architecture#point-dependencies-inward, litespec/backend/architecture#own-each-layers-contract-types)
- One Application part holds messages, handlers, and module-owned ports. (litespec/backend/architecture#keep-one-application-part)
- Module and aggregate order folders in every layer. (litespec/backend/architecture#organize-every-layer-by-module-and-use-case, litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers)
- Handlers, validators, and endpoint code stay hidden and closed. (litespec/backend/architecture#keep-implementation-types-hidden)
- Aggregates enforce transitions while commands write and queries project. (litespec/backend/architecture#keep-business-invariants-in-domain, litespec/backend/architecture#separate-command-and-query-behavior)
- A Decision names the execution host for background work. (litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request, litespec/backend/architecture#create-a-worker-project-when-background-work-needs-its-own-process)
- Architecture tests prove the structural boundaries. (litespec/backend/architecture#test-structural-boundaries)
- Each process composes itself without a second provider. (litespec/backend/architecture#compose-each-process-explicitly, litespec/backend/architecture#keep-service-registration-in-hosts)

## Standards

### Use five application parts

**Requirement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline parts.

**Rationale:** `Application.Abstractions` holds the contracts more than one module names: pipeline positions, cross-module ports, transport-neutral failures, and published integration events. It depends on Domain and nothing else. No type in it can name a use case, a handler, or a module.

That refusal is the reason it is a part rather than a folder. A folder inside Application cannot decline what a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation never belongs there. The part name states the test, and a type that cannot pass it belongs to a module under `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

Hosts support local hosting and diagnostics. They are hosts rather than application parts.

**Example:**

```text
Domain/
Application.Abstractions/
Application/
Infrastructure/
WebApi/
```

### Point dependencies inward

**Requirement:** A project reference MUST point inward, so Domain references no outer layer and WebApi composes the process.

**Rationale:** Application coordinates Domain, and Infrastructure implements the boundaries both declare. The reference matrix in [Dependencies](../workspace/dependencies.md) applies exactly.

### Own each layer's contract types

**Requirement:** A layer MUST define its own outward contracts rather than reuse an inner layer's type, except for Shared-kernel values and aggregate typed IDs.

**Rationale:** A change to an inner shape then stops rippling through every outer layer. Shared-kernel values cross because the kernel is shared, and aggregate typed IDs cross because messages name their targets.

### Keep one Application part

**Requirement:** An application MUST place commands, queries, results, validators, handlers, reactions, and module-owned ports in one Application part, and cross-module contracts in Application.Abstractions.

**Rationale:** Separate Write, Read, Contracts, and event-handler parts are outside this profile. The separation this profile keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html), which separates the command and query models rather than the parts holding them. Splitting parts buys a deployment boundary the profile does not use, and costs a dependency that every use case has to cross.

### Organize every layer by module and use case

**Requirement:** Every layer MUST use the same module names and order its folders as module, then aggregate, then layer detail.

**Rationale:** An aggregate stays flat only when its plural name equals the single module name. Module is an organization term, not a runtime base type, so no `IModule` or `ModuleRoot` contract exists.

Infrastructure holds module folders beside its provider-wide Persistence root, because provider plumbing serves every module and belongs to none.

A folder named for a technical grouping rather than a module defeats the rule, because the next unrelated type fits it. `Shared`, `Common`, `Util`, `Helpers`, `Core`, and `Misc` inside a layer are the names that do this.

**Example:**

```text
# single-aggregate module whose aggregate name matches the module: the aggregate stays flat in every layer
Domain/Posts/
Application/Posts/CreateDraft/
Infrastructure/Posts/
WebApi/Endpoints/Posts/CreateDraft/

# multi-aggregate module: module, then plural aggregate folder, then operation, mirrored in every layer
Domain/Customers/CustomerAccounts/
Domain/Customers/Consents/
Application/Customers/CustomerAccounts/RestrictAccount/
Application/Customers/Consents/GrantConsent/
Infrastructure/Customers/CustomerAccounts/
Infrastructure/Customers/Consents/
WebApi/Endpoints/Customers/CustomerAccounts/RestrictAccount/
WebApi/Endpoints/Customers/Consents/GrantConsent/

# Infrastructure keeps provider-wide plumbing under Persistence, beside the module folders
Infrastructure/Persistence/Postgres/
Infrastructure/Posts/
Infrastructure/Customers/CustomerAccounts/
```

The architecture test asserts the folder names directly, because a rule only a reviewer checks stops holding at the first missed file.

```text
fail when a type path contains Shared, Common, Util, Helpers, Core, or Misc
```

### Place a type at the lowest folder that holds its consumers

**Requirement:** A type MUST live at the lowest folder containing every consumer that names it.

**Rationale:** The lowest folder is the use-case folder when one use case names the type. It is the aggregate folder when several use cases of one aggregate name it. It is the module folder when several aggregates of one module name it. It is `Application.Abstractions` when more than one module names the type, or when two layers name it with no module between them. A type only Infrastructure names is an Infrastructure type.

Two kinds of type travel with something else rather than by their own consumer count. A type that exists only to shape one contract's input or output stays with that contract, and a closed enumerated set stays whole.

The rule is mechanical, so placement is counted rather than judged. The contracts project is what remains after the count rather than a destination anyone chooses. A folder named for the absence of a reason (`Shared`, `Common`, `Util`, `Helpers`, `Core`, `Misc`) can refuse nothing. Such a folder accumulates until a tenth of the layer sits outside the module tree, unreviewed, and named for no aggregate.

Domain's shared kernel is the one folder of that name a solution keeps. Its membership is closed by `litespec/backend/architecture#own-each-layers-contract-types` rather than open to whatever needs a home. A service that coordinates several aggregates lives in the module that owns the aggregates it reads and writes, not with whichever module calls it first.

### Keep implementation types hidden

**Requirement:** An application MUST keep each handler, validator, definition, persistence implementation, and endpoint implementation inside its own part and closed to extension.

**Rationale:** Messages, results, and ports stay public only when another part uses them. Automatic discovery is not a reason to widen visibility.

### Keep business invariants in Domain

**Requirement:** An aggregate or value object MUST be the only place that enforces a state transition or invariant.

**Rationale:** A rule duplicated in a handler drifts from the aggregate that owns it.

### Separate command and query behavior

**Requirement:** A command MUST mutate aggregates through repositories while a query projects read results without loading one.

**Rationale:** An enabled persistence extension may replace the read boundary for named aggregate paths. A command still never enforces an invariant from a read projection.

### Declare the execution host for work that outlives a request

**Requirement:** An application MUST declare the execution host that runs its durable dispatch, queue consumption, and scheduled work.

**Rationale:** The declared host is either the WebApi process or a Worker project. A rule that only restricts when a Worker project may exist never says where the work runs without one. A project can then host four background services inside WebApi, deviate from no rule it can name, and record no decision. Naming the host makes the choice visible whichever way it goes.

The declaration lives in a Decision record following `litespec/core/model#keep-one-owner-and-status-on-every-record`. Durable dispatch and queue consumption follow the outbox extension, and scheduled work follows the jobs extension.

The host is a composition decision, not a code-placement decision. The background service classes live in Infrastructure either way, because they hold provider and scheduling concerns. The host registers them.

**Example:** A Decision naming WebApi as the execution host states that durable dispatch shares the request process, and states what an unavailable process costs.

### Create a Worker project when background work needs its own process

**Requirement:** An application MUST create a Worker project when background work needs independent scaling, independent deployment, or isolation from request-path resource limits.

**Rationale:** A shared process couples the three. A restart to deploy an endpoint change interrupts a dispatch loop. Request load and dispatch load compete for one thread pool, and neither scales alone. A product with one deployable unit and modest background load accepts that coupling deliberately, which is why the choice is declared rather than assumed.

**Example:** An application with an outbox dispatching a few messages each minute can run it in WebApi. An application dispatching continuously, or one whose dispatch must survive an endpoint deployment, creates the Worker project.

### Test structural boundaries

**Requirement:** An application MUST prove project references, package boundaries, visibility, module folders, and aggregate inheritance with architecture tests.

**Rationale:** A structural rule that only a reviewer checks stops holding as soon as review misses one file.

### Compose each process explicitly

**Requirement:** A host MUST register its own transport services and call the Infrastructure entry point without building a second provider.

**Rationale:** WebApi and Worker are the only composition roots. Domain contains no registration code, and Application exposes contracts without resolving services.

## Conventions

### Keep service registration in hosts

**Default:** Keep service registration in host entry points and host registration modules.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

**Example:** One registration entry point per outer layer keeps the call order visible.

```text
infrastructure: register providers and options
webapi: register transport, authentication, and documentation
```

The Infrastructure entry point receives configuration and host environment values needed to bind and validate provider options. The WebApi entry point owns error details, authentication, authorization, endpoint discovery, and API documentation.

## Reference example

This informative example demonstrates `litespec/backend/architecture#point-dependencies-inward` and `litespec/backend/architecture#separate-command-and-query-behavior`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublishedEvent`.
4. Infrastructure stages and commits the document through the command pipeline.
5. An event reaction implementation handles the event through the delivery classification its reaction declares under `litespec/backend/application#keep-event-reaction-implementations-explicit`.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/architecture#use-five-application-parts | guidance | Does the solution hold exactly the five baseline parts? |
| litespec/backend/architecture#point-dependencies-inward | guidance | Does every project reference point toward Domain without an outward edge? |
| litespec/backend/architecture#own-each-layers-contract-types | guidance | Does each layer define its own contracts apart from kernel values and typed IDs? |
| litespec/backend/architecture#keep-one-application-part | guidance | Does one Application part hold every message, handler, and module-owned port? |
| litespec/backend/architecture#organize-every-layer-by-module-and-use-case | guidance | Does each layer folder path resolve to a declared module and aggregate? |
| litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers | guidance | Does each type sit at the lowest folder holding its consumers, with no banned folder name? |
| litespec/backend/architecture#keep-implementation-types-hidden | guidance | Is every handler, validator, definition, and endpoint implementation hidden and closed? |
| litespec/backend/architecture#keep-business-invariants-in-domain | guidance | Does every state transition run inside its aggregate or value object? |
| litespec/backend/architecture#separate-command-and-query-behavior | guidance | Do commands mutate through repositories while queries project without aggregates? |
| litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request | guidance | Which Decision names the execution host for dispatch, queue consumption, and scheduled work? |
| litespec/backend/architecture#create-a-worker-project-when-background-work-needs-its-own-process | guidance | Does background work needing its own process run in a Worker project? |
| litespec/backend/architecture#test-structural-boundaries | guidance | Do the architecture tests prove references, packages, visibility, folders, and inheritance? |
| litespec/backend/architecture#compose-each-process-explicitly | guidance | Does each host register its own services without building a second provider? |
| litespec/backend/architecture#keep-service-registration-in-hosts | guidance | Does all service registration live in hosts and host modules? |
