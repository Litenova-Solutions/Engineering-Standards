# Engineering Standards: Agent Context

This file is the canonical behavioral contract for all AI agents and engineers working on projects that follow these standards. Read it before touching any code.

## Read Order

1. Read this file in full.
2. Read `docs/architecture/clean-architecture.md`.
3. Read the convention file for the layer you are about to edit (see index below).
4. If the task involves exceptions: also read `docs/conventions/backend/06-exception-hierarchy.md`.
5. If the task involves query handlers: also read `docs/conventions/backend/07-query-read-strategy.md`.
6. Do NOT load `docs/philosophy.md` or `docs/agentic-development.md` for routine coding tasks. Those are human-facing documents that provide no actionable rules for code generation.

## Tech Stack

| Technology | Version / Notes |
|:---|:---|
| .NET | 10 |
| ASP.NET Core | 10 - Minimal APIs only. No MVC controllers. |
| EF Core | 10 |
| LiteBus | Modular packages. See `docs/conventions/backend/01-solution-structure.md` for which package goes in which project. |
| Ardalis.GuardClauses | Latest - guard clause helpers |
| PostgreSQL | Primary database |
| Next.js | 16.2.6 - App Router only. `proxy.ts` replaces deprecated `middleware.ts`. |
| React | 19.2.6 - React Compiler stable. `useActionState`/`useOptimistic` stable. |
| TypeScript | 6.0.x - `--outFile` removed. `moduleResolution: bundler` recommended. |
| TanStack Query | 5.100.10 - v5 API stable. Security note: verify lockfile against GHSA-g7cv-rxg3-hmpx (May 11 2026 supply-chain incident). |
| Zustand | 5.0.13 - Requires React 18+. |
| Zod | 4.4.3 - v4 breaking changes: `z.email()` not `z.string().email()`. |
| Tailwind CSS | 4.3.x - CSS-first config via `@theme`. No `tailwind.config.js`. |
| shadcn/ui | CLI v4 - `toast` deprecated, use `sonner`. `radix-ui` unified package replaces `@radix-ui/react-*`. |

## Application Layer Projects

| Project | Responsibility |
|:---|:---|
| `Application.Write.Contracts` | Command records, command result records, write-side contract interfaces. No handlers, no validators. |
| `Application.Write` | Command handler and validator implementations. References `Application.Write.Contracts` and `Domain`. |
| `Application.Read.Contracts` | Query records, query result records, `IDatabaseContext` interface, `PagedResult<T>`, `PaginationParameters`. No handlers, no validators. |
| `Application.Read` | Query handler and validator implementations. References `Application.Read.Contracts` and `Domain`. |
| `Application.Reactions` | Event handler implementations. Defines narrow interfaces for external side effects. No direct external library dependencies. |

## Full Project Map

| Project | Responsibility |
|:---|:---|
| `Domain` | Aggregates, value objects, domain events, domain exceptions, repository interfaces, strongly-typed IDs. |
| `Application.Write.Contracts` | Commands, command results, write-side interfaces. The public contract of the write path. |
| `Application.Write` | Command handlers and validators. The private implementation of the write path. |
| `Application.Read.Contracts` | Queries, query results, `IDatabaseContext` interface, `PagedResult<T>`. The public contract of the read path. |
| `Application.Read` | Query handlers and validators. The private implementation of the read path. |
| `Application.Reactions` | Event handlers and narrow side-effect interfaces. Reacts to domain events. |
| `Infrastructure` | EF Core, repository implementations, `AppDbContext` implements `IDatabaseContext`, transaction pipeline behaviors, external service clients. |
| `WebApi` | `IEndpoint` implementations, request/response models, API mappings. References Contracts projects only. |
| `apps/web/` | Next.js 16 frontend application. Endpoints, components, server actions, feature folders. |

## Non-Negotiable Rules

- MUST read the layer convention file before editing any file in that layer.
- MUST use `IEndpoint` for all HTTP endpoints. Never use MVC controllers or `ControllerBase`.
- MUST inject `IDatabaseContext` in query handlers. Never inject `IXxxRepository` or `AppDbContext` directly in query handlers.
- MUST throw the correct exception subclass per `docs/conventions/backend/06-exception-hierarchy.md`.
- MUST throw `CommandValidationException` subclasses from command validators. Never throw `ArgumentException` or use `Guard.Against` in validators.
- MUST throw `QueryValidationException` subclasses from query validators. Never throw `ArgumentException` or use `Guard.Against` in validators.
- MUST NOT call `SaveChangesAsync` in command handlers or repository methods. The `SaveChangesCommandPostHandler` pipeline behavior handles all persistence.
- MUST NOT add per-aggregate read store interfaces (`IXxxReadStore`). Use `IDatabaseContext` with LINQ projections.
- MUST NOT use `InvalidOperationException`, `ArgumentException`, or `ArgumentNullException` in domain or application code.
- MUST NOT add a NuGet package without a corresponding ADR.
- MUST run `dotnet build` and `dotnet test` before marking any task complete.
- MUST NOT put command handlers or query handlers in the Contracts projects.
- MUST NOT reference external libraries (EF Core, HTTP clients, email clients) directly in `Application.Reactions`. Use narrow interfaces.
- MUST NOT use em dashes, AI slop words, or cliche phrases in any generated documentation or code comments.
- MUST name the `CancellationToken` parameter exactly `cancellationToken` in all async methods. Never `ct`, `token`, or `cancel`.
- MUST NOT reference `Application.Write` or `Application.Read` from `WebApi` endpoint code. Reference only the Contracts projects.
- MUST NOT add direct NuGet package references for external libraries (EF Core, email clients, HTTP clients) to `Application.Reactions`. Define a narrow interface and implement it in Infrastructure.
- MUST await `cookies()`, `headers()`, `params`, and `searchParams` in Next.js 15+/16. These are Promises.
- MUST NOT use server-only modules (`cookies()`, `headers()`, database clients) in `'use client'` files.
- MUST add a comment to every `'use client'` directive explaining why the client boundary is needed.
- MUST use `z.email()`, `z.uuid()`, `z.url()` in Zod 4. Never `z.string().email()`, `z.string().uuid()`, or `z.string().url()`.
- MUST NOT put business logic in `proxy.ts`. Optimistic checks only. See CVE-2025-29927.
- MUST NOT add `useMemo`, `useCallback`, or `React.memo` when the React Compiler is enabled.
- MUST use `sonner` for toast notifications. The shadcn/ui `toast` component is deprecated.
- MUST import from `radix-ui` not `@radix-ui/react-*` (unified package since February 2026).

## Common Agent Mistakes

- Injecting `ICommandMediator` into an Application.Read handler or `IQueryMediator` into an Application.Write handler. Only inject the mediator interface corresponding to the layer's responsibility.
- Using `IMessageMediator` or `IMessageBus` instead of the specific `ICommandMediator` or `IQueryMediator`.
- Injecting `IXxxRepository` or `AppDbContext` directly into a query handler instead of `IDatabaseContext`.
- Putting handlers or validators in the Contracts projects instead of the implementation projects.
- Putting mapping logic inside the endpoint handler method instead of the `ApiMappings` class.
- Creating a controller class instead of an `IEndpoint` implementation.
- Placing a type in `Shared/` before the Strike 2 promotion rule is triggered.
- Calling `SaveChangesAsync` inside a command handler or repository method. The pipeline handles this.
- Creating a per-aggregate `IXxxReadStore` interface. The correct pattern is `IDatabaseContext` with LINQ projections.
- Throwing `ApplicationValidationException` -- this type no longer exists. Use `CommandValidationException` or `QueryValidationException`.
- Using `Guard.Against` in validators. It throws `ArgumentException` which maps to HTTP 500. Throw `CommandValidationException` or `QueryValidationException` subclasses directly.
- Forgetting `CancellationToken` propagation in async methods.
- Referencing `Application.Write` or `Application.Read` from `WebApi` instead of only the Contracts projects.
- Adding a direct dependency on an external library in `Application.Reactions` instead of defining a narrow interface.
- Naming the `CancellationToken` parameter `ct` instead of `cancellationToken`.
- Placing project-specific content (ubiquitous language glossary, feature inventory, exception list) inside convention files. That content belongs in the project repository using the templates in `docs/templates/`.
- Forgetting to `await` `params` or `searchParams` in page components. These are Promises in Next.js 15+/16.
- Forgetting to `await` `cookies()` from `next/headers`. It is async in Next.js 15+/16.
- Using Zod v3 syntax: `z.string().email()`, `z.string().uuid()`. Use `z.email()`, `z.uuid()` in Zod 4.
- Using `revalidateTag` without a `cacheLife` second argument in Next.js 16. This is a TypeScript error.
- Adding `useMemo` or `useCallback` when the React Compiler is enabled. The compiler handles memoization automatically.
- Importing `@radix-ui/react-dialog` or similar individual packages. Use the unified `radix-ui` package.
- Using the shadcn/ui `toast` component. It is deprecated. Use `sonner`.
- Putting server data in Zustand instead of TanStack Query.
- Using `useEffect` for data fetching instead of server components or TanStack Query.

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
| Query/Read Strategy | `docs/conventions/backend/07-query-read-strategy.md` | IDatabaseContext pattern, LINQ projections, pagination, IStreamQuery for export. |
| Testing | `docs/conventions/backend/08-testing.md` |
| Naming | `docs/conventions/shared/naming.md` |
| Git Workflow | `docs/conventions/shared/git-workflow.md` |
| Security | `docs/conventions/shared/security.md` |
| Frontend/App Router | `docs/conventions/frontend/01-nextjs-app-router.md` |
| Frontend/Components | `docs/conventions/frontend/02-components.md` |
| Frontend/Data Fetching | `docs/conventions/frontend/03-data-fetching.md` |
| Frontend/State and Forms | `docs/conventions/frontend/04-state-and-forms.md` |

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
