# Backend Architecture

## Intent


The backend is a four-project modular monolith. Project boundaries separate business rules, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a separate assembly.

CQRS separates write and read behavior inside one Application project. Modules and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}


- Domain, Application, Infrastructure, and WebApi are the four baseline projects. (BACKEND.ARCHITECTURE.PROJECTS.001)
- Project references point inward and never outward. (BACKEND.ARCHITECTURE.DEPENDENCIES.001)
- Each layer defines its own messages, results, and transport models. (BACKEND.ARCHITECTURE.CONTRACTS.001)
- One Application project holds every message, handler, and port. (BACKEND.ARCHITECTURE.APPLICATION.001)
- Every layer repeats the same module and aggregate folder order. (BACKEND.ARCHITECTURE.MODULES.001)
- Handlers, validators, and implementations stay internal and sealed. (BACKEND.ARCHITECTURE.VISIBILITY.001)
- Aggregates own invariants; handlers only coordinate. (BACKEND.ARCHITECTURE.DOMAIN.001)
- Commands write through repositories; queries read projections. (BACKEND.ARCHITECTURE.CQRS.001)
- A Worker exists only for work that outlives a request. (BACKEND.ARCHITECTURE.WORKER.001)
- Architecture tests prove every structural boundary. (BACKEND.ARCHITECTURE.ENFORCEMENT.001)

## Standards


### Use four application projects (BACKEND.ARCHITECTURE.PROJECTS.001)

**Requirement:** An application MUST use Domain, Application, Infrastructure, and WebApi as its four baseline projects.

**Example:** An application layout can contain:

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

### Point dependencies inward (BACKEND.ARCHITECTURE.DEPENDENCIES.001)

**Requirement:** A project reference MUST point inward, so Domain references no outer layer and WebApi composes the process.

**Rationale:** Application coordinates Domain, and Infrastructure implements the boundaries both declare. The reference matrix in [Dependencies](../workspace/dependencies.md) applies exactly.

### Own each layer's contract types (BACKEND.ARCHITECTURE.CONTRACTS.001)

**Requirement:** A layer MUST define its own messages, results, and transport models rather than reuse an inner layer's type as its outward contract.

**Rationale:** A change to an inner shape then stops rippling through every outer layer. The Shared kernel is the one sanctioned exception.

### Keep one Application assembly (BACKEND.ARCHITECTURE.APPLICATION.001)

**Requirement:** An application MUST place commands, queries, results, validators, handlers, reactions, orchestrators, and ports in one Application project.

**Rationale:** Separate Write, Read, Contracts, and event-handler assemblies are outside this profile.

### Organize every layer by module and use case (BACKEND.ARCHITECTURE.MODULES.001)

**Requirement:** Every layer MUST use the same module names and order its folders as module, then aggregate, then layer detail.

**Rationale:** An aggregate stays flat only when its plural name equals the single module name. Module is an organization term, not a runtime base type, so no `IModule` or `ModuleRoot` contract exists.

### Keep implementation types internal (BACKEND.ARCHITECTURE.VISIBILITY.001)

**Requirement:** A handler, validator, persistence implementation, or endpoint implementation MUST be declared `internal sealed`.

**Rationale:** Messages, results, assembly markers, and ports stay public only when another project uses them. Assembly scanning is not a reason to widen visibility.

### Keep business invariants in Domain (BACKEND.ARCHITECTURE.DOMAIN.001)

**Requirement:** An aggregate or value object MUST be the only place that enforces a state transition or invariant.

**Rationale:** A rule duplicated in a handler drifts from the aggregate that owns it.

### Separate command and query behavior (BACKEND.ARCHITECTURE.CQRS.001)

**Requirement:** A command MUST mutate aggregates through repositories while a query projects read results without loading one.

**Rationale:** An enabled persistence extension may replace the read boundary for named aggregate paths. A command still never enforces an invariant from a read projection.

### Add Worker only for an independent process boundary (BACKEND.ARCHITECTURE.WORKER.001)

**Requirement:** An application MUST create a Worker project only for durable dispatch, queue consumption, workflow advancement, or scheduled work that outlives a request.

**Rationale:** An optional best-effort reaction may stay inside WebApi when its loss is accepted.

### Test structural boundaries (BACKEND.ARCHITECTURE.ENFORCEMENT.001)

**Requirement:** An application MUST prove project references, package boundaries, visibility, module folders, and aggregate inheritance with architecture tests.

**Rationale:** A structural rule that only a reviewer checks stops holding as soon as review misses one file.

### Compose each process explicitly (BACKEND.ARCHITECTURE.COMPOSITION.001)

**Requirement:** A host MUST register its own transport services and call the Infrastructure entry point without building a second provider.

**Rationale:** WebApi and Worker are the only composition roots. Domain contains no registration code, and Application exposes contracts without resolving services.

## Conventions


### Use mirrored module folders (BACKEND.ARCHITECTURE.CONVENTION.001)

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

### Keep composition in hosts (BACKEND.ARCHITECTURE.CONVENTION.002)

**Default:** Keep service registration in `Program.cs` and host registration modules.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use one public assembly marker per scanned project (BACKEND.ARCHITECTURE.CONVENTION.003)

**Default:** Expose one `public static` assembly marker in each project that an approved scanner reads.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The marker gives the scanner an assembly reference while the scanned handlers stay internal.

## Reference example

This informative example demonstrates `BACKEND.ARCHITECTURE.DEPENDENCIES.001` and `BACKEND.ARCHITECTURE.CQRS.001`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublishedEvent`.
4. Infrastructure stages and commits the document through the command pipeline.
5. An event reaction implementation handles the event through its documented atomic, durable, rebuildable, or optional delivery path.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| BACKEND.ARCHITECTURE.PROJECTS.001 | inspection | `SolutionStructureTests` asserts the solution contains the four baseline projects and no additional layer project. |
| BACKEND.ARCHITECTURE.DEPENDENCIES.001 | inspection | `ArchitectureTests` asserts the project reference graph matches the inward matrix in the dependencies convention. |
| BACKEND.ARCHITECTURE.CONTRACTS.001 | inspection | `ArchitectureTests` asserts no Application result or WebApi model exposes a Domain type across the layer boundary. |
| BACKEND.ARCHITECTURE.APPLICATION.001 | inspection | `SolutionStructureTests` asserts one Application project holds every command, query, handler, and port type. |
| BACKEND.ARCHITECTURE.MODULES.001 | static | `ArchitectureTests` asserts each layer folder path resolves to a declared module and aggregate, with no project-wide type folders. |
| BACKEND.ARCHITECTURE.VISIBILITY.001 | inspection | `ArchitectureTests` asserts every handler, validator, repository implementation, and endpoint type is internal and sealed. |
| BACKEND.ARCHITECTURE.DOMAIN.001 | inspection | `ArchitectureTests` asserts no command handler references an invariant identifier that its aggregate already enforces. |
| BACKEND.ARCHITECTURE.CQRS.001 | inspection | `ArchitectureTests` asserts no query handler resolves a repository and no command handler resolves a read session. |
| BACKEND.ARCHITECTURE.WORKER.001 | inspection | The Worker project decision record names the durable or scheduled boundary that requires an independent process. |
| BACKEND.ARCHITECTURE.ENFORCEMENT.001 | test | `ArchitectureTests` runs in the Release test pass and covers each declared structural boundary. |
| BACKEND.ARCHITECTURE.COMPOSITION.001 | inspection | `CompositionTests` asserts no registration path builds a second provider or resolves a service locator. |
| BACKEND.ARCHITECTURE.CONVENTION.001 | inspection | Folder review compares each layer tree against its module list, or records a named local replacement. |
| BACKEND.ARCHITECTURE.CONVENTION.002 | inspection | `ArchitectureTests` asserts no Domain or Application type calls a service-registration method. |
| BACKEND.ARCHITECTURE.CONVENTION.003 | inspection | `ArchitectureTests` asserts each scanned project exposes exactly one public assembly marker type. |
