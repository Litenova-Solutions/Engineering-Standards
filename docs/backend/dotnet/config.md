# .NET Configuration

## Intent

Configuration in a .NET backend pins the SDK, build settings, packages, and tools through MSBuild files. The shared provisions live on the stack-neutral page ([Configuration](../../workspace/config.md)); this page holds what .NET alone requires.

## Agent Summary {#agent-summary}

- The root sets .NET 10 or later as the SDK floor. (litespec/backend/dotnet/config#set-the-sdk-floor-at-the-workspace-root)
- One props file owns the .NET build settings. (litespec/backend/dotnet/config#centralize-net-build-settings)
- NuGet versions live in one central props file. (litespec/backend/dotnet/config#centralize-nuget-versions)
- Local .NET tools are pinned in the tool manifest. (litespec/backend/dotnet/config#commit-the-tool-manifest)
- Configuration binds to validated options at startup. (litespec/backend/dotnet/config#validate-backend-options-at-startup)

## Standards

### Set the SDK floor at the workspace root

**Requirement:** Root `global.json` MUST set the first feature band of the manifest dotnet major release as its SDK version and roll forward with `latestMajor`.

**Rationale:** Any SDK from that major release on builds the workspace, so a patch or feature band release needs no change to the repository. The manifest names the major release, and `Directory.Build.props` sets its target framework.

### Centralize .NET build settings

**Requirement:** `apps/api/Directory.Build.props` MUST set the target framework of the manifest dotnet stack release, and enable nullable types, implicit usings, and warnings as errors.

**Rationale:** One file then owns the settings that would otherwise drift between projects.

### Centralize NuGet versions

**Requirement:** `apps/api/Directory.Packages.props` MUST enable central package management and carry the exact manifest pins.

**Rationale:** Individual project files then reference package names without versions, so no project can drift.

### Commit the tool manifest

**Requirement:** Root `.config/dotnet-tools.json` MUST pin every local .NET tool a documented repository command invokes.

**Rationale:** When a tool ships in the manifest dotnet stack release, its pin matches that release, so local and CI runs use one version.

### Validate backend options at startup

**Requirement:** A configuration section MUST bind to a named options class validated for required fields, ranges, and formats at startup.

**Rationale:** Reading a required setting through a raw configuration lookup defers the failure to the first request that needs it. This binding realizes `litespec/workspace/config#validate-backend-configuration-at-startup`.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/config#set-the-sdk-floor-at-the-workspace-root | guidance | Does root global.json set the manifest major release's first feature band, such as `10.0.100`, with `latestMajor` roll-forward? |
| litespec/backend/dotnet/config#centralize-net-build-settings | guidance | Does Directory.Build.props set the manifest target framework, nullable types, implicit usings, and warnings as errors? |
| litespec/backend/dotnet/config#centralize-nuget-versions | guidance | Does Directory.Packages.props enable central management with the manifest pins, and do projects omit versions? |
| litespec/backend/dotnet/config#commit-the-tool-manifest | guidance | Does .config/dotnet-tools.json pin each local tool a documented command invokes? |
| litespec/backend/dotnet/config#validate-backend-options-at-startup | guidance | Does each configuration section bind a validated options class that fails startup on bad values? |
