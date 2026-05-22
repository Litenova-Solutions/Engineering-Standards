# Runbook: Investigate a Slow Query

This runbook covers diagnosing and resolving slow database queries in production.

---

## Step 1: Identify Slow Queries

### From application logs

Queries that exceed a duration threshold are logged by the EF Core query interceptor or by OpenTelemetry traces. Search for slow query log entries:

```bash
# Adjust to your logging platform
grep '"duration_ms"' /var/log/api/app.log | jq 'select(.duration_ms > 1000)'
```

### From PostgreSQL directly

```sql
-- Queries currently running for more than 5 seconds
SELECT
    pid,
    now() - query_start AS duration,
    left(query, 200) AS query_preview,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE state != 'idle'
  AND (now() - query_start) > interval '5 seconds'
ORDER BY duration DESC;
```

```sql
-- Top slow queries from pg_stat_statements (requires the extension)
SELECT
    left(query, 200) AS query,
    calls,
    total_exec_time / calls AS avg_ms,
    total_exec_time,
    rows / calls AS avg_rows
FROM pg_stat_statements
ORDER BY avg_ms DESC
LIMIT 20;
```

Enable `pg_stat_statements` if not already enabled:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

## Step 2: Get the Query Plan

Use `EXPLAIN (ANALYZE, BUFFERS)` on the slow query to get the actual execution plan. Run this against a replica or during low-traffic if the query is expensive.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM posts
WHERE author_id = '00000000-0000-0000-0000-000000000001'
  AND published_at_utc IS NOT NULL
ORDER BY published_at_utc DESC
LIMIT 20;
```

Paste the output into a tool like [explain.dalibo.com](https://explain.dalibo.com) to visualize the plan.

### Warning signs in the plan

| Pattern | Cause |
|:---|:---|
| `Seq Scan` on a large table | Missing index |
| High `rows=` estimate vs. actual rows | Stale table statistics — run `ANALYZE` |
| `Nested Loop` with large inner scans | N+1 query or missing foreign key index |
| `Hash Join` with large memory spill | Join on unindexed columns |
| `buffers: shared hit=` very high | Query scanning too much data |

---

## Step 3: Identify the Missing or Unused Index

```sql
-- Check existing indexes on the table
SELECT
    indexname,
    indexdef,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_indexes
JOIN pg_stat_user_indexes USING (indexrelid)
WHERE tablename = 'posts';
```

If `idx_scan = 0` for an index that should be used, check whether:

- The query's WHERE clause columns match the index column order.
- The query uses a function on the indexed column (for example `LOWER(email)` vs. `email`).
- The data distribution makes a sequential scan cheaper (small table or very low selectivity).

---

## Step 4: Add or Fix the Index

Add a missing index with `CONCURRENTLY` to avoid table locks:

```sql
-- Create index without locking the table
CREATE INDEX CONCURRENTLY ix_posts_author_id_published
    ON posts (author_id, published_at_utc DESC)
    WHERE published_at_utc IS NOT NULL;
```

After verifying the index improves the query, add the corresponding EF Core configuration to `PostConfiguration.cs`:

```csharp
builder.HasIndex(p => new { p.AuthorId, p.PublishedAtUtc })
    .HasFilter("published_at_utc IS NOT NULL")
    .HasDatabaseName("ix_posts_author_id_published");
```

Create a new migration for this index so it is tracked in EF Core's migration history.

---

## Step 5: Update Statistics

If the planner is using bad estimates, update table statistics:

```sql
ANALYZE posts;
```

Or update all tables:

```sql
ANALYZE VERBOSE;
```

---

## Step 6: Verify the Fix

Re-run `EXPLAIN (ANALYZE, BUFFERS)` after adding the index or updating statistics. Confirm:

- The plan now uses an index scan instead of a sequential scan.
- The execution time has decreased.
- The `rows` estimate is closer to the actual rows.

---

## Step 7: Monitor Over Time

After deploying the fix, monitor the slow query log and `pg_stat_statements` to confirm the query no longer appears in the top slow queries.

If the query has improved but still appears, consider:

- Query result caching at the application layer (see `docs/conventions/backend/12-caching.md`).
- Materialized views for expensive aggregations.
- Moving the query to a read replica.
