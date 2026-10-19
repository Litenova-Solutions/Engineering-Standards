# Svelte Stack

## Intent

This stack serves a Svelte frontend in a product whose backend is the dotnet stack. A Svelte frontend takes one of three shapes, chosen by who reads it. An authenticated console is a static SvelteKit application. A public surface whose pages are shared as links and read by a search engine renders on the server. A device client that asks one question repeatedly is a static page with no router. The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

## Agent Summary {#agent-summary}

The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

- Each frontend's rendering mode follows the audience that reads it. (standards/rule/profile-svelte.select-a-rendering-mode-by-audience)
- A device client is one static page with no router. (standards/rule/profile-svelte.build-a-device-client-as-one-static-page)

## Standards

### Select a rendering mode by audience (standards/rule/profile-svelte.select-a-rendering-mode-by-audience)

**Requirement:** A Svelte frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

**Rationale:** A console is reached from the application a signed-in user already has open, so its first response has nothing to index. A public page is reached from a message or a search result, so its title and links belong in the first response. A device client asks one question over and over, so it takes a static page with no router. A page counts as indexed when its readers reach it from a message or a search result.

**Example:** A back-office console and an internal admin console ship as static files. A public storefront runs as a Node server that hydrates in the browser. A warehouse handheld client ships as one static page.

### Build a device client as one static page (standards/rule/profile-svelte.build-a-device-client-as-one-static-page)

**Requirement:** A device client MUST ship as one static page with no router.

**Rationale:** A device client asks one question over and over, so a router adds downloads without adding destinations.

## Composition

### Workspace

- [Workspace Structure](../workspace/structure.md)
- [Naming and Code Style](../workspace/naming.md)
- [Dependencies](../workspace/dependencies.md)
- [Configuration](../workspace/config.md)

### Core

- [Agent operating protocol](../core/agent.md)
- [Authoring Standard](../core/authoring.md)
- [Maintaining the Standards](../core/maintaining.md)
- [The Project Model](../core/model.md)
- [Engineering Principles](../core/principles.md)
- [Product Intent](../core/product.md)
- [Release Standard](../core/release.md)
- [Supported scope](../core/scope.md)
- [Agentic engineering system](../core/system.md)

### Stack

- [Svelte stack](svelte.md)

### Frontend

- [Frontend structure](../frontend/structure.md)
- [Frontend rendering and routes](../frontend/rendering.md)
- [Frontend Components](../frontend/components.md)
- [Controlled UI Governance](../frontend/ui.md)
- [UI pattern decisions](../frontend/patterns.md)
- [Frontend data and state](../frontend/data.md)
- [Frontend testing](../frontend/testing.md)
- [Svelte Components](../svelte/components.md)

### Quality and operations

- [Security](../quality/security.md)
- [Operations](../quality/operations.md)
- [Continuous Integration](../quality/ci.md)

## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/profile-svelte.select-a-rendering-mode-by-audience | guidance | Does each frontend render in the mode its audience requires? |
| standards/rule/profile-svelte.build-a-device-client-as-one-static-page | guidance | Is each device client one static page with no router? |
