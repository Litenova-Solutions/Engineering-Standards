# Blazor Structure

## Intent

The Blazor client is one WebAssembly application whose folders mirror the backend's modules and use cases, giving each business area and user task the same place in both trees. This page states the solution tree, the feature folders, the module boundaries, and the import direction a product with no server follows. A team that applies it while adding pages and features keeps every use case findable by path and every layer testable without a browser.

## Concepts

### The client tree

Four production projects hold the client: Domain for rules and state, Application for handlers and interfaces, Infrastructure for browser adapters, and Web for pages and features. [Blazor data](data.md) and [Blazor components](components.md) state what each layer may do; this page states where each file lives.

## Standards

### Use the client solution tree

**Statement:** A client solution MUST contain Domain, Application, Infrastructure, and Web production projects and no server project.

**Rationale:** Four production projects give each layer one home, and the absence of a server project means the tree cannot silently gain a server dependency. A reader finds behavior by layer and a build compiles each layer separately. This replaces the API solution path in `litespec/workspace/structure#use-the-canonical-root-tree`, because a client-only consumer has no API directory.

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

Framework-generated `bin`, `obj`, and `publish` folders remain untracked.

### Organize features by module and use case

**Statement:** A feature MUST live under `Features/{Module}/{UseCase}/` using the module and use-case names its specification declares.

**Rationale:** The specification tree names each module and use case, and the client tree repeats those names, so a reader moves from a specification to its code by path alone. A feature filed anywhere else is findable only by search, and a renamed use case leaves its code behind. This realizes litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case.

### Isolate module internals

**Statement:** A module MUST NOT reference another module's internal feature types.

**Rationale:** A module's internal types are its own to change. When another module references them, a change in one module breaks code in another. Page composition may still render public components from several modules, because a page is the one place that combines modules. Truly shared code moves to `Components/` only after two real consumers prove the need, so the shared folder never fills with guesses.

### Keep imports directional

**Statement:** A reference MUST point from pages to features to components and Application, and from Infrastructure inward.

**Rationale:** The direction keeps each layer testable with only the layers inside it: Domain references nothing, Application references only Domain, and a feature reaches Infrastructure through an interface that Application owns. A reference in the other direction drags the outer layer's dependencies into the inner layer's tests. This realizes litespec/frontend/structure#order-imports-from-routes-to-shared-packages.

**Example:**

```text
Pages -> Features -> Components and Application -> Domain
Infrastructure -> Application and Domain
```

### Keep Domain free of browser concerns

**Statement:** Domain and Application MUST contain no interop, component, HTTP, browser storage, render-loop timer, or document object model type.

**Rationale:** Interop, component, HTTP, storage, timer, and document types each need a browser to run. If Domain or Application named them, every core test would need a browser host. Keeping them out mirrors the baseline rule that Domain carries no persistence or web package, so the core stays testable as plain .NET.

## Conventions

### Place interop adapters together

**Default:** Place browser API wrappers in `{ProjectName}.Infrastructure/Interop/`, one type per API surface.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One type per browser API surface in `Infrastructure/Interop/`, each implementing an interface declared in Application, puts every browser call in one folder behind a testable boundary. The static scripts they call live in `{ProjectName}.Web/wwwroot/interop/` with matching names, so each wrapper resolves to its script by name. This realizes litespec/frontend/structure#locate-cross-route-values-in-the-frame.

### Keep static content out of the assembly

**Default:** Serve generated runtime content from `wwwroot/` and fetch it rather than embedding it as a resource.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Content served from `wwwroot/` and fetched at runtime changes without a rebuild: a content edit ships as a file, not a release. Embedded content couples every wording fix to a compile and bloats the assembly the visitor downloads before anything renders.

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
