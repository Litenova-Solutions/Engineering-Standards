# Runbook: Rollback a Release

This runbook covers reverting to the previous production image after a failed deployment.

**Schema rollback is not covered here.** If the failed deployment included a migration, coordinate with the engineering lead before rolling back the application image — rolling back the app without rolling back the schema may cause incompatibilities.

---

## Prerequisites

- The previous known-good image digest is available (from the deployment notes or CI pipeline history).
- You have write access to the deployment target.
- The engineering lead has assessed whether the migration is safe to leave in place.

---

## When to Roll Back

Roll back when:

- Health checks fail after the new image is deployed and do not recover within 5 minutes.
- Error rates spike significantly above baseline within 10 minutes of deployment.
- A critical regression is confirmed in production monitoring.
- The team decides the risk of the new version outweighs the cost of rollback.

---

## Steps

### 1. Identify the previous image digest

```bash
# From deployment notes, or from CI pipeline history for the previous deployment
PREVIOUS_IMAGE=ghcr.io/your-org/your-project/api@sha256:<previous-digest>
```

### 2. Deploy the previous image

```bash
# Azure Container Apps
az containerapp update \
  --name your-api \
  --resource-group your-rg \
  --image "$PREVIOUS_IMAGE"

# Kubernetes
kubectl set image deployment/api api="$PREVIOUS_IMAGE"
kubectl rollout status deployment/api

# Or use Kubernetes native rollback (reverts to previous revision)
kubectl rollout undo deployment/api
```

### 3. Verify health checks

```bash
for i in $(seq 1 12); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)
  echo "Health check: $STATUS"
  [ "$STATUS" = "200" ] && break
  sleep 10
done
```

### 4. Confirm error rate returns to baseline

Monitor the error rate dashboard for 5 minutes after rollback. Confirm the spike has resolved.

### 5. Assess migration state

If a migration was applied as part of the failed deployment:

- Check whether the previous application version is compatible with the current schema.
- Forward-compatible migrations (adding columns with defaults, adding tables) are usually safe to leave in place.
- Destructive or breaking schema changes require an additional migration to restore the previous state. This is a database restore operation — see `docs/runbooks/restore-database-backup.md` if needed.

### 6. Record the rollback

Post a note to the team channel with:

- Date and time of rollback.
- Image rolled back to.
- Image rolled back from.
- Reason for rollback.
- Migration state (left in place or reverted).
- Owner of the follow-up investigation.

---

## After Rollback

The failed release must be investigated before re-deployment. Do not re-deploy the same image without identifying and fixing the cause of the failure.

Open a postmortem ticket with:

- Timeline of events.
- What broke (based on logs and metrics).
- What was deployed.
- How it was detected.
- Immediate remediation.
- Preventative actions.
