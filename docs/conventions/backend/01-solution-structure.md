# Solution Structure

This document covers the physical structure of a .NET solution for a Litenova Solutions project.

---

## Solution Layout

Every project follows this standard layout. Replace `{ProjectName}` with the actual project name (PascalCase, no spaces).

```
{ProjectName}.sln
├── src/
│   ├── {ProjectName}.Domain/
│   ├── {ProjectName}.Application/
│   ├── {ProjectName}.Infrastructure/
│   └── {ProjectName}.WebApi/
└── tests/
    ├── {ProjectName}.Domain.Tests/
    ├── {ProjectName}.Application.Tests/
    └── {ProjectName}.Integration.Tests/
```

Each `src/` project maps directly to a Clean Architecture layer. The `tests/` projects are structured to mirror the layers they test.

---

## Project References

The dependency rule (outer layers depend on inner layers, never the reverse) is enforced via project references.

| Project | References |
|---|---|
| `{ProjectName}.Domain` | _(nothing)_ |
| `{ProjectName}.Application` | `{ProjectName}.Domain` |
| `{ProjectName}.Infrastructure` | `{ProjectName}.Domain`, `{ProjectName}.Application` |
| `{ProjectName}.WebApi` | `{ProjectName}.Application` |
| `{ProjectName}.WebApi` (DI only) | `{ProjectName}.Infrastructure` _(only in `Program.cs`)_ |

The WebApi project references Infrastructure only for DI registration in `Program.cs`. No other file in WebApi may use any Infrastructure type directly.

---

## NuGet Package Policy

Every new NuGet package MUST be justified with an ADR entry in `docs/adr/`. The ADR explains why the package was chosen, what alternatives were considered, and what the trade-offs are.

The following packages are pre-approved and do not require a new ADR. They are the standard stack for all Litenova Solutions projects:

| Package | Layer(s) | Purpose |
|---|---|---|
| `LiteBus` | Application, WebApi | Mediator for commands and queries |
| `Ardalis.GuardClauses` | Domain, Application | Guard clause helpers |
| `Microsoft.EntityFrameworkCore` | Infrastructure | ORM |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | Infrastructure | PostgreSQL EF Core provider |
| `Serilog` | WebApi | Structured logging |
| `Serilog.AspNetCore` | WebApi | ASP.NET Core integration |
| `Serilog.Sinks.Console` | WebApi | Console sink |
| `FluentValidation` | Application | _(optional)_ Fluent validation syntax |
| `xunit` | All test projects | Test framework |
| `NSubstitute` | Application.Tests | Mocking framework |
| `Microsoft.AspNetCore.Mvc.Testing` | Integration.Tests | `WebApplicationFactory<T>` |
| `Testcontainers.PostgreSql` | Integration.Tests | PostgreSQL container for tests |
| `coverlet.collector` | All test projects | Code coverage |

Any package not in this list requires an ADR before being added to any project.

---

## Global Usings

Each project contains a single `GlobalUsings.cs` file at the project root. Global usings reduce repetition but MUST only contain namespaces that are used in the majority of files in that project.

```
{ProjectName}.Domain/
└── GlobalUsings.cs          ← only domain-wide namespaces

{ProjectName}.Application/
└── GlobalUsings.cs          ← only application-wide namespaces
```

Global usings MUST NOT contain:
- Namespaces for types used in only one or two files (add the `using` locally)
- Aliases that could be confused with standard library types
- Infrastructure namespaces in Domain or Application global usings

---

## Project-Specific Configuration

> **Note:** This section is filled in per-project. It covers configuration that is specific to this particular project and is not part of the standard template.

When filling in this section for a project, include:

- **Environment variable names** used by the application (e.g., `DB_CONNECTION_STRING`, `REDIS_URL`)
- **Connection string keys** as they appear in `appsettings.json`
- **Feature flags** and their expected values
- **Project-specific NuGet additions** not in the pre-approved list above, along with a reference to the ADR that approved them
- **External service dependencies** (APIs, queues, storage accounts) and where their configuration is documented
