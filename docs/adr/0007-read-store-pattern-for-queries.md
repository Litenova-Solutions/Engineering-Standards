# 0007. Read Store Pattern for Queries

**Status:** Superseded by [ADR 0015](0015-idatabasecontext-over-per-aggregate-read-stores.md)

**Date:** 2025-01-01

## Context

This ADR documents the original per-aggregate read store pattern (`IXxxReadStore`). That pattern was superseded in favor of the `IDatabaseContext` approach documented in ADR 0015. The original pattern is preserved here for historical reference.

Query handlers need to retrieve data for display. There are several ways to implement this:

1. **Load the domain aggregate from the repository and map it to a DTO.** This is the most natural approach for engineers who think in terms of the domain model. However, aggregates are designed for consistency enforcement, not for reading. Loading a full `Order` aggregate to display a two-field summary in a list view loads far more data than necessary and runs far more SQL than needed.
2. **Inject the EF Core `DbContext` directly into the query handler.** This works but couples the application layer to the EF Core dependency. The `Application.Read` project must reference EF Core, which violates the spirit of Clean Architecture.
3. **Define an `IXxxReadStore` interface in the Contracts project and implement it in Infrastructure with a Select projection.** The query handler depends on the interface only. Infrastructure implements it with a Select query that retrieves exactly the fields the query result needs.

Option 3 keeps the `Application.Read` project free of any database dependency. The query handler is testable with a simple NSubstitute mock of the read store interface. The Infrastructure implementation can use EF Core, Dapper, or any other data access technology without the query handler knowing or caring.

## Decision

All query handlers MUST inject `IXxxReadStore` interfaces, not `IXxxRepository` interfaces and not `DbContext`. The `IXxxReadStore` interfaces are defined in `Application.Read.Contracts`. Infrastructure implements them using EF Core Select projections. See `docs/conventions/backend/07-query-read-strategy.md` for the full pattern.

## Consequences

### Positive

- Query handlers have no database dependency and are trivially unit-testable.
- Select projections retrieve only the columns needed, which is significantly more efficient than loading full aggregates.
- The read path can be optimized or replaced independently of the write path.
- Agents are explicitly prevented from loading aggregates in query handlers; the types are not available in the `Application.Read` project.

### Negative

- Every query requires defining an `IXxxReadStore` interface and an Infrastructure implementation, even for simple lookups.
- The read model and write model can diverge; keeping them consistent requires discipline.

### Risks

- Agents trained on generic .NET samples will inject `DbContext` or a repository into query handlers. This is a listed common agent mistake in `AGENTS.md` and must be caught in code review or by architecture tests.
