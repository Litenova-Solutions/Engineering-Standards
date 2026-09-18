# Configuration

## Intent


Repository configuration should make builds repeatable and fail before a deployment starts with missing or invalid values. Version pins, compiler rules, environment access, and secret handling have one defined owner.

## Agent Summary {#agent-summary}


- The SDK is pinned at the root with patch roll-forward only. (standards/rule/workspace-config.pin-the-sdk-at-the-workspace-root)
- One props file owns the .NET build settings. (standards/rule/workspace-config.centralize-net-build-settings)
- NuGet versions live in one central props file. (standards/rule/workspace-config.centralize-nuget-versions)
- Local .NET tools are pinned in the tool manifest. (standards/rule/workspace-config.commit-the-tool-manifest)
- Configuration binds to validated options at startup. (standards/rule/workspace-config.validate-backend-options-at-startup)
- Frontends read environment values through one validated module. (standards/rule/workspace-config.validate-frontend-environment-access)
- Tracked configuration carries placeholders only. (standards/rule/workspace-config.keep-secrets-outside-source-control)
- One workspace owns the frontend dependency graph. (standards/rule/workspace-config.use-one-frontend-dependency-graph)
- The JavaScript toolchain is pinned in the root manifest. (standards/rule/workspace-config.pin-the-javascript-toolchain)

## Standards


### Pin the SDK at the workspace root (standards/rule/workspace-config.pin-the-sdk-at-the-workspace-root)

**Requirement:** Root `global.json` MUST pin the manifest SDK version and permit patch roll-forward only.

**Rationale:** `dotnet` invoked from the workspace root and from `apps/api/` then selects the same feature band.

### Centralize .NET build settings (standards/rule/workspace-config.centralize-net-build-settings)

**Requirement:** `apps/api/Directory.Build.props` MUST set the profile target framework and enable nullable types, implicit usings, and warnings as errors.

**Rationale:** One file then owns the settings that would otherwise drift between projects.

### Centralize NuGet versions (standards/rule/workspace-config.centralize-nuget-versions)

**Requirement:** `apps/api/Directory.Packages.props` MUST enable central package management and carry the exact manifest pins.

**Rationale:** Individual project files then reference package names without versions, so no project can drift.

### Commit the tool manifest (standards/rule/workspace-config.commit-the-tool-manifest)

**Requirement:** Root `.config/dotnet-tools.json` MUST pin every required local .NET tool.

**Rationale:** A tool matching a framework package uses the compatible manifest pin, so local and CI runs use one version.

### Validate backend options at startup (standards/rule/workspace-config.validate-backend-options-at-startup)

**Requirement:** A configuration section MUST bind to a named options class validated for required fields, ranges, and formats at startup.

**Rationale:** Reading a required setting through a raw configuration lookup defers the failure to the first request that needs it.

### Validate frontend environment access (standards/rule/workspace-config.validate-frontend-environment-access)

**Requirement:** A frontend MUST read environment variables through `lib/env.ts` and separate server-only from browser-visible values.

**Rationale:** Browser-visible names use the framework prefix, so an unprefixed value cannot reach the bundle by accident.

### Keep secrets outside source control (standards/rule/workspace-config.keep-secrets-outside-source-control)

**Requirement:** A tracked configuration file MUST contain only safe defaults and placeholders.

**Rationale:** Local development uses user secrets and hosted environments use the deployment platform, so no real value needs to be tracked.

### Use one frontend dependency graph (standards/rule/workspace-config.use-one-frontend-dependency-graph)

**Requirement:** A TypeScript workspace MUST use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`.

**Rationale:** A nested lockfile lets one application resolve a different version than the workspace CI installs.

### Pin the JavaScript toolchain (standards/rule/workspace-config.pin-the-javascript-toolchain)

**Requirement:** Root `package.json` MUST declare the manifest pnpm release in `packageManager` and a compatible Node.js engine.

**Rationale:** CI provisions that Node.js release and invokes the declared pnpm release, so local and CI resolve identically.

### Pin the React version in the ESLint flat config (standards/rule/workspace-config.pin-the-react-version-in-the-eslint-flat-config)

**Requirement:** A Next.js ESLint flat config MUST set a concrete `settings.react.version` rather than leave it at `detect`.

**Rationale:** Version detection calls context APIs that the pinned ESLint release removed, and a concrete version skips detection entirely.

## Conventions


### Keep environment examples beside applications (standards/rule/workspace-config.keep-environment-examples-beside-applications)

**Default:** Keep a `.env.example` beside each frontend and deployable host listing required names and safe values.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The example sits next to the options module that reads those names, so both change together.

### Keep local overrides untracked (standards/rule/workspace-config.keep-local-overrides-untracked)

**Default:** Keep developer overrides in ignored local files or a platform secret store.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second committed environment-specific source competes with the deployment platform for the same value.

### Keep logging configuration provider-neutral (standards/rule/workspace-config.keep-logging-configuration-provider-neutral)

**Default:** Emit structured logs through standard logging abstractions and keep exporter configuration in hosts.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application code then carries no provider choice, so an exporter change stays inside deployment settings.

### Keep documentation directories out of build-artifact ignore rules (standards/rule/workspace-config.keep-documentation-directories-out-of-build-artifact-ignore-rules)

**Default:** Exclude `docs/releases/` from build-artifact ignore rules such as `[Rr]elease/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A platform `.gitignore` commonly matches that documentation directory by accident and silently untracks release records.

**Example:**

```gitignore
[Rr]elease/
[Rr]eleases/
!docs/releases/
!docs/releases/*.md
```

Confirm with `git check-ignore docs/releases/<file>.md` that no release record is ignored. The example applies the same negation to any other documentation directory whose name collides with a build-output pattern.

## Reference example

This informative example demonstrates `standards/rule/workspace-config.validate-backend-options-at-startup` and `standards/rule/workspace-config.keep-secrets-outside-source-control`.

`EmailOptions` binds the `Email` section, validates its endpoint and sender during startup, and is injected through `IOptions<EmailOptions>`. The consumer workspace secret store supplies the credential.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/workspace-config.pin-the-sdk-at-the-workspace-root | static | `global.json` declares the manifest SDK version with patch-only roll-forward. |
| standards/rule/workspace-config.centralize-net-build-settings | static | `Directory.Build.props` declares the target framework and each required build setting. |
| standards/rule/workspace-config.centralize-nuget-versions | static | `Directory.Packages.props` enables central management and each project reference omits its version. |
| standards/rule/workspace-config.commit-the-tool-manifest | static | `.config/dotnet-tools.json` pins each required tool at its manifest-compatible version. |
| standards/rule/workspace-config.validate-backend-options-at-startup | static | `OptionsValidationTests` asserts startup fails when a required configuration value is absent or malformed. |
| standards/rule/workspace-config.validate-frontend-environment-access | static | `node standards/tools/validate-ui.mjs` reports direct environment access outside the environment module. |
| standards/rule/workspace-config.keep-secrets-outside-source-control | static | The CI secret scan fails when a tracked file under `apps/` or the root carries a credential-shaped value. |
| standards/rule/workspace-config.use-one-frontend-dependency-graph | static | `pnpm install --frozen-lockfile` succeeds from the root and no nested lockfile is tracked. |
| standards/rule/workspace-config.pin-the-javascript-toolchain | static | Root `package.json` declares the manifest pnpm release and its Node.js engine range. |
| standards/rule/workspace-config.pin-the-react-version-in-the-eslint-flat-config | static | The flat config declares a concrete `settings.react.version` and `pnpm lint` runs without a detection error. |
| standards/rule/workspace-config.keep-environment-examples-beside-applications | inspection | Each frontend and host directory holds an environment example listing required names with safe values. |
| standards/rule/workspace-config.keep-local-overrides-untracked | inspection | The ignore rules cover local settings files and no second environment-specific source is tracked. |
| standards/rule/workspace-config.keep-logging-configuration-provider-neutral | inspection | Application source resolves only logging abstractions, and exporters appear in host registration. |
| standards/rule/workspace-config.keep-documentation-directories-out-of-build-artifact-ignore-rules | static | `git check-ignore docs/releases` reports no match. |
