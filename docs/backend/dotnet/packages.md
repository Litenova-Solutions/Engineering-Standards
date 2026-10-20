# .NET Packages

## Intent

A .NET backend realizes package boundaries with project references and NuGet central management. The shared provisions live on the stack-neutral page ([Dependencies](../../workspace/dependencies.md)); this page holds what .NET alone requires.

## Standards

### Use the project reference graph

**Requirement:** A project reference MUST follow the graph in the table in this section and add no other edge.

**Rationale:** The table assigns each .NET project the layers it may reference, so composition stays in the host. This provision realizes `litespec/workspace/dependencies#follow-the-declared-dependency-graph` for .NET projects.

**Example:**

| Project | May reference |
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

**Requirement:** The Domain project MUST reference no package beyond the .NET base class library.

**Rationale:** Marten, EF Core, LiteBus, ASP.NET Core, injection, serialization, and logging packages all stay outside. This provision realizes `litespec/workspace/dependencies#keep-domain-dependency-free` for .NET projects.

### Keep Application dependencies narrow

**Requirement:** Application MUST reference only LiteBus command and query abstractions, required read abstractions, and needed Microsoft abstractions, plus the `IQuerySession` read boundary.

**Rationale:** A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide. The Requirement names the one read boundary this allows. This provision realizes `litespec/workspace/dependencies#keep-application-free-of-provider-packages` for .NET projects.

### Pin every dependency centrally

**Requirement:** Every NuGet and npm version MUST resolve through central management or the committed lockfile, at the pin `litespec.manifest.json` states where it states one.

**Rationale:** An inline version in a project file is invisible to the manifest that is supposed to own it. This provision realizes `litespec/workspace/dependencies#pin-every-dependency-version-centrally` for .NET projects.

The manifest pins the baseline stack, which is the set these standards name. A consumer also carries packages for its own product, and it cannot add those to a manifest it does not own. Those versions live in the consumer's own central file under `litespec/backend/dotnet/config#centralize-nuget-versions` or its lockfile, and `litespec/workspace/dependencies#approve-new-packages-explicitly` is what admits them.

**Example:** A consumer generating invoices pins its PDF library in `Directory.Packages.props` with a decision record. The manifest never names it, and the pin is still central.

## Conventions

### Reference only the LiteBus module required

**Default:** Reference the LiteBus command, query, or event module that the code actually uses.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A unified application bus package pulls in contracts that the layer never dispatches.

### Use this baseline package ownership

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** The table assigns each .NET baseline package to its owning project. This provision realizes `litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer` for .NET projects.

**Example:**

| Project | Direct package groups |
|:---|:---|
| Domain | None |
| Application.Abstractions | Required LiteBus module abstractions only |
| Application | Required LiteBus module abstractions; `Marten` for the selected `IQuerySession` read boundary; Microsoft abstractions used by public ports |
| Infrastructure | `Marten`; LiteBus registration modules. Provider, resilience, service-discovery, and configuration packages required by implemented adapters |
| WebApi | JWT Bearer [REDACTED] ASP.NET Core OpenAPI, build-time OpenAPI generation, Scalar, and required LiteBus mediator abstractions |
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
