# Configuration

## Intent

Repository configuration should make builds repeatable and fail before a deployment starts with missing or invalid values. Version pins, compiler rules, environment access, and secret handling have one defined owner.

## Standards

### Validate backend configuration at startup

**Requirement:** A backend configuration section MUST bind to a named settings type validated for required fields, ranges, and formats at startup.

**Rationale:** Reading a required setting through a raw configuration lookup defers the failure to the first request that needs it.

### Validate frontend environment access

**Requirement:** A frontend MUST read environment variables through one validated module separating server-only from browser-visible values, at `src/lib/env.ts` through the framework alias.

**Rationale:** Browser-visible names use the framework prefix, so an unprefixed value cannot reach the bundle by accident.

### Keep secrets outside source control

**Requirement:** A tracked configuration file MUST contain only safe defaults and placeholders.

**Rationale:** Local development uses user secrets and hosted environments use the deployment platform, so no real value needs to be tracked.

### Use one frontend dependency graph

**Requirement:** A TypeScript workspace MUST use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`.

**Rationale:** A nested lockfile lets one application resolve a different version than the workspace CI installs.

### Pin the JavaScript toolchain

**Requirement:** Root `package.json` MUST declare the manifest pnpm stack release in `packageManager` and a Node.js engine matching the manifest node stack release.

**Rationale:** CI provisions that Node.js release and invokes the declared pnpm release, so local and CI resolve identically.

### Pin the React version in the ESLint flat config

**Requirement:** When the workspace holds a React frontend, its ESLint flat config MUST set a concrete `settings.react.version` rather than leave it at `detect`.

**Rationale:** Version detection calls context APIs that the pinned ESLint release removed, and a concrete version skips detection entirely.

## Conventions

### Keep environment examples beside applications

**Default:** Keep a `.env.example` beside each frontend and deployable host listing required names and safe values.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** The example sits next to the options module that reads those names, so both change together.

### Keep local overrides untracked

**Default:** Keep developer overrides in ignored local files or a platform secret store.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A second committed environment-specific source competes with the deployment platform for the same value.

### Keep logging configuration provider-neutral

**Default:** Emit structured logs through standard logging abstractions and keep exporter configuration in hosts.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Application code then carries no provider choice, so an exporter change stays inside deployment settings.

### Keep documentation directories out of build-artifact ignore rules

**Default:** Exclude a documentation directory from a build-artifact ignore rule that matches it by accident.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A platform `.gitignore` commonly matches a documentation name and silently untracks its records.

**Example:**

```gitignore
[Oo]utput/
!docs/<directory>/
!docs/<directory>/*.md
```

Confirm with `git check-ignore docs/<directory>/<file>.md` that no record is ignored.

## Reference example

This informative example demonstrates `litespec/workspace/config#validate-backend-configuration-at-startup` and `litespec/workspace/config#keep-secrets-outside-source-control`.

`EmailSettings` binds the `Email` section, validates its endpoint and sender during startup, and is injected as a settings type. The consumer workspace secret store supplies the credential.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/config#validate-backend-configuration-at-startup | guidance | Does each backend section bind a validated settings type that fails startup on bad values? |
| litespec/workspace/config#validate-frontend-environment-access | guidance | Does each frontend read environment values only through its validated module with server values separated? |
| litespec/workspace/config#keep-secrets-outside-source-control | guidance | Does each tracked configuration file carry only safe defaults and placeholders? |
| litespec/workspace/config#use-one-frontend-dependency-graph | guidance | Does the workspace use one root manifest and lockfile with no nested lockfile tracked? |
| litespec/workspace/config#pin-the-javascript-toolchain | guidance | Does root package.json declare the manifest pnpm release and a matching Node engine? |
| litespec/workspace/config#pin-the-react-version-in-the-eslint-flat-config | guidance | Does each React flat config set a concrete settings.react.version? |
| litespec/workspace/config#keep-environment-examples-beside-applications | guidance | Does each frontend and host directory hold an environment example with safe values? |
| litespec/workspace/config#keep-local-overrides-untracked | guidance | Are local overrides ignored with no second tracked environment-specific source? |
| litespec/workspace/config#keep-logging-configuration-provider-neutral | guidance | Does application source use only logging abstractions with exporters in hosts? |
| litespec/workspace/config#keep-documentation-directories-out-of-build-artifact-ignore-rules | guidance | Does git check-ignore report no match for each documentation directory? |
