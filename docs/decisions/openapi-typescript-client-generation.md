# `docs/decisions/openapi-typescript-client-generation.md`: OpenAPI TypeScript Client Generation

**Status:** Accepted
**Date:** 2026-01-01

---

## Context

The Next.js frontend must communicate with the ASP.NET Core backend via HTTP. Without shared types, the frontend and backend can drift out of sync silently: the backend changes a field name, and the frontend breaks at runtime with no compile-time warning.

Four options were evaluated:

**Manual TypeScript type definitions:** Developers write `type` definitions by hand that mirror the backend's request and response models. These drift over time as the backend evolves. Catching drift requires discipline, code review, and end-to-end tests. Not acceptable.

**tRPC:** Shares TypeScript types directly between a TypeScript server and a TypeScript client. Does not support .NET backends. Not applicable here.

**`openapi-typescript` + `openapi-fetch`:** `openapi-typescript` generates TypeScript types from an OpenAPI specification file. The generated `paths` type provides complete, structural type safety for all API calls: request parameters, request body, and response body are all typed. `openapi-fetch` provides a typed `fetch` wrapper that uses the generated `paths` type.

In May 2026, `openapi-fetch` moved to maintenance mode. The maintainers stated the library is stable, small (~500 lines), and will receive security patches but no new features. They recommended that teams either copy the source locally or manage it themselves. The library is small enough to own directly.

**Custom fetch wrapper:** Writing a typed HTTP client from scratch. High effort, no benefit over `openapi-fetch`.

The ASP.NET Core backend generates an OpenAPI spec via `Microsoft.AspNetCore.OpenApi` (built into .NET 9+). The spec is available at `/openapi/v1.json` in development and is committed to the repository as `packages/api-types/openapi.json` for offline generation.

---

## Decision

`openapi-typescript` generates TypeScript types from the backend's OpenAPI specification into `packages/api-types/src/api.d.ts`. This generation step is a Turborepo task (`generate:api`) that runs before the Next.js build.

The `openapi-fetch` source is copied into `packages/api-client/` as owned source code rather than installed from npm. This is justified because:

1. The library moved to maintenance mode in May 2026.
2. It is approximately 500 lines of TypeScript with zero external dependencies.
3. Owning the source eliminates the risk of a future supply chain compromise or removal from npm.

The generation command:

```bash
npx openapi-typescript packages/api-types/openapi.json -o packages/api-types/src/api.d.ts
```

CI validates freshness:

```bash
dotnet build apps/api/{ProjectName}.slnx
dotnet run --project apps/api/src/{ProjectName}.WebApi -- --export-openapi packages/api-types/openapi.json
npx openapi-typescript packages/api-types/openapi.json -o packages/api-types/src/api.d.ts
git diff --exit-code packages/api-types/openapi.json packages/api-types/src/api.d.ts
```

The project may implement `--export-openapi` with a small WebApi startup path or a dedicated test utility. The required outcome is that CI fails when the committed spec or generated TypeScript types are stale.

The `packages/api-client/` directory contains:

- `src/index.ts`: the `createClient` factory (copied from `openapi-fetch` source)
- `src/types.ts`: supporting types
- `package.json`: workspace package with no external runtime dependencies

Usage in the Next.js app:

```typescript
import createClient from "@workspace/api-client"
import type { paths } from "@workspace/api-types"

const client = createClient<paths>({ baseUrl: process.env.API_BASE_URL! })
```

---

## Consequences

**Positive:**

- Zero manual type translation. Types are always in sync with the backend OpenAPI spec.
- Compile-time errors when the frontend calls an endpoint with the wrong parameters.
- The API client is fully owned: no runtime dependency on a maintenance-mode npm package.
- The generation step is fast and cacheable by Turborepo.

**Negative:**

- The generation step requires either a running backend or a committed spec file. The spec file (`openapi.json`) is committed to the repository to remove the runtime dependency.
- Owning the `openapi-fetch` source means the team is responsible for applying any future security patches manually.

**Risks:**

- If the OpenAPI spec diverges from the actual backend behavior (e.g., the spec is not regenerated after a backend change), the types will be stale. The CI pipeline MUST regenerate the spec as part of the backend build and fail if the committed spec does not match.