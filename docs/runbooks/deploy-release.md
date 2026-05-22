# Runbook: Deploy a Release

This runbook covers a standard production deployment from a tagged release. It assumes the CI/CD pipeline has already built, tested, and promoted an image artifact from the staging environment.

---

## Prerequisites

- The staging smoke tests passed for the image being promoted.
- The migration SQL script was generated and reviewed during the CI pipeline.
- The production deployment GitHub environment has been approved.
- You have read access to the container registry and write access to the deployment target.

---

## Steps

### 1. Confirm the artifact

Identify the image digest and migration script from the CI pipeline run:

```bash
# Find the image digest in the CI build-image job output
IMAGE=ghcr.io/your-org/your-project/api@sha256:<digest>

# Find the migration script as a CI artifact (download from GitHub Actions artifacts)
```

The same digest that passed staging MUST be used. Do not rebuild.

### 2. Review the migration script

Open the migration SQL artifact. Confirm:

- No destructive schema changes (no DROP TABLE, no DROP COLUMN without verification).
- Any new NOT NULL columns have a DEFAULT or the migration populates them before adding the constraint.
- Indexes are created CONCURRENTLY where possible to avoid table locks.
- The script is idempotent (uses IF NOT EXISTS, IF EXISTS, CREATE INDEX IF NOT EXISTS).

If the migration is not safe to run, do not proceed. Escalate to the engineering lead.

### 3. Take a pre-migration backup

```bash
# PostgreSQL backup before migration
pg_dump "$PROD_DB_URL" \
  --format=custom \
  --file="backup-$(date +%Y%m%d%H%M%S).dump"
```

Verify the backup file is non-zero before continuing.

### 4. Apply the migration

```bash
psql "$PROD_DB_URL" -f migration.sql
```

Check the output for errors. If any statement failed, do not start the new application version. Investigate and repair before continuing.

### 5. Deploy the new image

Use the platform-specific deployment command:

```bash
# Azure Container Apps example
az containerapp update \
  --name your-api \
  --resource-group your-rg \
  --image "$IMAGE"

# Kubernetes example
kubectl set image deployment/api api="$IMAGE"
kubectl rollout status deployment/api
```

### 6. Verify health checks

Wait for the new version to pass health checks:

```bash
# Poll until healthy
for i in $(seq 1 12); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)
  echo "Health check: $STATUS"
  [ "$STATUS" = "200" ] && break
  sleep 10
done
```

If health checks do not pass within 2 minutes, proceed to `docs/runbooks/rollback-release.md`.

### 7. Smoke test

Run a minimal smoke check against production:

```bash
curl -f https://api.yourdomain.com/health
curl -f https://yourdomain.com/api/health
```

Optionally run the `@smoke` tagged Playwright suite against production if available.

### 8. Record the deployment

Post a deployment note to the team channel with:

- Date and time.
- Image digest deployed.
- Previous image digest (for rollback reference).
- Migration applied (yes/no).
- Who approved and deployed.

---

## On Failure

If any step fails after the migration has been applied, follow `docs/runbooks/rollback-release.md`. The migration cannot be rolled back automatically — coordinate with the engineering lead to assess the rollback risk.
