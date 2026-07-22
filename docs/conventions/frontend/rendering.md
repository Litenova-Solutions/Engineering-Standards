# Rendering and Routes

## Intent

Next.js route files should expose server-first page composition and make browser-only boundaries explicit. The rendering choice follows data ownership and interaction needs rather than convenience.

## Agent Summary {#agent-summary}

- Use Server Components for initial reads, server secrets, and non-interactive composition.
- Use Client Components only for browser APIs, event handlers, or local interactive state.
- Comment every `'use client'` directive with the browser requirement.
- Await `params`, `searchParams`, `cookies`, and `headers`.
- Keep `page.tsx` and layouts thin.
- Define loading, empty, error, forbidden, and ready states.
- Treat caching of authenticated data as an explicit security and correctness decision.

## Standards

### Prefer server execution (FRONTEND.SERVER.001)

Use Server Components for initial data, server-only tokens, authorization-aware composition, and markup that does not require browser behavior.

Do not mark a page or large subtree as client-side only to avoid extracting one interactive child.

### Document client boundaries (FRONTEND.CLIENT.001)

Every `'use client'` directive has an adjacent comment naming the browser capability that requires it.

```tsx
// Client boundary: the editor owns browser selection state.
'use client'
```

A generic comment such as `Client component` does not satisfy the convention.

### Await Next.js request APIs (FRONTEND.ASYNC.001)

Await asynchronous request and route APIs, including `params`, `searchParams`, `cookies`, and `headers`. Do not rely on compatibility behavior from earlier Next.js versions.

### Keep route files as composition boundaries (FRONTEND.ROUTES.001)

Pages and layouts select shells, read route input, invoke server-side feature functions, and compose feature UI. Reusable behavior, validation, mutation logic, and view mapping remain in feature or shared modules.

### Represent route states (FRONTEND.STATES.001)

Every data-driven route defines applicable loading, empty, error, forbidden, not-found, and ready behavior. Do not render an empty blank region while a request is pending or failed.

Use framework `loading.tsx`, `error.tsx`, and `not-found.tsx` where the state belongs to the route segment. Use feature state components where only one feature is affected.

When a layout guards existence and calls `notFound()`, place the `not-found.tsx` boundary in the parent segment, not the layout's own segment. A segment's own `not-found.tsx` renders as a child of that segment's layout, so it cannot render a `notFound()` thrown by the layout itself; that throw is handled by the closest boundary in a parent segment. Verify the not-found state in a browser: a page that renders in parallel can stream partial output into the flight response even though the boundary replaces it in the DOM. Route groups and multiple root layouts change which boundary is closest, so confirm the boundary that actually catches the throw.

### Keep authenticated caching explicit (FRONTEND.CACHE.001)

Do not apply shared route, fetch, or `use cache` behavior to actor-specific or authorization-filtered data without a documented cache key, partition boundary, invalidation owner, and security review.

Uncached server reads are the baseline for authenticated data.

### Keep proxy behavior at the edge (FRONTEND.PROXY.001)

Use `proxy.ts` for coarse routing concerns such as session presence, locale selection, or redirects. It does not replace API authorization or resource ownership checks.

### Define route metadata deliberately (FRONTEND.METADATA.001)

Public routes define title, description, canonical behavior, and indexing policy when applicable. Authenticated and private routes prevent indexing.

Create a page specification defined by the engineering system when route composition meets the page trigger.

## Conventions

### Use route groups for shells

Use route groups such as `(public)`, `(author)`, or `(admin)` when multiple routes share layout, navigation, or access composition. Route group names describe audience or shell, not technical implementation.

### Keep layouts stable

Layouts own persistent shell UI and providers required by all child routes. Feature-specific state providers stay near the feature and do not wrap the complete application.

### Keep server-only code identifiable

A file that reads secrets, server tokens, request headers, or privileged API clients is a clearly server-owned module, imported only by server code. That module boundary is the baseline requirement; the framework already bundles server dependencies without exposing them to the browser. The `server-only` package is an optional import-time guard that turns an accidental client import into a build error. It is not bundled by the framework as a dependency, so use it only when it is pinned in the manifest; otherwise rely on the module boundary.

## Examples

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

- Search for `'use client'` and inspect each adjacent reason.
- Search request APIs and confirm they are awaited.
- Inspect pages and layouts for embedded feature behavior.
- Test loading, empty, error, forbidden, not-found, and ready states that apply.
- Review every authenticated cache boundary.
- Confirm public metadata and private indexing behavior.
