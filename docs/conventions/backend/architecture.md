# Backend Architecture

## Intent


The backend is a four-project modular monolith. Project boundaries separate business rules, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a separate assembly.

CQRS separates write and read behavior inside one Application project. Modules and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}


- Use four application projects. (ARCH.PROJECTS.001)
- Point dependencies inward. (ARCH.DEPENDENCIES.001)
- Own each layer's contract types. (ARCH.CONTRACTS.001)
- Keep one Application assembly. (ARCH.APPLICATION.001)
- Organize every layer by module and use case. (ARCH.MODULES.001)
- Keep implementation types internal. (ARCH.VISIBILITY.001)
- Keep business invariants in Domain. (ARCH.DOMAIN.001)
- Separate command and query behavior. (ARCH.CQRS.001)
- Add Worker only for an independent process boundary. (ARCH.WORKER.001)
- Test structural boundaries. (ARCH.ENFORCEMENT.001)

## Standards


### Use four application projects (ARCH.PROJECTS.001)

**Requirement:** Applications MUST use four application projects.

**Example:** An application layout can contain:

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

### Point dependencies inward (ARCH.DEPENDENCIES.001)

**Requirement:** Applications MUST point dependencies inward.

**Rationale:** Domain contains business rules and owns no outer-layer dependency. Application coordinates Domain. Infrastructure implements Domain and Application boundaries. WebApi translates HTTP and composes the process.

The project reference matrix in [Dependencies](../repository/dependencies.md) applies exactly.

### Own each layer's contract types (ARCH.CONTRACTS.001)

**Requirement:** Applications MUST own each layer's contract types.

**Rationale:** The implementation projects references point inward (`ARCH.DEPENDENCIES.001`). The types a layer exposes in its own contract do not travel with them. A layer defines its own messages, results, and transport models and does not reuse an inner layer's model as its outward contract. A change to an inner shape does not ripple through every outer layer.

- Application owns its command and query messages and results. It exposes no Domain aggregate, result record, or closed set. It mirrors required shapes (`APP.CLOSEDSET.001`). It never returns an aggregate, session, provider response, or HTTP result.
- WebApi owns its request and response models. It does not reuse an Application message or result, or a Domain type, as a transport model. It maps to its own `RequestModel` and `ResponseModel` and mirrors a closed set as its own transport shape (`API.MODELS.001`).

The Shared kernel is the one sanctioned crossing. A typed ID or Shared value object is stable, behavior-free shared vocabulary. Examples include `PostId`, `Money`, and `EmailAddress`. These types can appear in an Application message or result. An aggregate-owned value object is not shared vocabulary.

Application represents it with a primitive and reconstructs it in the handler. For example, `CreateDraftCommand` takes a `string Title`, and the handler calls `PostTitle.Create`. The wire contract also reduces Shared-kernel types to primitive JSON forms. An out-of-process consumer depends on no Domain type.

This mirroring is deliberate duplication. Repeating a shape isolates each layer from inner changes. It also keeps the dependency surface a stable, versioned contract instead of a shared mutable model. The implementation does not replace the duplication with a shared cross-layer DTO, contracts assembly, or reused result type.

### Keep one Application assembly (ARCH.APPLICATION.001)

**Requirement:** Applications MUST keep one Application assembly.

**Rationale:** Commands, queries, results, validators, handlers, event reaction implementations, workflow orchestrators, and external ports live in one Application project.

Separate Write, Read, Contracts, and event-handler assemblies are outside this profile.

### Organize every layer by module and use case (ARCH.MODULES.001)

**Requirement:** Applications MUST organize every layer by module and use case.

**Rationale:** The implementation uses the same domain module names across layers. A module groups related language and Application use cases. It can contain zero, one, or multiple aggregates. Every layer uses module, aggregate, then layer detail.

The implementation keeps an aggregate flat only when its plural name equals the single module name. Otherwise, give each aggregate its own plural folder. The implementation does not mix types from separate aggregates. An Application operation folder contains one Command or Query.

Module is an organization and ownership term, not a runtime base type. Domain aggregate roots continue to derive from `AggregateRoot<TId>`. The implementation does not introduce `IModule`, `ModuleRoot`, or another module base contract.

The implementation does not create project-wide `Commands`, `Queries`, `Handlers`, `Validators`, or `Services` folders.

### Keep implementation types internal (ARCH.VISIBILITY.001)

**Requirement:** Applications MUST keep implementation types internal.

**Rationale:** Handlers, validators, persistence implementations, and endpoint implementations are `internal sealed`. Messages, results, assembly markers, and ports may be public when another project uses them.

An Infrastructure implementation requires a public Domain or Application interface. The implementation does not expose a handler to make assembly scanning easier.

### Keep business invariants in Domain (ARCH.DOMAIN.001)

**Requirement:** Applications MUST keep business invariants in Domain.

**Rationale:** Aggregates and value objects enforce state transitions and invariants. Command handlers coordinate loading, calling domain behavior, and staging. They do not reproduce aggregate invariants.

### Separate command and query behavior (ARCH.CQRS.001)

**Requirement:** Applications MUST separate command and query behavior.

**Rationale:** Commands mutate aggregates through repositories. Baseline queries project read results through `IQuerySession`. An enabled persistence extension may replace that read boundary for named aggregate paths. A query does not load an aggregate for presentation. A command does not use a read projection to enforce an aggregate invariant.

### Add Worker only for an independent process boundary (ARCH.WORKER.001)

**Requirement:** Applications MUST add Worker only for an independent process boundary.

**Rationale:** The implementation creates `{ProjectName}.Worker` for durable outbox dispatch, queue consumption, workflow advancement, or scheduled work continuing without WebApi. Optional best-effort event reactions may remain inside the WebApi process when their loss is accepted.

### Test structural boundaries (ARCH.ENFORCEMENT.001)

**Requirement:** Applications MUST test structural boundaries.

**Rationale:** Architecture.Tests verify project references, forbidden package dependencies, handler visibility, endpoint isolation, module folder rules, aggregate root inheritance, workflow placement, and extension-specific boundaries.

### Compose each process explicitly (ARCH.COMPOSITION.001)

**Requirement:** Applications MUST compose each process explicitly.

**Rationale:** WebApi and Worker are composition roots. A host registers LiteBus from the public Application assembly marker, calls the Infrastructure registration entry point, and registers only its own transport or processing services. Infrastructure registers Marten, repositories, commit behavior, external adapters, and their validated options.

Domain contains no registration code. Application exposes contracts and an assembly marker but does not resolve services or reference a host. Registration methods do not build an intermediate service provider, use a global service locator, or hide order-sensitive middleware.

## Conventions


### Use mirrored module folders (ARCH.CONVENTION.001)

**Default:** Use mirrored module folders.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The folder hierarchy is identical in every layer: module, aggregate, then layer detail. A single-aggregate module stays flat when its aggregate root's plural name equals the module name. Otherwise, each aggregate uses a folder named with the aggregate root's plural form. This rule also applies to modules with multiple aggregates (`DOMAIN` folder convention).

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

### Keep composition in hosts (ARCH.CONVENTION.002)

**Default:** Keep composition in hosts.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** `Program.cs` and host registration modules connect Application abstractions to Infrastructure implementations. Domain and Application do not call service registration.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use one public assembly marker per scanned project (ARCH.CONVENTION.003)

**Default:** Use one public assembly marker per scanned project.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation exposes a `public static` marker such as `ApplicationAssemblyMarker` when LiteBus or another approved scanner needs an assembly reference. The implementation keeps scanned handlers internal.

## Reference example

This informative example demonstrates `ARCH.DEPENDENCIES.001` and `ARCH.CQRS.001`.

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublishedEvent`.
4. Infrastructure stages and commits the document through the command pipeline.
5. An event reaction implementation handles the event through its documented atomic, durable, rebuildable, or optional delivery path.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| ARCH.PROJECTS.001 | inspection | Pull request review asserts `use four application projects` in the owning specification and source paths. |
| ARCH.DEPENDENCIES.001 | inspection | Pull request review asserts `point dependencies inward` in the owning specification and source paths. |
| ARCH.CONTRACTS.001 | inspection | Pull request review asserts `own each layer's contract types` in the owning specification and source paths. |
| ARCH.APPLICATION.001 | inspection | Pull request review asserts `keep one Application assembly` in the owning specification and source paths. |
| ARCH.MODULES.001 | static | Repository static check asserts `organize every layer by module and use case` for the owning paths. |
| ARCH.VISIBILITY.001 | inspection | Pull request review asserts `keep implementation types internal` in the owning specification and source paths. |
| ARCH.DOMAIN.001 | inspection | Pull request review asserts `keep business invariants in Domain` in the owning specification and source paths. |
| ARCH.CQRS.001 | inspection | Pull request review asserts `separate command and query behavior` in the owning specification and source paths. |
| ARCH.WORKER.001 | inspection | Pull request review asserts `add Worker only for an independent process boundary` in the owning specification and source paths. |
| ARCH.ENFORCEMENT.001 | test | An automated test citing `ARCH.ENFORCEMENT.001` asserts `test structural boundaries` at the affected boundary. |
| ARCH.COMPOSITION.001 | inspection | Pull request review asserts `compose each process explicitly` in the owning specification and source paths. |
| ARCH.CONVENTION.001 | inspection | Pull request review asserts `use mirrored module folders` in the owning specification and source paths. |
| ARCH.CONVENTION.002 | inspection | Pull request review asserts `keep composition in hosts` in the owning specification and source paths. |
| ARCH.CONVENTION.003 | inspection | Pull request review asserts `use one public assembly marker per scanned project` in the owning specification and source paths. |
