# Backend Architecture

## Intent

The backend is a four-project modular monolith. Project boundaries separate business rules, use-case coordination, technical adapters, and HTTP hosting without splitting each concern into a separate assembly.

CQRS separates write and read behavior inside one Application project. Capabilities and use cases provide the internal navigation boundary.

## Agent Summary {#agent-summary}

- Use Domain, Application, Infrastructure, and WebApi as the four application projects.
- Point project references inward through Domain and Application.
- Organize Domain, Application, Infrastructure, and WebApi by the same business capabilities.
- Keep handlers and validators internal; expose only contracts required across project boundaries.
- Add Worker only for a process that must run independently of HTTP requests.
- Enforce boundaries with project references and architecture tests.

## Standards

### Use four application projects (ARCH.PROJECTS.001)

Create:

```text
apps/api/src/{ProjectName}.Domain/
apps/api/src/{ProjectName}.Application/
apps/api/src/{ProjectName}.Infrastructure/
apps/api/src/{ProjectName}.WebApi/
```

`AppHost` and `ServiceDefaults` support local hosting and diagnostics. They are hosts, not application layers.

### Point dependencies inward (ARCH.DEPENDENCIES.001)

Domain contains business rules and owns no outer-layer dependency. Application coordinates Domain. Infrastructure implements Domain and Application boundaries. WebApi translates HTTP and composes the process.

Follow the exact project reference matrix in [Dependencies](../repository/dependencies.md).

### Keep one Application assembly (ARCH.APPLICATION.001)

Commands, queries, results, validators, handlers, event reactions, and external capability ports live in one capability-first Application project.

Separate Write, Read, Contracts, and Reactions assemblies are outside this profile.

### Organize every layer by capability and use case (ARCH.CAPABILITIES.001)

Use the same business capability names across layers. Application operation folders contain one command or query and its supporting types.

Do not create project-wide `Commands`, `Queries`, `Handlers`, `Validators`, or `Services` folders.

### Keep implementation types internal (ARCH.VISIBILITY.001)

Handlers, validators, persistence implementations, and endpoint implementations are `internal sealed`. Messages, results, assembly markers, and ports may be public when another project must use them.

An Infrastructure implementation requires a public Domain or Application interface. Do not expose a handler to make assembly scanning easier.

### Keep business invariants in Domain (ARCH.DOMAIN.001)

Aggregates and value objects enforce state transitions and invariants. Command handlers coordinate loading, calling domain behavior, and staging. They do not reproduce aggregate rules.

### Separate command and query behavior (ARCH.CQRS.001)

Commands mutate aggregates through repositories. Queries project read results through `IQuerySession`. A query does not load an aggregate for presentation, and a command does not use a read projection to enforce an aggregate invariant.

### Add Worker only for an independent process boundary (ARCH.WORKER.001)

Create `{ProjectName}.Worker` for durable outbox dispatch, queue consumption, or scheduled work that must continue without WebApi. Short best-effort post-commit reactions may remain inside the WebApi process.

### Test structural boundaries (ARCH.ENFORCEMENT.001)

Architecture.Tests verify project references, forbidden package dependencies, handler visibility, endpoint isolation, capability folder rules, and extension-specific boundaries.

## Conventions

### Use mirrored capability folders

```text
Domain/Posts/
Application/Posts/CreateDraft/
Infrastructure/Posts/
WebApi/Endpoints/Posts/CreateDraft/
```

The folder names identify one business capability even though each layer owns different responsibilities.

### Keep composition in hosts

`Program.cs` and host registration modules connect Application abstractions to Infrastructure implementations. Domain and Application do not call service registration.

### Use one public assembly marker per scanned project

Expose a `public static` marker such as `ApplicationAssemblyMarker` when LiteBus or another approved scanner needs an assembly reference. Keep scanned handlers internal.

## Examples

Publishing a post follows this direction:

1. WebApi maps the HTTP request to `PublishPostCommand`.
2. Application loads `Post` through `IPostRepository`.
3. Domain `Post.Publish` enforces publication rules and raises `PostPublished`.
4. Infrastructure stages and commits the document through the command pipeline.
5. A post-commit reaction handles the event according to its delivery requirement.

## Verification

- Inspect the solution project list and reference graph.
- Confirm folders use business capability names.
- Confirm handlers, validators, endpoints, and persistence implementations are internal sealed.
- Confirm commands and queries use their prescribed persistence boundaries.
- Run Architecture.Tests.
