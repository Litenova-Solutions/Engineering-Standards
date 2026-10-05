# Blazor Rendering and Routes

## Intent

The client renders entirely in the browser. Routes declare their own templates and states, the acquisition surface stays outside the runtime, and the application keeps working after the network goes away.

## Agent Summary {#agent-summary}

- Rendering runs in the browser with no server round trip. (standards/rule/blazor-rendering.render-on-the-client-only)
- A routable component declares its own template under `Pages/`. (standards/rule/blazor-rendering.declare-routes-on-pages)
- Each route defines loading, empty, error, and content behavior. (standards/rule/blazor-rendering.give-every-route-explicit-states)
- Pages a first-time visitor reads download no runtime. (standards/rule/blazor-rendering.keep-the-acquisition-surface-static)
- The application starts and navigates offline after first load. (standards/rule/blazor-rendering.operate-offline-after-first-load)

## Standards

### Render on the client only (standards/rule/blazor-rendering.render-on-the-client-only)

**Requirement:** A page MUST render without server-side execution at first paint.

**Rationale:** Interactive server rendering, automatic render mode, and prerendering each require a live server connection, so all three are outside this profile.

### Declare routes on pages (standards/rule/blazor-rendering.declare-routes-on-pages)

**Requirement:** A routable component MUST live under `Pages/`, declare one `@page` template, and type every route parameter.

**Rationale:** Feature components stay unroutable. An unparsable parameter renders the not-found state rather than throwing.

### Give every route explicit states (standards/rule/blazor-rendering.give-every-route-explicit-states)

**Requirement:** A route MUST define its loading, empty, error, and content behavior.

**Rationale:** A route reading persisted state renders its loading state until the read completes, so it never shows content from an unloaded store.

### Keep the acquisition surface static (standards/rule/blazor-rendering.keep-the-acquisition-surface-static)

**Requirement:** A marketing, search-landing, or informational page MUST be served as a static document outside the WebAssembly application.

**Rationale:** A first-time visitor then downloads no runtime. The application boundary begins where a visitor starts using the product.

### Operate offline after first load (standards/rule/blazor-rendering.operate-offline-after-first-load)

**Requirement:** A client MUST register a service worker that caches the application shell and framework payload.

**Rationale:** The application then starts and navigates with no network. A feature that cannot work offline states that in its use-case specification and degrades to an explicit offline state.

The rule covers the online case as much as the offline one. A cached shell serves the version it cached, so a visitor who never goes offline still receives yesterday's payload until the worker updates. The worker therefore declares its update strategy and what a visitor sees while a new version installs.

## Conventions

### Name routes for the reader (standards/rule/blazor-rendering.name-routes-for-the-reader)

**Default:** Use lowercase hyphen-separated route segments that match the documented use case or page name.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A route that encodes a storage key, internal identifier, or layer name exposes an implementation choice to the address bar.

### Keep navigation state in the URL (standards/rule/blazor-rendering.keep-navigation-state-in-the-url)

**Default:** Place filters, selected tabs, and pagination in the route or query string.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A user expects that state to survive a refresh or a shared link, which component state cannot provide.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/blazor-rendering.render-on-the-client-only | test | `PublishOutputTests` asserts the output declares no render mode requiring a server. |
| standards/rule/blazor-rendering.declare-routes-on-pages | test | `RouteContractTests` asserts each routable component declares one template with typed parameters. |
| standards/rule/blazor-rendering.give-every-route-explicit-states | test | `RouteStateTests` asserts each route renders its loading, empty, error, and content states. |
| standards/rule/blazor-rendering.keep-the-acquisition-surface-static | test | `AcquisitionTests` asserts a landing page loads without fetching the framework payload. |
| standards/rule/blazor-rendering.operate-offline-after-first-load | test | `OfflineStartupTests` starts the application with the network disabled after a first load. |
| standards/rule/blazor-rendering.name-routes-for-the-reader | inspection | Route review compares each template against its documented use-case name. |
| standards/rule/blazor-rendering.keep-navigation-state-in-the-url | inspection | Navigation review confirms refresh-surviving state appears in the route or query string. |
