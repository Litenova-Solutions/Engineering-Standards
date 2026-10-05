# .NET and React Platform Profile

## Intent


This profile selects one supported platform so architecture and coding conventions can be concrete. It combines a .NET modular monolith, PostgreSQL, Marten, LiteBus, Aspire local orchestration, and React frontends in one repository.

A React frontend takes one of three shapes, chosen by who reads it. An authenticated console is a static single-page application. A public surface whose pages are shared as links and read by a search engine renders on the server. A device client that asks one question repeatedly is a static page with no router.

Exact framework and package versions live only in `standards.manifest.json`.

## Agent Summary {#agent-summary}


- Selecting the profile applies every convention it composes. (standards/rule/profile-react.apply-the-complete-profile)
- Each frontend's rendering mode follows the audience that reads it. (standards/rule/profile-react.select-a-rendering-mode-by-audience)
- Every version resolves from the manifest. (standards/rule/profile-react.use-manifest-version-pins)
- A replacement names every provision ID it replaces. (standards/rule/profile-react.declare-replacements)

## Standards


### Apply the complete profile (standards/rule/profile-react.apply-the-complete-profile)

**Requirement:** A consumer selecting `dotnet-react` MUST apply every convention this profile composes.

**Rationale:** A consumer cannot claim the profile while silently omitting an applicable standard, because the profile is the unit of conformance.

### Select a rendering mode by audience (standards/rule/profile-react.select-a-rendering-mode-by-audience)

**Requirement:** A React frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

**Rationale:** A console is reached from the application a signed-in user already has open, so its first response has nothing to index. A public page is reached from a message or a search result, so its title and links belong in the first response. A device client asks one question over and over, so it takes a static page with no router.

**Example:** A back-office console and an internal admin console ship as static files. A public storefront runs as a Node server that hydrates in the browser. A warehouse handheld client ships as one static page.

### Use manifest version pins (standards/rule/profile-react.use-manifest-version-pins)

**Requirement:** A consumer MUST resolve every SDK, framework, NuGet, and npm version from `standards.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (standards/rule/profile-react.declare-replacements)

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
- [Persistence](../backend/persistence.md)
- [HTTP API](../backend/api.md)
- [Backend testing](../backend/testing.md)
- [Identifiers](../backend/identifiers.md)

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


### Keep the platform profile visible (standards/rule/profile-react.keep-the-platform-profile-visible)

**Default:** Name the selected profile in `standards.project.json` and the solution, frontends, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/profile-react.apply-the-complete-profile | static | `node tools/validate-standards.mjs` asserts the composition list matches the manifest profile documents. |
| standards/rule/profile-react.select-a-rendering-mode-by-audience | inspection | Each frontend entry in `standards.project.json` names a rendering mode that matches its audience. |
| standards/rule/profile-react.use-manifest-version-pins | inspection | The CI dependency check compares each resolved version against its manifest pin. |
| standards/rule/profile-react.declare-replacements | inspection | `node tools/validate-standards.mjs` resolves each declared replacement identifier to an active provision. |
| standards/rule/profile-react.keep-the-platform-profile-visible | inspection | `standards.project.json` names the profile and the root `AGENTS.md` names the solution, frontends, and commands. |