# Rendering and Routes

## Intent


Next.js route files should expose server-first page composition and make browser-only boundaries explicit. The rendering choice follows data ownership and interaction needs rather than convenience.

## Agent Summary {#agent-summary}


- Prefer server execution. (FRONTEND.SERVER.001)
- Document client boundaries. (FRONTEND.CLIENT.001)
- Await Next.js request APIs. (FRONTEND.ASYNC.001)
- Keep route files as composition boundaries. (FRONTEND.ROUTES.001)
- Represent route states. (FRONTEND.STATES.001)
- Keep authenticated caching explicit. (FRONTEND.CACHE.001)
- Keep proxy behavior at the edge. (FRONTEND.PROXY.001)
- Define route metadata deliberately. (FRONTEND.METADATA.001)

## Standards


### Prefer server execution (FRONTEND.SERVER.001)

**Requirement:** Frontends MUST prefer server execution.

**Rationale:** The implementation uses Server Components for initial data, server-only tokens, authorization-aware composition, and markup that does not require browser behavior.

The implementation does not mark a page or large subtree as client-side only to avoid extracting one interactive child.

### Document client boundaries (FRONTEND.CLIENT.001)

**Requirement:** Frontends MUST document client boundaries.

**Rationale:** Every `'use client'` directive has an adjacent comment naming the browser capability that requires it.

**Example:**

```tsx
// Client boundary: the editor owns browser selection state.
'use client'
```

A generic comment such as `Client component` does not satisfy the convention.

### Await Next.js request APIs (FRONTEND.ASYNC.001)

**Requirement:** Frontends MUST await Next.js request APIs.

**Rationale:** The implementation awaits asynchronous request and route APIs, including `params`, `searchParams`, `cookies`, and `headers`. The implementation does not rely on compatibility behavior from earlier Next.js versions.

### Keep route files as composition boundaries (FRONTEND.ROUTES.001)

**Requirement:** Frontends MUST keep route files as composition boundaries.

**Rationale:** Pages and layouts select shells, read route input, invoke server-side feature functions, and compose feature UI. Reusable behavior, validation, mutation logic, and view mapping remain in feature or shared modules.

### Represent route states (FRONTEND.STATES.001)

**Requirement:** Frontends MUST represent route states.

**Rationale:** Every data-driven route defines applicable loading, empty, error, forbidden, not-found, and ready behavior. The implementation does not render an empty blank region while a request is pending or failed.

The implementation uses framework `loading.tsx`, `error.tsx`, and `not-found.tsx` where the state belongs to the route segment. The implementation uses feature state components where only one feature is affected.

When a layout guards existence and calls `notFound()`, the parent segment contains the `not-found.tsx` boundary. A segment's own `not-found.tsx` renders as a child of that segment's layout. It cannot render a `notFound()` thrown by the layout itself. The closest parent boundary handles that throw.

The implementation verifies the not-found state in a browser. Parallel rendering can stream partial output before the boundary replaces it in the DOM. Route groups and multiple root layouts change the closest boundary. The test identifies the boundary that catches the throw.

### Keep authenticated caching explicit (FRONTEND.CACHE.001)

**Requirement:** Frontends MUST keep authenticated caching explicit.

**Rationale:** The implementation does not share route, fetch, or `use cache` behavior for actor-specific or authorization-filtered data. Such data needs a cache key, partition boundary, invalidation owner, and security review.

Uncached server reads are the baseline for authenticated data.

### Keep proxy behavior at the edge (FRONTEND.PROXY.001)

**Requirement:** Frontends MUST keep proxy behavior at the edge.

**Rationale:** The implementation uses `proxy.ts` for coarse routing concerns such as session presence, locale selection, or redirects. It does not replace API authorization or resource ownership checks.

### Define route metadata deliberately (FRONTEND.METADATA.001)

**Requirement:** Frontends MUST define route metadata deliberately.

**Rationale:** Public routes define title, description, canonical behavior, and indexing policy when applicable. Authenticated and private routes prevent indexing.

The implementation creates a page specification defined by the engineering system when route composition meets the page trigger.

## Conventions


### Use route groups for shells (FRONTEND.RENDERING.CONVENTION.001)

**Default:** Use route groups for shells.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses route groups such as `(public)`, `(author)`, or `(admin)` when multiple routes share layout, navigation, or access composition. Route group names describe audience or shell, not technical implementation.

### Keep layouts stable (FRONTEND.RENDERING.CONVENTION.002)

**Default:** Keep layouts stable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Layouts own persistent shell UI and providers required by all child routes. Feature-specific state providers stay near the feature and do not wrap the complete application.

### Keep server-only code identifiable (FRONTEND.RENDERING.CONVENTION.003)

**Default:** Keep server-only code identifiable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A file that reads secrets, server tokens, request headers, or privileged clients is server-owned. Only server code imports that module. The framework keeps server dependencies outside browser bundles. The optional `server-only` package rejects accidental client imports. The implementation uses it only when the manifest pins it.

## Reference example

This informative example demonstrates `FRONTEND.SERVER.001`, `FRONTEND.ASYNC.001`, and `FRONTEND.ROUTES.001`.

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
| FRONTEND.SERVER.001 | inspection | Pull request review asserts `prefer server execution` in the owning specification and source paths. |
| FRONTEND.CLIENT.001 | inspection | Pull request review asserts `document client boundaries` in the owning specification and source paths. |
| FRONTEND.ASYNC.001 | inspection | Pull request review asserts `await Next.js request APIs` in the owning specification and source paths. |
| FRONTEND.ROUTES.001 | static | Repository static check asserts `keep route files as composition boundaries` for the owning paths. |
| FRONTEND.STATES.001 | static | Repository static check asserts `represent route states` for the owning paths. |
| FRONTEND.CACHE.001 | inspection | Pull request review asserts `keep authenticated caching explicit` in the owning specification and source paths. |
| FRONTEND.PROXY.001 | inspection | Pull request review asserts `keep proxy behavior at the edge` in the owning specification and source paths. |
| FRONTEND.METADATA.001 | static | Repository static check asserts `define route metadata deliberately` for the owning paths. |
| FRONTEND.RENDERING.CONVENTION.001 | static | Repository static check asserts `use route groups for shells` for the owning paths. |
| FRONTEND.RENDERING.CONVENTION.002 | inspection | Pull request review asserts `keep layouts stable` in the owning specification and source paths. |
| FRONTEND.RENDERING.CONVENTION.003 | inspection | Pull request review asserts `keep server-only code identifiable` in the owning specification and source paths. |
