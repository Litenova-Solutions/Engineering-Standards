# Frontend Rendering and Routes

## Intent

A route answers three questions: what address is this, what data does it need, and which floorplan draws it. Everything else belongs in a module.

The render boundary follows the audience the route serves. A console serves a signed-in reader from a cache its route filled. A public page arrives from a link, so its first response already describes itself.

## Standards

### Load route data before rendering

**Requirement:** A route MUST load each read it needs through one shared cache before its view renders.

**Rationale:** The page then renders with its data rather than showing a spinner after it has already appeared. The cache owns freshness, so the router never holds a second copy.

**Example:** An entity route loads its record and every read the record's own sections need.

### Read route data from the route cache

**Requirement:** A view MUST read route data through the same cache entry its route filled.

**Rationale:** A read naming another key issues a second request, and the two answers can disagree. A failed read reaches the route's error boundary, which draws the shared problem state.

### Keep address parameters validated by a schema

**Requirement:** A route MUST declare its address parameters in a validated schema, including its filters and its page.

**Rationale:** A filtered list is then a link somebody can share, bookmark, and reopen. A filter in component state reaches nobody and is lost on the first navigation away.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

### Load each route and each language separately

**Requirement:** A frontend MUST load each route and each language as its own download, with no icon set or language loaded whole.

**Rationale:** A signed-in user opens one address and reads one language. A reader in Dutch who never leaves the dashboard should not download English.

**Example:** A dictionary loader returns one language. Each route file or folder ships as its own download.

### Prefetch a route on intent

**Requirement:** A frontend MUST prefetch the route the reader signals intent toward, without treating that prefetch as a cache beyond the shared cache.

**Rationale:** Most navigations then render from the cache the routes already filled. A router caching a second time serves a stale answer beside a fresh one.

### Represent route states

**Requirement:** A data-driven route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal at all. The root not-found handling draws the shared outcome page.

These six are the states a route has. A control adds `disabled` and `pending` under `litespec/frontend/components#render-complete-states`, because both describe a control rather than a route. A route adds `not-found`, which a control does not, because a missing target resolves at the route.

### Keep authenticated caching explicit

**Requirement:** Actor-specific data MUST declare its cache key, partition, invalidation owner, and security review before caching, beside the read definition setting the key.

**Rationale:** Shared route behavior otherwise serves one actor's data to another. An uncached read is the safe default, and a cache partitioned per request is the safe server shape.

### Keep proxy behavior at the edge

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** The proxy runs before the request reaches the API, so it cannot see the resource authorization depends on.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server data cache per request

**Requirement:** A server-rendered frontend MUST construct its data cache inside each request.

**Rationale:** Two readers served at the same time must not read each other's data. A cache outliving one request would serve the next reader the previous reader's answer.

## Conventions

### Use a shared layout for a shell

**Default:** Give a shell a layout holding the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A layout adds no address segment, so the shell never appears in a link.

### Keep layouts stable

**Default:** Keep a layout to the frame and the providers every child route needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature-specific provider wrapping the whole application forces unrelated routes to carry its cost.

### Keep server-only code identifiable

**Default:** Keep a module reading a request header, a cookie, or a server secret in a file whose name and place show the server ownership.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The server marking turns an accidental browser import into a build error, and the file name carries the same fact to a reader.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/rendering#load-route-data-before-rendering | guidance | Does each route that reads load it through one shared cache before its view renders? |
| litespec/frontend/rendering#read-route-data-from-the-route-cache | guidance | Does each read name the entry its route filled? |
| litespec/frontend/rendering#keep-address-parameters-validated-by-a-schema | guidance | Does each route declare its address parameters in a schema, with no direct reads? |
| litespec/frontend/rendering#load-each-route-and-each-language-separately | guidance | Does each route and each language load as its own download? |
| litespec/frontend/rendering#prefetch-a-route-on-intent | guidance | Does the router prefetch the route the reader signals intent toward, with no second cache? |
| litespec/frontend/rendering#represent-route-states | guidance | Does an absent address render the shared outcome page? |
| litespec/frontend/rendering#keep-authenticated-caching-explicit | guidance | Does each cached actor-specific read declare its key, boundary, owner, and review? |
| litespec/frontend/rendering#keep-proxy-behavior-at-the-edge | guidance | Does any proxy rule decide the actor or what the actor may read? |
| litespec/frontend/rendering#build-the-server-data-cache-per-request | guidance | Does each server request construct its own data cache? |
| litespec/frontend/rendering#use-a-shared-layout-for-a-shell | guidance | Does each shell sit in a shared layout? |
| litespec/frontend/rendering#keep-layouts-stable | guidance | Is each provider required by every child route? |
| litespec/frontend/rendering#keep-server-only-code-identifiable | guidance | Does each server-owned module sit in a file named for the server? |
