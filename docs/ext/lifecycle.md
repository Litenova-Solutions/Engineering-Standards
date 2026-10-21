# Data Lifecycle

## Intent

Retention, deletion, archival, and restore behavior follows the business and legal lifetime of data. This extension makes lifecycle work explicit without imposing soft delete.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `rule`.

The consumer enables `lifecycle` when a use case requires deletion, retention, archival, restore, legal hold, subject-access export, or post-deletion uniqueness behavior.

## Baseline relationship

This extension replaces no baseline rule.

This extension switches on the Limit record type.

## Standards

### Record lifecycle scope

**Requirement:** A lifecycle record MUST name classification, retention, deletion trigger, purge owner, hold, export, restore, backup, owner, and status.

**Rationale:** The contract establishes the data lifetime and the owner of each later action. Retention bounds are Limit records, and a draft names its decider and decide-by date.

### Default to hard delete

**Requirement:** A lifecycle implementation MUST use hard delete when no accepted retention or restore requirement applies.

**Rationale:** Hard delete is the smallest lifecycle state when no later business action needs retained data.

### Model retained lifecycle states

**Requirement:** A soft-deleted or archived record MUST have a business reason and explicit state transition.

**Rationale:** The state transition makes retained data behavior visible in the aggregate model.

**Example:** `Archive` changes aggregate state after the authorization and audit checks succeed.

### Reject hidden lifecycle flags

**Requirement:** A lifecycle implementation MUST NOT use a hidden boolean as its sole lifecycle behavior.

**Rationale:** A hidden flag omits the business transition, authorization, and audit boundary.

### Model lifecycle operations in Domain

**Requirement:** A Domain aggregate MUST expose delete, archive, and restore as explicit behavior when those operations apply.

**Rationale:** Explicit behavior gives lifecycle transitions one business owner.

### Authorize and audit lifecycle changes

**Requirement:** A lifecycle operation MUST apply its documented authorization, recording its audit as an audit record when audit is selected and a standalone record otherwise.

**Rationale:** Retention and deletion can have legal and business consequences.

### Exclude persistence-only lifecycle behavior

**Requirement:** A lifecycle rule MUST NOT rely only on persistence filters or property setters.

**Rationale:** Storage behavior cannot replace an aggregate-owned lifecycle transition.

### Exclude inactive records from normal reads

**Requirement:** A normal query MUST exclude deleted or archived records.

**Rationale:** Normal product behavior does not expose records outside their active lifecycle state.

### Authorize lifecycle access paths

**Requirement:** An administrative or restore query MUST use a named path with explicit authorization.

**Rationale:** Privileged recovery and administration require a distinct access boundary.

### Define post-deletion references

**Requirement:** A lifecycle specification MUST define post-deletion behavior for cross-aggregate references, exports, and unique constraints.

**Rationale:** References and reuse rules can outlive the record that originally owned a value.

### Define storage lifecycle behavior

**Requirement:** A Marten lifecycle implementation MUST define document state, filtered queries, indexes, purge transformations, and contract evolution.

**Rationale:** Marten storage needs explicit lifecycle behavior beyond an aggregate transition.

### Define relational lifecycle behavior

**Requirement:** An EF Core lifecycle implementation MUST define columns, query filters, partial indexes, migrations, and named filter behavior.

**Rationale:** Relational storage needs explicit query and uniqueness behavior for retained records.

### Test provider lifecycle paths

**Requirement:** A selected persistence provider MUST test normal and lifecycle query paths.

**Rationale:** Provider behavior can differ between active and retained records.

### Bound purge and archive work

**Requirement:** A purge or archive operation MUST be resumable, bounded, cancellation-aware, and observable.

**Rationale:** Long-running lifecycle work needs safe interruption, progress, and retry behavior.

### Preserve legal-hold data

**Requirement:** A retention job MUST record progress and preserve data under legal hold.

**Rationale:** A legal hold overrides scheduled deletion until its documented release.

### Record the release of a legal hold

**Requirement:** A legal-hold release MUST record actor, data covered, reason, and resumed retention: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** A hold suspends an erasure obligation, and its release resumes that obligation. Without a record, no one can state when the suspension ended. A subject's [erasure request](https://gdpr-info.eu/art-17-gdpr/) then has no answer date. The release is also the point where data becomes deletable again. The next retention run needs an unambiguous release record.

**Example:** A release record names the hold, the release date, and the retention date the covered data now carries.

### Align backup deletion behavior

**Requirement:** Backup and replica operations MUST follow the documented deletion guarantee.

**Rationale:** Retained copies affect the practical meaning of a deletion promise.

## Conventions

### Name soft-delete timestamps

**Default:** Use `deleted_at_utc` when a soft-delete timestamp is required.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The name states the lifecycle event and timestamp unit.

### Keep archive records module-owned

**Default:** Keep archive records under the owning module.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The module owns archive semantics and its access controls.

### Separate query-shaped history

**Default:** Use a separate read model when archived history is query-shaped instead of an aggregate invariant.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Query-shaped history does not need to enlarge the transactional aggregate boundary.

## Dependencies

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/lifecycle#record-lifecycle-scope | guidance | Does each lifecycle record name every required field, its owner, and its status? |
| litespec/ext/lifecycle#default-to-hard-delete | guidance | Is deletion hard wherever no retention or restore requirement applies? |
| litespec/ext/lifecycle#model-retained-lifecycle-states | guidance | Does each retained record have a business reason and explicit transition? |
| litespec/ext/lifecycle#reject-hidden-lifecycle-flags | guidance | Is lifecycle behavior more than a hidden boolean? |
| litespec/ext/lifecycle#model-lifecycle-operations-in-domain | guidance | Does the aggregate expose each applicable lifecycle operation? |
| litespec/ext/lifecycle#authorize-and-audit-lifecycle-changes | guidance | Does each operation apply its authorization and record its audit? |
| litespec/ext/lifecycle#exclude-persistence-only-lifecycle-behavior | guidance | Does storage behavior alone implement any lifecycle rule? |
| litespec/ext/lifecycle#exclude-inactive-records-from-normal-reads | guidance | Do normal queries exclude deleted and archived records? |
| litespec/ext/lifecycle#authorize-lifecycle-access-paths | guidance | Do administrative and restore queries use named authorized paths? |
| litespec/ext/lifecycle#define-post-deletion-references | guidance | Does the specification state which post-deletion references, exports, and uniqueness rules remain? |
| litespec/ext/lifecycle#define-storage-lifecycle-behavior | guidance | Does the document implementation define state, queries, indexes, and purge behavior? |
| litespec/ext/lifecycle#define-relational-lifecycle-behavior | guidance | Does the relational implementation define columns, filters, indexes, and migrations? |
| litespec/ext/lifecycle#test-provider-lifecycle-paths | guidance | Do tests cover normal and lifecycle query paths? |
| litespec/ext/lifecycle#bound-purge-and-archive-work | guidance | Is purge and archive work resumable, bounded, and observable? |
| litespec/ext/lifecycle#preserve-legal-hold-data | guidance | Does retention work record progress and preserve held data? |
| litespec/ext/lifecycle#record-the-release-of-a-legal-hold | guidance | Does each legal-hold release record actor, data, reason, and resumed retention? |
| litespec/ext/lifecycle#align-backup-deletion-behavior | guidance | Do backups and replicas follow the documented deletion guarantee? |
| litespec/ext/lifecycle#name-soft-delete-timestamps | guidance | Do soft-delete timestamps use the default or record an Exception? |
| litespec/ext/lifecycle#keep-archive-records-module-owned | guidance | Do archive records stay in the owning module or record an Exception? |
| litespec/ext/lifecycle#separate-query-shaped-history | guidance | Is query-shaped history a read model or is an Exception recorded? |
