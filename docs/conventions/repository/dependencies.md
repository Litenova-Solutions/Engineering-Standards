# Dependencies

## Intent

Project references and package ownership make the application boundary visible to the compiler. The selected profile permits direct framework types only in the layers that own them and rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}

- Keep Domain free of persistence, web, mediator, and dependency injection packages.
- Let Application reference Domain, LiteBus abstractions, and Marten query abstractions.
- Let Infrastructure implement Domain and Application boundaries.
- Keep endpoint classes dependent on Application messages and mediators.
- Resolve every package version from the manifest.
- Add an unlisted package only with an accepted decision and manifest update.

## Standards

### Use the project reference graph (DEP.PROJECTS.001)

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

Domain uses the .NET base class library and project-owned types. It does not reference Marten, Entity Framework Core, LiteBus, ASP.NET Core, dependency injection, serialization packages, or logging packages.

### Keep Application dependencies narrow (DEP.APPLICATION.001)

Application may reference LiteBus command and query abstractions, Marten query abstractions required by the selected read model, and Microsoft abstraction packages required by public capability ports.

Application does not reference ASP.NET Core, provider SDKs, Infrastructure, or a full mediator metapackage.

### Keep providers in Infrastructure (DEP.INFRASTRUCTURE.001)

Database providers, external SDKs, HTTP resilience, service discovery, serialization adapters, and provider-specific options live in Infrastructure.

### Pin every dependency centrally (DEP.PINS.001)

NuGet and npm versions match `standards.manifest.json`. NuGet projects omit inline versions and use `Directory.Packages.props`. The workspace uses one committed `pnpm-lock.yaml` with exact resolved versions.

### Approve new packages explicitly (DEP.APPROVAL.001)

A package absent from the manifest requires a decision that names the use case, reason, alternatives, owning layer, operational cost, and removal condition. Update the manifest in the same standards or consumer override change.

Extensions may introduce only the packages listed in their dependency section and pinned by the manifest.

### Keep frontend applications isolated (DEP.FRONTEND.001)

A frontend cannot import another application's source or another capability's internal feature files. Shared packages expose a documented public entry point and cannot depend on an application.

## Conventions

### Reference only the LiteBus module required

Use command abstractions for commands, query abstractions for queries, and event abstractions for reactions. Do not add a unified application bus or a broad package when the layer needs one module.

### Keep generated packages dependency-light

Generated API types contain types only. The shared API client may depend on `openapi-fetch` and the generated types. It does not own product state, UI behavior, or authentication policy.

### Keep test dependencies in test projects

Assertion, substitution, test host, container, and architecture-test packages do not enter production projects.

## Examples

An Application query handler may inject `IQuerySession` because Marten is the selected read model. An Application command handler receives `IPostRepository`, because the Domain owns the aggregate boundary and Infrastructure owns the Marten implementation.

## Verification

- Inspect every `.csproj` project and package reference.
- Compare package names and versions with the manifest.
- Run architecture tests for forbidden references.
- Confirm endpoint constructors expose no Infrastructure type.
- Confirm shared frontend packages do not import application source.
