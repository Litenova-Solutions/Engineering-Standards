# Guide: Create a New Project

This guide walks through creating a new monorepo project from scratch. Follow the steps in order.

---

## Prerequisites

- .NET 10 SDK installed with `global.json` version constraint.
- Node.js 22 and pnpm 10 installed.
- Docker installed (for local database via .NET Aspire).
- Git configured.

---

## Step 1: Initialize the Repository

```bash
mkdir {ProjectName}
cd {ProjectName}
git init
```

Copy root templates from `docs/templates/`:

- `.nvmrc` → repository root
- `package.json` → repository root
- `pnpm-workspace.yaml` → repository root
- `turbo.json` → repository root
- `ci-workflow.yml` → `.github/workflows/ci.yml`
- `Dockerfile.api` → `Dockerfile.api`
- `Dockerfile.web` → `Dockerfile.web`
- `dockerignore` → `.dockerignore`
- `project-agents.md` → `AGENTS.md` (fill placeholders)

---

## Step 2: Create Root Monorepo Packages

Copy `docs/templates/packages/api-types/` and `docs/templates/packages/api-client/` to `packages/`.

---

## Step 3: Create the .NET Solution

```bash
mkdir -p apps/api
cd apps/api
dotnet new sln -n {ProjectName}

dotnet new classlib -n {ProjectName}.Domain -o src/{ProjectName}.Domain
dotnet new classlib -n {ProjectName}.Application.Write.Contracts -o src/{ProjectName}.Application.Write.Contracts
dotnet new classlib -n {ProjectName}.Application.Write -o src/{ProjectName}.Application.Write
dotnet new classlib -n {ProjectName}.Application.Read.Contracts -o src/{ProjectName}.Application.Read.Contracts
dotnet new classlib -n {ProjectName}.Application.Read -o src/{ProjectName}.Application.Read
dotnet new classlib -n {ProjectName}.Application.Reactions -o src/{ProjectName}.Application.Reactions
dotnet new classlib -n {ProjectName}.Infrastructure -o src/{ProjectName}.Infrastructure
dotnet new web -n {ProjectName}.WebApi -o src/{ProjectName}.WebApi
dotnet new worker -n {ProjectName}.Worker -o src/{ProjectName}.Worker
dotnet new aspire-apphost -n {ProjectName}.AppHost -o src/{ProjectName}.AppHost
dotnet new aspire-servicedefaults -n {ProjectName}.ServiceDefaults -o src/{ProjectName}.ServiceDefaults

dotnet new xunit -n {ProjectName}.Domain.Tests -o tests/{ProjectName}.Domain.Tests
dotnet new xunit -n {ProjectName}.Application.Tests -o tests/{ProjectName}.Application.Tests
dotnet new xunit -n {ProjectName}.Integration.Tests -o tests/{ProjectName}.Integration.Tests
dotnet new xunit -n {ProjectName}.Architecture.Tests -o tests/{ProjectName}.Architecture.Tests

dotnet sln add src/**/*.csproj tests/**/*.csproj
```

Copy into `apps/api/` from `docs/templates/`:

- `global.json`
- `Directory.Build.props`
- `Directory.Packages.props`
- `.config/dotnet-tools.json` (from section below)

Pin package versions from `standards.manifest.json`.

---

## Step 4: Configure Project References

See `docs/conventions/backend/01-solution-structure.md` section 5. WebApi references `Application.Write.Contracts`, `Application.Read.Contracts`, `Infrastructure`, and `ServiceDefaults`.

Worker references `Infrastructure`, `Application.Write`, `Application.Reactions`, and `ServiceDefaults`. Worker MUST NOT reference WebApi.

---

## Step 5: Install NuGet Packages

Use `docs/templates/Directory.Packages.props` as the starting point. Key packages per project are listed in `docs/conventions/backend/01-solution-structure.md` sections 6 and 7.

Infrastructure uses `LiteBus.Commands.Abstractions` and `LiteBus.Events.Abstractions` only, not full LiteBus packages.

---

## Step 6: Set Up WebApi

1. Copy `Program.cs` and supporting files from `docs/blueprints/backend/program-cs.md`.
2. Copy `EndpointExtensions` from `docs/blueprints/backend/endpoint-extensions.md`.
3. Copy `GlobalExceptionHandler` from `docs/conventions/backend/06-exception-hierarchy.md`.
4. Copy auth files from `docs/conventions/backend/15-authentication-and-authorization.md`.
5. Configure WebApi `.csproj` for build-time OpenAPI per `docs/conventions/backend/05-api-layer.md`.

---

## Step 7: Set Up Infrastructure and Worker

1. Copy `InfrastructureServiceRegistration` from `docs/blueprints/backend/infrastructure-service-registration.md`.
2. Add Outbox and Idempotency from blueprints when required.
3. Copy Worker `Program.cs` from `docs/blueprints/backend/worker-program-cs.md`.
4. Copy AppHost from `docs/blueprints/backend/apphost.md`.

---

## Step 8: Set Up Tests

1. Copy architecture tests from `docs/blueprints/backend/architecture-tests.md`.
2. Copy integration factory from `docs/blueprints/backend/integration-test-factory.md`.

---

## Step 9: Create the First Domain Aggregate

Follow `docs/conventions/backend/02-domain-layer.md`. Write a feature spec first using `docs/templates/feature-spec.md`.

---

## Step 10: Create the First Migration

```bash
dotnet tool restore
dotnet ef migrations add InitialCreate \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi
```

---

## Step 11: Set Up Next.js Frontend

```bash
mkdir -p apps/web
cd apps/web
pnpm create next-app . \
  --typescript \
  --app \
  --no-eslint \
  --no-tailwind \
  --no-import-alias
```

Do **not** pass `--src-dir`. The app lives at `apps/web/app/`.

Then:

1. Copy `next.config.ts` from `docs/blueprints/frontend/next-config.md`.
2. Copy `playwright.config.ts` from `docs/templates/playwright.config.ts` to `apps/web/`.
3. Copy `eslint.config.ts` from `docs/templates/eslint.config.ts`.
4. Copy `lib/env.ts`, `lib/api/client.ts`, and `proxy.ts` from frontend blueprints.
5. Install pinned versions from `standards.manifest.json`.

---

## Step 12: Project Domain Documentation

Copy templates from `docs/templates/` into repository `docs/domain/`:

- `ubiquitous-language.md`
- `aggregate-inventory.md`
- `feature-inventory.md`
- `exception-inventory.md`
- `read-model-inventory.md`
- `frontend-feature-inventory.md`
- `frontend-api-endpoints.md`

---

## Step 13: Verify

```bash
dotnet tool restore
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm install --frozen-lockfile
pnpm lint && pnpm type-check && pnpm test && pnpm build
dotnet run --project apps/api/src/{ProjectName}.AppHost
```

Complete `docs/guides/definition-of-done.md`.
