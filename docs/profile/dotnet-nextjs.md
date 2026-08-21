# .NET and Next.js Platform Profile

## Intent


This profile selects one supported platform so architecture and coding conventions can be concrete. It combines a .NET modular monolith, PostgreSQL, Marten, LiteBus, Aspire local orchestration, and optional Next.js frontends in one repository.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}


- Selecting the profile applies every convention it composes. (PLATFORM.NEXTJS.COMPOSITION.001)
- Every version resolves from the manifest. (PLATFORM.NEXTJS.VERSIONS.001)
- A replacement names every rule identifier it replaces. (PLATFORM.NEXTJS.REPLACEMENT.001)

## Standards


### Apply the complete profile (PLATFORM.NEXTJS.COMPOSITION.001)

**Requirement:** A consumer selecting `dotnet-nextjs` MUST apply every convention this profile composes.

**Rationale:** A consumer cannot claim the profile while silently omitting an applicable standard, because the profile is the unit of conformance.

### Use manifest version pins (PLATFORM.NEXTJS.VERSIONS.001)

**Requirement:** A consumer MUST resolve every SDK, framework, NuGet, and npm version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (PLATFORM.NEXTJS.REPLACEMENT.001)

**Requirement:** An extension or consumer override MUST name every baseline rule identifier it replaces.

**Rationale:** Unrelated profile standards then stay active, so a replacement cannot silently widen its own scope.

## Composition

### Workspace

- [Workspace structure](../conventions/workspace/structure.md)
- [Naming and code style](../conventions/workspace/naming.md)
- [Dependencies](../conventions/workspace/dependencies.md)
- [Configuration](../conventions/workspace/configuration.md)
- [Authoring standard](../foundations/authoring-standard.md)

### Backend

- [Architecture](../conventions/backend/architecture.md)
- [Domain](../conventions/backend/domain.md)
- [Application](../conventions/backend/application.md)
- [Marten persistence](../conventions/backend/persistence-marten.md)
- [HTTP API](../conventions/backend/api.md)
- [Backend testing](../conventions/backend/testing.md)

### Frontend

- [Frontend structure](../conventions/frontend/structure.md)
- [Rendering and routes](../conventions/frontend/rendering.md)
- [Components and UI](../conventions/frontend/components.md)
- [Controlled UI governance](../conventions/frontend/ui-governance.md)
- [Data, forms, and state](../conventions/frontend/data-and-state.md)
- [Frontend testing](../conventions/frontend/testing.md)

### Quality and operations

- [Security](../conventions/quality/security.md)
- [Operations](../conventions/quality/operations.md)
- [Continuous integration](../conventions/quality/ci.md)

## Conventions


### Keep the platform profile visible (PLATFORM.NEXTJS.CONVENTION.001)

**Default:** Name the selected profile in `standards.project.json` and the solution, frontends, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| PLATFORM.NEXTJS.COMPOSITION.001 | inspection | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| PLATFORM.NEXTJS.VERSIONS.001 | inspection | The CI dependency check compares each resolved version against its manifest pin. |
| PLATFORM.NEXTJS.REPLACEMENT.001 | inspection | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| PLATFORM.NEXTJS.CONVENTION.001 | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution, frontends, and commands. |
