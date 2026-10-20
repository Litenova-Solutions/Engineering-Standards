# .NET Architecture

## Intent

Architecture in a dotnet backend is five projects with explicit composition roots. The shared provisions live on the stack-neutral page ([Backend architecture](../backend/architecture.md)); this page holds what dotnet alone requires.

## Agent Summary {#agent-summary}

- Five projects form the dotnet modular monolith. (litespec/rule/dotnet-architecture.use-five-application-projects)
- One Application assembly holds messages, handlers, and ports. (litespec/rule/dotnet-architecture.keep-one-application-assembly)
- Handlers and endpoint code stay internal and sealed. (litespec/rule/dotnet-architecture.keep-implementation-types-internal)
- Composition lives in hosts and host modules. (litespec/rule/dotnet-architecture.keep-composition-in-hosts)
- Scanned projects expose one public assembly marker. (litespec/rule/dotnet-architecture.use-one-public-assembly-marker-per-scanned-project)

## Standards

### Use five application projects (litespec/rule/dotnet-architecture.use-five-application-projects)

**Requirement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline projects.

**Rationale:** `Application.Abstractions` holds the contracts more than one module names: the pipeline's own positions, the cross-module ports, the transport-neutral failures, and the published integration events. It references Domain and the required LiteBus module abstractions, and nothing else. No type in it can name a use case, a handler, or a module.

That refusal is the reason it is a project rather than a folder. A folder inside Application cannot decline what a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation never belongs there. The project name states the test, and a type that cannot pass it belongs to a module under `litespec/rule/backend-architecture.place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

This realizes litespec/rule/backend-architecture.use-five-application-parts in the dotnet stack.

**Example:**

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application.Abstractions/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

### Keep one Application assembly (litespec/rule/dotnet-architecture.keep-one-application-assembly)

**Requirement:** An application MUST place commands, queries, results, validators, handlers, reactions, and module-owned ports in one Application project, and cross-module contracts in Application.Abstractions.

**Rationale:** Separate Write, Read, Contracts, and event-handler assemblies are outside this profile. The separation this profile keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html), which separates the command and query models rather than the assemblies holding them. Splitting assemblies buys a deployment boundary the profile does not use, and costs a project reference that every use case has to cross.

This realizes litespec/rule/backend-architecture.keep-one-application-part in the dotnet stack.

### Keep implementation types internal (litespec/rule/dotnet-architecture.keep-implementation-types-internal)

**Requirement:** A handler, validator, definition, persistence implementation, or endpoint implementation MUST be declared `internal sealed`.

**Rationale:** Messages, results, assembly markers, and ports stay public only when another project uses them. Assembly scanning is not a reason to widen visibility.

This realizes litespec/rule/backend-architecture.keep-implementation-types-hidden in the dotnet stack.

## Conventions

### Keep composition in hosts (litespec/rule/dotnet-architecture.keep-composition-in-hosts)

**Default:** Keep service registration in `Program.cs` and host registration modules.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Domain and Application declare abstractions, so a registration call inside either inverts the dependency direction.

This realizes litespec/rule/backend-architecture.keep-service-registration-in-hosts in the dotnet stack.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use one public assembly marker per scanned project (litespec/rule/dotnet-architecture.use-one-public-assembly-marker-per-scanned-project)

**Default:** Expose one `public static` assembly marker in each project that an approved scanner reads.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The marker gives the scanner an assembly reference while the scanned handlers stay internal.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/dotnet-architecture.use-five-application-projects | guidance | Does the solution hold exactly the five baseline projects? |
| litespec/rule/dotnet-architecture.keep-one-application-assembly | guidance | Does one Application project hold every message, handler, and module-owned port? |
| litespec/rule/dotnet-architecture.keep-implementation-types-internal | guidance | Is every handler, validator, definition, and endpoint implementation internal and sealed? |
| litespec/rule/dotnet-architecture.keep-composition-in-hosts | guidance | Does all service registration live in hosts and host modules? |
| litespec/rule/dotnet-architecture.use-one-public-assembly-marker-per-scanned-project | guidance | Does each scanned project expose exactly one public assembly marker? |
