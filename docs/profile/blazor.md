# .NET and Blazor Platform Profile

## Intent

This profile selects one supported platform for a product that has no server of its own. It combines a .NET client-side domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static output.

The `dotnet-nextjs` profile assumes a running ASP.NET Core application with PostgreSQL, Marten, and an HTTP API. A product whose whole behavior runs in the browser cannot satisfy those conventions. This profile names the excluded baselines and replaces them.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}

- Selecting the profile activates every composed convention. (PROFILE.BLAZOR.COMPOSITION.001)
- Each excluded baseline is named with its reason. (PROFILE.BLAZOR.SCOPE.001)
- The client publishes as static WebAssembly with no server render mode. (PROFILE.BLAZOR.RENDERING.001)
- Versions resolve from the manifest. (PROFILE.BLAZOR.VERSION.001)
- A replacement names every provision ID it replaces. (PROFILE.BLAZOR.REPLACEMENT.001)
- Verification runs through the .NET toolchain. (PROFILE.BLAZOR.CONVENTION.002)
- Operating Limits records a first-load budget. (PROFILE.BLAZOR.CONVENTION.003)

## Standards

### Apply the complete profile (PROFILE.BLAZOR.COMPOSITION.001)

**Requirement:** A consumer selecting `dotnet-blazor` MUST apply every convention this profile composes.

**Rationale:** The profile is the unit of conformance, so a consumer cannot claim it while omitting an applicable standard.

### List excluded baselines (PROFILE.BLAZOR.SCOPE.001)

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

### Publish static WebAssembly output (PROFILE.BLAZOR.RENDERING.001)

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Blazor Server, interactive server rendering, and prerendering each remove offline operation and reintroduce a server, so all three are outside this profile.

### Use manifest version pins (PROFILE.BLAZOR.VERSION.001)

**Requirement:** A consumer MUST resolve every SDK, framework, and NuGet version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (PROFILE.BLAZOR.REPLACEMENT.001)

**Requirement:** An extension or consumer override MUST name every baseline provision ID it replaces.

**Rationale:** Unrelated profile standards then stay active, so a replacement cannot silently widen its own scope.

## Composition

### Workspace

- [Workspace structure](../workspace/structure.md)
- [Naming and code style](../workspace/naming.md)
- [Dependencies](../workspace/dependencies.md)
- [Configuration](../workspace/config.md)
- [Authoring standard](../core/authoring.md)

### Application core

- [Architecture](../backend/architecture.md)
- [Domain](../backend/domain.md)
- [Application](../backend/application.md)

### Client

- [Blazor structure](../blazor/structure.md)
- [Blazor rendering and routes](../blazor/rendering.md)
- [Blazor components](../blazor/components.md)
- [Blazor data and state](../blazor/data.md)
- [Browser persistence](../blazor/browser.md)
- [Blazor testing](../blazor/testing.md)

### Quality and operations

- [Security](../quality/security.md)
- [Operations](../quality/operations.md)
- [Continuous integration](../quality/ci.md)

## Conventions

### Keep the platform profile visible (PROFILE.BLAZOR.CONVENTION.001)

**Default:** Name `dotnet-blazor` in `standards.project.json` and the solution, client application, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

### Verify with the .NET toolchain (PROFILE.BLAZOR.CONVENTION.002)

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client application has no Node build step. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget (PROFILE.BLAZOR.CONVENTION.003)

**Default:** Record the compressed transfer size of the framework payload as a first-load budget in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything. Directory size does not describe what a visitor waits for.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| PROFILE.BLAZOR.COMPOSITION.001 | static | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| PROFILE.BLAZOR.SCOPE.001 | inspection | The excluded-baseline table names every omitted document and its reason. |
| PROFILE.BLAZOR.RENDERING.001 | test | `PublishOutputTests` asserts the published output contains no server assembly or server render mode. |
| PROFILE.BLAZOR.VERSION.001 | static | The CI dependency check compares each resolved version against its pin in `standards.manifest.json`. |
| PROFILE.BLAZOR.REPLACEMENT.001 | static | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| PROFILE.BLAZOR.CONVENTION.001 | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution and commands. |
| PROFILE.BLAZOR.CONVENTION.002 | test | The CI client job runs `dotnet build` and `dotnet test` against the client solution. |
| PROFILE.BLAZOR.CONVENTION.003 | operation | Operating Limits records the budget and CI compares published transfer size against it. |
