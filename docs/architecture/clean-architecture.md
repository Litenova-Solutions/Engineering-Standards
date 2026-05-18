# Clean Architecture

This document explains how Clean Architecture is applied across all Litenova Solutions projects. Every project follows this structure regardless of domain complexity.

---

## Layer Diagram

```
         ┌─────────────────────────────────────────┐
         │                  WebApi                  │
         │   Endpoints · Request/Response Models    │
         │   ApiMappings · GlobalExceptionHandler   │
         └──────────────────┬──────────────────────┘
                            │ depends on
         ┌──────────────────▼──────────────────────┐
         │               Application                │
         │   Handlers · Validators · Read Stores    │
         │   Application Models · Mapping Exts      │
         └──────────────────┬──────────────────────┘
                            │ depends on
         ┌──────────────────▼──────────────────────┐
         │                 Domain                   │
         │   Aggregates · Value Objects · Events    │
         │   Repository Interfaces · Exceptions     │
         └─────────────────────────────────────────┘
                            ▲
         ┌──────────────────┴──────────────────────┐
         │             Infrastructure               │
         │   EF Core · Repositories · Read Stores  │
         │   External Clients · Migrations          │
         └─────────────────────────────────────────┘
```

Dependencies flow inward only. Infrastructure sits outside the main ring and implements the interfaces defined by Domain and Application. WebApi depends on Application; it may reference Infrastructure only in `Program.cs` for DI registration.

---

## Layer Responsibilities

### Domain

The Domain layer contains the core business model. It has zero dependencies on any other project in the solution and zero dependencies on any external framework.

**Contains:**
- Aggregate roots and their child entities
- Value objects
- Domain events
- Domain exceptions (`DomainException` subclasses, `AggregateNotFoundException` subclasses)
- Repository interfaces (`IPostRepository`, `ICustomerRepository`, etc.)
- Strongly-typed IDs (`PostId`, `CustomerId`, etc.)

**Forbidden:**
- Any reference to `Microsoft.EntityFrameworkCore`
- Any reference to `Microsoft.AspNetCore.*`
- Application models, DTOs, or read projection types
- Infrastructure concerns: connection strings, HTTP clients, file paths

### Application

The Application layer orchestrates use cases. It depends on Domain interfaces and defines its own interfaces for external dependencies (read stores, external service contracts). It contains no business rules.

**Contains:**
- Command handlers (`ICommandHandler<TCommand>`, `ICommandHandler<TCommand, TResult>`)
- Query handlers (`IQueryHandler<TQuery, TResult>`)
- Command and query validators (`ICommandValidator<TCommand>`, `IQueryValidator<TQuery>`)
- Read store interfaces (`IPostReadStore`, `ICustomerReadStore`, etc.)
- Application result records and projection types
- Mapping extensions for translating between application models and domain input

**Forbidden:**
- Any reference to `Microsoft.EntityFrameworkCore` (no `DbContext`, no `DbSet<T>`)
- Any reference to `Microsoft.AspNetCore.*`
- Business rule enforcement (invariants belong in Domain)
- Loading full domain aggregates in query handlers — use read stores

### Infrastructure

The Infrastructure layer adapts external systems to the interfaces defined by Domain and Application. It contains all database and I/O concerns.

**Contains:**
- EF Core `DbContext` implementation
- `IEntityTypeConfiguration<T>` classes for all aggregates
- `IXxxRepository` implementations
- `IXxxReadStore` implementations (using EF Core `Select` projections)
- External service clients (email, payment providers, blob storage, etc.)
- EF Core migrations
- DI registration extension methods

**Forbidden:**
- Business logic or domain rule enforcement of any kind
- Knowledge of HTTP context or request lifecycle
- References to `Microsoft.AspNetCore.*` except for DI types (`IServiceCollection`, etc.)

### WebApi

The WebApi layer is the HTTP adapter. Its only job is to translate HTTP into application commands and queries, and translate results back into HTTP responses.

**Contains:**
- `IEndpoint` implementations (one class per use case)
- Request and response record types
- `ApiMappings` extension classes for translating between HTTP models and application models
- `GlobalExceptionHandler` middleware
- OpenAPI/Swagger configuration

**Forbidden:**
- Business logic of any kind
- Direct access to repositories, read stores, or the `DbContext`
- `try-catch` blocks (exception handling is centralized in `GlobalExceptionHandler`)
- Domain types in response models (always map to dedicated response records)

---

## Dependency Rule

Dependencies only point inward. No inner layer may reference an outer layer at any time.

| Layer | May Reference |
|---|---|
| Domain | Nothing (no project references) |
| Application | Domain |
| Infrastructure | Domain, Application |
| WebApi | Application (and Infrastructure only in `Program.cs` for DI registration) |

If you are about to add a project reference that goes in the wrong direction, stop. Extract an interface in the inner layer and implement it in the outer layer instead.

---

## CQRS Split

Commands and queries are handled by separate classes. This is not purely organizational — it enforces a hard split between the read path and the write path.

**Commands** modify state. A command handler:
1. Validates input (via a separate validator that runs before the handler).
2. Loads the aggregate from its repository.
3. Calls a method on the aggregate that enforces the business rule.
4. Saves the aggregate back via the repository.
5. Returns void or a simple creation result (e.g., the new ID).

**Queries** return data. A query handler:
1. Validates input (via a separate validator).
2. Injects an `IXxxReadStore` interface.
3. Calls a projection method on the read store.
4. Returns the projection result or throws `AggregateNotFoundException` if not found.

Query handlers MUST NOT load domain aggregates. This is not a suggestion. It is a hard rule enforced by code review. See `docs/conventions/backend/07-query-read-strategy.md` for the full explanation and options.

This split enables:
- **Independent optimization:** Read projections can be tuned (indexed views, read replicas, in-memory caching) without touching any domain logic.
- **Reduced coupling:** Query performance is not coupled to aggregate complexity.
- **Clear intent:** A class named `GetPostByIdQueryHandler` tells you it fetches data without side effects.

---

## LiteBus as Mediator

LiteBus is the mediator used to dispatch commands and queries throughout the solution. Endpoints call `liteBus.SendAsync(command, cancellationToken)` or `liteBus.QueryAsync(query, cancellationToken)` — they do not call handlers directly.

**Why a mediator?**
- Endpoints remain thin. They translate HTTP to a command/query object and hand off immediately.
- Handlers are independently testable with no HTTP context required.
- Cross-cutting pipeline behaviors (logging, validation, performance tracing) can be wired once into the pipeline without modifying every handler.

**Interfaces provided by LiteBus:**

| Interface | Used For |
|---|---|
| `ICommandHandler<TCommand>` | Command with no return value |
| `ICommandHandler<TCommand, TResult>` | Command that returns a result (e.g., a new ID) |
| `IQueryHandler<TQuery, TResult>` | Query that returns a result |
| `ICommandValidator<TCommand>` | Validator that runs before a command handler |
| `IQueryValidator<TQuery>` | Validator that runs before a query handler |
| `ILiteBus` | Injected into endpoints to dispatch commands and queries |
