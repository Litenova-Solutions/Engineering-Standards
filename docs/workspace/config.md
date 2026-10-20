# Configuration

## Intent

Repository configuration should make builds repeatable and fail before a deployment starts with missing or invalid values. Version pins, compiler rules, environment access, and secret handling have one defined owner.

## Agent Summary {#agent-summary}

- The root sets .NET 10 or later as the SDK floor. (litespec/rule/workspace-config.set-the-sdk-floor-at-the-workspace-root)
- One props file owns the .NET build settings. (litespec/rule/workspace-config.centralize-net-build-settings)
- NuGet versions live in one central props file. (litespec/rule/workspace-config.centralize-nuget-versions)
- Local .NET tools are pinned in the tool manifest. (litespec/rule/workspace-config.commit-the-tool-manifest)
- Configuration binds to validated options at startup. (litespec/rule/workspace-config.validate-backend-options-at-startup)
- Frontends read environment values through one validated module. (litespec/rule/workspace-config.validate-frontend-environment-access)
- Tracked configuration carries placeholders only. (litespec/rule/workspace-config.keep-secrets-outside-source-control)
- One workspace owns the frontend dependency graph. (litespec/rule/workspace-config.use-one-frontend-dependency-graph)
- The JavaScript toolchain is pinned in the root manifest. (litespec/rule/workspace-config.pin-the-javascript-toolchain)
- A React ESLint flat config pins its React version. (litespec/rule/workspace-config.pin-the-react-version-in-the-eslint-flat-config)

## Standards

### Set the SDK floor at the workspace root (litespec/rule/workspace-config.set-the-sdk-floor-at-the-workspace-root)

**Requirement:** Root `global.json` MUST set the first feature band of the manifest dotnet major release as its SDK version and roll forward with `latestMajor`.

**Rationale:** Any SDK from that major release on builds the workspace, so a patch or feature band release needs no change to the repository. The manifest names the major release, and `Directory.Build.props` sets its target framework.

### Centralize .NET build settings (litespec/rule/workspace-config.centralize-net-build-settings)

**Requirement:** `apps/api/Directory.Build.props` MUST set the target framework of the manifest dotnet stack release, and enable nullable types, implicit usings, and warnings as errors.

**Rationale:** One file then owns the settings that would otherwise drift between projects.

### Centralize NuGet versions (litespec/rule/workspace-config.centralize-nuget-versions)

**Requirement:** `apps/api/Directory.Packages.props` MUST enable central package management and carry the exact manifest pins.

**Rationale:** Individual project files then reference package names without versions, so no project can drift.

### Commit the tool manifest (litespec/rule/workspace-config.commit-the-tool-manifest)

**Requirement:** Root `.config/dotnet-tools.json` MUST pin every local .NET tool a documented repository command invokes.

**Rationale:** When a tool ships in the manifest dotnet stack release, its pin matches that release, so local and CI runs use one version.

### Validate backend options at startup (litespec/rule/workspace-config.validate-backend-options-at-startup)

**Requirement:** A configuration section MUST bind to a named options class validated for required fields, ranges, and formats at startup.

**Rationale:** Reading a required setting through a raw configuration lookup defers the failure to the first request that needs it.

### Validate frontend environment access (litespec/rule/workspace-config.validate-frontend-environment-access)

**Requirement:** A frontend MUST read environment variables through one validated module separating server-only from browser-visible values, at `src/lib/env.ts` through the framework alias.

**Rationale:** Browser-visible names use the framework prefix, so an unprefixed value cannot reach the bundle by accident.

### Keep secrets outside source control (litespec/rule/workspace-config.keep-secrets-outside-source-control)

**Requirement:** A tracked configuration file MUST contain only safe defaults and placeholders.

**Rationale:** Local development uses user secrets and hosted environments use the deployment platform, so no real value needs to be tracked.

### Use one frontend dependency graph (litespec/rule/workspace-config.use-one-frontend-dependency-graph)

**Requirement:** A TypeScript workspace MUST use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`.

**Rationale:** A nested lockfile lets one application resolve a different version than the workspace CI installs.

### Pin the JavaScript toolchain (litespec/rule/workspace-config.pin-the-javascript-toolchain)

**Requirement:** Root `package.json` MUST declare the manifest pnpm stack release in `packageManager` and a Node.js engine matching the manifest node stack release.

**Rationale:** CI provisions that Node.js release and invokes the declared pnpm release, so local and CI resolve identically.

### Pin the React version in the ESLint flat config (litespec/rule/workspace-config.pin-the-react-version-in-the-eslint-flat-config)

**Requirement:** When the workspace holds a React frontend, its ESLint flat config MUST set a concrete `settings.react.version` rather than leave it at `detect`.

**Rationale:** Version detection calls context APIs that the pinned ESLint release removed, and a concrete version skips detection entirely.

## Conventions

### Keep environment examples beside applications (litespec/rule/workspace-config.keep-environment-examples-beside-applications)

**Default:** Keep a `.env.example` beside each frontend and deployable host listing required names and safe values.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** The example sits next to the options module that reads those names, so both change together.

### Keep local overrides untracked (litespec/rule/workspace-config.keep-local-overrides-untracked)

**Default:** Keep developer overrides in ignored local files or a platform secret store.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A second committed environment-specific source competes with the deployment platform for the same value.

### Keep logging configuration provider-neutral (litespec/rule/workspace-config.keep-logging-configuration-provider-neutral)

**Default:** Emit structured logs through standard logging abstractions and keep exporter configuration in hosts.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Application code then carries no provider choice, so an exporter change stays inside deployment settings.

### Keep documentation directories out of build-artifact ignore rules (litespec/rule/workspace-config.keep-documentation-directories-out-of-build-artifact-ignore-rules)

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

This informative example demonstrates `litespec/rule/workspace-config.validate-backend-options-at-startup` and `litespec/rule/workspace-config.keep-secrets-outside-source-control`.

`EmailOptions` binds the `Email` section, validates its endpoint and sender during startup, and is injected through `IOptions<EmailOptions>`. The consumer workspace secret store supplies the credential.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/workspace-config.set-the-sdk-floor-at-the-workspace-root | guidance | Does root global.json set the manifest major release's first feature band, such as `10.0.100`, with `latestMajor` roll-forward? |
| litespec/rule/workspace-config.centralize-net-build-settings | guidance | Does Directory.Build.props set the manifest target framework, nullable types, implicit usings, and warnings as errors? |
| litespec/rule/workspace-config.centralize-nuget-versions | guidance | Does Directory.Packages.props enable central management with the manifest pins, and do projects omit versions? |
| litespec/rule/workspace-config.commit-the-tool-manifest | guidance | Does .config/dotnet-tools.json pin each local tool a documented command invokes? |
| litespec/rule/workspace-config.validate-backend-options-at-startup | guidance | Does each configuration section bind a validated options class that fails startup on bad values? |
| litespec/rule/workspace-config.validate-frontend-environment-access | guidance | Does each frontend read environment values only through its validated module with server values separated? |
| litespec/rule/workspace-config.keep-secrets-outside-source-control | guidance | Does each tracked configuration file carry only safe defaults and placeholders? |
| litespec/rule/workspace-config.use-one-frontend-dependency-graph | guidance | Does the workspace use one root manifest and lockfile with no nested lockfile tracked? |
| litespec/rule/workspace-config.pin-the-javascript-toolchain | guidance | Does root package.json declare the manifest pnpm release and a matching Node engine? |
| litespec/rule/workspace-config.pin-the-react-version-in-the-eslint-flat-config | guidance | Does each React flat config set a concrete settings.react.version? |
| litespec/rule/workspace-config.keep-environment-examples-beside-applications | guidance | Does each frontend and host directory hold an environment example with safe values? |
| litespec/rule/workspace-config.keep-local-overrides-untracked | guidance | Are local overrides ignored with no second tracked environment-specific source? |
| litespec/rule/workspace-config.keep-logging-configuration-provider-neutral | guidance | Does application source use only logging abstractions with exporters in hosts? |
| litespec/rule/workspace-config.keep-documentation-directories-out-of-build-artifact-ignore-rules | guidance | Does git check-ignore report no match for each documentation directory? |
