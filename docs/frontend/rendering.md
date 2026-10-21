# Frontend Rendering and Routes

## Intent

A route answers three questions: which web address it serves, which data it needs, and which floorplan, the page component fixing the page layout, draws it. This page states how a route loads its data before rendering, how the address carries its parameters, how routes and languages load separately, and how each route state renders. Frontend developers and agents apply it for every address the product serves, so each page renders with its data in place and no route shows a blank region where a request is pending or failed.

## Concepts

### The route, its cache, and its view

A route is the entry for one address: it declares its parameters, loads each read it needs through one shared cache, and hands rendering to its view. The view reads the same cache entries the route filled, so the page renders with its data rather than showing a spinner after it appears. The cache owns freshness; neither the router nor the view keeps a second copy. The view renders inside one floorplan, the page component that fixes the page layout ([Controlled UI Governance](ui.md)).

### Addresses carry their own parameters

A route declares its address parameters, including filters and page, in a validated schema. A filtered list is then a link somebody can share, bookmark, and reopen: the address holds the filter values, and opening the address restores the same view. A filter kept in component state reaches nobody and is lost on the first navigation away.

### Route states

A route can reach six states: loading, empty, error, forbidden, not-found, and ready. Defining each one up front gives the reader a designed answer wherever a request is pending or failed, instead of a blank region.

## Standards

### Load route data before rendering

**Requirement:** A route MUST load each read it needs through one shared cache before its view renders.

**Rationale:** A view that renders before its reads complete shows a spinner after it appears, then swaps the spinner for content: two drawings for one navigation, with layout shifting between them. Loading each read through one shared cache before the view renders gives the page its data in place. The cache owns freshness, so the router keeps no second copy that could disagree.

**Example:** An entity route loads its record and every read the record's own sections need.

### Read route data from the route cache

**Requirement:** A view MUST read route data through the same cache entry its route filled.

**Rationale:** A view that reads under another key issues a second request for data the route already loaded, and the two answers can disagree when the data changes between them. Reading through the same cache entry the route filled renders the data the route approved. A failed read reaches the route's error boundary, which draws the shared problem state instead of a half-rendered view.

### Keep address parameters validated by a schema

**Requirement:** A route MUST declare its address parameters in a validated schema, including its filters and its page.

**Rationale:** A validated schema makes the address the whole input: a filtered list is a link somebody can share, bookmark, and reopen, and opening it restores the same filters and page. Validation also refuses a malformed address at the boundary instead of rendering a page from nonsense values. A filter kept in component state reaches nobody and is lost on the first navigation away.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

### Load each route and each language separately

**Requirement:** A frontend MUST load each route and each language as its own download, with no icon set or language loaded whole.

**Rationale:** A reader opens one address and reads one language, so downloading every route and every language up front wastes the reader's time on code and copy they never reach. Each route and each language ships as its own download: a reader in Dutch who never leaves the dashboard downloads neither English nor the routes they never visit. No icon set or language loads whole for the same reason.

**Example:** A dictionary loader returns one language. Each route file or folder ships as its own download.

### Prefetch a route on intent

**Requirement:** A frontend MUST prefetch the route the reader signals intent toward, without treating that prefetch as a cache beyond the shared cache.

**Rationale:** When the reader signals intent toward a route, by hovering a link or focusing a menu item, prefetching loads that route's data into the shared cache before the navigation starts, so most navigations render from data already in place. The prefetch fills the shared cache only: a router that kept its own second cache would serve a stale answer beside the fresh one.

### Represent route states

**Requirement:** A data-driven route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal: they cannot tell loading from broken. Defining loading, empty, error, forbidden, not-found, and ready behavior gives each state a designed drawing, and the root not-found handling draws the shared outcome page for an absent address.

These six are the states a route has. A control adds `disabled` and `pending` under `litespec/frontend/components#render-complete-states`, because both describe a control rather than a route. A route adds `not-found`, which a control does not, because a missing target resolves at the route.

### Keep authenticated caching explicit

**Requirement:** Actor-specific data MUST declare its cache key, partition, invalidation owner, and security review before caching, beside the read definition setting the key.

**Rationale:** A cache entry that ignores whose data it holds serves one actor's answer to another reader: the classic leak behind a shared cache. Declaring the cache key, the partition, the invalidation owner, and the security review beside the read definition forces each cached actor-specific read to name its boundary before it caches. An uncached read is the safe default, and a cache partitioned per request is the safe server shape.

### Keep proxy behavior at the edge

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** A development or edge proxy runs before the request reaches the API, so it cannot see the record or the permissions an authorization decision depends on. A proxy rule that decided who the actor is or what the actor may read would enforce a different boundary than the API, and the two would disagree on the first edge case. The proxy routes and nothing else; the API owns identity and authorization.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server data cache per request

**Requirement:** A server-rendered frontend MUST construct its data cache inside each request.

**Rationale:** A server renders for many readers at once. A data cache shared across requests serves the next reader the previous reader's answer, leaking one actor's data to another with no error to report it. Constructing the cache inside each request gives every reader a fresh cache that dies with the response.

## Conventions

### Use a shared layout for a shell

**Default:** Give a shell a layout holding the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shell is the frame every child route shares: navigation, header, and providers. A shared layout holds it without adding an address segment, so the shell never appears in a link and every child route renders inside the same frame.

### Keep layouts stable

**Default:** Keep a layout to the frame and the providers every child route needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A layout wraps every route beneath it. A feature-specific provider placed in a shared layout forces unrelated routes to carry its download, its state, and its failure modes. Keeping a layout to the frame and the providers every child route needs keeps each route's cost to what it uses.

### Keep server-only code identifiable

**Default:** Keep a module reading a request header, a cookie, or a server secret in a file whose name and place show the server ownership.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A module that reads a request header, a cookie, or a server secret breaks when it runs in the browser, and worse, it can drag the secret into the client download. A file whose name and place show server ownership turns an accidental browser import into a build error, and carries the same fact to a reader browsing the tree.

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
