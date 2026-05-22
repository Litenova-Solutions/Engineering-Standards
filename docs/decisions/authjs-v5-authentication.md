# `docs/decisions/authjs-v5-authentication.md`: Auth.js v5 Authentication

**Status:** Accepted
**Date:** 2026-01-01

---

## Context

The application requires authentication. The Next.js frontend must authenticate users, maintain sessions, and attach tokens to requests made to the ASP.NET Core backend.

Three options were evaluated:

**Custom JWT implementation:** The application handles token issuance, refresh, and storage directly. Full control, but requires implementing secure token storage (httpOnly cookies), refresh logic, and session management. High complexity, high risk. Not justified for standard username/password or OAuth flows.

**Auth.js v5 (formerly NextAuth):** The de facto standard for Next.js authentication as of 2026. Provides a unified `auth()` function usable in Server Components, Server Actions, Route Handlers, and `proxy.ts`. The environment variable prefix changed from `NEXTAUTH_*` to `AUTH_*` in v5. Supports 80+ OAuth providers, credentials-based login, and custom adapters for persisting sessions to a database.

**Better Auth v1:** A newer TypeScript-first authentication library with a stronger type API. Better Auth generates its own API routes and client SDK. The ecosystem is smaller than Auth.js and the migration path from Auth.js is not established. It is a viable choice for greenfield projects that do not need Auth.js's breadth of providers.

**Security constraint:** Next.js 16 renamed `middleware.ts` to `proxy.ts`. CVE-2025-29927 documented that relying on middleware/proxy as the sole authorization gate is a vulnerability: an attacker can send a specific internal routing header to bypass proxy-level checks. Auth.js v5 supports `proxy.ts` for optimistic session cookie presence checks, but authoritative session validation MUST happen in each Server Component and Server Action that requires it.

Auth.js v5 is designed for this constraint: the `auth()` function works in all server-side contexts (Server Components, Server Actions, Route Handlers), so authoritative validation is always available where it is needed.

---

## Decision

Auth.js v5 is the authentication standard.

The `auth()` function is used for session access in all server-side contexts:

```typescript
// In a Server Component
import { auth } from "@/lib/auth"

export async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")
  // session.user is now available
}
```

```typescript
// In a Server Action
import { auth } from "@/lib/auth"

export async function deletePostAction(postId: string) {
  "use server"
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  // proceed with deletion
}
```

`proxy.ts` performs only an optimistic cookie presence check:

```typescript
// proxy.ts
import { auth } from "@/lib/auth"

export const { proxy } = auth

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"]
}
```

The `AUTH_SECRET` environment variable MUST be set. All provider credentials use the `AUTH_*` prefix.

Token attachment to ASP.NET Core API requests follows the pattern in `docs/conventions/frontend/03-data-fetching.md`: the `getApiClient()` factory reads the session token from the httpOnly cookie and attaches it as a Bearer header.

---

## Consequences

**Positive:**

- Unified `auth()` API across all Next.js server-side contexts. No special handling needed per context.
- Active maintenance and large ecosystem of OAuth providers.
- CVE-2025-29927 is mitigated by design: `proxy.ts` is optimistic-only, authoritative validation is in the component or action.

**Negative:**

- Auth.js abstracts away token handling. Attaching session tokens to ASP.NET Core API requests requires the pattern documented in `03-data-fetching.md` rather than a direct token read.
- Auth.js v5 introduced breaking changes from v4: the `NEXTAUTH_*` prefix changed to `AUTH_*`, session callbacks have different signatures, and database adapters were updated. Projects upgrading from v4 must follow the official migration guide.

**Risks:**

- Auth.js is tightly coupled to the Next.js release cycle. A major Next.js version upgrade may require an Auth.js update. Pin both together.