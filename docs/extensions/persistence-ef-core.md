# EF Core Persistence

## Intent

This extension replaces Marten persistence for aggregates whose accepted requirements depend on relational navigation mapping, relational change tracking, or a provider Marten does not support.

## Activation

Enable `persistence-ef-core` only after a decision records the aggregate scope, relational requirement, migration effect, and reason the Marten baseline does not meet it.

Do not use Marten and EF Core for the same aggregate. This extension replaces:

- `PERSIST.WRITE.001`
- `PERSIST.READ.001`
- `PERSIST.COMMIT.001`
- `PERSIST.EVENTS.001`

## Agent Summary {#agent-summary}

- Keep Domain repository interfaces and Infrastructure implementations.
- Give Application one narrow `IApplicationDbContext` query boundary.
- Use `AsNoTracking` and project query results.
- Commit once in the LiteBus command post-handler.
- Collect domain events from changed aggregates.
- Generate and review every migration.
- Apply migrations as a release step.

## Standards

### Record the persistence replacement (EXT.EFCORE.ADOPT.001)

The decision names affected aggregates, data migration, transaction requirements, query impact, package changes, and rollback plan. Unaffected aggregates retain the baseline persistence rules.

### Keep writes behind repositories (EXT.EFCORE.WRITE.001)

Infrastructure repositories use a scoped `DbContext` and stage aggregate changes. Handlers do not inject DbContext or call `SaveChangesAsync`.

### Query through IApplicationDbContext (EXT.EFCORE.READ.001)

Application owns one public `IApplicationDbContext` exposing the generic set or named query roots required by query handlers. Infrastructure implements it with the application DbContext.

Query handlers use `AsNoTracking`, filter before materialization, apply deterministic ordering and limits, and project directly to result records. Do not add one read-store interface per aggregate.

### Commit through the LiteBus pipeline (EXT.EFCORE.COMMIT.001)

The global command post-handler calls `SaveChangesAsync` once. It collects domain events from changed aggregates and follows best-effort post-commit publication or the outbox extension.

### Configure mappings explicitly (EXT.EFCORE.MAPPING.001)

Infrastructure owns `IEntityTypeConfiguration<T>` classes. Configure typed IDs, owned values, backing fields, indexes, constraints, precision, delete behavior, concurrency tokens, and database names explicitly.

### Treat migrations as reviewed artifacts (EXT.EFCORE.MIGRATIONS.001)

Generate a migration for every schema change. Review tables, columns, indexes, constraints, data movement, destructive operations, and rollback compatibility.

Run migrations as a release step. WebApi replicas do not migrate the hosted database during startup.

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

## Dependencies

- `Microsoft.EntityFrameworkCore`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `EFCore.NamingConventions`

## Verification

- Build without Marten packages for replaced aggregate paths.
- Apply migrations to PostgreSQL from an empty database and the previous release schema.
- Run command, query, concurrency, and API integration tests.
- Review SQL and query plans for accepted queries.
- Run architecture tests for repository, context, and commit boundaries.
- Test rollback compatibility or the documented recovery plan.
