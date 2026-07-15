---
{
  "id": "profile.dotnet-nextjs.frontend",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["frontend.app"],
  "recipes": []
}
---
# Frontend

The frontend is optional. When present, it lives in the same repository and follows the backend business capabilities.

## Agent Quick Rules {#agent-quick-rules}

- Use Next.js App Router and Server Components by default.
- Explain every `'use client'` boundary in a comment.
- Keep feature internals isolated.
- Generate OpenAPI types and use `openapi-fetch`.
- Validate environment variables in one module.
- Add client state libraries only when their trigger applies.

## FRONTEND.LAYOUT.001 - Use the full-stack monorepo layout

Place frontend applications under `apps/{name}/` and shared packages under `packages/`. Use one root pnpm workspace and lockfile.

An API-only repository may omit pnpm and all frontend paths.

## FRONTEND.SERVER.001 - Prefer server execution

Use Server Components for initial reads and server-only secrets. Use Client Components for browser events, local interactive state, and browser APIs.

Await Next.js dynamic APIs including `params`, `searchParams`, `cookies`, and `headers`.

## FRONTEND.CLIENT.001 - Document client boundaries

Every `'use client'` directive must have an adjacent comment naming the browser requirement.

```tsx
// Client boundary: the editor owns browser selection state.
'use client'
```

Do not mark a page client-side only to avoid separating an interactive child.

## FRONTEND.FEATURES.001 - Keep feature internals isolated

Use `features/{feature}/{use-case}/` for operation-specific components, hooks, schemas, and request functions. One feature cannot import another feature's internal path.

Move a shared primitive to `components/`, `lib/`, or a named workspace package after two real consumers need it.

## FRONTEND.API.001 - Use generated types with typed fetch

Generate `api.d.ts` through `openapi-typescript`. Create one `openapi-fetch` client that supplies the base URL, headers, authentication integration, and Problem Details parsing.

Do not handwrite copies of API response types. A view model may transform a generated transport type for presentation.

## FRONTEND.ENV.001 - Validate environment access

Read environment variables only through `lib/env.ts` or a project equivalent. Validate public and server variables separately with Zod. A public variable must use the framework's public prefix.

## FRONTEND.STATE.001 - Use the narrowest state owner

Use this order:

1. Server data and URL state.
2. Component state.
3. Form state.
4. TanStack Query when client-side server caching is required.
5. Zustand when unrelated client branches share non-server state.

Do not enable TanStack Query or Zustand in the baseline profile without a use case that meets the trigger.

## FRONTEND.UI.001 - Use Tailwind CSS and shadcn/ui

Each frontend owns its Tailwind entry file, content sources, `components.json`, and `lib/utils.ts`. Prefer theme tokens and shadcn primitives over arbitrary pixel and color values.

## FRONTEND.ROUTES.001 - Keep route files as composition boundaries

Route files select layouts, load server data, and compose feature UI. Business rules and reusable feature behavior stay outside `app/`.

Create a page specification only when the ADDD page trigger applies.
