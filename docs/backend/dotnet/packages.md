# .NET Packages

## Intent

Every .NET project in a backend may reference only the layers and packages its job allows. This page states the .NET form of those boundaries: the project reference graph (which project may reference which), the Domain and Application package limits, central version pinning (one file holding every version), and the table assigning each baseline package to its one owning project. A new dependency then lands in the one project allowed to hold it, instead of spreading to every project that finds it useful. The shared dependency rules live on [Dependencies](../../workspace/dependencies.md); this page holds only their .NET form.

## Concepts

### The reference graph

A project reference is permission to name another project's public types. The graph provision below names every permitted edge between .NET projects, so composition stays in the hosts and Domain stays reachable without ever reaching back.

### Central pins and package ownership

Every version resolves through central package management or the committed lockfile: the manifest pins the baseline stack, and the consumer's own central file pins its product packages. The ownership table assigns each baseline package to the one project allowed to reference it, so a central version entry never becomes permission for every project to reference it.

## Standards

### Use the project reference graph

**Statement:** A project reference MUST follow the graph in the table in this section and add no other edge.

**Rationale:** An undeclared reference lets a layer reach past its boundary, and review cannot refuse what no graph forbids. The table names every permitted edge, so composition stays in the hosts and each project names only the layers its job needs. This provision states the .NET form of `litespec/workspace/dependencies#follow-the-declared-dependency-graph`.

**Example:**

| Project | may reference |
|:---|:---|
| Domain | No application project |
| Application.Abstractions | Domain |
| Application | Domain, Application.Abstractions |
| Infrastructure | Domain, Application.Abstractions, Application |
| WebApi | Application.Abstractions, Application, Infrastructure |
| Worker | Application.Abstractions, Application, Infrastructure |
| AppHost | Deployable host projects through Aspire resource references |
| Test projects | Only production projects and test support needed by their test category |

`WebApi` references Infrastructure for composition in `Program.cs`. Endpoint implementations cannot inject Infrastructure repositories, sessions, or provider clients.

### Keep Domain package-free

**Statement:** The Domain project MUST reference no package beyond the .NET base class library.

**Rationale:** A package in Domain makes business rules depend on a framework, a provider, or a messenger. Marten, EF Core, LiteBus, ASP.NET Core, injection, serialization, and logging packages all stay outside, so Domain builds on the base class library alone. This provision states the .NET form of `litespec/workspace/dependencies#keep-domain-dependency-free`.

### Keep Application dependencies narrow

**Statement:** Application MUST reference only LiteBus command and query abstractions, required read abstractions, and needed Microsoft abstractions, plus the `IQuerySession` read boundary.

**Rationale:** Application coordinates; Infrastructure hides technology. A provider package in Application makes the coordination layer depend on the technology it was meant to stay free of. The Requirement names the one permitted read boundary; everything else provider-shaped stays out. This provision states the .NET form of `litespec/workspace/dependencies#keep-application-free-of-provider-packages`.

### Pin every dependency centrally

**Statement:** Every NuGet and npm version MUST resolve through central management or the committed lockfile, using the pin `litespec.manifest.json` states when it states one.

**Rationale:** An inline version in a project file is invisible to the manifest that is supposed to own it, and two projects drift to two versions of one dependency. Central management or the lockfile resolves every version in one place, using the manifest pin where one exists. This provision states the .NET form of `litespec/workspace/dependencies#pin-every-dependency-version-centrally`.

The manifest pins the baseline stack, which is the set these standards name. A consumer also carries packages for its own product, and it cannot add those to a manifest it does not own. Those versions live in the consumer's own central file under `litespec/backend/dotnet/config#centralize-nuget-versions` or its lockfile. `litespec/workspace/dependencies#approve-new-packages-explicitly` admits them.

**Example:** A consumer generating invoices pins its PDF library in `Directory.Packages.props` with a decision record. The manifest never names it, and the pin is still central.

## Conventions

### Reference only the LiteBus module required

**Default:** Reference the LiteBus command, query, or event module that the code actually uses.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A unified bus package pulls contracts for commands, queries, and events into a layer that dispatches only some of them. Referencing only the module the code uses keeps each layer's dispatch surface exact.

### Use this baseline package ownership

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Without an owner, a package lands in the project that first needs it and spreads from there. The table assigns each baseline package to its one owning project, so review can refuse it anywhere else. This provision states the .NET form of `litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer`.

**Example:**

| Project | Direct package groups |
|:---|:---|
| Domain | None |
| Application.Abstractions | Required LiteBus module abstractions only |
| Application | Required LiteBus module abstractions; `Marten` for the selected `IQuerySession` read boundary; Microsoft abstractions used by public ports |
| Infrastructure | `Marten`; LiteBus registration modules. Provider, resilience, service discovery, and configuration packages required by implemented adapters |
| WebApi | JWT Bearer authentication, ASP.NET Core OpenAPI, build-time OpenAPI generation, Scalar, and required LiteBus mediator abstractions |
| Worker | LiteBus registration modules; the provider, resilience, and configuration packages its hosted jobs need |
| ServiceDefaults | Health checks, service discovery, HTTP resilience, and OpenTelemetry registration and instrumentation |
| AppHost | Aspire AppHost and resource hosting packages |
| Domain.Tests | xUnit v3 and assertions |
| Application.Tests | xUnit v3, assertions, and NSubstitute |
| Integration.Tests | xUnit v3, assertions, test host, Testcontainers PostgreSQL, and the Microsoft.Testing.Platform report and coverage extensions |
| Architecture.Tests | xUnit v3, assertions, and NetArchTest |
| Acceptance.Tests | xUnit v3, assertions, the behavior runner its extension selects, test host, and the report and coverage extensions |

Test projects reference xUnit v3 and run on Microsoft.Testing.Platform. The consumer `global.json` sets `"test": { "runner": "Microsoft.Testing.Platform" }`, because the .NET 10 `dotnet test` command refuses the VSTest mode for these projects.

The example adds a package to the narrowest owning project. A central version entry does not authorize every project to reference that package. Conditional packages such as EF Core, Reqnroll, LightBDD, SignalR, and WireMock are referenced only after their extension activates.

### Run LiteSpec.Analyzers in every application project

**Default:** Reference `LiteSpec.Analyzers` at the manifest pin, with `PrivateAssets="all"`, from every Domain, Application.Abstractions, Application, Infrastructure, and WebApi project.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** The analyzers report a breach of a .NET provision in the editor and the build, at the line that breaks it, with a link to the provision. Without them, a breach surfaces only in review, if at all. The package is a development dependency: it adds nothing to the built assemblies, so Domain stays package-free at run time. [Check .NET code with the analyzers](../../analyzers/check-dotnet-code-with-the-analyzers.md) sets it up, and [Analyzer rules](../../analyzers/README.md) lists what each rule reports.

**Example:**

```xml
<ItemGroup>
  <PackageReference Include="LiteSpec.Analyzers" PrivateAssets="all" />
</ItemGroup>
```

## Reference example

This informative example demonstrates `litespec/backend/dotnet/packages#keep-application-dependencies-narrow` and `litespec/backend/dotnet/packages#use-the-project-reference-graph`.

An Application query handler may inject `IQuerySession` because Marten is the selected read model. An Application command handler receives `IPostRepository`, because the Domain owns the aggregate boundary and Infrastructure owns the Marten implementation.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/packages#use-the-project-reference-graph | guidance | Does each project reference follow the declared graph with no added edge? |
| litespec/backend/dotnet/packages#keep-domain-package-free | guidance | Does the Domain project reference no package beyond the base class library? |
| litespec/backend/dotnet/packages#keep-application-dependencies-narrow | guidance | Does Application reference only permitted abstractions and the one read boundary? |
| litespec/backend/dotnet/packages#pin-every-dependency-centrally | guidance | Does every version resolve through central management or the lockfile at the manifest or consumer pin? |
| litespec/backend/dotnet/packages#reference-only-the-litebus-module-required | guidance | Does each project reference only the LiteBus modules its code dispatches? |
| litespec/backend/dotnet/packages#use-this-baseline-package-ownership | guidance | Does each baseline package sit in the layer the ownership table assigns? |
| litespec/backend/dotnet/packages#run-litespecanalyzers-in-every-application-project | guidance | Does each of the five application projects reference `LiteSpec.Analyzers` at the manifest pin? |
