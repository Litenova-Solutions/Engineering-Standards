# Blueprint: Content Security Policy (nonce-based)

Copy to a new project before production. Nonce-based CSP forces dynamic rendering on routes that use the nonce. Document that trade-off in a project ADR.

See `docs/conventions/shared/security.md` section 7 for minimum directives.

## 1. proxy.ts

Use the combined auth + CSP implementation from `docs/blueprints/frontend/proxy-ts.md`. Do not maintain separate proxy files for auth and CSP.

## 2. Nonce helper

```typescript
// apps/web/lib/csp-nonce.ts
import { headers } from "next/headers"

export async function getCspNonce(): Promise<string> {
  const headerList = await headers()
  const nonce = headerList.get("x-nonce")
  if (!nonce) {
    throw new Error("Missing x-nonce header. proxy.ts must set it on every request.")
  }
  return nonce
}
```

## 3. Root layout (pass nonce to scripts)

```tsx
// apps/web/app/layout.tsx
import { getCspNonce } from "@/lib/csp-nonce"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = await getCspNonce()

  return (
    <html lang="en">
      <body>
        {children}
        {/* Any inline script MUST use the nonce prop */}
        <script nonce={nonce} suppressHydrationWarning />
      </body>
    </html>
  )
}
```

## 4. Third-party domains

Add analytics, monitoring, and CDN hosts explicitly to `connect-src`, `script-src`, and `img-src` in `proxy.ts`. Do not use `*` wildcards in production.

## 5. Verification

- Confirm CSP header is present on HTML responses in staging.
- Confirm no browser console CSP violations on primary user flows.
- Confirm third-party scripts load only from allowlisted domains.
