# .NET and Next.js Platform Profile

## Intent


This profile selects one supported platform so architecture and coding conventions can be concrete. It combines a .NET modular monolith, PostgreSQL, Marten, LiteBus, Aspire local orchestration, and optional Next.js frontends in one repository.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}


- Selecting the profile applies every convention it composes. (PROFILE.NEXTJS.COMPOSITION.001)
- Every version resolves from the manifest. (PROFILE.NEXTJS.VERSION.001)
- A replacement names every provision ID it replaces. (PROFILE.NEXTJS.REPLACEMENT.001)

## Standards


### Apply the complete profile (PROFILE.NEXTJS.COMPOSITION.001)

**Requirement:** A consumer selecting `dotnet-nextjs` MUST apply every convention this profile composes.

**Rationale:** A consumer cannot claim the profile while silently omitting an applicable standard, because the profile is the unit of conformance.

### Use manifest version pins (PROFILE.NEXTJS.VERSION.001)

**Requirement:** A consumer MUST resolve every SDK, framework, NuGet, and npm version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (PROFILE.NEXTJS.REPLACEMENT.001)

**Requirement:** An extension or consumer override MUST name every baseline provision ID it replaces.

**Rationale:** Unrelated profile standards then stay active, so a replacement cannot silently widen its own scope.

## Composition

### Workspace

- [Workspace structure](../workspace/structure.md)
- [Naming and code style](../workspace/naming.md)
- [Dependencies](../workspace/dependencies.md)
- [Configuration](../workspace/config.md)
- [Authoring standard](../core/authoring.md)

### Backend

- [Architecture](../backend/architecture.md)
- [Domain](../backend/domain.md)
- [Application](../backend/application.md)
- [Marten persistence](../backend/persistence.md)
- [HTTP API](../backend/api.md)
- [Backend testing](../backend/testing.md)

### Frontend

- [Frontend structure](../frontend/structure.md)
- [Rendering and routes](../frontend/rendering.md)
- [Frontend components](../frontend/components.md)
- [Controlled UI governance](../frontend/ui.md)
- [Data, forms, and state](../frontend/data.md)
- [Frontend testing](../frontend/testing.md)

### Quality and operations

- [Security](../quality/security.md)
- [Operations](../quality/operations.md)
- [Continuous integration](../quality/ci.md)

## Conventions


### Keep the platform profile visible (PROFILE.NEXTJS.CONVENTION.001)

**Default:** Name the selected profile in `standards.project.json` and the solution, frontends, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| PROFILE.NEXTJS.COMPOSITION.001 | inspection | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| PROFILE.NEXTJS.VERSION.001 | inspection | The CI dependency check compares each resolved version against its manifest pin. |
| PROFILE.NEXTJS.REPLACEMENT.001 | inspection | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| PROFILE.NEXTJS.CONVENTION.001 | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution, frontends, and commands. |
