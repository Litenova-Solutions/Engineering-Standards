# Documentation Map

Use this map to load the right files. Agents MUST follow `AGENTS.md` at the repository root.

## Normative (latest rules)

| Path | Purpose |
|:---|:---|
| `conventions/` | MUST/MUST NOT rules and code examples |
| `architecture/clean-architecture.md` | Layer diagram and dependency rules |
| `guides/agentic-domain-driven-design.md` | Domain doc tree and agent workflow |
| `guides/add-new-use-case.md` | Use case implementation playbook |
| `guides/definition-of-done.md` | Completion checklist |
| `guides/create-new-project.md` | Greenfield monorepo setup |

## Domain documentation (consumer projects)

Living source of truth under `docs/domain/` in each project:

| Level | Path | Role |
|:---|:---|:---|
| System | `docs/domain/README.md` | Index of features and use cases |
| Feature | `docs/domain/{feature}/README.md` | Aggregate, ubiquitous language, invariants |
| Use case | `docs/domain/{feature}/{use-case}.md` | Behavior, endpoints, UI, acceptance criteria |

## Decisions (why, not what)

| Path | Purpose |
|:---|:---|
| `decisions/README.md` | Active index with links to canonical conventions |
| `decisions/*.md` | Rationale for stack choices; do not load for routine coding |

## Templates and blueprints (copy to consumer repos)

| Path | Purpose |
|:---|:---|
| `templates/` | CI workflow, Dockerfiles, domain doc templates, infra |
| `blueprints/README.md` | Complete Program.cs, AppHost, endpoints, frontend scaffolds |
| `runbooks/README.md` | Operational procedures index |

## Reference (humans only)

| Path | Purpose |
|:---|:---|
| `philosophy.md` | Long-form architecture rationale |
| `agentic-development.md` | Why standards are agent-first |
