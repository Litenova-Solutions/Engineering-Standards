# Environment and Runtime Configuration

This document defines how to declare, validate, and access environment variables in the Next.js frontend. Read it before adding any `process.env` access or configuration-dependent logic.

---

## Agent Quick Rules

- ALL environment variable access MUST go through `lib/env.ts`. MUST NOT use `process.env.X` directly in app code.
- Server-only variables MUST be validated with a Zod schema in `lib/env.ts`; they MUST NOT be prefixed with `NEXT_PUBLIC_`.
- Client-accessible variables MUST use `NEXT_PUBLIC_` prefix and be included in the public schema.
- `lib/env.ts` MUST throw at module load time if a required server variable is missing.
- Docker and CI environments inject variables at runtime; the validation in `lib/env.ts` is the contract.

---

## 1. `lib/env.ts`

```typescript
// apps/web/lib/env.ts
import { z } from "zod"

// Import from "zod" (Zod 4 is the default npm export). Do not use "zod/v4" unless the lockfile pins the legacy subpath.

// Server-side schema: validated at startup, never exposed to the browser.
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  // The API base URL — injected by Aspire or Docker compose.
  API_BASE_URL: z.url(),
  // JWT issuer for server-side token validation (admin apps only).
  // Remove if this app does not mint or validate tokens server-side.
  JWT_ISSUER: z.string().optional(),
})

// Public schema: validated at startup, safe to expose to the browser.
// All keys must start with NEXT_PUBLIC_.
const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
})

// Validate server-side variables only when running on the server.
// In the browser, server variables are undefined and must not be accessed.
const serverEnv = typeof window === "undefined"
  ? serverSchema.parse(process.env)
  : ({} as z.infer<typeof serverSchema>)

const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
})

export const env = {
  ...serverEnv,
  ...publicEnv,
} as z.infer<typeof serverSchema> & z.infer<typeof publicSchema>
```

If `lib/env.ts` throws during module load, the application fails to start. This is correct behavior — missing required configuration must be discovered immediately, not at request time.

---

## 2. Using `env` in App Code

```typescript
// GOOD: access through env module
import { env } from "@/lib/env"

export async function getApiClient() {
  return createClient<paths>({ baseUrl: env.API_BASE_URL })
}

// BAD: direct process.env access
export async function getApiClient() {
  return createClient<paths>({ baseUrl: process.env.API_BASE_URL! })
}
```

```typescript
// GOOD: public variable used in client component
import { env } from "@/lib/env"

function AnalyticsScript() {
  return <script data-key={env.NEXT_PUBLIC_POSTHOG_KEY} />
}

// BAD: process.env in component
function AnalyticsScript() {
  return <script data-key={process.env.NEXT_PUBLIC_POSTHOG_KEY} />
}
```

---

## 3. Required Variables by Environment

```bash
# .env.local — local development (not committed, add to .gitignore)
NODE_ENV=development
API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.example — committed; documents required variables without values
NODE_ENV=
API_BASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_POSTHOG_KEY=
```

Commit `.env.example` with all required variable names and no values. Never commit `.env.local`, `.env.production`, or any file containing real secrets.

---

## 4. Aspire-Injected Variables

When the Next.js app runs inside a .NET Aspire AppHost, Aspire injects service URLs as environment variables automatically. The variable names follow Aspire's conventions.

```csharp
// AppHost/Program.cs
var api = builder.AddProject<Projects.MyProject_WebApi>("api");

var web = builder.AddNextJsApp("web", "../apps/web")
    .WithPnpm()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(api);
    // Aspire injects: services__api__https__0 or services__api__http__0
```

Map the Aspire-injected variable to your schema name in `next.config.ts`:

```typescript
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  env: {
    // Map Aspire service URL to the name lib/env.ts expects.
    API_BASE_URL: process.env["services__api__https__0"]
      ?? process.env["services__api__http__0"]
      ?? process.env.API_BASE_URL
      ?? ""
  }
}

export default nextConfig
```

This approach keeps `lib/env.ts` portable: it works with Aspire, Docker Compose, and plain environment variable injection without knowing about Aspire's naming convention.

---

## 5. Docker Runtime Configuration

At runtime in a container, pass variables via `docker run -e` or a compose environment block. Do NOT bake them into the image.

```yaml
# docker-compose.yml (staging or local parity)
services:
  web:
    image: myproject-web:latest
    environment:
      NODE_ENV: production
      API_BASE_URL: https://api.staging.yourdomain.com
      NEXT_PUBLIC_APP_URL: https://staging.yourdomain.com
    ports:
      - "3000:3000"
```

For Next.js standalone output, runtime environment variables override build-time values for server-side code. Client-side variables (`NEXT_PUBLIC_*`) are baked in at build time and cannot be changed at runtime without rebuilding.

---

## 6. Exposing Safe Client Config

When client components need configuration that is not a `NEXT_PUBLIC_` variable, expose it from a Server Component as a prop rather than adding a new public variable.

```typescript
// app/layout.tsx (server component)
import { env } from "@/lib/env"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers appUrl={env.NEXT_PUBLIC_APP_URL}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

This pattern avoids leaking server-only values while keeping client code testable with props.

---

## 7. CI/CD Variable Injection

In GitHub Actions, pass environment variables as step-level `env` entries. Never interpolate secrets directly into `run` commands.

```yaml
- name: Build Next.js app
  run: pnpm build
  env:
    NODE_ENV: production
    API_BASE_URL: ${{ vars.API_BASE_URL }}
    NEXT_PUBLIC_APP_URL: ${{ vars.APP_URL }}
    NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.POSTHOG_KEY }}
```

Use `vars` for non-secret configuration values and `secrets` for credentials. Both are injected at runtime and never appear in logs when accessed this way.
