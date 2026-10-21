# Blazor Rendering and Routes

## Intent

The Blazor client renders entirely in the browser with no server behind it. This page states how it follows the rendering rules in [Frontend Rendering and Routes](../rendering.md): client-only rendering, declared routes with explicit states, landing pages served as static documents outside the application, and offline operation after first load. A team that applies it while writing routes and the cached application shell keeps the product working with a slow connection or none, and keeps first-time visitors from downloading a runtime they do not need yet.

## Concepts

### Routes, the shell, and the acquisition surface

A route is one address in the product, declared on a page with an `@page` template. The application shell is the cached frame and framework payload that start the product without a network. The acquisition surface is the marketing and landing pages a first-time visitor reads before using the product; they ship as static documents so the visitor downloads no runtime.

## Standards

### Render on the client only

**Requirement:** A page MUST render without server-side execution at first paint.

**Rationale:** The stack promises a product with no server of its own. Interactive server rendering, automatic render mode, and prerendering each need a live server connection at first paint, which breaks that promise and removes offline operation. Rendering on the client only keeps the published output static files that any host can serve.

### Declare routes on pages

**Requirement:** A routable component MUST live under `Pages/`, declare one `@page` template, and type every route parameter.

**Rationale:** One `@page` template on a page under `Pages/` makes each address findable and each route's input typed. Feature components stay unroutable, so no address reaches an interior piece of a page. An unparsable parameter renders the not-found state rather than throwing, so a mistyped link shows a page instead of a crash.

### Give every route explicit states

**Requirement:** A route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A route without declared states shows whatever its components default to while loading, empty, or failing: usually a blank page or a crash. Six named states leave no gap: loading until persisted reads complete, empty, error, forbidden for an address the actor may not read, not-found for an unparsable parameter, and ready. Each state name is a term in the project's language record, so every route describes the same states in the same words. This realizes litespec/frontend/rendering#represent-route-states.

### Keep the acquisition surface static

**Requirement:** A marketing, search-landing, or informational page MUST be served as a static document outside the WebAssembly application.

**Rationale:** A first-time visitor reads a landing page, and downloading the WebAssembly runtime first makes that read slow for no reason. Static documents outside the application load immediately. The application boundary begins where a visitor starts using the product, so only users pay the runtime cost.

### Operate offline after first load

**Requirement:** A client MUST register a service worker that caches the application shell and framework payload.

**Rationale:** The service worker caches the shell and framework payload, so the application starts and navigates with no network. Without it the product is a blank page whenever the connection drops. A feature that cannot work offline states that in its use-case specification and degrades to an explicit offline state.

The worker also shapes the online case. It serves the version it cached, so a visitor who never goes offline still runs yesterday's payload until the worker updates. The worker therefore declares its update strategy and what a visitor sees while a new version installs, so an update never surprises a user mid-task.

## Conventions

### Name routes for the reader

**Default:** Use lowercase hyphen-separated route segments that match the documented use case or page name.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The address bar shows the route to the reader, so its segments should name the use case or page the reader asked for. A storage key, internal identifier, or layer name in the address exposes an implementation choice and breaks when the implementation changes.

### Keep navigation state in the URL

**Default:** Place filters, selected tabs, and pagination in the route or query string.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Filters, selected tabs, and pagination in the route or query string survive a refresh and travel inside a shared link. The same state in a component vanishes on the first refresh and reaches nobody the reader sends the link to. This realizes litespec/frontend/rendering#keep-address-parameters-validated-by-a-schema.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/rendering#render-on-the-client-only | guidance | Does the published output declare no server render mode? |
| litespec/frontend/blazor/rendering#declare-routes-on-pages | guidance | Does each routable component declare one template with typed parameters? |
| litespec/frontend/blazor/rendering#give-every-route-explicit-states | guidance | Does each route render its six states, with not-found for bad parameters? |
| litespec/frontend/blazor/rendering#keep-the-acquisition-surface-static | guidance | Does each landing page load without fetching the framework payload? |
| litespec/frontend/blazor/rendering#operate-offline-after-first-load | guidance | Does the application start offline after first load, with stated limits? |
| litespec/frontend/blazor/rendering#name-routes-for-the-reader | guidance | Does each template match its documented use-case name? |
| litespec/frontend/blazor/rendering#keep-navigation-state-in-the-url | guidance | Does refresh-surviving state appear in the route or query string? |
