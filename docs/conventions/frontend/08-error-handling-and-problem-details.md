# Error Handling and ProblemDetails

This document defines the standard for displaying, mapping, and handling backend errors in the frontend. Read it before implementing any form submission, mutation, or error display.

---

## Agent Quick Rules

- ALL API error responses follow the `ProblemDetails` (RFC 9457) shape. MUST NOT invent custom error formats.
- Validation errors come as `application/problem+json` with `400` status and an `invalidParams` extension array.
- Field errors MUST be mapped to form fields using `setError` (React Hook Form) or `useActionState` (Server Actions).
- Toast notifications are for non-field errors only (domain errors, network failures, unexpected 5xx).
- Error boundaries catch render errors; they do not handle API errors.
- MUST NOT expose raw `Error.message` strings from `catch` blocks to users.

---

## 1. ProblemDetails Response Shape

The backend returns RFC 9457 `ProblemDetails` for all errors. The content type is `application/problem+json`.

```typescript
// lib/errors/problem-details.ts
export type ProblemDetails = {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  // Validation extension: field-level errors
  invalidParams?: InvalidParam[]
  // Other extensions may appear (traceId, etc.)
  [key: string]: unknown
}

export type InvalidParam = {
  name: string        // field path — matches command property name in camelCase
  reason: string      // human-readable error message
}
```

---

## 2. Parsing API Errors

Use a central error parser so all API calls go through the same path.

```typescript
// lib/errors/parse-problem-details.ts
import type { ProblemDetails } from "./problem-details"

export async function parseProblemDetails(response: Response): Promise<ProblemDetails> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/problem+json")) {
    return response.json() as Promise<ProblemDetails>
  }
  // Fallback for unexpected error shapes
  return {
    title: "An unexpected error occurred.",
    status: response.status,
    detail: `HTTP ${response.status}: ${response.statusText}`
  }
}

export function isDomainError(problem: ProblemDetails): boolean {
  return problem.status === 409
}

export function isValidationError(problem: ProblemDetails): boolean {
  return problem.status === 400 && Array.isArray(problem.invalidParams)
}

export function isForbiddenError(problem: ProblemDetails): boolean {
  return problem.status === 403
}
```

---

## 3. Field Error Mapping for React Hook Form

When the API returns a 400 with `invalidParams`, map the errors to form fields using `setError`. The `name` field from the backend uses camelCase matching the command property name.

```typescript
// lib/errors/set-form-errors.ts
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import type { ProblemDetails } from "./problem-details"

export function setFormErrors<T extends FieldValues>(
  problem: ProblemDetails,
  setError: UseFormSetError<T>
): void {
  if (!problem.invalidParams) return

  for (const param of problem.invalidParams) {
    // The backend sends camelCase field names: "title", "content.text"
    // React Hook Form uses the same path convention.
    setError(param.name as Path<T>, {
      type: "server",
      message: param.reason
    })
  }
}
```

```typescript
// features/posts/create/CreatePostForm.tsx
"use client"
// Needs form interaction and error display — client component required.

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPostSchema } from "./create-post-schema"
import { setFormErrors } from "@/lib/errors/set-form-errors"
import type { CreatePostFormValues } from "./create-post-schema"

export function CreatePostForm() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema)
  })

  const mutation = useMutation({
    mutationFn: (data: CreatePostFormValues) => getApiClient().then(c => c.POST("/posts", { body: data })),
    onError: async (response: Response) => {
      const problem = await parseProblemDetails(response)
      if (isValidationError(problem)) {
        setFormErrors(problem, setError)
      } else {
        toast.error(problem.detail ?? problem.title)
      }
    }
  })

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
      <input {...register("title")} />
      {errors.title && <p role="alert">{errors.title.message}</p>}
      {/* ... */}
    </form>
  )
}
```

---

## 4. Field Error Mapping for Server Actions

Server Actions use `useActionState` to carry errors across the server/client boundary.

```typescript
// features/posts/create/create-post-action.ts
"use server"

import { parseProblemDetails, isValidationError } from "@/lib/errors/parse-problem-details"

export type CreatePostActionState = {
  success: false
  fieldErrors?: Record<string, string>
  formError?: string
} | {
  success: true
  postId: string
}

export async function createPostAction(
  _prev: CreatePostActionState,
  formData: FormData
): Promise<CreatePostActionState> {
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  const client = await getApiClient()
  const { response, error } = await client.POST("/posts", {
    body: { title, content }
  })

  if (!response.ok) {
    const problem = await parseProblemDetails(response)
    if (isValidationError(problem)) {
      const fieldErrors = Object.fromEntries(
        (problem.invalidParams ?? []).map(p => [p.name, p.reason])
      )
      return { success: false, fieldErrors }
    }
    return { success: false, formError: problem.detail ?? problem.title }
  }

  return { success: true, postId: (error as any).id }
}
```

```typescript
// features/posts/create/CreatePostForm.tsx (Server Action version)
"use client"
// Needs useActionState — client component required.

import { useActionState } from "react"
import { createPostAction } from "./create-post-action"

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, { success: false })

  return (
    <form action={formAction}>
      <input name="title" />
      {!state.success && state.fieldErrors?.title && (
        <p role="alert">{state.fieldErrors.title}</p>
      )}
      {!state.success && state.formError && (
        <p role="alert">{state.formError}</p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  )
}
```

---

## 5. Toast Notification Rules

| Scenario | Toast? | Where to show the error |
|:---|:---:|:---|
| Validation error (400 with `invalidParams`) | No | Inline field errors only |
| Domain conflict (409) | Yes | Toast with the `detail` message |
| Forbidden (403) | Yes | Toast: "You do not have permission to perform this action." |
| Not found (404) | No | Redirect to not-found page or inline message |
| Server error (5xx) | Yes | Toast: "Something went wrong. Try again later." |
| Network error | Yes | Toast: "Network error. Check your connection." |

```typescript
// lib/errors/handle-api-error.ts
import { toast } from "sonner"
import type { ProblemDetails } from "./problem-details"

export function handleNonFieldError(problem: ProblemDetails): void {
  if (problem.status === 403) {
    toast.error("You do not have permission to perform this action.")
    return
  }
  if (problem.status >= 500) {
    toast.error("Something went wrong. Try again later.")
    return
  }
  toast.error(problem.detail ?? problem.title)
}
```

---

## 6. Error Boundaries

Error boundaries catch JavaScript render errors, not API errors. Do not use them as an API error handling mechanism.

```typescript
// Place error.tsx at the route segment level to catch render errors.
// app/(main)/posts/[id]/error.tsx
"use client"
// error.tsx must be a client component.

export default function PostError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong loading this page.</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

Do not display `error.message` to the user — it may contain internal implementation details.

---

## 7. Not Found Handling

```typescript
// app/(main)/posts/[id]/page.tsx
import { notFound } from "next/navigation"

async function Page({ params }: Props) {
  const { id } = await params
  const { data } = await client.GET("/posts/{id}", { params: { path: { id } } })
  if (!data) notFound()
  return <PostDetail post={data} />
}
```

`notFound()` triggers Next.js's `not-found.tsx` for the nearest route segment.

---

## 8. Backend `invalidParams` Shape (Reference)

The backend produces `invalidParams` in this format. Frontend field name mapping uses the `name` property:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Validation failed.",
  "status": 400,
  "detail": "One or more fields failed validation.",
  "invalidParams": [
    { "name": "title", "reason": "Title must be at least 3 characters." },
    { "name": "content", "reason": "Content is required." }
  ]
}
```

The `name` field uses the command property name in camelCase. Nested properties use dot notation: `"address.postalCode"`.
