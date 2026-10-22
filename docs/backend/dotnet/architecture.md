# .NET Architecture

## Intent

A .NET backend is 5 projects: Domain, Application.Abstractions, Application, Infrastructure, and WebApi, wired together by host projects that own service registration. This page states the .NET form of that shape: which projects exist, what each holds, which types stay internal, and where service registration lives, so every type keeps one home and dependencies point inward. The shared architecture rules live on [Backend Architecture](../architecture.md); this page holds only their .NET form.

## Concepts

### The Five Projects

Each part of the backend is a .NET project with one job. Domain holds the business model. Application.Abstractions holds the contracts that more than one module names. Application holds the messages, handlers, and module-owned ports. Infrastructure holds the technical adapters, and WebApi hosts the HTTP boundary. `AppHost` and `ServiceDefaults` support local hosting and diagnostics; they are hosts, not application layers.

### Visibility and Composition

A type is visible only to the projects that need it: implementations stay `internal sealed`, and a message, port, or marker is public only when another project names it. Service registration lives in the hosts, because Domain and Application declare abstractions and a registration call inside either would point the dependency the wrong way.

## Standards

### Use Five Application Projects

**Statement:** An application MUST use Domain, Application.Abstractions, Application, Infrastructure, and WebApi as its five baseline projects.

**Rationale:** `Application.Abstractions` holds the contracts that more than one module names: the pipeline's own positions, the cross-module ports, the transport-neutral failures, and the published integration events. It references Domain and the required LiteBus module abstractions, and nothing else, so no type in it can name a use case, a handler, or a module.

That refusal is why it is a project rather than a folder. A folder inside Application cannot decline what a developer puts in it, and the folder that tries becomes the place every unplaced type goes.

An implementation never belongs there. The project name states the test, and a type that cannot pass it belongs to a module under `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`.

This provision states the .NET form of `litespec/backend/architecture#use-five-application-parts`.

**Example:**

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application.Abstractions/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

### Keep One Application Assembly

**Statement:** An application MUST place commands, queries, results, validators, handlers, reactions, and module-owned ports in one Application project, and cross-module contracts in Application.Abstractions.

**Rationale:** Splitting Application into Write, Read, Contracts, and event-handler assemblies would buy a deployment boundary the stack never uses, and every use case would pay for it with a project reference to cross. The separation this stack keeps is the one [Fowler describes as CQRS](https://www.martinfowler.com/bliki/CQRS.html): the command and query models differ, while one assembly holds them.

This provision states the .NET form of `litespec/backend/architecture#keep-one-application-part`.

### Mirror Modules in Folders and Namespaces

**Statement:** Every project MUST give each module one folder and namespace.

**Rationale:** The folder name derives from the module identifier, so `module/spending` owns the `Spending` folder in every project, and the namespace follows the folder under `litespec/workspace/naming#keep-namespaces-aligned-with-folders`. The same module names in every layer let a reader move from a Domain aggregate to its handler, its repository, and its endpoint without a map. This provision states the .NET form of `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

**Example:** The `Spending` module owns one folder in every project, and each namespace follows its folder:

```text
Expenses.Domain/Spending/Expenses/Expense.cs
Expenses.Application/Spending/Expenses/SubmitExpense/SubmitExpenseCommandHandler.cs
```

The handler above lives in namespace `Expenses.Application.Spending.Expenses.SubmitExpense`.

### Keep Implementation Types Internal

**Statement:** A handler, validator, definition, persistence implementation, or endpoint implementation MUST be declared `internal sealed`.

**Rationale:** A public type is an offer to every project, so an implementation left public invites callers it was never written for. Messages, results, markers, and ports stay public only when another project uses them; handlers, validators, and implementations stay `internal sealed`. Assembly scanning reads internal types through the one public marker, so it never justifies widening visibility.

This provision states the .NET form of `litespec/backend/architecture#keep-implementation-types-hidden`.

## Conventions

### Keep Composition in Hosts

**Default:** Keep service registration in `Program.cs` and host registration modules.

**Replacement:** A project names its registration layout in its host documentation.

**Rationale:** Domain and Application declare abstractions for the hosts to implement. A registration call inside either layer makes the abstraction depend on the thing it abstracts, inverting the dependency direction. Registration in `Program.cs` and host modules keeps that direction intact, and one visible call order shows which layer wires first.

This provision states the .NET form of `litespec/backend/architecture#keep-service-registration-in-hosts`.

**Example:** One registration entry point per outer layer has this shape:

```text
InfrastructureServiceRegistration.AddInfrastructure(...)
WebApiServiceRegistration.AddWebApi(...)
```

`AddInfrastructure` receives configuration and host environment values needed to bind and validate provider options. `AddWebApi` owns Problem Details, authentication, authorization, endpoint discovery, and OpenAPI. `Program.cs` keeps their call order visible.

### Use One Public Assembly Marker per Scanned Project

**Default:** Expose one `public static` assembly marker in each project that an approved scanner reads.

**Replacement:** A project names its scanner assembly reference in its host documentation.

**Rationale:** Scanners need an assembly reference, and without a marker developers make handlers public to supply one. One public static marker per scanned project gives the scanner its reference while every handler stays internal.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/architecture#use-five-application-projects | guidance | The solution projects: exactly Domain, Application.Abstractions, Application, Infrastructure, and WebApi. |
| litespec/backend/dotnet/architecture#keep-one-application-assembly | guidance | The Application project files: every command, query, result, validator, handler, reaction, and module-owned port, with cross-module contracts in Application.Abstractions. |
| litespec/backend/dotnet/architecture#mirror-modules-in-folders-and-namespaces | guidance | The module folders and namespaces in every project: one folder and namespace per module, named for the module. |
| litespec/backend/dotnet/architecture#keep-implementation-types-internal | guidance | Handler, validator, definition, persistence, and endpoint implementation declarations: each `internal sealed`. |
| litespec/backend/dotnet/architecture#keep-composition-in-hosts | guidance | Service registration calls: each one in `Program.cs` or a host registration module. |
| litespec/backend/dotnet/architecture#use-one-public-assembly-marker-per-scanned-project | guidance | Each scanned project: exactly one public static assembly marker. |
