# .NET and Blazor Platform Profile

## Intent

This profile selects one supported platform for a product that has no server of its own. It combines a .NET client-side domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static output.

The `dotnet-nextjs` profile assumes a running ASP.NET Core application with PostgreSQL, Marten, and an HTTP API. A product whose whole behavior runs in the browser cannot satisfy those conventions. This profile names the excluded baselines and replaces them.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}

- Selecting the profile activates every composed convention. (standards/rule/profile-blazor.apply-the-complete-profile)
- Each excluded baseline is named with its reason. (standards/rule/profile-blazor.list-excluded-baselines)
- The client publishes as static WebAssembly with no server render mode. (standards/rule/profile-blazor.publish-static-webassembly-output)
- Versions resolve from the manifest. (standards/rule/profile-blazor.use-manifest-version-pins)
- A replacement names every provision ID it replaces. (standards/rule/profile-blazor.declare-replacements)
- Verification runs through the .NET toolchain. (standards/rule/profile-blazor.verify-with-the-net-toolchain)
- Operating Limits records a first-load budget. (standards/rule/profile-blazor.record-a-first-load-budget)

## Standards

### Apply the complete profile (standards/rule/profile-blazor.apply-the-complete-profile)

**Requirement:** A consumer selecting `dotnet-blazor` MUST apply every convention this profile composes.

**Rationale:** The profile is the unit of conformance, so a consumer cannot claim it while omitting an applicable standard.

### List excluded baselines (standards/rule/profile-blazor.list-excluded-baselines)

**Requirement:** This profile MUST name each excluded baseline document and the reason it does not apply.

**Rationale:** A consumer inherits the exclusions by selecting the profile and restates none of them. Silent omission remains a violation. A consumer that later adds a server moves to `dotnet-nextjs` rather than re-including individual documents.

**Example:** These `dotnet-nextjs` conventions do not apply, because each requires a server, a database, or an HTTP boundary.

| Excluded document | Reason |
|:---|:---|
| `backend/persistence.md` | No database. Replaced by browser persistence. |
| `backend/api.md` | No HTTP surface, actor claims, Problem Details, paging, or OpenAPI. |
| `frontend/structure.md` | Next.js application tree. Replaced by Blazor structure. |
| `frontend/rendering.md` | Next.js routing and render modes. Replaced by Blazor rendering. |
| `frontend/components.md` | React and shadcn/ui components. Replaced by Blazor components. |
| `frontend/data.md` | Server functions and fetch data access. Replaced by Blazor data and state. |
| `frontend/testing.md` | Vitest and React Testing Library. Replaced by Blazor testing. |

Backend architecture, domain, and application conventions are not excluded, because a client application still has both layers. Operations conventions apply in reduced form: health endpoints, schema review, backup, and restore have no target, while diagnostics, bounded metrics, and Operating Limits still apply.

### Publish static WebAssembly output (standards/rule/profile-blazor.publish-static-webassembly-output)

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Blazor Server, interactive server rendering, and prerendering each remove offline operation and reintroduce a server, so all three are outside this profile.

### Use manifest version pins (standards/rule/profile-blazor.use-manifest-version-pins)

**Requirement:** A consumer MUST resolve every SDK, framework, and NuGet version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (standards/rule/profile-blazor.declare-replacements)

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

### Blazor

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

### Keep the platform profile visible (standards/rule/profile-blazor.keep-the-platform-profile-visible)

**Default:** Name `dotnet-blazor` in `standards.project.json` and the solution, client application, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

### Verify with the .NET toolchain (standards/rule/profile-blazor.verify-with-the-net-toolchain)

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client application has no Node build step. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget (standards/rule/profile-blazor.record-a-first-load-budget)

**Default:** Record the compressed transfer size of the framework payload as a first-load budget in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything. Directory size does not describe what a visitor waits for.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/profile-blazor.apply-the-complete-profile | static | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| standards/rule/profile-blazor.list-excluded-baselines | inspection | The excluded-baseline table names every omitted document and its reason. |
| standards/rule/profile-blazor.publish-static-webassembly-output | test | `PublishOutputTests` asserts the published output contains no server assembly or server render mode. |
| standards/rule/profile-blazor.use-manifest-version-pins | static | The CI dependency check compares each resolved version against its pin in `standards.manifest.json`. |
| standards/rule/profile-blazor.declare-replacements | static | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| standards/rule/profile-blazor.keep-the-platform-profile-visible | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution and commands. |
| standards/rule/profile-blazor.verify-with-the-net-toolchain | test | The CI client job runs `dotnet build` and `dotnet test` against the client solution. |
| standards/rule/profile-blazor.record-a-first-load-budget | operation | Operating Limits records the budget and CI compares published transfer size against it. |
