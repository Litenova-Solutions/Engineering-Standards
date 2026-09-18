# Backend Architecture

## Intent


The backend is a five-project modular monolith. Project boundaries separate business rules, the contracts every layer names, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a separate assembly.

CQRS separates write and read behavior inside one Application project. Modules and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}


- Domain, Application.Abstractions, Application, Infrastructure, and WebApi are the five baseline projects. (standards/rule/backend-architecture.use-five-application-projects)
- Project references point inward and never outward. (standards/rule/backend-architecture.point-dependencies-inward)
- Each layer defines its own messages, results, and transport models. (standards/rule/backend-architecture.own-each-layers-contract-types)
- One Application project holds every message, handler, and module-owned port. (standards/rule/backend-architecture.keep-one-application-assembly)
- A type lives at the lowest folder holding its consumers, and every layer repeats the same module and aggregate order. (standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers, standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case)
- Handlers, validators, and implementations stay internal and sealed. (standards/rule/backend-architecture.keep-implementation-types-internal)
- Aggregates own invariants; handlers only coordinate. (standards/rule/backend-architecture.keep-business-invariants-in-domain)
- Commands write through repositories; queries read projections. (standards/rule/backend-architecture.separate-command-and-query-behavior)
- Background work names its execution host, and a Worker project is one option. (standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request, standards/rule/backend-architecture.create-a-worker-project-when-background-work-needs-its-own-process)
- Architecture tests prove every structural boundary. (standards/rule/backend-architecture.test-structural-boundaries)

## Standards


### Use five application projects (standards/rule/backend-architecture.use-five-application-projects)

**Requirement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline projects.

**Example:** An application layout can contain:

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application.Abstractions/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

`Application.Abstractions` holds the contracts more than one module names: the pipeline's own positions, the cross-module ports, the transport-neutral failures, and the published integration events. It references Domain and nothing else, so no type in it can name a use case, a handler, or a module. That refusal is the reason it is a project rather than a folder. A folder inside Application cannot decline what a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation never belongs there. The project name states the test, and a type that cannot pass it belongs to a module under `standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

### Point dependencies inward (standards/rule/backend-architecture.point-dependencies-inward)

**Requirement:** A project reference MUST point inward, so Domain references no outer layer and WebApi composes the process.

**Rationale:** Application coordinates Domain, and Infrastructure implements the boundaries both declare. The reference matrix in [Dependencies](../workspace/dependencies.md) applies exactly.

### Own each layer's contract types (standards/rule/backend-architecture.own-each-layers-contract-types)

**Requirement:** A layer MUST define its own messages, results, and transport models rather than reuse an inner layer's type as its outward contract.

**Rationale:** A change to an inner shape then stops rippling through every outer layer. The Shared kernel is the one sanctioned exception.

### Keep one Application assembly (standards/rule/backend-architecture.keep-one-application-assembly)

**Requirement:** An application MUST place commands, queries, results, validators, handlers, reactions, orchestrators, and ports in one Application project.

**Rationale:** Separate Write, Read, Contracts, and event-handler assemblies are outside this profile. The separation this profile keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html), which separates the command and query models rather than the assemblies holding them. Splitting assemblies buys a deployment boundary the profile does not use, and costs a project reference that every use case has to cross.

### Organize every layer by module and use case (standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case)

**Requirement:** Every layer MUST use the same module names and order its folders as module, then aggregate, then layer detail.

**Rationale:** An aggregate stays flat only when its plural name equals the single module name. Module is an organization term, not a runtime base type, so no `IModule` or `ModuleRoot` contract exists.

A folder named for a technical grouping rather than a module defeats the rule, because the next unrelated type fits it. `Shared`, `Common`, `Util`, `Helpers`, `Core`, and `Misc` inside a layer are the names that do this.

**Example:** The architecture test asserts the folder names directly, because a rule only a reviewer checks stops holding at the first missed file.

```csharp
Types.InAssembly(ApplicationAssemblyMarker.Assembly)
    .Should()
    .NotResideInNamespaceContaining("Shared")
    .And().NotResideInNamespaceContaining("Common")
    .And().NotResideInNamespaceContaining("Helpers")
    .GetResult()
    .IsSuccessful.Should().BeTrue();
```

### Place a type at the lowest folder that holds its consumers (standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers)

**Requirement:** A type MUST live at the lowest folder containing every consumer that names it.

**Rationale:** The lowest folder is the use-case folder when one use case names the type. It is the aggregate folder when several use cases of one aggregate name it. It is the module folder when several aggregates of one module name it. It is `Application.Abstractions` when more than one module names the type, or when two layers name it with no module between them. A type only Infrastructure names is an Infrastructure type.

Two kinds of type travel with something else rather than by their own consumer count. A type that exists only to shape one contract's input or output stays with that contract, and a closed enumerated set stays whole.

The rule is mechanical, so placement is counted rather than judged. The contracts project is what remains after the count rather than a destination anyone chooses. A folder named for the absence of a reason (`Shared`, `Common`, `Util`, `Helpers`) can refuse nothing. Such a folder accumulates until a tenth of the layer sits outside the module tree, unreviewed, and named for no aggregate.

Domain's shared kernel is the one folder of that name a solution keeps. Its membership is closed by `standards/rule/backend-architecture.own-each-layers-contract-types` rather than open to whatever needs a home. A service that coordinates several aggregates lives in the module that owns the aggregates it reads and writes, not with whichever module calls it first.

### Keep implementation types internal (standards/rule/backend-architecture.keep-implementation-types-internal)

**Requirement:** A handler, validator, persistence implementation, or endpoint implementation MUST be declared `internal sealed`.

**Rationale:** Messages, results, assembly markers, and ports stay public only when another project uses them. Assembly scanning is not a reason to widen visibility.

### Keep business invariants in Domain (standards/rule/backend-architecture.keep-business-invariants-in-domain)

**Requirement:** An aggregate or value object MUST be the only place that enforces a state transition or invariant.

**Rationale:** A rule duplicated in a handler drifts from the aggregate that owns it.

### Separate command and query behavior (standards/rule/backend-architecture.separate-command-and-query-behavior)

**Requirement:** A command MUST mutate aggregates through repositories while a query projects read results without loading one.

**Rationale:** An enabled persistence extension may replace the read boundary for named aggregate paths. A command still never enforces an invariant from a read projection.

### Declare the execution host for work that outlives a request (standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request)

**Requirement:** An application MUST declare the execution host that runs its durable dispatch, queue consumption, workflow advancement, and scheduled work.

**Rationale:** The declared host is either the WebApi process or a Worker project. A rule that only restricts when a Worker project may exist never says where the work runs without one. A project can then host four background services inside WebApi, deviate from no rule it can name, and record no decision. Naming the host makes the choice visible whichever way it goes.

The host is a composition decision, not a code-placement decision. The background service classes live in Infrastructure either way, because they hold provider and scheduling concerns. The host registers them.

**Example:** A project record naming WebApi as the execution host states that durable dispatch shares the request process, and states what an unavailable process costs.

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


### Use mirrored module folders (standards/rule/backend-architecture.use-mirrored-module-folders)

**Default:** Mirror the module, aggregate, and layer-detail folder order in every layer.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A single-aggregate module stays flat when the aggregate root's plural name equals the module name. Otherwise each aggregate uses its own plural folder.

**Example:**

```text
# single-aggregate module whose aggregate name matches the module: the aggregate stays flat in every layer
Domain/Posts/
Application/Posts/CreateDraft/
Infrastructure/Posts/
WebApi/Endpoints/Posts/CreateDraft/

# multi-aggregate module: module, then plural aggregate folder, then operation, mirrored in every layer
Domain/Audience/BuyerAccounts/
Domain/Audience/Consents/
Application/Audience/BuyerAccounts/RestrictAccount/
Application/Audience/Consents/GrantConsent/
Infrastructure/Audience/BuyerAccounts/
Infrastructure/Audience/Consents/
WebApi/Endpoints/Audience/BuyerAccounts/RestrictAccount/
WebApi/Endpoints/Audience/Consents/GrantConsent/

# a workflow that coordinates modules uses the separate Workflows path
Application/Workflows/PublicationDelivery/
Infrastructure/Workflows/PublicationDelivery/
```

The mirrored folder names identify one domain module even though each layer owns different responsibilities. A documented workflow that coordinates modules uses the separate `Workflows/{Workflow}` path.

That path exists only where a workflow does. A consumer listing `workflow` in `prohibitedKinds` has no workflow specification and therefore no `Workflows/` folder, so the two settings agree rather than conflict. A `Workflows/` folder in a consumer that prohibits the kind is a folder with no specification behind it.

### Keep composition in hosts (standards/rule/backend-architecture.keep-composition-in-hosts)

**Default:** Keep service registration in `Program.cs` and host registration modules.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use one public assembly marker per scanned project (standards/rule/backend-architecture.use-one-public-assembly-marker-per-scanned-project)

**Default:** Expose one `public static` assembly marker in each project that an approved scanner reads.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The marker gives the scanner an assembly reference while the scanned handlers stay internal.

## Reference example

This informative example demonstrates `standards/rule/backend-architecture.point-dependencies-inward` and `standards/rule/backend-architecture.separate-command-and-query-behavior`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublishedEvent`.
4. Infrastructure stages and commits the document through the command pipeline.
5. An event reaction implementation handles the event through its documented atomic, durable, rebuildable, or optional delivery path.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/backend-architecture.use-five-application-projects | inspection | `SolutionStructureTests` asserts the solution contains the five baseline projects and no other layer project, and that contracts references Domain alone. |
| standards/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers | static | `ArchitectureTests` asserts no Application or WebApi folder takes a `Shared, Common, Util, Helpers`, or module name, and every contracts type has cross-module consumers. |
| standards/rule/backend-architecture.point-dependencies-inward | inspection | `ArchitectureTests` asserts the project reference graph matches the inward matrix in the dependencies convention. |
| standards/rule/backend-architecture.own-each-layers-contract-types | inspection | `ArchitectureTests` asserts no Application result or WebApi model exposes a Domain type across the layer boundary. |
| standards/rule/backend-architecture.keep-one-application-assembly | inspection | `SolutionStructureTests` asserts one Application project holds every command, query, handler, and port type. |
| standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case | static | `ArchitectureTests` asserts each layer folder path resolves to a declared module and aggregate, with no project-wide type folders. |
| standards/rule/backend-architecture.keep-implementation-types-internal | inspection | `ArchitectureTests` asserts every handler, validator, repository implementation, and endpoint type is internal and sealed. |
| standards/rule/backend-architecture.keep-business-invariants-in-domain | inspection | `ArchitectureTests` asserts no command handler references an invariant identifier that its aggregate already enforces. |
| standards/rule/backend-architecture.separate-command-and-query-behavior | inspection | `ArchitectureTests` asserts no query handler resolves a repository and no command handler resolves a read session. |
| standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request | inspection | The project record or a decision names the execution host for durable dispatch, queue consumption, workflow advancement, and scheduled work. |
| standards/rule/backend-architecture.create-a-worker-project-when-background-work-needs-its-own-process | inspection | The Worker project decision record names the scaling, deployment, or isolation boundary that requires an independent process. |
| standards/rule/backend-architecture.test-structural-boundaries | test | `ArchitectureTests` runs in the Release test pass and covers each declared structural boundary. |
| standards/rule/backend-architecture.compose-each-process-explicitly | inspection | `CompositionTests` asserts no registration path builds a second provider or resolves a service locator. |
| standards/rule/backend-architecture.use-mirrored-module-folders | inspection | Folder review compares each layer tree against its module list, or records a named local replacement. |
| standards/rule/backend-architecture.keep-composition-in-hosts | inspection | `ArchitectureTests` asserts no Domain or Application type calls a service-registration method. |
| standards/rule/backend-architecture.use-one-public-assembly-marker-per-scanned-project | inspection | `ArchitectureTests` asserts each scanned project exposes exactly one public assembly marker type. |
