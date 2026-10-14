# Svelte Rendering and Routes

## Intent

A page answers three questions: what address is this, what data does it need, and which floorplan draws it. Everything else belongs in a module.

The render boundary is chosen by the audience the page serves. A console is already open, so it renders in the browser from a cache its load filled. A public page arrives from a link or a search result, so its first response carries its title, its description, and its links.

## Agent Summary {#agent-summary}

- A load fills the query cache before the page runs. (standards/rule/svelte-rendering.load-route-data-in-the-page-load)
- A page reads the key its load filled. (standards/rule/svelte-rendering.read-route-data-with-a-query-creator)
- List state lives in the address, behind a schema. (standards/rule/svelte-rendering.keep-page-parameters-validated-by-a-schema)
- Each route and each language is its own chunk. (standards/rule/svelte-rendering.split-one-chunk-per-route-and-per-language)
- A page states loading, empty, error, and not-found. (standards/rule/svelte-rendering.represent-route-states)
- A public page states its metadata, and a private page refuses indexing. (standards/rule/svelte-rendering.define-route-metadata-deliberately)
- A server render builds its cache per request. (standards/rule/svelte-rendering.build-the-server-query-cache-per-request)

## Standards

### Load route data in the page load (standards/rule/svelte-rendering.load-route-data-in-the-page-load)

**Requirement:** A page load MUST prefetch each read it needs through the query cache before the page renders.

**Rationale:** The page then renders with its data rather than showing a spinner after it has already appeared. The cache owns freshness, so the router never holds a second copy.

**Example:** An entity page prefetches its record and every read the record's own sections need.

```ts
export async function load({ parent, params }) {
  const { queryClient } = await parent();
  const order = await queryClient.ensureQueryData(orderQuery(params.orderId));

  if (order.eventId !== null) {
    await queryClient.ensureQueryData(eventQuery(order.eventId));
  }

  return { orderId: params.orderId };
}
```

### Read route data with a query creator (standards/rule/svelte-rendering.read-route-data-with-a-query-creator)

**Requirement:** A page MUST read route data with a query creator over the same cache key its load filled.

**Rationale:** A read naming another key issues a second request, and the two answers can disagree. A failed read reaches the page error boundary, which draws the shared problem state.

**Example:**

```ts
const order = createQuery(() => orderQuery(orderId));
```

### Keep page parameters validated by a schema (standards/rule/svelte-rendering.keep-page-parameters-validated-by-a-schema)

**Requirement:** A page MUST declare its parameters and its search fields in a validated schema, including its filters and its page.

**Rationale:** A filtered list is then a link somebody can share, bookmark, and reopen. A filter in component state reaches nobody and is lost on the first navigation away.

**Example:** The list schema declares its own text field and spreads the shared paging fields.

```ts
const search = orderSearch.parse(Object.fromEntries(url.searchParams));
```

### Split one chunk per route and per language (standards/rule/svelte-rendering.split-one-chunk-per-route-and-per-language)

**Requirement:** A frontend MUST load each route and each language as its own chunk, with no icon set or language imported whole.

**Rationale:** A signed-in user opens one address and reads one language. A reader in Dutch who never leaves the dashboard should not download English.

**Example:** `loadDictionary` returns a dynamic import of one language, and SvelteKit splits each route folder.

### Load a route on intent (standards/rule/svelte-rendering.load-a-route-on-intent)

**Requirement:** A frontend MUST prefetch the route a pointer is over, and never treat that prefetch as a cache beyond the query cache.

**Rationale:** Most navigations then render from the cache the loads already filled. A router caching a second time serves a stale answer beside a fresh one.

### Represent route states (standards/rule/svelte-rendering.represent-route-states)

**Requirement:** A data-driven page MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal at all. The root error page draws the shared outcome page.

These six are the states a page has. A control adds `disabled` and `pending` under `standards/rule/svelte-components.render-complete-states`, because both describe a control rather than a page. A page adds `not-found`, which a control does not, because a missing target resolves at the page.

### Define route metadata deliberately (standards/rule/svelte-rendering.define-route-metadata-deliberately)

**Requirement:** A public page MUST define its title, its description, its canonical address, and its indexing policy, while a private page refuses indexing.

**Rationale:** The metadata is what a search result and a shared link show. An indexed console exposes an address a signed-in user believes is private.

**Example:** A channel page states `og:*` tags and one alternate per language. A console page ships a `noindex` meta tag in its document.

### Keep authenticated caching explicit (standards/rule/svelte-rendering.keep-authenticated-caching-explicit)

**Requirement:** Actor-specific data MUST declare its cache key, its partition boundary, its invalidation owner, and its security review before it is cached.

**Rationale:** Shared route or load behaviour otherwise serves one actor's data to another. An uncached read is the safe default, and a cache partitioned per request is the safe server shape.

### Keep proxy behavior at the edge (standards/rule/svelte-rendering.keep-proxy-behavior-at-the-edge)

**Requirement:** A development or edge proxy rule MUST route only, and never decide who the actor is or what the actor may read.

**Rationale:** The proxy runs before the request reaches the API, so it cannot see the resource authorization depends on. Forwarding the API's own paths gives the browser one origin, which is what makes an HTTP-only session cookie a first-party cookie of the page.

**Example:** A development proxy forwards `/api` and `/auth` to the API and changes nothing else.

### Build the server query cache per request (standards/rule/svelte-rendering.build-the-server-query-cache-per-request)

**Requirement:** A server-rendered frontend MUST construct its query client inside each request.

**Rationale:** Two readers served at the same time must not read each other's data. A cache outliving one request would serve the next reader the previous reader's answer.

## Conventions

### Use a layout for a shell (standards/rule/svelte-rendering.use-a-layout-for-a-shell)

**Default:** Give a shell a layout file holding the frame every child page shares.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A layout adds no address segment, so the shell never appears in a link.

### Keep layouts stable (standards/rule/svelte-rendering.keep-layouts-stable)

**Default:** Keep a layout to the frame and the providers every child page needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature-specific provider wrapping the whole application forces unrelated pages to carry its cost.

### Keep server only code identifiable (standards/rule/svelte-rendering.keep-server-only-code-identifiable)

**Default:** Keep a module reading a request header, a cookie, or a server secret in a server file or under the server library.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A server file never ships to the browser, and a library name carries the same fact to a reader.

## Reference example

This informative example demonstrates `standards/rule/svelte-rendering.load-route-data-in-the-page-load`, `standards/rule/svelte-rendering.keep-page-parameters-validated-by-a-schema`, and `standards/rule/svelte-rendering.read-route-data-with-a-query-creator`.

```svelte
<script lang="ts">
  import OrdersPage from '$lib/modules/orders/orders/search-merchant-orders/orders-page.svelte';

  let { data } = $props();
</script>

<OrdersPage search={data.search} />
```

The page resolves its input and composes the floorplan. The query creator owns the typed call, and the table owns the columns.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/svelte-rendering.load-route-data-in-the-page-load | inspection | Page review confirms each page that reads declares a load that prefetches it. |
| standards/rule/svelte-rendering.read-route-data-with-a-query-creator | inspection | Page review confirms each read names the key its load filled. |
| standards/rule/svelte-rendering.keep-page-parameters-validated-by-a-schema | static | `pnpm type-check` fails on a page whose search field is absent from its schema. |
| standards/rule/svelte-rendering.split-one-chunk-per-route-and-per-language | test | `pnpm build` reports one output chunk per route folder and one per dictionary language. |
| standards/rule/svelte-rendering.load-a-route-on-intent | inspection | Router configuration review confirms intent preloading and no second cache. |
| standards/rule/svelte-rendering.represent-route-states | test | `tests/routes/every-route.spec.ts` renders an absent address and asserts the outcome page. |
| standards/rule/svelte-rendering.define-route-metadata-deliberately | inspection | Document review confirms each public page states four values and each console refuses indexing. |
| standards/rule/svelte-rendering.keep-authenticated-caching-explicit | inspection | Cache review confirms each server render builds its own cache and each mutation names what it invalidates. |
| standards/rule/svelte-rendering.keep-proxy-behavior-at-the-edge | inspection | Proxy configuration review confirms no proxy rule reads a permission. |
| standards/rule/svelte-rendering.build-the-server-query-cache-per-request | test | `grep -c 'new QueryClient' src/lib/app` finds one call inside the client factory. |
| standards/rule/svelte-rendering.use-a-layout-for-a-shell | inspection | Page review confirms each shell sits in a layout file shared by its pages. |
| standards/rule/svelte-rendering.keep-layouts-stable | inspection | Layout review confirms each provider is required by every child page. |
| standards/rule/svelte-rendering.keep-server-only-code-identifiable | inspection | Import review confirms each server-owned module sits in a file named for the server. |
