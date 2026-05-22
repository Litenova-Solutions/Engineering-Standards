# Data Fetching Conventions

## Agent Quick Rules

- Server state MUST use TanStack Query or Server Components; MUST NOT live in Zustand.
- Form mutations MUST use Server Actions with Zod in the action file.
- Non-form mutations MUST use `useMutation` with `getApiClient()`; MUST NOT use raw `fetch` or Axios.
- MUST NOT fetch in `useEffect` for server data.
- List pages MUST implement loading, empty, error, and loaded states.
- `revalidateTag` MUST be called in Server Actions after a mutation; `updateTag` is for optimistic updates only.
- All API calls MUST go through `getApiClient()`. MUST NOT call `fetch` directly against backend URLs.

## 1. The Three Kinds of State

Understanding state categories is the conceptual foundation of the entire data fetching strategy. Conflating them produces overcomplicated systems.

**Server state** is data that lives on the server and is fetched over the network: posts, users, orders, inventory. The frontend holds a cached copy. That copy can be stale. The server is the source of truth, and the frontend's job is to display a reasonably fresh version of it and to send mutations back. Server state is not owned by the frontend.

**UI state** is ephemeral state that exists only in the browser: whether a modal is open, which tab is selected, whether a dropdown is expanded. It is lost on page refresh, which is correct behavior. It does not need to be synchronized with anything.

**URL state** is state encoded in the URL: current page number, search filters, sort order, selected item ID. It persists across refreshes and is shareable via link. It is the correct home for any state that a user should be able to bookmark or share.

The architectural rule: server state belongs in TanStack Query or server components. UI state belongs in Zustand or `useState`. URL state belongs in the URL. Never put server data in Zustand. Never put UI state in TanStack Query. Never fetch data in `useEffect`.

```typescript
// GOOD: server state in TanStack Query, UI state in useState, URL state in search params
function PostListPage() {
  // Server state: in TanStack Query
  const { data: posts } = usePostList()

  // UI state: in useState
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // URL state: in search params (read via useSearchParams)
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") ?? "1")

  // ...
}
```

```typescript
// BAD: server state stored in Zustand, UI state fetched via useEffect
const usePostStore = create((set) => ({
  posts: [],  // BAD: server data in Zustand
  fetchPosts: async () => {
    const posts = await fetch("/api/posts").then(r => r.json())
    set({ posts })  // BAD: manual server state management
  }
}))

function PostListPage() {
  const { posts, fetchPosts } = usePostStore()
  useEffect(() => { fetchPosts() }, [])  // BAD: useEffect for data fetching
}
```

---

## 2. Server Components for Initial Data

Server components fetch data on the server with zero JavaScript sent to the client. This is the default pattern for data that is fetched once per page load and does not need client-side freshness.

The API client factory reads the session token from the httpOnly cookie and attaches it as a Bearer token:

```typescript
// lib/api/client.ts
import createClient from "openapi-fetch"
import { cookies } from "next/headers"
import type { paths } from "@workspace/api-types"

// IMPORTANT: openapi-fetch has moved to maintenance mode (May 2026).
// The source is copied into packages/api-client/ rather than installed from npm.
// See `docs/decisions/openapi-typescript-client-generation.md` for the decision.

export async function getApiClient() {
  // cookies() is async in Next.js 15+/16 - must be awaited
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  return createClient<paths>({
    // API_BASE_URL has no NEXT_PUBLIC_ prefix intentionally.
    // Server Components read it at request time from process.env.
    // When running under Aspire, this value is injected at process startup via
    // WithEnvironment("API_BASE_URL", api.GetEndpoint("http")).
    // NEXT_PUBLIC_ variables are baked into the client bundle at build time and
    // cannot receive Aspire-injected values in a pre-built container.
    baseUrl: process.env.API_BASE_URL!,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  })
}
```

A complete server component using this client:

```typescript
// features/posts/list/PostListPage.tsx
import { notFound } from "next/navigation"
import { getApiClient } from "@/lib/api/client"
import { PostCard } from "./PostCard"
import type { PostId } from "@/lib/types/branded"

export async function PostListPage() {
  const client = await getApiClient()
  const { data, error } = await client.GET("/posts")

  if (error) {
    // 404 from the API maps to Next.js notFound()
    if (error.status === 404) notFound()
    // Other errors propagate to the nearest error.tsx boundary
    throw new Error(error.detail ?? "Failed to load posts")
  }

  return (
    <div>
      {data.map(post => (
        <PostCard
          key={post.id}
          id={post.id as PostId}
          title={post.title}
          publishedAt={post.publishedAt ? new Date(post.publishedAt) : null}
        />
      ))}
    </div>
  )
}
```

---

## 3. TanStack Query for Client-Side Data

TanStack Query manages server state that needs client-side freshness: background refetching, window-focus refetching, polling, infinite scroll, and cache sharing across multiple client components. It is not needed for data fetched once in a server component.

**Provider setup:**

```typescript
// components/providers/QueryProvider.tsx
"use client"
// Needs useState to create a per-request QueryClient - client component required.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient MUST be created with useState to avoid sharing across requests.
  // A shared singleton QueryClient leaks data between users in server-side rendering.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Query key convention:**

```typescript
// features/posts/shared/queryKeys.ts
import type { PostId, AuthorId } from "@/lib/types/branded"

// Query keys are defined as a const object per feature.
// This mirrors the backend aggregate and query naming.
export const postQueryKeys = {
  all: ["posts"] as const,
  byId: (id: PostId) => ["posts", id] as const,
  byAuthor: (authorId: AuthorId) => ["posts", "byAuthor", authorId] as const,
  published: () => ["posts", "published"] as const,
}
```

**A complete `useQuery` hook:**

```typescript
// features/posts/list/usePostList.ts
import { useQuery } from "@tanstack/react-query"
import { getApiClient } from "@/lib/api/client"
import { postQueryKeys } from "../shared/queryKeys"

// This hook is for client components that need live post data.
// For initial page rendering, use the server component pattern in Section 2 instead.
export function usePostList() {
  return useQuery({
    queryKey: postQueryKeys.all,
    queryFn: async () => {
      const client = await getApiClient()
      const { data, error } = await client.GET("/posts")
      if (error) throw new Error("Failed to fetch posts")
      return data
    },
  })
}
```

---

## 4. Server Actions as the Primary Mutation Pattern

Server Actions MUST be used for all mutations triggered by form submissions. They run on the server, validate input with Zod, call the backend API, and return a result. They use the `"use server"` directive and MUST be in separate files from client components.

TanStack Query `useMutation` is permitted only for non-form interactions (see Section 5). Form submissions MUST NOT bypass Server Actions in favor of client-side `fetch` or `useMutation`.

```typescript
// features/posts/create/createPost.action.ts
"use server"

import { redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { getApiClient } from "@/lib/api/client"
import { createPostSchema } from "./createPost.schema"

type CreatePostResult =
  | { success: true; postId: string }
  | { success: false; errors: Record<string, string[]>; message: string }

export async function createPostAction(
  _prevState: CreatePostResult | null,
  formData: FormData
): Promise<CreatePostResult> {
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    slug: formData.get("slug"),
  }

  // Validate with Zod 4
  const parsed = createPostSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Validation failed. Please check the fields below.",
    }
  }

  const client = await getApiClient()
  const { data, error } = await client.POST("/posts", { body: parsed.data })

  if (error) {
    if (error.status === 409) {
      return {
        success: false,
        errors: {},
        message: error.detail ?? "A conflict occurred.",
      }
    }
    throw new Error(error.detail ?? "Failed to create post")
  }

  // Use updateTag (not revalidateTag) in Server Actions after mutations.
  // updateTag provides read-your-writes semantics: the user sees their new post immediately.
  updateTag("posts")

  return { success: true, postId: data.id }
}
```

> **`updateTag` vs `revalidateTag` decision table:**
>
> | Situation | Function | Reason |
> |:---|:---|:---|
> | Server Action after user mutation | `updateTag("tag")` | User must see their change immediately |
> | Background job or webhook | `revalidateTag("tag", "max")` | Stale-while-revalidate is acceptable |
> | Route Handler | `revalidateTag("tag", "max")` | `updateTag` is Server Actions only |
>
> `updateTag` immediately expires the cached data for the specified tag. The next request fetches fresh data rather than serving stale content. `updateTag` can only be used in Server Actions. For Route Handlers, use `revalidateTag("tag", "max")` instead.
```

---

## 5. TanStack Query Mutations for Non-Form Interactions

Non-form mutations (toggle, reorder, inline edit) **MUST** use TanStack Query `useMutation` with `getApiClient()`, not raw `fetch` or Axios.

```typescript
// GOOD: features/posts/publish/usePublishPost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getApiClient } from "@/lib/api/client"
import { postQueryKeys } from "../shared/queryKeys"
import type { PostId } from "@/lib/types/branded"

export function usePublishPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: PostId) => {
      const client = await getApiClient()
      const { data, error } = await client.POST("/posts/{id}/publish", {
        params: { path: { id: postId } },
      })
      if (error) throw new Error("Failed to publish post")
      return data
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.byId(postId) })
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all })
    },
  })
}
```

```typescript
// BAD: raw fetch bypasses typed OpenAPI client
mutationFn: async (postId: PostId) => {
  const response = await fetch(`/api/posts/${postId}/publish`, { method: "POST" })
}
```

---

## 6. Error Handling from API Responses

The ASP.NET Core backend returns `ProblemDetails` (RFC 7807) responses. The frontend maps HTTP status codes to specific UI behaviors:

```typescript
// lib/api/errors.ts
import { notFound } from "next/navigation"

type ProblemDetails = {
  status: number
  title: string
  detail?: string
  errors?: Record<string, string[]>
}

// Maps ProblemDetails HTTP status codes to frontend behaviors.
// Mirrors the GlobalExceptionHandler on the backend.
export function handleApiError(error: ProblemDetails): never {
  switch (error.status) {
    case 400:
      // CommandValidationException or QueryValidationException: show field errors
      throw new ValidationError(error.detail ?? "Validation failed", error.errors)
    case 401:
      // Not authenticated: redirect to login
      throw new Error("redirect:/login")
    case 403:
      // Not authorized: show forbidden message
      throw new ForbiddenError(error.detail ?? "You do not have permission to perform this action.")
    case 404:
      // AggregateNotFoundException: show not found page
      notFound()
    case 409:
      // DomainException: show conflict message to user
      throw new DomainError(error.detail ?? "This action conflicts with the current state.")
    default:
      throw new Error(error.detail ?? "An unexpected error occurred.")
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DomainError"
  }
}
```

---

## 7. Toast Notifications

`sonner` is the standard toast library. shadcn/ui deprecated its own `toast` component in favor of `sonner`. Never use the shadcn/ui `toast` component.

**Root layout setup:**

```typescript
// app/layout.tsx (excerpt)
import { Toaster } from "sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
```

**Showing toasts after a Server Action using `useActionState`:**

```typescript
// features/posts/create/CreatePostForm.tsx (excerpt)
"use client"
// Needs useActionState and toast notifications - client component required.

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { createPostAction } from "./createPost.action"

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, null)

  useEffect(() => {
    if (state?.success === true) {
      toast.success("Post created successfully.")
    } else if (state?.success === false && !Object.keys(state.errors).length) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  )
}
```

---

## 8. Pagination

**URL-based pagination** is the default for server-rendered pages. `searchParams` is a `Promise` in Next.js 16 and MUST be awaited:

```typescript
// GOOD: URL-based pagination in a server component
type Props = {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}

async function PostListPage({ searchParams }: Props) {
  // searchParams is a Promise in Next.js 15+/16 - must be awaited
  const { page = "1", pageSize = "20" } = await searchParams
  const client = await getApiClient()
  const { data } = await client.GET("/posts", {
    params: { query: { page: parseInt(page), pageSize: parseInt(pageSize) } }
  })
  // ...
}
```

**Infinite scroll** uses TanStack Query `useInfiniteQuery`:

```typescript
// features/posts/list/useInfinitePosts.ts
import { useInfiniteQuery } from "@tanstack/react-query"
import { postQueryKeys } from "../shared/queryKeys"

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: postQueryKeys.published(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts?page=${pageParam}&pageSize=20`)
      if (!response.ok) throw new Error("Failed to fetch posts")
      return response.json()
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  })
}
```

---

## 9. Authorization in Data Fetching

Authorization is enforced on the server. Frontend checks are for user experience only.

Server components, Server Actions, and Route Handlers that read protected data MUST call the project auth helper and pass the authenticated token to the backend API client.

```typescript
// GOOD: Server Action checks auth before mutation
"use server"

import { auth } from "@/lib/auth"
import { getApiClient } from "@/lib/api/client"

export async function assignTicketAction(ticketId: string, assigneeId: string) {
  const session = await auth()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const client = await getApiClient()
  return client.POST("/tickets/{id}/assign", {
    params: { path: { id: ticketId } },
    body: { assigneeId },
  })
}
```

```typescript
// BAD: UI hiding is treated as authorization
if (!user.isAdmin) return null
await fetch("/api/admin/delete-user", { method: "POST" })
```

Client components may hide or disable controls based on permissions, but the backend and Server Actions must still enforce authorization.

---

## 10. Real-Time Updates

Real-time messages are invalidation signals. They do not replace server reads.

Use SignalR only from client components or client hooks. On a message, invalidate TanStack Query keys or call `router.refresh()` for server-rendered data. See `docs/conventions/shared/realtime-updates.md`.

```typescript
// GOOD: real-time event invalidates server state
connection.on("ticketChanged", (ticketId: string) => {
  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.byId(ticketId),
  })
})
```

```typescript
// BAD: real-time event stores server state in Zustand
connection.on("ticketChanged", (ticket) => {
  useTicketStore.setState({ ticket })
})
```

---

## 11. Loading and Empty States

Every route that fetches data MUST provide a loading state. Use `loading.tsx` for route-level streaming and component-level skeletons for nested Suspense boundaries.

List pages MUST define empty, loading, error, and loaded states. Empty state text MUST describe what the user can do next, not implementation details.

```typescript
// GOOD: route-level loading file
export default function Loading() {
  return <PostListSkeleton />
}
```

```typescript
// BAD: blank loading state
export default function Loading() {
  return null
}
```

---

## 12. Optimistic Updates

Use `useOptimistic` (React 19) when the optimistic state feeds back into a server-rendered component tree and the mutation is triggered by a Server Action. Use TanStack Query's built-in `variables` optimism for client-side mutations managed by `useMutation`.

**`useOptimistic` with a Server Action:**

```typescript
// features/posts/list/PostListWithOptimisticPublish.tsx
"use client"
// Needs useOptimistic for immediate UI feedback - client component required.

import { useOptimistic, useTransition } from "react"
import { publishPostAction } from "../publish/publishPost.action"
import type { Post } from "../shared/post.types"

type Props = {
  posts: Post[]
}

export function PostListWithOptimisticPublish({ posts }: Props) {
  const [optimisticPosts, addOptimisticPublish] = useOptimistic(
    posts,
    (currentPosts: Post[], publishedId: string) =>
      currentPosts.map(p =>
        p.id === publishedId ? { ...p, isPublished: true } : p
      )
  )
  const [, startTransition] = useTransition()

  const handlePublish = (postId: string) => {
    startTransition(async () => {
      addOptimisticPublish(postId)
      await publishPostAction(postId)
    })
  }

  return (
    <ul>
      {optimisticPosts.map(post => (
        <li key={post.id}>
          {post.title}
          {!post.isPublished && (
            <button onClick={() => handlePublish(post.id)}>Publish</button>
          )}
        </li>
      ))}
    </ul>
  )
}
```

---

## 13. TanStack Query Security Notice

> **Security Notice:** On May 11, 2026, malicious package versions were published to npm across 42 `@tanstack/*` packages (GitHub Security Advisory [GHSA-g7cv-rxg3-hmpx](https://github.com/advisories/GHSA-g7cv-rxg3-hmpx)). The confirmed-clean families include `@tanstack/query*`, `@tanstack/table*`, `@tanstack/form*`, `@tanstack/virtual*`, `@tanstack/store`, and `@tanstack/start`. **`@tanstack/react-query` was not in the compromised package list.** Other `@tanstack/*` packages may still be affected. Run `pnpm audit` before every install or upgrade and verify each `@tanstack/*` package version against the advisory.

The current pinned version is **5.100.10**. When upgrading, check the advisory for affected and remediated version ranges. See `docs/conventions/shared/supply-chain-security.md` for lockfile and CI audit requirements.

---

## 14. Project-Specific Data Fetching Configuration

Document API URLs, polling intervals, and auth token sources in `docs/domain/frontend-api-endpoints.md` and `lib/env.ts`.

---

## 15. Generated API Types — Non-Negotiable

All TypeScript types for API response shapes MUST come from the file generated by `openapi-typescript`. Never define inline interfaces or hand-written type aliases that duplicate API response structures.

This rule exists because hand-written interfaces drift from the API contract silently. A field rename or a new required property on the backend causes a runtime error that TypeScript cannot catch if the frontend types were written by hand.

### Generation workflow

Build-time OpenAPI generation (see `docs/conventions/shared/ci.md`):

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
cp apps/api/src/{ProjectName}.WebApi/bin/Release/net10.0/openapi.json packages/api-types/openapi.json
pnpm --filter @myproject/api-types generate:api-types
git add packages/api-types/openapi.json packages/api-types/src/api.d.ts
```

Run these steps whenever the backend API changes. The generated file is committed and versioned alongside the frontend code.

### `packages/api-types` workspace package

The `packages/api-types` package must be configured so TypeScript workspaces resolve it correctly.

`packages/api-types/package.json`:

```json
{
  "name": "@workspace/api-types",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/api.d.ts"
    }
  },
  "files": ["src"]
}
```

`packages/api-types/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.d.ts"]
}
```

### Import pattern

```typescript
// GOOD: types come from the generated file
import type { paths } from "@workspace/api-types"

type PostSummary = paths["/posts"]["get"]["responses"]["200"]["content"]["application/json"]["items"][number]
```

```typescript
// BAD: inline interface that duplicates the API contract
interface PostSummary {    // FORBIDDEN — this will drift from the actual API
  postId: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
}
```

```typescript
// BAD: hand-written type alias in a data fetching file
type PostDetail = {        // FORBIDDEN
  postId: string
  title: string
  content: string
  // ...
}
```

If the generated file does not exist yet, generate it before writing any fetch call. Do not stub it with `any` or create placeholder interfaces. The type generation step is part of the feature setup, not an afterthought.
