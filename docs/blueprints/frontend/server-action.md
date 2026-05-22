# Blueprint: Server Action with Validation

Complete Server Action pattern with Zod validation, ProblemDetails error mapping, and cache revalidation.

---

## Action File

```typescript
// apps/web/domain/posts/create/actions.ts
"use server"

import { revalidateTag } from "next/cache"
import { z } from "zod"
import { getApiClient } from "@/lib/api/client"
import { parseApiError } from "@/lib/errors/parseApiError"

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

export type CreatePostFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }

export async function createPostAction(
  _prevState: CreatePostFormState,
  formData: FormData,
): Promise<CreatePostFormState> {
  const parsed = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const client = await getApiClient()
  const { error } = await client.POST("/api/v1/posts", {
    body: parsed.data,
  })

  if (error) {
    const problem = parseApiError(error)
    return { status: "error", message: problem.title }
  }

  revalidateTag("posts")
  return { status: "success" }
}
```

Import `z` from `"zod"` (Zod 4 is the default export on npm). Do not use `"zod/v4"` unless the project lockfile still pins the subpath export.

---

## Form Component

```typescript
// apps/web/domain/posts/create/CreatePostForm.tsx
"use client" // useActionState requires a client boundary

import { useActionState } from "react"
import { createPostAction, type CreatePostFormState } from "./actions"

const initialState: CreatePostFormState = { status: "idle" }

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, initialState)

  return (
    <form action={formAction}>
      <input name="title" aria-invalid={!!state.fieldErrors?.title} />
      {state.fieldErrors?.title?.map((msg) => (
        <p key={msg} role="alert">{msg}</p>
      ))}
      <textarea name="content" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Create post"}
      </button>
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert">{state.message}</p>
      )}
    </form>
  )
}
```

See `docs/conventions/frontend/04-state-and-forms.md` and `docs/conventions/frontend/08-error-handling-and-problem-details.md`.
