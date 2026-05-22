# Documentation Map

Use this map to load the right files. Agents MUST follow `AGENTS.md` at the repository root.

## Normative (latest rules)

| Path | Purpose |
|:---|:---|
| `conventions/` | MUST/MUST NOT rules and code examples |
| `architecture/clean-architecture.md` | Layer diagram and dependency rules |
| `guides/definition-of-done.md` | Completion checklist |
| `guides/add-new-feature.md` | Feature implementation playbook |
| `guides/spec-driven-development.md` | Feature spec workflow |
| `guides/create-new-project.md` | Greenfield monorepo setup |

## Decisions (why, not what)

| Path | Purpose |
|:---|:---|
| `decisions/README.md` | Active index with links to canonical conventions |
| `decisions/*.md` | Rationale for stack choices; do not load for routine coding |

## Templates and blueprints (copy to consumer repos)

| Path | Purpose |
|:---|:---|
| `templates/` | CI workflow, Dockerfiles, `global.json`, inventories, feature spec |
| `blueprints/README.md` | Complete Program.cs, AppHost, endpoints, frontend scaffolds |
| `runbooks/README.md` | Operational procedures index |

## Reference (humans only)

| Path | Purpose |
|:---|:---|
| `philosophy.md` | Long-form architecture rationale |
| `agentic-development.md` | Why standards are agent-first |
