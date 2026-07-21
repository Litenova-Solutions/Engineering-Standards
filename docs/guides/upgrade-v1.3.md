# Upgrade to Standards v1.3

Standards v1.3 names the full specification, engineering, verification, and release model the Agentic Engineering System. Litenova Solutions uses this general system to develop its software, but the company name is not part of the system name. The migration is breaking. Current standards and consumer records use the v1.3 terms without aliases.

The earlier Agent-Driven Domain Delivery name described only part of the model and made `agent-driven` sound like the product being delivered. The Agentic Engineering System is the whole engineering system. Agent-Driven Engineering describes how people and agents work inside it. Specification-Driven Delivery describes how approved intent becomes verified software.

This distinction reflects Litenova Solutions' working context: one technical founder owns product and engineering work, future contributors are likely to have technical backgrounds, agents perform a substantial part of execution, and role boundaries often belong to one person. The vocabulary therefore favors established engineering terms over invented role names or softened business labels.

Historical changelogs, accepted decisions, and earlier upgrade guides may retain their original terms.

## Vocabulary migration

Replace the current vocabulary as one model. Do not retain both terms as synonyms.

| Earlier term | v1.3 term | Meaning in v1.3 |
|:---|:---|:---|
| Agent-Driven Domain Delivery (ADDD) | Agentic Engineering System | The complete standards, specification, execution, verification, and release system. |
| ADDD delivery method | Agent-Driven Engineering | The operating model in which people define authority and judgment while agents perform bounded engineering work. |
| Implied delivery process | Specification-Driven Delivery | The approach in which approved specifications define intent and automated evidence verifies implementation. |
| Subject | Module | One named business responsibility used across documentation and code layers. |
| Business Flow | End-to-End Flow | A sequence of use cases that produces one observable product outcome. |
| Primary Business Flow | Primary Release Flow | The one end-to-end flow that anchors the application v1 release claim. |
| Flow Check | End-to-End Test | An executable test of an end-to-end flow through its deployed public boundary. |
| Follow-up | Event Reaction | Work triggered because a recorded event occurred. |
| Aggregate Rule | Aggregate Invariant | A condition an aggregate must preserve before and after every successful change. |
| Business Policy | Domain Policy | A named business rule that does not belong to one aggregate transition. |
| Shared Rule | Domain Policy | The specification for a domain policy that may apply within one module or across modules. |
| Input Rule | Validation Rule | A caller-correctable input rule checked before domain work begins. |
| Authorization Rule | Authorization Policy | A rule that decides whether an authenticated actor may perform an operation on a target. |
| Storage Constraint | Persistence Constraint | A data-store rule needed to preserve a domain or application guarantee. |
| Claims and Evidence | Decision Evidence | A separate record for evidence used by a decision when the investigation is large enough to need its own document. |
| Release Evidence | Release Record | The record of one release attempt and its exact artifact, checks, deployment result, and recovery evidence. |

Retain established terms where their boundaries remain accurate: product, use case, workflow, workflow orchestrator, aggregate, aggregate root, command, query, event, repository, read model, projection, outbox, acceptance criterion, operating limit, runbook, and Specification Metadata.

Use ordinary capitalization in prose. Write `module`, `aggregate`, `command`, and `workflow` as common nouns. Capitalize a code type such as `CancelOrderCommand`, a layer name such as `Domain`, or a document title.

## Replace the document layout

Move records by ownership:

```text
docs/
  product/
    brief.md
    flows/
  domain/
    README.md
    glossary.md
    modules/
    workflows/
    policies/
  decisions/
  operations/
    limits.md
  runbooks/
  releases/
  research/
  ui/
```

Apply these path changes:

| Earlier path | v1.3 path |
|:---|:---|
| `docs/domain/subjects/` | `docs/domain/modules/` |
| `docs/domain/shared-rules/` | `docs/domain/policies/` |
| `docs/release/` | `docs/releases/` |

Do not create optional directories until their first real record exists. Delete an earlier directory after every current artifact has moved or been replaced.

For an event-commerce consumer:

```text
docs/domain/subjects/orders/README.md
  becomes docs/domain/modules/orders/README.md

docs/domain/shared-rules/buyer-data-retention.md
  becomes docs/domain/policies/buyer-data-retention.md

docs/release/2026-07-21.md
  becomes docs/releases/2026-07-21.md
```

A provider transport contract is not a domain policy merely because multiple modules use it. Keep technical integration contracts with architecture or integration documentation.

## Rename templates and metadata kinds

Replace template paths and `kind` values together:

| Earlier template | v1.3 template | Earlier `kind` | v1.3 `kind` |
|:---|:---|:---|:---|
| `templates/docs/subjects-index.md` | `templates/docs/modules-index.md` | `subjects-index` | `modules-index` |
| `templates/docs/subject.md` | `templates/docs/module.md` | `subject` | `module` |
| `templates/docs/business-flow.md` | `templates/docs/end-to-end-flow.md` | `business-flow` | `end-to-end-flow` |
| `templates/docs/shared-rule.md` | `templates/docs/domain-policy.md` | `shared-rule` | `domain-policy` |
| `templates/docs/claims-and-evidence.md` | `templates/docs/decision-evidence.md` | `claims-and-evidence` | `decision-evidence` |
| `templates/docs/release-evidence.md` | `templates/docs/release-record.md` | `release-evidence` | `release-record` |

The product, domain index, glossary, use-case, workflow, page, operating-limits, decision, and runbook kinds retain their names.

## Replace metadata fields and values

Every structured specification starts with one JSON metadata block. Apply these field changes:

| Earlier field or value | v1.3 field or value |
|:---|:---|
| `recordStatus` | `specStatus` |
| `recordStatus: current` | `specStatus: approved` |
| `deliveryStatus` | `implementationStatus` |
| `primaryBusinessFlow` | `primaryReleaseFlow` |
| `participatingSubjects` | `participatingModules` |
| `appliesTo` on a `shared-rule` record | `appliesToModules` on a `domain-policy` record |

`specStatus` describes the authority of the specification:

- `draft` means the intent remains under review.
- `approved` means the specification is the current source of implementation intent.
- `retired` means the specification no longer governs current behavior.

`implementationStatus` describes whether code and evidence satisfy that intent:

- `planned` means implementation evidence is incomplete.
- `verified` means required acceptance references and applicable checks pass.

Do not use `current` as a status value in v1.3. `approved` names the authority decision directly.

Replace:

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

with:

```json
{
  "kind": "use-case",
  "id": "orders.cancel-order",
  "specStatus": "approved",
  "implementationStatus": "verified",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "operationType": "command",
  "actors": ["buyer"],
  "entryPoints": ["api"],
  "risks": ["authorization"],
  "applicableExtensions": []
}
```

Map an earlier planned use case to `specStatus: approved` and `implementationStatus: planned` only when its target behavior has approval. Use `specStatus: draft` while the specification remains under review.

Map an earlier active or verified use case to `implementationStatus: verified` only after every acceptance criterion has an automated test reference and applicable checks pass.

## Replace rule records

Do not carry the earlier `ruleType` field into a domain policy. The former umbrella mixed rules with different owners and enforcement boundaries.

Place each rule according to where it is enforced:

| Rule | Owner | Record location |
|:---|:---|:---|
| Aggregate invariant | Aggregate root | Module specification and use-case references |
| Validation rule | Application validator and domain value construction | Use-case specification |
| Authorization policy | Endpoint or application authorization boundary | Use-case specification and security documentation |
| Persistence constraint | Infrastructure mapping or database schema | Use-case, module, or persistence documentation |
| Domain policy | Named business authority beyond one aggregate transition | `docs/domain/policies/` |

A domain policy uses `appliesToModules` with at least one module. It may apply to one module. The term `domain` describes the source of authority, not the number of owners.

## Replace aggregate assumptions and retain state objects

A module may contain no aggregate, one aggregate, or multiple related aggregates. Remove `Primary aggregate root` and any requirement to write `None` for a read-only module. Add an aggregate ownership table instead.

For every command that changes multiple aggregates, name the `INV-*` invariant or `POL-*` policy that requires one transaction. Review boundaries when the same group changes together frequently.

Every aggregate retains an abstract `{Aggregate}State` base and at least one sealed state record. This requirement includes an aggregate with one current state.

Do not migrate aggregate lifecycle to an enum, status string, boolean flags, parallel nullable fields, or a computed discriminator. Update domain state records, persistence mapping, document migration, and tests together when a state changes stored data.

For example:

```csharp
public abstract record ProfileState;

public sealed record ActiveProfileState : ProfileState;
```

The one-state hierarchy establishes the type boundary before later states require state-specific data or behavior.

## Replace flow and test identities

The product brief names exactly one `primaryReleaseFlow`. An end-to-end flow connects use cases to an observable outcome and owns `E2E-{FLOW}-{NN}` test IDs.

Rename each `FC-{FLOW}-{NN}` ID to `E2E-{FLOW}-{NN}` and update:

- End-to-end flow specifications.
- Test names, traits, and tags.
- CI job output.
- Deployment smoke-test references.
- Release records.

Do not reuse an old `FC-*` alias. A release record must cite the exact `E2E-*` ID that ran against the deployed artifact.

## Replace event reaction terminology

Rename event-triggered work to event reactions. Keep handler suffixes that communicate their technical role.

For example, `IssueTicketsOnOrderConfirmedHandler` remains a handler. Its specification entry describes an event reaction owned by the Tickets module.

Retain these delivery classifications:

- `atomic`
- `durable`
- `rebuildable`
- `best-effort-optional`

A required projection cannot use `best-effort-optional`.

## Retain workflow boundaries

Create a workflow only for system-controlled progress across a transaction or time boundary. A durable workflow records progress and outgoing commands in one transaction. Each issued command later enters its own pipeline.

Remove nested `ICommandMediator` dispatch from command handlers. Keep atomic multi-aggregate coordination in the top-level handler only when the use case names the required transaction rule.

Use `participatingModules` in workflow metadata. A workflow may coordinate multiple modules without becoming a replacement for their aggregate boundaries.

## Replace decision and release evidence records

Use Decision Evidence only when research, provider approval, legal review, calculations, or unresolved assumptions make a decision document too large. A small decision keeps its evidence inline.

Classify decision evidence as `observed`, `calculated`, `inferred`, or `hypothesis`. A decision condition references evidence and is not itself evidence.

Keep release execution results in one Release Record. It cites the immutable artifact, approved specifications, automated gates, deployed `E2E-*` results, schema work, restore result, rollback result, known limitations, and skipped checks.

## Replace the release gate

Application v1 requires:

- One deployed primary release flow.
- Verified included use cases, workflows, end-to-end flow, and pages.
- At least one passing `E2E-*` test through the deployed public boundary.
- Approved operating limits and required runbooks.
- One release record tied to an immutable artifact.
- Resolved blocking decision evidence, or a release boundary that excludes the affected behavior.

## Update extension selection

Consumers migrating from v1.2 must also rename `extensions` to `selectedExtensions` in `standards.project.json`.

The standards manifest uses `schemaVersion: 2` because extension entries contain activation metadata instead of path strings.

- A project-scoped extension applies whenever selected.
- A local extension must be selected and listed in `applicableExtensions` on an allowed specification kind.
- `applicableKinds` in the manifest defines allowed local kinds.
- Do not copy project-scoped extensions into local metadata.

For example, `localization` is project-scoped. `outbox-worker` is local to use cases or workflows that require durable delivery. `persistence-ef-core` is local to affected modules or use cases.

Update local extension metadata after renaming kinds. The manifest now uses `module`, `end-to-end-flow`, and `domain-policy` where those specification types are allowed.

## Replace rule IDs

Update current references to these rule IDs:

| Removed rule ID | Replacement |
|:---|:---|
| `ADDD.AUTHORITY.001` | `AGENTIC.AUTHORITY.001` |
| `ADDD.SPECIFICATION.001` | `AGENTIC.SPECIFICATION.001` |
| `ADDD.BUSINESSFLOW.001` | `AGENTIC.FLOW.001` |
| `ADDD.SUBJECT.001` | `AGENTIC.MODULE.001` |
| `ADDD.AGGREGATE.001` | `AGENTIC.AGGREGATE.001` |
| `ADDD.USECASE.001` | `AGENTIC.USECASE.001` |
| `ADDD.WORKFLOW.001` | `AGENTIC.WORKFLOW.001` |
| `ADDD.FOLLOWUP.001` | `AGENTIC.REACTION.001` |
| `ADDD.RULES.001` | `AGENTIC.RULES.001` |
| `ADDD.STATE.001` | `AGENTIC.STATE.001` |
| `ADDD.METADATA.001` | `AGENTIC.METADATA.001` |
| `ADDD.EXTENSIONS.001` | `AGENTIC.EXTENSIONS.001` |
| `ADDD.ACCEPTANCE.001` | `AGENTIC.ACCEPTANCE.001` |
| `ADDD.SYNC.001` | `AGENTIC.SYNC.001` |
| `ADDD.COORDINATOR.001` | `AGENTIC.WORKFLOW.001` and `APP.WORKFLOW.001` |
| `ARCH.SUBJECTS.001` | `ARCH.MODULES.001` |
| `APP.COORDINATOR.001` | `APP.ORCHESTRATION.001` and `APP.WORKFLOW.001` |
| `APP.REACTIONS.001` | `APP.REACTION.001` |
| `APP.FOLLOWUP.001` | `APP.REACTION.001` |
| `RELEASE.EVIDENCE.001` | `RELEASE.RECORD.001` |

`DOMAIN.STATE.001` retains the v1.2 requirement for an explicit state record hierarchy on every aggregate.

## Validate the migrated consumer

Validate the standards manifest and consumer project file against their schemas. Validate each structured metadata block against `schemas/specification-metadata.schema.json`.

Cross-file review or consumer CI must confirm:

- The product brief references exactly one primary release flow.
- End-to-end flow use-case references resolve.
- Every module directory has one module specification.
- Use-case IDs match their module and filename.
- Workflow commands and events resolve to documented behavior.
- Domain policy module references exist.
- Risks and extension IDs are known.
- Local extensions are selected and allowed for the specification kind.
- Acceptance and end-to-end test definitions are unique and use their owning prefix.
- Verified acceptance IDs appear in test source.
- Passing acceptance and `E2E-*` results appear in the release record.

The standards repository does not bundle a consumer validator. JSON Schema proves file shape. Consumer CI or review tooling owns repository-specific cross-file checks.

## Scan stale references

Before review, scan current consumer records and code for removed terms, fields, rule IDs, kinds, template names, and paths. Historical records may retain old names.

Run complete backend, frontend, documentation, extension, deployment, restore, rollback, and end-to-end gates after migration.

## Version pin

During draft review, pin the consumer submodule to the exact reviewed commit. After publication, update it to the `v1.3.0` tag.
