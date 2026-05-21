# Admin API Authentication

## 1. Overview

Admin Next.js apps authenticate their users via Auth.js v5. To call the backend ASP.NET Core API on behalf of an authenticated user, the admin mints a short-lived HS256 JWT signed with the same secret the API uses for Bearer token validation. This decouples the two authentication surfaces: Auth.js manages the admin session, and a separately minted JWT carries identity to the API.

The overall request flow is:

```
Browser → Auth.js session cookie → Next.js admin
Next.js admin → minted JWT (HS256, API_JWT_SECRET) → ASP.NET Core JWT Bearer
```

---

## 2. Environment Variables

| Variable | Prefix rule | Description |
|:---|:---|:---|
| `API_URL` | No `NEXT_PUBLIC_` prefix | Base URL for server-to-server API calls. Injected by Aspire at process startup. |
| `API_JWT_SECRET` | No `NEXT_PUBLIC_` prefix | Shared signing secret. Must match `JwtSettings__Secret` in `appsettings.json`. |

`NEXT_PUBLIC_*` variables are baked into the JavaScript client bundle at build time. Neither of these values must appear in the client bundle. Setting either with `NEXT_PUBLIC_` is a security defect.

When running under .NET Aspire, the AppHost injects `API_URL` via `WithEnvironment("API_URL", api.GetEndpoint("http"))`. Do not use `NEXT_PUBLIC_API_URL`.

---

## 3. Token Minting Utility

Extract token minting into a single server-only file so both the API client and the proxy route share one implementation:

```typescript
// lib/auth/mintApiToken.ts
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.API_JWT_SECRET ?? "dev-secret-key-must-be-at-least-32-characters-long!"
);

/**
 * Mints a short-lived HS256 JWT for authenticating server-to-server calls to the backend API.
 *
 * `sub` must be the authenticated user's stable identifier (e.g. a provider-issued numeric user ID).
 * The secret must match `JwtSettings__Secret` in the API's appsettings.json.
 */
export async function mintApiToken(sub: string, name: string): Promise<string> {
  return new SignJWT({ sub, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
```

Rules:
- This file MUST NOT have a `"use client"` directive. It is server-only.
- Never import this module in a client component, even indirectly.
- The `sub` claim maps to `AuthorId` on the backend. Pass the user's stable provider ID, not a session ID or request-scoped value.

---

## 4. Two Call Paths

There are two paths for calling the API from the admin app, depending on the component type.

### Path 1: Server components and Server Actions

Server components and Server Actions run on the server and can call `auth()` directly. Call `lib/api.ts` helper functions:

```typescript
// lib/api.ts
import { auth } from "@/auth";
import { mintApiToken } from "@/lib/auth/mintApiToken";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  if (!session?.user?.id) return {};
  const token = await mintApiToken(session.user.id, session.user.name ?? session.user.id);
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
```

Use `apiGet`, `apiPost`, `apiPut`, `apiDelete`, and `apiPostNoContent` from `lib/api.ts` in all server components and Server Actions. Never call `fetch` with a hardcoded URL or inline auth logic.

### Path 2: Client components via the API proxy route

Client components cannot call `auth()` or `mintApiToken` because they run in the browser. They call a Next.js Route Handler at `/api-proxy/[...path]` that performs the server-side auth and forwards the request:

```typescript
// app/api-proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { mintApiToken } from "@/lib/auth/mintApiToken";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

async function proxyRequest(req: NextRequest, params: { path: string[] }, method: string) {
  const session = await auth();
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (session?.user?.id) {
    const token = await mintApiToken(session.user.id, session.user.name ?? session.user.id);
    headers["Authorization"] = `Bearer ${token}`;
  }

  const apiPath = "/api/" + params.path.join("/");
  const url = API_URL + apiPath + (req.nextUrl.search || "");
  const body = method !== "GET" && method !== "DELETE" ? await req.text() : undefined;

  const res = await fetch(url, { method, headers, body });
  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params, "GET");
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params, "POST");
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params, "PUT");
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params, "DELETE");
}
```

Client components call `/api-proxy/posts` (a relative URL) rather than the API directly. This keeps `API_URL` and `API_JWT_SECRET` off the client.

---

## 5. Backend JWT Claim Mapping

The ASP.NET Core API reads `AuthorId` from the JWT `sub` claim. The value passed as `sub` must be the same stable identifier the API uses to look up or create the author record. For a GitHub OAuth setup, this is the numeric GitHub user ID.

The backend validates tokens using `JwtSettings__Secret`. This value MUST match `API_JWT_SECRET` in the admin's environment. A mismatch produces `401 Unauthorized` with no useful error message on the frontend.

---

## 6. Do / Don't Summary

```typescript
// DO: read API_URL without NEXT_PUBLIC_ prefix (server-only)
const API_URL = process.env.API_URL ?? "http://localhost:5000";

// DO: import mintApiToken from the shared utility
import { mintApiToken } from "@/lib/auth/mintApiToken";

// DO: client components call the proxy route, not the API directly
await fetch("/api-proxy/posts", { method: "POST", body: JSON.stringify(data) });
```

```typescript
// DON'T: expose API URL or JWT secret to the client bundle
const API_URL = process.env.NEXT_PUBLIC_API_URL;        // FORBIDDEN
const secret = process.env.NEXT_PUBLIC_API_JWT_SECRET;  // FORBIDDEN

// DON'T: duplicate token minting logic across files
// Duplicate createApiToken functions in lib/api.ts AND api-proxy/route.ts — FORBIDDEN

// DON'T: call the backend API directly from a client component
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, ...); // FORBIDDEN
```
