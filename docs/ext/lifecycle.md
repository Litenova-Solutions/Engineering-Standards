# Data Lifecycle

## Intent

Data lifecycle rules decide how long each piece of stored data lives: how long it stays, when it is deleted, and when it can return. This page states what the team writes down for each lifetime and which behavior the code owns: hard delete wherever nothing needs the data later, explicit archive and restore states where a use case (one command or query the product offers) needs them, and authorized, audited operations throughout. A team selects it for each use case or rule that deletes, retains, archives, restores, holds, exports, or reuses data after deletion, so no data lingers without an owner and no deletion breaks a legal or business duty.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `rule`.

A use case or rule selects this extension when it deletes a record, keeps one past its active life, archives or restores one, holds one under a legal duty, exports one person's data on request, or reuses a value after deletion. For example, a spending rule that keeps receipts for 7 years under the tax receipt retention constraint selects the extension for that rule, while an expense use case that deletes nothing does not.

## Baseline Relationship

This extension replaces no baseline provision.

Selecting it switches on the setting record type: the retention bounds the lifecycle rules name live in setting records.

A record retires with the `retired` status, and a retirement that removes declared behavior is a breaking change under the `compat` extension.

## Standards

### Record Lifecycle Scope

**Statement:** A lifecycle record MUST name classification, retention, deletion trigger, purge owner, hold, export, restore, backup, owner, and status.

**Rationale:** A lifecycle record names every choice the team makes about a record's lifetime in one place: what kind of data it is, how long it stays, what triggers deletion, who purges it, and how holds, exports, restores, and backups behave. Without that record, the choices scatter across tickets and memory, and a deletion runs before anyone checks the retention bound. Retention bounds live in setting records, and a draft record names its decider and decide-by date so the choice cannot wait forever.

### Default to Hard Delete

**Statement:** A lifecycle implementation MUST use hard delete when no accepted retention or restore requirement applies.

**Rationale:** When no use case needs the data back, removing the row deletes the least and keeps the least: no hidden state, no filtered queries, no purge job to write and watch. A team that keeps deleted rows just in case pays for retention without a requirement and answers subject-access exports with data it promised to delete.

**Example:** An expense deleted without a retention duty removes the expense row in the delete transaction.

### Model Retained Lifecycle States

**Statement:** A soft-deleted or archived record MUST have a business reason and explicit state transition.

**Rationale:** A record that stays after deletion or moves to an archive still affects the product: it appears in some reads, skips others, and can return. A named state with a named transition shows that behavior in the aggregate itself, so a reader sees which transitions exist and which checks each one runs. Without the transition, the retained data is a row the code treats specially in scattered places.

**Example:** `Archive` changes aggregate state after the authorization and audit checks succeed.

### Reject Hidden Lifecycle Flags

**Statement:** A lifecycle implementation MUST NOT use a hidden boolean as its sole lifecycle behavior.

**Rationale:** A boolean column that only the storage layer reads can flip without running the business checks: no authorization, no audit entry, no named transition a reviewer can find. The record then looks deleted in one query and active in another, depending on which filter the query remembered. An explicit lifecycle operation keeps the flag, where one exists, as an effect of the transition rather than the transition itself.

### Model Lifecycle Operations in Domain

**Statement:** A Domain aggregate MUST expose delete, archive, and restore as explicit behavior when those operations apply.

**Rationale:** Delete, archive, and restore change what the business promises about a record, so the aggregate owns them the way it owns any rule: one method per operation, with the checks beside the change. When the operation lives anywhere else, two callers implement it two ways and the checks drift apart.

### Authorize Lifecycle Changes

**Statement:** A lifecycle operation MUST apply its documented authorization.

**Rationale:** Deleting or restoring the wrong record harms a customer or breaks a legal duty, so each lifecycle operation checks that the actor may perform it.

### Audit Lifecycle Changes

**Statement:** A lifecycle operation MUST record its audit as an audit record when audit is selected and a standalone record otherwise.

**Rationale:** The audit entry lets a reviewer answer who deleted what and when, which a subject-access or legal-hold dispute asks for first.

### Exclude Persistence-Only Lifecycle Behavior

**Statement:** A lifecycle rule MUST NOT rely only on persistence filters or property setters.

**Rationale:** A query filter or a property setter runs without the business checks: it filters rows in storage while the aggregate never learns the transition happened. The product then enforces lifecycle in two places that disagree, and a new query that skips the filter exposes data the lifecycle retired.

### Exclude Inactive Records from Normal Reads

**Statement:** A normal query MUST exclude deleted or archived records.

**Rationale:** An employee browsing expenses expects live data: deleted and archived records in that list confuse the employee and leak data the lifecycle retired. Normal queries therefore read only the active state, while the named privileged paths serve the records outside it.

### Authorize Lifecycle Access Paths

**Statement:** An administrative or restore query MUST use a named path with explicit authorization.

**Rationale:** Restore and administration queries reach records normal queries cannot see, so they need a path of their own with checks of their own. Without the named path, a privileged read hides inside normal query code and inherits normal authorization, which grants too much to too many callers.

### Define Post-Deletion References

**Statement:** A lifecycle specification MUST define post-deletion behavior for cross-aggregate references, exports, and unique constraints.

**Rationale:** Other records can point at the deleted one, exports can carry its values, and a unique value such as an expense reference number can become available again. When the specification stays silent, each developer guesses: one nulls the reference, another keeps it, and a duplicate value slips through or a report breaks. Writing the behavior down gives every reference, export, and constraint one answer.

### Define Storage Lifecycle Behavior

**Statement:** A Marten lifecycle implementation MUST define document state, filtered queries, indexes, purge transformations, and contract evolution.

**Rationale:** A document store keeps whatever the aggregate writes, so the team states how each lifecycle state lands in the document: which state the document carries, which queries filter it, which indexes serve those queries, how a purge rewrites the document, and how the contract changes when the shape does. Without those choices, the business transition lands in storage by accident and each query invents its own filter.

### Define Relational Lifecycle Behavior

**Statement:** An EF Core lifecycle implementation MUST define columns, query filters, partial indexes, migrations, and named filter behavior.

**Rationale:** A relational table keeps retained rows beside active ones, so the team states which columns mark the state, which query filters hide retained rows, which partial indexes keep active values unique, which migrations add all of it, and what each named filter means. Without those choices, a unique constraint blocks a legitimate reuse or a query returns rows the lifecycle retired.

### Test Provider Lifecycle Paths

**Statement:** A selected persistence provider MUST test normal and lifecycle query paths.

**Rationale:** Filters, indexes, and migrations behave differently per provider, and a filter that works on documents can fail on tables. Tests that read through both the normal path and the lifecycle path on the selected provider catch the difference before a customer does.

### Bound Purge and Archive Work

**Statement:** A purge or archive operation MUST be resumable, bounded, cancellation-aware, and observable.

**Rationale:** A purge or archive job can run for hours across millions of rows, and a deployment, a failure, or an operator stops it midway. Resumable, bounded, cancellation-aware work restarts where it stopped instead of from the beginning, and observable progress tells the operator whether it moves or stalls.

### Preserve Legal-Hold Data

**Statement:** A retention job MUST preserve data under legal hold.

**Rationale:** A legal hold suspends the duty to delete: the named data stays until the hold releases, even when its retention date passes. A retention job that ignores the hold destroys evidence the organization had a duty to keep.

### Record Retention Progress

**Statement:** A retention job MUST record its progress.

**Rationale:** A retention run can stop midway through millions of rows, and recorded progress tells the next run where to resume. Observable progress tells the operator whether the job moves or stalls.

### Record the Release of a Legal Hold

**Statement:** A legal-hold release MUST record actor, data covered, reason, and resumed retention: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** A hold suspends the duty to erase, and releasing it resumes that duty from a date the team can name. Without a release record, nobody can state when the suspension ended, so a subject's [erasure request](https://gdpr-info.eu/art-17-gdpr/) has no answer date and the next retention run cannot tell which data is deletable again. The record also tells the retention job exactly which data resumed which retention date.

**Example:** A release record names the hold, the release date, and the retention date the covered data now carries.

### Align Backup Deletion Behavior

**Statement:** Backup and replica operations MUST follow the documented deletion guarantee.

**Rationale:** A deletion promise covers every copy the product keeps, including backups and replicas that restore for months after the live row disappears. When backup behavior stays undocumented, the team promises erasure it cannot deliver and learns the gap during an audit or a restore.

## Conventions

### Name Soft-Delete Timestamps

**Default:** Use `deleted_at_utc` when a soft-delete timestamp is required.

**Replacement:** A project names another column for the soft-delete timestamp in its documentation.

**Rationale:** One name for the deletion timestamp lets every reader and query recognize it on sight: the event and the unit remove the two guesses a reviewer otherwise makes.

### Keep Archive Records Module-Owned

**Default:** Keep archive records under the owning module.

**Replacement:** A project keeps archive records in one shared archive area.

**Rationale:** The module that defines what the record means also defines what its archive means and who may read it. An archive kept elsewhere answers to two owners, and its access checks drift from the module's own.

### Separate Query-Shaped History

**Default:** Use a separate read model when archived history is query-shaped instead of an aggregate invariant.

**Replacement:** A project keeps query-shaped history on the aggregate.

**Rationale:** History kept for display, such as a list of past expenses, constrains nothing the aggregate protects, so it lives cheaper as a read model beside the record. Folding it into the record widens the transaction boundary for data no invariant needs.

## Dependencies

Packages: `None.`

Related extensions: `audit`, and `compat` for retiring declared behavior.

Guides: `None.`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/lifecycle#record-lifecycle-scope | guidance | Each lifecycle record names classification, retention, deletion trigger, purge owner, hold, export, restore, backup, owner, and status. |
| litespec/ext/lifecycle#default-to-hard-delete | guidance | Deletions with no retention or restore requirement remove the row in the delete transaction. |
| litespec/ext/lifecycle#model-retained-lifecycle-states | guidance | Each retained record carries a business reason with a named state transition. |
| litespec/ext/lifecycle#reject-hidden-lifecycle-flags | guidance | Each lifecycle transition runs through explicit behavior rather than a storage-only flag. |
| litespec/ext/lifecycle#model-lifecycle-operations-in-domain | guidance | Each aggregate exposes delete, archive, and restore methods where those operations apply. |
| litespec/ext/lifecycle#authorize-lifecycle-changes | guidance | Each lifecycle operation checks its documented authorization before changing the record. |
| litespec/ext/lifecycle#audit-lifecycle-changes | guidance | Each lifecycle operation writes an audit record, or a standalone record where audit is not selected. |
| litespec/ext/lifecycle#exclude-persistence-only-lifecycle-behavior | guidance | No lifecycle transition runs through persistence filters or property setters alone. |
| litespec/ext/lifecycle#exclude-inactive-records-from-normal-reads | guidance | Normal queries read only the active state, with deleted and archived records absent. |
| litespec/ext/lifecycle#authorize-lifecycle-access-paths | guidance | Administrative and restore queries run through named paths with explicit authorization. |
| litespec/ext/lifecycle#define-post-deletion-references | guidance | The specification states post-deletion behavior for references, exports, and unique constraints. |
| litespec/ext/lifecycle#define-storage-lifecycle-behavior | guidance | The document implementation states document state, filtered queries, indexes, purge transformations, and contract evolution. |
| litespec/ext/lifecycle#define-relational-lifecycle-behavior | guidance | The relational implementation states columns, query filters, partial indexes, migrations, and named filter behavior. |
| litespec/ext/lifecycle#test-provider-lifecycle-paths | guidance | Tests read through normal and lifecycle query paths on the selected provider. |
| litespec/ext/lifecycle#bound-purge-and-archive-work | guidance | Purge and archive work resumes after interruption within declared bounds, with visible progress. |
| litespec/ext/lifecycle#preserve-legal-hold-data | guidance | Retention runs leave held data in place past its retention date. |
| litespec/ext/lifecycle#record-retention-progress | guidance | Retention runs persist progress that the next run resumes from. |
| litespec/ext/lifecycle#record-the-release-of-a-legal-hold | guidance | Each legal-hold release records actor, data covered, reason, and resumed retention. |
| litespec/ext/lifecycle#align-backup-deletion-behavior | guidance | Backup and replica operations follow the documented deletion guarantee. |
| litespec/ext/lifecycle#name-soft-delete-timestamps | guidance | Soft-delete timestamps use `deleted_at_utc`, or the project names another column in its documentation. |
| litespec/ext/lifecycle#keep-archive-records-module-owned | guidance | Archive records sit under their owning module, or the project keeps them in one shared archive area. |
| litespec/ext/lifecycle#separate-query-shaped-history | guidance | Query-shaped history lives in a read model, or the project keeps it on the aggregate. |
