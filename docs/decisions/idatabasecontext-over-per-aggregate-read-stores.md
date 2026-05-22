# IDatabaseContext Over Per-Aggregate Read Store Interfaces

**Status:** Accepted

**Date:** 2026-01-01

**Canonical rules:** `docs/conventions/backend/07-query-read-strategy.md`

## Context

A common alternative is a separate `IXxxReadStore` interface per aggregate (for example, `IPostReadStore`, `IOrderReadStore`). Each interface lives in `Application.Read.Contracts` with an Infrastructure implementation. Query handlers inject the specific read store interface.

That approach produces three files per aggregate on the read side: the interface, the implementation, and the handler. For a system with ten aggregates and thirty queries, that means thirty additional interface and implementation files that contain only EF Core projection code with no business logic.

The alternatives evaluated were:

1. Per-aggregate read store interfaces. Maximum abstraction, maximum files.
2. Inject `AppDbContext` directly into query handlers. Minimum abstraction; violates the dependency rule because `Application.Read` would reference Infrastructure.
3. Define a single `IDatabaseContext` interface in `Application.Read.Contracts` exposing `IQueryable<T>` properties for each aggregate. Infrastructure's `AppDbContext` implements it. Query handlers inject `IDatabaseContext`.

Option 3 preserves the dependency boundary while eliminating per-aggregate boilerplate. Query handlers write LINQ projections directly against `IDatabaseContext` properties, which is functionally identical to writing against `DbSet<T>` properties. The cost is that `Application.Read` references `Microsoft.EntityFrameworkCore` for LINQ extension methods (`FirstOrDefaultAsync`, `ToListAsync`, etc.). This is an accepted trade-off.

## Decision

A single `IDatabaseContext` interface in `Application.Read.Contracts/Shared/` is the read-side data access contract. `AppDbContext` in Infrastructure implements `IDatabaseContext`. Query handlers inject `IDatabaseContext`. Per-aggregate `IXxxReadStore` interfaces MUST NOT be added.

## Consequences

### Positive

- Eliminates one interface and one implementation class per aggregate on the read side.
- Query handlers write direct LINQ projections with no indirection.
- `Application.Read` still does not reference the Infrastructure project directly.
- Adding a new aggregate requires only adding one property to `IDatabaseContext` and implementing it on `AppDbContext`.

### Negative

- `Application.Read` references `Microsoft.EntityFrameworkCore` for LINQ extension methods. This is an EF Core dependency in the Application layer.
- Query handlers are no longer testable by mocking a read store interface. Fast handler tests use EF Core with SQLite in-process mode, and integration tests cover PostgreSQL behavior through Testcontainers.

### Risks

- If the team later switches from EF Core to a different ORM, query handlers must be rewritten. With per-aggregate read stores, only the implementation class changes. This risk is accepted because ORM switches are rare and the productivity gain is immediate.