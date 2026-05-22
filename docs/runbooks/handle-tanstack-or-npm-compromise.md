# Runbook: Handle a TanStack or npm Supply-Chain Compromise

This runbook covers the response when a project dependency is confirmed to be part of a supply-chain compromise, including incidents similar to GHSA-g7cv-rxg3-hmpx (TanStack malicious publish incident).

---

## Immediate Assessment

### 1. Confirm the affected version

Check the GitHub Security Advisory for the specific packages and versions affected:

- GHSA-g7cv-rxg3-hmpx: https://github.com/advisories/GHSA-g7cv-rxg3-hmpx

```bash
# Check which version of the affected package you have installed
pnpm list @tanstack/react-query

# Check your lockfile for the exact resolved version
grep "@tanstack/react-query" pnpm-lock.yaml
```

### 2. Determine whether your install environment was affected

The advisory will document the window during which malicious versions were published. If your CI pipeline ran `pnpm install` during the affected window and the affected package was in your dependency tree, treat the CI environment as compromised.

---

## If Your Install Environment Is Compromised

### 3. Rotate all CI secrets immediately

Any secret accessible to the CI runner during the affected window must be rotated:

- JWT signing secrets → `docs/runbooks/rotate-jwt-secret.md`
- Database passwords → rotate via the database platform
- Third-party API keys → revoke and reissue in each provider's console
- Container registry credentials → rotate
- Cloud access credentials → rotate or revoke and re-issue

Do not wait to determine whether the secrets were exfiltrated. Rotate immediately.

### 4. Audit CI logs

Review the CI logs from the affected window for:

- Unexpected network requests (the malicious package may have exfiltrated secrets).
- Unexpected file modifications.
- Unusual process spawning during `pnpm install`.

### 5. Audit production deployments

If any artifacts (Docker images, deployment packages) were built during the affected window:

- Do not deploy them.
- If any have already been deployed, assess whether to roll back.
- Roll back is recommended if the malicious package was executed during the build.

---

## Remediate the Dependency

### 6. Update to a clean version

```bash
# Update the affected package to a verified clean version
# Check the advisory for the list of safe versions

# Update package.json to exact safe version
# "@tanstack/react-query": "5.100.10"  ← example; verify against the advisory

# Reinstall with frozen lockfile disabled (we are explicitly changing the version)
pnpm install

# Commit the updated package.json and pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "fix: update @tanstack/react-query to verified safe version 5.100.10"
```

### 7. Rebuild all artifacts from the clean version

```bash
# Force a clean install
rm -rf node_modules
pnpm install --frozen-lockfile

# Run the full build pipeline
pnpm build
pnpm test
pnpm audit
```

### 8. Push rebuilt artifacts to production

After confirming clean builds and passing tests, deploy the rebuilt artifacts following `docs/runbooks/deploy-release.md`.

---

## Prevention Going Forward

After resolving the incident:

- Verify that all `@tanstack/*` packages in `package.json` are pinned to exact versions.
- Add the dependency cooldown rule from `docs/conventions/shared/supply-chain-security.md` to your PR checklist.
- Confirm `pnpm audit` runs in every CI pipeline.
- Consider adding a GitHub Secret Scanning alert rule for your organization.
- Document the incident in a postmortem with preventative actions.
