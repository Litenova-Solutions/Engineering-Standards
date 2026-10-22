# .NET Workspace

## Intent

A .NET backend lives under `apps/api/`, with production projects under `src/`, test projects under `tests/`, and the solution beside them. This page states that .NET layout: the size (small or large) and stack (technology binding) entries in `litespec.project.json`, the production and test split, the workspace solution, and where the AppHost (the local orchestrator) lives. One fixed address per file lets tools find every project where the layout says it is. The shared workspace rules live on [Workspace Structure](../../workspace/structure.md); this page holds only their .NET form.

## Concepts

### Solutions and project homes

The API solution sits directly under `apps/api/` and remains the solution builds, test runs, and `paths.apiSolution` name. Production projects live under `src/` and test projects under `tests/`, so a test dependency reaching production shows in the path. When the workspace holds a second .NET deployable, a root solution lists both sets for editors that open across them.

### The AppHost exception

An AppHost that runs the API alone stays under `apps/api/src/` with the projects it hosts. An AppHost that also runs frontends orchestrates the workspace rather than the API, so it lives at `apps/apphost/` beside the applications it runs.

## Standards

### Declare size and stacks in project config

**Statement:** `litespec.project.json` MUST declare `size` as `small` or `large` and one stack per frontend in `paths.frontends` beside the `dotnet` backend.

**Rationale:** Size decides which record types and test projects apply, and each stack decides which technology pages and checks apply. An undeclared size or stack leaves tools guessing which rules bind the workspace. This provision states the .NET form of `litespec/workspace/structure#declare-size-and-application-stacks-in-project-config`.

### Keep .NET production and test projects separate

**Statement:** Production projects MUST live under `apps/api/src/` and test projects under `apps/api/tests/`, with the solution directly under `apps/api/`.

**Rationale:** Production under `apps/api/src/` and tests under `apps/api/tests/` make a test dependency reaching production visible in the path itself. The solution sits directly under `apps/api/`, beside both. A workspace AppHost is the one production project outside `src/`, placed by `litespec/backend/dotnet/workspace#place-a-workspace-apphost-beside-the-applications-it-runs`. This provision states the .NET form of `litespec/workspace/structure#keep-production-and-test-code-separate`.

**Example:** The baseline tree is:

```text
apps/api/
  {ProjectName}.slnx
  Directory.Build.props
  Directory.Packages.props
  src/
    {ProjectName}.Domain/
    {ProjectName}.Application.Abstractions/
    {ProjectName}.Application/
    {ProjectName}.Infrastructure/
    {ProjectName}.WebApi/
    {ProjectName}.Worker/             when background work needs a host
    {ProjectName}.AppHost/            when an orchestration host runs the API alone
    {ProjectName}.ServiceDefaults/    when a local orchestration host is used
  tests/
    {ProjectName}.Architecture.Tests/
    {ProjectName}.Integration.Tests/
    {ProjectName}.Acceptance.Tests/   when size is large
    {ProjectName}.Domain.Tests/       optional unit tests
    {ProjectName}.Application.Tests/  optional unit tests
```

Worker is conditional on the extension that runs background work. Acceptance.Tests is required when `size` is large and optional otherwise. Domain.Tests and Application.Tests are optional in both sizes. `AppHost` and `ServiceDefaults` are local hosting and diagnostics projects rather than application layers. An application that orchestrates its local dependencies another way ships neither and records no Exception for their absence.

### Keep one workspace solution beside the API solution

**Statement:** A root solution MUST list the .NET projects of more than one deployable unit, with builds, test runs, and configuration still naming the API solution.

**Rationale:** The API solution stays at `apps/api/` and remains the one builds, test runs, and `paths.apiSolution` name. A workspace with a second .NET deployable, such as a command-line tool, otherwise has no single file an editor can open across both. Two solution files listing overlapping projects are a supported MSBuild arrangement, and the projects stay where `litespec/backend/dotnet/workspace#keep-net-production-and-test-projects-separate` puts them.

**Example:** A workspace with an API and a command-line tool carries `apps/api/{ProjectName}.slnx`, `apps/cli/{ProjectName}.Cli.slnx` where one exists, and a root `{ProjectName}.slnx` listing both sets.

### Place a workspace AppHost beside the applications it runs

**Statement:** An AppHost that runs more than one application under `apps/` MUST live at `apps/apphost/{ProjectName}.AppHost/` rather than under `apps/api/src/`.

**Rationale:** An AppHost that runs the API and its dependencies alone stays under `apps/api/src/` with the projects it hosts. An AppHost that also runs the frontends orchestrates the workspace rather than the API: under `apps/api/src/` it reads as one of the API's layers while reaching out of that tree for every frontend it starts. Beside the applications it runs, its path says what it serves. `ServiceDefaults` stays under `apps/api/src/`, because the API references it and the AppHost does not.

**Example:** A workspace with an API and three frontends carries:

```text
apps/
  api/
    src/
      {ProjectName}.WebApi/
    tests/
      {ProjectName}.Architecture.Tests/   references the AppHost for its model tests
  apphost/
    {ProjectName}.AppHost/
      {ProjectName}.AppHost.csproj
      Program.cs
  {frontend}/
```

The workspace solution of `litespec/backend/dotnet/workspace#keep-one-workspace-solution-beside-the-api-solution` lists the AppHost, and the API solution lists it too when a test project references it.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/workspace#declare-size-and-stacks-in-project-config | guidance | Does `litespec.project.json` declare `size` and one stack per frontend beside the .NET backend? |
| litespec/backend/dotnet/workspace#keep-net-production-and-test-projects-separate | guidance | Do production projects sit under `src/` and test projects under `tests/`? |
| litespec/backend/dotnet/workspace#keep-one-workspace-solution-beside-the-api-solution | guidance | Does any root solution list more than one deployable while builds name the API solution? |
| litespec/backend/dotnet/workspace#place-a-workspace-apphost-beside-the-applications-it-runs | guidance | Does an AppHost running a frontend sit at `apps/apphost/` and an API-only one under `apps/api/src/`? |
