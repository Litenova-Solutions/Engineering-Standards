# Forbidden Packages

Agents MUST NOT add any package in this list. Use the alternatives named in convention files.

| Forbidden | Layer | Use instead |
|:---|:---|:---|
| AutoMapper, TinyMapper, Mapster | .NET | Explicit mapping in `WebApi` or handlers |
| Newtonsoft.Json | .NET | `System.Text.Json` |
| MediatR, in-process MassTransit | .NET | LiteBus command/query/event mediators |
| FluentValidation | .NET | `ICommandValidator<T>`, `IQueryValidator<T>` |
| RestSharp | .NET | `HttpClient` via `IHttpClientFactory` |
| EF Core InMemory provider | .NET tests | `Microsoft.EntityFrameworkCore.Sqlite` |
| Axios | Frontend | `getApiClient()` from owned openapi-typescript client |
| Moment.js, Day.js | Frontend | `Temporal` or `date-fns` when required |
| Redux, MobX, Jotai, Recoil | Frontend | Zustand (UI), TanStack Query (server state) |
| Lodash, Underscore | Frontend | Native ES2022+ utilities |
| `classnames` | Frontend | `clsx` + `tailwind-merge` (`cn` helper) |
| Jest, Cypress | Frontend | Vitest, Playwright |

Pre-approved packages are listed in `docs/conventions/backend/01-solution-structure.md` (NuGet) and §9 npm (same file). Any other package requires an ADR before use.
