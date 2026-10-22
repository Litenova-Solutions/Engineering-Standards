# .NET Configuration

## Intent

A .NET backend pins its SDK, build settings, package versions, and local tools to fixed versions through files at fixed paths: `global.json`, `Directory.Build.props`, `Directory.Packages.props`, and the tool manifest. This page states what each file sets and how backend settings bind to named options classes that the host validates at startup. Fixed files mean every machine and every automated build produces the same output, and startup validation fails a bad configuration before the process takes traffic. The shared configuration rules live on [Configuration](../../workspace/config.md); this page holds only their .NET form.

## Concepts

### The four pinning files

Four files at fixed paths decide how the backend builds, wherever it builds. The root `global.json` names the lowest SDK that can build the workspace. `apps/api/Directory.Build.props` sets the target framework and the build settings every project shares. `apps/api/Directory.Packages.props` pins every NuGet version in one place, so project files name packages without versions. The root `.config/dotnet-tools.json` pins the local tools that documented commands invoke.

### Options binding

Backend settings bind to named options classes that the host validates at startup for required fields, ranges, and formats. A process with bad configuration then fails before it takes traffic, instead of failing the first request that reads the setting.

## Standards

### Set the SDK floor at the workspace root

**Statement:** The root `global.json` MUST set the first feature band of the manifest .NET major release as its SDK version and roll forward with `latestMajor`.

**Rationale:** The first feature band of the manifest's major release is the lowest SDK that builds the workspace, and `latestMajor` roll-forward lets any newer SDK build it too. A patch or feature-band release then needs no workspace change, and two machines with different SDKs still build the same output. The manifest names the major release; `Directory.Build.props` sets its target framework.

### Centralize .NET build settings

**Statement:** `apps/api/Directory.Build.props` MUST set the target framework of the manifest .NET stack release, and enable nullable types, implicit usings, and warnings as errors.

**Rationale:** When each project sets its own framework, nullability, usings, and warnings, one project silently builds under weaker rules and its warnings go unread. One file owns those settings, so a change applies to every project and review sees it in one diff.

### Centralize NuGet versions

**Statement:** `apps/api/Directory.Packages.props` MUST enable central package management and carry the exact manifest pins.

**Rationale:** A version written in a project file is invisible to the manifest that owns it, and two projects drift to two versions of one package. With central management, project files name packages only, and one file carries the exact pins, so an upgrade touches one place.

### Commit the tool manifest

**Statement:** The root `.config/dotnet-tools.json` MUST pin every local .NET tool that a documented command invokes.

**Rationale:** A tool installed by version range resolves differently on two machines, and a build that passes locally fails in CI. Pinning every tool a documented command invokes means local and CI runs use one version; when a tool ships in the manifest's .NET release, its pin matches that release.

### Validate backend options at startup

**Statement:** A configuration section MUST bind to a named options class validated for required fields, ranges, and formats at startup.

**Rationale:** A required setting read through a raw lookup fails on the first request that needs it, which may be hours after a bad deploy. Binding each section to a validated options class fails startup instead, with the field, range, or format named. This provision states the .NET form of `litespec/workspace/config#validate-backend-configuration-at-startup`.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/config#set-the-sdk-floor-at-the-workspace-root | guidance | Does the root `global.json` set the manifest major release's first feature band, such as `10.0.100`, with `latestMajor` roll-forward? |
| litespec/backend/dotnet/config#centralize-net-build-settings | guidance | Does `Directory.Build.props` set the manifest target framework, nullable types, implicit usings, and warnings as errors? |
| litespec/backend/dotnet/config#centralize-nuget-versions | guidance | Does `Directory.Packages.props` enable central management with the manifest pins, and do projects omit versions? |
| litespec/backend/dotnet/config#commit-the-tool-manifest | guidance | Does `.config/dotnet-tools.json` pin each local tool a documented command invokes? |
| litespec/backend/dotnet/config#validate-backend-options-at-startup | guidance | Does each configuration section bind a validated options class that fails startup on bad values? |
