# Client State Management (Zustand)

When to use Zustand versus server state (TanStack Query) and local React state. Package version: `standards.manifest.json` → `stack.zustand` / `pinnedNpmPackages.zustand`.

---

## Agent Quick Rules {#agent-quick-rules}

- **Server state** (posts, users, orders): TanStack Query + `getApiClient()` only. MUST NOT store server entities in Zustand.
- **Zustand** for client-only UI state that spans multiple client components on one route or feature (wizard step, panel layout, ephemeral filters not persisted to URL).
- One store file per feature under `features/{feature}/stores/`; MUST NOT create a global app store without a project ADR.
- MUST NOT import Zustand stores across feature boundaries; promote to `@/shared/` only with Strike 2 and ADR if truly cross-cutting.
- Persist to `localStorage` only when a use case doc or UI page doc requires it; use Zustand `persist` middleware with a namespaced key `{appId}:{feature}:{store}`.


**Full convention:** `docs/conventions/frontend/state-management.md`

---

## Overview

Next.js App Router keeps most data on the server. Client state is the exception. Zustand fills the gap where React `useState` does not scale across sibling client components and URL search params are not the right contract.

---

## Decision table

| State type | Tool | Example |
|:---|:---|:---|
| Remote entities | TanStack Query | Post list, user profile |
| Form draft (single component) | `useState` / React Hook Form | Inline edit field |
| Form draft (multi-step wizard) | Zustand + Zod at submit boundary | Checkout steps |
| URL-shareable filters | `searchParams` + server read | Table sort, page |
| Theme / sidebar (app chrome) | Zustand or React context in layout | Admin shell |

---

## Store layout

```text
features/posts/create/
├── CreatePostForm.tsx
├── createPost.schema.ts
└── stores/
    └── createPostWizard.store.ts
```

```typescript
// GOOD: feature-scoped UI store
import { create } from "zustand"

type CreatePostWizardState = {
  step: "details" | "preview"
  setStep: (step: CreatePostWizardState["step"]) => void
}

export const useCreatePostWizardStore = create<CreatePostWizardState>((set) => ({
  step: "details",
  setStep: (step) => set({ step }),
}))
```

```typescript
// BAD: server post list cached in Zustand
export const usePostsStore = create((set) => ({
  posts: [] as PostDto[],
  fetchPosts: async () => { /* duplicates TanStack Query */ },
}))
```

---

## Testing

- Unit-test store selectors and actions with Vitest by calling `useStore.getState()` outside React.
- Do not E2E test store internals; assert visible UI outcomes in Playwright.

See `docs/conventions/frontend/testing.md` for Vitest patterns.

---

## Related documents

| Document | Topic |
|:---|:---|
| `data-fetching.md` | TanStack Query and Server Actions |
| `state-and-forms.md` | Forms vs client state |
| `feature-boundaries.md` | Cross-feature import rules |
