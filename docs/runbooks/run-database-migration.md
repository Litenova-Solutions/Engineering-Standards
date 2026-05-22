# Runbook: Run a Database Migration

This runbook covers the steps for reviewing and applying an EF Core migration in production. This is NOT automated — it requires human review before execution.

---

## Rules

- MUST NOT run `Database.MigrateAsync()` on application startup in production.
- Every migration script MUST be reviewed by at least one engineer before execution.
- Migrations MUST be generated with `--idempotent` so re-running them is safe.
- Migrations MUST be applied BEFORE the new application version is deployed.

---

## Generating the Migration Script

Migrations are generated in CI as artifacts. If you need to generate one manually:

```bash
# Restore tools
dotnet tool restore

# Generate idempotent SQL migration script
dotnet ef migrations script \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi \
  --configuration Release \
  --output migration.sql \
  --idempotent \
  --no-build

# Or from a specific migration to the latest
dotnet ef migrations script <FromMigration> \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi \
  --output migration.sql \
  --idempotent
```

The `--idempotent` flag wraps each statement in an existence check so the script can be re-run safely if interrupted.

---

## Pre-Execution Checklist

Review the generated `migration.sql` against this checklist before running it:

- [ ] No `DROP TABLE` or `DROP COLUMN` unless the column/table is empty and confirmed unused.
- [ ] New NOT NULL columns have a DEFAULT value or are populated in the same migration.
- [ ] Large table operations use `CREATE INDEX CONCURRENTLY` to avoid locks.
- [ ] The migration does not contain destructive renames without a backfill step.
- [ ] The script has been reviewed by at least one engineer other than the author.
- [ ] A pre-migration backup has been taken.

---

## Taking a Backup

```bash
# Full backup before migration
pg_dump "$PROD_DB_URL" \
  --format=custom \
  --file="pre-migration-$(date +%Y%m%d%H%M%S).dump"

# Verify the backup is non-zero
ls -lh pre-migration-*.dump
```

Store the backup in the designated backup location. Keep it for at least 7 days.

---

## Applying the Migration

```bash
# Run against production
psql "$PROD_DB_URL" -f migration.sql

# Check for errors in the output
echo "Exit code: $?"
```

After applying, verify the schema matches expectations:

```bash
# List recently modified tables
psql "$PROD_DB_URL" -c """
  SELECT schemaname, tablename, tableowner
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"""

# Check migration history in EF Core's __EFMigrationsHistory table
psql "$PROD_DB_URL" -c "SELECT * FROM \"__EFMigrationsHistory\" ORDER BY migration_id DESC LIMIT 5;"
```

---

## Large Table Migrations

For tables with more than approximately 1 million rows, additional care is required:

1. Run the migration during a low-traffic window.
2. Use `CREATE INDEX CONCURRENTLY` for new indexes to avoid table-level locks.
3. For column additions: add as nullable first, backfill in a background job, then add the NOT NULL constraint.
4. For column removals: remove from the application first (deploy with the column ignored), then drop the column in a subsequent migration.

---

## If the Migration Fails

If `psql` reports an error:

1. Do not deploy the new application version.
2. Check whether the migration is partially applied (some statements ran, others failed).
3. If the migration is partially applied, assess whether re-running the idempotent script is safe.
4. If the database is in an inconsistent state, restore from the pre-migration backup using `docs/runbooks/restore-database-backup.md`.
5. Escalate to the engineering lead before continuing.
