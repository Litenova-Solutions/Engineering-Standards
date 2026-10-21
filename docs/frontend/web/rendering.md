# Web Rendering and Routes

## Intent

A route in a TypeScript web frontend prefetches its reads in a loader, declares its search parameters in a schema, and reads through the query cache. This page states how the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) follow the rendering rules in [Frontend Rendering and Routes](../rendering.md): loaders, suspense reads, validated search, chunk splitting, intent preloading, metadata, caching, proxies, and the per-request server cache. A team that applies it while writing routes keeps every navigation fast, shareable, and free of stale or cross-actor data.

Rules with no neutral counterpart bind the web stacks alone.

## React

React routes are files using the router's file convention, and the router builds the typed route tree from them. Each route declares its search parameters in `validateSearch` and prefetches its reads in its loader. Components read route data with `useSuspenseQuery` over the key the loader filled, and intent preloading fills the query cache before navigation. A shell is a pathless layout route whose file name starts with an underscore. Server-only code lives in a file whose name and import show the server ownership.

## Svelte

Svelte routes are folders under `src/routes`, each holding a page, and the toolkit generates the route types from them. Each page declares its parameters in a schema and prefetches its reads in its load. Pages read route data with a query creator over the key the load filled, and intent preloading fills the query cache before navigation. A shell is a layout file holding the frame every child page shares. Server-only code lives in a server file or under the server library.

In Svelte terms: a page is a route file, a load is a loader, and a query creator is a suspense query.

## Standards

### Load route data in the loader

**Requirement:** A route's loader MUST prefetch each read it needs through the query cache before the component runs.

**Rationale:** A loader that prefetches each read through the query cache lets the page render with its data instead of appearing first and spinning after. The cache owns freshness, so the router holds no second copy that could disagree with it. This realizes litespec/frontend/rendering#load-route-data-before-rendering.

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

**Rationale:** The loader filled one cache key, and the component reads that same key. A read naming another key issues a second request, and the two answers can disagree. A failed read reaches the route's error boundary, which draws the shared problem state instead of a half-rendered page. This realizes litespec/frontend/rendering#read-route-data-from-the-route-cache.

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

**Rationale:** A filter declared in a schema makes the filtered list a link: shareable, bookmarkable, reopenable. The same filter in component state reaches nobody and is lost on the first navigation away. Validation keeps a hand-edited address from reaching the page as values the page cannot interpret. This realizes litespec/frontend/rendering#keep-address-parameters-validated-by-a-schema.

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

**Rationale:** A signed-in user opens one address and reads one language, so the download should match: one chunk per route and one per language, with no icon set or language imported whole. Anything more makes a reader wait for code and words they will never see, like a Dutch reader downloading English for a dashboard they never leave. This realizes litespec/frontend/rendering#load-each-route-and-each-language-separately.

**Example:** `loadDictionary` returns a dynamic import of one language. The React router plugin splits each route file, and SvelteKit splits each route folder.

### Load a route on intent

**Requirement:** A frontend MUST prefetch the route a pointer is over, and never treat that prefetch as a cache beyond the query cache.

**Rationale:** Prefetching the route a pointer is over fills the query cache before the click, so most navigations render from data already held. The prefetch must never act as a second cache beyond the query cache: two caches serve a stale answer beside a fresh one with no error anywhere. This realizes litespec/frontend/rendering#prefetch-a-route-on-intent.

### Define route metadata deliberately

**Requirement:** A public route MUST define its title, its description, its canonical address, and its indexing policy, while a private route refuses indexing.

**Rationale:** A public route's title, description, canonical address, and indexing policy are what a search result and a shared link show; without them the page arrives as a bare address. A private route refuses indexing, because an indexed console address exposes to search what a signed-in user believes is private.

**Example:** A channel route states `og:*` tags and one alternate per language. A console route ships a `noindex` meta tag in its document.

### Keep authenticated caching explicit

**Requirement:** Actor-specific data MUST declare its cache key, partition, invalidation owner, and security review before caching, beside the query definition setting the key.

**Rationale:** A cache that outlives its actor serves one reader's data to another, so actor-specific data stays uncached until its cache key, partition, invalidation owner, and security review are declared beside the query definition that sets the key. A cache partitioned per request is the safe server shape, and an uncached read is the safe default. This realizes litespec/frontend/rendering#keep-authenticated-caching-explicit.

### Keep proxy behavior at the edge

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** A development or edge proxy runs before the request reaches the API, so it cannot see the resource authorization depends on; any identity or permission decision it made would rest on missing facts. It routes only. Forwarding the API's own paths gives the browser one origin, which makes an HTTP-only session cookie a first-party cookie of the page. This realizes litespec/frontend/rendering#keep-proxy-behavior-at-the-edge.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server query cache per request

**Requirement:** A server-rendered frontend MUST construct its query cache inside each request.

**Rationale:** A server renders for many readers at once. A query cache built inside each request dies with its reader, so no reader sees another's data. A cache outliving one request would serve the next reader the previous reader's answer. This realizes litespec/frontend/rendering#build-the-server-data-cache-per-request.

## Conventions

### Use a pathless layout route for a shell

**Default:** Give a shell a layout holding the frame every child route shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shell is the frame every child route shares, and a layout holds it without adding an address segment. The shell then never appears in a link, and every child route inherits the same frame. This realizes litespec/frontend/rendering#use-a-shared-layout-for-a-shell.

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

The route resolves its input from the address, prefetches its reads, and composes the floorplan from module components. The query definition owns the typed call and the table owns its columns. The generated client calls in the route code are what link the route to its use cases.

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
