# Dependencies

## Intent

Project references and package ownership make the application boundary visible to the compiler. Each selected stack permits direct framework types only in the layers that own them, and each project rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}

- Project references match the declared graph. (standards/rule/workspace-dependencies.use-the-project-reference-graph)
- Domain carries no package reference. (standards/rule/workspace-dependencies.keep-domain-package-free)
- Application references only its permitted abstractions. (standards/rule/workspace-dependencies.keep-application-dependencies-narrow)
- Provider packages live only in Infrastructure. (standards/rule/workspace-dependencies.keep-providers-in-infrastructure)
- Every dependency version resolves through central management or the lockfile. (standards/rule/workspace-dependencies.pin-every-dependency-centrally)
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

**Requirement:** Application MUST reference only LiteBus command and query abstractions, required read abstractions, and Microsoft abstractions its ports need. The `IQuerySession` read boundary is the one provider package this allows, assigned by the ownership table.

**Rationale:** A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide. The Requirement names the one read boundary this allows.

### Keep providers in Infrastructure (standards/rule/workspace-dependencies.keep-providers-in-infrastructure)

**Requirement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** Infrastructure is the only layer that a provider change may reach, except the `IQuerySession` read boundary the ownership table assigns to Application.

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

**Requirement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `standards.manifest.json`, and a Svelte web frontend from `uiBaselineSvelte`.

**Rationale:** Each baseline pins its design system, styling, base components, icons, and the utility packages the installed source imports directly.

## Conventions

### Reference only the LiteBus module required (standards/rule/workspace-dependencies.reference-only-the-litebus-module-required)

**Default:** Reference the LiteBus command, query, or event module that the code actually uses.

**Exception:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A unified application bus package pulls in contracts that the layer never dispatches.

### Keep generated packages dependency-light (standards/rule/workspace-dependencies.keep-generated-packages-dependency-light)

**Default:** Keep generated API types free of dependencies and limit the shared client to the pinned generator's runtime, its query plugin, and those types.

**Exception:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep test dependencies in test projects (standards/rule/workspace-dependencies.keep-test-dependencies-in-test-projects)

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Exception:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A test package referenced by a production project ships to production.

### Use this baseline package ownership (standards/rule/workspace-dependencies.use-this-baseline-package-ownership)

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Exception:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

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
| Acceptance.Tests | xUnit v3, assertions, the behaviour runner its extension selects, test host, and the report and coverage extensions |

Test projects reference xUnit v3 and run on Microsoft.Testing.Platform. The consumer `global.json` sets `"test": { "runner": "Microsoft.Testing.Platform" }`, because the .NET 10 `dotnet test` command refuses the VSTest mode for these projects.

The example adds a package to the narrowest owning project. A central version entry does not authorize every project to reference that package. Conditional packages such as EF Core, Reqnroll, LightBDD, SignalR, and WireMock are referenced only after their extension activates.

## Reference example

This informative example demonstrates `standards/rule/workspace-dependencies.keep-application-dependencies-narrow` and `standards/rule/workspace-dependencies.use-the-project-reference-graph`.

An Application query handler may inject `IQuerySession` because Marten is the selected read model. An Application command handler receives `IPostRepository`, because the Domain owns the aggregate boundary and Infrastructure owns the Marten implementation.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/workspace-dependencies.use-the-project-reference-graph | guidance | Does each project reference follow the declared graph with no added edge? |
| standards/rule/workspace-dependencies.keep-domain-package-free | guidance | Does the Domain project reference no package beyond the base class library? |
| standards/rule/workspace-dependencies.keep-application-dependencies-narrow | guidance | Does Application reference only permitted abstractions and the one read boundary? |
| standards/rule/workspace-dependencies.keep-providers-in-infrastructure | guidance | Does each provider adapter live in Infrastructure apart from the read boundary? |
| standards/rule/workspace-dependencies.pin-every-dependency-centrally | guidance | Does every version resolve through central management or the lockfile at the manifest or consumer pin? |
| standards/rule/workspace-dependencies.approve-new-packages-explicitly | guidance | Does each package outside the manifest carry a decision with use case, alternatives, layer, cost, and removal condition? |
| standards/rule/workspace-dependencies.keep-frontend-applications-isolated | guidance | Is each frontend free of imports from another application's source or internal feature files? |
| standards/rule/workspace-dependencies.keep-the-approved-web-ui-dependency-boundary | guidance | Does each React frontend take UI packages from uiBaseline and each Svelte one from uiBaselineSvelte? |
| standards/rule/workspace-dependencies.reference-only-the-litebus-module-required | guidance | Does each project reference only the LiteBus modules its code dispatches? |
| standards/rule/workspace-dependencies.keep-generated-packages-dependency-light | guidance | Does the generated types package stay dependency-free with a thin client? |
| standards/rule/workspace-dependencies.keep-test-dependencies-in-test-projects | guidance | Do production projects reference no test package? |
| standards/rule/workspace-dependencies.use-this-baseline-package-ownership | guidance | Does each baseline package sit in the layer the ownership table assigns? |
