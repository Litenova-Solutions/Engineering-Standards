# Blueprint: next.config.ts

Copy to `apps/web/next.config.ts`.

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@myproject/api-types", "@myproject/api-client"],
}

export default nextConfig
```

Required for `Dockerfile.web` and Aspire production validation.
