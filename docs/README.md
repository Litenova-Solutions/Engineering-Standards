# Documentation Map

Use this map to load the right files. Agents MUST follow `AGENTS.md` at the repository root.

**New human engineers:** start with [`guides/onboarding.md`](guides/onboarding.md).

## Normative (latest rules)

| Path | Purpose |
|:---|:---|
| `conventions/` | MUST/MUST NOT rules and code examples (purpose-based filenames, no numeric prefix) |
| `conventions/shared/security-controls.md` | OWASP matrix, CI security gates, enforcement matrix |
| `conventions/shared/api-compatibility.md` | OpenAPI diff and breaking-change policy |
| `conventions/backend/object-authorization.md` | BOLA prevention and auth test matrix |
| `conventions/backend/api-acceptance-tests.md` | Reqnroll, `@usecase:` / `@ac:` tags |
| `conventions/backend/external-dependencies.md` | WireMock.Net, Respawn |
| `architecture/clean-architecture.md` | Layer diagram and dependency rules |
| `glossary.md` | ADDD-specific terms |
| `guides/agentic-domain-driven-design.md` | Domain doc tree, intellectual lineage |
| `guides/write-use-case-doc.md` | Authoring operation and test specs |
| `guides/add-new-use-case.md` | Implementation playbook |
| `guides/definition-of-done.md` | Completion checklist |
| `guides/create-new-project.md` | Greenfield monorepo setup |

Convention paths are also listed in `standards.manifest.json` → `conventionIndex`.

## Domain documentation (consumer projects)

Living source of truth under `docs/domain/` in each project:

| Level | Path | Role |
|:---|:---|:---|
| System | `docs/domain/README.md` | Index of features, use cases, doc status |
| Feature | `docs/domain/{feature}/README.md` | Aggregate, ubiquitous language, invariants |
| Operation | `docs/domain/{feature}/{use-case}.md` | Behavior, endpoints, HTTP contract |
| Test spec | `docs/domain/{feature}/{use-case}.tests.md` | Test Coverage table, variations |

Templates: `templates/docs/`. Config scaffolds: `templates/config/`.

## Reference implementation (consumer project)

**[LitePress](https://github.com/Litenova-Solutions/LitePress)** implements these standards end to end. Study it alongside templates and blueprints when building a similar stack.

## Decisions (why, not what)

| Path | Purpose |
|:---|:---|
| `decisions/README.md` | Index with status, concern tags, canonical conventions |
| `decisions/*.md` | Rationale; do not load for routine coding |

## Templates and blueprints

| Path | Purpose |
|:---|:---|
| `templates/README.md` | docs vs config split |
| `blueprints/README.md` | Complete Program.cs, endpoints, acceptance tests |
| `runbooks/README.md` | Operational procedures |

## Reference (humans only)

| Path | Purpose |
|:---|:---|
| `philosophy.md` | Long-form architecture rationale |
| `agentic-development.md` | Why standards are agent-first |
