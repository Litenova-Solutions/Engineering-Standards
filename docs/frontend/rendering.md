# Frontend Rendering and Routes

## Intent


A route file answers three questions: what address is this, what data does it need, and which floorplan draws it. Everything else belongs in a module.

The render boundary is chosen by the audience the route serves. A console is already open, so it renders in the browser from a cache its loader filled. A public page arrives from a link or a search result, so its first response carries its title, its description, and its links.

## Agent Summary {#agent-summary}


- A loader fills the query cache before the component runs. (standards/rule/frontend-rendering.load-route-data-in-the-loader)
- A component reads the key its loader filled. (standards/rule/frontend-rendering.read-route-data-with-a-suspense-query)
- List state lives in the address, behind a schema. (standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema)
- Each route and each language is its own chunk. (standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language)
- A route states loading, empty, error, and not-found. (standards/rule/frontend-rendering.represent-route-states)
- A public route states its metadata, and a private route refuses indexing. (standards/rule/frontend-rendering.define-route-metadata-deliberately)
- A server render builds its cache per request. (standards/rule/frontend-rendering.build-the-server-query-cache-per-request)

## Standards


### Load route data in the loader (standards/rule/frontend-rendering.load-route-data-in-the-loader)

**Requirement:** A route's loader MUST prefetch each read it needs through the query cache before the component runs.

**Rationale:** The page then renders with its data rather than showing a spinner after it has already appeared. The cache owns freshness, so the router never holds a second copy.

**Example:** An entity route prefetches its record and every read the record's own sections need.

```tsx
loader: async ({ context, params }) => {
  const order = await context.queryClient.ensureQueryData(orderQuery(params.orderId));

  if (order.eventId !== null) {
    await context.queryClient.ensureQueryData(eventQuery(order.eventId));
  }
}
```

### Read route data with a suspense query (standards/rule/frontend-rendering.read-route-data-with-a-suspense-query)

**Requirement:** A component MUST read route data with a suspense query over the same cache key its loader filled.

**Rationale:** A read naming another key issues a second request, and the two answers can disagree. A failed read reaches the route's error component, which draws the shared problem state.

**Example:**

```tsx
const { data: order } = useSuspenseQuery(orderQuery(orderId));
```

### Keep search parameters validated by a schema (standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema)

**Requirement:** A route MUST declare its search parameters in a validated schema, including its filters and its page.

**Rationale:** A filtered list is then a link somebody can share, bookmark, and reopen. A filter in component state reaches nobody and is lost on the first navigation away.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

```tsx
validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
```

### Split one chunk per route and per language (standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language)

**Requirement:** A frontend MUST load each route and each language as its own chunk, with no icon set or language imported whole.

**Rationale:** A signed-in user opens one address and reads one language. A reader in Dutch who never leaves the dashboard should not download English.

**Example:** `loadDictionary` returns a dynamic import of one language, and the router plugin splits each route file.

### Load a route on intent (standards/rule/frontend-rendering.load-a-route-on-intent)

**Requirement:** A frontend MUST prefetch the route a pointer is over, and never treat that prefetch as a cache beyond the query cache.

**Rationale:** Most navigations then render from the cache the loaders already filled. A router caching a second time serves a stale answer beside a fresh one.

### Represent route states (standards/rule/frontend-rendering.represent-route-states)

**Requirement:** A data-driven route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal at all. The root route's not-found component draws the shared outcome page.

These six are the states a route has. A control adds `disabled` and `pending` under `standards/rule/frontend-components.render-complete-states`, because both describe a control rather than a page. A route adds `not-found`, which a control does not, because a missing target resolves at the route.

### Define route metadata deliberately (standards/rule/frontend-rendering.define-route-metadata-deliberately)

**Requirement:** A public route MUST define its title, its description, its canonical address, and its indexing policy, while a private route refuses indexing.

**Rationale:** The metadata is what a search result and a shared link show. An indexed console exposes an address a signed-in user believes is private.

**Example:** A channel route states `og:*` tags and one alternate per language. A console route ships a `noindex` meta tag in its document.

### Keep authenticated caching explicit (standards/rule/frontend-rendering.keep-authenticated-caching-explicit)

**Requirement:** Actor-specific data MUST declare its cache key, its partition boundary, its invalidation owner, and its security review before it is cached.

**Rationale:** Shared route or loader behaviour otherwise serves one actor's data to another. An uncached read is the safe default, and a cache partitioned per request is the safe server shape.

### Keep proxy behavior at the edge (standards/rule/frontend-rendering.keep-proxy-behavior-at-the-edge)

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** The proxy runs before the request reaches the API, so it cannot see the resource authorization depends on. Forwarding the API's own paths gives the browser one origin, which is what makes an HTTP-only session cookie a first-party cookie of the page.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server query cache per request (standards/rule/frontend-rendering.build-the-server-query-cache-per-request)

**Requirement:** A server-rendered frontend MUST construct its router and its query cache inside each request.

**Rationale:** Two readers served at the same time must not read each other's data. A cache outliving one request would serve the next reader the previous reader's answer.

## Conventions


### Use a pathless layout route for a shell (standards/rule/frontend-rendering.use-a-pathless-layout-route-for-a-shell)

**Default:** Give a shell a layout route whose file name starts with an underscore, and let it hold the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A pathless layout adds no address segment, so the shell never appears in a link.

### Keep layouts stable (standards/rule/frontend-rendering.keep-layouts-stable)

**Default:** Keep a layout to the frame and the providers every child route needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature-specific provider wrapping the whole application forces unrelated routes to carry its cost.

### Keep server only code identifiable (standards/rule/frontend-rendering.keep-server-only-code-identifiable)

**Default:** Keep a module reading a request header, a cookie, or a server secret in a file whose name and import show the server ownership.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The framework's server-only import turns an accidental browser import into a build error, and a file name carries the same fact to a reader.

## Reference example

This informative example demonstrates `standards/rule/frontend-rendering.load-route-data-in-the-loader`, `standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema`, and `standards/rule/frontend-rendering.read-route-data-with-a-suspense-query`.

```tsx
/**
 * Find any paid order, for any product, newest first.
 *
 * @useCase use-case/orders.search-merchant-orders
 */
export const Route = createFileRoute("/_console/orders/")({
  validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(merchantOrdersQuery(deps.q, deps.page)),
  component: OrdersPage,
});
```

The route resolves its input and composes the floorplan. The query wrapper owns the typed call, and the table owns the columns.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-rendering.load-route-data-in-the-loader | inspection | Route review confirms each route that reads declares a loader that prefetches it. |
| standards/rule/frontend-rendering.read-route-data-with-a-suspense-query | inspection | Route review confirms each read names the key its loader filled. |
| standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema | static | `pnpm type-check` fails on a route whose search field is absent from its schema. |
| standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language | test | `pnpm build` reports one output chunk per route file and one per dictionary language. |
| standards/rule/frontend-rendering.load-a-route-on-intent | inspection | Router configuration review confirms intent preloading and no second cache. |
| standards/rule/frontend-rendering.represent-route-states | test | `tests/routes/every-route.spec.ts` renders an absent address and asserts the outcome page. |
| standards/rule/frontend-rendering.define-route-metadata-deliberately | inspection | Document review confirms each public route states four values and each console refuses indexing. |
| standards/rule/frontend-rendering.keep-authenticated-caching-explicit | inspection | Cache review confirms each server render builds its own cache and each mutation names what it invalidates. |
| standards/rule/frontend-rendering.keep-proxy-behavior-at-the-edge | inspection | Proxy configuration review confirms no proxy rule reads a permission. |
| standards/rule/frontend-rendering.build-the-server-query-cache-per-request | test | `grep -c createQueryClient src/router.tsx` finds one call inside the router factory. |
| standards/rule/frontend-rendering.use-a-pathless-layout-route-for-a-shell | inspection | Route review confirms each shell sits in a layout route whose file name starts with an underscore. |
| standards/rule/frontend-rendering.keep-layouts-stable | inspection | Layout review confirms each provider is required by every child route. |
| standards/rule/frontend-rendering.keep-server-only-code-identifiable | inspection | Import review confirms each server-owned module sits in a file named for the server. |