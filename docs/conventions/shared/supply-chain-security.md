# Supply-Chain Security

This document defines the required practices for managing dependency risk. Read it before adding a package to any project, and before responding to a supply-chain incident.

---

## Agent Quick Rules

- MUST use exact version pins (no `^` or `~`) for framework, auth, build, and security-sensitive packages.
- MUST run `pnpm install --frozen-lockfile` in CI; MUST NOT run `pnpm install` without `--frozen-lockfile` in CI.
- MUST run `pnpm audit` and `dotnet list package --vulnerable` in every CI pipeline.
- MUST NOT install packages published within the last 48 hours without explicit team review.
- MUST NOT install canary, alpha, or pre-release packages in production projects.
- TanStack packages require mandatory advisory verification before install or upgrade (see section 6).

---

## 1. Lockfile Pinning

Lockfiles are the first line of defense. They pin the exact resolved version of every dependency and sub-dependency.

```bash
# Correct CI install — fails if lockfile is out of sync
pnpm install --frozen-lockfile

# Wrong — allows lockfile drift in CI
pnpm install
```

The `pnpm-lock.yaml` MUST be committed to source control. MUST NOT appear in `.gitignore`.

For .NET, `Directory.Packages.props` pins all package versions centrally. No `<PackageReference>` in individual projects specifies a `Version` attribute.

```xml
<!-- Directory.Packages.props -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
    <!-- ... all packages explicitly versioned ... -->
  </ItemGroup>
</Project>
```

---

## 2. Version Pinning Rules

```json
// package.json — production projects
{
  "dependencies": {
    // GOOD: exact version
    "next": "16.2.6",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "@tanstack/react-query": "5.100.10",
    "zod": "4.4.3",

    // BAD: caret or tilde ranges
    "next": "^16.0.0",
    "react": "~19.2.0"
  }
}
```

Exception: devDependencies for non-production tools (linters, formatters) may use caret ranges if the team accepts the risk.

---

## 3. Dependency Cooldown

Do NOT install or upgrade to an npm package version published within the last 48 hours without explicit team review. This applies even to established packages. Supply-chain attacks commonly target the window between a legitimate package release and the community detecting a compromise.

Check the npm page for the publish date before adding or upgrading a package:

```bash
npm view <package-name> time
```

When an upgrade is required urgently (for example, a CVE patch), document the exception in the PR description with the CVE reference.

---

## 4. Vulnerability Scanning

Run vulnerability scans in every CI pipeline.

```bash
# Frontend
pnpm audit

# .NET
dotnet list src/{ProjectName}.slnx package --vulnerable --include-transitive
```

Both commands MUST produce zero high or critical severity findings. Exceptions require an ADR with the justification and the planned remediation date.

---

## 5. No `latest` Ranges

MUST NOT use `latest` as a version in `package.json` or `Directory.Packages.props`. `latest` resolves differently across environments and makes builds non-reproducible.

```json
// BAD
"dependencies": {
  "some-package": "latest"
}
```

---

## 6. TanStack Advisory: GHSA-g7cv-rxg3-hmpx

GitHub Advisory GHSA-g7cv-rxg3-hmpx documents 84 malicious versions across 42 `@tanstack/*` packages. Any install environment that ran `npm install` or `pnpm install` during the incident window should be treated as potentially compromised.

Before installing or upgrading any `@tanstack/*` package:

1. Check the advisory at https://github.com/advisories/GHSA-g7cv-rxg3-hmpx for the list of affected versions.
2. Verify the target version is not in the affected list.
3. Pin to the exact verified version in `package.json`.

The currently approved pinned version is `@tanstack/react-query: 5.100.10`. Do not change this version without repeating the above verification steps and updating this document.

---

## 7. GitHub Actions Permissions

GitHub Actions workflows MUST declare minimal permissions at the workflow level. Do not rely on the default `GITHUB_TOKEN` scope.

```yaml
permissions:
  contents: read
  pull-requests: write  # only if the job posts PR comments
```

Never use `permissions: write-all`. Restrict each workflow to the minimum permissions required for its jobs.

Third-party GitHub Actions MUST be pinned to a commit SHA, not a tag:

```yaml
# GOOD: pinned to commit SHA
- uses: actions/checkout@v4  # v4 = sha256:abc123... (update SHA and comment when upgrading)

# BAD: floating tag, not verified
- uses: some-action/tool@latest
```

---

## 8. Incident Response for Compromised Install

When a supply-chain incident is detected in a package your project uses:

1. Remove the affected package version from `package.json` or `Directory.Packages.props`.
2. Run `pnpm install --frozen-lockfile` to verify the lockfile reflects the removal.
3. Rotate any credentials that were available in the build environment during the affected install window. This includes CI secrets, API keys, and service account credentials.
4. Audit CI logs for any unexpected network requests during the affected build runs.
5. Open an incident ticket. Document what was exposed, what was rotated, and the timeline.
6. Pin to a verified clean version and re-run all pipelines.

If the install environment is considered compromised (credentials were exposed), follow `docs/runbooks/handle-leaked-secret.md`.

---

## 9. No Canary or Pre-Release Packages

MUST NOT install canary, alpha, beta, or rc package versions in production projects. These versions are not covered by the package maintainer's stability guarantee and may contain breaking changes.

```json
// BAD
"next": "17.0.0-canary.123",
"react": "19.0.0-rc.1"
```

If a pre-release package is required to test compatibility, document it in a project ADR and ensure it is never deployed to production.

---

## 10. Trusted Publisher Caution

npm's "trusted publisher" status indicates a package is published from a verified GitHub repository via a GitHub Actions OIDC workflow. It reduces (but does not eliminate) the risk of account compromise-based publishing. Always verify version pins regardless of trusted publisher status.
