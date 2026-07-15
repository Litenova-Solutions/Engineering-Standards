# Agentic Domain-Driven Delivery

## Intent

Agentic Domain-Driven Delivery (ADDD) is Litenova's method for turning product intent into one traceable use case at a time. It gives human contributors and AI agents a durable source for business language, observable behavior, risk, and completion evidence.

ADDD uses a focused set of domain-driven design ideas: one bounded context, shared language, business capabilities, aggregates as consistency boundaries, and use cases expressed in domain terms. It avoids a long modeling phase before the first user journey works.

## Why ADDD exists

AI-assisted development happens across sessions with different context. Without a durable product and behavior record, agents may reinterpret requirements, rename business concepts, add architecture from habit, or update code without updating tests and documentation.

Each ADDD artifact controls one source of drift:

| Artifact | Purpose |
|:---|:---|
| Product brief | Defines the first user, problem, primary journey, success measure, non-goals, operating target, and data classification. |
| Domain glossary | Gives every contributor one business vocabulary. |
| Domain index | Acts as the capability map and orders the use cases in the primary journey. |
| Capability index | Defines capability-specific actors, terms, invariants, and use cases. |
| Use-case specification | Defines one operation, its contract, rules, failures, examples, risk flags, and acceptance criteria. |
| Page specification | Defines composition only when a route combines behavior or owns non-trivial interaction state. |
| Decision record | Preserves a costly or standards-changing choice and its reason. |

## Worked example

Assume a publishing product whose first journey is "an author creates and publishes a post."

1. `docs/product/brief.md` identifies authors as the first user and publication as the success path.
2. `docs/domain/glossary.md` defines `Draft`, `Published`, and `Slug`.
3. `docs/domain/README.md` lists the `Posts` capability and orders `create-draft` before `publish-post`.
4. `docs/domain/posts/create-draft.md` defines inputs, ownership, failures, and acceptance criteria.
5. The implementation uses the same `Posts` and `CreateDraft` names in Domain, Application, API, and frontend feature folders.
6. Automated tests cite `AC-POSTS-CREATE-DRAFT-01`.
7. The use case becomes active only after its observable behavior and automated evidence exist.

If publication must emit a notification that cannot be lost after a commit, the use case activates `outbox-worker`. A notification that may be retried manually can remain a best-effort post-commit reaction.

## Delivery flow

1. Define the thin inception artifacts.
2. Select the next use case in the primary journey.
3. Write its contract and acceptance criteria.
4. Mark risk flags and select required extensions.
5. Load the task-specific conventions.
6. Implement the complete domain-to-surface slice.
7. Add automated evidence for every acceptance criterion.
8. Run baseline and extension verification.
9. Update the specification when observable behavior changes.
10. Start the next use case only after the current slice is complete.

## Identifier model

| Identifier | Format | Example |
|:---|:---|:---|
| Capability | lowercase kebab-case | `posts` |
| Use case | `{capability}.{use-case}` | `posts.create-draft` |
| Acceptance criterion | `AC-{CAPABILITY}-{USE-CASE}-{NN}` | `AC-POSTS-CREATE-DRAFT-01` |
| Rule | uppercase dotted ID | `ADDD.USECASE.001` |
| Extension | lowercase kebab-case | `outbox-worker` |

Never reuse an accepted identifier for different behavior.

## Agent Summary {#agent-summary}

- Start with a product brief, glossary, domain index, and costly decisions.
- Keep one Markdown specification per use case.
- Use capability names consistently across documentation and code.
- Add risk sections and extensions only when their criteria apply.
- Give every acceptance criterion a stable ID and cite it from automated tests.
- Update specifications with observable behavior.

## Standards

### Complete the thin inception gate (ADDD.INCEPTION.001)

Before implementing the first use case, create:

```text
docs/product/brief.md
docs/domain/glossary.md
docs/domain/README.md
docs/decisions/             when a costly or standards-changing choice exists
```

Keep each artifact short. The purpose is durable orientation, not a complete future product design.

### Move one use case through the delivery flow (ADDD.FLOW.001)

Finish one primary-journey use case across every required layer before starting a secondary capability. Placeholder persistence, API, UI, tests, deployment work, or recovery instructions mean the slice remains incomplete.

### Group use cases by business capability (ADDD.CAPABILITY.001)

Each capability owns `docs/domain/{capability}/README.md`. It records purpose, actors, capability terms, shared invariants, and a short use-case list.

Use the same capability name for Application folders, API endpoint groups, and frontend feature folders.

### Keep one specification per use case (ADDD.USECASE.001)

Each operation owns `docs/domain/{capability}/{use-case}.md`. The file contains intent, actors, authorization, preconditions, input, output, business rules, main flow, failures, examples, acceptance criteria, and applicable risk sections.

The specification does not list test class or method names. Tests cite stable acceptance IDs instead.

### Declare use-case routing metadata (ADDD.METADATA.001)

Use this JSON block at the top of each use-case specification:

```json
{
  "id": "posts.create-draft",
  "operationType": "command",
  "status": "active",
  "actors": ["author"],
  "deliverySurfaces": ["api", "web"],
  "riskFlags": ["authorization"],
  "extensions": []
}
```

`operationType` is `command` for behavior that may change state and `query` for read-only behavior. Status is `planned`, `active`, or `retired`.

Allowed risk flags are `authorization`, `money`, `sensitive-data`, `irreversible`, `concurrency`, `durable-delivery`, and `availability`.

### Give each criterion a stable ID (ADDD.ACCEPTANCE.001)

Use `AC-{CAPABILITY}-{USE-CASE}-{NN}`. Never reuse or renumber an accepted ID.

```text
[AC-POSTS-CREATE-DRAFT-01] An authenticated author can create a draft
with a unique slug.
```

### Verify acceptance coverage from source (ADDD.TRACE.001)

Every active acceptance ID appears in at least one automated test. Search the consumer test roots for each exact ID. A missing ID fails completion. Internal implementation tests do not need an acceptance ID.

### Increase assurance from risk flags (ADDD.ASSURANCE.001)

An empty `riskFlags` list uses standard assurance. A listed risk adds only the relevant specification and evidence.

| Risk flag | Add when applicable |
|:---|:---|
| `authorization` | Ownership rules, forbidden cases, and resource-existence disclosure behavior. |
| `money` | Precision, currency, duplicate-charge prevention, reconciliation, and audit evidence. |
| `sensitive-data` | Classification, minimization, retention, logging restrictions, and access evidence. |
| `irreversible` | Confirmation, compensation, audit, and recovery behavior. |
| `concurrency` | Conflicting-write examples, version behavior, and integration evidence. |
| `durable-delivery` | Delivery guarantee, idempotency, retry, dead-letter, and replay behavior. |
| `availability` | Dependency failure, timeout, fallback, recovery, and operating evidence. |

### Document pages only when composition requires it (ADDD.PAGE.001)

Create a page specification when a route combines multiple use cases, owns a multi-step interaction, has non-trivial permissions or URL state, or defines public metadata. A simple page represented by one use case stays documented by the use-case specification and route code.

### Update specifications with behavior (ADDD.SYNC.001)

Change the use-case specification, implementation, tests, OpenAPI, generated client, and affected page specification in the same pull request when observable behavior changes.

## Conventions

### Use this consumer documentation layout

```text
docs/
  product/
    brief.md
  domain/
    README.md
    glossary.md
    posts/
      README.md
      create-draft.md
      publish-post.md
  ui/
    web/
      editor-page.md          only when the page trigger applies
  decisions/
    0001-example.md
```

### Keep specifications readable without tooling

Use JSON only for the short routing block. Write contracts, rules, failures, examples, and acceptance criteria in Markdown prose and tables.

### Record status accurately

- `planned` means the contract may change and does not claim implementation.
- `active` means observable behavior exists and every acceptance ID has automated evidence.
- `retired` preserves history after behavior and public entry points are removed.

## Examples

A command use case normally contains authorization and failure behavior. A public catalog query may have no actor and no risk flags. A payment command normally carries `money`, `authorization`, `concurrency`, and `durable-delivery` risk flags and activates the corresponding extensions.

## Verification

- Confirm inception files exist before the first implementation slice.
- Confirm capability and use-case names match code folders.
- Confirm every active acceptance ID appears in test source.
- Confirm every listed extension exists in `standards.project.json`.
- Confirm each risk flag has the required evidence.
- Confirm observable changes update specifications in the same diff.
