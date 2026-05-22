# Blueprint: Auth.js auth.ts

Copy to `apps/web/auth.ts` and `apps/web/app/api/auth/[...nextauth]/route.ts`.

---

## `auth.ts`

```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { serverEnv } from "@/lib/env"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: serverEnv.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
})
```

---

## `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

Protected route groups MUST call `auth()` in `layout.tsx`. See `docs/conventions/frontend/01-nextjs-app-router.md` and `docs/decisions/authjs-v5-authentication.md`.

Admin API JWT minting for backend calls: `docs/conventions/frontend/10-admin-api-auth.md`.
