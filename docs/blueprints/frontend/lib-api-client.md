# Blueprint: lib/api/client.ts

Copy to `apps/web/lib/api/client.ts`.

```typescript
import createClient from "@myproject/api-client"
import type { paths } from "@myproject/api-types"
import { auth } from "@/auth"
import { mintApiToken } from "@/lib/auth/mintApiToken"
import { serverEnv } from "@/lib/env"

export async function getApiClient() {
  const session = await auth()
  const headers: HeadersInit = {}

  if (session?.user?.id) {
    const token = await mintApiToken(
      session.user.id,
      session.user.name ?? session.user.id
    )
    headers.Authorization = `Bearer ${token}`
  }

  return createClient<paths>({
    baseUrl: serverEnv.API_URL,
    headers,
  })
}
```

```typescript
// BAD: raw fetch to ad-hoc URLs from feature code
await fetch(`${process.env.API_URL}/posts`)
```

See `docs/conventions/frontend/03-data-fetching.md`.
