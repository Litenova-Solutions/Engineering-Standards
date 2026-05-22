# Blueprint: proxy.ts (auth redirect + CSP nonce)

Single `proxy.ts` for Next.js 16. Combines optimistic session cookie redirect with per-request CSP nonce. Copy to `apps/web/proxy.ts`.

**Rules:**

- Optimistic auth only (cookie presence). Authoritative auth stays in `(main)/layout.tsx` via `auth()`.
- CSP nonce generation is allowed here. It is not business logic.
- MUST NOT perform JWT verification, database lookups, or permission checks in `proxy.ts`.

See `docs/conventions/frontend/01-nextjs-app-router.md` section 6 and `docs/blueprints/frontend/csp-headers.md` for layout and nonce helper.

```typescript
// apps/web/proxy.ts
import { randomBytes } from "node:crypto"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/api/auth"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self'",
  ].join("; ")
}

function applyCsp(request: NextRequest, response: NextResponse): NextResponse {
  const nonce = randomBytes(16).toString("base64")
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  const enriched = NextResponse.next({
    request: { headers: requestHeaders },
    headers: response.headers,
    status: response.status,
  })

  enriched.headers.set("Content-Security-Policy", buildCsp(nonce))
  return enriched
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPublicPath(pathname)) {
    const sessionCookie = request.cookies.get("session")
    if (!sessionCookie) {
      const redirect = NextResponse.redirect(new URL("/login", request.url))
      return applyCsp(request, redirect)
    }
  }

  return applyCsp(request, NextResponse.next())
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

For CSP-only apps without session cookies, omit the auth block and keep `applyCsp` on every response.
