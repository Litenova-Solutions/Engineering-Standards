# Blueprint: lib/env.ts

Copy to `apps/web/lib/env.ts`. All environment access in the frontend MUST go through this module.

```typescript
import { z } from "zod"

const serverSchema = z.object({
  API_URL: z.url(),
  API_JWT_SECRET: z.string().min(32),
  AUTH_SECRET: z.string().min(32),
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
})

function parseEnv<T extends z.ZodTypeAny>(schema: T, source: Record<string, string | undefined>) {
  const result = schema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid environment: ${result.error.message}`)
  }
  return result.data
}

export const serverEnv = parseEnv(serverSchema, {
  API_URL: process.env.API_URL,
  API_JWT_SECRET: process.env.API_JWT_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
})

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
```

```typescript
// BAD: direct process.env access outside lib/env.ts
const url = process.env.API_URL
```

See `docs/conventions/frontend/09-environment-and-runtime-config.md`.
