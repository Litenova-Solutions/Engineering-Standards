# Onboarding

Narrative entry path for engineers joining a project that consumes Engineering Standards. AI agents SHOULD use `AGENTS.md` and `standards.manifest.json` instead of this guide for routine implementation.

---

## What you are working with

Your application repository pins this standards repository (usually as a `standards/` git submodule). The standards define **how** to structure code, tests, and documentation. Your project defines **what** the business does under `docs/domain/`.

Tri-layer naming is intentional: the same use case name appears in `docs/domain/{feature}/{use-case}.md`, backend `{Feature}/{UseCase}/`, and frontend `features/{feature}/{use-case}/`. You can follow the same name across layers without a separate map.

---

## Before your first line of code

1. Read the project root `AGENTS.md` shim (points at `standards/AGENTS.md` and lists project-specific rules).
2. Skim `standards/docs/architecture/clean-architecture.md` for layer boundaries.
3. Open `docs/domain/README.md` in the **project** repo for features and doc status.
4. Open the feature README and use case doc for the task you were assigned.
5. Load only the convention files for your layer (see `agentLoadPlans` in `standards/standards.manifest.json` or ask which plan applies: `backend.domain`, `frontend.app`, etc.).

Do not read `docs/philosophy.md` or `docs/decisions/` unless you are choosing a new dependency or understanding a historical trade-off.

---

## First implementation task (typical use case)

| Step | Where |
|:---|:---|
| Understand behavior | `docs/domain/{feature}/{use-case}.md` |
| Understand tests expected | `docs/domain/{feature}/{use-case}.tests.md` |
| Implement backend | Follow `docs/guides/add-new-use-case.md` and layer conventions |
| Implement frontend | Same guide; UI page doc under `docs/ui/{app}/pages/` when applicable |
| Verify | Project commands in shim `AGENTS.md`; gates in `standards/docs/conventions/shared/ci.md` |
| Finish | `standards/docs/guides/definition-of-done.md` |

If operation or test docs are missing, write them first per `docs/guides/write-use-case-doc.md` before coding.

---

## Where to look things up

| Question | Document |
|:---|:---|
| Term definitions (Reactions, spec-anchored, tiers, tags) | `standards/docs/glossary.md` |
| All convention file paths | `standards/standards.manifest.json` → `conventionIndex` |
| Why a stack choice exists | `standards/docs/decisions/README.md` (humans; not routine agent load) |
| Copy-paste scaffolds | `standards/docs/blueprints/README.md` |
| Domain doc templates | `standards/docs/templates/docs/` |
| CI and Docker templates | `standards/docs/templates/config/` |
| Operations (deploy, rollback) | `standards/docs/runbooks/README.md` |
| Reference consumer monorepo | [LitePress](https://github.com/Litenova-Solutions/LitePress) |

---

## Common mistakes

- Treating `docs/domain/` content as optional after the first sprint (docs drift causes wrong agent and human behavior).
- Using `Guard.Against` in validators (maps to HTTP 500). See `docs/conventions/backend/exception-hierarchy.md`.
- Injecting repositories into query handlers (use `IDatabaseContext` only).
- Cross-feature imports in Next.js `features/` folders.
- Upgrading package versions without checking `standards.manifest.json` pins.

---

## Related documents

| Document | Audience |
|:---|:---|
| `README.md` (standards repo root) | Submodule setup and versioning |
| `docs/README.md` | Documentation map |
| `docs/guides/agentic-domain-driven-design.md` | Domain documentation system |
| `docs/philosophy.md` | Long-form rationale (optional read) |
