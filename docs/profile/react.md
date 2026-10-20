# React Stack

## Intent

This stack serves a React frontend beside the product's backend stack. A React frontend takes one of three shapes, chosen by who reads it. An authenticated console is a static single-page application. A public surface whose pages are shared as links and read by a search engine renders on the server. A device client that asks one question repeatedly is a static page with no router. The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

## Agent Summary {#agent-summary}

The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

- Each frontend's rendering mode follows the audience that reads it. (litespec/rule/profile-react.select-a-rendering-mode-by-audience)
- A device client is one static page with no router. (litespec/rule/profile-react.build-a-device-client-as-one-static-page)

## Standards

### Select a rendering mode by audience (litespec/rule/profile-react.select-a-rendering-mode-by-audience)

**Requirement:** A React frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

**Rationale:** A console is reached from the application a signed-in user already has open, so its first response has nothing to index. A public page is reached from a message or a search result, so its title and links belong in the first response. A device client asks one question over and over, so it takes a static page with no router. A page counts as indexed when its readers reach it from a message or a search result.

**Example:** A back-office console and an internal admin console ship as static files. A public storefront runs as a Node server that hydrates in the browser. A warehouse handheld client ships as one static page.

### Build a device client as one static page (litespec/rule/profile-react.build-a-device-client-as-one-static-page)

**Requirement:** A device client MUST ship as one static page with no router.

**Rationale:** A device client asks one question over and over, so a router adds downloads without adding destinations.

## Composition

### Stack

- [React Stack](react.md)

### Frontend

- [Frontend Structure](../frontend/structure.md)
- [Frontend Rendering and Routes](../frontend/rendering.md)
- [Frontend Components](../frontend/components.md)
- [Controlled UI Governance](../frontend/ui.md)
- [UI Pattern Decisions](../frontend/patterns.md)
- [Frontend Data and State](../frontend/data.md)
- [Frontend Testing](../frontend/testing.md)

### React

- [React Components](../react/components.md)

## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/profile-react.select-a-rendering-mode-by-audience | guidance | Does each frontend render in the mode its audience requires? |
| litespec/rule/profile-react.build-a-device-client-as-one-static-page | guidance | Is each device client one static page with no router? |
