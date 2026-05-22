# Single-Project Setup

These standards apply to both monorepos and single-project repositories. The monorepo layout in `docs/conventions/shared/monorepo-structure.md` is the reference for multi-app repositories. This guide documents the adjustments when the repository contains one backend and optionally no frontend.

---

## When to Use This Layout

Use a single-project repository when:

- The product has one .NET API and no Next.js frontend in the same repo, or
- The frontend lives in a separate repository, or
- The team does not use pnpm workspaces or Turborepo.

---

## Directory Layout

Replace the `apps/api/` nesting with the repository root:

```text
{ProjectName}/                     ← repository root = .NET solution root
├── global.json
├── Directory.Build.props
├── Directory.Packages.props
├── {ProjectName}.slnx
├── .config/
│   └── dotnet-tools.json
├── src/
│   ├── {ProjectName}.Domain/
│   ├── {ProjectName}.Application.Write.Contracts/
│   ├── ... (same project set as monorepo)
│   └── {ProjectName}.AppHost/
├── tests/
│   └── ... (same test projects)
└── docs/
```

Do not create:

- `apps/api/` (solution lives at root)
- `apps/web/` (unless this repo also hosts the frontend; then use the monorepo layout instead)
- `packages/api-types/` or `packages/api-client/` (unless you adopt OpenAPI type generation locally)
- `pnpm-workspace.yaml`, `turbo.json`, or root `package.json` (unless a frontend is added)

---

## Path Conventions

In single-project documentation and commands, use:

| Monorepo path | Single-project path |
|:---|:---|
| `apps/api/{ProjectName}.slnx` | `{ProjectName}.slnx` |
| `apps/api/src/{ProjectName}.WebApi` | `src/{ProjectName}.WebApi` |
| `apps/api/tests/{ProjectName}.Domain.Tests` | `tests/{ProjectName}.Domain.Tests` |
| `dotnet run --project apps/api/src/{ProjectName}.AppHost` | `dotnet run --project src/{ProjectName}.AppHost` |

---

## Aspire AppHost

The AppHost project still exists for local development orchestration. It references `src/{ProjectName}.WebApi` and any worker projects under `src/`.

If a Next.js app exists in another repository, do not add `AddNextJsApp` to AppHost. Configure CORS and API URLs through environment-specific options instead.

---

## Agent Context

When working in a single-project repository, skip all frontend convention references in `AGENTS.md` if the project has no `apps/web/` or frontend package. Backend conventions apply unchanged.

---

## Related Documents

| Document | Purpose |
|:---|:---|
| `docs/guides/create-new-project.md` | Greenfield setup (adapt paths per this guide) |
| `docs/conventions/backend/01-solution-structure.md` | Internal solution layout (same under `src/` and `tests/`) |
| `docs/conventions/shared/monorepo-structure.md` | Full monorepo layout when adding a frontend later |
