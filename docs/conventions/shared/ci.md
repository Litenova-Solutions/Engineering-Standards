# CI and Local Gates

Required local and CI verification gates for projects that follow these standards. Agents MUST run every applicable gate before marking work complete.

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
| Frontend unit tests | `pnpm test` |
| Frontend build | `pnpm build` |
| Frontend audit | `pnpm audit` |
| Playwright E2E | `pnpm exec playwright test --config apps/web/playwright.config.ts` |
| OpenAPI freshness | Regenerate spec and types, then `git diff --exit-code` on artifacts |

Skip frontend gates when the project has no frontend. Skip Playwright when no `apps/web/e2e/` exists yet (document in project ADR). Skip OpenAPI freshness when no generated frontend API types are committed.

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

Use `docs/templates/ci-workflow.yml` as the canonical workflow template. It includes backend gates, frontend gates, OpenAPI freshness, Playwright, and optional standards submodule tag verification.

---

## 4. Pre-Commit Hooks

Pre-commit hooks are OPTIONAL. When used, they MUST be fast and local.

Local hooks MAY include:

```bash
dotnet format --verify-no-changes
pnpm lint
pnpm type-check
```

Do not run containerized integration tests or Playwright in pre-commit hooks. Keep slower checks in CI.
