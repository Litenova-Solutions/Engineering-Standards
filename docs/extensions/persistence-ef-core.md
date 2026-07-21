# EF Core Persistence

## Intent

This extension replaces Marten persistence for aggregates whose accepted requirements depend on relational navigation mapping, relational change tracking, or a provider Marten does not support.

## Activation

Enable `persistence-ef-core` only after a decision records the aggregate scope, relational requirement, migration effect, and reason the Marten baseline does not meet it.

Do not use Marten and EF Core for the same aggregate. For EF Core-owned aggregate paths, this extension replaces:

- `DEP.APPLICATION.001` for EF Core-owned query paths
- `ARCH.CQRS.001` for the baseline `IQuerySession` read boundary on EF Core-owned query paths
- `PERSIST.WRITE.001`
- `PERSIST.READ.001`
- `PERSIST.COMMIT.001`
- `PERSIST.EVENTS.001`
- `PERSIST.MAPPING.001`
- `PERSIST.SERIALIZATION.001`
- `PERSIST.EVOLUTION.001`
- `PERSIST.DOCUMENT.001`

When `outbox-worker` is also enabled for an EF Core-owned command, this extension replaces `EXT.OUTBOX.ATOMIC.001` for that command.

## Agent Summary {#agent-summary}

- Keep Domain repository interfaces and Infrastructure implementations.
- Give Application one narrow `IApplicationDbContext` query boundary.
- Use `AsNoTracking` and project query results.
- Commit once in the provider-specific LiteBus command post-handler.
- Register only the post-handler for the command's selected write provider.
- Keep every command and its outbox record on one write provider.
- Collect domain events from changed aggregates.
- Generate and review every migration.
- Apply migrations as a release step.

## Standards

### Record the persistence replacement (EXT.EFCORE.ADOPT.001)

The decision names affected aggregates, data migration, transaction requirements, query impact, package changes, and rollback plan. Unaffected aggregates retain the baseline persistence rules.

### Keep each command on one write provider (EXT.EFCORE.TRANSACTION.001)

Each command stages writes through either Marten-backed repositories or EF Core-backed repositories, never both. The adoption decision names how command ownership selects one provider-specific commit behavior and how an architecture test enforces that selection. Register only that provider's post-handler for the command; a Marten post-handler must not commit an EF Core-owned command.

If one accepted invariant requires atomic writes to aggregates assigned to different providers, move those aggregates to one provider or accept a decision that defines and verifies one shared transaction mechanism before implementation. Do not coordinate a local invariant through two independent commits.

### Keep writes behind repositories (EXT.EFCORE.WRITE.001)

Infrastructure repositories use a scoped `DbContext` and stage aggregate changes. Handlers do not inject DbContext or call `SaveChangesAsync`.

### Query through IApplicationDbContext (EXT.EFCORE.READ.001)

Application owns one public `IApplicationDbContext` exposing the generic set or named query roots required by EF Core-owned query handlers. Infrastructure implements it with the application DbContext. Marten-owned query paths retain the baseline `IQuerySession` boundary.

Query handlers use `AsNoTracking`, filter before materialization, apply deterministic ordering and limits, and project directly to result records. Do not add one read-store interface per aggregate.

### Commit through the LiteBus pipeline (EXT.EFCORE.COMMIT.001)

For an EF Core-owned Command, the provider-specific LiteBus post-handler calls `SaveChangesAsync` once. It collects Domain Events from changed Aggregates and follows the documented delivery classification. It uses the outbox extension for required durable delivery and does not commit a Marten session.

### Store an EF Core outbox with EF Core writes (EXT.EFCORE.OUTBOX.001)

When `outbox-worker` is active for an EF Core-owned Command, map and stage its outbox records through the same DbContext as the Aggregate changes or Workflow progress. Commit both through one `SaveChangesAsync` call. The Worker dispatch, idempotency, retry, compatibility, and operating rules from `outbox-worker` remain active.

Do not store an EF Core aggregate change in one transaction and its required outbox record through a Marten session in another transaction.

### Configure mappings explicitly (EXT.EFCORE.MAPPING.001)

Infrastructure owns `IEntityTypeConfiguration<T>` classes. Configure typed IDs, owned values, backing fields, indexes, constraints, precision, delete behavior, concurrency tokens, and database names explicitly.

### Preserve the Domain state hierarchy (EXT.EFCORE.STATE.001)

EF Core persistence retains the Domain Aggregate's single `{Aggregate}State` value. Infrastructure maps a stable discriminator and every state-specific value without adding a lifecycle enum, status string, boolean flag, or duplicate nullable state property to Domain.

Use direct owned or JSON mapping only when the pinned EF Core and provider versions can materialize, track, and round-trip every sealed state record. Otherwise, store an Infrastructure-owned persistence type with discriminator and state-specific columns, then map it to and from the Domain state hierarchy inside the repository.

The persistence model may contain relational discriminator columns. Those columns are Infrastructure details and do not become Domain properties. A new state requires a reviewed migration, mixed-version behavior, rollback behavior, and an integration fixture for each stored state.

### Treat migrations as reviewed artifacts (EXT.EFCORE.MIGRATIONS.001)

Generate a migration for every schema change. Review tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

Run migrations as a release step. WebApi replicas do not migrate the hosted database during startup.

Commit the migration, model snapshot, and reviewed SQL together. Apply from an empty database and from the previous release database. Production and staging startup MUST NOT call `EnsureCreated`, `EnsureDeleted`, or `Migrate`.

### Map optimistic concurrency explicitly (EXT.EFCORE.CONCURRENCY.001)

When `concurrency-idempotency` is active for an EF Core aggregate, configure a provider-backed concurrency token and carry the expected version through the command. The commit post-handler translates `DbUpdateConcurrencyException` into the Application conflict contract. It does not retry the complete command automatically.

## Conventions

Use:

```text
Infrastructure/
  Persistence/
    EfCore/
      ApplicationDbContext.cs
      DesignTimeDbContextFactory.cs
      SaveChangesCommandPostHandler.cs
      Configurations/
      Migrations/
      Repositories/
```

Use `snake_case` through the pinned naming conventions package and verify generated names in each migration.

## Examples

`PublishPost` may write a Marten-backed `Post`, while `RecordInvoicePayment` may write an EF Core-backed `Invoice`. One command cannot update both aggregates. When `RecordInvoicePayment` requires durable delivery, its `InvoicePaymentRecorded` outbox record is staged and committed through the invoice DbContext.

An EF Core-backed `Post` may use an Infrastructure `PostRow` with `state_type`, `published_at`, and `archived_at` columns. `PostRepository` maps one valid column combination to one `PostState` record. The Domain `Post` still exposes only `PostState` and carries no relational discriminator fields.

## Dependencies

- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `EFCore.NamingConventions`

## Verification

- Confirm EF Core-owned commands and queries do not inject Marten sessions or depend on Marten query abstractions. The application may retain Marten packages for unaffected aggregate paths.
- Apply migrations to PostgreSQL from an empty database and the previous release schema.
- Confirm production and staging processes never apply or create schemas during startup.
- Run command, query, concurrency, and API integration tests.
- Confirm each command resolves repositories and commit behavior for one write provider.
- Round-trip every Aggregate state record and reject unknown or invalid discriminator and value combinations.
- When `outbox-worker` is enabled, stop after the EF Core commit and verify the Worker later dispatches the atomically stored record.
- Review SQL and query plans for accepted queries.
- Run architecture tests for repository, context, and commit boundaries.
- Test rollback compatibility or the documented recovery plan.
- When concurrency is active, test two real DbContext instances updating the same aggregate.
