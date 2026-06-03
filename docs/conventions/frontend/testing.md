# Frontend Testing

---

## Agent Quick Rules

- E2E: Playwright in `apps/{app}/e2e/`; mock APIs with `page.route`; selectors via roles or `data-testid`.
- Unit: Vitest + RTL for hooks, Zod schemas, and complex `components/ui/` variants only.
- MUST NOT unit-test Server Components with RTL; cover via Playwright or extracted pure functions.
- Trace E2E scenarios to UI page docs and use case test specs where the page composes documented use cases.
- Coverage: production-tier apps SHOULD meet minimums in section 3 unless a documented exception applies.

---

## Overview

Frontend tests validate user-visible behavior and non-trivial client logic. They do not validate framework internals. Server state is tested at the API layer; the frontend proves composition, interaction, and error display.

---

## Test pyramid

| Layer | Tool | Requirement |
|:---|:---|:---|
| E2E | Playwright | REQUIRED for every happy-path user journey per app |
| Unit | Vitest + React Testing Library | REQUIRED for complex hooks, Zustand stores, Zod schemas |
| Component | Vitest + RTL | REQUIRED for shared `components/ui/` with non-trivial variants |

---

## Coverage tiers

Declare tier in project `docs/domain/README.md` (same vocabulary as backend). Default is **production**.

| Tier | Vitest line coverage (per app package) | Playwright |
|:---|:---:|:---|
| Production | 70% minimum on `features/**` and `lib/**` | All documented happy paths |
| Internal | 60% | Critical paths only |
| Prototype | Best-effort | Smoke only |

CI SHOULD fail when coverage drops below threshold. Use Vitest coverage with `coverage.include` scoped to `features/` and `lib/`, not `app/` route shells.

```bash
pnpm exec vitest run --coverage --project apps/web
```

---

## Fixtures and test utilities

| Artifact | Location | Rule |
|:---|:---|:---|
| Playwright auth | `apps/{app}/e2e/fixtures/auth.ts` | One fixture per role; document credentials in project ADR, not committed secrets |
| API mocks | Inline `page.route` or `e2e/mocks/{feature}.ts` | Typed JSON matching OpenAPI shapes |
| RTL wrappers | `features/{feature}/__tests__/test-utils.tsx` | Provide QueryClient with `retry: false` for hook tests |
| Seed data | Prefer API setup route or factory in backend test project | MUST NOT duplicate domain rules in frontend fixtures |

---

## TanStack Query hook tests

Test observable behavior, not internal query cache keys.

```typescript
// GOOD: wrapper with QueryClient, assert rendered outcome
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi } from "vitest"
import { usePostList } from "./usePostList"

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe("usePostList", () => {
  it("returns posts when API succeeds", async () => {
    vi.mock("@/lib/api-client", () => ({
      getApiClient: vi.fn().mockResolvedValue({
        GET: vi.fn().mockResolvedValue({ data: [{ id: "1", title: "A" }] }),
      }),
    }))
    const { result } = renderHook(() => usePostList(), { wrapper })
    await waitFor(() => expect(result.current.data).toHaveLength(1))
  })
})
```

```typescript
// BAD: assert queryClient.getQueryCache().getAll().length
```

---

## Server Action tests

Server Actions run on the server. Test them as async functions with mocked `getApiClient` and session, not as RTL components.

```typescript
// GOOD: invoke action directly with mocked dependencies
import { describe, it, expect, vi } from "vitest"
import { createPostAction } from "./createPost.action"

describe("createPostAction", () => {
  it("returns validation error for empty title", async () => {
    const result = await createPostAction({ title: "", content: "x" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors.title).toBeDefined()
  })
})
```

Document the action's contract in the use case doc UI section. E2E covers the full browser path.

---

## Playwright E2E rules

- Tests live in `apps/{app}/e2e/`. Multi-app monorepos use one config per app (`docs/templates/config/playwright.config.ts`).
- Link scenarios to UI page docs in test file header comments: `// Page: docs/ui/web/pages/create-post.md`.
- When a page composes use cases, trace assertions to rows in `{use-case}.tests.md` where applicable.

```typescript
// GOOD: accessible role selector and mocked API
import { test, expect } from "@playwright/test"

test("user can publish post", async ({ page }) => {
  await page.route("**/api/posts", (route) =>
    route.fulfill({ json: { id: "123" } })
  )
  await page.goto("/posts/new")
  await page.getByRole("textbox", { name: "Title" }).fill("My Post")
  await page.getByRole("button", { name: "Publish" }).click()
  await expect(page.getByText("Post created successfully")).toBeVisible()
})
```

```typescript
// BAD: brittle CSS selector and live API dependency
test("publish", async ({ page }) => {
  await page.goto("/posts/new")
  await page.click(".btn-primary")
  await expect(page.locator("#toast")).toBeVisible()
})
```

---

## Strict mocking guidelines

| Allowed | Forbidden |
|:---|:---|
| Mock `getApiClient`, `auth()`, `headers()` in unit tests | Mocking child components to avoid RTL interaction |
| `page.route` for E2E | Live third-party APIs in CI |
| `vi.mock` of module boundaries | Spying on React internal state |

---

## CI verification

When frontend code changes, agents MUST run gates for each affected app:

```bash
pnpm run type-check --filter apps/web
pnpm run test --filter apps/web
pnpm exec playwright test --config apps/web/playwright.config.ts
```

---

## Anti-patterns

- Duplicating backend validation matrices in frontend unit tests without Zod schema ownership.
- Shared global Playwright storage state mutated across unrelated specs.
- Testing Tailwind class names instead of roles or visible text.

---

## Related documents

| Document | Topic |
|:---|:---|
| `state-management.md` | Zustand store unit tests |
| `data-fetching.md` | Server Actions and mutations |
| `docs/conventions/backend/testing.md` | Backend coverage tiers |
| `docs/conventions/shared/ci.md` | CI gate list |
