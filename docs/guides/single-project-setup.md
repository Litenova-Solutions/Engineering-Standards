# Single-Project Setup (Legacy)

**Status:** Legacy exception. The default layout is monorepo under `apps/` per `docs/conventions/shared/monorepo-structure.md`.

Use this guide only when a project ADR documents why the repository cannot use `apps/api/` and `apps/web/`. New greenfield projects MUST use the monorepo layout and `docs/guides/create-new-project.md`.

---

## When This Layout Applies

- Backend-only repository with no plan for a colocated frontend, and an ADR approves repository-root `src/`.
- Existing repository migration is blocked; ADR documents the exception and sunset plan.

---

## Directory Layout

Replace `apps/api/` nesting with the repository root:

```text
{ProjectName}/                     ← repository root = .NET solution root
├── global.json
├── Directory.Build.props
├── Directory.Packages.props
├── {ProjectName}.slnx
├── .config/
│   └── dotnet-tools.json
├── src/
│   └── ... (same project set as monorepo)
├── tests/
│   └── ...
└── docs/
    └── domain/
        ├── README.md
        └── {feature}/
            ├── README.md
            └── {use-case}.md
```

Do not create `apps/api/` when using this layout.

---

## Path Conventions

| Monorepo path | Single-project path |
|:---|:---|
| `apps/api/{ProjectName}.slnx` | `{ProjectName}.slnx` |
| `apps/api/src/{ProjectName}.WebApi` | `src/{ProjectName}.WebApi` |
| `apps/api/tests/{ProjectName}.Domain.Tests` | `tests/{ProjectName}.Domain.Tests` |

---

## Related Documents

| Document | Purpose |
|:---|:---|
| `docs/guides/create-new-project.md` | Preferred greenfield setup |
| `docs/conventions/shared/monorepo-structure.md` | Authoritative monorepo layout |
