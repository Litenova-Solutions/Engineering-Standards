# Monorepo Structure

How Litenova monorepos organize runnable apps, shared packages, and tooling. These conventions apply to any project size: one frontend and one API, or many apps of each kind.

---

## Layout

```
{repo}/
├── apps/
│   ├── api/                    # .NET solution (may include AppHost, Worker, WebApi)
│   ├── web/                    # Example public Next.js app (name is project-specific)
│   ├── admin/                  # Example authenticated Next.js app (optional)
│   └── {other-app}/            # Additional frontends, workers, or services as needed
├── packages/                   # Shared TS configs, API types, theme tokens (not React UI)
├── scripts/                    # Bootstrap, dev helpers, CI helpers
├── docs/                       # Project docs (domain, technical, decisions)
└── standards/                  # Engineering Standards submodule (optional but typical)
```

Rules:

- The .NET solution MUST live under `apps/api/`, not at the repository root.
- Every runnable app MUST live under `apps/{name}/`.
- Shared TypeScript packages live under `packages/`. See [Shared packages](#shared-packages).
- Do not assume a repo has exactly one Next.js app or one WebApi. Read the project `AGENTS.md` and `docs/` for the app inventory.

---

## Multiple backends

A monorepo MAY contain more than one .NET deployable:

| Pattern | Location | Example |
|:---|:---|:---|
| Primary HTTP API | `apps/api/src/{Project}.WebApi/` | REST + OpenAPI |
| Background worker | `apps/api/src/{Project}.Worker/` | Outbox, scheduled jobs |
| Orchestration | `apps/api/src/{Project}.AppHost/` | .NET Aspire |
| Additional API | `apps/{name-api}/` | Separate bounded context or public BFF (project ADR) |

Each backend owns its own solution or project references. Shared domain code stays in class libraries under `apps/api/src/`, not duplicated across unrelated solutions unless a project ADR documents the split.

---

## Multiple frontends

A monorepo MAY contain any number of Next.js (or other) frontends under `apps/`:

| Pattern | Typical role |
|:---|:---|
| `apps/web/` | Public, SEO-first site |
| `apps/admin/` | Authenticated authoring or operations |
| `apps/{portal}/` | Partner, mobile web, or vertical-specific UI |

Each frontend:

- Owns `app/`, `features/`, `components/ui/`, and `lib/env.ts` independently.
- MUST NOT import from another app's `features/` folder.
- MAY share **design tokens** via a workspace CSS package (see [Frontend UI defaults](../frontend/02-components.md#41-shared-theme-vs-shared-components)).
- Runs its own dev script (`pnpm --filter {name} dev`) and CI workflow when present.

Playwright and Vitest paths are per app (`apps/{name}/e2e/`, `apps/{name}/vitest.config.ts`). DoD and CI commands MUST target every frontend that changed, not only `apps/web/`.

---

## Shared packages

Allowed under `packages/`:

| Package kind | Allowed | Notes |
|:---|:---:|:---|
| ESLint / TypeScript / Tailwind **config** | Yes | No React components |
| OpenAPI-generated **types** | Yes | `openapi.json` + `openapi-typescript` output |
| Typed **API client** wrapper | Yes | Thin `openapi-fetch` factory |
| **Theme tokens** (CSS only) | Yes | `@theme`, `:root` variables; no `components/ui/` |
| Shared **React component library** | No | Each app owns `components/ui/` via shadcn CLI |

---

## Workspace tooling

| Tool | Role |
|:---|:---|
| pnpm workspaces | `pnpm-workspace.yaml` lists `apps/*`, `packages/*` |
| Turborepo | Task graph in `turbo.json`; filter by changed packages in CI |
| Central package versions | .NET: `Directory.Packages.props`; npm: root overrides or per-app `package.json` aligned with `standards.manifest.json` |

---

## Documentation per app

Each app under `apps/` SHOULD have a README covering run commands, env vars, routes, and UI stack. When an app README or project ADR conflicts with these standards on an app-specific topic, **the project document wins**. See [Documentation precedence](../00-principles.md#11-documentation-precedence).

---

## Related

- `docs/conventions/frontend/07-feature-boundaries.md` — no cross-app feature imports
- `docs/conventions/shared/ci.md` — monorepo CI gates
- `docs/guides/definition-of-done.md` — per-app frontend checklist
