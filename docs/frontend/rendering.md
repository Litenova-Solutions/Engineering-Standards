# Frontend Rendering and Routes

## Intent


Next.js route files should expose server-first page composition and make browser-only boundaries explicit. The rendering choice follows data ownership and interaction needs rather than convenience.

## Agent Summary {#agent-summary}


- Server Components render unless a browser capability requires otherwise. (FRONTEND.RENDERING.SERVER.001)
- Every client directive names the capability requiring it. (FRONTEND.RENDERING.CLIENT.001)
- Request and route APIs are awaited. (FRONTEND.RENDERING.ASYNC.001)
- Route files compose; features hold the logic. (FRONTEND.RENDERING.ROUTES.001)
- Data-driven routes define every applicable state. (FRONTEND.RENDERING.STATE.001)
- Caching actor-specific data requires a declared key and owner. (FRONTEND.RENDERING.CACHE.001)
- Edge proxy rules stay coarse and never authorize resources. (FRONTEND.RENDERING.PROXY.001)
- Routes declare metadata, and private routes block indexing. (FRONTEND.RENDERING.METADATA.001)

## Standards


### Prefer server execution (FRONTEND.RENDERING.SERVER.001)

**Requirement:** A page or subtree MUST run as a Server Component unless a named browser capability requires client execution.

**Rationale:** Server execution keeps initial data, server-only tokens, and authorization-aware composition off the browser.

### Document client boundaries (FRONTEND.RENDERING.CLIENT.001)

**Requirement:** A `'use client'` directive MUST carry an adjacent comment naming the browser capability that requires it.

**Rationale:** The comment makes the boundary reviewable, so an unnecessary client subtree is visible in the diff.

**Example:**

```tsx
// Client boundary: the editor owns browser selection state.
'use client'
```

A generic comment such as `Client component` does not satisfy the convention.

### Await Next.js request APIs (FRONTEND.RENDERING.ASYNC.001)

**Requirement:** A route MUST await `params`, `searchParams`, `cookies`, and `headers` rather than read them synchronously.

**Rationale:** These APIs are asynchronous in the pinned Next.js release, so synchronous access relies on removed compatibility behavior.

### Keep route files as composition boundaries (FRONTEND.RENDERING.ROUTES.001)

**Requirement:** A page or layout MUST select shells, read route input, invoke feature functions, and compose UI without holding reusable logic.

**Rationale:** Validation, mutation logic, and view mapping stay in feature or shared modules where another route can reach them.

### Represent route states (FRONTEND.RENDERING.STATE.001)

**Requirement:** A data-driven route MUST define its loading, empty, error, forbidden, not-found, and ready behavior.

**Rationale:** A blank region while a request is pending or failed gives the reader no signal at all. Framework state files carry these.

### Keep authenticated caching explicit (FRONTEND.RENDERING.CACHE.001)

**Requirement:** Actor-specific or authorization-filtered data MUST declare a cache key, partition boundary, invalidation owner, and security review before it is cached.

**Rationale:** Shared route, fetch, or `use cache` behavior otherwise serves one actor's data to another. An uncached server read is the safe default.

### Keep proxy behavior at the edge (FRONTEND.RENDERING.PROXY.001)

**Requirement:** A `proxy.ts` rule MUST handle only coarse routing such as session presence, locale, or redirects.

**Rationale:** It runs before the request reaches the API, so it cannot see the target resource that authorization depends on.

### Define route metadata deliberately (FRONTEND.RENDERING.METADATA.001)

**Requirement:** A public route MUST define title, description, canonical behavior, and indexing policy, while a private route prevents indexing.

**Rationale:** A route that composes non-trivial use cases also carries a page specification.

## Conventions


### Use route groups for shells (FRONTEND.RENDERING.CONVENTION.001)

**Default:** Group routes that share a layout, navigation, or access composition under a named route group.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A group name describes audience or shell, such as `(public)` or `(admin)`, rather than a technical detail.

### Keep layouts stable (FRONTEND.RENDERING.CONVENTION.002)

**Default:** Keep layouts to persistent shell UI and providers that every child route needs.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature-specific provider wrapping the whole application forces unrelated routes to carry its cost.

### Keep server-only code identifiable (FRONTEND.RENDERING.CONVENTION.003)

**Default:** Mark a module that reads secrets, server tokens, request headers, or privileged clients as server-owned.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Only server code imports it, and the optional `server-only` package turns an accidental client import into a build error.

## Reference example

This informative example demonstrates `FRONTEND.RENDERING.SERVER.001`, `FRONTEND.RENDERING.ASYNC.001`, and `FRONTEND.RENDERING.ROUTES.001`.

```tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const post = await getPost(postId)

  return <PostDetails post={post} />
}
```

The route resolves input and composes the feature. `getPost` owns typed API access, while `PostDetails` owns presentation.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.RENDERING.SERVER.001 | inspection | `RenderBoundaryTests` asserts no page or large subtree is client-side without a named browser capability. |
| FRONTEND.RENDERING.CLIENT.001 | inspection | `node standards/tools/validate-ui.mjs` reports a `'use client'` directive with no adjacent capability comment. |
| FRONTEND.RENDERING.ASYNC.001 | inspection | `RenderBoundaryTests` asserts each request API access is awaited. |
| FRONTEND.RENDERING.ROUTES.001 | static | `RouteCompositionTests` asserts no route file declares validation, mutation, or mapping logic. |
| FRONTEND.RENDERING.STATE.001 | static | `RouteStateTests` asserts each data-driven route renders every applicable state. |
| FRONTEND.RENDERING.CACHE.001 | inspection | `CacheBoundaryTests` asserts no actor-specific read shares a cache entry across actors. |
| FRONTEND.RENDERING.PROXY.001 | inspection | `ProxyTests` asserts no proxy rule performs a resource ownership or authorization decision. |
| FRONTEND.RENDERING.METADATA.001 | static | `MetadataTests` asserts public routes declare the four values and private routes prevent indexing. |
| FRONTEND.RENDERING.CONVENTION.001 | inspection | Route review confirms each shared shell has a route group named for its audience. |
| FRONTEND.RENDERING.CONVENTION.002 | inspection | Layout review confirms each provider is required by every child route. |
| FRONTEND.RENDERING.CONVENTION.003 | inspection | `node standards/tools/validate-ui.mjs` reports a client module importing a server-owned path. |
