---
{
  "id": "core.addd",
  "kind": "core",
  "normative": true,
  "appliesTo": ["use-case.authoring", "all"],
  "recipes": []
}
---
# Agentic Domain-Driven Delivery

ADDD turns product intent into one traceable vertical use case at a time. It uses domain language and aggregate boundaries without treating every feature as a bounded context.

## Agent Quick Rules {#agent-quick-rules}

- Start with a product brief, glossary, capability map, and irreversible decisions.
- Keep one specification file per use case.
- Use stable acceptance IDs.
- Add critical sections only when a criticality trigger applies.
- Generate catalogs and trace reports instead of maintaining duplicate tables.

## ADDD.INCEPTION.001 - Complete the thin inception gate

Before use-case implementation, create:

- `docs/product/brief.md`
- `docs/domain/glossary.md`
- `docs/domain/README.md`
- Decision records for constraints that are expensive to reverse

The brief names the target user, problem, primary v1 journey, success measure, non-goals, operating target, and data classification.

## ADDD.FEATURE.001 - Group use cases by business capability

Each capability has `docs/domain/{feature}/README.md` with its purpose, shared terms, actors, and feature-level invariants. The generated index owns the use-case list.

## ADDD.USECASE.001 - Keep one use-case specification

Each operation uses `docs/domain/{feature}/{use-case}.md`. It contains intent, actor, authorization, preconditions, inputs, outputs, business rules, main flow, failures, examples, and acceptance criteria.

The operation file replaces separate operation and test-spec files. Do not record test class or method names in it.

Required metadata:

```json
{
  "id": "posts.create",
  "kind": "command",
  "status": "active",
  "actors": ["author"],
  "surfaces": ["api", "web"],
  "criticality": ["authorization"],
  "recipes": []
}
```

The directory supplies the feature name. The filename supplies the operation name.

## ADDD.ACCEPTANCE.001 - Give each criterion a stable ID

Use `AC-{FEATURE}-{USECASE}-{NN}`. Never reuse or renumber an accepted ID.

Example:

```text
[AC-POSTS-CREATE-01] An authenticated author can create a draft
with a unique slug.
```

Every active ID must appear in at least one automated test. Tests for internal implementation details do not need an acceptance ID.

## ADDD.ASSURANCE.001 - Escalate critical use cases

An empty `criticality` list uses standard assurance. Authorization, money, sensitive data, irreversible behavior, concurrency, durable external delivery, or availability requirements trigger critical assurance.

Add only applicable critical sections: abuse cases, concurrency, idempotency, privacy, audit, external recovery, compensation, and required cross-layer evidence.

## ADDD.PAGE.001 - Document pages only when composition requires it

Create a page document when a route combines two use cases, has a multi-step interaction, owns non-trivial state or permissions, or defines public metadata. A simple one-use-case page stays represented by the use-case specification and generated route index.

## ADDD.SYNC.001 - Update specifications with behavior

Change the use-case specification, implementation, tests, OpenAPI, generated client, and generated indexes in the same pull request when observable behavior changes.

