# Upgrade to Standards v1.3

Standards v1.3 replaces the draft domain-record taxonomy with one ADDD concept model. The migration is intentionally breaking. Current standards and consumer records use the new terms without aliases.

## Vocabulary migration

| Earlier term | v1.3 term |
|:---|:---|
| Agentic Domain-Driven Delivery | Agent-Driven Domain Delivery |
| Critical Journey | Business Flow |
| Process Coordinator | Workflow Orchestrator |
| Reaction | Follow-up |
| Cross-cutting Contract | Shared Rule |
| Evidence Register | Claims and Evidence |
| Delivery Surface | Entry Point |
| Routing Metadata | Specification Metadata |
| Risk Flag | Risk |
| Context-wide Invariant | Shared Business Policy |

Historical changelogs, accepted decisions, and earlier upgrade guides may retain their original terms.

## Required consumer work

### Replace the document layout

Move records by ownership:

```text
docs/
  product/
    brief.md
    flows/
  domain/
    README.md
    glossary.md
    subjects/
    workflows/
    shared-rules/
  decisions/
  operations/
    limits.md
  runbooks/
  release/
  research/
```

Do not create optional directories until their first real record exists. Delete `docs/domain/cross-cutting/` after every current artifact has moved or been replaced.

Example migration for an event-commerce consumer:

```text
docs/domain/cross-cutting/critical-journeys.md
  becomes docs/product/flows/event-sales.md

docs/domain/cross-cutting/operating-limits.md
  becomes docs/operations/limits.md

docs/domain/cross-cutting/security-privacy-and-retention.md
  becomes one or more docs/domain/shared-rules/*.md records
```

Do not move a technical integration contract into `shared-rules/` merely because multiple Subjects use it. Keep provider and transport contracts with architecture or integration documentation.

### Replace Subject Aggregate assumptions

Remove `Primary aggregate root` and the requirement to write `None` for a read-only Subject. Add an Aggregate ownership table. A Subject may contain no Aggregate, one Aggregate, or multiple related Aggregates.

For every Command that changes multiple Aggregates, name the `INV-*` rule or Business Policy that requires one transaction. Review the Aggregate boundaries when the same group changes together frequently.

### Replace mandatory state hierarchies

Rewrite business tables with business-state names. Select no lifecycle representation, an enum, typed state objects, or a Value Object from actual behavior and required facts.

Update Domain, persistence mapping, document migration, and tests together when the selected representation changes stored data.

### Add Business Flow and Workflow records

The product brief names exactly one Primary Business Flow. A Business Flow connects Use cases to an outcome and owns `FC-*` checks.

Create a Workflow only for system-controlled progress across a transaction or time boundary. A durable Workflow records progress and outgoing Commands in one transaction. Each issued Command later enters its own pipeline.

Remove nested `ICommandMediator` dispatch from Command handlers. Keep atomic multi-Aggregate coordination in the top-level handler only when the Use case names the required transaction rule.

### Replace Follow-up terminology and delivery values

Rename business-facing Reaction sections to Follow-ups. Keep technical handler suffixes.

Replace loose delivery labels with:

- `atomic`
- `durable`
- `rebuildable`
- `best-effort-optional`

A required projection cannot use `best-effort-optional`.

### Replace document metadata

Remove duplicated Markdown metadata sections. Every structured specification starts with one JSON block containing `kind`, `id`, `recordStatus`, `owner`, and `lastReviewed` plus its kind-specific fields.

Replace:

```json
{
  "id": "orders.cancel-order",
  "operationType": "command",
  "status": "active",
  "actors": ["buyer"],
  "deliverySurfaces": ["api"],
  "riskFlags": ["authorization"],
  "extensions": []
}
```

with:

```json
{
  "kind": "use-case",
  "id": "orders.cancel-order",
  "recordStatus": "current",
  "deliveryStatus": "verified",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "operationType": "command",
  "actors": ["buyer"],
  "entryPoints": ["api"],
  "risks": ["authorization"],
  "applicableExtensions": []
}
```

Map an earlier `planned` Use case to `recordStatus: current` and `deliveryStatus: planned` only when its target behavior is approved. Use `recordStatus: draft` while the specification remains under review.

Map an earlier `active` Use case to `deliveryStatus: verified` only after every acceptance criterion has an automated test reference and applicable checks pass.

### Replace extension selection

Rename `extensions` to `selectedExtensions` in `standards.project.json`.

The standards manifest uses `schemaVersion: 2` because extension entries now contain activation metadata instead of path strings.

- A project-scoped extension applies whenever selected.
- A local extension must be selected and listed in `applicableExtensions` on an allowed specification kind.
- `applicableKinds` in the manifest defines allowed local kinds.
- Do not copy project-scoped extensions into local metadata.

For example, `localization` is project-scoped. `outbox-worker` is local to Use cases or Workflows that require durable delivery. `persistence-ef-core` is local to affected Subjects or Use cases.

### Replace evidence records

Use Claims and Evidence only when research, provider approval, legal review, or assumptions affect a decision. Classify claims as `observed`, `calculated`, `inferred`, or `hypothesis`. A decision condition references claims and is not itself evidence.

Keep release execution results in one release evidence record.

### Replace the release gate

Application v1 requires:

- One deployed Primary Business Flow.
- Verified included Use cases, Workflows, Business Flow, and Pages.
- At least one passing `FC-*` check through the deployed public boundary.
- Current Operating Limits and required runbooks.
- One release evidence record tied to an immutable artifact.
- Resolved blocking claims, or a release boundary that excludes the affected behavior.

## Removed rule IDs

| Removed rule ID | Replacement |
|:---|:---|
| `ADDD.COORDINATOR.001` | `ADDD.WORKFLOW.001` and `APP.WORKFLOW.001` |
| `APP.COORDINATOR.001` | `APP.ORCHESTRATION.001` and `APP.WORKFLOW.001` |
| `APP.REACTIONS.001` | `APP.FOLLOWUP.001` |

`DOMAIN.STATE.001` remains but now selects a representation from business behavior instead of requiring typed state records.

## Validation

Validate the standards manifest and consumer project file against their schemas. Validate each structured metadata block against `schemas/specification-metadata.schema.json`.

Cross-file review or consumer CI must confirm:

- The product brief references exactly one Primary Business Flow.
- Business Flow Use-case references resolve.
- Every Subject directory has one Subject specification.
- Use-case IDs match Subject and filename.
- Workflow Commands and Events resolve to documented behavior.
- Shared Rule Subject references exist.
- Risks and extension IDs are known.
- Local extensions are selected and allowed for the specification kind.
- Acceptance and Flow-check definitions are unique and use their owning prefix.
- Verified acceptance IDs appear in test source.
- Passing test and Flow-check results appear in release evidence.

The standards repository does not bundle a consumer validator. JSON Schema proves file shape. Consumer CI or review tooling owns repository-specific cross-file checks.

## Stale reference scan

Before review, scan current consumer records and code for removed terms, fields, rule IDs, and paths. Historical records may retain old names.

Run complete backend, frontend, documentation, extension, deployment, restore, rollback, and Flow-check gates after migration.

## Version pin

During draft review, pin the consumer submodule to the exact reviewed commit. After publication, update it to the `v1.3.0` tag.
