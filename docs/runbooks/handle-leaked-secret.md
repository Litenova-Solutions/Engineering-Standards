# Runbook: Handle a Leaked Secret

This runbook covers the immediate response to a confirmed or suspected secret exposure. Act quickly — the window between exposure and exploitation is often short.

---

## What Counts as a Leaked Secret

- A secret, API key, connection string, or credential committed to a Git repository (public or private).
- A secret exposed in CI/CD logs, error messages, or monitoring outputs.
- A secret in a Docker image layer or build artifact.
- A secret shared in an insecure channel (Slack, email, Jira).
- A dependency known to have been compromised during install (see `docs/conventions/shared/supply-chain-security.md`).

---

## Immediate Actions (First 30 Minutes)

### 1. Revoke the secret immediately

Do not wait to confirm whether exploitation occurred. Revoke first.

| Secret type | Revocation action |
|:---|:---|
| JWT signing secret | Deploy a new secret (see `docs/runbooks/rotate-jwt-secret.md`, immediate path) |
| Database password | Rotate on the PostgreSQL server (`ALTER USER ...`) and update server `.env` |
| API key (third-party) | Revoke in the third-party provider's console |
| GitHub Personal Access Token | Revoke in GitHub Settings > Developer settings |
| SSH deploy key | Remove from server `authorized_keys`, generate a new key pair |
| Docker registry credentials | Rotate in the registry console |

### 2. If the secret is in Git history

```bash
# Immediately make the repository private if it is public
# Then invalidate the secret (step 1)

# Do NOT rely on Git rewriting alone — assume the secret is already indexed
# by public scanners and should be treated as compromised.
```

Even if you rewrite Git history with `git filter-branch` or BFG Repo Cleaner, the secret must be considered permanently compromised. GitHub scans and public search engines may have already indexed it.

If the repository is public:
- Make it private immediately.
- Notify GitHub Support that the commit contained credentials so they can purge cached views.

### 3. Notify the incident owner

Page or message the security incident owner within 30 minutes. Include:

- What was leaked.
- Where it was found.
- When it was first exposed (earliest commit date, log timestamp, etc.).
- What has been revoked.

---

## Investigation (First 2 Hours)

### 4. Determine the exposure window

```bash
# For a Git-committed secret, find the first commit that introduced it
git log --all -S '<redacted-secret-prefix>' --diff-filter=A -- '*'
```

The exposure window is from the first commit date to the revocation time.

### 5. Audit access logs

Examine API logs, database audit logs, and server access logs for requests using the compromised credential during the exposure window.

```bash
# Example: search API container logs during exposure window
ssh deploy@your-vps "docker compose -f /opt/your-app/infra/docker-compose.prod.yml logs api --since 2026-05-22T00:00:00"
```

Look for:
- Access from unexpected IP addresses or geolocations.
- Unusual request patterns (bulk reads, data exports, privilege escalation).
- Authentication with the compromised credential after working hours.

### 6. Assess scope

Determine what the secret had access to:

- If a database password: what tables and operations were accessible?
- If an API key: what endpoints and operations did it authorize?
- If a JWT secret: could an attacker have minted arbitrary tokens?

Document the access scope in the incident ticket.

---

## Remediation

### 7. Rotate all secrets in the same environment

If one secret in an environment is compromised, treat all secrets in that environment as potentially compromised. Rotate them all, even if evidence of exploitation is limited to the one confirmed secret.

### 8. Audit CI/CD pipeline

Check that the leaked secret has not been cached in CI/CD runner environments, build caches, or Docker layer caches.

### 9. Review access policies

If the leaked credential had excessive permissions, restrict the replacement credential to the minimum required scope.

---

## Communication

### 10. Internal communication

Within 4 hours of detection, brief the engineering lead, CTO, and relevant stakeholders with:

- What happened.
- What was exposed and for how long.
- What has been done.
- What is still in progress.

### 11. External notification (if applicable)

If personal data of customers was accessible via the compromised credential, legal and data protection obligations apply. Consult the privacy officer immediately. Do not communicate externally without legal review.

---

## Prevention

After the incident is contained:

- Add a `pre-commit` hook or CI check with `gitleaks` or `truffleHog` to detect secrets before they reach Git.
- Review the `docs/conventions/shared/supply-chain-security.md` conventions for CI secret injection.
- Confirm all production secrets are stored in the designated secret manager and not in application config files.
- Add this incident to the team's postmortem process.
