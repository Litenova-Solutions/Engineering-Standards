# Configuration

## Intent

Repository configuration should make builds repeatable and fail before a deployment starts with missing or invalid values. Version pins, compiler rules, environment access, and secret handling have one defined owner.

## Agent Summary {#agent-summary}

- Pin the .NET SDK in root `global.json` from the manifest.
- Manage NuGet versions in `apps/api/Directory.Packages.props`.
- Set shared .NET build rules in `apps/api/Directory.Build.props`.
- Use one root pnpm workspace and lockfile when TypeScript exists.
- Bind backend settings through validated options.
- Read frontend environment variables through one validated module per app.
- Keep secrets outside tracked files and generated output.

## Standards

### Pin the SDK at the repository root (CONFIG.SDK.001)

Root `global.json` uses the SDK version from `standards.manifest.json` and permits patch roll-forward only. Running `dotnet` from the repository root and from `apps/api/` must select the same feature band.

### Centralize .NET build settings (CONFIG.BUILD.001)

`apps/api/Directory.Build.props` sets the target framework from the profile and enables:

- Nullable reference types.
- Implicit usings.
- Warnings as errors.
- Build-time code-style enforcement.
- Deterministic builds.
- Continuous integration build metadata when CI is active.

Do not enable preview language features without a project decision.

### Centralize NuGet versions (CONFIG.NUGET.001)

`apps/api/Directory.Packages.props` enables central package management and copies exact NuGet pins from the manifest. Individual project files contain package names without version attributes.

### Commit the tool manifest (CONFIG.TOOLS.001)

Root `.config/dotnet-tools.json` pins every required local .NET tool. A tool version that corresponds to a framework package uses the compatible manifest pin.

### Validate backend options at startup (CONFIG.OPTIONS.001)

Bind each configuration section to a named options class. Validate required fields, ranges, and formats during startup. Do not access required settings through `configuration["Key"]!` or defer discovery until the first request.

### Validate frontend environment access (CONFIG.FRONTEND.001)

Each frontend reads environment variables through `lib/env.ts` or an explicit project equivalent. Separate server-only and browser-visible values. Browser-visible names use the framework's public prefix.

Application modules do not read `process.env` directly.

### Keep secrets outside source control (CONFIG.SECRETS.001)

Tracked configuration files contain safe defaults and placeholders only. Secrets come from user secrets for local development and from the deployment platform for hosted environments.

Do not place credentials in `.env.example`, test snapshots, logs, container layers, generated files, or pull request descriptions.

### Use one frontend dependency graph (CONFIG.PNPM.001)

Repositories with TypeScript use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`. Use frozen installation in CI. Do not commit nested lockfiles under applications.

## Conventions

### Keep environment examples beside applications

Each frontend and deployable host may own a `.env.example` or configuration reference listing required names, safe example values, and the owning options or environment module.

### Keep local overrides untracked

Use ignored local settings files or platform secret stores for developer values. Do not add a second committed environment-specific source when the deployment platform owns the value.

### Keep logging configuration provider-neutral

Application code emits structured logs through standard logging abstractions. Exporter and sink configuration remains in hosts and deployment settings.

## Examples

`EmailOptions` binds the `Email` section, validates its endpoint and sender during startup, and is injected through `IOptions<EmailOptions>`. The consumer repository's secret store supplies the credential.

## Verification

- Run `dotnet --version` from the repository root and compare it with the manifest policy.
- Inspect project files for inline package versions.
- Build with warnings as errors.
- Search for direct configuration indexers and direct `process.env` access.
- Scan tracked files and generated output for secrets.
- Run `pnpm install --frozen-lockfile` when TypeScript exists.
