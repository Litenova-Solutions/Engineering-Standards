# Web Rendering and Routes

## Intent

This page states how the TypeScript web stacks realize the frontend rendering rules ([Frontend rendering](../rendering.md)). It states the loaders, queries, router files, and tooling the React and Svelte stacks share. Each realization cites the neutral rule it follows.

Rules with no neutral counterpart bind the web stacks alone.

## React

React routes are files using the router's file convention. Each route declares its search parameters in `validateSearch` and prefetches its reads in its loader. Components read route data with `useSuspenseQuery` over the key the loader filled. A shell is a pathless layout route whose file name starts with an underscore. Server-only code lives in a file whose name and import show the server ownership. The router builds the route tree. Intent preloading fills the query cache.

## Svelte

Svelte routes are folders under `src/routes`, each holding a page. Each page declares its parameters in a schema and prefetches its reads in its load. Pages read route data with a query creator over the key the load filled. A shell is a layout file holding the frame every child page shares. Server-only code lives in a server file or under the server library.

SvelteKit splits each route folder. Intent preloading fills the query cache. A page is a route file, a load is a loader, and a query creator is a suspense query.

## Standards

### Load route data in the loader

**Requirement:** A route's loader MUST prefetch each read it needs through the query cache before the component runs.

**Rationale:** The page then renders with its data rather than showing a spinner after it has already appeared. The cache owns freshness. The router never holds a second copy. This realizes litespec/frontend/rendering#load-route-data-before-rendering.

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

### Read route data with a suspense query

**Requirement:** A component MUST read route data with a suspense query over the same cache key its loader filled.

**Rationale:** A read naming another key issues a second request. The two answers can disagree. A failed read reaches the route's error boundary, which draws the shared problem state. This realizes litespec/frontend/rendering#read-route-data-from-the-route-cache.

**Example:**

React:

```tsx
const { data: order } = useSuspenseQuery(orderQuery(orderId));
```

Svelte:

```ts
const order = createQuery(() => orderQuery(orderId));
```

### Keep search parameters validated by a schema

**Requirement:** A route MUST declare its search parameters in a validated schema, including its filters and its page.

**Rationale:** A filtered list is then a link somebody can share, bookmark, and reopen. A filter in component state reaches nobody. It is lost on the first navigation away. This realizes litespec/frontend/rendering#keep-address-parameters-validated-by-a-schema.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

```tsx
validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
```

The Svelte page parses the same shape from the address:

```ts
const search = orderSearch.parse(Object.fromEntries(url.searchParams));
```

### Split one chunk per route and per language

**Requirement:** A frontend MUST load each route and each language as its own chunk, with no icon set or language imported whole.

**Rationale:** A signed-in user opens one address and reads one language. A reader in Dutch who never leaves the dashboard should not download English. This realizes litespec/frontend/rendering#load-each-route-and-each-language-separately.

**Example:** `loadDictionary` returns a dynamic import of one language. The React router plugin splits each route file, and SvelteKit splits each route folder.

### Load a route on intent

**Requirement:** A frontend MUST prefetch the route a pointer is over, and never treat that prefetch as a cache beyond the query cache.

**Rationale:** Most navigations then render from the cache the loaders already filled. A router caching a second time serves a stale answer beside a fresh one. This realizes litespec/frontend/rendering#prefetch-a-route-on-intent.

### Define route metadata deliberately

**Requirement:** A public route MUST define its title, its description, its canonical address, and its indexing policy, while a private route refuses indexing.

**Rationale:** The metadata is what a search result and a shared link show. An indexed console exposes an address a signed-in user believes is private.

**Example:** A channel route states `og:*` tags and one alternate per language. A console route ships a `noindex` meta tag in its document.

### Keep authenticated caching explicit

**Requirement:** Actor-specific data MUST declare its cache key, partition, invalidation owner, and security review before caching, beside the query definition setting the key.

**Rationale:** Shared route or loader behavior otherwise serves one actor's data to another. An uncached read is the safe default. A cache partitioned per request is the safe server shape. This realizes litespec/frontend/rendering#keep-authenticated-caching-explicit.

### Keep proxy behavior at the edge

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** The proxy runs before the request reaches the API. It cannot see the resource authorization depends on. Forwarding the API's own paths gives the browser one origin. That makes an HTTP-only session cookie a first-party cookie of the page. This realizes litespec/frontend/rendering#keep-proxy-behavior-at-the-edge.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server query cache per request

**Requirement:** A server-rendered frontend MUST construct its query cache inside each request.

**Rationale:** Two readers served at the same time must not read each other's data. A cache outliving one request would serve the next reader the previous reader's answer. This realizes litespec/frontend/rendering#build-the-server-data-cache-per-request.

## Conventions

### Use a pathless layout route for a shell

**Default:** Give a shell a layout holding the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A layout adds no address segment, so the shell never appears in a link. This realizes litespec/frontend/rendering#use-a-shared-layout-for-a-shell.

## Reference example

This informative example demonstrates `litespec/frontend/web/rendering#load-route-data-in-the-loader`, `litespec/frontend/web/rendering#keep-search-parameters-validated-by-a-schema`, and `litespec/frontend/web/rendering#read-route-data-with-a-suspense-query`.

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

The route resolves its input and composes the floorplan. The query definition owns the typed call. The table owns the columns. A route links to its use cases through the generated client calls in its code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/rendering#load-route-data-in-the-loader | guidance | Does each route that reads declare a loader that prefetches it? |
| litespec/frontend/web/rendering#read-route-data-with-a-suspense-query | guidance | Does each read name the key its loader filled? |
| litespec/frontend/web/rendering#keep-search-parameters-validated-by-a-schema | guidance | Does each route declare its search in a schema, with no direct reads? |
| litespec/frontend/web/rendering#split-one-chunk-per-route-and-per-language | checkable | `pnpm build` reports one output chunk per route and one per language. |
| litespec/frontend/web/rendering#load-a-route-on-intent | guidance | Does the router preload the route a pointer is over, with no second cache? |
| litespec/frontend/web/rendering#define-route-metadata-deliberately | guidance | Does each public route state four values, and each private route refuse indexing? |
| litespec/frontend/web/rendering#keep-authenticated-caching-explicit | guidance | Does each cached actor-specific read declare its key, boundary, owner, and review? |
| litespec/frontend/web/rendering#keep-proxy-behavior-at-the-edge | guidance | Does any proxy rule decide the actor or what the actor may read? |
| litespec/frontend/web/rendering#build-the-server-query-cache-per-request | checkable | `grep -c createQueryClient` (React) or `grep -c 'new QueryClient'` (Svelte) counts one construction in the request factory. |
| litespec/frontend/web/rendering#use-a-pathless-layout-route-for-a-shell | guidance | Does each shell sit in a shared layout? |
