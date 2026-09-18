# Dependencies

## Intent


Project references and package ownership make the application boundary visible to the compiler. The selected profile permits direct framework types only in the layers that own them and rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}


- Project references match the declared graph. (standards/rule/workspace-dependencies.use-the-project-reference-graph)
- Domain carries no package reference. (standards/rule/workspace-dependencies.keep-domain-package-free)
- Application references only its permitted abstractions. (standards/rule/workspace-dependencies.keep-application-dependencies-narrow)
- Provider packages live only in Infrastructure. (standards/rule/workspace-dependencies.keep-providers-in-infrastructure)
- Every dependency version comes from the manifest. (standards/rule/workspace-dependencies.pin-every-dependency-centrally)
- A new package arrives with a decision and a manifest pin. (standards/rule/workspace-dependencies.approve-new-packages-explicitly)
- Frontends stay isolated from each other's source. (standards/rule/workspace-dependencies.keep-frontend-applications-isolated)
- Web UI packages come from the manifest baseline. (standards/rule/workspace-dependencies.keep-the-approved-web-ui-dependency-boundary)

## Standards


### Use the project reference graph (standards/rule/workspace-dependencies.use-the-project-reference-graph)

**Requirement:** A project reference MUST follow the graph in the table in this section and add no other edge.

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

### Keep Domain package-free (standards/rule/workspace-dependencies.keep-domain-package-free)

**Requirement:** The Domain project MUST reference no package beyond the .NET base class library.

**Rationale:** Marten, EF Core, LiteBus, ASP.NET Core, injection, serialization, and logging packages all stay outside.

### Keep Application dependencies narrow (standards/rule/workspace-dependencies.keep-application-dependencies-narrow)

**Requirement:** Application MUST reference only LiteBus command and query abstractions, required read abstractions, and Microsoft abstractions its ports need.

**Rationale:** A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide.

### Keep providers in Infrastructure (standards/rule/workspace-dependencies.keep-providers-in-infrastructure)

**Requirement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** Infrastructure is the only layer that a provider change is allowed to reach.

### Pin every dependency centrally (standards/rule/workspace-dependencies.pin-every-dependency-centrally)

**Requirement:** Every NuGet and npm version MUST resolve through central management or the committed lockfile, at the pin `standards.manifest.json` states where it states one.

**Rationale:** An inline version in a project file is invisible to the manifest that is supposed to own it.

The manifest pins the baseline stack, which is the set these standards name. A consumer also carries packages for its own product, and it cannot add those to a manifest it does not own. Those versions live in the consumer's own central file under `standards/rule/workspace-config.centralize-nuget-versions` or its lockfile, and `standards/rule/workspace-dependencies.approve-new-packages-explicitly` is what admits them.

**Example:** A consumer generating invoices pins its PDF library in `Directory.Packages.props` with a decision record. The manifest never names it, and the pin is still central.

### Approve new packages explicitly (standards/rule/workspace-dependencies.approve-new-packages-explicitly)

**Requirement:** A package absent from the manifest MUST have a decision naming its use case, alternatives, owning layer, operating cost, and removal condition.

**Rationale:** A package arrives with a cost nobody revisits, so the decision names the removal condition while the alternatives are still fresh. A baseline package lands in the manifest in the same change as its decision. A consumer-owned package lands in the consumer's central file instead, because the manifest belongs to the standards release rather than to the consumer.

### Keep frontend applications isolated (standards/rule/workspace-dependencies.keep-frontend-applications-isolated)

**Requirement:** A frontend MUST NOT import another application's source or another module's internal feature files.

**Rationale:** A shared package exposes a documented public entry point and depends on no application.

### Keep the approved web UI dependency boundary (standards/rule/workspace-dependencies.keep-the-approved-web-ui-dependency-boundary)

**Requirement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `standards.manifest.json`.

**Rationale:** That baseline pins shadcn/ui, Tailwind CSS v4, Base UI, Lucide, and the utility packages that the installed source imports directly.

## Conventions


### Reference only the LiteBus module required (standards/rule/workspace-dependencies.reference-only-the-litebus-module-required)

**Default:** Reference the LiteBus command, query, or event module that the code actually uses.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A unified application bus package pulls in contracts that the layer never dispatches.

### Keep generated packages dependency-light (standards/rule/workspace-dependencies.keep-generated-packages-dependency-light)

**Default:** Keep generated API types free of dependencies and limit the shared client to `openapi-fetch` and those types.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep test dependencies in test projects (standards/rule/workspace-dependencies.keep-test-dependencies-in-test-projects)

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A test package referenced by a production project ships to production.

### Use this baseline package ownership (standards/rule/workspace-dependencies.use-this-baseline-package-ownership)

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

| Project | Direct package groups |
|:---|:---|
| Domain | None |
| Application.Abstractions | Required LiteBus module abstractions only |
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

This informative example demonstrates `standards/rule/workspace-dependencies.keep-application-dependencies-narrow` and `standards/rule/workspace-dependencies.use-the-project-reference-graph`.

An Application query handler may inject `IQuerySession` because Marten is the selected read model. An Application command handler receives `IPostRepository`, because the Domain owns the aggregate boundary and Infrastructure owns the Marten implementation.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/workspace-dependencies.use-the-project-reference-graph | inspection | `ArchitectureTests` asserts the project reference set matches the declared graph exactly. |
| standards/rule/workspace-dependencies.keep-domain-package-free | inspection | `ArchitectureTests` asserts the Domain project declares no package reference. |
| standards/rule/workspace-dependencies.keep-application-dependencies-narrow | inspection | `ArchitectureTests` asserts the Application package set matches the permitted list. |
| standards/rule/workspace-dependencies.keep-providers-in-infrastructure | inspection | `ArchitectureTests` asserts each provider package is referenced only by Infrastructure. |
| standards/rule/workspace-dependencies.pin-every-dependency-centrally | static | The CI dependency check compares each resolved NuGet and npm version against `standards.manifest.json`. |
| standards/rule/workspace-dependencies.approve-new-packages-explicitly | inspection | The decision record names the five fields and the manifest entry lands in the same pull request. |
| standards/rule/workspace-dependencies.keep-frontend-applications-isolated | inspection | `ImportBoundaryTests` asserts no cross-application or internal-feature import exists. |
| standards/rule/workspace-dependencies.keep-the-approved-web-ui-dependency-boundary | static | `node standards/tools/validate-ui.mjs` reports a UI package outside the manifest baseline. |
| standards/rule/workspace-dependencies.reference-only-the-litebus-module-required | inspection | Project files reference only the LiteBus modules the code dispatches. |
| standards/rule/workspace-dependencies.keep-generated-packages-dependency-light | static | The generated types package declares no dependency and the client declares only `openapi-fetch`. |
| standards/rule/workspace-dependencies.keep-test-dependencies-in-test-projects | inspection | No production project references an assertion, substitution, host, container, or architecture-test package. |
| standards/rule/workspace-dependencies.use-this-baseline-package-ownership | inspection | Each baseline package appears in the layer that the ownership table assigns. |
