# .NET and Next.js Platform Profile

## Intent


This profile selects one supported platform so architecture and coding conventions can be concrete. It combines a .NET modular monolith, PostgreSQL, Marten, LiteBus, Aspire local orchestration, and optional Next.js frontends in one repository.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}


- Apply the complete profile. (PROFILE.COMPOSITION.001)
- Use manifest version pins. (PROFILE.VERSIONS.001)
- Declare replacements. (PROFILE.REPLACEMENT.001)

## Standards


### Apply the complete profile (PROFILE.COMPOSITION.001)

**Requirement:** Consumers MUST apply the complete profile.

**Rationale:** Selecting `dotnet-nextjs` activates every baseline convention listed in this document. Consumers cannot claim the profile while silently omitting an applicable standard.

### Use manifest version pins (PROFILE.VERSIONS.001)

**Requirement:** Consumers MUST use manifest version pins.

**Rationale:** Consumers resolve SDK, framework, NuGet, and npm versions from `standards.manifest.json`. The implementation does not copy a version from prose, an example, package search results, or agent memory.

### Declare replacements (PROFILE.REPLACEMENT.001)

**Requirement:** Consumers MUST declare replacements.

**Rationale:** An extension or consumer override may replace a baseline choice only when it names every affected rule ID. Unrelated profile standards remain active.

## Composition

### Repository

- [Repository structure](../conventions/repository/structure.md)
- [Naming and code style](../conventions/repository/naming.md)
- [Dependencies](../conventions/repository/dependencies.md)
- [Configuration](../conventions/repository/configuration.md)
- [Authoring standard](../foundations/authoring-standard.md)

### Backend

- [Architecture](../conventions/backend/architecture.md)
- [Domain](../conventions/backend/domain.md)
- [Application](../conventions/backend/application.md)
- [Marten persistence](../conventions/backend/persistence-marten.md)
- [HTTP API](../conventions/backend/api.md)

### Frontend

- [Frontend structure](../conventions/frontend/structure.md)
- [Rendering and routes](../conventions/frontend/rendering.md)
- [Components and UI](../conventions/frontend/components.md)
- [Controlled UI governance](../conventions/frontend/ui-governance.md)
- [Data, forms, and state](../conventions/frontend/data-and-state.md)
- [Frontend testing](../conventions/frontend/testing.md)

### Quality and operations

- [Backend testing](../conventions/quality/backend-testing.md)
- [Security](../conventions/quality/security.md)
- [Operations](../conventions/quality/operations.md)
- [Continuous integration](../conventions/quality/ci.md)

## Conventions


### Keep the platform profile visible (PROFILE.CONVENTION.001)

**Default:** Keep the platform profile visible.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Consumer `standards.project.json` names `dotnet-nextjs`. The root `AGENTS.md` identifies the .NET solution name, frontend app names, and commands that substitute project placeholders.

### Note known toolchain interactions (PROFILE.CONVENTION.002)

**Default:** Note known toolchain interactions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The pinned ESLint 10 removed context APIs (for example `context.getFilename()`) that `eslint-plugin-react` still calls during runtime React version detection. A Next flat config that leaves the React version at `detect` throws `contextOrFilename.getFilename is not a function` until the plugin ships ESLint 10 support. The implementation sets a concrete `settings.react.version` in the flat config to skip detection, which is the current workaround and good practice regardless. If a consumer cannot pin the version, hold ESLint at the latest 9.x release until the plugin is compatible. Re-evaluate this note when the pins advance.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| PROFILE.COMPOSITION.001 | inspection | Pull request review asserts `apply the complete profile` in the owning specification and source paths. |
| PROFILE.VERSIONS.001 | inspection | Pull request review asserts `use manifest version pins` in the owning specification and source paths. |
| PROFILE.REPLACEMENT.001 | inspection | Pull request review asserts `declare replacements` in the owning specification and source paths. |
| PROFILE.CONVENTION.001 | inspection | Pull request review asserts `keep the platform profile visible` in the owning specification and source paths. |
| PROFILE.CONVENTION.002 | inspection | Pull request review asserts `note known toolchain interactions` in the owning specification and source paths. |
