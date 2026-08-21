# .NET and Blazor Client Platform Profile

## Intent

This profile selects one supported platform for a product that has no server of its own. It combines a .NET client-side domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static output.

The `dotnet-nextjs` profile assumes a running ASP.NET Core application with PostgreSQL, Marten, and an HTTP API. A product whose whole behavior runs in the browser cannot satisfy those conventions. This profile names the excluded baselines and replaces them.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}

- Selecting the profile activates every composed convention. (PLATFORM.BLAZOR.COMPOSITION.001)
- Each excluded baseline is named with its reason. (PLATFORM.BLAZOR.SCOPE.001)
- The client publishes as static WebAssembly with no server render mode. (PLATFORM.BLAZOR.RENDERING.001)
- Versions resolve from the manifest. (PLATFORM.BLAZOR.VERSION.001)
- A replacement names every rule identifier it replaces. (PLATFORM.BLAZOR.REPLACEMENT.001)
- Verification runs through the .NET toolchain. (PLATFORM.BLAZOR.CONVENTION.002)
- Operating Limits records a first-load budget. (PLATFORM.BLAZOR.CONVENTION.003)

## Standards

### Apply the complete profile (PLATFORM.BLAZOR.COMPOSITION.001)

**Requirement:** A consumer selecting `dotnet-blazor` MUST apply every convention this profile composes.

**Rationale:** The profile is the unit of conformance, so a consumer cannot claim it while omitting an applicable standard.

### List excluded baselines (PLATFORM.BLAZOR.SCOPE.001)

**Requirement:** This profile MUST name each excluded baseline document and the reason it does not apply.

**Rationale:** A consumer inherits the exclusions by selecting the profile and restates none of them. Silent omission remains a violation. A consumer that later adds a server moves to `dotnet-nextjs` rather than re-including individual documents.

**Example:** These `dotnet-nextjs` conventions do not apply, because each requires a server, a database, or an HTTP boundary.

| Excluded document | Reason |
|:---|:---|
| `conventions/backend/persistence-marten.md` | No database. Replaced by browser persistence. |
| `conventions/backend/api.md` | No HTTP surface, actor claims, Problem Details, paging, or OpenAPI. |
| `conventions/frontend/structure.md` | Next.js application tree. Replaced by client structure. |
| `conventions/frontend/rendering.md` | Next.js routing and render modes. Replaced by client rendering. |
| `conventions/frontend/components.md` | React and shadcn/ui components. Replaced by client components. |
| `conventions/frontend/data-and-state.md` | Server functions and fetch data access. Replaced by client data and state. |
| `conventions/frontend/testing.md` | Vitest and React Testing Library. Replaced by client testing. |

Backend architecture, domain, and application conventions are not excluded, because a client application still has both layers. Operations conventions apply in reduced form: health endpoints, schema review, backup, and restore have no target, while diagnostics, bounded metrics, and Operating Limits still apply.

### Publish static WebAssembly output (PLATFORM.BLAZOR.RENDERING.001)

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Blazor Server, interactive server rendering, and prerendering each remove offline operation and reintroduce a server, so all three are outside this profile.

### Use manifest version pins (PLATFORM.BLAZOR.VERSION.001)

**Requirement:** A consumer MUST resolve every SDK, framework, and NuGet version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (PLATFORM.BLAZOR.REPLACEMENT.001)

**Requirement:** An extension or consumer override MUST name every baseline rule identifier it replaces.

**Rationale:** Unrelated profile standards then stay active, so a replacement cannot silently widen its own scope.

## Composition

### Workspace

- [Workspace structure](../conventions/workspace/structure.md)
- [Naming and code style](../conventions/workspace/naming.md)
- [Dependencies](../conventions/workspace/dependencies.md)
- [Configuration](../conventions/workspace/configuration.md)
- [Authoring standard](../foundations/authoring-standard.md)

### Application core

- [Architecture](../conventions/backend/architecture.md)
- [Domain](../conventions/backend/domain.md)
- [Application](../conventions/backend/application.md)

### Client

- [Client structure](../conventions/frontend-blazor/structure.md)
- [Client rendering and routes](../conventions/frontend-blazor/rendering.md)
- [Client components](../conventions/frontend-blazor/components.md)
- [Client data and state](../conventions/frontend-blazor/data-and-state.md)
- [Browser persistence](../conventions/frontend-blazor/persistence-browser.md)
- [Client testing](../conventions/frontend-blazor/testing.md)

### Quality and operations

- [Security](../conventions/quality/security.md)
- [Operations](../conventions/quality/operations.md)
- [Continuous integration](../conventions/quality/ci.md)

## Conventions

### Keep the platform profile visible (PLATFORM.BLAZOR.CONVENTION.001)

**Default:** Name `dotnet-blazor` in `standards.project.json` and the solution, client application, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

### Verify with the .NET toolchain (PLATFORM.BLAZOR.CONVENTION.002)

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client application has no Node build step. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget (PLATFORM.BLAZOR.CONVENTION.003)

**Default:** Record the compressed transfer size of the framework payload as a first-load budget in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything. Directory size does not describe what a visitor waits for.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| PLATFORM.BLAZOR.COMPOSITION.001 | static | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| PLATFORM.BLAZOR.SCOPE.001 | inspection | The excluded-baseline table names every omitted document and its reason. |
| PLATFORM.BLAZOR.RENDERING.001 | test | `PublishOutputTests` asserts the published output contains no server assembly or server render mode. |
| PLATFORM.BLAZOR.VERSION.001 | static | The CI dependency check compares each resolved version against its pin in `standards.manifest.json`. |
| PLATFORM.BLAZOR.REPLACEMENT.001 | static | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| PLATFORM.BLAZOR.CONVENTION.001 | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution and commands. |
| PLATFORM.BLAZOR.CONVENTION.002 | test | The CI client job runs `dotnet build` and `dotnet test` against the client solution. |
| PLATFORM.BLAZOR.CONVENTION.003 | operation | Operating Limits records the budget and CI compares published transfer size against it. |
