# Frontend Testing

## 1. Guiding Philosophy

Frontend testing validates user journeys and complex transformations, not framework internals. Do not test that React renders a `div`. Test that a user can submit a post and see the success toast.

---

## 2. Test Pyramid

| Layer | Tool | Requirement |
|:---|:---|:---|
| E2E | Playwright | REQUIRED for every happy-path user journey |
| Unit | Vitest + React Testing Library | REQUIRED for complex hooks (`use...`), utility functions, and Zod schemas |
| Component | Vitest + React Testing Library | REQUIRED only for shared UI components in `components/ui/` with complex variants |

---

## 3. Playwright E2E Rules

Playwright tests live in `apps/web/e2e/`.

- Tests MUST use `data-testid` or accessible roles (`getByRole`) for selectors.
- Tests MUST NOT rely on live external APIs. Use Playwright `page.route` to mock backend API responses.
- Tests MUST NOT use Cypress, Jest, or other E2E frameworks.

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

## 4. Vitest Unit Rules

Vitest tests live next to the code they cover (`*.test.ts`, `*.test.tsx`) or in `__tests__/` within the same feature use case folder.

- Hook and schema tests MUST use Vitest. Jest MUST NOT be added to the frontend toolchain.
- React Testing Library MUST query by role, label, or text. `container.querySelector` MUST NOT be the primary assertion path.
- Server Components MUST NOT be unit-tested with RTL. Cover them with Playwright or test extracted pure functions.

```typescript
// GOOD: Zod schema tested in isolation
import { describe, it, expect } from "vitest"
import { createPostSchema } from "./createPost.schema"

describe("createPostSchema", () => {
  it("rejects empty title", () => {
    const result = createPostSchema.safeParse({ title: "", content: "x", slug: "a", authorEmail: "a@b.co" })
    expect(result.success).toBe(false)
  })
})
```

```typescript
// BAD: testing implementation details of a hook
it("calls setState twice", () => {
  // BAD: couples test to React internals instead of observable behavior
})
```

---

## 5. CI Verification

When frontend code changes, agents MUST run:

```bash
pnpm run type-check --filter apps/web
pnpm run test --filter apps/web
pnpm exec playwright test --config apps/web/playwright.config.ts
```

Project repositories MAY scope Playwright to changed specs in local development. CI MUST run the full E2E suite for affected happy paths.

---

## 6. Project-Specific Testing Configuration

Document Playwright base URLs and auth fixtures in the project repository `AGENTS.md` and `apps/web/playwright.config.ts`.
