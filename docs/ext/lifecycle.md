# Data Lifecycle

## Intent

Retention, deletion, archival, and restore behavior follows the business and legal lifetime of data. This extension makes lifecycle work explicit without imposing soft delete.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`, `domain-policy`.

The consumer enables `lifecycle` when a use case requires deletion, retention, archival, restore, legal hold, subject-access export, or post-deletion uniqueness behavior.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record lifecycle ownership and outcomes. (standards/rule/ext-lifecycle.record-lifecycle-scope)
- Default to hard delete without retention needs. (standards/rule/ext-lifecycle.default-to-hard-delete)
- Model alternate lifecycle states explicitly. (standards/rule/ext-lifecycle.model-retained-lifecycle-states)
- Keep lifecycle operations inside Domain behavior. (standards/rule/ext-lifecycle.model-lifecycle-operations-in-domain, standards/rule/ext-lifecycle.authorize-and-audit-lifecycle-changes)
- Separate normal and privileged lifecycle reads. (standards/rule/ext-lifecycle.exclude-inactive-records-from-normal-reads, standards/rule/ext-lifecycle.authorize-lifecycle-access-paths)
- Make purge work bounded and legal-hold safe. (standards/rule/ext-lifecycle.bound-purge-and-archive-work, standards/rule/ext-lifecycle.preserve-legal-hold-data)

## Standards

### Record lifecycle scope (standards/rule/ext-lifecycle.record-lifecycle-scope)

**Requirement:** A lifecycle use case or decision MUST name data classification, retention, deletion trigger, purge owner, hold, export, restore, and backup behavior.

**Rationale:** The contract establishes the data lifetime and the owner of each later action.

### Default to hard delete (standards/rule/ext-lifecycle.default-to-hard-delete)

**Requirement:** A lifecycle implementation MUST use hard delete when no accepted retention or restore requirement applies.

**Rationale:** Hard delete is the smallest lifecycle state when no later business action needs retained data.

### Model retained lifecycle states (standards/rule/ext-lifecycle.model-retained-lifecycle-states)

**Requirement:** A soft-deleted or archived record MUST have a business reason and explicit state transition.

**Rationale:** The state transition makes retained data behavior visible in the aggregate model.

**Example:** `Archive` changes aggregate state after the authorization and audit checks succeed.

### Reject hidden lifecycle flags (standards/rule/ext-lifecycle.reject-hidden-lifecycle-flags)

**Requirement:** A lifecycle implementation MUST NOT use a hidden boolean as its sole lifecycle behavior.

**Rationale:** A hidden flag omits the business transition, authorization, and audit boundary.

### Model lifecycle operations in Domain (standards/rule/ext-lifecycle.model-lifecycle-operations-in-domain)

**Requirement:** A Domain aggregate MUST expose delete, archive, and restore as explicit behavior when those operations apply.

**Rationale:** Explicit behavior gives lifecycle transitions one business owner.

### Authorize and audit lifecycle changes (standards/rule/ext-lifecycle.authorize-and-audit-lifecycle-changes)

**Requirement:** A lifecycle operation MUST apply its documented authorization and audit requirements.

**Rationale:** Retention and deletion can have legal and business consequences.

### Exclude persistence-only lifecycle behavior (standards/rule/ext-lifecycle.exclude-persistence-only-lifecycle-behavior)

**Requirement:** A lifecycle rule MUST NOT rely only on persistence filters or property setters.

**Rationale:** Storage behavior cannot replace an aggregate-owned lifecycle transition.

### Exclude inactive records from normal reads (standards/rule/ext-lifecycle.exclude-inactive-records-from-normal-reads)

**Requirement:** A normal query MUST exclude deleted or archived records.

**Rationale:** Normal product behavior does not expose records outside their active lifecycle state.

### Authorize lifecycle access paths (standards/rule/ext-lifecycle.authorize-lifecycle-access-paths)

**Requirement:** An administrative or restore query MUST use a named path with explicit authorization.

**Rationale:** Privileged recovery and administration require a distinct access boundary.

### Define post-deletion references (standards/rule/ext-lifecycle.define-post-deletion-references)

**Requirement:** A lifecycle specification MUST define post-deletion behavior for cross-aggregate references, exports, and unique constraints.

**Rationale:** References and reuse rules can outlive the record that originally owned a value.

### Define storage lifecycle behavior (standards/rule/ext-lifecycle.define-storage-lifecycle-behavior)

**Requirement:** A Marten lifecycle implementation MUST define document state, filtered queries, indexes, purge transformations, and contract evolution.

**Rationale:** The implementation documents storage needs explicit lifecycle behavior beyond an aggregate transition.

### Define relational lifecycle behavior (standards/rule/ext-lifecycle.define-relational-lifecycle-behavior)

**Requirement:** An EF Core lifecycle implementation MUST define columns, query filters, partial indexes, migrations, and named filter behavior.

**Rationale:** Relational storage needs explicit query and uniqueness behavior for retained records.

### Test provider lifecycle paths (standards/rule/ext-lifecycle.test-provider-lifecycle-paths)

**Requirement:** A selected persistence provider MUST test normal and lifecycle query paths.

**Rationale:** Provider behavior can differ between active and retained records.

### Bound purge and archive work (standards/rule/ext-lifecycle.bound-purge-and-archive-work)

**Requirement:** A purge or archive operation MUST be resumable, bounded, cancellation-aware, and observable.

**Rationale:** Long-running lifecycle work needs safe interruption, progress, and retry behavior.

### Preserve legal-hold data (standards/rule/ext-lifecycle.preserve-legal-hold-data)

**Requirement:** A retention job MUST record progress and preserve data under legal hold.

**Rationale:** A legal hold overrides scheduled deletion until its documented release.

### Record the release of a legal hold (standards/rule/ext-lifecycle.record-the-release-of-a-legal-hold)

**Requirement:** The release of a legal hold MUST produce a record naming the actor, the data covered, the reason, and the retention that resumes.

**Rationale:** A hold suspends an erasure obligation, so its release is the moment that obligation resumes. Without a record, nothing states when the suspension ended, and a subject's [erasure request](https://gdpr-info.eu/art-17-gdpr/) cannot be answered with a date. The release is also the point where data becomes deletable again, so the next retention run needs it to be unambiguous.

**Example:** A release record names the hold, the release date, and the retention date the covered data now carries.

### Align backup deletion behavior (standards/rule/ext-lifecycle.align-backup-deletion-behavior)

**Requirement:** Backup and replica operations MUST follow the documented deletion guarantee.

**Rationale:** Retained copies affect the practical meaning of a deletion promise.

## Conventions

### Name soft-delete timestamps (standards/rule/ext-lifecycle.name-soft-delete-timestamps)

**Default:** Use `deleted_at_utc` when a soft-delete timestamp is required.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The name states the lifecycle event and timestamp unit.

### Keep archive records module-owned (standards/rule/ext-lifecycle.keep-archive-records-module-owned)

**Default:** Keep archive records under the owning module.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The module owns archive semantics and its access controls.

### Separate query-shaped history (standards/rule/ext-lifecycle.separate-query-shaped-history)

**Default:** Use a separate read model when archived history is query-shaped instead of an aggregate invariant.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Query-shaped history does not need to enlarge the transactional aggregate boundary.

## Dependencies

None.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-lifecycle.record-lifecycle-scope | inspection | Lifecycle documentation names every required lifecycle field and owner. |
| standards/rule/ext-lifecycle.default-to-hard-delete | test | `DataDeleteTests` asserts tests prove hard deletion when no retention or restore requirement applies. |
| standards/rule/ext-lifecycle.model-retained-lifecycle-states | test | `DataDeleteTests` prove documented soft-delete or archive transitions. |
| standards/rule/ext-lifecycle.reject-hidden-lifecycle-flags | inspection | Lifecycle review identifies aggregate behavior beyond a hidden boolean. |
| standards/rule/ext-lifecycle.model-lifecycle-operations-in-domain | test | `DataBehaviorTests` exercise each applicable delete, archive, and restore behavior. |
| standards/rule/ext-lifecycle.authorize-and-audit-lifecycle-changes | test | `DataBehaviorTests` prove documented authorization and audit evidence. |
| standards/rule/ext-lifecycle.exclude-persistence-only-lifecycle-behavior | inspection | Source review finds no lifecycle rule implemented only by storage behavior. |
| standards/rule/ext-lifecycle.exclude-inactive-records-from-normal-reads | test | `DataReadTests` exclude deleted and archived records. |
| standards/rule/ext-lifecycle.authorize-lifecycle-access-paths | test | `DataReadTests` require named authorized access. |
| standards/rule/ext-lifecycle.define-post-deletion-references | inspection | Specifications define references, export, and uniqueness behavior after deletion. |
| standards/rule/ext-lifecycle.define-storage-lifecycle-behavior | test | `DataStorageTests` cover declared document lifecycle behavior. |
| standards/rule/ext-lifecycle.define-relational-lifecycle-behavior | test | `DataStorageTests` cover declared relational lifecycle behavior. |
| standards/rule/ext-lifecycle.test-provider-lifecycle-paths | test | `DataStorageTests` cover active, deleted, archived, administrative, and restore queries. |
| standards/rule/ext-lifecycle.bound-purge-and-archive-work | test | `DataPurgeTests` cover batching, cancellation, resume, and observable progress. |
| standards/rule/ext-lifecycle.preserve-legal-hold-data | test | `DataPurgeTests` remain retained during scheduled lifecycle work. |
| standards/rule/ext-lifecycle.align-backup-deletion-behavior | operation | Backup and replica records show the documented deletion guarantee. |
| standards/rule/ext-lifecycle.record-the-release-of-a-legal-hold | test | `DataPurgeTests` assert a hold release writes its record, and the next run deletes the released data. |
| standards/rule/ext-lifecycle.name-soft-delete-timestamps | inspection | Soft-delete timestamp names use the default or record a local replacement. |
| standards/rule/ext-lifecycle.keep-archive-records-module-owned | inspection | Archive source paths remain within the owning module or record a replacement. |
| standards/rule/ext-lifecycle.separate-query-shaped-history | inspection | Query-shaped archive history uses a read model or records a replacement. |
