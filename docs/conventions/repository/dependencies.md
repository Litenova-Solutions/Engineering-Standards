# Dependencies

## Intent


Project references and package ownership make the application boundary visible to the compiler. The selected profile permits direct framework types only in the layers that own them and rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}


- Project references match the declared graph. (DEP.PROJECTS.001)
- Domain carries no package reference. (DEP.DOMAIN.001)
- Application references only its permitted abstractions. (DEP.APPLICATION.001)
- Provider packages live only in Infrastructure. (DEP.INFRASTRUCTURE.001)
- Every dependency version comes from the manifest. (DEP.PINS.001)
- A new package arrives with a decision and a manifest pin. (DEP.APPROVAL.001)
- Frontends stay isolated from each other's source. (DEP.FRONTEND.001)
- Web UI packages come from the manifest baseline. (DEP.FRONTEND.UI.001)

## Standards


### Use the project reference graph (DEP.PROJECTS.001)

**Requirement:** A project reference MUST follow the graph in the table in this section and add no other edge.

**Example:**

| Project | May reference |
|:---|:---|
| Domain | No application project |
| Application | Domain |
| Infrastructure | Domain, Application |
| WebApi | Application, Infrastructure |
| Worker | Application, Infrastructure |
| AppHost | Deployable host projects through Aspire resource references |
| Test projects | Only production projects and test support needed by their test category |

`WebApi` references Infrastructure for composition in `Program.cs`. Endpoint implementations cannot inject Infrastructure repositories, sessions, or provider clients.

### Keep Domain package-free (DEP.DOMAIN.001)

**Requirement:** The Domain project MUST reference no package beyond the .NET base class library.

**Rationale:** Marten, EF Core, LiteBus, ASP.NET Core, injection, serialization, and logging packages all stay outside.

### Keep Application dependencies narrow (DEP.APPLICATION.001)

**Requirement:** Application MUST reference only LiteBus command and query abstractions, required read abstractions, and Microsoft abstractions its ports need.

**Rationale:** A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide.

### Keep providers in Infrastructure (DEP.INFRASTRUCTURE.001)

**Requirement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** Infrastructure is the only layer that a provider change is allowed to reach.

### Pin every dependency centrally (DEP.PINS.001)

**Requirement:** A NuGet or npm version MUST match `standards.manifest.json` and resolve through central management or the committed lockfile.

**Rationale:** An inline version in a project file is invisible to the manifest that is supposed to own it.

### Approve new packages explicitly (DEP.APPROVAL.001)

**Requirement:** A package absent from the manifest MUST have a decision naming its use case, alternatives, owning layer, operating cost, and removal condition.

**Rationale:** The manifest is then updated in the same change, so the pin and its justification arrive together.

### Keep frontend applications isolated (DEP.FRONTEND.001)

**Requirement:** A frontend MUST NOT import another application's source or another module's internal feature files.

**Rationale:** A shared package exposes a documented public entry point and depends on no application.

### Keep the approved web UI dependency boundary (DEP.FRONTEND.UI.001)

**Requirement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `standards.manifest.json`.

**Rationale:** That baseline pins shadcn/ui, Tailwind CSS v4, Base UI, Lucide, and the utility packages that the installed source imports directly.

## Conventions


### Reference only the LiteBus module required (DEP.CONVENTION.001)

**Default:** Reference the LiteBus command, query, or event module that the code actually uses.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A unified application bus package pulls in contracts that the layer never dispatches.

### Keep generated packages dependency-light (DEP.CONVENTION.002)

**Default:** Keep generated API types free of dependencies and limit the shared client to `openapi-fetch` and those types.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep test dependencies in test projects (DEP.CONVENTION.003)

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A test package referenced by a production project ships to production.

### Use this baseline package ownership (DEP.CONVENTION.004)

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

| Project | Direct package groups |
|:---|:---|
| Domain | None |
| Application | Required LiteBus module abstractions; `Marten` for the selected `IQuerySession` read boundary; Microsoft abstractions used by public ports |
| Infrastructure | `Marten`; LiteBus registration modules. Provider, resilience, service-discovery, and configuration packages required by implemented adapters |
| WebApi | JWT bearer authentication, ASP.NET Core OpenAPI, build-time OpenAPI generation, Scalar, and required LiteBus mediator abstractions |
| ServiceDefaults | Health checks, service discovery, HTTP resilience, and OpenTelemetry registration and instrumentation |
| AppHost | Aspire AppHost and resource hosting packages |
| Domain.Tests | xUnit and assertions |
| Application.Tests | xUnit, assertions, and NSubstitute |
| Integration.Tests | xUnit, assertions, test host, Testcontainers PostgreSQL, and coverage collector |
| Architecture.Tests | xUnit, assertions, and NetArchTest |

The example adds a package to the narrowest owning project. A central version entry does not authorize every project to reference that package. Conditional packages such as EF Core, Reqnroll, SignalR, WireMock, and Auth.js are referenced only after their extension activates.

## Reference example

This informative example demonstrates `DEP.APPLICATION.001` and `DEP.PROJECTS.001`.

An Application query handler may inject `IQuerySession` because Marten is the selected read model. An Application command handler receives `IPostRepository`, because the Domain owns the aggregate boundary and Infrastructure owns the Marten implementation.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| DEP.PROJECTS.001 | inspection | `ArchitectureTests` asserts the project reference set matches the declared graph exactly. |
| DEP.DOMAIN.001 | inspection | `ArchitectureTests` asserts the Domain project declares no package reference. |
| DEP.APPLICATION.001 | inspection | `ArchitectureTests` asserts the Application package set matches the permitted list. |
| DEP.INFRASTRUCTURE.001 | inspection | `ArchitectureTests` asserts each provider package is referenced only by Infrastructure. |
| DEP.PINS.001 | static | The CI dependency check compares each resolved NuGet and npm version against `standards.manifest.json`. |
| DEP.APPROVAL.001 | inspection | The decision record names the five fields and the manifest entry lands in the same pull request. |
| DEP.FRONTEND.001 | inspection | `ImportBoundaryTests` asserts no cross-application or internal-feature import exists. |
| DEP.FRONTEND.UI.001 | static | `node standards/tools/validate-ui.mjs` reports a UI package outside the manifest baseline. |
| DEP.CONVENTION.001 | inspection | Project files reference only the LiteBus modules the code dispatches. |
| DEP.CONVENTION.002 | static | The generated types package declares no dependency and the client declares only `openapi-fetch`. |
| DEP.CONVENTION.003 | test | No production project references an assertion, substitution, host, container, or architecture-test package. |
| DEP.CONVENTION.004 | inspection | Each baseline package appears in the layer that the ownership table assigns. |
