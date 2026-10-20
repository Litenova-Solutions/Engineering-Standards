# Blazor Structure

## Intent

The client is one Blazor WebAssembly application organized around the same business modules and use cases as the Domain. Pages compose features, feature folders own behavior, and shared folders hold only code with real cross-feature use.

## Agent Summary {#agent-summary}

- The solution holds four production projects and no server project. (litespec/frontend/blazor/structure#use-the-client-solution-tree)
- Features sit under their module and use-case names. (litespec/frontend/blazor/structure#organize-features-by-module-and-use-case)
- A module never reaches into another module's feature internals. (litespec/frontend/blazor/structure#isolate-module-internals)
- Imports run from pages inward, never outward. (litespec/frontend/blazor/structure#keep-imports-directional)
- Domain and Application carry no browser type. (litespec/frontend/blazor/structure#keep-domain-free-of-browser-concerns)
- Each browser API sits behind one interop adapter. (litespec/frontend/blazor/structure#place-interop-adapters-together)
- Runtime content is served from `wwwroot/`, not embedded. (litespec/frontend/blazor/structure#keep-static-content-out-of-the-assembly)

## Standards

### Use the client solution tree

**Requirement:** A client solution MUST contain Domain, Application, Infrastructure, and Web production projects and no server project.

**Rationale:** This replaces the API solution path in `litespec/workspace/structure#use-the-canonical-root-tree`, because a client-only consumer has no API directory.

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

### Organize features by module and use case

**Requirement:** A feature MUST live under `Features/{Module}/{UseCase}/` using the module and use-case names its specification declares.

**Rationale:** The client tree then matches the specification tree and the Application folders. This realizes litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case.

### Isolate module internals

**Requirement:** A module MUST NOT reference another module's internal feature types.

**Rationale:** Page composition may still render public components from several modules when the page needs them. Shared code moves to `Components/` only after two real consumers need the same responsibility.

### Keep imports directional

**Requirement:** A reference MUST point from pages to features to components and Application, and from Infrastructure inward.

**Rationale:** Domain references nothing and Application references only Domain. A feature reaches Infrastructure through an interface that Application owns. This realizes litespec/frontend/structure#order-imports-from-routes-to-shared-packages.

**Example:**

```text
Pages -> Features -> Components and Application -> Domain
Infrastructure -> Application and Domain
```

### Keep Domain free of browser concerns

**Requirement:** Domain and Application MUST contain no interop, component, HTTP, browser storage, render-loop timer, or document object model type.

**Rationale:** This mirrors the baseline rule that Domain carries no persistence or web package, so the core stays testable without a browser.

## Conventions

### Place interop adapters together

**Default:** Place browser API wrappers in `{ProjectName}.Infrastructure/Interop/`, one type per API surface.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each wrapper implements an interface declared in Application. The static scripts they call live in `{ProjectName}.Web/wwwroot/interop/` with matching names. This realizes litespec/frontend/structure#locate-cross-route-values-in-the-frame.

### Keep static content out of the assembly

**Default:** Serve generated runtime content from `wwwroot/` and fetch it rather than embedding it as a resource.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A content change then requires no rebuild of the application assembly.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/structure#use-the-client-solution-tree | guidance | Do four production projects exist, with no server project? |
| litespec/frontend/blazor/structure#organize-features-by-module-and-use-case | guidance | Does each feature path resolve to a declared module and use case? |
| litespec/frontend/blazor/structure#isolate-module-internals | guidance | Does any cross-module reference resolve an internal feature type? |
| litespec/frontend/blazor/structure#keep-imports-directional | guidance | Does the reference graph match the declared direction? |
| litespec/frontend/blazor/structure#keep-domain-free-of-browser-concerns | guidance | Do Domain and Application reference any browser or interop type? |
| litespec/frontend/blazor/structure#place-interop-adapters-together | guidance | Does each adapter sit beside its matching script, or record a replacement? |
| litespec/frontend/blazor/structure#keep-static-content-out-of-the-assembly | guidance | Does published output serve runtime content from `wwwroot/` rather than embedded resources? |
