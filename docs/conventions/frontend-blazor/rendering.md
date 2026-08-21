# Client Rendering and Routes

## Intent

The client renders entirely in the browser. Routes declare their own templates and states, the acquisition surface stays outside the runtime, and the application keeps working after the network goes away.

## Agent Summary {#agent-summary}

- Rendering runs in the browser with no server round trip. (BLAZOR.RENDERING.MODE.001)
- A routable component declares its own template under `Pages/`. (BLAZOR.RENDERING.ROUTES.001)
- Each route defines loading, empty, error, and content behavior. (BLAZOR.RENDERING.STATE.001)
- Pages a first-time visitor reads download no runtime. (BLAZOR.RENDERING.ACQUISITION.001)
- The application starts and navigates offline after first load. (BLAZOR.RENDERING.OFFLINE.001)

## Standards

### Render on the client only (BLAZOR.RENDERING.MODE.001)

**Requirement:** A page MUST render without server-side execution at first paint.

**Rationale:** Interactive server rendering, automatic render mode, and prerendering each require a live server connection, so all three are outside this profile.

### Declare routes on pages (BLAZOR.RENDERING.ROUTES.001)

**Requirement:** A routable component MUST live under `Pages/`, declare one `@page` template, and type every route parameter.

**Rationale:** Feature components stay unroutable. An unparsable parameter renders the not-found state rather than throwing.

### Give every route explicit states (BLAZOR.RENDERING.STATE.001)

**Requirement:** A route MUST define its loading, empty, error, and content behavior.

**Rationale:** A route reading persisted state renders its loading state until the read completes, so it never shows content from an unloaded store.

### Keep the acquisition surface static (BLAZOR.RENDERING.ACQUISITION.001)

**Requirement:** A marketing, search-landing, or informational page MUST be served as a static document outside the WebAssembly application.

**Rationale:** A first-time visitor then downloads no runtime. The application boundary begins where a visitor starts using the product.

### Operate offline after first load (BLAZOR.RENDERING.OFFLINE.001)

**Requirement:** A client MUST register a service worker that caches the application shell and framework payload.

**Rationale:** The application then starts and navigates with no network. A feature that cannot work offline states that in its page specification and degrades to an explicit offline state.

## Conventions

### Name routes for the reader (BLAZOR.RENDERING.CONVENTION.001)

**Default:** Use lowercase hyphen-separated route segments that match the documented use case or page name.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A route that encodes a storage key, internal identifier, or layer name exposes an implementation choice to the address bar.

### Keep navigation state in the URL (BLAZOR.RENDERING.CONVENTION.002)

**Default:** Place filters, selected tabs, and pagination in the route or query string.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A user expects that state to survive a refresh or a shared link, which component state cannot provide.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| BLAZOR.RENDERING.MODE.001 | test | `PublishOutputTests` asserts the output declares no render mode requiring a server. |
| BLAZOR.RENDERING.ROUTES.001 | test | `RouteContractTests` asserts each routable component declares one template with typed parameters. |
| BLAZOR.RENDERING.STATE.001 | test | `RouteStateTests` asserts each route renders its loading, empty, error, and content states. |
| BLAZOR.RENDERING.ACQUISITION.001 | test | `AcquisitionTests` asserts a landing page loads without fetching the framework payload. |
| BLAZOR.RENDERING.OFFLINE.001 | test | `OfflineStartupTests` starts the application with the network disabled after a first load. |
| BLAZOR.RENDERING.CONVENTION.001 | inspection | Route review compares each template against its documented use-case name. |
| BLAZOR.RENDERING.CONVENTION.002 | inspection | Navigation review confirms refresh-surviving state appears in the route or query string. |
