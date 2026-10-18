# Frontend rendering and routes

## Intent

A route file answers three questions: what address is this, what data does it need, and which floorplan draws it. Everything else belongs in a module.

The render boundary is chosen by the audience the route serves. A console is already open, so it renders in the browser from a cache its loader filled. A public page arrives from a link or a search result, so its first response carries its title, its description, and its links.

## Agent summary {#agent-summary}

- A loader fills the query cache before the component runs. (standards/rule/frontend-rendering.load-route-data-in-the-loader)
- A component reads the key its loader filled. (standards/rule/frontend-rendering.read-route-data-with-a-suspense-query)
- List state lives in the address, behind a schema. (standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema)
- Each route and each language is its own chunk. (standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language)
- A route states loading, empty, error, and not-found. (standards/rule/frontend-rendering.represent-route-states)
- A public route states its metadata, and a private route refuses indexing. (standards/rule/frontend-rendering.define-route-metadata-deliberately)
- A server render builds its cache per request. (standards/rule/frontend-rendering.build-the-server-query-cache-per-request)

## React

React routes are files using the router's file convention. Each route declares its search parameters in `validateSearch` and prefetches its reads in its loader. Components read route data with `useSuspenseQuery` over the key the loader filled. A shell is a pathless layout route whose file name starts with an underscore. Server-only code lives in a file whose name and import show the server ownership. The router builds the route tree, and intent preloading fills the query cache.

## Svelte

Svelte routes are folders under `src/routes`, each holding a page. Each page declares its parameters in a schema and prefetches its reads in its load. Pages read route data with a query creator over the key the load filled. A shell is a layout file holding the frame every child page shares. Server-only code lives in a server file or under the server library.

SvelteKit splits each route folder, and intent preloading fills the query cache. A page is a route file, a load is a loader, and a query creator is a suspense query.

## Standards

### Load route data in the loader (standards/rule/frontend-rendering.load-route-data-in-the-loader)

**Requirement:** A route's loader MUST prefetch each read it needs through the query cache before the component runs.

**Rationale:** The page then renders with its data rather than showing a spinner after it has already appeared. The cache owns freshness, so the router never holds a second copy.

**Example:** An entity route prefetches its record and every read the record's own sections need.

```tsx
loader: async ({ context, params }) => {
  const order = await context.queryClient.ensureQueryData(orderQuery(params.orderId));

  if (order.merchantId !== null) {
    await context.queryClient.ensureQueryData(merchantQuery(order.merchantId));
  }
}
```

The Svelte load does the same:

```ts
export async function load({ parent, params }) {
  const { queryClient } = await parent();
  const order = await queryClient.ensureQueryData(orderQuery(params.orderId));

  if (order.merchantId !== null) {
    await queryClient.ensureQueryData(merchantQuery(order.merchantId));
  }

  return { orderId: params.orderId };
}
```

### Read route data with a suspense query (standards/rule/frontend-rendering.read-route-data-with-a-suspense-query)

**Requirement:** A component MUST read route data with a suspense query over the same cache key its loader filled.

**Rationale:** A read naming another key issues a second request, and the two answers can disagree. A failed read reaches the route's error boundary, which draws the shared problem state.

**Example:**

React:

```tsx
const { data: order } = useSuspenseQuery(orderQuery(orderId));
```

Svelte:

```ts
const order = createQuery(() => orderQuery(orderId));
```

### Keep search parameters validated by a schema (standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema)

**Requirement:** A route MUST declare its search parameters in a validated schema, including its filters and its page.

**Rationale:** A filtered list is then a link somebody can share, bookmark, and reopen. A filter in component state reaches nobody and is lost on the first navigation away.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

```tsx
validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
```

The Svelte page parses the same shape from the address:

```ts
const search = orderSearch.parse(Object.fromEntries(url.searchParams));
```

### Split one chunk per route and per language (standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language)

**Requirement:** A frontend MUST load each route and each language as its own chunk, with no icon set or language imported whole.

**Rationale:** A signed-in user opens one address and reads one language. A reader in Dutch who never leaves the dashboard should not download English.

**Example:** `loadDictionary` returns a dynamic import of one language. The React router plugin splits each route file, and SvelteKit splits each route folder.

### Load a route on intent (standards/rule/frontend-rendering.load-a-route-on-intent)

**Requirement:** A frontend MUST prefetch the route a pointer is over, and never treat that prefetch as a cache beyond the query cache.

**Rationale:** Most navigations then render from the cache the loaders already filled. A router caching a second time serves a stale answer beside a fresh one.

### Represent route states (standards/rule/frontend-rendering.represent-route-states)

**Requirement:** A data-driven route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal at all. The root not-found handling draws the shared outcome page.

These six are the states a route has. A control adds `disabled` and `pending` under `standards/rule/frontend-components.render-complete-states`, because both describe a control rather than a route. A route adds `not-found`, which a control does not, because a missing target resolves at the route.

### Define route metadata deliberately (standards/rule/frontend-rendering.define-route-metadata-deliberately)

**Requirement:** A public route MUST define its title, its description, its canonical address, and its indexing policy, while a private route refuses indexing.

**Rationale:** The metadata is what a search result and a shared link show. An indexed console exposes an address a signed-in user believes is private.

**Example:** A channel route states `og:*` tags and one alternate per language. A console route ships a `noindex` meta tag in its document.

### Keep authenticated caching explicit (standards/rule/frontend-rendering.keep-authenticated-caching-explicit)

**Requirement:** Actor-specific data MUST declare its cache key, its partition boundary, its invalidation owner, and its security review before it is cached. The declaration sits beside the query definition that sets the cache key.

**Rationale:** Shared route or loader behaviour otherwise serves one actor's data to another. An uncached read is the safe default, and a cache partitioned per request is the safe server shape.

### Keep proxy behavior at the edge (standards/rule/frontend-rendering.keep-proxy-behavior-at-the-edge)

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** The proxy runs before the request reaches the API, so it cannot see the resource authorization depends on. Forwarding the API's own paths gives the browser one origin, which is what makes an HTTP-only session cookie a first-party cookie of the page.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server query cache per request (standards/rule/frontend-rendering.build-the-server-query-cache-per-request)

**Requirement:** A server-rendered frontend MUST construct its query cache inside each request.

**Rationale:** Two readers served at the same time must not read each other's data. A cache outliving one request would serve the next reader the previous reader's answer.

## Conventions

### Use a pathless layout route for a shell (standards/rule/frontend-rendering.use-a-pathless-layout-route-for-a-shell)

**Default:** Give a shell a layout holding the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A layout adds no address segment, so the shell never appears in a link.

### Keep layouts stable (standards/rule/frontend-rendering.keep-layouts-stable)

**Default:** Keep a layout to the frame and the providers every child route needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature-specific provider wrapping the whole application forces unrelated routes to carry its cost.

### Keep server only code identifiable (standards/rule/frontend-rendering.keep-server-only-code-identifiable)

**Default:** Keep a module reading a request header, a cookie, or a server secret in a file whose name and place show the server ownership.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The server marking turns an accidental browser import into a build error, and the file name carries the same fact to a reader.

## Reference example

This informative example demonstrates `standards/rule/frontend-rendering.load-route-data-in-the-loader`, `standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema`, and `standards/rule/frontend-rendering.read-route-data-with-a-suspense-query`.

```tsx
/**
 * Find any paid order, for any product, newest first.
 */
export const Route = createFileRoute("/_console/orders/")({
  validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(merchantOrdersQuery(deps.q, deps.page)),
  component: OrdersPage,
});
```

The Svelte page does the same in its load:

```svelte
<script lang="ts">
  import OrdersPage from '$lib/modules/orders/orders/search-merchant-orders/orders-page.svelte';

  let { data } = $props();
</script>

<OrdersPage search={data.search} />
```

The route resolves its input and composes the floorplan. The query definition owns the typed call, and the table owns the columns. A route links to its use cases through the generated client calls in its code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/frontend-rendering.load-route-data-in-the-loader | guidance | Does each route that reads declare a loader that prefetches it? |
| standards/rule/frontend-rendering.read-route-data-with-a-suspense-query | guidance | Does each read name the key its loader filled? |
| standards/rule/frontend-rendering.keep-search-parameters-validated-by-a-schema | guidance | Does each route declare its search in a schema, with no direct reads? |
| standards/rule/frontend-rendering.split-one-chunk-per-route-and-per-language | checkable | `pnpm build` reports one output chunk per route and one per language. |
| standards/rule/frontend-rendering.load-a-route-on-intent | guidance | Does the router preload the route a pointer is over, with no second cache? |
| standards/rule/frontend-rendering.represent-route-states | guidance | Does an absent address render the shared outcome page? |
| standards/rule/frontend-rendering.define-route-metadata-deliberately | guidance | Does each public route state four values, and each private route refuse indexing? |
| standards/rule/frontend-rendering.keep-authenticated-caching-explicit | guidance | Does each cached actor-specific read declare its key, boundary, owner, and review? |
| standards/rule/frontend-rendering.keep-proxy-behavior-at-the-edge | guidance | Does any proxy rule decide the actor or what the actor may read? |
| standards/rule/frontend-rendering.build-the-server-query-cache-per-request | checkable | `grep -c createQueryClient` (React) or `grep -c 'new QueryClient'` (Svelte) counts one construction in the request factory. |
| standards/rule/frontend-rendering.use-a-pathless-layout-route-for-a-shell | guidance | Does each shell sit in a shared layout? |
| standards/rule/frontend-rendering.keep-layouts-stable | guidance | Is each provider required by every child route? |
| standards/rule/frontend-rendering.keep-server-only-code-identifiable | guidance | Does each server-owned module sit in a file named for the server? |
