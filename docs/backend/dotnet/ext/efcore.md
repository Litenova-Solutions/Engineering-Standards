# EF Core Persistence

## Intent

This extension states the Entity Framework Core form of the read, query and mapping rules. It applies to aggregates with accepted relational navigation, change-tracking, or provider requirements that the baseline provider cannot satisfy.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `use-case`.

The consumer enables `efcore` only after a decision records aggregate scope, relational requirement, data evolution effect, and the Marten baseline gap.

## Baseline relationship

For Entity Framework Core-owned aggregate paths, this extension replaces:

- `litespec/backend/dotnet/persistence#query-through-iquerysession`: EF Core queries use `IApplicationDbContext`.
- `litespec/backend/persistence#keep-mappings-and-aliases-explicit`: EF Core mappings use `IEntityTypeConfiguration<T>` classes.
- `litespec/backend/dotnet/packages#keep-application-dependencies-narrow`: Application references the Entity Framework Core query surface its query interface needs.
- `litespec/backend/architecture#separate-command-and-query-behavior`: the read half only; the invariant half still binds.

For an EF Core-owned command with durable delivery, this extension also replaces:

- `litespec/ext/outbox#stage-messages-with-business-work`
- `litespec/ext/outbox#reject-independent-outbox-commits`

Every other baseline provision binds EF Core-owned paths unchanged.

This extension switches on no optional record type.

## Agent Summary {#agent-summary}

- Record affected aggregates and persistence effects. (litespec/backend/dotnet/ext/efcore#record-ef-core-replacement-scope)
- Stage each Command through one write provider. (litespec/backend/dotnet/ext/efcore#use-one-write-provider, litespec/backend/dotnet/ext/efcore#reject-mixed-provider-writes)
- Keep EF Core writes behind repositories. (litespec/backend/dotnet/ext/efcore#stage-aggregate-writes-in-repositories, litespec/backend/dotnet/ext/efcore#exclude-direct-handler-commits)
- Query EF Core through `IApplicationDbContext` and resolve the tenant at context creation. (litespec/backend/dotnet/ext/efcore#define-ef-core-query-roots, litespec/backend/dotnet/ext/efcore#retain-marten-query-boundary, litespec/backend/dotnet/ext/efcore#resolve-the-tenant-at-context-creation)
- Commit EF Core changes through its LiteBus post-handler. (litespec/backend/dotnet/ext/efcore#commit-ef-core-command-work-once)
- Stage EF Core outbox records with EF Core business work. (litespec/backend/dotnet/ext/efcore#stage-ef-core-outbox-records-together)
- Configure relational mappings in Infrastructure. (litespec/backend/dotnet/ext/efcore#configure-ef-core-mappings-in-infrastructure)
- Preserve Domain state records and lifecycle boundaries. (litespec/backend/dotnet/ext/efcore#retain-domain-state-values, litespec/backend/dotnet/ext/efcore#map-stable-relational-state-shape)
- Review and release migrations explicitly. (litespec/backend/dotnet/ext/efcore#generate-migrations-for-schema-changes, litespec/backend/dotnet/ext/efcore#apply-migrations-as-release-work)
- Map EF Core concurrency failures to Application outcomes. (litespec/backend/dotnet/ext/efcore#map-ef-core-concurrency-conflict)

## Standards

### Record EF Core replacement scope

**Requirement:** An EF Core adoption decision MUST name affected aggregates, data evolution, transaction requirements, query impact, package changes, and rollback plan.

**Rationale:** The decision describes the complete persistence replacement for its selected aggregates.

### Retain unaffected baseline persistence

**Requirement:** An unaffected aggregate MUST retain baseline persistence rules.

**Rationale:** Local EF Core adoption does not change ownership of other aggregate paths.

### Use one write provider

**Requirement:** An EF Core-owned Command MUST stage aggregate writes through exactly one selected write provider.

**Rationale:** One provider gives the Command one atomic commit boundary.

### Reject mixed provider writes

**Requirement:** A Command MUST NOT stage aggregate writes through both Marten-backed and EF Core-backed repositories.

**Rationale:** Independent provider commits cannot preserve one local aggregate invariant.

### Record provider selection

**Requirement:** An EF Core adoption decision MUST name Command provider selection and its architecture-test evidence.

**Rationale:** The decision makes provider ownership reviewable for each selected Command path.

### Register one Command post-handler

**Requirement:** An EF Core-owned Command MUST register only its selected provider's LiteBus post-handler.

**Rationale:** A Marten post-handler cannot commit EF Core-owned work.

### Resolve cross-provider invariants

**Requirement:** An accepted atomic cross-provider invariant MUST move its aggregates to one provider or use a reviewed shared transaction mechanism.

**Rationale:** One local invariant requires one verified atomic persistence boundary.

### Stage aggregate writes in repositories

**Requirement:** An EF Core Infrastructure repository MUST use its scoped `DbContext` to stage aggregate changes.

**Rationale:** Repository staging keeps write persistence outside Application handlers.

### Exclude direct handler commits

**Requirement:** An EF Core Command handler MUST NOT inject `DbContext` or call `SaveChangesAsync`.

**Rationale:** The selected post-handler owns the one Command commit.

### Define EF Core query roots

**Requirement:** Application MUST own one public `IApplicationDbContext` exposing required generic sets or named query roots, referencing only the Entity Framework Core abstractions that interface needs.

**Rationale:** The interface defines the EF Core query boundary without exposing the Infrastructure DbContext. The permitted surface is the query types the interface exposes and the manifest-pinned `Microsoft.EntityFrameworkCore` package that declares them.

### Implement query roots in Infrastructure

**Requirement:** Infrastructure MUST implement `IApplicationDbContext` with the application DbContext.

**Rationale:** The provider implementation remains behind Application's query interface.

### Retain Marten query boundary

**Requirement:** A Marten-owned query path MUST retain the baseline `IQuerySession` boundary.

**Rationale:** EF Core adoption does not alter read ownership for Marten-backed aggregates.

### Project EF Core queries directly

**Requirement:** An EF Core query handler MUST use `AsNoTracking`, filter before materialization, order and limit deterministically, and project records.

**Rationale:** The implementation reads handlers return shaped results without loading mutable aggregate state. No command enforces an invariant from a read projection.

### Avoid per-aggregate read stores

**Requirement:** An EF Core query implementation MUST NOT add one read-store interface per aggregate.

**Rationale:** `IApplicationDbContext` supplies the selected EF Core query boundary.

### Resolve the tenant at context creation

**Requirement:** An EF Core DbContext MUST resolve the tenant when the context is created and apply the tenant filter to tenant-owned sets.

**Rationale:** Resolution at creation keeps the tenant out of every query, and the filter convention applies it to each tenant-owned set.

### Commit EF Core Command work once

**Requirement:** An EF Core LiteBus post-handler MUST call `SaveChangesAsync` once for its owned Command.

**Rationale:** One post-handler commit preserves the Command's provider transaction boundary.

### Process changed aggregate events

**Requirement:** An EF Core post-handler MUST collect Domain Events from changed aggregates and follow their documented delivery classification.

**Rationale:** Event delivery follows the same aggregate changes that the handler commits.

### Use durable outbox delivery

**Requirement:** An EF Core Command requiring durable delivery MUST use the outbox extension without committing a Marten session.

**Rationale:** EF Core-owned durable work remains in the selected provider transaction.

### Stage EF Core outbox records together

**Requirement:** An EF Core-owned Command MUST map and stage outbox records with aggregate changes through the same DbContext.

**Rationale:** The DbContext transaction makes the outbox record and business work durable together.

### Reject cross-provider outbox storage

**Requirement:** An EF Core-owned Command MUST NOT store its required outbox record through a Marten session.

**Rationale:** A Marten outbox transaction cannot atomically commit an EF Core aggregate change.

### Configure EF Core mappings in Infrastructure

**Requirement:** Infrastructure MUST own `IEntityTypeConfiguration<T>` classes for EF Core persistence mappings.

**Rationale:** Relational mapping behavior belongs to the provider-owning layer.

### Configure relational details explicitly

**Requirement:** An EF Core mapping MUST explicitly configure typed IDs, owned values, fields, indexes, constraints, precision, deletes, concurrency tokens, and database names.

**Rationale:** Explicit configuration makes storage contract changes visible in code review and migrations.

### Retain Domain state values

**Requirement:** EF Core persistence MUST retain the Domain aggregate's single `{Aggregate}State` value.

**Rationale:** The aggregate remains the owner of lifecycle state and state-specific business facts.

A relational column holds the active state record and its discriminator, which is the same contract the baseline provider stores in its document. The column never holds an enumerated integer, because that discards the state-specific facts the record carries and reintroduces the shape `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` removes. A state case with its own fields maps to an owned type or to its own table. The discriminator selects which one a read materializes.

### Map stable relational state shape

**Requirement:** Infrastructure MUST map a stable discriminator and every state-specific value without adding Domain lifecycle flags or duplicate nullable state properties.

**Rationale:** Relational storage can use columns while Domain retains its state-record hierarchy.

### Use direct state mapping only when supported

**Requirement:** An EF Core mapping MAY use direct owned or JSON state mapping only when pinned versions materialize, track, and round-trip each state record.

**Rationale:** A direct mapping needs complete provider behavior for every sealed state case.

### Map unsupported state shapes in Infrastructure

**Requirement:** An unsupported direct state mapping MUST use an Infrastructure persistence type with discriminator and state-specific columns.

**Rationale:** The repository maps the persistence type to and from the Domain hierarchy.

### Review new persisted states

**Requirement:** A new persisted state MUST include reviewed migration, mixed-version behavior, rollback behavior, and an integration fixture.

**Rationale:** New state values affect stored rows and application versions that read them.

**Example:** `PostRow` maps `state_type`, `published_at`, and `archived_at` to one `PostState` record.

### Generate migrations for schema changes

**Requirement:** An EF Core schema change MUST generate a migration.

**Rationale:** The migration is the explicit reviewed description of relational schema evolution.

### Review migration effects

**Requirement:** A migration review MUST cover tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

**Rationale:** Each item can affect deployment safety or data recovery.

### Apply migrations as release work

**Requirement:** A release process MUST apply EF Core migrations before application startup.

**Rationale:** Release-owned execution controls ordering and evidence for schema work.

### Keep migration files together

**Requirement:** An EF Core schema change MUST commit migration, model snapshot, and reviewed SQL together.

**Rationale:** The three artifacts show intended migration source and resulting relational change.

### Test migration starting states

**Requirement:** An EF Core migration MUST apply successfully from an empty database and previous release database.

**Rationale:** Both initial setup and upgrade paths need tested relational evolution.

The previous release database is the schema of the last released artifact, not the schema of the previous commit. The test builds it by applying that artifact's migrations to an empty database, then applies the current ones on top. A test that starts from the current migrations minus one proves that the last migration applies, which is the case least likely to be broken.

### Reject startup schema mutation

**Requirement:** Production and staging startup MUST NOT call `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

**Rationale:** Replica startup does not own hosted database schema change.

### Configure optimistic tokens

**Requirement:** An EF Core aggregate using concurrency MUST configure a provider-backed token and carry expected version through its Command.

**Rationale:** The token connects a caller's expected aggregate version to EF Core write detection.

### Map EF Core concurrency conflict

**Requirement:** An EF Core post-handler MUST translate `DbUpdateConcurrencyException` into the Application conflict contract.

**Rationale:** Application exposes a project-owned conflict rather than an EF Core exception type.

### Reject automatic command retry

**Requirement:** An EF Core post-handler MUST NOT retry the complete Command automatically after a concurrency exception.

**Rationale:** A retry can rerun Domain behavior against state that the caller did not approve.

## Conventions

### Use the EF Core Infrastructure layout

**Default:** Use `Infrastructure/Persistence/EfCore/` for `ApplicationDbContext`, factory, post-handler, configurations, migrations, and repositories.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Example:** `Infrastructure/Persistence/EfCore/Configurations/` holds entity mapping classes.

### Use snake-case relational names

**Default:** Use the pinned naming-conventions package and verify generated names in each migration, with casing owned by `litespec/backend/persistence#use-database-naming-conventions`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** The migration shows the exact names that reach the database.

## Dependencies

- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `EFCore.NamingConventions`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/ext/efcore#record-ef-core-replacement-scope | guidance | Does the decision name aggregates, evolution, transactions, queries, packages and rollback? |
| litespec/backend/dotnet/ext/efcore#retain-unaffected-baseline-persistence | guidance | Does every unaffected aggregate path retain its baseline persistence behavior? |
| litespec/backend/dotnet/ext/efcore#use-one-write-provider | checkable | `EfCoreTransactionTests` stage aggregate work through one selected provider. |
| litespec/backend/dotnet/ext/efcore#reject-mixed-provider-writes | checkable | `EfCoreTransactionTests` assert no mixed Marten and EF Core aggregate repository writes. |
| litespec/backend/dotnet/ext/efcore#record-provider-selection | guidance | Does the decision name each Command path's provider and its test evidence? |
| litespec/backend/dotnet/ext/efcore#register-one-command-post-handler | checkable | `EfCoreTransactionTests` assert each command resolves only its selected provider post-handler. |
| litespec/backend/dotnet/ext/efcore#resolve-cross-provider-invariants | guidance | Does each cross-provider invariant use one provider or a reviewed shared transaction? |
| litespec/backend/dotnet/ext/efcore#stage-aggregate-writes-in-repositories | checkable | `EfCoreWriteTests` stage changes through the scoped DbContext. |
| litespec/backend/dotnet/ext/efcore#exclude-direct-handler-commits | checkable | `EfCoreWriteTests` assert handlers inject no DbContext and call no `SaveChangesAsync`. |
| litespec/backend/dotnet/ext/efcore#define-ef-core-query-roots | checkable | `EfCoreReadTests` assert one owned `IApplicationDbContext` and no wider EF surface. |
| litespec/backend/dotnet/ext/efcore#implement-query-roots-in-infrastructure | checkable | `EfCoreReadTests` assert the Infrastructure DbContext implements the owned query interface. |
| litespec/backend/dotnet/ext/efcore#retain-marten-query-boundary | checkable | `EfCoreReadTests` assert Marten query handlers retain `IQuerySession`. |
| litespec/backend/dotnet/ext/efcore#project-ef-core-queries-directly | checkable | `EfCoreReadTests` assert no tracking, authorized filters, deterministic limits, projections, and no invariant from a projection. |
| litespec/backend/dotnet/ext/efcore#avoid-per-aggregate-read-stores | checkable | `EfCoreReadTests` assert no per-aggregate read-store interface pattern exists. |
| litespec/backend/dotnet/ext/efcore#resolve-the-tenant-at-context-creation | checkable | `EfCoreReadTests` assert tenant resolution at creation and tenant filters on owned sets. |
| litespec/backend/dotnet/ext/efcore#commit-ef-core-command-work-once | checkable | `EfCoreCommitTests` observe one post-handler `SaveChangesAsync` call per owned Command. |
| litespec/backend/dotnet/ext/efcore#process-changed-aggregate-events | checkable | `EfCoreCommitTests` classify and stage Domain Events correctly. |
| litespec/backend/dotnet/ext/efcore#use-durable-outbox-delivery | checkable | `EfCoreCommitTests` assert EF Core durable Commands commit no Marten session. |
| litespec/backend/dotnet/ext/efcore#stage-ef-core-outbox-records-together | checkable | `EfCoreOutboxTests` stage message and business work through one DbContext. |
| litespec/backend/dotnet/ext/efcore#reject-cross-provider-outbox-storage | checkable | `EfCoreOutboxTests` assert EF Core Commands write no outbox record through Marten. |
| litespec/backend/dotnet/ext/efcore#configure-ef-core-mappings-in-infrastructure | checkable | `EfCoreMappingTests` assert EF Core mappings use Infrastructure-owned configuration classes. |
| litespec/backend/dotnet/ext/efcore#configure-relational-details-explicitly | guidance | Does the mapping review record every declared relational configuration category? |
| litespec/backend/dotnet/ext/efcore#retain-domain-state-values | checkable | `EfCoreStateTests` retain the aggregate's one Domain state value. |
| litespec/backend/dotnet/ext/efcore#map-stable-relational-state-shape | checkable | `EfCoreStateTests` assert no relational lifecycle flags or duplicate nullable state values. |
| litespec/backend/dotnet/ext/efcore#use-direct-state-mapping-only-when-supported | checkable | `EfCoreStateTests` materialize, track, and round-trip every state case. |
| litespec/backend/dotnet/ext/efcore#map-unsupported-state-shapes-in-infrastructure | checkable | `EfCoreStateTests` map valid discriminator values to Domain states. |
| litespec/backend/dotnet/ext/efcore#review-new-persisted-states | guidance | Does the new state review cover migration, mixed versions, rollback and a fixture? |
| litespec/backend/dotnet/ext/efcore#generate-migrations-for-schema-changes | checkable | `EfCoreMigrationsTests` assert EF Core schema diffs include a generated migration. |
| litespec/backend/dotnet/ext/efcore#review-migration-effects | guidance | Does the migration review cover every declared storage and rollback effect? |
| litespec/backend/dotnet/ext/efcore#apply-migrations-as-release-work | checkable | `EfCoreMigrationsTests` place migration application before replica startup in the release record. |
| litespec/backend/dotnet/ext/efcore#keep-migration-files-together | checkable | `EfCoreMigrationsTests` assert each migration commit holds migration, snapshot, and reviewed SQL. |
| litespec/backend/dotnet/ext/efcore#test-migration-starting-states | checkable | `EfCoreMigrationsTests` run from empty and previous-release databases. |
| litespec/backend/dotnet/ext/efcore#reject-startup-schema-mutation | checkable | `EfCoreMigrationsTests` assert startup calls none of the prohibited schema APIs. |
| litespec/backend/dotnet/ext/efcore#configure-optimistic-tokens | checkable | `EfCoreConcurrencyTests` carry expected version and use the configured EF Core token. |
| litespec/backend/dotnet/ext/efcore#map-ef-core-concurrency-conflict | checkable | `EfCoreConcurrencyTests` map the provider exception to the Application contract. |
| litespec/backend/dotnet/ext/efcore#reject-automatic-command-retry | checkable | `EfCoreConcurrencyTests` prove no complete Command automatic retry. |
| litespec/backend/dotnet/ext/efcore#use-the-ef-core-infrastructure-layout | guidance | Does each EF Core Infrastructure path use the default layout or record an Exception? |
| litespec/backend/dotnet/ext/efcore#use-snake-case-relational-names | checkable | `EfCoreTests` assert generated migrations contain verified snake-case database names. |
