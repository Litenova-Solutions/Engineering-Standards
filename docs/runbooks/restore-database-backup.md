# Runbook: Restore a Database Backup

This runbook covers restoring a PostgreSQL database from a backup. This is a destructive operation that replaces the current database state with the backup state. All changes made after the backup was taken will be lost.

---

## When to Use This

Use this runbook when:

- A failed migration has left the database in an inconsistent state that cannot be repaired.
- Data was corrupted or accidentally deleted.
- A deployment caused irreversible data loss.
- The database is unrecoverable and needs to be rebuilt from backup.

**This is a last resort.** Explore all other options before restoring from backup.

---

## Prerequisites

- The backup file is available and its integrity has been verified.
- The engineering lead has authorized the restore.
- Users have been notified of downtime if applicable.
- The application has been taken offline or scaled to zero replicas to prevent writes during restore.

---

## Step 1: Stop the Application

```bash
ssh deploy@your-vps "cd /opt/your-app && docker compose -f infra/docker-compose.prod.yml stop api worker web"
```

---

## Step 2: Locate the Backup

Backups are stored in the designated backup location (local backup volume, Hetzner Storage Box, or another off-server path). Identify the correct backup:

```bash
# Example: list recent backups on the backup host
ls -lt /backups/postgres/ | head -20
```

Choose the most recent backup that predates the corruption or data loss event.

---

## Step 3: Verify Backup Integrity

```bash
# Verify the custom-format backup can be listed
pg_restore --list backup-20260522-120000.dump | head -30

# Check for obvious corruption
echo "Backup file size:"
ls -lh backup-20260522-120000.dump
```

If the backup is corrupt, find an earlier backup.

---

## Step 4: Create a Safety Snapshot of the Current State

Before restoring, take a snapshot of the current (corrupted or broken) state in case it contains data that can be manually recovered:

```bash
pg_dump "$PROD_DB_URL" \
  --format=custom \
  --file="pre-restore-$(date +%Y%m%d%H%M%S).dump"
```

---

## Step 5: Drop and Recreate the Database

For a full restore, the target database must be empty. This is destructive.

```bash
# Connect to the PostgreSQL server (not the target database)
psql "$PROD_POSTGRES_URL" -c "DROP DATABASE your_database;"
psql "$PROD_POSTGRES_URL" -c "CREATE DATABASE your_database OWNER your_user;"
```

---

## Step 6: Restore from Backup

```bash
pg_restore \
  --dbname "$PROD_DB_URL" \
  --verbose \
  --jobs=4 \
  backup-20260522-120000.dump
```

The `--jobs=4` flag uses parallel restore where the format supports it. Adjust based on available CPU cores.

Monitor the output for errors. Some errors (for example, `already exists` errors from extensions) can be ignored. Errors restoring tables or data rows require investigation.

---

## Step 7: Verify the Restore

```bash
# Check that the main tables exist and have data
psql "$PROD_DB_URL" -c """
  SELECT schemaname, tablename, n_live_tup
  FROM pg_stat_user_tables
  ORDER BY n_live_tup DESC
  LIMIT 20;
"""

# Check migration history
psql "$PROD_DB_URL" -c "SELECT * FROM \"__EFMigrationsHistory\" ORDER BY migration_id DESC LIMIT 5;"
```

---

## Step 8: Apply Migrations Since the Backup (If Needed)

If the backup predates the current application schema, apply any missing migrations before starting the application:

```bash
dotnet tool restore

# Apply migrations from the backup's last migration to the current schema
dotnet ef database update \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi
```

This step is only required if the application has newer migrations than what the backup contains.

---

## Step 9: Start the Application

```bash
ssh deploy@your-vps "cd /opt/your-app && docker compose -f infra/docker-compose.prod.yml up -d"
```

---

## Step 10: Verify Application Health

```bash
curl -f https://api.yourdomain.com/health
```

Perform a manual smoke test of critical user workflows.

---

## Post-Restore Actions

- Document the timeline in an incident ticket: when the issue occurred, when it was detected, which backup was used, and what data was lost.
- Assess the data loss window: records created between the backup time and the restore time are gone.
- If any data from the lost window must be recovered, check application logs, event logs, or the pre-restore safety snapshot taken in step 4.
- Review backup frequency and retention policy. If the backup was not recent enough, adjust the backup schedule.
