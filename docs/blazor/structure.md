# Blazor Structure

## Intent

The client is one Blazor WebAssembly application organized around the same business modules and use cases as the Domain. Pages compose features, feature folders own behavior, and shared folders hold only code with real cross-feature use.

## Agent Summary {#agent-summary}

- The solution holds four production projects and no server project. (standards/rule/blazor-structure.use-the-client-solution-tree)
- Features sit under their module and use-case names. (standards/rule/blazor-structure.organize-features-by-module-and-use-case)
- A module never reaches into another module's feature internals. (standards/rule/blazor-structure.isolate-module-internals)
- Imports run from pages inward, never outward. (standards/rule/blazor-structure.keep-imports-directional)
- Domain and Application carry no browser type. (standards/rule/blazor-structure.keep-domain-free-of-browser-concerns)

## Standards

### Use the client solution tree (standards/rule/blazor-structure.use-the-client-solution-tree)

**Requirement:** A client solution MUST contain Domain, Application, Infrastructure, and Web production projects and no server project.

**Rationale:** This replaces the `apps/api/` solution path in the workspace structure convention, because a client-only consumer has no API directory.

**Example:**

```text
apps/web/
  {ProjectName}.slnx
  src/
    {ProjectName}.Domain/
    {ProjectName}.Application/
    {ProjectName}.Infrastructure/
    {ProjectName}.Web/
      Features/
      Pages/
      Layout/
      Components/
      wwwroot/
  tests/
    {ProjectName}.Domain.Tests/
    {ProjectName}.Application.Tests/
    {ProjectName}.Web.Tests/
    {ProjectName}.EndToEnd.Tests/
```

Framework-generated `bin`, `obj`, and publish folders remain untracked.

### Organize features by module and use case (standards/rule/blazor-structure.organize-features-by-module-and-use-case)

**Requirement:** A feature MUST live under `Features/{Module}/{UseCase}/` using the module and use-case names its specification declares.

**Rationale:** The client tree then matches the specification tree and the Application folders.

### Isolate module internals (standards/rule/blazor-structure.isolate-module-internals)

**Requirement:** A module MUST NOT reference another module's internal feature types.

**Rationale:** Page composition may still render public components from several modules when the page needs them. Shared code moves to `Components/` only after two real consumers need the same responsibility.

### Keep imports directional (standards/rule/blazor-structure.keep-imports-directional)

**Requirement:** A reference MUST point from pages to features to components and Application, and from Infrastructure inward.

**Rationale:** Domain references nothing and Application references only Domain. A feature reaches Infrastructure through an interface that Application owns.

**Example:**

```text
Pages -> Features -> Components and Application -> Domain
Infrastructure -> Application and Domain
```

### Keep Domain free of browser concerns (standards/rule/blazor-structure.keep-domain-free-of-browser-concerns)

**Requirement:** Domain and Application MUST contain no interop, component, HTTP, browser storage, render-loop timer, or document object model type.

**Rationale:** This mirrors the baseline rule that Domain carries no persistence or web package, so the core stays testable without a browser.

## Conventions

### Place interop adapters together (standards/rule/blazor-structure.place-interop-adapters-together)

**Default:** Place browser API wrappers in `{ProjectName}.Infrastructure/Interop/`, one type per API surface.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each wrapper implements an interface declared in Application. The static scripts they call live in `{ProjectName}.Web/wwwroot/interop/` with matching names.

### Keep static content out of the assembly (standards/rule/blazor-structure.keep-static-content-out-of-the-assembly)

**Default:** Serve generated runtime content from `wwwroot/` and fetch it rather than embedding it as a resource.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A content change then requires no rebuild of the application assembly.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/blazor-structure.use-the-client-solution-tree | test | `ClientSolutionTests` asserts four production projects exist and no server project is present. |
| standards/rule/blazor-structure.organize-features-by-module-and-use-case | test | `ClientArchitectureTests` asserts each feature path resolves to a declared module and use case. |
| standards/rule/blazor-structure.isolate-module-internals | test | `ClientArchitectureTests` asserts no cross-module reference resolves an internal feature type. |
| standards/rule/blazor-structure.keep-imports-directional | test | `ClientArchitectureTests` asserts the project reference graph matches the declared direction. |
| standards/rule/blazor-structure.keep-domain-free-of-browser-concerns | test | `ClientArchitectureTests` asserts Domain and Application reference no browser or interop type. |
| standards/rule/blazor-structure.place-interop-adapters-together | inspection | Interop review locates each adapter and its matching script, or records a named local replacement. |
| standards/rule/blazor-structure.keep-static-content-out-of-the-assembly | inspection | Published output serves runtime content from `wwwroot/` rather than an embedded resource. |
