# Blueprint: Frontend Feature Test Utilities

Complete scaffold for frontend test support files under `apps/{app}/features/{feature}/`. Adapt names to the use case doc in `docs/domain/{feature}/{use-case}.md`. Pair with `docs/blueprints/frontend/feature-use-case.md` for production code layout.

---

## Directory Layout

```text
apps/web/features/posts/
├── create/
│   ├── __tests__/
│   │   ├── test-utils.tsx           ← RTL QueryClient wrapper
│   │   ├── createPost.action.test.ts
│   │   └── useCreatePost.test.ts    ← only when hook logic is non-trivial
│   └── ...
└── shared/
    └── postQueryKeys.ts

apps/web/e2e/
├── fixtures/
│   └── auth.ts                      ← Playwright authenticated session
└── posts/
    └── create-post.spec.ts          ← happy path traced to test spec row
```

---

## RTL Test Utils Wrapper

```typescript
// apps/web/features/posts/create/__tests__/test-utils.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function TestProviders({ children }: { children: ReactNode }) {
  const client = createTestQueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

---

## Server Action Unit Test

```typescript
// apps/web/features/posts/create/__tests__/createPost.action.test.ts
import { describe, it, expect, vi } from "vitest"
import { createPostAction } from "../actions"

describe("createPostAction", () => {
  it("returns field errors when title is empty", async () => {
    const result = await createPostAction({ title: "", content: "body" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors.title).toBeDefined()
  })
})
```

---

## Playwright Auth Fixture

```typescript
// apps/web/e2e/fixtures/auth.ts
import { test as base } from "@playwright/test"

export const test = base.extend<{ authenticatedPage: typeof base }>({
  authenticatedPage: async ({ page }, use) => {
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({ json: { user: { id: "test-user", role: "author" } } }),
    )
    await use(base)
  },
})

export { expect } from "@playwright/test"
```

Store real credentials in project ADR or CI secrets, not in the repository.

---

## E2E Spec Header

```typescript
// apps/web/e2e/posts/create-post.spec.ts
// Use case: docs/domain/posts/create-post.md
// Test spec: docs/domain/posts/create-post.tests.md (AC-001)
// Page: docs/ui/web/pages/create-post.md

import { test, expect } from "../fixtures/auth"

test("author creates a draft post", async ({ page }) => {
  await page.route("**/api/v1/posts", (route) =>
    route.fulfill({ status: 201, json: { id: "post-1", title: "My Post" } }),
  )
  await page.goto("/posts/new")
  await page.getByRole("textbox", { name: "Title" }).fill("My Post")
  await page.getByRole("button", { name: "Create draft" }).click()
  await expect(page.getByText("Draft saved")).toBeVisible()
})
```

Trace each scenario to a row in the use case test spec. Use `page.route` for API mocks in CI; do not depend on live backends.

---

## Related

| Document | Topic |
|:---|:---|
| `docs/conventions/frontend/testing.md` | Coverage tiers, mocking rules, anti-patterns |
| `docs/blueprints/frontend/feature-use-case.md` | Production feature scaffold |
| `docs/templates/docs/domain-use-case.tests.md` | Test Coverage table and AC-00N IDs |
