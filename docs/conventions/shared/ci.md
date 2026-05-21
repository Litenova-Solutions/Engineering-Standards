# CI and Local Gates

This document defines the required local and CI verification gates for projects that follow these standards.

---

## 0. pnpm Workspace Setup

All frontend apps and packages share a single pnpm workspace. The `pnpm-lock.yaml` and `pnpm-workspace.yaml` files live at the repository root. Individual app directories have their own `package.json` but no separate lockfile.

Install from the root to populate the shared `node_modules`:

```bash
pnpm install
```

Running `pnpm install` from an app subdirectory also works: pnpm walks up to find the workspace root automatically.

In CI, use `--frozen-lockfile` to fail if the lockfile is out of sync:

```bash
pnpm install --frozen-lockfile
```

When running the Aspire AppHost, run `pnpm install` from the workspace root before starting the AppHost. The `WithPnpm()` call in the AppHost triggers `pnpm install` in each app's subdirectory, which resolves back to the workspace root.

---

## 1. Required CI Gates

Every pull request MUST run:

| Gate | Command |
|:---|:---|
| Backend build | `dotnet build src/{ProjectName}.slnx --configuration Release` |
| Backend tests | `dotnet test src/{ProjectName}.slnx --configuration Release --no-build` |
| Vulnerable NuGet packages | `dotnet list src/{ProjectName}.slnx package --vulnerable` |
| Frontend install | `pnpm install --frozen-lockfile` |
| Frontend lint | `pnpm lint` |
| Frontend type check | `pnpm type-check` |
| Frontend tests | `pnpm test` |
| Frontend build | `pnpm build` |
| Frontend audit | `pnpm audit` |
| OpenAPI freshness | Regenerate spec and generated types, then fail on git diff |

Skip frontend gates only when the project has no frontend. Skip OpenAPI freshness only when no generated frontend API types are committed.

---

## 2. OpenAPI Freshness Gate

```bash
dotnet build src/{ProjectName}.slnx --configuration Release
dotnet run --project src/{ProjectName}.WebApi -- --export-openapi packages/api-types/openapi.json
npx openapi-typescript packages/api-types/openapi.json -o packages/api-types/src/api.d.ts
git diff --exit-code packages/api-types/openapi.json packages/api-types/src/api.d.ts
```

If the diff is non-empty, the PR forgot to commit regenerated API artifacts.

---

## 3. Example GitHub Actions Workflow

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json

      - uses: pnpm/action-setup@v4
        with:
          run_install: false

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - run: dotnet restore src/{ProjectName}.slnx
      - run: dotnet build src/{ProjectName}.slnx --configuration Release --no-restore
      - run: dotnet test src/{ProjectName}.slnx --configuration Release --no-build
      - run: dotnet list src/{ProjectName}.slnx package --vulnerable

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm audit
```

Project workflows add deployment, OpenAPI freshness, container build, and migration script review gates as needed.

---

## 4. Pre-Commit Hooks

Pre-commit hooks are optional but recommended. They should be fast and local.

Recommended local hooks:

```bash
dotnet format --verify-no-changes
pnpm lint
pnpm type-check
```

Do not run containerized integration tests in pre-commit hooks. Keep slower checks in CI.

