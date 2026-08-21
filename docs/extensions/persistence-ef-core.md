# EF Core Persistence

## Intent

This extension replaces Marten persistence for aggregates with accepted relational navigation, change-tracking, or provider requirements that Marten cannot satisfy.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `use-case`.

The consumer enables `persistence-ef-core` only after a decision records aggregate scope, relational requirement, data evolution effect, and the Marten baseline gap.

## Baseline relationship

For EF Core-owned aggregate paths, this extension replaces `DEP.APPLICATION.001`, `ARCH.CQRS.001`, `PERSIST.WRITE.001`, `PERSIST.READ.001`, `PERSIST.COMMIT.001`, `PERSIST.EVENTS.001`, `PERSIST.MAPPING.001`, `PERSIST.SERIALIZATION.001`, `PERSIST.EVOLUTION.001`, and `PERSIST.DOCUMENT.001`.

When `outbox-worker` applies to an EF Core-owned command, this extension also replaces `EXT.OUTBOX.ATOMIC.001` for that command.

## Agent Summary {#agent-summary}

- Record affected aggregates and persistence effects. (EXT.EFCORE.ADOPT.001)
- Stage each Command through one write provider. (EXT.EFCORE.TRANSACTION.001, EXT.EFCORE.TRANSACTION.002)
- Keep EF Core writes behind repositories. (EXT.EFCORE.WRITE.001, EXT.EFCORE.WRITE.002)
- Query EF Core through `IApplicationDbContext`. (EXT.EFCORE.READ.001, EXT.EFCORE.READ.003)
- Commit EF Core changes through its LiteBus post-handler. (EXT.EFCORE.COMMIT.001)
- Stage EF Core outbox records with EF Core business work. (EXT.EFCORE.OUTBOX.001)
- Configure relational mappings in Infrastructure. (EXT.EFCORE.MAPPING.001)
- Preserve Domain state records and lifecycle boundaries. (EXT.EFCORE.STATE.001, EXT.EFCORE.STATE.002)
- Review and release migrations explicitly. (EXT.EFCORE.MIGRATIONS.001, EXT.EFCORE.MIGRATIONS.003)
- Map EF Core concurrency failures to Application outcomes. (EXT.EFCORE.CONCURRENCY.002)

## Standards

### Record EF Core replacement scope (EXT.EFCORE.ADOPT.001)

**Requirement:** An EF Core adoption decision MUST name affected aggregates, data evolution, transaction requirements, query impact, package changes, and rollback plan.

**Rationale:** The decision describes the complete persistence replacement for its selected aggregates.

### Retain unaffected baseline persistence (EXT.EFCORE.ADOPT.002)

**Requirement:** An unaffected aggregate MUST retain baseline persistence rules.

**Rationale:** Local EF Core adoption does not change ownership of other aggregate paths.

### Use one write provider (EXT.EFCORE.TRANSACTION.001)

**Requirement:** An EF Core-owned Command MUST stage aggregate writes through exactly one selected write provider.

**Rationale:** One provider gives the Command one atomic commit boundary.

### Reject mixed provider writes (EXT.EFCORE.TRANSACTION.002)

**Requirement:** A Command MUST NOT stage aggregate writes through both Marten-backed and EF Core-backed repositories.

**Rationale:** Independent provider commits cannot preserve one local aggregate invariant.

### Record provider selection (EXT.EFCORE.TRANSACTION.003)

**Requirement:** An EF Core adoption decision MUST name Command provider selection and its architecture-test evidence.

**Rationale:** The decision makes provider ownership reviewable for each selected Command path.

### Register one Command post-handler (EXT.EFCORE.TRANSACTION.004)

**Requirement:** An EF Core-owned Command MUST register only its selected provider's LiteBus post-handler.

**Rationale:** A Marten post-handler cannot commit EF Core-owned work.

### Resolve cross-provider invariants (EXT.EFCORE.TRANSACTION.005)

**Requirement:** An accepted atomic cross-provider invariant MUST move its aggregates to one provider or use a reviewed shared transaction mechanism.

**Rationale:** One local invariant requires one verified atomic persistence boundary.

### Stage aggregate writes in repositories (EXT.EFCORE.WRITE.001)

**Requirement:** An EF Core Infrastructure repository MUST use its scoped `DbContext` to stage aggregate changes.

**Rationale:** Repository staging keeps write persistence outside Application handlers.

### Exclude direct handler commits (EXT.EFCORE.WRITE.002)

**Requirement:** An EF Core Command handler MUST NOT inject `DbContext` or call `SaveChangesAsync`.

**Rationale:** The selected post-handler owns the one Command commit.

### Define EF Core query roots (EXT.EFCORE.READ.001)

**Requirement:** Application MUST own one public `IApplicationDbContext` exposing required generic sets or named query roots.

**Rationale:** The interface defines the EF Core query boundary without exposing the Infrastructure DbContext.

### Implement query roots in Infrastructure (EXT.EFCORE.READ.002)

**Requirement:** Infrastructure MUST implement `IApplicationDbContext` with the application DbContext.

**Rationale:** The provider implementation remains behind Application's query interface.

### Retain Marten query boundary (EXT.EFCORE.READ.003)

**Requirement:** A Marten-owned query path MUST retain the baseline `IQuerySession` boundary.

**Rationale:** EF Core adoption does not alter read ownership for Marten-backed aggregates.

### Project EF Core queries directly (EXT.EFCORE.READ.004)

**Requirement:** An EF Core query handler MUST use `AsNoTracking`, filter before materialization, apply deterministic ordering and limits, and project result records.

**Rationale:** The implementation reads handlers return shaped results without loading mutable aggregate state.

### Avoid per-aggregate read stores (EXT.EFCORE.READ.005)

**Requirement:** An EF Core query implementation MUST NOT add one read-store interface per aggregate.

**Rationale:** `IApplicationDbContext` supplies the selected EF Core query boundary.

### Commit EF Core Command work once (EXT.EFCORE.COMMIT.001)

**Requirement:** An EF Core LiteBus post-handler MUST call `SaveChangesAsync` once for its owned Command.

**Rationale:** One post-handler commit preserves the Command's provider transaction boundary.

### Process changed aggregate events (EXT.EFCORE.COMMIT.002)

**Requirement:** An EF Core post-handler MUST collect Domain Events from changed aggregates and follow their documented delivery classification.

**Rationale:** Event delivery follows the same aggregate changes that the handler commits.

### Use durable outbox delivery (EXT.EFCORE.COMMIT.003)

**Requirement:** An EF Core Command requiring durable delivery MUST use the outbox extension without committing a Marten session.

**Rationale:** EF Core-owned durable work remains in the selected provider transaction.

### Stage EF Core outbox records together (EXT.EFCORE.OUTBOX.001)

**Requirement:** An EF Core-owned Command MUST map and stage outbox records with aggregate changes or Workflow progress through the same DbContext.

**Rationale:** The DbContext transaction makes the outbox record and business work durable together.

### Commit EF Core outbox records once (EXT.EFCORE.OUTBOX.002)

**Requirement:** An EF Core outbox Command MUST commit its aggregate and outbox changes through one `SaveChangesAsync` call.

**Rationale:** One call prevents separate durable outcomes for the business change and message.

### Reject cross-provider outbox storage (EXT.EFCORE.OUTBOX.003)

**Requirement:** An EF Core-owned Command MUST NOT store its required outbox record through a Marten session.

**Rationale:** A Marten outbox transaction cannot atomically commit an EF Core aggregate change.

### Configure EF Core mappings in Infrastructure (EXT.EFCORE.MAPPING.001)

**Requirement:** Infrastructure MUST own `IEntityTypeConfiguration<T>` classes for EF Core persistence mappings.

**Rationale:** Relational mapping behavior belongs to the provider-owning layer.

### Configure relational details explicitly (EXT.EFCORE.MAPPING.002)

**Requirement:** An EF Core mapping MUST explicitly configure typed IDs, owned values, fields, indexes, constraints, precision, deletes, concurrency tokens, and database names.

**Rationale:** Explicit configuration makes storage contract changes visible in code review and migrations.

### Retain Domain state values (EXT.EFCORE.STATE.001)

**Requirement:** EF Core persistence MUST retain the Domain aggregate's single `{Aggregate}State` value.

**Rationale:** The aggregate remains the owner of lifecycle state and state-specific business facts.

### Map stable relational state shape (EXT.EFCORE.STATE.002)

**Requirement:** Infrastructure MUST map a stable discriminator and every state-specific value without adding Domain lifecycle flags or duplicate nullable state properties.

**Rationale:** Relational storage can use columns while Domain retains its state-record hierarchy.

### Use direct state mapping only when supported (EXT.EFCORE.STATE.003)

**Requirement:** An EF Core mapping MAY use direct owned or JSON state mapping only when pinned versions materialize, track, and round-trip each state record.

**Rationale:** A direct mapping needs complete provider behavior for every sealed state case.

### Map unsupported state shapes in Infrastructure (EXT.EFCORE.STATE.004)

**Requirement:** An unsupported direct state mapping MUST use an Infrastructure persistence type with discriminator and state-specific columns.

**Rationale:** The repository maps the persistence type to and from the Domain hierarchy.

### Review new persisted states (EXT.EFCORE.STATE.005)

**Requirement:** A new persisted state MUST include reviewed migration, mixed-version behavior, rollback behavior, and an integration fixture.

**Rationale:** New state values affect stored rows and application versions that read them.

**Example:** `PostRow` maps `state_type`, `published_at`, and `archived_at` to one `PostState` record.

### Generate migrations for schema changes (EXT.EFCORE.MIGRATIONS.001)

**Requirement:** An EF Core schema change MUST generate a migration.

**Rationale:** The migration is the explicit reviewed description of relational schema evolution.

### Review migration effects (EXT.EFCORE.MIGRATIONS.002)

**Requirement:** A migration review MUST cover tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

**Rationale:** Each item can affect deployment safety or data recovery.

### Apply migrations as release work (EXT.EFCORE.MIGRATIONS.003)

**Requirement:** A release process MUST apply EF Core migrations before application startup.

**Rationale:** Release-owned execution controls ordering and evidence for schema work.

### Keep migration files together (EXT.EFCORE.MIGRATIONS.004)

**Requirement:** An EF Core schema change MUST commit migration, model snapshot, and reviewed SQL together.

**Rationale:** The three artifacts show intended migration source and resulting relational change.

### Test migration starting states (EXT.EFCORE.MIGRATIONS.005)

**Requirement:** An EF Core migration MUST apply successfully from an empty database and previous release database.

**Rationale:** Both initial setup and upgrade paths need tested relational evolution.

### Reject startup schema mutation (EXT.EFCORE.MIGRATIONS.006)

**Requirement:** Production and staging startup MUST NOT call `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

**Rationale:** Replica startup does not own hosted database schema change.

### Configure optimistic tokens (EXT.EFCORE.CONCURRENCY.001)

**Requirement:** An EF Core aggregate using concurrency-idempotency MUST configure a provider-backed token and carry expected version through its Command.

**Rationale:** The token connects a caller's expected aggregate version to EF Core write detection.

### Map EF Core concurrency conflict (EXT.EFCORE.CONCURRENCY.002)

**Requirement:** An EF Core post-handler MUST translate `DbUpdateConcurrencyException` into the Application conflict contract.

**Rationale:** Application exposes a project-owned conflict rather than an EF Core exception type.

### Reject automatic command retry (EXT.EFCORE.CONCURRENCY.003)

**Requirement:** An EF Core post-handler MUST NOT retry the complete Command automatically after a concurrency exception.

**Rationale:** A retry can rerun Domain behavior against state that the caller did not approve.

## Conventions

### Use the EF Core Infrastructure layout (EXT.EFCORE.CONVENTION.001)

**Default:** Use `Infrastructure/Persistence/EfCore/` for `ApplicationDbContext`, factory, post-handler, configurations, migrations, and repositories.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:** `Infrastructure/Persistence/EfCore/Configurations/` holds entity mapping classes.

### Use snake-case relational names (EXT.EFCORE.CONVENTION.002)

**Default:** Use `snake_case` through the pinned naming-conventions package and verify generated names in each migration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The migration shows the exact names that reach the database.

## Dependencies

- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `EFCore.NamingConventions`

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.EFCORE.ADOPT.001 | inspection | EF Core decision records all required replacement and rollback fields. |
| EXT.EFCORE.ADOPT.002 | inspection | Nonselected aggregate paths retain baseline persistence documentation and code. |
| EXT.EFCORE.TRANSACTION.001 | test | Command integration tests stage aggregate work through one selected provider. |
| EXT.EFCORE.TRANSACTION.002 | static | Command handlers contain no mixed Marten and EF Core aggregate repository writes. |
| EXT.EFCORE.TRANSACTION.003 | inspection | Adoption decision records Command provider selection and architecture-test evidence. |
| EXT.EFCORE.TRANSACTION.004 | test | Command registration resolves only its selected provider post-handler. |
| EXT.EFCORE.TRANSACTION.005 | inspection | Cross-provider invariant review selects one provider or shared transaction evidence. |
| EXT.EFCORE.WRITE.001 | test | Repository tests stage changes through scoped DbContext. |
| EXT.EFCORE.WRITE.002 | static | Command handlers contain no DbContext injection or `SaveChangesAsync` call. |
| EXT.EFCORE.READ.001 | static | Application exposes one owned `IApplicationDbContext` query interface. |
| EXT.EFCORE.READ.002 | static | Infrastructure DbContext implements the owned query interface. |
| EXT.EFCORE.READ.003 | static | Marten query handlers retain `IQuerySession`. |
| EXT.EFCORE.READ.004 | test | Query tests use no tracking, authorized filters, deterministic limits, and projections. |
| EXT.EFCORE.READ.005 | static | EF Core query source contains no per-aggregate read-store interface pattern. |
| EXT.EFCORE.COMMIT.001 | test | EF Core Command tests observe one post-handler `SaveChangesAsync` call. |
| EXT.EFCORE.COMMIT.002 | test | Changed aggregate fixtures classify and stage Domain Events correctly. |
| EXT.EFCORE.COMMIT.003 | static | EF Core durable Commands commit no Marten session. |
| EXT.EFCORE.OUTBOX.001 | test | EF Core outbox tests stage message and business work through one DbContext. |
| EXT.EFCORE.OUTBOX.002 | test | EF Core outbox tests observe one commit for aggregate and message. |
| EXT.EFCORE.OUTBOX.003 | static | EF Core Command source writes no required outbox record through Marten. |
| EXT.EFCORE.MAPPING.001 | static | EF Core mappings use Infrastructure-owned configuration classes. |
| EXT.EFCORE.MAPPING.002 | inspection | Mapping review records every declared relational configuration category. |
| EXT.EFCORE.STATE.001 | test | EF Core round-trip fixtures retain the aggregate's one Domain state value. |
| EXT.EFCORE.STATE.002 | static | Domain source contains no relational lifecycle flags or duplicate nullable state values. |
| EXT.EFCORE.STATE.003 | test | Direct mapping fixtures materialize, track, and round-trip every state case. |
| EXT.EFCORE.STATE.004 | test | Persistence row fixtures map valid discriminator values to Domain states. |
| EXT.EFCORE.STATE.005 | inspection, test | New state review and integration fixture cover migration, mixed versions, and rollback. |
| EXT.EFCORE.MIGRATIONS.001 | static | EF Core schema diffs include a generated migration. |
| EXT.EFCORE.MIGRATIONS.002 | inspection | Migration review covers each declared storage and rollback effect. |
| EXT.EFCORE.MIGRATIONS.003 | operation | Release record applies migration before replica startup. |
| EXT.EFCORE.MIGRATIONS.004 | static | Migration commit contains migration, snapshot, and reviewed SQL artifacts. |
| EXT.EFCORE.MIGRATIONS.005 | test | Migration fixtures run from empty and previous-release databases. |
| EXT.EFCORE.MIGRATIONS.006 | static | Production and staging startup source calls none of the prohibited schema APIs. |
| EXT.EFCORE.CONCURRENCY.001 | test | Concurrency fixtures carry expected version and use configured EF Core token. |
| EXT.EFCORE.CONCURRENCY.002 | test | EF Core conflict fixture maps provider exception to Application contract. |
| EXT.EFCORE.CONCURRENCY.003 | test | Conflict fixture proves no complete Command automatic retry. |
| EXT.EFCORE.CONVENTION.001 | inspection | EF Core Infrastructure paths use the default layout or a local replacement. |
| EXT.EFCORE.CONVENTION.002 | test | Generated migrations contain verified snake-case database names. |
