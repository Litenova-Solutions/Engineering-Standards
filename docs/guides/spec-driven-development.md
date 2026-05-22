# Spec-Driven Development

This guide defines how feature specifications are written, reviewed, and consumed by agents. Use it when implementing a feature from a written spec rather than ad hoc instructions.

---

## Agent Quick Rules

- Every non-trivial feature MUST have a spec in the project repository before agent implementation starts.
- Specs MUST use `docs/templates/feature-spec.md` as the starting structure.
- Spec terminology MUST match `docs/domain/ubiquitous-language.md` in the project repository.
- Implementation MUST follow the scaffolding sequence in `docs/conventions/shared/agentic-guardrails.md` section 2.
- The OpenAPI spec is generated from the implementation; the feature spec describes intent, not hand-written OpenAPI.

---

## 1. Spec Location and Format

A feature spec is a markdown file in the project repository:

```text
docs/specs/{feature-name}.md
```

Copy `docs/templates/feature-spec.md` from the standards repository and fill in every section. The spec MUST describe:

- Domain model changes (aggregates, value objects, state transitions)
- Commands and queries (input shapes, result shapes, validation rules)
- HTTP endpoints (method, path, auth, idempotency requirements)
- UI flows (screens, user actions, empty/error/loading states)
- Acceptance criteria (testable, numbered)

A spec is not ready for implementation until a human has reviewed it against the ubiquitous language glossary.

---

## 2. Scaffolding Sequence

The spec provides inputs to each step of the deterministic scaffolding sequence:

| Step | Spec input |
|:---|:---|
| Domain | Aggregates, value objects, events, invariants |
| Application.Write | Commands, validators, handler behavior |
| Application.Read | Queries, pagination, result projections |
| Infrastructure | Persistence mapping, outbox/idempotency if required |
| WebApi | Endpoints, request/response models, auth |
| Frontend | UI flows, feature slice layout, Server Actions |
| Tests | Acceptance criteria mapped to unit, integration, and E2E tests |

Do not start Step N+1 until Step N artifacts compile and pass the checkpoint commands in `docs/conventions/shared/agentic-guardrails.md` section 2.

Minimum commands between steps:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
```

---

## 3. OpenAPI Relationship

The feature spec is the human-readable contract. The OpenAPI document is the machine-readable contract generated from the WebApi implementation.

Workflow:

1. Implement endpoints per spec.
2. Build the .NET solution; OpenAPI is emitted at build time.
3. Copy the generated spec to `packages/api-types/openapi.json` (monorepo) or the project equivalent.
4. Regenerate TypeScript types with `pnpm generate:api-types`.
5. Commit generated artifacts in the same PR as the implementation.

If the generated OpenAPI differs from what the spec intended, fix the implementation or update the spec in a follow-up PR before merging.

---

## 4. Spec Review Gates

Before assigning an agent to implement a spec, confirm:

- [ ] All terms in the spec appear in `docs/domain/ubiquitous-language.md` or the glossary was updated in the same PR.
- [ ] Commands and queries are named with ubiquitous language verbs and nouns.
- [ ] Pagination, auth, and idempotency requirements are explicit for list and mutating endpoints.
- [ ] UI flows list all four states: loading, empty, error, loaded.
- [ ] Acceptance criteria are numbered and map to test types (unit, integration, E2E).

---

## 5. Related Documents

| Document | Purpose |
|:---|:---|
| `docs/guides/add-new-feature.md` | Step-by-step implementation after the spec is approved |
| `docs/guides/definition-of-done.md` | Completion checklist before closing the feature |
| `docs/templates/feature-spec.md` | Spec template |
| `docs/templates/ubiquitous-language.md` | Glossary template for the project repository |
