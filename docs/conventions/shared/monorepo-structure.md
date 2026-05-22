# Monorepo Structure

This document defines the root layout and tooling conventions for the monorepo. Read it before creating a new project or adding a new package.

---

## Agent Quick Rules

- MUST use the exact directory structure defined in section 1.
- MUST use a single `pnpm-workspace.yaml` at the repository root.
- MUST NOT add a separate `pnpm-lock.yaml` inside app or package subdirectories.
- `packages/api-types/` contains ONLY generated TypeScript types. MUST NOT add hand-written code.
- `packages/api-client/` contains the copied `openapi-fetch` source. MUST NOT install it from npm.
- MUST use `turbo.json` to define the build pipeline with correct task dependencies.

---

## 1. Root Layout

```text
{ProjectName}/                     ← repository root
├── .config/
│   └── dotnet-tools.json          ← pinned dotnet tool versions
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── apps/
│   └── web/                       ← Next.js application
│       ├── app/
│       ├── components/
│       │   └── ui/
│       ├── features/
│       ├── lib/
│       │   ├── api/
│       │   │   └── client.ts
│       │   ├── auth/
│       │   ├── env.ts
│       │   ├── errors/
│       │   └── stores/
│       ├── shared/
│       ├── e2e/
│       ├── public/
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── api-types/                 ← generated OpenAPI TypeScript types
│   │   ├── src/
│   │   │   └── api.d.ts           ← generated; do not edit
│   │   ├── openapi.json           ← generated spec; do not edit
│   │   └── package.json
│   └── api-client/                ← copied openapi-fetch source (maintenance mode)
│       ├── src/
│       └── package.json
├── src/                           ← .NET source projects
│   ├── {ProjectName}.Domain/
│   ├── {ProjectName}.Application.Write.Contracts/
│   ├── {ProjectName}.Application.Write/
│   ├── {ProjectName}.Application.Read.Contracts/
│   ├── {ProjectName}.Application.Read/
│   ├── {ProjectName}.Application.Reactions/
│   ├── {ProjectName}.Infrastructure/
│   ├── {ProjectName}.WebApi/
│   ├── {ProjectName}.AppHost/
│   └── {ProjectName}.ServiceDefaults/
├── standards/                     ← this repository as a submodule (optional)
├── tests/                         ← .NET test projects
│   ├── {ProjectName}.Domain.Tests/
│   ├── {ProjectName}.Application.Tests/
│   ├── {ProjectName}.Integration.Tests/
│   └── {ProjectName}.Architecture.Tests/
├── Directory.Build.props
├── Directory.Packages.props
├── {ProjectName}.slnx
├── global.json
├── package.json                   ← root package.json; no dependencies, only scripts
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 2. Root `package.json`

The root `package.json` defines workspace-level scripts. It MUST NOT have production dependencies.

```json
{
  "name": "@myproject/root",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "generate:api-types": "turbo run generate:api-types"
  },
  "devDependencies": {
    "turbo": "2.x"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=10"
  },
  "packageManager": "pnpm@10.x.x"
}
```

---

## 3. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 4. `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "generate:api-types": {
      "cache": false,
      "outputs": ["../../packages/api-types/src/api.d.ts", "../../packages/api-types/openapi.json"]
    }
  }
}
```

---

## 5. `packages/api-types/package.json`

```json
{
  "name": "@myproject/api-types",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/api.d.ts"
  },
  "scripts": {
    "generate:api-types": "openapi-typescript ../../packages/api-types/openapi.json -o ./src/api.d.ts"
  },
  "devDependencies": {
    "openapi-typescript": "7.x"
  }
}
```

---

## 6. API Type Generation Workflow

OpenAPI types are generated as part of the CI pipeline. The workflow:

1. Build the .NET solution.
2. Generate the OpenAPI spec using build-time generation (`Microsoft.Extensions.ApiDescription.Server`).
3. Copy the generated spec to `packages/api-types/openapi.json`.
4. Run `pnpm generate:api-types` to regenerate `packages/api-types/src/api.d.ts`.
5. Run `git diff --exit-code` on the generated files. If there is a diff, the PR is missing committed generated artifacts.

```bash
# Step 2-3: generate spec and copy to packages/
dotnet build src/{ProjectName}.slnx --configuration Release
cp src/{ProjectName}.WebApi/openapi.json packages/api-types/openapi.json

# Step 4: regenerate TypeScript types
pnpm --filter @myproject/api-types generate:api-types

# Step 5: freshness check
git diff --exit-code packages/api-types/openapi.json packages/api-types/src/api.d.ts
```

See `docs/conventions/backend/13-deployment-and-migrations.md` for build-time OpenAPI generation setup using `Microsoft.Extensions.ApiDescription.Server`.

---

## 7. `dotnet-tools.json`

Pin all dotnet CLI tools in `.config/dotnet-tools.json`. This file is committed and restored by `dotnet tool restore`.

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "dotnet-ef": {
      "version": "10.0.0",
      "commands": ["dotnet-ef"]
    },
    "dotnet-stryker": {
      "version": "4.x",
      "commands": ["dotnet-stryker"]
    }
  }
}
```

Run `dotnet tool restore` after cloning or after a tools update. Add to the CI pipeline before any backend commands.

---

## 8. Frontend App Structure

```text
apps/web/
├── app/                      ← Next.js App Router; thin route shells only
│   ├── (auth)/               ← route group: auth pages (login, register)
│   ├── (main)/               ← route group: authenticated app
│   │   └── posts/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── edit/
│   │               └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/                   ← generic primitives (shadcn/ui, Radix)
├── features/                 ← product use cases; no cross-feature imports
│   └── posts/
│       ├── create/
│       ├── detail/
│       └── list/
├── lib/
│   ├── api/
│   │   └── client.ts         ← getApiClient() factory
│   ├── auth/
│   ├── env.ts                ← validated environment variables
│   ├── errors/               ← error parsing and mapping
│   └── stores/               ← Zustand UI-only stores
└── shared/                   ← cross-feature non-UI logic
```

Rule: `features/` contains product use cases. `shared/` contains cross-feature non-UI logic. `components/ui/` contains generic UI primitives only. MUST NOT import from `features/{a}/` inside `features/{b}/`.
