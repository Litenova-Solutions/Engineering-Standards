# Litenova Solutions — Engineering Standards

This file is the canonical agent context for all Litenova Solutions projects. Read it before touching any code.

## Read Order

1. Read this file (`AGENTS.md`) in full.
2. Read `docs/architecture/clean-architecture.md`.
3. Read the convention file for the specific layer you are about to edit (see index below).

## Tech Stack

| Technology | Version / Notes |
|---|---|
| .NET | 9 |
| ASP.NET Core | 9 — Minimal APIs only. No MVC controllers. |
| EF Core | 9 |
| LiteBus | Latest — mediator for commands and queries |
| Ardalis.GuardClauses | Latest — guard clause helpers |
| PostgreSQL | Primary database |
| Next.js | 15 — App Router only |

## Project Map

| Folder | Responsibility |
|---|---|
| `Domain` | Aggregates, value objects, domain events, domain exceptions, repository interfaces, strongly-typed IDs. |
| `Application` | Command/query handlers, validators, read store interfaces, application models, mapping extensions. |
| `Infrastructure` | EF Core DbContext, repository and read store implementations, external service clients. |
| `WebApi` | IEndpoint implementations, request/response models, API mapping extensions. |

## Non-Negotiable Rules

- MUST read the layer convention file before editing any file in that layer.
- MUST use `IEndpoint` implementations for all HTTP endpoints. Never use MVC controllers or inherit from `ControllerBase`.
- MUST use `IReadStore` interfaces in query handlers. Never load a full aggregate for a read operation.
- MUST throw the correct exception subclass per `docs/conventions/backend/06-exception-hierarchy.md`.
- MUST NOT use `InvalidOperationException`, `ArgumentException`, or `ArgumentNullException` in domain or application code.
- MUST NOT add a NuGet package without a corresponding ADR entry in `docs/adr/`.
- MUST run `dotnet build` and `dotnet test` before marking any task complete.

## Common Agent Mistakes

- Injecting `IPostRepository` into a query handler instead of `IPostReadStore`.
- Putting mapping logic inside the endpoint handler method instead of the `ApiMappings` class.
- Creating a `[ApiController]` class instead of an `IEndpoint` implementation.
- Placing a shared type in `Shared/` before the Strike 2 promotion rule is triggered.
- Throwing `ArgumentException` from a validator instead of an `ApplicationValidationException` subclass.
- Forgetting to propagate `CancellationToken` through all `async` method calls.

## Convention File Index

| Layer | Convention File |
|---|---|
| Architecture | `docs/architecture/clean-architecture.md` |
| Principles | `docs/conventions/00-principles.md` |
| Solution Structure | `docs/conventions/backend/01-solution-structure.md` |
| Domain | `docs/conventions/backend/02-domain-layer.md` |
| Application | `docs/conventions/backend/03-application-layer.md` |
| Infrastructure | `docs/conventions/backend/04-infrastructure-layer.md` |
| WebApi | `docs/conventions/backend/05-api-layer.md` |
| Exceptions | `docs/conventions/backend/06-exception-hierarchy.md` |
| Query/Read Strategy | `docs/conventions/backend/07-query-read-strategy.md` |
| Testing | `docs/conventions/backend/08-testing.md` |
| Naming | `docs/conventions/shared/naming.md` |
| Git Workflow | `docs/conventions/shared/git-workflow.md` |
| Security | `docs/conventions/shared/security.md` |

## Commands

```bash
# Build
dotnet build src/{ProjectName}.sln

# Test
dotnet test tests/{ProjectName}.sln

# Run
dotnet run --project src/{ProjectName}.WebApi

# Add migration
dotnet ef migrations add {MigrationName} \
  --project src/{ProjectName}.Infrastructure \
  --startup-project src/{ProjectName}.WebApi

# Apply migration
dotnet ef database update \
  --project src/{ProjectName}.Infrastructure \
  --startup-project src/{ProjectName}.WebApi
```
