# Workspace Structure

## Intent


One canonical monorepo tree lets agents locate applications, shared packages, documentation, and tests without searching for a project-specific interpretation. The structure supports an API-only application, one frontend, or multiple frontends while retaining one bounded context.

## Agent Summary {#agent-summary}


- Consumers share one canonical root tree. (WORKSPACE.STRUCTURE.TREE.001)
- Production and test projects sit in separate roots. (WORKSPACE.STRUCTURE.DOTNET.001)
- Runnable applications live under apps. (WORKSPACE.STRUCTURE.APPS.001)
- Shared packages have two consumers or hold generated output. (WORKSPACE.STRUCTURE.PACKAGES.001)
- Consumer documentation lives under the root docs directory. (WORKSPACE.STRUCTURE.DOCS.001)
- READMEs orient and link; they never restate records. (WORKSPACE.STRUCTURE.DOCS.002)

## Standards


### Use the canonical root tree (WORKSPACE.STRUCTURE.TREE.001)

**Requirement:** A consumer workspace MUST use the canonical root tree declared in this section.

**Example:** Consumer workspaces use this shape:

```text
{repo}/
  .config/
    dotnet-tools.json
  apps/
    api/
      {ProjectName}.slnx
      Directory.Build.props
      Directory.Packages.props
      src/
      tests/
    {frontend}/
  packages/
  docs/
    product/
      brief.md
      flows/                 create with the first end-to-end flow
    domain/
      README.md
      glossary.md
      modules/
      workflows/             create with the first workflow
      policies/              create with the first domain policy
    decisions/               create with the first decision
    operations/              create with the first operating record
      limits.md              create when operating limits exist
    runbooks/                create with the first runbook
    releases/                create with the first release record
    research/                create with the first research record
    ui/                      create when a frontend needs page specifications
  standards/
  AGENTS.md
  global.json
  package.json             when a frontend or TypeScript package exists
  pnpm-lock.yaml           when a frontend or TypeScript package exists
  pnpm-workspace.yaml      when a frontend or TypeScript package exists
  standards.project.json
```

The example does not place the .NET solution or a frontend application at the workspace root.

### Keep .NET production and test projects separate (WORKSPACE.STRUCTURE.DOTNET.001)

**Requirement:** Production projects MUST live under `apps/api/src/` and test projects under `apps/api/tests/`, with the solution directly under `apps/api/`.

**Rationale:** The split makes a test dependency reaching a production project visible in the path itself.

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
    {ProjectName}.AppHost/
    {ProjectName}.ServiceDefaults/
  tests/
    {ProjectName}.Domain.Tests/
    {ProjectName}.Application.Tests/
    {ProjectName}.Integration.Tests/
    {ProjectName}.Architecture.Tests/
```

Worker and Acceptance.Tests are conditional projects introduced by extensions.

### Keep runnable applications under apps (WORKSPACE.STRUCTURE.APPS.001)

**Requirement:** An independently runnable frontend, API, or deployed host MUST live under `apps/{name}/`.

**Rationale:** A reusable package under `apps/` or deployable code under `packages/` inverts what each root promises.

### Limit shared TypeScript packages (WORKSPACE.STRUCTURE.PACKAGES.001)

**Requirement:** A shared TypeScript package MUST have at least two consumers or carry generated output shared by design.

**Rationale:** The baseline permits shared configuration, generated API types, a thin client, and CSS theme tokens.

### Keep consumer documentation at the root (WORKSPACE.STRUCTURE.DOCS.001)

**Requirement:** Product, domain, UI, and decision documentation MUST live under the root `docs/` directory.

**Rationale:** Placing it inside the standards submodule or the solution tree makes it disappear when either is replaced.

### Keep orientation documents separate from canonical records (WORKSPACE.STRUCTURE.DOCS.002)

**Requirement:** A README MUST link to the approved specification rather than restate its content.

**Rationale:** A README that restates a decision becomes a second authored source that drifts from the record it summarizes.

## Conventions


### Name frontends by audience (WORKSPACE.STRUCTURE.CONVENTION.001)

**Default:** Name a frontend for its audience, such as `web`, `admin`, `portal`, or `docs`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** `frontend`, `client`, or `app` names the technology rather than the audience it serves.

### Keep scripts at the root (WORKSPACE.STRUCTURE.CONVENTION.002)

**Default:** Keep bootstrap, release, and CI helper scripts under root `scripts/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An application-specific script may stay inside its application when no other workspace calls it.

### Keep generated API contracts in packages (WORKSPACE.STRUCTURE.CONVENTION.003)

**Default:** Place generated OpenAPI types in `packages/api-types/` and a thin client in `packages/api-client/` when more than one frontend consumes the API.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A single frontend may own both locally until a second consumer appears.

## Reference example

This informative example demonstrates `WORKSPACE.STRUCTURE.TREE.001` and `WORKSPACE.STRUCTURE.PACKAGES.001`.

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`. Neither imports the other frontend's feature code.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| WORKSPACE.STRUCTURE.TREE.001 | inspection | Root tree review compares the workspace against the layout in this section. |
| WORKSPACE.STRUCTURE.DOTNET.001 | test | `SolutionStructureTests` asserts each project resolves under its declared source or test root. |
| WORKSPACE.STRUCTURE.APPS.001 | inspection | Root tree review confirms each runnable application sits under `apps/` and each library under `packages/`. |
| WORKSPACE.STRUCTURE.PACKAGES.001 | inspection | Package review records the two consumers or the generated-output purpose for each shared package. |
| WORKSPACE.STRUCTURE.DOCS.001 | inspection | Root tree review confirms every structured specification resolves under root `docs/`. |
| WORKSPACE.STRUCTURE.DOCS.002 | inspection | README review confirms each summary links to its approved specification. |
| WORKSPACE.STRUCTURE.CONVENTION.001 | static | Each directory under `apps/` carries an audience name rather than a technology name. |
| WORKSPACE.STRUCTURE.CONVENTION.002 | inspection | Bootstrap, release, and CI helper scripts resolve under root `scripts/`. |
| WORKSPACE.STRUCTURE.CONVENTION.003 | inspection | Generated types and the typed client resolve under `packages/` when two frontends consume the API. |
