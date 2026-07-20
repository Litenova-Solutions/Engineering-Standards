# Agentic Domain-Driven Delivery

## Intent

Agentic Domain-Driven Delivery (ADDD) is Litenova's method for turning product intent into one traceable use case at a time. It gives human contributors and AI agents a durable source for business language, observable behavior, risk, and completion evidence.

ADDD uses a focused set of domain-driven design ideas: one bounded context, shared language, subjects as business navigation boundaries, aggregates as consistency boundaries, explicit state models, and use cases expressed in domain terms. It avoids a long modeling phase before the first user journey works.

Human discovery establishes the business concepts and rules. ADDD begins when those findings can be named and recorded. Agents may identify missing definitions, unreferenced transitions, or uncovered invariants; they do not invent domain concepts to complete a template.

## Why ADDD exists

AI-assisted development happens across sessions with different context. Without a durable product and behavior record, agents may reinterpret requirements, rename business concepts, add architecture from habit, or update code without updating tests and documentation.

Each ADDD artifact controls one source of drift:

| Artifact | Purpose |
|:---|:---|
| Product brief | Defines the first user, problem, primary journey, success measure, non-goals, product and operating context, operating target, and data classification. |
| Domain glossary | Gives every contributor one business vocabulary. |
| Domain index | Lists the subjects and orders the use cases in the primary journey. |
| Subject specification | Defines purpose, actors, language, the primary aggregate root, states, transitions, invariants, events, reactions, and use cases. |
| Use-case specification | Defines one operation, its contract, rules, failures, examples, risk flags, and acceptance criteria. |
| Page specification | Defines composition only when a route combines behavior or owns non-trivial interaction state. |
| Decision record | Preserves a costly or standards-changing choice and its reason. |

ADDD uses the planning hierarchy `Product -> Bounded context -> Subject -> Use case -> Acceptance criterion`. Version 1 has one bounded context, represented by the Domain index and glossary. A subject groups one or more related use cases. An aggregate root is not another planning level; it is the runtime consistency and mutation boundary named by a state-changing subject.

## Worked example

Assume a publishing product whose first journey is "an author creates and publishes a post."

1. `docs/product/brief.md` identifies authors as the first user and publication as the success path.
2. `docs/domain/glossary.md` defines `Draft`, `Published`, and `Slug`.
3. `docs/domain/README.md` lists the `Posts` subject and orders `create-draft` before `publish-post`.
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
| Subject | lowercase kebab-case | `posts` |
| Use case | `{subject}.{use-case}` | `posts.create-draft` |
| Acceptance criterion | `AC-{SUBJECT}-{USE-CASE}-{NN}` | `AC-POSTS-CREATE-DRAFT-01` |
| Invariant | `INV-{SUBJECT}-{NN}` | `INV-POSTS-01` |
| Rule | uppercase dotted ID | `ADDD.USECASE.001` |
| Extension | lowercase kebab-case | `outbox-worker` |

Never reuse an accepted identifier for different behavior.

## Agent Summary {#agent-summary}

- Start with a product brief, glossary, domain index, and costly decisions.
- Give authored documents an owner, status, canonical source, verification date, and implementation evidence.
- Record each subject's primary aggregate root, state records, transitions, invariants, events, and language before implementing its first command.
- Keep one Markdown specification per use case.
- Use subject names consistently across documentation and code.
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

Finish one primary-journey use case across every required layer before starting a secondary subject. Placeholder persistence, API, UI, tests, deployment work, or recovery instructions mean the slice remains incomplete.

### Group use cases by subject (ADDD.SUBJECT.001)

Each subject owns `docs/domain/{subject}/README.md`. A subject is the stable business noun that aligns documentation and code around one cohesive model and its use cases. The subject specification records purpose, actors, its primary aggregate root, owned children, referenced aggregate IDs, subject terms, rejected synonyms, state records, transitions, shared invariants, domain events, reactions, and a short use-case list.

A state-changing subject has one primary aggregate root. Its command use cases normally change that root, and its query use cases read projections that describe the subject. If a use case has a different consistency owner and independent language, create another subject instead of hiding the boundary inside the existing subject.

Subject is a documentation and navigation term. It does not replace the aggregate root runtime contract. Do not introduce `Subject`, `ISubject`, or `SubjectRoot` Domain types. Use the same subject name for Domain and Application folders, API endpoint groups, frontend feature folders, and test folders.

### Record the tactical domain model (ADDD.MODEL.001)

Before implementing a subject's first command, its subject specification names:

- The primary aggregate root, its owned children, and referenced aggregate IDs.
- Every primary aggregate state record and its state-specific data.
- Every allowed transition with its source state, business action, target state, invariant IDs, and owning use cases.
- Shared invariants with stable `INV-{SUBJECT}-{NN}` identifiers.
- Domain events and their known in-process or external reactions.
- Ubiquitous language and rejected synonyms.

Every aggregate has an explicit state record hierarchy, including an aggregate that currently has one state. The subject specification does not use a lifecycle enum as a shorthand. A read-only subject records `None` as its primary aggregate root and names the read source in each query specification.

When a required business fact is unknown, record a named modeling question and stop the affected use case. Do not create a state, transition, invariant, or event only to fill the document structure.

### Keep invariant identifiers stable (ADDD.INVARIANT.001)

Use `INV-{SUBJECT}-{NN}` for subject invariants. Never reuse or renumber an accepted invariant ID. Update the subject specification, affected use cases, and automated evidence together when the rule changes.

Each active invariant maps to at least one use case and one acceptance criterion. An invariant with no accepted behavior remains a visible modeling or delivery gap.

### Keep one specification per use case (ADDD.USECASE.001)

Each operation owns `docs/domain/{subject}/{use-case}.md`. The file contains intent, actors, authorization, preconditions, input, output, business rules, domain behavior, main flow, failures, examples, acceptance criteria, invariant coverage, and applicable risk sections.

A command names the aggregate action, source state, target state, invariant IDs, and emitted domain events. A query states that it has no domain transition and names its read source.

The specification does not list test class or method names. Tests cite stable acceptance IDs instead.

### Declare subject and use-case routing metadata (ADDD.METADATA.001)

Use this JSON block at the top of each subject specification:

```json
{
  "id": "posts",
  "status": "active"
}
```

`id` matches the subject directory name. `status` is `planned`, `active`, or `retired`.

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

`id` combines the owning subject and use-case identifiers. `operationType` is `command` for behavior that may change state and `query` for read-only behavior. `status` is `planned`, `active`, or `retired`.

`actors` lists the business actors that invoke or observe the use case. `deliverySurfaces` lists its public invocation or observation paths, such as `api`, `web`, or `worker`. `extensions` lists the extension IDs activated by the use case; each ID must exist in `standards.manifest.json` and be enabled in consumer `standards.project.json`.

Allowed risk flags are `authorization`, `money`, `sensitive-data`, `irreversible`, `concurrency`, `durable-delivery`, and `availability`.

### Give each criterion a stable ID (ADDD.ACCEPTANCE.001)

Use `AC-{SUBJECT}-{USE-CASE}-{NN}`. Never reuse or renumber an accepted ID.

```text
[AC-POSTS-CREATE-DRAFT-01] An authenticated author can create a draft
with a unique slug.
```

### Verify acceptance coverage from source (ADDD.TRACE.001)

Every active acceptance ID appears in at least one automated test. Search the consumer test roots for each exact ID. A missing ID fails completion. Internal implementation tests do not need an acceptance ID.

Each active subject invariant maps to at least one active acceptance ID. Each documented state transition maps to at least one command use case. Keep these mappings in the subject and use-case documents without recording test class or method names.

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

Use this JSON block at the top of each page specification:

```json
{
  "id": "web.editor-page",
  "app": "web",
  "route": "/editor",
  "useCases": ["posts.create-draft", "posts.publish-post"]
}
```

`id` combines the frontend application and page identifiers. `app` matches the owning frontend name, `route` is the public route pattern, and `useCases` lists the composed use-case IDs.

### Update specifications with behavior (ADDD.SYNC.001)

Change the use-case specification, implementation, tests, OpenAPI, generated client, and affected page specification in the same pull request when observable behavior changes.

### Check code and documentation consistency (ADDD.CONSISTENCY.001)

Current subject and use-case documents MUST map to the implementation surface they describe. A consistency check MUST:

- Compare subject and use-case IDs with their documentation folders and Domain, Application, API, frontend, and test folders.
- Confirm each state-changing subject names one primary aggregate root and that the corresponding Domain type derives from `AggregateRoot<TId>`.
- Confirm current aggregate, state, action, event, route, error, and authorization names exist in the owning code or are explicitly marked planned.
- Confirm every active acceptance ID appears in test source.
- Compare documented routes, operation IDs, response statuses, and error codes with the generated OpenAPI contract when the API surface exists.
- Detect more than one application or transport contract claiming ownership of the same operation.
- Report references to removed controllers, namespaces, packages, features, or other entry points.

When observable behavior or business language changes, update the owning documentation and evidence in the same change as the implementation. A current document that no longer maps to code MUST be marked planned, corrected, or retired.

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

Use the [domain modeling guide](../guides/model-domain.md) when creating or changing aggregate boundaries, state records, transitions, invariants, value objects, or events.

### Record status accurately

- `planned` means the contract may change and does not claim implementation.
- `active` means observable behavior exists and every acceptance ID has automated evidence.
- `retired` preserves history after behavior and public entry points are removed.

## Examples

A publish command maps `DraftPostState` to `PublishedPostState` through `Post.Publish`, cites `INV-POSTS-01`, and records `PostPublished`. Its acceptance criteria cover the allowed transition and rejected source states.

A public catalog query may have no actor and no risk flags. It states that it performs no domain transition and names the Marten projection it reads.

## Verification

- Confirm inception files exist before the first implementation slice.
- Confirm subject and use-case names match code folders.
- Confirm each state-changing subject names one primary aggregate root and no `ISubject` runtime abstraction exists.
- Confirm every aggregate has documented states and every transition names its owning use case.
- Confirm every active invariant maps to an active acceptance ID.
- Confirm every active acceptance ID appears in test source.
- Confirm every listed extension exists in `standards.project.json`.
- Confirm each risk flag has the required evidence.
- Confirm observable changes update specifications in the same diff.
- Run the code and documentation consistency checks for changed subjects, use cases, API contracts, and public names.
