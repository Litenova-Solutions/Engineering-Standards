# Data Lifecycle

## Intent

Retention, deletion, archival, and restore behavior must follow the business and legal lifetime of data. This extension keeps lifecycle work explicit without imposing soft delete on every aggregate.

## Activation

**Activation scope:** `local`. Applicable specification kinds: Use case, Workflow, Domain Policy. List it in `applicableExtensions` only on those kinds.

Enable `data-lifecycle` when a use case requires deletion, retention, archival, restore, legal hold, subject access export, or post-deletion uniqueness behavior.

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Default to hard delete unless retention or restore requires another state.
- Record classification, retention owner, purge schedule, and legal hold behavior.
- Model soft delete or archive as explicit aggregate behavior when required.
- Keep deleted data out of normal reads and account for uniqueness.
- Define provider-specific storage, export, restore, and backup behavior.
- Test purge, restore, retention, and authorization boundaries.

## Standards

### Record the lifecycle contract (EXT.DATA.ADOPT.001)

The use case or decision MUST name data classification, retention period, deletion trigger, purge owner, legal hold behavior, export behavior, restore behavior, and backup implications.

### Use hard delete by default (EXT.DATA.DELETE.001)

Hard delete is the default when no accepted requirement needs retention or restore. A soft-deleted or archived record MUST have a business reason and an explicit state transition. Do not use a hidden boolean as a substitute for lifecycle behavior.

### Keep lifecycle behavior in the aggregate boundary (EXT.DATA.BEHAVIOR.001)

Delete, archive, and restore operations MUST be explicit domain behavior with authorization and audit requirements. Persistence filters or property setters MUST NOT be the only implementation of a lifecycle rule.

### Keep deleted data out of normal reads (EXT.DATA.READ.001)

Normal queries MUST exclude deleted or archived records. Administrative and restore queries use a named path with explicit authorization. Cross-aggregate references, exports, and unique constraints define behavior after deletion.

### Apply provider-specific storage rules (EXT.DATA.STORAGE.001)

Marten implementations define document state, filtered queries, indexes, purge transformations, and contract evolution. EF Core implementations define columns, query filters, partial unique indexes, migrations, and named filter behavior. The selected provider's tests cover both normal and lifecycle paths.

### Purge and archive with bounded operations (EXT.DATA.PURGE.001)

Purge and archive work MUST be resumable, bounded, cancellation-aware, and observable. Retention jobs record progress and do not remove data under legal hold. Backups and replicas follow the documented deletion guarantee.

## Conventions

Use `deleted_at_utc` when a timestamp is required for soft delete. Keep archive records under the owning module and use a separate read model when archived history is query-shaped rather than part of the aggregate invariant.

## Verification

- Test hard delete, soft delete, archive, restore, and legal hold behavior as applicable.
- Test normal, administrative, export, and cross-aggregate reads after deletion.
- Verify uniqueness, purge batching, cancellation, retry, backup, and restore behavior.
- Inspect lifecycle audit events and sensitive-data retention evidence.
