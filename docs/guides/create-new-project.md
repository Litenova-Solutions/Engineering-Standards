# Guide: Create a New Project

This guide walks through creating a new project from scratch using these engineering standards. Follow the steps in order.

---

## Prerequisites

- .NET 10 SDK installed with `global.json` version constraint.
- Node.js 22 and pnpm 10 installed.
- Docker installed (for local database via .NET Aspire).
- Git configured.
- Access to the container registry and GitHub repository.

---

## Step 1: Initialize the Repository

```bash
mkdir {ProjectName}
cd {ProjectName}
git init
git remote add origin https://github.com/your-org/{ProjectName}
```

---

## Step 2: Create Root Files

Create Node.js and CI files at the repository root. .NET-specific files go in `apps/api/` (Step 3).

### `package.json` (root)

```json
{
  "name": "@{projectname}/root",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "generate:api-types": "turbo run generate:api-types"
  },
  "devDependencies": {
    "turbo": "2.x"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=10"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

Copy from `docs/conventions/shared/monorepo-structure.md` section 4.

---

## Step 3: Create the .NET Solution

Create the backend under `apps/api/`. For a backend-only single-project repository, use the repository root instead. See `docs/guides/single-project-setup.md`.

```bash
mkdir -p apps/api
cd apps/api

# Create solution file
dotnet new sln -n {ProjectName}

# Create source projects
dotnet new classlib -n {ProjectName}.Domain -o src/{ProjectName}.Domain
dotnet new classlib -n {ProjectName}.Application.Write.Contracts -o src/{ProjectName}.Application.Write.Contracts
dotnet new classlib -n {ProjectName}.Application.Write -o src/{ProjectName}.Application.Write
dotnet new classlib -n {ProjectName}.Application.Read.Contracts -o src/{ProjectName}.Application.Read.Contracts
dotnet new classlib -n {ProjectName}.Application.Read -o src/{ProjectName}.Application.Read
dotnet new classlib -n {ProjectName}.Application.Reactions -o src/{ProjectName}.Application.Reactions
dotnet new classlib -n {ProjectName}.Infrastructure -o src/{ProjectName}.Infrastructure
dotnet new webapi -n {ProjectName}.WebApi -o src/{ProjectName}.WebApi
dotnet new aspire-apphost -n {ProjectName}.AppHost -o src/{ProjectName}.AppHost
dotnet new aspire-servicedefaults -n {ProjectName}.ServiceDefaults -o src/{ProjectName}.ServiceDefaults

# Create test projects
dotnet new xunit -n {ProjectName}.Domain.Tests -o tests/{ProjectName}.Domain.Tests
dotnet new xunit -n {ProjectName}.Application.Tests -o tests/{ProjectName}.Application.Tests
dotnet new xunit -n {ProjectName}.Integration.Tests -o tests/{ProjectName}.Integration.Tests
dotnet new xunit -n {ProjectName}.Architecture.Tests -o tests/{ProjectName}.Architecture.Tests

# Add all projects to the solution
dotnet sln add src/**/*.csproj tests/**/*.csproj
```

Copy `global.json`, `Directory.Build.props`, and `Directory.Packages.props` into `apps/api/` from `docs/templates/` in this standards repository. Update package versions from `standards.manifest.json`.

Create `apps/api/.config/dotnet-tools.json`:

```json
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "dotnet-ef": {
      "version": "10.0.0",
      "commands": ["dotnet-ef"]
    },
    "dotnet-stryker": {
      "version": "4.x",
      "commands": ["dotnet-stryker"]
    }
  }
}
```

---

## Step 4: Configure Project References

Add references following the clean architecture dependency rule:

```bash
cd apps/api

# Application layers depend on Domain
dotnet add src/{ProjectName}.Application.Write.Contracts reference src/{ProjectName}.Domain
dotnet add src/{ProjectName}.Application.Write reference src/{ProjectName}.Application.Write.Contracts src/{ProjectName}.Domain
dotnet add src/{ProjectName}.Application.Read.Contracts reference src/{ProjectName}.Domain
dotnet add src/{ProjectName}.Application.Read reference src/{ProjectName}.Application.Read.Contracts src/{ProjectName}.Domain
dotnet add src/{ProjectName}.Application.Reactions reference src/{ProjectName}.Application.Write.Contracts src/{ProjectName}.Application.Read.Contracts src/{ProjectName}.Domain

# Infrastructure depends on Application layers and Domain
dotnet add src/{ProjectName}.Infrastructure reference \
    src/{ProjectName}.Domain \
    src/{ProjectName}.Application.Write.Contracts \
    src/{ProjectName}.Application.Read.Contracts \
    src/{ProjectName}.Application.Reactions

# WebApi depends on Application contracts and Infrastructure
dotnet add src/{ProjectName}.WebApi reference \
    src/{ProjectName}.Application.Write.Contracts \
    src/{ProjectName}.Application.Read.Contracts \
    src/{ProjectName}.Infrastructure \
    src/{ProjectName}.ServiceDefaults

# AppHost
dotnet add src/{ProjectName}.AppHost reference src/{ProjectName}.WebApi

# Test projects
dotnet add tests/{ProjectName}.Domain.Tests reference src/{ProjectName}.Domain
dotnet add tests/{ProjectName}.Application.Tests reference \
    src/{ProjectName}.Application.Write \
    src/{ProjectName}.Application.Read \
    src/{ProjectName}.Domain
dotnet add tests/{ProjectName}.Integration.Tests reference \
    src/{ProjectName}.WebApi \
    src/{ProjectName}.Infrastructure
dotnet add tests/{ProjectName}.Architecture.Tests reference \
    src/{ProjectName}.Domain \
    src/{ProjectName}.Application.Write \
    src/{ProjectName}.Application.Read \
    src/{ProjectName}.Application.Reactions \
    src/{ProjectName}.Infrastructure \
    src/{ProjectName}.WebApi
```

---

## Step 5: Install Required NuGet Packages

Install packages from `docs/conventions/backend/01-solution-structure.md` approved list. Use `Directory.Packages.props` for version management.

Key packages:

| Project | Packages |
|:---|:---|
| Domain | `Ardalis.GuardClauses` |
| Application.Write.Contracts | `LiteBus.Commands.Abstractions` |
| Application.Write | `LiteBus.Commands.Abstractions` |
| Application.Read.Contracts | `LiteBus.Queries.Abstractions` |
| Application.Read | `LiteBus.Queries.Abstractions`, `Microsoft.EntityFrameworkCore` |
| Application.Reactions | `LiteBus.Events.Abstractions`, `LiteBus.Commands.Abstractions` |
| Infrastructure | `Npgsql.EntityFrameworkCore.PostgreSQL`, `EFCore.NamingConventions`, `LiteBus.Commands`, `LiteBus.Queries`, `LiteBus.Events` |
| WebApi | `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.OpenApi`, `Microsoft.Extensions.ApiDescription.Server` |
| Integration.Tests | `Microsoft.AspNetCore.Mvc.Testing`, `Testcontainers.PostgreSql` |
| Architecture.Tests | `NetArchTest.Rules` |
| All test projects | `xunit`, `xunit.runner.visualstudio`, `NSubstitute`, `AwesomeAssertions`, `coverlet.collector` |

---

## Step 6: Set Up the WebApi

1. Copy `Program.cs` from `docs/blueprints/backend/program-cs.md`.
2. Create `WebApi/Auth/JwtSettings.cs`, `ClaimsPrincipalExtensions.cs`, and `AuthorizationPolicies.cs` (see `docs/conventions/backend/15-authentication-and-authorization.md`).
3. Create `WebApi/Options/CorsOptions.cs` and `RateLimitOptions.cs`.
4. Create `WebApi/Middleware/GlobalExceptionHandler.cs` (from the blueprint).
5. Create `WebApi/Extensions/EndpointExtensions.cs`.
6. Set up `appsettings.json` with empty required values.
7. Set up `appsettings.Development.json` with local dev values.

---

## Step 7: Set Up Infrastructure

1. Create `Infrastructure/Persistence/{ProjectName}DbContext.cs` implementing `IDatabaseContext`.
2. Register `AppDbContext` with the Aspire connection name in `InfrastructureServiceRegistration.cs`.
3. Create the design-time `AppDbContextFactory` for EF Core CLI commands.
4. Add Outbox and Idempotency infrastructure (see blueprints).
5. Register LiteBus with assembly scanning.

---

## Step 8: Create the First Domain Aggregate

Follow `docs/conventions/backend/02-domain-layer.md` for the aggregate structure.

Create the first aggregate as the "hello world" of your domain:

- `Domain/{Aggregate}/{Aggregate}.cs` (aggregate root extending `AggregateRoot<{Aggregate}Id>`)
- `Domain/{Aggregate}/{Aggregate}Id.cs`
- `Domain/{Aggregate}/I{Aggregate}Repository.cs`
- `Domain/{Aggregate}/Events/{Aggregate}Created.cs`
- `Infrastructure/Persistence/Configurations/{Aggregate}Configuration.cs`
- `Infrastructure/Persistence/Repositories/{Aggregate}Repository.cs`

---

## Step 9: Create the First Migration

```bash
dotnet tool restore

dotnet ef migrations add InitialCreate \
    --project apps/api/src/{ProjectName}.Infrastructure \
    --startup-project apps/api/src/{ProjectName}.WebApi
```

---

## Step 10: Set Up the Next.js Frontend

```bash
mkdir -p apps/web
cd apps/web
pnpm create next-app . \
    --typescript \
    --app \
    --src-dir \
    --no-eslint \
    --no-tailwind \
    --no-import-alias
```

Then:

1. Set `output: "standalone"` in `next.config.ts`.
2. Install Tailwind CSS 4 following its docs.
3. Install shadcn/ui v4.
4. Install exact versions from `standards.manifest.json`: Next.js 16.2.6, React 19.2.6, TanStack Query 5.100.10, Zod 4.4.3.
5. Create `lib/env.ts` (see `docs/conventions/frontend/09-environment-and-runtime-config.md`).
6. Create `lib/api/client.ts` with `getApiClient()`.
7. Create `lib/errors/` error handling utilities (see `docs/conventions/frontend/08-error-handling-and-problem-details.md`).

---

## Step 11: Set Up the API Types Package

```bash
mkdir -p packages/api-types/src
```

Create `packages/api-types/package.json` following `docs/conventions/shared/monorepo-structure.md` section 5.

---

## Step 12: Add Aspire Frontend Reference

Add the Next.js app to the AppHost `Program.cs` (see `docs/conventions/backend/13-deployment-and-migrations.md`).

---

## Step 13: Verify the Setup

```bash
# .NET
dotnet tool restore
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build

# Frontend
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm build

# Full stack local run
dotnet run --project apps/api/src/{ProjectName}.AppHost
```

---

## Step 14: Set Up CI

Copy the GitHub Actions workflow from `docs/templates/ci-workflow.yml`, replace `{ProjectName}`, and add it to `.github/workflows/ci.yml`.

Add branch protection rules for `main` (see `docs/conventions/shared/ci-cd.md` section 4).

---

## Definition of Done

Before marking the project setup complete, verify all items in `docs/guides/definition-of-done.md`.
