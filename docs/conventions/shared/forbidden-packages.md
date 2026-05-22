# Forbidden Packages

Agents MUST NOT add any package in this list. Use the alternatives named in convention files.

Any package not in the pre-approved list in `docs/conventions/backend/01-solution-structure.md` (NuGet) or section 8 of the same file (npm) requires an ADR before use.

---

## Forbidden NuGet Packages

| Package | Reason | Alternative |
|:---|:---|:---|
| `MediatR` | Commercial licensing transition | `LiteBus.Commands.Abstractions`, `LiteBus.Queries.Abstractions`, `LiteBus.Events.Abstractions` |
| `AutoMapper`, `TinyMapper`, `Mapster` | Convention-based mapping hides transformation logic; property name mismatches produce runtime errors | Explicit mapping extension methods in `ApiMappings` classes |
| `Newtonsoft.Json` | `System.Text.Json` is the standard in .NET 10 | `System.Text.Json` |
| `FluentValidation` | Throws `ValidationException` (not `CommandValidationException`); maps to HTTP 500 by default | Direct `if` + `throw` with custom `CommandValidationException` / `QueryValidationException` subclasses |
| `MassTransit` | Requires ADR | Outbox pattern per `docs/conventions/backend/10-reliability.md` |
| `Hangfire` | Requires ADR | `BackgroundService` + PostgreSQL-backed job table per `docs/conventions/backend/11-background-jobs.md` |
| `Dapper` | Requires ADR for query handlers | `IDatabaseContext` with EF Core LINQ projections per `docs/conventions/backend/07-query-read-strategy.md` |
| `RestSharp` | Redundant with `HttpClient` | `HttpClient` via `IHttpClientFactory` |
| EF Core InMemory provider (`Microsoft.EntityFrameworkCore.InMemory`) | Skips relational constraints; does not translate LINQ the same way PostgreSQL does | `Microsoft.EntityFrameworkCore.Sqlite` |

---

## Forbidden npm Packages

| Package | Reason | Alternative |
|:---|:---|:---|
| `axios` | Bypasses the typed OpenAPI client | `getApiClient()` from the owned `openapi-fetch` client in `packages/api-client/` |
| `moment`, `day.js` | Deprecated or large bundle | `Temporal` API or `date-fns` |
| `@shadcn/ui` | Not an importable package | `components/ui/` populated via `npx shadcn@latest add` |
| `@radix-ui/react-*` (individual packages) | Replaced by unified `radix-ui` package | `import { ... } from "radix-ui"` |
| `redux`, `@reduxjs/toolkit`, `mobx`, `jotai`, `recoil` | Requires ADR; Zustand is the approved UI state tool | `zustand` |
| `react-query` (v3 package name) | Old package name; contains security advisories | `@tanstack/react-query` 5.x |
| `lodash`, `underscore` | Redundant with ES2022+ native utilities | Native `Array`, `Object`, and `String` methods |
| `classnames` | Redundant | `clsx` + `tailwind-merge` via the `cn` helper |
| `jest`, `cypress` | Not the approved testing stack | `vitest` (unit/component), `@playwright/test` (E2E) |
| Any workspace UI package (`@workspace/ui`, `@litenova/ui`) | Each app owns its `components/ui/` | Each app owns its `components/ui/` populated via the shadcn CLI |

