# `docs/decisions/turborepo-as-monorepo-tool.md`: Turborepo as Monorepo Tool

**Status:** Accepted
**Date:** 2026-01-01

---

## Context

The project requires a monorepo to co-locate the Next.js frontend and the ASP.NET Core backend. Three options were evaluated:

**Turborepo with pnpm workspaces:** Uses a `turbo.json` configuration file with a `tasks` key. The `pipeline` key was removed in Turborepo v2; any reference to `pipeline` in configuration is v1 syntax and must be migrated. Tasks define dependencies between build steps, output paths for caching, and which steps can run in parallel. Remote caching is available free on all plans via Vercel Remote Cache, or self-hosted via the open-source `ducktors/turborepo-remote-cache` project.

**Nx:** More features than Turborepo: code generation, project graph visualization, module federation support, and a plugin system. The tradeoff is higher configuration overhead and a steeper learning curve. Nx is better suited to large organizations with many teams.

**Plain pnpm workspace without a task runner:** A `pnpm-workspace.yaml` file defines the packages. This works fine for package management and shared dependencies but provides no incremental builds, no remote caching, and no cross-package task dependency resolution.

The .NET backend does not integrate with pnpm workspaces. It is managed by `dotnet` tooling. Co-locating it in the repository is purely for developer convenience: a single `git clone` gives a developer everything they need to work on the full stack.

The key requirements for evaluation were: incremental builds, remote caching, support for mixed TypeScript and .NET projects, and simplicity for a small team.

---

## Decision

Turborepo with pnpm workspaces is the monorepo tool.

The `turbo.json` uses the `tasks` key (not the deprecated `pipeline` key). The .NET backend (`backend/`) is co-located in the repository but excluded from `pnpm-workspace.yaml`. It is built independently via `dotnet build`.

The repository root `package.json` defines full-stack scripts that run both toolchains:

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:backend": "dotnet build apps/api/{ProjectName}.slnx",
    "test:backend": "dotnet test apps/api/{ProjectName}.slnx",
    "verify": "pnpm build && pnpm build:backend && pnpm test:backend"
  }
}
```

Example `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "generate:api": {
      "outputs": ["src/api.d.ts"]
    }
  }
}
```

Example `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
# backend/ is intentionally excluded - managed by dotnet tooling
```

---

## Consequences

**Positive:**

- Incremental builds reduce CI time significantly after the first run.
- Remote caching is free via Vercel Remote Cache; no infrastructure needed.
- Configuration is minimal: a single `turbo.json` with a `tasks` block.
- The `tasks` key is the current v2 API; no migration risk for new projects.

**Negative:**

- Anyone upgrading a project from Turborepo v1 must migrate `pipeline` to `tasks`. This is a one-time codemod.
- The .NET build is not part of the pnpm workspace graph. Root scripts coordinate the full-stack verification command, but Turborepo does not cache .NET outputs by default.

**Risks:**

- Vercel Remote Cache has no SLA for free plans. Self-host `ducktors/turborepo-remote-cache` if uptime guarantees are required.
- The separation between pnpm workspace packages and .NET projects means the monorepo is not a single unified build graph. This is acceptable for the current team size.