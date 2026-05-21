# Deployment and Migrations

This document defines local development orchestration, migration safety, environment promotion, feature flags, and deployment rules for production projects.

---

## 0. Local Development with .NET Aspire

.NET Aspire is the standard local development orchestration layer. It replaces manually managed Docker Compose files. Every solution includes an AppHost project that models the entire application topology in code.

### Project structure

```
src/
├── {ProjectName}.AppHost/         # Aspire orchestration entry point
│   ├── {ProjectName}.AppHost.csproj
│   └── Program.cs
└── {ProjectName}.ServiceDefaults/ # Shared OpenTelemetry, health checks, service discovery
    ├── {ProjectName}.ServiceDefaults.csproj
    └── Extensions.cs
```

The `ServiceDefaults` project contains the shared `AddServiceDefaults()` extension method that every service project calls from `Program.cs`. It wires up OpenTelemetry, health checks, and service discovery in one place.

### AppHost program

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Aspire manages the PostgreSQL container. Credentials and port are
// auto-generated. No hard-coded passwords or port numbers in source control.
var postgres = builder.AddPostgres("postgres");
var database = postgres.AddDatabase("database");

builder.AddProject<Projects.{ProjectName}_WebApi>("api")
    .WithReference(database)
    .WaitFor(database);

builder.Build().Run();
```

### Consuming apps

In the WebApi project (and any other service), call `AddServiceDefaults()` and use the connection reference:

```csharp
// WebApi/Program.cs
builder.AddServiceDefaults();

// Aspire injects the connection string via environment variable.
// The name "database" matches the name given to AddDatabase above.
builder.AddNpgsqlDbContext<AppDbContext>("database");
```

Or keep using `GetConnectionString` if you prefer not to use the Aspire client integration:

```csharp
// Works with Aspire connection injection and without Aspire (reads from appsettings)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("database")));
```

### Running locally

```bash
dotnet run --project src/{ProjectName}.AppHost
```

Aspire starts all services including the PostgreSQL container, performs health checks, and opens the Aspire Dashboard for logs, traces, and resource status.

### Package references

| Package | Project |
|:---|:---|
| `Aspire.Hosting.AppHost` | `{ProjectName}.AppHost` |
| `Aspire.Hosting.PostgreSQL` | `{ProjectName}.AppHost` |
| `{ProjectName}.ServiceDefaults` | `{ProjectName}.WebApi` (project reference) |
| `Aspire.Npgsql.EntityFrameworkCore.PostgreSQL` | `{ProjectName}.WebApi` (optional, adds health checks and OTel) |

Check the current Aspire docs for the latest package names and versions. The package ecosystem evolves with each Aspire release.

### JavaScript and frontend apps in Aspire

In Aspire 13+, the `Aspire.Hosting.JavaScript` package replaces the old `Aspire.Hosting.NodeJs` package. Update any existing AppHost projects accordingly.

**Adding a Next.js app:**

```csharp
#pragma warning disable ASPIREJAVASCRIPT001 // AddNextJsApp is [Experimental]

var web = builder.AddNextJsApp("web", "../apps/web")
    .WithPnpm()                    // uses pnpm; auto-installs from workspace root
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .DisableBuildValidation();     // remove once output: "standalone" is set in next.config
```

`DisableBuildValidation()` skips the check that `output: "standalone"` is set in `next.config.ts`. Use it during development. Remove it for production publish workflows.

**pnpm workspaces.** When the repo uses a pnpm workspace (a single `pnpm-lock.yaml` at the repo root), run `pnpm install` from the workspace root before starting the AppHost. Aspire calls `pnpm install` in the app subdirectory, and pnpm walks up to find the workspace root automatically, so `WithPnpm()` requires no extra configuration.

**Injecting service URLs across resources:**

```csharp
var api = builder.AddProject<Projects.{ProjectName}_WebApi>("api")
    .WithReference(database)
    .WaitFor(database)
    .WithEnvironment("Cors__WebOrigin", web.GetEndpoint("http"));

web.WithReference(api)
   .WithEnvironment("API_BASE_URL", api.GetEndpoint("http"));
```

Use `GetEndpoint("http")` to pass a service's allocated URL to another resource at startup. Ports are dynamic; do not hard-code them.

**`NEXT_PUBLIC_*` variables are substituted at build time, not at runtime.** Aspire injects environment variables at process startup. Variables prefixed `NEXT_PUBLIC_` are baked into the JavaScript bundle when `next build` runs, so they will not reflect Aspire-injected values in a pre-built container. Use server-only environment variables (no `NEXT_PUBLIC_` prefix) in Server Components and API routes, where `process.env` is read at request time. If client-side code needs a value that Aspire provides, expose it through a server-rendered config endpoint or a Next.js API route.

**Package references for JavaScript hosting:**

| Package | Project |
|:---|:---|
| `Aspire.Hosting.JavaScript` | `{ProjectName}.AppHost` |

Add `<NoWarn>$(NoWarn);ASPIREJAVASCRIPT001</NoWarn>` to the AppHost `.csproj` to suppress the experimental diagnostic project-wide instead of using `#pragma warning disable` per file.

---

## 1. Production Migration Rule

Production database migrations MUST be reviewed before execution. Do not call `Database.MigrateAsync()` from application startup in production.

Use one of these deployment artifacts:

- Reviewed SQL migration script.
- Idempotent SQL migration script for environments with unknown migration position.
- EF Core migration bundle generated in CI.

Local development may use `dotnet ef database update`.

### EF Core tooling requirements

**Tool version must match the runtime.** The `dotnet-ef` global tool must be the same major.minor version as the `Microsoft.EntityFrameworkCore` package. A mismatch produces misleading errors. Install the matching version:

```bash
dotnet tool install --global dotnet-ef --version <same major.minor as EF Core package>
```

**`IDesignTimeDbContextFactory<T>` is required when the DbContext has extra constructor parameters.** If `AppDbContext` takes anything beyond `DbContextOptions<T>` (such as `IEventPublisher`), the tools cannot construct it at design time. Add a factory class in the Infrastructure project:

```csharp
// Infrastructure/Persistence/AppDbContextFactory.cs
internal sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__Database")
            ?? "Host=localhost;Port=5432;Database=myapp;Username=myapp;Password=myapp";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options, new NoOpEventPublisher());
    }
}
```

The factory is auto-discovered by the EF tools when it is in the same assembly as the DbContext. No DI registration is needed.

**File-scoped namespace requirement.** `EnforceCodeStyleInBuild=true` enforces IDE0161 (file-scoped namespaces). EF Core generates migration files with block-scoped namespaces (`namespace Foo { ... }`). After running `dotnet ef migrations add`, convert each generated file to file-scoped:

```csharp
// Generated (block-scoped) — violates IDE0161:
namespace MyApp.Infrastructure.Migrations
{
    public partial class InitialCreate : Migration
    {
        // ...
    }
}

// Required (file-scoped):
namespace MyApp.Infrastructure.Migrations;

public partial class InitialCreate : Migration
{
    // ...
}
```

Convert all three generated files: the migration itself (`{Name}.cs`), the Designer file (`{Name}.Designer.cs`), and the snapshot update (`AppDbContextModelSnapshot.cs`).



## 2. Expand and Contract

Breaking database changes use expand and contract.

| Phase | Action |
|:---|:---|
| Expand | Add nullable columns, new tables, new indexes, or compatibility views |
| Dual write | Application writes old and new shape |
| Backfill | Background job migrates existing data |
| Read switch | Application reads the new shape |
| Contract | Remove old columns or tables after all deployed versions stop using them |

Destructive migrations are forbidden in the same deployment that first introduces the replacement shape.

```csharp
// GOOD: first migration adds the new nullable column
migrationBuilder.AddColumn<string>(
    name: "DisplayName",
    table: "Users",
    type: "text",
    nullable: true);
```

```csharp
// BAD: drops old column before all deployed versions stop reading it
migrationBuilder.DropColumn(
    name: "Name",
    table: "Users");
```

---

## 3. Migration Checklist

Every migration PR MUST answer:

- Does this migration drop, rename, or make a column non-null?
- Can the old and new application versions run against the schema during deployment?
- Is a backfill needed?
- Is the backfill idempotent and restartable?
- Is the migration safe for large tables?
- Are indexes created without blocking writes when the database supports it?
- Is a rollback or forward-fix plan documented?

---

## 4. Environment Promotion

The deployment order is:

1. Development.
2. Staging.
3. Production.

The same container image and migration artifact that pass staging are promoted to production. Do not rebuild between staging and production.

Required gates before production:

- `dotnet build`.
- `dotnet test`.
- Frontend `pnpm lint`, `pnpm type-check`, and `pnpm build` when a frontend exists.
- Vulnerability scan.
- OpenAPI freshness check when a frontend consumes backend APIs.
- Migration script review.

---

## 5. Feature Flags

Use feature flags for behavior changes that need staged rollout or fast disablement. Do not use feature flags to hide incomplete code forever.

Feature flags MUST have:

- A named owner.
- A removal date or removal condition.
- A default value for every environment.
- Test coverage for both enabled and disabled states when the behavior is risky.

Flags are read in the application or API layer. Domain rules MUST NOT depend on a feature flag service.

---

## 6. Seed Data

Seed data is environment-specific.

| Environment | Allowed Seed Data |
|:---|:---|
| Development | Demo users, fake data, local test fixtures |
| Staging | Minimal operational data and test accounts |
| Production | Reference data only |

Never seed production users, permissions, or secrets from application startup code.

