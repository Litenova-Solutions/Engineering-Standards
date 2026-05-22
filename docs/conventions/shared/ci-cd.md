# CI/CD

This document defines the continuous integration and delivery pipeline. Read it before setting up a new project pipeline or modifying an existing workflow.

---

## Agent Quick Rules

- Every PR MUST pass all CI gates defined in `docs/conventions/shared/ci.md` before merge.
- MUST build a single Docker image artifact per service; MUST NOT rebuild between staging and production.
- MUST generate the OpenAPI spec and TypeScript types as part of CI; MUST run the freshness gate.
- Production deployments MUST require manual approval after staging smoke tests pass.
- MUST run EF Core migration review before any database migration reaches production.
- Rollback MUST be available within 5 minutes of a failed production deployment.

---

## 1. Pipeline Stages

```
PR checks → Build → Test → Artifact → Staging deploy → Staging smoke → Prod approval → Prod deploy
```

| Stage | What it does |
|:---|:---|
| PR checks | Lint, type-check, unit tests, vulnerability scan, OpenAPI freshness |
| Build | Docker image build, SBOM generation, image scan |
| Test | Integration tests with Testcontainers, Playwright E2E against staging |
| Artifact | Push verified image to container registry |
| Staging deploy | Apply migration, deploy image, run health checks |
| Staging smoke | Playwright smoke test suite against staging environment |
| Prod approval | Manual gate — required reviewer approves the deployment |
| Prod deploy | Apply migration, deploy image, run health checks |

---

## 2. GitHub Actions Workflow Structure

Copy the PR-check workflow from `docs/templates/ci-workflow.yml`. The template covers backend, frontend, OpenAPI freshness, Playwright, and image build jobs. Extend it with deploy stages below for staging and production.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write   # for container registry push
  pull-requests: write

jobs:
  backend-checks:
    name: Backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Restore dotnet tools
        run: dotnet tool restore

      - name: Build
        run: dotnet build apps/api/{ProjectName}.slnx --configuration Release

      - name: Test
        run: |
          dotnet test apps/api/{ProjectName}.slnx \
            --configuration Release \
            --no-build \
            --collect:"XPlat Code Coverage"

      - name: Vulnerability scan
        run: dotnet list apps/api/{ProjectName}.slnx package --vulnerable --include-transitive

  frontend-checks:
    name: Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install (frozen)
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Audit
        run: pnpm audit

  openapi-freshness:
    name: OpenAPI freshness
    runs-on: ubuntu-latest
    needs: [backend-checks]
    steps:
      - uses: actions/checkout@v4

      - name: Build backend
        run: dotnet build apps/api/{ProjectName}.slnx --configuration Release

      - name: Copy generated spec
        run: cp apps/api/src/{ProjectName}.WebApi/bin/Release/net10.0/openapi.json packages/api-types/openapi.json

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install (frozen)
        run: pnpm install --frozen-lockfile

      - name: Regenerate types
        run: pnpm --filter @myproject/api-types generate:api-types

      - name: Freshness check
        run: git diff --exit-code packages/api-types/

  build-image:
    name: Build image
    runs-on: ubuntu-latest
    needs: [backend-checks, frontend-checks, openapi-freshness]
    if: github.ref == 'refs/heads/main'
    outputs:
      image-digest: ${{ steps.push.outputs.digest }}
    steps:
      - uses: actions/checkout@v4

      - name: Build and push backend image
        id: push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile.api
          push: true
          tags: ghcr.io/${{ github.repository }}/api:${{ github.sha }}
          build-args: |
            GIT_SHA=${{ github.sha }}
            BUILD_TIMESTAMP=${{ github.event.head_commit.timestamp }}

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/${{ github.repository }}/api:${{ github.sha }}

      - name: Scan image
        uses: anchore/scan-action@v4
        with:
          image: ghcr.io/${{ github.repository }}/api:${{ github.sha }}
          fail-build: true
          severity-cutoff: high

  deploy-staging:
    name: Deploy to staging
    runs-on: ubuntu-latest
    needs: [build-image]
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Generate migration script
        run: |
          dotnet tool restore
          dotnet ef migrations script \
            --project apps/api/src/{ProjectName}.Infrastructure \
            --startup-project apps/api/src/{ProjectName}.WebApi \
            --output migration.sql \
            --idempotent

      - name: Apply migration (staging)
        run: |
          # Project-specific: use psql, Flyway, or a migration runner
          psql "${{ secrets.STAGING_DB_URL }}" -f migration.sql

      - name: Deploy image
        run: |
          # Project-specific: kubectl, az containerapp update, etc.
          echo "Deploying ${{ needs.build-image.outputs.image-digest }} to staging"

  smoke-staging:
    name: Smoke tests (staging)
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install (frozen)
        run: pnpm install --frozen-lockfile

      - name: Run Playwright smoke suite
        run: pnpm exec playwright test --config apps/web/playwright.config.ts --grep @smoke
        env:
          PLAYWRIGHT_BASE_URL: ${{ vars.STAGING_URL }}

  deploy-production:
    name: Deploy to production
    runs-on: ubuntu-latest
    needs: [smoke-staging]
    environment: production   # requires manual approval
    steps:
      - uses: actions/checkout@v4

      - name: Generate migration script
        run: |
          dotnet tool restore
          dotnet ef migrations script \
            --project apps/api/src/{ProjectName}.Infrastructure \
            --startup-project apps/api/src/{ProjectName}.WebApi \
            --output migration.sql \
            --idempotent

      - name: Apply migration (production)
        run: psql "${{ secrets.PROD_DB_URL }}" -f migration.sql

      - name: Deploy image
        run: echo "Deploying ${{ needs.build-image.outputs.image-digest }} to production"
```

---

## 3. OpenAPI Freshness Gate

The OpenAPI freshness gate ensures the committed spec and TypeScript types match the current backend code. It runs on every PR.

```bash
# 1. Build backend (generates openapi.json into the WebApi output directory)
dotnet build apps/api/{ProjectName}.slnx --configuration Release

# 2. Copy generated spec
cp apps/api/src/{ProjectName}.WebApi/bin/Release/net10.0/openapi.json packages/api-types/openapi.json

# 3. Regenerate TypeScript types
pnpm --filter @myproject/api-types generate:api-types

# 4. Fail if the generated files differ from what was committed
git diff --exit-code packages/api-types/openapi.json packages/api-types/src/api.d.ts
```

Build-time OpenAPI generation uses `Microsoft.Extensions.ApiDescription.Server`. See `docs/conventions/backend/13-deployment-and-migrations.md` for the MSBuild setup.

---

## 4. Branch Protection

The `main` branch MUST have these protections:

- Required status checks: `backend-checks`, `frontend-checks`, `openapi-freshness`.
- Require branches to be up to date before merging.
- Dismiss stale reviews when new commits are pushed.
- Require at least one approval.
- MUST NOT allow force push.
- MUST NOT allow deletion.

---

## 5. Migration Safety

Database migrations in production MUST be reviewed before execution:

1. Generate the migration SQL script in CI using `dotnet ef migrations script --idempotent`.
2. Store the script as a CI artifact.
3. A designated reviewer reads the script and approves the deployment.
4. The approved script runs against the production database before the new image is deployed.

Never run `Database.MigrateAsync()` on application startup in production. See `docs/conventions/backend/13-deployment-and-migrations.md`.

---

## 6. Rollback

Rollback means deploying the previously known-good image digest. It does NOT include schema rollback — backward-incompatible migrations must be planned before deployment.

Rollback steps are in `docs/runbooks/rollback-release.md`.

The previous image digest MUST be recorded in the deployment artifact. When rollback is needed, re-run the deploy job with the previous digest instead of the current one.

---

## 7. Environment Secrets

| Secret | Where to store |
|:---|:---|
| JWT signing secret | GitHub Secrets (CI) and server `.env` (runtime) |
| Database connection string | GitHub Secrets (CI migrations) and server `.env` (runtime) |
| Container registry credentials | GitHub Secrets |
| SSH deploy key | GitHub Secrets |
| External API keys | GitHub Secrets and server `.env` |

Deploy jobs SSH to the VPS and pass image digests as environment variables. Do not store production secrets in the repository.

---

## 8. SBOM and Image Scanning

Every production image MUST have a Software Bill of Materials (SBOM) generated and attached as a CI artifact. The SBOM documents every package included in the image.

The image scan MUST block deployment on high or critical severity CVEs. Exceptions require an ADR with the CVE reference, justification, and a remediation date.
