# Local IDE Setup

VS Code and Cursor configuration for Aspire monorepos. Commit `.vscode/` files to the project repository so every contributor gets the same debug experience.

---

## Recommended extensions

Commit `.vscode/extensions.json`:

| Extension ID | Purpose |
|:---|:---|
| `ms-dotnettools.csdevkit` | C# debugging |
| `ms-dotnettools.vscode-dotnet-runtime` | .NET runtime |
| `ms-azuretools.vscode-aspire` | Aspire dashboard integration |
| `dbaeumer.vscode-eslint` | Frontend lint (when applicable) |

---

## Launch configurations

Copy `docs/templates/vscode-launch.json` to `.vscode/launch.json` and replace `{ProjectName}` with your project name.

Typical configs:

| Config | Use |
|:---|:---|
| Debug AppHost | Full-stack local dev with Aspire |
| Debug WebApi (standalone) | Manual path without Aspire |
| Attach to Next.js (port 9229) | Frontend debugging |
| Compound: Aspire + Next.js | API and frontend breakpoints together |

Start Next.js with inspect enabled:

```bash
NODE_OPTIONS='--inspect' pnpm dev:web
```

---

## Tasks

Optional `.vscode/tasks.json` entries:

| Task | Maps to |
|:---|:---|
| `bootstrap` | Submodule init, `dotnet tool restore`, `pnpm install` |
| `db:migrate` | Root `pnpm db:migrate` |
| `dev:aspire` | Root `pnpm dev:aspire` |

---

## Optional devcontainer

For teams that want identical toolchains, copy `docs/templates/devcontainer/devcontainer.json`. Requires Docker. Not required for standards compliance.

---

## References

- `docs/conventions/backend/13-deployment-and-migrations.md` — Aspire orchestration
- `docs/conventions/shared/ci.md` — root script conventions
