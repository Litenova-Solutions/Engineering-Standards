# Engineering Standards — Agent Context

This file is the canonical behavioral contract for all AI agents and engineers working on projects that follow these standards. Read it before touching any code.

## Read Order

1. Read this file in full.
2. Read `docs/architecture/clean-architecture.md`.
3. Read the convention file for the layer you are about to edit (see index below).
4. If the task involves exceptions: also read `docs/conventions/backend/06-exception-hierarchy.md`.
5. If the task involves query handlers: also read `docs/conventions/backend/07-query-read-strategy.md`.

Do NOT load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding tasks. Those are human-facing documents.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 |
| ASP.NET Core | 10 - Minimal APIs only. No MVC controllers. |
| EF Core | 10 |
| LiteBus | Modular packages. See `docs/conventions/backend/01-solution-structure.md` for which package goes in which project. |
| Ardalis.GuardClauses | Latest - guard clause helpers |
| PostgreSQL | Primary database |
| Next.js | 15 - App Router only |

## Application Layer Projects

| Project | Responsibility |
|:---|:---|
| `Application.Write.Contracts` | Command records, command result records, write-side contract interfaces. No handlers, no validators. |
| `Application.Write` | Command handler and validator implementations. References `Application.Write.Contracts` and `Domain`. |
| `Application.Read.Contracts` | Query records, query result records, read store interfaces (`IXxxReadStore`). No handlers, no validators. |
| `Application.Read` | Query handler and validator implementations. References `Application.Read.Contracts` and `Domain`. |
| `Application.Reactions` | Event handler implementations. Defines narrow interfaces for external side effects. No direct external library dependencies. |

## Full Project Map

| Project | Responsibility |
|:---|:---|
| `Domain` | Aggregates, value objects, domain events, domain exceptions, repository interfaces, strongly-typed IDs. |
| `Application.Write.Contracts` | Commands, command results, write-side interfaces. The public contract of the write path. |
| `Application.Write` | Command handlers and validators. The private implementation of the write path. |
| `Application.Read.Contracts` | Queries, query results, `IXxxReadStore` interfaces. The public contract of the read path. |
| `Application.Read` | Query handlers and validators. The private implementation of the read path. |
| `Application.Reactions` | Event handlers and narrow side-effect interfaces. Reacts to domain events. |
| `Infrastructure` | EF Core, repository implementations, read store implementations, external service clients. |
| `WebApi` | `IEndpoint` implementations, request/response models, API mappings. References Contracts projects only. |

## Non-Negotiable Rules

- MUST read the layer convention file before editing any file in that layer.
- MUST use `IEndpoint` for all HTTP endpoints. Never use MVC controllers or `ControllerBase`.
- MUST use `IReadStore` interfaces in query handlers. Never load a full aggregate for a read operation.
- MUST throw the correct exception subclass per `docs/conventions/backend/06-exception-hierarchy.md`.
- MUST NOT use `InvalidOperationException`, `ArgumentException`, or `ArgumentNullException` in domain or application code.
- MUST NOT add a NuGet package without a corresponding ADR.
- MUST run `dotnet build` and `dotnet test` before marking any task complete.
- MUST NOT put command handlers or query handlers in the Contracts projects.
- MUST NOT reference external libraries (EF Core, HTTP clients, email clients) directly in `Application.Reactions`. Use narrow interfaces.
- MUST NOT use em dashes, AI slop words, or cliche phrases in any generated documentation or code comments.

## Common Agent Mistakes

- Injecting `IXxxRepository` into a query handler instead of `IXxxReadStore`.
- Putting handlers or validators in the Contracts projects instead of the implementation projects.
- Putting mapping logic inside the endpoint handler method instead of the `ApiMappings` class.
- Creating a controller class instead of an `IEndpoint` implementation.
- Placing a type in `Shared/` before the Strike 2 promotion rule is triggered.
- Throwing `ArgumentException` from a validator instead of an `ApplicationValidationException` subclass.
- Forgetting `CancellationToken` propagation in async methods.
- Referencing `Application.Write` or `Application.Read` from `WebApi` instead of only the Contracts projects.
- Adding a direct dependency on an external library in `Application.Reactions` instead of defining a narrow interface.

## Convention File Index

| Layer | Convention File |
|:---|:---|
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
dotnet build src/{ProjectName}.slnx

# Test
dotnet test src/{ProjectName}.slnx

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
