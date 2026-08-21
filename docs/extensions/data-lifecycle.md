# Data Lifecycle

## Intent

Retention, deletion, archival, and restore behavior follows the business and legal lifetime of data. This extension makes lifecycle work explicit without imposing soft delete.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`, `domain-policy`.

The consumer enables `data-lifecycle` when a use case requires deletion, retention, archival, restore, legal hold, subject-access export, or post-deletion uniqueness behavior.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Record lifecycle ownership and outcomes. (EXT.DATA.ADOPT.001)
- Default to hard delete without retention needs. (EXT.DATA.DELETE.001)
- Model alternate lifecycle states explicitly. (EXT.DATA.DELETE.002)
- Keep lifecycle operations inside Domain behavior. (EXT.DATA.BEHAVIOR.001, EXT.DATA.BEHAVIOR.002)
- Separate normal and privileged lifecycle reads. (EXT.DATA.READ.001, EXT.DATA.READ.002)
- Make purge work bounded and legal-hold safe. (EXT.DATA.PURGE.001, EXT.DATA.PURGE.002)

## Standards

### Record lifecycle scope (EXT.DATA.ADOPT.001)

**Requirement:** A lifecycle use case or decision MUST name data classification, retention, deletion trigger, purge owner, hold, export, restore, and backup behavior.

**Rationale:** The contract establishes the data lifetime and the owner of each later action.

### Default to hard delete (EXT.DATA.DELETE.001)

**Requirement:** A lifecycle implementation MUST use hard delete when no accepted retention or restore requirement applies.

**Rationale:** Hard delete is the smallest lifecycle state when no later business action needs retained data.

### Model retained lifecycle states (EXT.DATA.DELETE.002)

**Requirement:** A soft-deleted or archived record MUST have a business reason and explicit state transition.

**Rationale:** The state transition makes retained data behavior visible in the aggregate model.

**Example:** `Archive` changes aggregate state after the authorization and audit checks succeed.

### Reject hidden lifecycle flags (EXT.DATA.DELETE.003)

**Requirement:** A lifecycle implementation MUST NOT use a hidden boolean as its sole lifecycle behavior.

**Rationale:** A hidden flag omits the business transition, authorization, and audit boundary.

### Model lifecycle operations in Domain (EXT.DATA.BEHAVIOR.001)

**Requirement:** A Domain aggregate MUST expose delete, archive, and restore as explicit behavior when those operations apply.

**Rationale:** Explicit behavior gives lifecycle transitions one business owner.

### Authorize and audit lifecycle changes (EXT.DATA.BEHAVIOR.002)

**Requirement:** A lifecycle operation MUST apply its documented authorization and audit requirements.

**Rationale:** Retention and deletion can have legal and business consequences.

### Exclude persistence-only lifecycle behavior (EXT.DATA.BEHAVIOR.003)

**Requirement:** A lifecycle rule MUST NOT rely only on persistence filters or property setters.

**Rationale:** Storage behavior cannot replace an aggregate-owned lifecycle transition.

### Exclude inactive records from normal reads (EXT.DATA.READ.001)

**Requirement:** A normal query MUST exclude deleted or archived records.

**Rationale:** Normal product behavior does not expose records outside their active lifecycle state.

### Authorize lifecycle access paths (EXT.DATA.READ.002)

**Requirement:** An administrative or restore query MUST use a named path with explicit authorization.

**Rationale:** Privileged recovery and administration require a distinct access boundary.

### Define post-deletion references (EXT.DATA.READ.003)

**Requirement:** A lifecycle specification MUST define post-deletion behavior for cross-aggregate references, exports, and unique constraints.

**Rationale:** References and reuse rules can outlive the record that originally owned a value.

### Define storage lifecycle behavior (EXT.DATA.STORAGE.001)

**Requirement:** A Marten lifecycle implementation MUST define document state, filtered queries, indexes, purge transformations, and contract evolution.

**Rationale:** The implementation documents storage needs explicit lifecycle behavior beyond an aggregate transition.

### Define relational lifecycle behavior (EXT.DATA.STORAGE.002)

**Requirement:** An EF Core lifecycle implementation MUST define columns, query filters, partial indexes, migrations, and named filter behavior.

**Rationale:** Relational storage needs explicit query and uniqueness behavior for retained records.

### Test provider lifecycle paths (EXT.DATA.STORAGE.003)

**Requirement:** A selected persistence provider MUST test normal and lifecycle query paths.

**Rationale:** Provider behavior can differ between active and retained records.

### Bound purge and archive work (EXT.DATA.PURGE.001)

**Requirement:** A purge or archive operation MUST be resumable, bounded, cancellation-aware, and observable.

**Rationale:** Long-running lifecycle work needs safe interruption, progress, and retry behavior.

### Preserve legal-hold data (EXT.DATA.PURGE.002)

**Requirement:** A retention job MUST record progress and preserve data under legal hold.

**Rationale:** A legal hold overrides scheduled deletion until its documented release.

### Align backup deletion behavior (EXT.DATA.PURGE.003)

**Requirement:** Backup and replica operations MUST follow the documented deletion guarantee.

**Rationale:** Retained copies affect the practical meaning of a deletion promise.

## Conventions

### Name soft-delete timestamps (EXT.DATA.CONVENTION.001)

**Default:** Use `deleted_at_utc` when a soft-delete timestamp is required.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The name states the lifecycle event and timestamp unit.

### Keep archive records module-owned (EXT.DATA.CONVENTION.002)

**Default:** Keep archive records under the owning module.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The module owns archive semantics and its access controls.

### Separate query-shaped history (EXT.DATA.CONVENTION.003)

**Default:** Use a separate read model when archived history is query-shaped instead of an aggregate invariant.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Query-shaped history does not need to enlarge the transactional aggregate boundary.

## Dependencies

None.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.DATA.ADOPT.001 | inspection | Lifecycle documentation names every required lifecycle field and owner. |
| EXT.DATA.DELETE.001 | test | Tests prove hard deletion when no retention or restore requirement applies. |
| EXT.DATA.DELETE.002 | test | Aggregate tests prove documented soft-delete or archive transitions. |
| EXT.DATA.DELETE.003 | inspection | Lifecycle review identifies aggregate behavior beyond a hidden boolean. |
| EXT.DATA.BEHAVIOR.001 | test | Aggregate tests exercise each applicable delete, archive, and restore behavior. |
| EXT.DATA.BEHAVIOR.002 | test | Lifecycle tests prove documented authorization and audit evidence. |
| EXT.DATA.BEHAVIOR.003 | inspection | Source review finds no lifecycle rule implemented only by storage behavior. |
| EXT.DATA.READ.001 | test | Normal query tests exclude deleted and archived records. |
| EXT.DATA.READ.002 | test | Administrative and restore query tests require named authorized access. |
| EXT.DATA.READ.003 | inspection | Specifications define references, export, and uniqueness behavior after deletion. |
| EXT.DATA.STORAGE.001 | test | Marten integration tests cover declared document lifecycle behavior. |
| EXT.DATA.STORAGE.002 | test | EF Core integration tests cover declared relational lifecycle behavior. |
| EXT.DATA.STORAGE.003 | test | Provider tests cover active, deleted, archived, administrative, and restore queries. |
| EXT.DATA.PURGE.001 | test | Purge tests cover batching, cancellation, resume, and observable progress. |
| EXT.DATA.PURGE.002 | test | Legal-hold fixtures remain retained during scheduled lifecycle work. |
| EXT.DATA.PURGE.003 | operation | Backup and replica records show the documented deletion guarantee. |
| EXT.DATA.CONVENTION.001 | inspection | Soft-delete timestamp names use the default or record a local replacement. |
| EXT.DATA.CONVENTION.002 | inspection | Archive source paths remain within the owning module or record a replacement. |
| EXT.DATA.CONVENTION.003 | inspection | Query-shaped archive history uses a read model or records a replacement. |
