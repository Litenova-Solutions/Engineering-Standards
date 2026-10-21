# EF Core Persistence

## Intent

This extension gives selected aggregates relational storage through Entity Framework Core. An aggregate is one business record that changes in one step, and the selected ones need relational navigation, change tracking, or provider behavior that the Marten document-storage baseline cannot satisfy. It states the Entity Framework Core form of the read, query, mapping, migration, and commit rules for those aggregates. Teams use it after a recorded decision names the scope and the baseline gap, so the selected aggregates get relational storage while every other aggregate keeps the baseline; it applies per aggregate path, never to the whole backend at once.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `use-case`.

The consumer enables `efcore` only after a decision records aggregate scope, relational requirement, data evolution effect, and the Marten baseline gap. Without that record, relational storage spreads by habit instead of by need.

## Baseline relationship

For Entity Framework Core-owned aggregate paths, this extension replaces:

- `litespec/backend/dotnet/persistence#query-through-iquerysession`: EF Core queries use `IApplicationDbContext`.
- `litespec/backend/persistence#keep-mappings-and-aliases-explicit`: EF Core mappings use `IEntityTypeConfiguration<T>` classes.
- `litespec/backend/dotnet/packages#keep-application-dependencies-narrow`: Application references the Entity Framework Core query surface its query interface needs.
- `litespec/backend/architecture#separate-command-and-query-behavior`: it replaces only the read half, and the invariant half still binds.

For an EF Core-owned command with durable delivery, this extension also replaces:

- `litespec/ext/outbox#stage-messages-with-business-work`
- `litespec/ext/outbox#reject-independent-outbox-commits`

Every other baseline provision binds EF Core-owned paths unchanged.

This extension switches on no optional record type.

## Standards

### Record EF Core replacement scope

**Requirement:** An EF Core adoption decision MUST name affected aggregates, data evolution, transaction requirements, query impact, package changes, and rollback plan.

**Rationale:** EF Core replaces the provider, the transaction boundary, the query surface, and the migration story for its aggregates. A decision that names aggregates, data evolution, transaction requirements, query impact, package changes, and rollback plan lets review judge the whole replacement; without it, each part is decided separately and they disagree.

### Retain unaffected baseline persistence

**Requirement:** An unaffected aggregate MUST retain baseline persistence rules.

**Rationale:** The extension activates per aggregate path, so aggregates outside its scope keep Marten behavior, Marten queries, and Marten commits. Letting EF Core conventions leak onto those paths leaves two providers over one aggregate with no owner.

### Use one write provider

**Requirement:** An EF Core-owned Command MUST stage aggregate writes through exactly one selected write provider.

**Rationale:** A command that stages writes through one provider commits them in one atomic boundary. Without that, part of the business work can persist while the rest fails.

### Reject mixed provider writes

**Requirement:** A Command MUST NOT stage aggregate writes through both Marten-backed and EF Core-backed repositories.

**Rationale:** Marten and EF Core commit independently, so a command writing through both can persist one half and lose the other. No transaction spans the two, so one local invariant cannot survive a mixed write.

### Record provider selection

**Requirement:** An EF Core adoption decision MUST name Command provider selection and its architecture-test evidence.

**Rationale:** Each command path has exactly one owner, and the decision names it with the architecture-test evidence that proves it. Without that record, a later change moves a repository to the other provider and review cannot tell the boundary moved.

### Register one Command post-handler

**Requirement:** An EF Core-owned Command MUST register only its selected provider's LiteBus post-handler.

**Rationale:** The post-handler owns the command's one commit, and each provider's handler commits only its own session. Registering the wrong handler, or both, leaves the staged work uncommitted or commits the wrong session.

### Resolve cross-provider invariants

**Requirement:** An accepted atomic cross-provider invariant MUST move its aggregates to one provider or use a reviewed shared transaction mechanism.

**Rationale:** An invariant spanning a Marten aggregate and an EF Core aggregate has no atomic boundary until both sit on one provider or share a reviewed transaction mechanism. Accepting the invariant without either leaves a rule the storage cannot enforce.

### Stage aggregate writes in repositories

**Requirement:** An EF Core Infrastructure repository MUST use its scoped `DbContext` to stage aggregate changes.

**Rationale:** Handlers coordinate; repositories stage. When the repository stages changes through its scoped `DbContext`, no handler names a provider type and the commit stays in the post-handler.

### Exclude direct handler commits

**Requirement:** An EF Core Command handler MUST NOT inject `DbContext` or call `SaveChangesAsync`.

**Rationale:** A handler that injects `DbContext` or calls `SaveChangesAsync` commits mid-pipeline, before validation, authorization, or later stages finish. The selected post-handler owns the one commit, after the whole pipeline succeeds.

### Define EF Core query roots

**Requirement:** Application MUST own one public `IApplicationDbContext` exposing required generic sets or named query roots, referencing only the Entity Framework Core abstractions that interface needs.

**Rationale:** Queries need an EF Core surface in Application, but exposing the Infrastructure `DbContext` would hand handlers the whole provider. One public `IApplicationDbContext` exposes only the required sets or named roots, and the permitted surface is those query types plus the manifest-pinned abstractions that declare them.

### Implement query roots in Infrastructure

**Requirement:** Infrastructure MUST implement `IApplicationDbContext` with the application `DbContext`.

**Rationale:** The application `DbContext` implements the owned interface, so provider configuration, connection handling, and mapping stay in Infrastructure while Application programs against the interface.

### Retain Marten query boundary

**Requirement:** A Marten-owned query path MUST retain the baseline `IQuerySession` boundary.

**Rationale:** Marten-backed aggregates keep their `IQuerySession` boundary, so their queries neither gain an EF Core dependency nor lose the session they were written against.

### Project EF Core queries directly

**Requirement:** An EF Core query handler MUST use `AsNoTracking`, filter before materialization, order and limit deterministically, and project records.

**Rationale:** `AsNoTracking` with filtering, deterministic order and limit before materialization returns shaped records without loading mutable aggregate state. Tracking, unfiltered loads, or nondeterministic paging waste work and return unstable pages. A read projection never feeds an invariant, because it may already be stale.

### Avoid per-aggregate read stores

**Requirement:** An EF Core query implementation MUST NOT add one read-store interface per aggregate.

**Rationale:** One read-store interface per aggregate rebuilds a repository layer the context already provides, and each new aggregate adds another interface to maintain. `IApplicationDbContext` is the one query boundary.

### Resolve the tenant at context creation

**Requirement:** An EF Core `DbContext` MUST resolve the tenant when the context is created and apply the tenant filter to tenant-owned sets.

**Rationale:** Resolving the tenant when the context is created applies the filter to every tenant-owned set by convention. A tenant passed per query is a parameter every new query can forget, leaking rows across tenants.

### Commit EF Core Command work once

**Requirement:** An EF Core LiteBus post-handler MUST call `SaveChangesAsync` once for its owned Command.

**Rationale:** One `SaveChangesAsync` call per owned command keeps the provider transaction boundary intact. Two calls split one command across two transactions, so the second can fail after the first commits.

### Process changed aggregate events

**Requirement:** An EF Core post-handler MUST collect Domain events from changed aggregates and follow their documented delivery classification.

**Rationale:** The post-handler collects domain events from the aggregates it changed and routes each by its documented delivery classification. Collecting from anywhere else drops events or delivers facts the commit never stored.

### Use durable outbox delivery

**Requirement:** An EF Core Command requiring durable delivery MUST use the outbox extension without committing a Marten session.

**Rationale:** A command needing durable delivery stages its outbox record through EF Core, so business work and the record commit atomically. Committing a Marten session instead splits the two across providers.

### Stage EF Core outbox records together

**Requirement:** An EF Core-owned Command MUST map and stage outbox records with aggregate changes through the same `DbContext`.

**Rationale:** Mapping and staging the outbox record through the same `DbContext` puts it in the command's transaction. Staging it anywhere else publishes facts the business commit never stored, or stores work no message ever delivers.

### Reject cross-provider outbox storage

**Requirement:** An EF Core-owned Command MUST NOT store its required outbox record through a Marten session.

**Rationale:** A Marten session commits independently of the EF Core transaction, so an outbox record stored through Marten can persist while the aggregate change rolls back, or the reverse. The record travels with the work it describes.

### Configure EF Core mappings in Infrastructure

**Requirement:** Infrastructure MUST own `IEntityTypeConfiguration<T>` classes for EF Core persistence mappings.

**Rationale:** Entity configurations name tables, columns, and provider behavior, so they live with the provider in Infrastructure. Anywhere else, Application or Domain would name relational details they must not know.

### Configure relational details explicitly

**Requirement:** An EF Core mapping MUST explicitly configure typed IDs, owned values, fields, indexes, constraints, precision, deletes, concurrency tokens, and database names.

**Rationale:** Conventions silently pick names, precisions, and delete behavior, and a provider upgrade can change the silence. Explicit configuration for typed IDs, owned values, fields, indexes, constraints, precision, deletes, concurrency tokens, and database names puts every storage choice in review and in migrations.

### Retain Domain state values

**Requirement:** EF Core persistence MUST retain the Domain aggregate's single `{Aggregate}State` value.

**Rationale:** The aggregate owns its lifecycle state and state-specific facts, and relational storage records them without reshaping them. An enumerated integer column would discard the facts each state record carries and reintroduce the shape the closed-set rule removes.

A relational column holds the active state record and its discriminator, which is the same contract the baseline provider stores in its document. The column never holds an enumerated integer, because that discards the state-specific facts the record carries and reintroduces the shape `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` removes. A state case with its own fields maps to an owned type or to its own table. The discriminator selects which one a read materializes.

### Map stable relational state shape

**Requirement:** Infrastructure MUST map a stable discriminator and every state-specific value without adding Domain lifecycle flags or duplicate nullable state properties.

**Rationale:** Columns and owned types store each state's values while Domain keeps its record hierarchy. New lifecycle flags or duplicate nullable state properties in Domain would create a second lifecycle that disagrees with the first, so the mapping adds none.

### Use direct state mapping only when supported

**Requirement:** An EF Core mapping MAY use direct owned or JSON state mapping only when pinned versions materialize, track, and round-trip each state record.

**Rationale:** Owned or JSON mapping of state records works only when the pinned provider versions materialize, track, and round-trip every sealed case. Without that proof, reads silently drop cases or return stale state.

### Map unsupported state shapes in Infrastructure

**Requirement:** An unsupported direct state mapping MUST use an Infrastructure persistence type with discriminator and state-specific columns.

**Rationale:** When direct mapping is unsupported, an Infrastructure persistence type with a discriminator and state-specific columns stores the state, and the repository maps it to and from the Domain hierarchy. Domain stays free of the storage shape.

### Review new persisted states

**Requirement:** A new persisted state MUST include reviewed migration, mixed-version behavior, rollback behavior, and an integration fixture.

**Rationale:** A new state value lands in stored rows that older application versions still read. Reviewing the migration, mixed-version behavior, rollback behavior, and an integration fixture keeps the rollout and the rollback safe.

**Example:** `PostRow` maps `state_type`, `published_at`, and `archived_at` to one `PostState` record.

### Generate migrations for schema changes

**Requirement:** An EF Core schema change MUST generate a migration.

**Rationale:** A schema change without a migration reaches the database by hand or by drift, with no review and no record. The generated migration is the explicit, reviewed description of the evolution.

### Review migration effects

**Requirement:** A migration review MUST cover tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

**Rationale:** Tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility each decide whether a deploy is safe and whether the data survives it. Reviewing all of them catches the destructive step before it runs in production.

### Apply migrations as release work

**Requirement:** A release process MUST apply EF Core migrations before application startup.

**Rationale:** Migrations applied as release work run in a controlled order with evidence, before the new code starts. Startup-owned execution races replicas against each other and against the old version.

### Keep migration files together

**Requirement:** An EF Core schema change MUST commit migration, model snapshot, and reviewed SQL together.

**Rationale:** The migration, the model snapshot, and the reviewed SQL committed together show the intended change and its exact relational effect. Any one alone leaves review guessing what the database will do.

### Test migration starting states

**Requirement:** An EF Core migration MUST apply successfully from an empty database and previous release database.

**Rationale:** A migration applies to a fresh database and to the previous release's database, because setup and upgrade are the two paths that run in production.

The previous release database is the schema of the last released artifact, not the schema of the previous commit. The test builds it by applying that artifact's migrations to an empty database, then applies the current ones on top. A test that starts from the current migrations minus one proves that the last migration applies, which is the case least likely to be broken.

### Reject startup schema mutation

**Requirement:** Production and staging startup MUST NOT call `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

**Rationale:** Every replica runs startup, so a startup that mutates the schema races its siblings and applies schema work with no ordering or evidence. Production and staging startup own none of `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

### Configure optimistic tokens

**Requirement:** An EF Core aggregate using concurrency MUST configure a provider-backed token and carry expected version through its Command.

**Rationale:** The provider-backed token carries the caller's expected version into the write, so EF Core detects a concurrent change instead of silently overwriting it. Without the token, the last writer wins and the first writer's work vanishes.

### Map EF Core concurrency conflict

**Requirement:** An EF Core post-handler MUST translate `DbUpdateConcurrencyException` into the Application conflict contract.

**Rationale:** A `DbUpdateConcurrencyException` names a provider type that Application never exposes. Translating it into the project-owned conflict contract keeps the failure transport-neutral and lets the error boundary map it like any other conflict.

### Reject automatic command retry

**Requirement:** An EF Core post-handler MUST NOT retry the complete Command automatically after a concurrency exception.

**Rationale:** After a concurrency conflict, the state changed under the caller. Retrying the whole command reruns business behavior against state the caller never saw or approved, so the post-handler reports the conflict and lets the caller reread and decide.

## Conventions

### Use the EF Core Infrastructure layout

**Default:** Use `Infrastructure/Persistence/EfCore/` for `ApplicationDbContext`, factory, post-handler, configurations, migrations, and repositories.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Example:** `Infrastructure/Persistence/EfCore/Configurations/` holds persistence mapping classes.

### Use snake-case relational names

**Default:** Use the pinned naming-conventions package and verify generated names in each migration, with casing owned by `litespec/backend/persistence#use-database-naming-conventions`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** The pinned naming-conventions package generates the names, and verifying each migration shows the exact names that reach the database. Casing itself is owned by `litespec/backend/persistence#use-database-naming-conventions`.

## Dependencies

- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `EFCore.NamingConventions`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/ext/efcore#record-ef-core-replacement-scope | guidance | Does the decision name aggregates, evolution, transactions, queries, packages, and rollback? |
| litespec/backend/dotnet/ext/efcore#retain-unaffected-baseline-persistence | guidance | Does every unaffected aggregate path retain its baseline persistence behavior? |
| litespec/backend/dotnet/ext/efcore#use-one-write-provider | checkable | `EfCoreTransactionTests` stage aggregate work through one selected provider. |
| litespec/backend/dotnet/ext/efcore#reject-mixed-provider-writes | checkable | `EfCoreTransactionTests` assert no mixed Marten and EF Core aggregate repository writes. |
| litespec/backend/dotnet/ext/efcore#record-provider-selection | guidance | Does the decision name each Command path's provider and its test evidence? |
| litespec/backend/dotnet/ext/efcore#register-one-command-post-handler | checkable | `EfCoreTransactionTests` assert each command resolves only its selected provider post-handler. |
| litespec/backend/dotnet/ext/efcore#resolve-cross-provider-invariants | guidance | Does each cross-provider invariant use one provider or a reviewed shared transaction? |
| litespec/backend/dotnet/ext/efcore#stage-aggregate-writes-in-repositories | checkable | `EfCoreWriteTests` stage changes through the scoped `DbContext`. |
| litespec/backend/dotnet/ext/efcore#exclude-direct-handler-commits | checkable | `EfCoreWriteTests` assert handlers inject no `DbContext` and call no `SaveChangesAsync`. |
| litespec/backend/dotnet/ext/efcore#define-ef-core-query-roots | checkable | `EfCoreReadTests` assert one owned `IApplicationDbContext` and no wider EF surface. |
| litespec/backend/dotnet/ext/efcore#implement-query-roots-in-infrastructure | checkable | `EfCoreReadTests` assert the Infrastructure `DbContext` implements the owned query interface. |
| litespec/backend/dotnet/ext/efcore#retain-marten-query-boundary | checkable | `EfCoreReadTests` assert Marten query handlers retain `IQuerySession`. |
| litespec/backend/dotnet/ext/efcore#project-ef-core-queries-directly | checkable | `EfCoreReadTests` assert no tracking, authorized filters, deterministic limits, projections, and no invariant from a projection. |
| litespec/backend/dotnet/ext/efcore#avoid-per-aggregate-read-stores | checkable | `EfCoreReadTests` assert no per-aggregate read-store interface pattern exists. |
| litespec/backend/dotnet/ext/efcore#resolve-the-tenant-at-context-creation | checkable | `EfCoreReadTests` assert tenant resolution at creation and tenant filters on owned sets. |
| litespec/backend/dotnet/ext/efcore#commit-ef-core-command-work-once | checkable | `EfCoreCommitTests` observe one post-handler `SaveChangesAsync` call per owned Command. |
| litespec/backend/dotnet/ext/efcore#process-changed-aggregate-events | checkable | `EfCoreCommitTests` classify and stage Domain events correctly. |
| litespec/backend/dotnet/ext/efcore#use-durable-outbox-delivery | checkable | `EfCoreCommitTests` assert EF Core durable Commands commit no Marten session. |
| litespec/backend/dotnet/ext/efcore#stage-ef-core-outbox-records-together | checkable | `EfCoreOutboxTests` stage message and business work through one `DbContext`. |
| litespec/backend/dotnet/ext/efcore#reject-cross-provider-outbox-storage | checkable | `EfCoreOutboxTests` assert EF Core Commands write no outbox record through Marten. |
| litespec/backend/dotnet/ext/efcore#configure-ef-core-mappings-in-infrastructure | checkable | `EfCoreMappingTests` assert EF Core mappings use Infrastructure-owned configuration classes. |
| litespec/backend/dotnet/ext/efcore#configure-relational-details-explicitly | guidance | Does the mapping review record every declared relational configuration category? |
| litespec/backend/dotnet/ext/efcore#retain-domain-state-values | checkable | `EfCoreStateTests` retain the aggregate's one Domain state value. |
| litespec/backend/dotnet/ext/efcore#map-stable-relational-state-shape | checkable | `EfCoreStateTests` assert no relational lifecycle flags or duplicate nullable state values. |
| litespec/backend/dotnet/ext/efcore#use-direct-state-mapping-only-when-supported | checkable | `EfCoreStateTests` materialize, track, and round-trip every state case. |
| litespec/backend/dotnet/ext/efcore#map-unsupported-state-shapes-in-infrastructure | checkable | `EfCoreStateTests` map valid discriminator values to Domain states. |
| litespec/backend/dotnet/ext/efcore#review-new-persisted-states | guidance | Does the new state review cover migration, mixed versions, rollback, and a fixture? |
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
