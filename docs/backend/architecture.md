# Backend Architecture

## Intent

The backend is a five-project modular monolith. Project boundaries separate business rules, the contracts every layer names, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a separate assembly.

CQRS separates write and read behavior inside one Application project. Modules and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}

- Five baseline projects form the modular monolith. (standards/rule/backend-architecture.use-five-application-projects)
- References point inward while each layer owns its contracts. (standards/rule/backend-architecture.point-dependencies-inward, standards/rule/backend-architecture.own-each-layers-contract-types)
- One Application project holds messages, handlers, and module-owned ports. (standards/rule/backend-architecture.keep-one-application-assembly)
- Module and aggregate order folders in every layer. (standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case, standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers)
- Handlers, validators, and endpoint code stay internal and sealed. (standards/rule/backend-architecture.keep-implementation-types-internal)
- Aggregates enforce transitions while commands write and queries project. (standards/rule/backend-architecture.keep-business-invariants-in-domain, standards/rule/backend-architecture.separate-command-and-query-behavior)
- A Decision names the execution host for background work. (standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request, standards/rule/backend-architecture.create-a-worker-project-when-background-work-needs-its-own-process)
- Architecture tests prove the structural boundaries. (standards/rule/backend-architecture.test-structural-boundaries)
- Each process composes itself without a second provider. (standards/rule/backend-architecture.compose-each-process-explicitly, standards/rule/backend-architecture.keep-composition-in-hosts)
- Scanned projects expose one public assembly marker. (standards/rule/backend-architecture.use-one-public-assembly-marker-per-scanned-project)

## Standards

### Use five application projects (standards/rule/backend-architecture.use-five-application-projects)

**Requirement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline projects.

**Rationale:** `Application.Abstractions` holds the contracts more than one module names: the pipeline's own positions, the cross-module ports, the transport-neutral failures, and the published integration events. It references Domain and the required LiteBus module abstractions, and nothing else. No type in it can name a use case, a handler, or a module.

That refusal is the reason it is a project rather than a folder. A folder inside Application cannot decline what a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation never belongs there. The project name states the test, and a type that cannot pass it belongs to a module under `standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

**Example:**

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application.Abstractions/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

### Point dependencies inward (standards/rule/backend-architecture.point-dependencies-inward)

**Requirement:** A project reference MUST point inward, so Domain references no outer layer and WebApi composes the process.

**Rationale:** Application coordinates Domain, and Infrastructure implements the boundaries both declare. The reference matrix in [Dependencies](../workspace/dependencies.md) applies exactly.

### Own each layer's contract types (standards/rule/backend-architecture.own-each-layers-contract-types)

**Requirement:** A layer MUST define its own outward contracts rather than reuse an inner layer's type, except for Shared-kernel values and aggregate typed IDs.

**Rationale:** A change to an inner shape then stops rippling through every outer layer. Shared-kernel values cross because the kernel is shared, and aggregate typed IDs cross because messages name their targets.

### Keep one Application assembly (standards/rule/backend-architecture.keep-one-application-assembly)

**Requirement:** An application MUST place commands, queries, results, validators, handlers, reactions, and module-owned ports in one Application project, and cross-module contracts in Application.Abstractions.

**Rationale:** Separate Write, Read, Contracts, and event-handler assemblies are outside this profile. The separation this profile keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html), which separates the command and query models rather than the assemblies holding them. Splitting assemblies buys a deployment boundary the profile does not use, and costs a project reference that every use case has to cross.

### Organize every layer by module and use case (standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case)

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
Infrastructure/Persistence/Marten/
Infrastructure/Posts/
Infrastructure/Customers/CustomerAccounts/
```

The architecture test asserts the folder names directly, because a rule only a reviewer checks stops holding at the first missed file.

```csharp
Types.InAssembly(ApplicationAssemblyMarker.Assembly)
    .Should()
    .NotResideInNamespaceContaining("Shared")
    .And().NotResideInNamespaceContaining("Common")
    .And().NotResideInNamespaceContaining("Util")
    .And().NotResideInNamespaceContaining("Helpers")
    .And().NotResideInNamespaceContaining("Core")
    .And().NotResideInNamespaceContaining("Misc")
    .GetResult()
    .IsSuccessful.Should().BeTrue();
```

### Place a type at the lowest folder that holds its consumers (standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers)

**Requirement:** A type MUST live at the lowest folder containing every consumer that names it.

**Rationale:** The lowest folder is the use-case folder when one use case names the type. It is the aggregate folder when several use cases of one aggregate name it. It is the module folder when several aggregates of one module name it. It is `Application.Abstractions` when more than one module names the type, or when two layers name it with no module between them. A type only Infrastructure names is an Infrastructure type.

Two kinds of type travel with something else rather than by their own consumer count. A type that exists only to shape one contract's input or output stays with that contract, and a closed enumerated set stays whole.

The rule is mechanical, so placement is counted rather than judged. The contracts project is what remains after the count rather than a destination anyone chooses. A folder named for the absence of a reason (`Shared`, `Common`, `Util`, `Helpers`, `Core`, `Misc`) can refuse nothing. Such a folder accumulates until a tenth of the layer sits outside the module tree, unreviewed, and named for no aggregate.

Domain's shared kernel is the one folder of that name a solution keeps. Its membership is closed by `standards/rule/backend-architecture.own-each-layers-contract-types` rather than open to whatever needs a home. A service that coordinates several aggregates lives in the module that owns the aggregates it reads and writes, not with whichever module calls it first.

### Keep implementation types internal (standards/rule/backend-architecture.keep-implementation-types-internal)

**Requirement:** A handler, validator, definition, persistence implementation, or endpoint implementation MUST be declared `internal sealed`.

**Rationale:** Messages, results, assembly markers, and ports stay public only when another project uses them. Assembly scanning is not a reason to widen visibility.

### Keep business invariants in Domain (standards/rule/backend-architecture.keep-business-invariants-in-domain)

**Requirement:** An aggregate or value object MUST be the only place that enforces a state transition or invariant.

**Rationale:** A rule duplicated in a handler drifts from the aggregate that owns it.

### Separate command and query behavior (standards/rule/backend-architecture.separate-command-and-query-behavior)

**Requirement:** A command MUST mutate aggregates through repositories while a query projects read results without loading one.

**Rationale:** An enabled persistence extension may replace the read boundary for named aggregate paths. A command still never enforces an invariant from a read projection.

### Declare the execution host for work that outlives a request (standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request)

**Requirement:** An application MUST declare the execution host that runs its durable dispatch, queue consumption, and scheduled work.

**Rationale:** The declared host is either the WebApi process or a Worker project. A rule that only restricts when a Worker project may exist never says where the work runs without one. A project can then host four background services inside WebApi, deviate from no rule it can name, and record no decision. Naming the host makes the choice visible whichever way it goes.

The declaration lives in a Decision record following `standards/rule/core-model.keep-one-owner-and-status-on-every-record`. Durable dispatch and queue consumption follow the outbox extension, and scheduled work follows the jobs extension.

The host is a composition decision, not a code-placement decision. The background service classes live in Infrastructure either way, because they hold provider and scheduling concerns. The host registers them.

**Example:** A Decision naming WebApi as the execution host states that durable dispatch shares the request process, and states what an unavailable process costs.

### Create a Worker project when background work needs its own process (standards/rule/backend-architecture.create-a-worker-project-when-background-work-needs-its-own-process)

**Requirement:** An application MUST create a Worker project when background work needs independent scaling, independent deployment, or isolation from request-path resource limits.

**Rationale:** A shared process couples the three. A restart to deploy an endpoint change interrupts a dispatch loop. Request load and dispatch load compete for one thread pool, and neither scales alone. A product with one deployable unit and modest background load accepts that coupling deliberately, which is why the choice is declared rather than assumed.

**Example:** An application with an outbox dispatching a few messages each minute can run it in WebApi. An application dispatching continuously, or one whose dispatch must survive an endpoint deployment, creates the Worker project.

### Test structural boundaries (standards/rule/backend-architecture.test-structural-boundaries)

**Requirement:** An application MUST prove project references, package boundaries, visibility, module folders, and aggregate inheritance with architecture tests.

**Rationale:** A structural rule that only a reviewer checks stops holding as soon as review misses one file.

### Compose each process explicitly (standards/rule/backend-architecture.compose-each-process-explicitly)

**Requirement:** A host MUST register its own transport services and call the Infrastructure entry point without building a second provider.

**Rationale:** WebApi and Worker are the only composition roots. Domain contains no registration code, and Application exposes contracts without resolving services.

## Conventions

### Keep composition in hosts (standards/rule/backend-architecture.keep-composition-in-hosts)

**Default:** Keep service registration in `Program.cs` and host registration modules.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use one public assembly marker per scanned project (standards/rule/backend-architecture.use-one-public-assembly-marker-per-scanned-project)

**Default:** Expose one `public static` assembly marker in each project that an approved scanner reads.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The marker gives the scanner an assembly reference while the scanned handlers stay internal.

## Reference example

This informative example demonstrates `standards/rule/backend-architecture.point-dependencies-inward` and `standards/rule/backend-architecture.separate-command-and-query-behavior`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublishedEvent`.
4. Infrastructure stages and commits the document through the command pipeline.
5. An event reaction implementation handles the event through the delivery classification its reaction declares under `standards/rule/backend-application.keep-event-reaction-implementations-explicit`.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/backend-architecture.use-five-application-projects | guidance | Does the solution hold exactly the five baseline projects? |
| standards/rule/backend-architecture.point-dependencies-inward | guidance | Does every project reference point toward Domain without an outward edge? |
| standards/rule/backend-architecture.own-each-layers-contract-types | guidance | Does each layer define its own contracts apart from kernel values and typed IDs? |
| standards/rule/backend-architecture.keep-one-application-assembly | guidance | Does one Application project hold every message, handler, and module-owned port? |
| standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case | guidance | Does each layer folder path resolve to a declared module and aggregate? |
| standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers | guidance | Does each type sit at the lowest folder holding its consumers, with no banned folder name? |
| standards/rule/backend-architecture.keep-implementation-types-internal | guidance | Is every handler, validator, definition, and endpoint implementation internal and sealed? |
| standards/rule/backend-architecture.keep-business-invariants-in-domain | guidance | Does every state transition run inside its aggregate or value object? |
| standards/rule/backend-architecture.separate-command-and-query-behavior | guidance | Do commands mutate through repositories while queries project without aggregates? |
| standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request | guidance | Which Decision names the execution host for dispatch, queue consumption, and scheduled work? |
| standards/rule/backend-architecture.create-a-worker-project-when-background-work-needs-its-own-process | guidance | Does background work needing its own process run in a Worker project? |
| standards/rule/backend-architecture.test-structural-boundaries | guidance | Do the architecture tests prove references, packages, visibility, folders, and inheritance? |
| standards/rule/backend-architecture.compose-each-process-explicitly | guidance | Does each host register its own services without building a second provider? |
| standards/rule/backend-architecture.keep-composition-in-hosts | guidance | Does all service registration live in hosts and host modules? |
| standards/rule/backend-architecture.use-one-public-assembly-marker-per-scanned-project | guidance | Does each scanned project expose exactly one public assembly marker? |
