# Data Fetching Conventions

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
// See ADR 0012 for the decision.

export async function getApiClient() {
  // cookies() is async in Next.js 15+/16 — must be awaited
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  return createClient<paths>({
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
// Needs useState to create a per-request QueryClient — client component required.

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
// This mirrors the IPostReadStore interface naming on the backend.
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
import { postQueryKeys } from "../shared/queryKeys"

// This hook is for client components that need live post data.
// For initial page rendering, use the server component pattern in Section 2 instead.
export function usePostList() {
  return useQuery({
    queryKey: postQueryKeys.all,
    queryFn: async () => {
      const response = await fetch("/api/posts")
      if (!response.ok) throw new Error("Failed to fetch posts")
      return response.json()
    },
  })
}
```

---

## 4. Server Actions as the Primary Mutation Pattern

Server Actions are the default for all mutations triggered by form submissions. They run on the server, validate input with Zod, call the backend API, and return a result. They use the `"use server"` directive and MUST be in separate files from client components.

```typescript
// features/posts/create/createPost.action.ts
"use server"

import { redirect } from "next/navigation"
import { revalidateTag } from "next/cache"
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

  // Invalidate the posts cache after successful creation.
  // cacheLife second argument is required in Next.js 16.
  revalidateTag("posts", "minutes")

  return { success: true, postId: data.id }
}
```

---

## 5. TanStack Query Mutations for Non-Form Interactions

When a mutation is triggered by a non-form interaction (a toggle button, a drag-and-drop reorder, an inline edit), use TanStack Query `useMutation`:

```typescript
// features/posts/publish/usePublishPost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postQueryKeys } from "../shared/queryKeys"
import type { PostId } from "@/lib/types/branded"

export function usePublishPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: PostId) => {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail ?? "Failed to publish post")
      }
      return response.json()
    },
    onSuccess: (_, postId) => {
      // Invalidate the specific post and the post list
      queryClient.invalidateQueries({ queryKey: postQueryKeys.byId(postId) })
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all })
    },
  })
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
      // ApplicationValidationException: show field errors
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
// Needs useActionState and toast notifications — client component required.

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
  // searchParams is a Promise in Next.js 15+/16 — must be awaited
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

## 9. Optimistic Updates

Use `useOptimistic` (React 19) when the optimistic state feeds back into a server-rendered component tree and the mutation is triggered by a Server Action. Use TanStack Query's built-in `variables` optimism for client-side mutations managed by `useMutation`.

**`useOptimistic` with a Server Action:**

```typescript
// features/posts/list/PostListWithOptimisticPublish.tsx
"use client"
// Needs useOptimistic for immediate UI feedback — client component required.

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

## 10. TanStack Query Security Notice

> **Security Notice:** On May 11, 2026, malicious package versions were published to npm across 42 `@tanstack/*` packages (GitHub Security Advisory GHSA-g7cv-rxg3-hmpx). Verify your lockfile pins a version prior to the attack window or after remediation. Run `npm audit` or `pnpm audit` to check. Do not upgrade TanStack Query without verifying the specific version is safe.

The current verified safe version is **5.100.10**. Check the GitHub advisory for the full list of affected and remediated versions before upgrading.

---

## 11. Project-Specific Data Fetching Configuration

> **Project teams: fill in this section when adopting these standards.**

The following is project-specific and not defined in this standards file:

- **API base URL:** The value of `API_BASE_URL` for each environment and how it is validated at startup.
- **Custom query defaults:** Any project-specific `defaultOptions` for the `QueryClient` beyond the standard `staleTime`.
- **Cache invalidation strategies:** Which tags map to which backend resources and how they are revalidated after mutations.
- **Polling intervals:** Any resources that require polling (e.g., job status, notifications) and their intervals.
- **Authentication token source:** Which cookie name holds the access token and whether token refresh is handled client-side or by the backend.
