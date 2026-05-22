# Runbook: Investigate a 5xx Spike

This runbook guides investigation of an elevated HTTP 5xx error rate in the production API.

---

## Step 1: Confirm and Scope the Spike

Check the monitoring dashboard for:

- Current 5xx rate vs. baseline.
- Which endpoints are affected (all, or specific ones).
- When the spike started.
- Whether the spike correlates with a recent deployment.

```bash
# If using structured logs (Datadog, Grafana Loki, etc.) — adjust to your platform
# Example: count 5xx by endpoint in the last 10 minutes
grep '"status":5' /var/log/api/access.log | jq -r '.path' | sort | uniq -c | sort -rn | head 20
```

---

## Step 2: Check Recent Deployments

If the spike started within 30 minutes of a deployment, rollback may be the fastest resolution. See `docs/runbooks/rollback-release.md`.

```bash
# Check deployment history (adjust to your platform)
kubectl rollout history deployment/api
```

---

## Step 3: Examine Application Logs

Filter for error-level logs and look for stack traces or repeated exceptions:

```bash
# Structured log query for errors in the last 5 minutes
# Adjust to your logging platform

# Example: recent error logs from the API container
kubectl logs deployment/api --since=5m | grep '"level":"error"'
```

Common patterns:

| Pattern | Likely cause |
|:---|:---|
| `DbUpdateException`, `Npgsql` exceptions | Database issue — proceed to step 4 |
| `SocketException`, `HttpRequestException` | Downstream service issue — proceed to step 5 |
| `NullReferenceException`, `KeyNotFoundException` | Application bug — check recent commits |
| `Microsoft.Extensions.Options.OptionsValidationException` | Misconfiguration — check environment variables |
| `OutOfMemoryException` | Memory pressure — check container resource limits |

---

## Step 4: Check Database Health

```bash
# Check PostgreSQL connection count and active queries
psql "$PROD_DB_URL" -c """
  SELECT count(*) AS connection_count,
         state,
         wait_event_type,
         wait_event
  FROM pg_stat_activity
  GROUP BY state, wait_event_type, wait_event
  ORDER BY connection_count DESC;
"""

# Check for long-running queries (over 30 seconds)
psql "$PROD_DB_URL" -c """
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
  FROM pg_stat_activity
  WHERE state != 'idle'
    AND (now() - pg_stat_activity.query_start) > interval '30 seconds'
  ORDER BY duration DESC;
"""
```

If you see many connections in the `waiting` state or long-running queries, the database may be under lock contention. This can happen when:

- A long migration is running.
- A slow query is blocking others.
- Connection pool exhaustion is occurring.

To terminate a blocking query:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = <blocking-pid>;
```

Check the Outbox health endpoint to confirm events are still being processed:

```bash
curl https://api.yourdomain.com/health
```

---

## Step 5: Check Downstream Services

If application logs show network errors to a downstream service:

```bash
# Test connectivity from inside the API pod or container
kubectl exec deployment/api -- curl -f https://downstream-service.yourdomain.com/health
```

If the downstream service is unavailable, the fix may be outside your control. Options:

- Enable a circuit breaker to fail fast rather than timing out.
- Return a degraded response for affected features.
- Display a maintenance message on the frontend.

---

## Step 6: Check Memory and CPU

```bash
# Kubernetes resource usage
kubectl top pods -n your-namespace

# Docker stats (if not on Kubernetes)
docker stats
```

If memory is near the container limit:
- Increase the memory limit temporarily.
- Identify the source of the leak (add heap dumps if the platform supports it).
- Plan a permanent fix.

---

## Step 7: Engage the On-Call Engineer

If the spike is not resolved within 15 minutes and user impact is significant:

- Page the engineering lead.
- Post status to the team's incident channel.
- Consider whether a rollback is appropriate.

---

## Step 8: Post-Incident

After the spike is resolved:

- Confirm error rate has returned to baseline.
- Document the root cause.
- Create a follow-up ticket for the permanent fix.
- If the spike was caused by a deployment, add a check to the deployment process to catch the issue earlier.
