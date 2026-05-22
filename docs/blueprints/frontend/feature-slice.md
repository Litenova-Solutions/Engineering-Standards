# Blueprint: Frontend Feature Slice

Complete vertical slice scaffold for a feature under `apps/web/features/{feature}/`. Adapt names to the feature spec.

---

## Directory Layout

```text
apps/web/features/posts/
├── list/
│   ├── PostListPage.tsx          ← feature entry; imported by app/(main)/posts/page.tsx
│   ├── PostList.tsx
│   ├── PostListSkeleton.tsx
│   ├── PostListEmpty.tsx
│   └── usePostList.ts            ← TanStack Query hook
├── detail/
│   ├── PostDetailPage.tsx
│   └── usePostDetail.ts
├── create/
│   ├── CreatePostForm.tsx
│   └── actions.ts                ← Server Actions with Zod validation
└── shared/
    └── postQueryKeys.ts          ← query key factory for this feature only
```

---

## Route Shell

```typescript
// apps/web/app/(main)/posts/page.tsx
import { PostListPage } from "@/features/posts/list/PostListPage"

export default function Page() {
  return <PostListPage />
}
```

---

## Query Hook

```typescript
// apps/web/features/posts/list/usePostList.ts
"use client" // Required: TanStack Query runs on the client

import { useQuery } from "@tanstack/react-query"
import { getApiClient } from "@/lib/api/client"
import { postQueryKeys } from "@/features/posts/shared/postQueryKeys"

export function usePostList(page: number) {
  return useQuery({
    queryKey: postQueryKeys.list(page),
    queryFn: async () => {
      const client = await getApiClient()
      const { data, error } = await client.GET("/api/v1/posts", {
        params: { query: { pageNumber: page, pageSize: 20 } },
      })
      if (error) {
        throw error
      }
      return data
    },
  })
}
```

---

## Feature Entry with Four States

```typescript
// apps/web/features/posts/list/PostListPage.tsx
"use client" // Composes client hooks and UI state

import { useSearchParams } from "next/navigation"
import { usePostList } from "./usePostList"
import { PostList } from "./PostList"
import { PostListSkeleton } from "./PostListSkeleton"
import { PostListEmpty } from "./PostListEmpty"

export function PostListPage() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const { data, isPending, isError, error } = usePostList(page)

  if (isPending) {
    return <PostListSkeleton />
  }

  if (isError) {
    return <p role="alert">{String(error)}</p>
  }

  if (!data?.items.length) {
    return <PostListEmpty />
  }

  return <PostList posts={data.items} />
}
```

See `docs/conventions/frontend/07-feature-boundaries.md` for import rules and `docs/conventions/frontend/03-data-fetching.md` for data patterns.
