# Workspace Structure

## Intent

One canonical monorepo tree lets agents locate applications, shared packages, documentation, and tests without searching for a project-specific interpretation. The structure supports an API-only application, one frontend, or multiple frontends while retaining one bounded context.

## Agent Summary {#agent-summary}

- Consumers share one canonical root tree. (litespec/rule/workspace-structure.use-the-canonical-root-tree)
- The project config declares size and stacks. (litespec/rule/workspace-structure.declare-size-and-stacks-in-project-config)
- The generated model folder stays untracked. (litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control)
- Production and test projects sit in separate roots. (litespec/rule/workspace-structure.keep-net-production-and-test-projects-separate)
- Runnable applications live under apps. (litespec/rule/workspace-structure.keep-runnable-applications-under-apps)
- An AppHost that runs more than one application sits beside them under apps. (litespec/rule/workspace-structure.place-a-workspace-apphost-beside-the-applications-it-runs)
- Shared packages have two consumers or hold generated output. (litespec/rule/workspace-structure.limit-shared-typescript-packages)
- Consumer documentation lives under the root docs directory. (litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root)
- READMEs orient and link; they never restate records. (litespec/rule/workspace-structure.keep-orientation-documents-separate-from-canonical-records)

## Standards

### Use the canonical root tree (litespec/rule/workspace-structure.use-the-canonical-root-tree)

**Requirement:** A consumer workspace MUST use the canonical root tree declared in this section.

**Example:** Consumer workspaces use this shape:

```text
{repo}/
  .config/
    dotnet-tools.json
  .model/                      generated; ignored
  apps/
    api/
      {ProjectName}.slnx
      Directory.Build.props
      Directory.Packages.props
      src/
      tests/
    {frontend}/
    apphost/                   when an AppHost runs more than one application
  packages/
  docs/
    product/
      brief.md
      {area}/                  product topic pages carrying requirement entries
      constraints/             create with the first constraint record
      decisions/
      features/                create with the first feature record
      journeys/                create with the first journey record
      problems/                create with the first problem record
    research/                  create with the first research record
    domain/
      README.md
      actors/
      roles/
      permissions.md
      entry-points.md
      modules/
        {module}/
          README.md
          {records-plural}/
            README.md
            {use-case}.md
      rules/                   create with the first cross-record rule set
    operations/                create with the first operating record
      limits.md                create with the first limit record
      secrets.json             create with the first secret
      log/                     create with the first operations entry
    runbooks/                  create with the first runbook
    exceptions/                create with the first exception record
    known-gaps/                create with the first known-gap record
    ui/                        create with the first UI decision or guide
    language.json
  litespec/
  AGENTS.md
  global.json
  package.json                 when a frontend or TypeScript package exists
  pnpm-lock.yaml               when a frontend or TypeScript package exists
  pnpm-workspace.yaml          when a frontend or TypeScript package exists
  litespec.project.json
```

The example does not place the .NET solution or a frontend application at the workspace root. Under `modules/`, each module folder holds one folder per business record in plural kebab-case form.

A record page lives at the home the tree names for its type. An entry lives on its home page. Requirements live on product topic pages, permissions on the permissions page, entry points on the entry-point page, and limits on the limits page. Rules, results, cases, and events live on their business record or use case page.

### Declare size and stacks in project config (litespec/rule/workspace-structure.declare-size-and-stacks-in-project-config)

**Requirement:** `litespec.project.json` MUST declare `size` as `small` or `large` and one stack per frontend in `paths.frontends` beside the `dotnet` backend.

**Rationale:** Size decides which record types and test projects apply, and each stack decides which technology pages and checks apply.

### Keep the generated model out of source control (litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control)

**Requirement:** The generated `.model/` folder MUST stay out of source control.

**Rationale:** The model builder writes `model.json` there from records, code, routes, tests, and test runs, so the folder is rebuilt rather than reviewed.

### Keep .NET production and test projects separate (litespec/rule/workspace-structure.keep-net-production-and-test-projects-separate)

**Requirement:** Production projects MUST live under `apps/api/src/` and test projects under `apps/api/tests/`, with the solution directly under `apps/api/`.

**Rationale:** The split makes a test dependency reaching a production project visible in the path itself. A workspace AppHost is the one production project outside it, placed by `litespec/rule/workspace-structure.place-a-workspace-apphost-beside-the-applications-it-runs`.

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

Worker is conditional on the extension that runs background work. Acceptance.Tests is required when `size` is large and optional otherwise. Domain.Tests and Application.Tests are optional in both sizes. `AppHost` and `ServiceDefaults` are local hosting and diagnostics projects rather than application layers. An application that orchestrates its local dependencies another way ships neither, and records no Exception for their absence.

### Keep one workspace solution beside the API solution (litespec/rule/workspace-structure.keep-one-workspace-solution-beside-the-api-solution)

**Requirement:** A root solution MUST list the .NET projects of more than one deployable unit, with builds, test runs, and configuration still naming the API solution.

**Rationale:** The API solution stays at `apps/api/` and remains the one a build, a test run, and `paths.apiSolution` name. A workspace holding a second .NET deployable, such as a command-line tool, otherwise has no single file an editor can open across both. Two solution files listing overlapping projects is a supported MSBuild arrangement, and the projects themselves stay where `litespec/rule/workspace-structure.keep-net-production-and-test-projects-separate` puts them.

**Example:** A workspace with an API and a command-line tool carries `apps/api/{ProjectName}.slnx`, `apps/cli/{ProjectName}.Cli.slnx` where one exists, and a root `{ProjectName}.slnx` listing both sets.

### Place a workspace AppHost beside the applications it runs (litespec/rule/workspace-structure.place-a-workspace-apphost-beside-the-applications-it-runs)

**Requirement:** An AppHost that runs more than one application under `apps/` MUST live at `apps/apphost/{ProjectName}.AppHost/` rather than under `apps/api/src/`.

**Rationale:** An AppHost that runs the API and its dependencies alone stays under `apps/api/src/` with the projects it hosts. An AppHost that also runs the frontends orchestrates the workspace rather than the API. Under `apps/api/src/` it reads as one of the API's layers, and it reaches out of that tree for every frontend it starts. Beside the applications it runs, its path says what it serves. `ServiceDefaults` stays under `apps/api/src/`, because the API references it and the AppHost does not.

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

The workspace solution of `litespec/rule/workspace-structure.keep-one-workspace-solution-beside-the-api-solution` lists the AppHost, and the API solution lists it too when a test project references it.

### Keep runnable applications under apps (litespec/rule/workspace-structure.keep-runnable-applications-under-apps)

**Requirement:** An independently runnable frontend, API, or deployed host MUST live under `apps/{name}/`.

**Rationale:** A reusable package under `apps/` or deployable code under `packages/` inverts what each root promises.

### Limit shared TypeScript packages (litespec/rule/workspace-structure.limit-shared-typescript-packages)

**Requirement:** A shared TypeScript package MUST have at least two consumers or carry generated output shared by design.

**Rationale:** The baseline permits shared configuration, generated API types, a thin client, and CSS theme tokens.

### Keep consumer documentation at the root (litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root)

**Requirement:** Project records MUST live under the root `docs/` directory.

**Rationale:** Placing them inside the LiteSpec submodule or the solution tree makes them disappear when either is replaced.

### Keep orientation documents separate from canonical records (litespec/rule/workspace-structure.keep-orientation-documents-separate-from-canonical-records)

**Requirement:** A README under `docs/` MUST link to the approved record rather than restate its content.

**Rationale:** A README that restates a decision becomes a second authored source that drifts from the record it summarizes.

## Conventions

### Name frontends by audience (litespec/rule/workspace-structure.name-frontends-by-audience)

**Default:** Name a frontend for its audience, such as `web`, `admin`, `portal`, or `docs`.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** `frontend`, `client`, or `app` names the technology rather than the audience it serves.

### Keep scripts at the root (litespec/rule/workspace-structure.keep-scripts-at-the-root)

**Default:** Keep bootstrap, release, and CI helper scripts under root `scripts/`.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** An application-specific script may stay inside its application when no other workspace calls it.

### Keep generated API contracts in packages (litespec/rule/workspace-structure.keep-generated-api-contracts-in-packages)

**Default:** Place generated OpenAPI types in `packages/api-types/` and a thin client in `packages/api-client/` when more than one frontend consumes the API.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A single frontend may own both locally until a second consumer appears.

## Reference example

This informative example demonstrates `litespec/rule/workspace-structure.use-the-canonical-root-tree` and `litespec/rule/workspace-structure.limit-shared-typescript-packages`.

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`. Neither imports the other frontend's feature code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/workspace-structure.use-the-canonical-root-tree | guidance | Does the workspace match the canonical tree with records at their homes? |
| litespec/rule/workspace-structure.declare-size-and-stacks-in-project-config | guidance | Does litespec.project.json declare size and one stack per frontend? |
| litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control | guidance | Is the generated .model/ folder untracked? |
| litespec/rule/workspace-structure.keep-net-production-and-test-projects-separate | guidance | Do production projects sit under src/ and test projects under tests/? |
| litespec/rule/workspace-structure.keep-one-workspace-solution-beside-the-api-solution | guidance | Does any root solution list more than one deployable while builds name the API solution? |
| litespec/rule/workspace-structure.place-a-workspace-apphost-beside-the-applications-it-runs | guidance | Does an AppHost running a frontend sit at apps/apphost/ and an API-only one under apps/api/src/? |
| litespec/rule/workspace-structure.keep-runnable-applications-under-apps | guidance | Does each runnable application sit under apps/ and each library under packages/? |
| litespec/rule/workspace-structure.limit-shared-typescript-packages | guidance | Does each shared package have two consumers or carry generated output? |
| litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root | guidance | Do all project records live under the root docs/ directory? |
| litespec/rule/workspace-structure.keep-orientation-documents-separate-from-canonical-records | guidance | Does each README under docs/ link to its record rather than restate it? |
| litespec/rule/workspace-structure.name-frontends-by-audience | guidance | Does each directory under apps/ carry an audience name? |
| litespec/rule/workspace-structure.keep-scripts-at-the-root | guidance | Do bootstrap, release, and CI helper scripts sit under root scripts/? |
| litespec/rule/workspace-structure.keep-generated-api-contracts-in-packages | guidance | Do generated types and the typed client sit under packages/ with two frontends? |
