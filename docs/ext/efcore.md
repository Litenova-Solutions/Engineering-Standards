# EF Core Persistence

## Intent

This extension replaces Marten persistence for aggregates with accepted relational navigation, change-tracking, or provider requirements that Marten cannot satisfy.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `use-case`.

The consumer enables `efcore` only after a decision records aggregate scope, relational requirement, data evolution effect, and the Marten baseline gap.

## Baseline relationship

For EF Core-owned aggregate paths, this extension replaces `standards/rule/workspace-dependencies.keep-application-dependencies-narrow`, `standards/rule/backend-architecture.separate-command-and-query-behavior`, `standards/rule/backend-persistence.stage-aggregate-writes-through-repositories`, `standards/rule/backend-persistence.query-through-iquerysession`, `standards/rule/backend-persistence.commit-once-in-the-command-pipeline`, `standards/rule/backend-persistence.collect-events-without-a-public-unit-of-work`, `standards/rule/backend-persistence.keep-mappings-and-aliases-explicit`, `standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain`, `standards/rule/backend-persistence.evolve-stored-document-contracts-explicitly`, and `standards/rule/backend-persistence.bound-aggregate-document-growth`.

When `outbox` applies to an EF Core-owned command, this extension also replaces `standards/rule/ext-outbox.stage-messages-with-business-work` for that command.

## Agent Summary {#agent-summary}

- Record affected aggregates and persistence effects. (standards/rule/ext-efcore.record-ef-core-replacement-scope)
- Stage each Command through one write provider. (standards/rule/ext-efcore.use-one-write-provider, standards/rule/ext-efcore.reject-mixed-provider-writes)
- Keep EF Core writes behind repositories. (standards/rule/ext-efcore.stage-aggregate-writes-in-repositories, standards/rule/ext-efcore.exclude-direct-handler-commits)
- Query EF Core through `IApplicationDbContext`. (standards/rule/ext-efcore.define-ef-core-query-roots, standards/rule/ext-efcore.retain-marten-query-boundary)
- Commit EF Core changes through its LiteBus post-handler. (standards/rule/ext-efcore.commit-ef-core-command-work-once)
- Stage EF Core outbox records with EF Core business work. (standards/rule/ext-efcore.stage-ef-core-outbox-records-together)
- Configure relational mappings in Infrastructure. (standards/rule/ext-efcore.configure-ef-core-mappings-in-infrastructure)
- Preserve Domain state records and lifecycle boundaries. (standards/rule/ext-efcore.retain-domain-state-values, standards/rule/ext-efcore.map-stable-relational-state-shape)
- Review and release migrations explicitly. (standards/rule/ext-efcore.generate-migrations-for-schema-changes, standards/rule/ext-efcore.apply-migrations-as-release-work)
- Map EF Core concurrency failures to Application outcomes. (standards/rule/ext-efcore.map-ef-core-concurrency-conflict)

## Standards

### Record EF Core replacement scope (standards/rule/ext-efcore.record-ef-core-replacement-scope)

**Requirement:** An EF Core adoption decision MUST name affected aggregates, data evolution, transaction requirements, query impact, package changes, and rollback plan.

**Rationale:** The decision describes the complete persistence replacement for its selected aggregates.

### Retain unaffected baseline persistence (standards/rule/ext-efcore.retain-unaffected-baseline-persistence)

**Requirement:** An unaffected aggregate MUST retain baseline persistence rules.

**Rationale:** Local EF Core adoption does not change ownership of other aggregate paths.

### Use one write provider (standards/rule/ext-efcore.use-one-write-provider)

**Requirement:** An EF Core-owned Command MUST stage aggregate writes through exactly one selected write provider.

**Rationale:** One provider gives the Command one atomic commit boundary.

### Reject mixed provider writes (standards/rule/ext-efcore.reject-mixed-provider-writes)

**Requirement:** A Command MUST NOT stage aggregate writes through both Marten-backed and EF Core-backed repositories.

**Rationale:** Independent provider commits cannot preserve one local aggregate invariant.

### Record provider selection (standards/rule/ext-efcore.record-provider-selection)

**Requirement:** An EF Core adoption decision MUST name Command provider selection and its architecture-test evidence.

**Rationale:** The decision makes provider ownership reviewable for each selected Command path.

### Register one Command post-handler (standards/rule/ext-efcore.register-one-command-post-handler)

**Requirement:** An EF Core-owned Command MUST register only its selected provider's LiteBus post-handler.

**Rationale:** A Marten post-handler cannot commit EF Core-owned work.

### Resolve cross-provider invariants (standards/rule/ext-efcore.resolve-cross-provider-invariants)

**Requirement:** An accepted atomic cross-provider invariant MUST move its aggregates to one provider or use a reviewed shared transaction mechanism.

**Rationale:** One local invariant requires one verified atomic persistence boundary.

### Stage aggregate writes in repositories (standards/rule/ext-efcore.stage-aggregate-writes-in-repositories)

**Requirement:** An EF Core Infrastructure repository MUST use its scoped `DbContext` to stage aggregate changes.

**Rationale:** Repository staging keeps write persistence outside Application handlers.

### Exclude direct handler commits (standards/rule/ext-efcore.exclude-direct-handler-commits)

**Requirement:** An EF Core Command handler MUST NOT inject `DbContext` or call `SaveChangesAsync`.

**Rationale:** The selected post-handler owns the one Command commit.

### Define EF Core query roots (standards/rule/ext-efcore.define-ef-core-query-roots)

**Requirement:** Application MUST own one public `IApplicationDbContext` exposing required generic sets or named query roots.

**Rationale:** The interface defines the EF Core query boundary without exposing the Infrastructure DbContext.

### Implement query roots in Infrastructure (standards/rule/ext-efcore.implement-query-roots-in-infrastructure)

**Requirement:** Infrastructure MUST implement `IApplicationDbContext` with the application DbContext.

**Rationale:** The provider implementation remains behind Application's query interface.

### Retain Marten query boundary (standards/rule/ext-efcore.retain-marten-query-boundary)

**Requirement:** A Marten-owned query path MUST retain the baseline `IQuerySession` boundary.

**Rationale:** EF Core adoption does not alter read ownership for Marten-backed aggregates.

### Project EF Core queries directly (standards/rule/ext-efcore.project-ef-core-queries-directly)

**Requirement:** An EF Core query handler MUST use `AsNoTracking`, filter before materialization, apply deterministic ordering and limits, and project result records.

**Rationale:** The implementation reads handlers return shaped results without loading mutable aggregate state.

### Avoid per-aggregate read stores (standards/rule/ext-efcore.avoid-per-aggregate-read-stores)

**Requirement:** An EF Core query implementation MUST NOT add one read-store interface per aggregate.

**Rationale:** `IApplicationDbContext` supplies the selected EF Core query boundary.

### Commit EF Core Command work once (standards/rule/ext-efcore.commit-ef-core-command-work-once)

**Requirement:** An EF Core LiteBus post-handler MUST call `SaveChangesAsync` once for its owned Command.

**Rationale:** One post-handler commit preserves the Command's provider transaction boundary.

### Process changed aggregate events (standards/rule/ext-efcore.process-changed-aggregate-events)

**Requirement:** An EF Core post-handler MUST collect Domain Events from changed aggregates and follow their documented delivery classification.

**Rationale:** Event delivery follows the same aggregate changes that the handler commits.

### Use durable outbox delivery (standards/rule/ext-efcore.use-durable-outbox-delivery)

**Requirement:** An EF Core Command requiring durable delivery MUST use the outbox extension without committing a Marten session.

**Rationale:** EF Core-owned durable work remains in the selected provider transaction.

### Stage EF Core outbox records together (standards/rule/ext-efcore.stage-ef-core-outbox-records-together)

**Requirement:** An EF Core-owned Command MUST map and stage outbox records with aggregate changes or Workflow progress through the same DbContext.

**Rationale:** The DbContext transaction makes the outbox record and business work durable together.

### Commit EF Core outbox records once (standards/rule/ext-efcore.commit-ef-core-outbox-records-once)

**Requirement:** An EF Core outbox Command MUST commit its aggregate and outbox changes through one `SaveChangesAsync` call.

**Rationale:** One call prevents separate durable outcomes for the business change and message.

### Reject cross-provider outbox storage (standards/rule/ext-efcore.reject-cross-provider-outbox-storage)

**Requirement:** An EF Core-owned Command MUST NOT store its required outbox record through a Marten session.

**Rationale:** A Marten outbox transaction cannot atomically commit an EF Core aggregate change.

### Configure EF Core mappings in Infrastructure (standards/rule/ext-efcore.configure-ef-core-mappings-in-infrastructure)

**Requirement:** Infrastructure MUST own `IEntityTypeConfiguration<T>` classes for EF Core persistence mappings.

**Rationale:** Relational mapping behavior belongs to the provider-owning layer.

### Configure relational details explicitly (standards/rule/ext-efcore.configure-relational-details-explicitly)

**Requirement:** An EF Core mapping MUST explicitly configure typed IDs, owned values, fields, indexes, constraints, precision, deletes, concurrency tokens, and database names.

**Rationale:** Explicit configuration makes storage contract changes visible in code review and migrations.

### Retain Domain state values (standards/rule/ext-efcore.retain-domain-state-values)

**Requirement:** EF Core persistence MUST retain the Domain aggregate's single `{Aggregate}State` value.

**Rationale:** The aggregate remains the owner of lifecycle state and state-specific business facts.

A relational column holds the active state record and its discriminator, which is the same contract the baseline provider stores in its document. The column never holds an enumerated integer, because that discards the state-specific facts the record carries and reintroduces the shape `standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums` removes. A state case with its own fields maps to an owned type or to its own table. The discriminator selects which one a read materializes.

### Map stable relational state shape (standards/rule/ext-efcore.map-stable-relational-state-shape)

**Requirement:** Infrastructure MUST map a stable discriminator and every state-specific value without adding Domain lifecycle flags or duplicate nullable state properties.

**Rationale:** Relational storage can use columns while Domain retains its state-record hierarchy.

### Use direct state mapping only when supported (standards/rule/ext-efcore.use-direct-state-mapping-only-when-supported)

**Requirement:** An EF Core mapping MAY use direct owned or JSON state mapping only when pinned versions materialize, track, and round-trip each state record.

**Rationale:** A direct mapping needs complete provider behavior for every sealed state case.

### Map unsupported state shapes in Infrastructure (standards/rule/ext-efcore.map-unsupported-state-shapes-in-infrastructure)

**Requirement:** An unsupported direct state mapping MUST use an Infrastructure persistence type with discriminator and state-specific columns.

**Rationale:** The repository maps the persistence type to and from the Domain hierarchy.

### Review new persisted states (standards/rule/ext-efcore.review-new-persisted-states)

**Requirement:** A new persisted state MUST include reviewed migration, mixed-version behavior, rollback behavior, and an integration fixture.

**Rationale:** New state values affect stored rows and application versions that read them.

**Example:** `PostRow` maps `state_type`, `published_at`, and `archived_at` to one `PostState` record.

### Generate migrations for schema changes (standards/rule/ext-efcore.generate-migrations-for-schema-changes)

**Requirement:** An EF Core schema change MUST generate a migration.

**Rationale:** The migration is the explicit reviewed description of relational schema evolution.

### Review migration effects (standards/rule/ext-efcore.review-migration-effects)

**Requirement:** A migration review MUST cover tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

**Rationale:** Each item can affect deployment safety or data recovery.

### Apply migrations as release work (standards/rule/ext-efcore.apply-migrations-as-release-work)

**Requirement:** A release process MUST apply EF Core migrations before application startup.

**Rationale:** Release-owned execution controls ordering and evidence for schema work.

### Keep migration files together (standards/rule/ext-efcore.keep-migration-files-together)

**Requirement:** An EF Core schema change MUST commit migration, model snapshot, and reviewed SQL together.

**Rationale:** The three artifacts show intended migration source and resulting relational change.

### Test migration starting states (standards/rule/ext-efcore.test-migration-starting-states)

**Requirement:** An EF Core migration MUST apply successfully from an empty database and previous release database.

**Rationale:** Both initial setup and upgrade paths need tested relational evolution.

The previous release database is the schema of the last released artifact, not the schema of the previous commit. The test builds it by applying that artifact's migrations to an empty database, then applies the current ones on top. A test that starts from the current migrations minus one proves that the last migration applies, which is the case least likely to be broken.

### Reject startup schema mutation (standards/rule/ext-efcore.reject-startup-schema-mutation)

**Requirement:** Production and staging startup MUST NOT call `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

**Rationale:** Replica startup does not own hosted database schema change.

### Configure optimistic tokens (standards/rule/ext-efcore.configure-optimistic-tokens)

**Requirement:** An EF Core aggregate using concurrency MUST configure a provider-backed token and carry expected version through its Command.

**Rationale:** The token connects a caller's expected aggregate version to EF Core write detection.

### Map EF Core concurrency conflict (standards/rule/ext-efcore.map-ef-core-concurrency-conflict)

**Requirement:** An EF Core post-handler MUST translate `DbUpdateConcurrencyException` into the Application conflict contract.

**Rationale:** Application exposes a project-owned conflict rather than an EF Core exception type.

### Reject automatic command retry (standards/rule/ext-efcore.reject-automatic-command-retry)

**Requirement:** An EF Core post-handler MUST NOT retry the complete Command automatically after a concurrency exception.

**Rationale:** A retry can rerun Domain behavior against state that the caller did not approve.

## Conventions

### Use the EF Core Infrastructure layout (standards/rule/ext-efcore.use-the-ef-core-infrastructure-layout)

**Default:** Use `Infrastructure/Persistence/EfCore/` for `ApplicationDbContext`, factory, post-handler, configurations, migrations, and repositories.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:** `Infrastructure/Persistence/EfCore/Configurations/` holds entity mapping classes.

### Use snake-case relational names (standards/rule/ext-efcore.use-snake-case-relational-names)

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
| standards/rule/ext-efcore.record-ef-core-replacement-scope | inspection | EF Core decision records all required replacement and rollback fields. |
| standards/rule/ext-efcore.retain-unaffected-baseline-persistence | inspection | Nonselected aggregate paths retain baseline persistence documentation and code. |
| standards/rule/ext-efcore.use-one-write-provider | test | `EfCoreTransactionTests` stage aggregate work through one selected provider. |
| standards/rule/ext-efcore.reject-mixed-provider-writes | static | `EfCoreTransactionTests` asserts command handlers contain no mixed Marten and EF Core aggregate repository writes. |
| standards/rule/ext-efcore.record-provider-selection | inspection | Adoption decision records Command provider selection and architecture-test evidence. |
| standards/rule/ext-efcore.register-one-command-post-handler | test | `EfCoreTransactionTests` asserts command registration resolves only its selected provider post-handler. |
| standards/rule/ext-efcore.resolve-cross-provider-invariants | inspection | Cross-provider invariant review selects one provider or shared transaction evidence. |
| standards/rule/ext-efcore.stage-aggregate-writes-in-repositories | test | `EfCoreWriteTests` stage changes through scoped DbContext. |
| standards/rule/ext-efcore.exclude-direct-handler-commits | static | Command handlers contain no DbContext injection or `SaveChangesAsync` call. |
| standards/rule/ext-efcore.define-ef-core-query-roots | static | Application exposes one owned `IApplicationDbContext` query interface. |
| standards/rule/ext-efcore.implement-query-roots-in-infrastructure | static | `EfCoreReadTests` asserts infrastructure DbContext implements the owned query interface. |
| standards/rule/ext-efcore.retain-marten-query-boundary | static | Marten query handlers retain `IQuerySession`. |
| standards/rule/ext-efcore.project-ef-core-queries-directly | test | `EfCoreReadTests` use no tracking, authorized filters, deterministic limits, and projections. |
| standards/rule/ext-efcore.avoid-per-aggregate-read-stores | static | `EfCoreReadTests` asserts eF Core query source contains no per-aggregate read-store interface pattern. |
| standards/rule/ext-efcore.commit-ef-core-command-work-once | test | EF Core Command tests observe one post-handler `SaveChangesAsync` call. |
| standards/rule/ext-efcore.process-changed-aggregate-events | test | `EfCoreCommitTests` classify and stage Domain Events correctly. |
| standards/rule/ext-efcore.use-durable-outbox-delivery | static | `EfCoreCommitTests` asserts eF Core durable Commands commit no Marten session. |
| standards/rule/ext-efcore.stage-ef-core-outbox-records-together | test | `EfCoreOutboxTests` stage message and business work through one DbContext. |
| standards/rule/ext-efcore.commit-ef-core-outbox-records-once | test | `EfCoreOutboxTests` observe one commit for aggregate and message. |
| standards/rule/ext-efcore.reject-cross-provider-outbox-storage | static | `EfCoreOutboxTests` asserts eF Core Command source writes no required outbox record through Marten. |
| standards/rule/ext-efcore.configure-ef-core-mappings-in-infrastructure | static | `EfCoreMappingTests` asserts eF Core mappings use Infrastructure-owned configuration classes. |
| standards/rule/ext-efcore.configure-relational-details-explicitly | inspection | Mapping review records every declared relational configuration category. |
| standards/rule/ext-efcore.retain-domain-state-values | test | `EfCoreStateTests` retain the aggregate's one Domain state value. |
| standards/rule/ext-efcore.map-stable-relational-state-shape | static | `EfCoreStateTests` asserts domain source contains no relational lifecycle flags or duplicate nullable state values. |
| standards/rule/ext-efcore.use-direct-state-mapping-only-when-supported | test | `EfCoreStateTests` materialize, track, and round-trip every state case. |
| standards/rule/ext-efcore.map-unsupported-state-shapes-in-infrastructure | test | `EfCoreStateTests` map valid discriminator values to Domain states. |
| standards/rule/ext-efcore.review-new-persisted-states | inspection | New state review and integration fixture cover migration, mixed versions, and rollback. |
| standards/rule/ext-efcore.generate-migrations-for-schema-changes | static | `EfCoreMigrationsTests` asserts eF Core schema diffs include a generated migration. |
| standards/rule/ext-efcore.review-migration-effects | inspection | Migration review covers each declared storage and rollback effect. |
| standards/rule/ext-efcore.apply-migrations-as-release-work | operation | Release record applies migration before replica startup. |
| standards/rule/ext-efcore.keep-migration-files-together | static | `EfCoreMigrationsTests` asserts migration commit contains migration, snapshot, and reviewed SQL artifacts. |
| standards/rule/ext-efcore.test-migration-starting-states | test | `EfCoreMigrationsTests` run from empty and previous-release databases. |
| standards/rule/ext-efcore.reject-startup-schema-mutation | static | `EfCoreMigrationsTests` asserts production and staging startup source calls none of the prohibited schema APIs. |
| standards/rule/ext-efcore.configure-optimistic-tokens | test | `EfCoreConcurrencyTests` carry expected version and use configured EF Core token. |
| standards/rule/ext-efcore.map-ef-core-concurrency-conflict | test | `EfCoreConcurrencyTests` maps provider exception to Application contract. |
| standards/rule/ext-efcore.reject-automatic-command-retry | test | `EfCoreConcurrencyTests` proves no complete Command automatic retry. |
| standards/rule/ext-efcore.use-the-ef-core-infrastructure-layout | inspection | EF Core Infrastructure paths use the default layout or a local replacement. |
| standards/rule/ext-efcore.use-snake-case-relational-names | test | `EfCoreTests` asserts generated migrations contain verified snake-case database names. |
