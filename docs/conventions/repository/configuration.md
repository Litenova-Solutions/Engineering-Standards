# Configuration

## Intent


Repository configuration should make builds repeatable and fail before a deployment starts with missing or invalid values. Version pins, compiler rules, environment access, and secret handling have one defined owner.

## Agent Summary {#agent-summary}


- Pin the SDK at the repository root. (CONFIG.SDK.001)
- Centralize .NET build settings. (CONFIG.BUILD.001)
- Centralize NuGet versions. (CONFIG.NUGET.001)
- Commit the tool manifest. (CONFIG.TOOLS.001)
- Validate backend options at startup. (CONFIG.OPTIONS.001)
- Validate frontend environment access. (CONFIG.FRONTEND.001)
- Keep secrets outside source control. (CONFIG.SECRETS.001)
- Use one frontend dependency graph. (CONFIG.PNPM.001)
- Pin the JavaScript toolchain. (CONFIG.NODE.001)

## Standards


### Pin the SDK at the repository root (CONFIG.SDK.001)

**Requirement:** Repositories MUST pin the SDK at the repository root.

**Rationale:** Root `global.json` uses the SDK version from `standards.manifest.json` and permits patch roll-forward only. `dotnet` from the repository root and `apps/api/` selects the same feature band.

### Centralize .NET build settings (CONFIG.BUILD.001)

**Requirement:** Repositories MUST centralize .NET build settings.

**Rationale:** `apps/api/Directory.Build.props` sets the target framework from the profile and enables:

- Nullable reference types.
- Implicit usings.
- Warnings as errors.
- Build-time code-style enforcement.
- Deterministic builds.
- Continuous integration build metadata when CI is active.

The implementation does not enable preview language features without a project decision.

### Centralize NuGet versions (CONFIG.NUGET.001)

**Requirement:** Repositories MUST centralize NuGet versions.

**Rationale:** `apps/api/Directory.Packages.props` enables central package management and copies exact NuGet pins from the manifest. Individual project files contain package names without version attributes.

Enable NuGet lock files and commit the lock file for every project. CI restores with locked mode and fails when dependency resolution differs from the committed graph.

### Commit the tool manifest (CONFIG.TOOLS.001)

**Requirement:** Repositories MUST commit the tool manifest.

**Rationale:** Root `.config/dotnet-tools.json` pins every required local .NET tool. A tool version that corresponds to a framework package uses the compatible manifest pin.

### Validate backend options at startup (CONFIG.OPTIONS.001)

**Requirement:** Repositories MUST validate backend options at startup.

**Rationale:** Each configuration section binds to a named options class. The implementation validates required fields, ranges, and formats during startup. The implementation does not access required settings through `configuration["Key"]!` or defer discovery until the first request.

### Validate frontend environment access (CONFIG.FRONTEND.001)

**Requirement:** Repositories MUST validate frontend environment access.

**Rationale:** Each frontend reads environment variables through `lib/env.ts` or an explicit project equivalent. The frontend separates server-only and browser-visible values. Browser-visible names use the framework's public prefix.

Application modules do not read `process.env` directly.

### Keep secrets outside source control (CONFIG.SECRETS.001)

**Requirement:** Repositories MUST keep secrets outside source control.

**Rationale:** Tracked configuration files contain safe defaults and placeholders only. Secrets come from user secrets for local development and from the deployment platform for hosted environments.

The implementation does not place credentials in `.env.example`, test snapshots, logs, container layers, generated files, or pull request descriptions.

### Use one frontend dependency graph (CONFIG.PNPM.001)

**Requirement:** Repositories MUST use one frontend dependency graph.

**Rationale:** Repositories with TypeScript use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`. The implementation uses frozen installation in CI. The implementation does not commit nested lockfiles under applications.

### Pin the JavaScript toolchain (CONFIG.NODE.001)

**Requirement:** Repositories MUST pin the JavaScript toolchain.

**Rationale:** The root `package.json` declares the exact pnpm release from the manifest in `packageManager` and a Node.js engine compatible with the manifest-pinned LTS release. CI provisions that Node.js release and invokes the declared pnpm release.

The implementation does not rely on a developer's global Node.js or pnpm version. A repository may add `.node-version` or an equivalent version-manager file. That file matches the manifest.

## Conventions


### Keep environment examples beside applications (CONFIG.CONVENTION.001)

**Default:** Keep environment examples beside applications.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each frontend and deployable host may own a `.env.example` or configuration reference listing required names, safe example values. The owning options or environment module.

### Keep local overrides untracked (CONFIG.CONVENTION.002)

**Default:** Keep local overrides untracked.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses ignored local settings files or platform secret stores for developer values. The implementation does not add a second committed environment-specific source when the deployment platform owns the value.

### Keep logging configuration provider-neutral (CONFIG.CONVENTION.003)

**Default:** Keep logging configuration provider-neutral.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application code emits structured logs through standard logging abstractions. Exporter and sink configuration remains in hosts and deployment settings.

### Keep documentation directories out of build-artifact ignore rules (CONFIG.CONVENTION.004)

**Default:** Keep documentation directories out of build-artifact ignore rules.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A platform `.gitignore` commonly ignores build output with case-insensitive patterns such as `[Rr]elease/` and `[Rr]eleases/`. These patterns also match the required `docs/releases/` documentation directory and silently exclude release records from source control. The implementation adds an explicit negation immediately after the build-output patterns so the documentation directory is tracked:

**Example:**

```gitignore
[Rr]elease/
[Rr]eleases/
!docs/releases/
!docs/releases/*.md
```

Confirm with `git check-ignore docs/releases/<file>.md` that no release record is ignored. The example applies the same negation to any other documentation directory whose name collides with a build-output pattern.

## Reference example

This informative example demonstrates `CONFIG.OPTIONS.001` and `CONFIG.SECRETS.001`.

`EmailOptions` binds the `Email` section, validates its endpoint and sender during startup, and is injected through `IOptions<EmailOptions>`. The consumer repository's secret store supplies the credential.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| CONFIG.SDK.001 | static | Repository static check asserts `pin the SDK at the repository root` for the owning paths. |
| CONFIG.BUILD.001 | static | Repository static check asserts `centralize .NET build settings` for the owning paths. |
| CONFIG.NUGET.001 | inspection | Pull request review asserts `centralize NuGet versions` in the owning specification and source paths. |
| CONFIG.TOOLS.001 | inspection | Pull request review asserts `commit the tool manifest` in the owning specification and source paths. |
| CONFIG.OPTIONS.001 | static | Repository static check asserts `validate backend options at startup` for the owning paths. |
| CONFIG.FRONTEND.001 | static | Repository static check asserts `validate frontend environment access` for the owning paths. |
| CONFIG.SECRETS.001 | inspection | Pull request review asserts `keep secrets outside source control` in the owning specification and source paths. |
| CONFIG.PNPM.001 | static | Repository static check asserts `use one frontend dependency graph` for the owning paths. |
| CONFIG.NODE.001 | static | Repository static check asserts `pin the JavaScript toolchain` for the owning paths. |
| CONFIG.CONVENTION.001 | inspection | Pull request review asserts `keep environment examples beside applications` in the owning specification and source paths. |
| CONFIG.CONVENTION.002 | inspection | Pull request review asserts `keep local overrides untracked` in the owning specification and source paths. |
| CONFIG.CONVENTION.003 | static | Repository static check asserts `keep logging configuration provider-neutral` for the owning paths. |
| CONFIG.CONVENTION.004 | static | Repository static check asserts `keep documentation directories out of build-artifact ignore rules` for the owning paths. |
