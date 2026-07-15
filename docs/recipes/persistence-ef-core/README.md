---
{
  "id": "recipe.persistence-ef-core",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure"],
  "recipes": ["persistence-ef-core"]
}
---
# EF Core Persistence

Enable this recipe when relational mapping needs outweigh the smaller Marten boundary. Do not enable both persistence models for the same aggregate.

## RECIPE.EFCORE.ADOPT.001 - Record the persistence replacement

Add `persistence-ef-core` to `standards.project.json` and record why Marten does not meet the current requirement. The recipe replaces the four Marten persistence rules named in `recipe.json`.

## RECIPE.EFCORE.BOUNDARY.001 - Keep writes behind repositories

Infrastructure repositories use a scoped `DbContext` and stage aggregate changes. Application query handlers use an Application-owned `IApplicationDbContext` with a generic `Set<TEntity>()` query surface. Application may reference EF Core for async query extensions.

Query handlers use `AsNoTracking()` and project to results. They do not inject aggregate repositories.

## RECIPE.EFCORE.COMMIT.001 - Commit through the LiteBus pipeline

The global command post-handler calls `SaveChangesAsync` once. Handlers and repositories do not commit. Domain events come from changed aggregates and follow the selected in-process or outbox behavior.

## RECIPE.EFCORE.MIGRATIONS.001 - Treat migrations as reviewed artifacts

Generate a migration for every schema change. Review table, column, index, foreign-key, and destructive operations before applying it. Run migrations as a deployment step rather than from each WebApi replica.

## RECIPE.EFCORE.GATES.001 - Test the replacement

The consumer persistence replacement must build without Marten packages, apply migrations to PostgreSQL, run command and query integration tests, and pass architecture tests.
