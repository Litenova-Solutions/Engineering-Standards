# Templates

Two categories live under this directory. Copy paths into consumer projects as documented in `docs/guides/create-new-project.md`.

| Subdirectory | Contents | Consumption |
|:---|:---|:---|
| `docs/` | Domain and UI markdown templates, `domain-agent-index.json`, `project-agents.md` | Copy and fill in project `docs/domain/`, `docs/ui/`, and root `AGENTS.md` |
| `config/` | CI, Docker, MSBuild, pnpm, Playwright, infra | Copy or merge into repo root and `apps/` |

Do not mix the categories in automation scripts: documentation templates change with ADDD structure; config templates change with stack pins in `standards.manifest.json`.
