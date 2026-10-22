# Backend Architecture

## Intent

The backend is a modular monolith of five parts: Domain holds business rules, Application coordinates use cases, Application.Abstractions holds the contracts that more than one module names, Infrastructure holds technical adapters, and WebApi hosts HTTP. A use case is one command, query, or reaction with its permissions, results, and scenarios. This page states those parts, the direction their references point, and how modules and use cases organize every layer; a team building the backend reads it before the layer pages, which state what each part owns.

## Concepts

### The Five Parts

A part is one of the five projects. The provisions say layer when they talk about what crosses a part boundary, and part when they talk about the project itself. The parts form one inward-pointing chain: each part references only parts closer to Domain.

| Part | Holds | References |
|:---|:---|:---|
| Domain | Business rules: aggregates, value objects, domain events, and domain repository contracts | Nothing |
| Application.Abstractions | Contracts more than one module names: pipeline positions, cross-module ports, transport-neutral refusals, and published integration events | Domain |
| Application | Use-case coordination: commands, queries, handlers, validators, and reactions | Application.Abstractions, Domain |
| Infrastructure | Technical adapters implementing the declared boundaries | Application, Application.Abstractions, Domain |
| WebApi | HTTP hosting and process composition | Infrastructure, Application, Application.Abstractions |

Part boundaries are not deployment boundaries: the parts deploy together as one modular monolith.

### Modules and Use Cases

A [module](../reference/glossary.md) is one business area organizing language, records, use cases, and ownership. A [use case](../reference/glossary.md) is one command, query, or reaction with its permissions, results, and scenarios. Every layer uses the same module names and orders its folders as module, then aggregate, then layer detail, so a reader moves from a Domain aggregate to its handler, its domain repository, and its endpoint without a map.

### Commands and Queries

CQRS separates the command and query models inside the one Application part: a command mutates aggregates through domain repositories, while a query projects read results without loading one. A reaction runs when its trigger fires rather than traveling the command pipeline. Publishing a post, for example, runs a `PublishPostCommand` through the handler and the domain repository, while reading a post runs a query that projects the stored data directly to its result.

## Standards

### Use Five Application Parts

**Statement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline parts.

**Rationale:** Five fixed parts give every type one home a reader can predict. `Application.Abstractions` holds the contracts that more than one module names: pipeline positions, cross-module ports, transport-neutral refusals, and published integration events. It depends on Domain and nothing else, and no type in it names a use case, a handler, or a module.

That strict membership is the reason it is a part rather than a folder. A folder inside Application accepts whatever a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation belongs in a module, not there. The part name states the test, and a type that fails it belongs to a module under `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

Hosts support local hosting and diagnostics. They are hosts rather than application parts.

**Example:**

```text
Domain/
Application.Abstractions/
Application/
Infrastructure/
WebApi/
```

### Point Dependencies Inward

**Statement:** A project reference MUST point inward, so Domain references no outer layer and WebApi composes the process.

**Rationale:** Inner code names no outer code, so business rules compile and test without adapters or hosting. An outward reference would drag technical concerns into Domain or coordination into Infrastructure. Application coordinates Domain, Infrastructure implements the boundaries both declare, and the reference matrix in [Dependencies](../workspace/dependencies.md) applies exactly.

**Example:** Every reference points from an outer project to an inner one, and Domain references none of the others.

![The five application projects and their references: WebApi references Infrastructure, Application, and Application.Abstractions; Infrastructure references Application, Application.Abstractions, and Domain; Application references Application.Abstractions and Domain; Application.Abstractions references Domain; Domain references nothing.](../assets/diagrams/backend-dependencies.svg)

### Own Each Layer's Contract Types

**Statement:** A layer MUST define its own outward contracts rather than reuse an inner layer's type, except for shared-kernel values and aggregate typed identifiers.

**Rationale:** When each layer defines its own outward contracts, a change to an inner shape stops at the boundary instead of rippling through every outer layer. Shared-kernel values cross because the kernel is shared by definition, and aggregate typed identifiers cross because messages need to name their targets.

### Keep One Application Part

**Statement:** An application MUST place commands, queries, results, validators, handlers, reactions, and module-owned ports in one Application part, and cross-module contracts in Application.Abstractions.

**Rationale:** Commands, queries, and reactions coordinate the same use cases, so splitting them into Write, Read, Contracts, and Event-handler parts buys unused deployment boundaries at the cost of a dependency every use case crosses. The separation this backend keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html): separate command and query models inside one Application part, with cross-module contracts in Application.Abstractions.

### Organize Every Layer by Module and Use Case

**Statement:** Every layer MUST use the same module names and order its folders as module, then aggregate, then layer detail.

**Rationale:** The same module names in every layer let a reader move from a Domain aggregate to its handler, its repository, and its endpoint without a map. An aggregate stays flat only when its plural name equals the single module name. Module is an organization term, not a runtime contract, so no module base type or marker contract exists.

Infrastructure holds module folders beside its provider-wide Persistence root, because provider plumbing serves every module and belongs to none.

A folder named for a technical grouping rather than a module defeats the rule, because the next unrelated type fits it. `Shared`, `Common`, `Util`, `Helpers`, `Core`, and `Misc` inside a layer are the names that do this.

**Example:**

```text
# single-aggregate module whose aggregate name matches the module: the aggregate stays flat in every layer
Domain/Posts/
Application/Posts/CreateDraft/
Infrastructure/Posts/
WebApi/Endpoints/Posts/CreateDraft/

# multi-aggregate module: module, then plural aggregate folder, then use case, mirrored in every layer
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

### Place a Type at the Lowest Folder That Holds Its Consumers

**Statement:** A type MUST live at the lowest folder containing every consumer that names it.

**Rationale:** Counting consumers gives each type exactly one folder, so placement needs no judgment call. The lowest folder is the use-case folder when one use case names the type, the aggregate folder when several use cases of one aggregate name it, the module folder when several aggregates of one module name it, and `Application.Abstractions` when more than one module names the type, or when two layers name it with no module between them. A type only Infrastructure names is an Infrastructure type.

Two kinds of type travel with something else rather than by their own consumer count. A type that exists only to shape one contract's input or output stays with that contract, and a closed enumerated set stays whole.

The rule is mechanical, so placement is counted rather than judged. The contracts project is what remains after the count rather than a destination anyone chooses. A folder named for the absence of a reason (`Shared`, `Common`, `Util`, `Helpers`, `Core`, `Misc`) can refuse nothing. Such a folder accumulates until a tenth of the layer sits outside the module tree, unreviewed, and named for no aggregate.

Domain's shared kernel is the one folder of that name a solution keeps. Its membership is closed by `litespec/backend/architecture#own-each-layers-contract-types` rather than open to whatever needs a home. A service that coordinates several aggregates lives in the module that owns the aggregates it reads and writes, not with whichever module calls it first.

### Keep Implementation Types Hidden

**Statement:** An application MUST keep each handler, validator, definition, persistence implementation, and endpoint implementation inside its own part and closed to extension.

**Rationale:** Hidden implementations keep each part's surface to the contracts other parts actually use. A public handler invites direct construction that bypasses the pipeline, and an inheritable one invites overrides that split behavior across subclasses. Messages, results, and ports stay public only when another part uses them, and automatic discovery is not a reason to widen visibility.

### Keep Business Invariants in Domain

**Statement:** An aggregate or value object MUST be the only place that enforces a state transition or invariant.

**Rationale:** The aggregate or value object that owns data is the only code that sees every change to it. A rule duplicated in a handler drifts from the aggregate that owns it, and then the same action is allowed through one path and refused through another.

### Separate Command and Query Behavior

**Statement:** A command MUST mutate aggregates through domain repositories while a query projects read results without loading one.

**Rationale:** Reads that load aggregates pay for invariant enforcement no read needs, and writes that read from projections enforce rules against stale shapes. Commands mutate aggregates through domain repositories while queries project read results without loading one. An enabled persistence extension may replace the read boundary for named aggregate paths, but a command still enforces no invariant from a read projection.

### Declare the Execution Host for Work That Outlives a Request

**Statement:** An application MUST declare the execution host that runs its durable dispatch, queue consumption, and scheduled work.

**Rationale:** The declared host is either the WebApi process or a Worker project. A rule that only restricts when a Worker exists leaves unsaid where the work runs without one, so a project can host background services inside WebApi while deviating from no named rule and recording no decision. Naming the host makes the choice visible whichever way it goes.

The declaration lives in a Decision record following `litespec/core/model#keep-one-owner-and-status-on-every-record`. Durable dispatch and queue consumption follow the outbox extension, and scheduled work follows the jobs extension.

The host is a composition decision, not a code-placement decision. The background service classes live in Infrastructure either way, because they hold provider and scheduling concerns. The host registers them.

**Example:** A Decision naming WebApi as the execution host states that durable dispatch shares the request process, and states what an unavailable process costs.

### Create a Worker Project When Background Work Needs Its Own Process

**Statement:** An application MUST create a Worker project when background work needs independent scaling, independent deployment, or isolation from request-path resource limits.

**Rationale:** A shared process couples scaling, deployment, and resource limits: a restart to deploy an endpoint change interrupts a dispatch loop, and request load and dispatch load compete for one thread pool where neither scales alone. When background work needs independent scaling, deployment, or isolation, it gets its own process. A product with one deployable unit and modest background load accepts that coupling deliberately, which is why the choice is declared rather than assumed.

**Example:** An application with an outbox dispatching a few messages each minute can run it in WebApi. An application dispatching continuously, or one whose dispatch needs to survive an endpoint deployment, creates the Worker project.

### Test Structural Boundaries

**Statement:** An application MUST prove project references, package boundaries, visibility, module folders, and aggregate inheritance with architecture tests.

**Rationale:** Project references, package boundaries, visibility, module folders, and aggregate inheritance are invisible at runtime: the application runs the same with or without them. A structural rule that only a reviewer checks stops holding as soon as review misses one file, so architecture tests prove each one on every run.

### Compose Each Process Explicitly

**Statement:** A host MUST register its own transport services and call the Infrastructure entry point without building a second provider.

**Rationale:** Each host registers its own services and calls the shared Infrastructure entry point, so the full composition of a process is visible in one place. A second provider built mid-registration would resolve a different object graph than the host runs. WebApi and Worker are the only composition roots: Domain contains no registration code, and Application exposes contracts without resolving services.

## Conventions

### Keep Service Registration in Hosts

**Default:** Keep service registration in host entry points and host registration modules.

**Replacement:** A project names its own registration home in its documentation.

**Rationale:** Registration lives where the process is composed, so hosts and their registration modules hold every registration call. Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

**Example:** One registration entry point per outer layer keeps the call order visible.

```text
infrastructure: register providers and options
webapi: register transport, authentication, and documentation
```

The Infrastructure entry point receives configuration and host environment values needed to bind and validate provider options. The WebApi entry point owns error details, authentication, authorization, endpoint discovery, and API documentation.

## Reference Example

This informative example demonstrates `litespec/backend/architecture#point-dependencies-inward` and `litespec/backend/architecture#separate-command-and-query-behavior`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads the post through its domain repository.
3. Domain publishing enforces publication rules and raises the post-published event.
4. Infrastructure stages and commits the post through the command pipeline.
5. An event reaction implementation handles the event through the delivery classification its reaction declares under `litespec/backend/application#keep-event-reaction-implementations-explicit`.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/architecture#use-five-application-parts | guidance | The solution file lists Domain, Application.Abstractions, Application, Infrastructure, and WebApi as the application parts, with no sixth part. |
| litespec/backend/architecture#point-dependencies-inward | guidance | The project reference graph in the solution shows every reference pointing toward Domain, with Domain referencing nothing. |
| litespec/backend/architecture#own-each-layers-contract-types | guidance | The outward contracts in each layer's folders are declared in that layer, apart from shared-kernel values and aggregate typed identifiers. |
| litespec/backend/architecture#keep-one-application-part | guidance | The Application part holds every message, handler, and module-owned port, and the shared contracts part holds the cross-module contracts. |
| litespec/backend/architecture#organize-every-layer-by-module-and-use-case | guidance | Each layer folder path resolves to a declared module and aggregate, with no technical-grouping folder name. |
| litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers | guidance | Each type sits in the lowest folder holding every consumer that names it, with no Shared, Common, Util, Helpers, Core, or Misc folder. |
| litespec/backend/architecture#keep-implementation-types-hidden | guidance | Handlers, validators, definitions, persistence implementations, and endpoint implementations in the solution stay inside their own part and closed to extension. |
| litespec/backend/architecture#keep-business-invariants-in-domain | guidance | State transitions and invariants in the codebase run inside their aggregate or value object, with no copy in a handler. |
| litespec/backend/architecture#separate-command-and-query-behavior | guidance | Commands in Application mutate through domain repositories while queries project without loading an aggregate. |
| litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request | guidance | A decision record under `docs/product/decisions/` names the execution host for durable dispatch, queue consumption, and scheduled work. |
| litespec/backend/architecture#create-a-worker-project-when-background-work-needs-its-own-process | guidance | The execution-host decision and the solution project list show background work needing its own process running in a Worker project. |
| litespec/backend/architecture#test-structural-boundaries | guidance | The architecture tests in the test projects cover project references, package boundaries, visibility, module folders, and aggregate inheritance, and the latest test run passes. |
| litespec/backend/architecture#compose-each-process-explicitly | guidance | Each host entry point registers its own transport services and calls the Infrastructure entry point once. |
| litespec/backend/architecture#keep-service-registration-in-hosts | guidance | Service registration calls sit in host entry points and host registration modules. |
