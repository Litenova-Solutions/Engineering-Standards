# Dependencies

## Intent


Project references and package ownership make the application boundary visible to the compiler. The selected profile permits direct framework types only in the layers that own them and rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}


- Use the project reference graph. (DEP.PROJECTS.001)
- Keep Domain package-free. (DEP.DOMAIN.001)
- Keep Application dependencies narrow. (DEP.APPLICATION.001)
- Keep providers in Infrastructure. (DEP.INFRASTRUCTURE.001)
- Pin every dependency centrally. (DEP.PINS.001)
- Approve new packages explicitly. (DEP.APPROVAL.001)
- Keep frontend applications isolated. (DEP.FRONTEND.001)
- Keep the approved web UI dependency boundary. (DEP.FRONTEND.UI.001)

## Standards


### Use the project reference graph (DEP.PROJECTS.001)

**Requirement:** Repositories MUST use the project reference graph.

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

**Requirement:** Repositories MUST keep Domain package-free.

**Rationale:** Domain uses the .NET base class library and project-owned types. It does not reference Marten, Entity Framework Core, LiteBus, ASP.NET Core, dependency injection, serialization packages, or logging packages.

### Keep Application dependencies narrow (DEP.APPLICATION.001)

**Requirement:** Repositories MUST keep Application dependencies narrow.

**Rationale:** Application can reference LiteBus command and query abstractions. It can reference Marten query abstractions required by the selected read model. Public external ports can use required Microsoft abstraction packages.

Application does not reference ASP.NET Core, provider SDKs, Infrastructure, or a full mediator metapackage.

### Keep providers in Infrastructure (DEP.INFRASTRUCTURE.001)

**Requirement:** Repositories MUST keep providers in Infrastructure.

**Rationale:** Database providers, external SDKs, HTTP resilience, service discovery, serialization adapters, and provider-specific options live in Infrastructure.

### Pin every dependency centrally (DEP.PINS.001)

**Requirement:** Repositories MUST pin every dependency centrally.

**Rationale:** NuGet and npm versions match `standards.manifest.json`. NuGet projects omit inline versions and use `Directory.Packages.props`. The workspace uses one committed `pnpm-lock.yaml` with exact resolved versions.

### Approve new packages explicitly (DEP.APPROVAL.001)

**Requirement:** Repositories MUST approve new packages explicitly.

**Rationale:** A package absent from the manifest requires a decision that names the use case, reason, alternatives, owning layer, operational cost, and removal condition. The implementation updates the manifest in the same standards or consumer override change.

Extensions may introduce only the packages listed in their dependency section and pinned by the manifest.

### Keep frontend applications isolated (DEP.FRONTEND.001)

**Requirement:** Repositories MUST keep frontend applications isolated.

**Rationale:** A frontend cannot import another application's source or another module's internal feature files. Shared packages expose a documented public entry point and cannot depend on an application.

### Keep the approved web UI dependency boundary (DEP.FRONTEND.UI.001)

**Requirement:** Repositories MUST keep the approved web UI dependency boundary.

**Rationale:** React web frontends use the `uiBaseline` in `standards.manifest.json`: shadcn/ui with Tailwind CSS v4,
Base UI, Lucide. The pinned utility packages. The direct source imports of installed shadcn
components resolve to packages pinned by the manifest. A component that imports an unlisted package
requires a decision and a manifest update before installation.

Behavior-only packages such as TanStack Table, TanStack Virtual, form state, or data fetching may be
added when a current use case activates them. Their rendered controls remain inside the shadcn/ui
boundary. A second general purpose component library or a specialist visual package requires the UI
companion exception and an explicit dependency review.

The implementation keeps `@base-ui/react` as the new-frontend primitive dependency. `radix-ui` and individual Radix packages
are compatibility dependencies for an existing Radix shadcn frontend only. They are not a reason to mix
component bases in one application. React Native dependencies follow a separate platform profile.

## Conventions


### Reference only the LiteBus module required (DEP.CONVENTION.001)

**Default:** Reference only the LiteBus module required.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses command abstractions for commands, query abstractions for queries, and event abstractions for event reaction handlers. The implementation does not add a unified application bus or a broad package when the layer needs one module.

### Keep generated packages dependency-light (DEP.CONVENTION.002)

**Default:** Keep generated packages dependency-light.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Generated API types contain types only. The shared API client may depend on `openapi-fetch` and the generated types. It does not own product state, UI behavior, or authentication policy.

### Keep test dependencies in test projects (DEP.CONVENTION.003)

**Default:** Keep test dependencies in test projects.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Assertion, substitution, test host, container, and architecture-test packages do not enter production projects.

### Use this baseline package ownership (DEP.CONVENTION.004)

**Default:** Use this baseline package ownership.

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
| DEP.PROJECTS.001 | inspection | Pull request review asserts `use the project reference graph` in the owning specification and source paths. |
| DEP.DOMAIN.001 | inspection | Pull request review asserts `keep Domain package-free` in the owning specification and source paths. |
| DEP.APPLICATION.001 | inspection | Pull request review asserts `keep Application dependencies narrow` in the owning specification and source paths. |
| DEP.INFRASTRUCTURE.001 | inspection | Pull request review asserts `keep providers in Infrastructure` in the owning specification and source paths. |
| DEP.PINS.001 | static | Repository static check asserts `pin every dependency centrally` for the owning paths. |
| DEP.APPROVAL.001 | inspection | Pull request review asserts `approve new packages explicitly` in the owning specification and source paths. |
| DEP.FRONTEND.001 | inspection | Pull request review asserts `keep frontend applications isolated` in the owning specification and source paths. |
| DEP.FRONTEND.UI.001 | static | Repository static check asserts `keep the approved web UI dependency boundary` for the owning paths. |
| DEP.CONVENTION.001 | inspection | Pull request review asserts `reference only the LiteBus module required` in the owning specification and source paths. |
| DEP.CONVENTION.002 | static | Repository static check asserts `keep generated packages dependency-light` for the owning paths. |
| DEP.CONVENTION.003 | test | An automated test citing `DEP.CONVENTION.003` asserts `keep test dependencies in test projects` at the affected boundary. |
| DEP.CONVENTION.004 | inspection | Pull request review asserts `use this baseline package ownership` in the owning specification and source paths. |
