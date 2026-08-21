# Repository Structure

## Intent


One canonical monorepo tree lets agents locate applications, shared packages, documentation, and tests without searching for a project-specific interpretation. The structure supports an API-only application, one frontend, or multiple frontends while retaining one bounded context.

## Agent Summary {#agent-summary}


- Use the canonical root tree. (REPO.STRUCTURE.001)
- Keep .NET production and test projects separate. (REPO.DOTNET.001)
- Keep runnable applications under apps. (REPO.APPS.001)
- Limit shared TypeScript packages. (REPO.PACKAGES.001)
- Keep consumer documentation at the root. (REPO.DOCS.001)
- Keep orientation documents separate from canonical records. (REPO.DOCS.002)

## Standards


### Use the canonical root tree (REPO.STRUCTURE.001)

**Requirement:** Repositories MUST use the canonical root tree.

**Example:** Consumer repositories use this shape:

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

The example does not place the .NET solution or a frontend application at the repository root.

### Keep .NET production and test projects separate (REPO.DOTNET.001)

**Requirement:** Repositories MUST keep .NET production and test projects separate.

**Rationale:** Production projects live under `apps/api/src/`. Test projects live under `apps/api/tests/`. The solution file lives directly under `apps/api/`.

**Example:** The baseline tree is:

```text
apps/api/
  {ProjectName}.slnx
  Directory.Build.props
  Directory.Packages.props
  src/
    {ProjectName}.Domain/
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

### Keep runnable applications under apps (REPO.APPS.001)

**Requirement:** Repositories MUST keep runnable applications under apps.

**Rationale:** Each independently runnable frontend, API, or separately deployed host lives under `apps/{name}/`. The implementation does not place reusable packages under `apps/` or deployable code under `packages/`.

### Limit shared TypeScript packages (REPO.PACKAGES.001)

**Requirement:** Repositories MUST limit shared TypeScript packages.

**Rationale:** The baseline permits shared configuration, generated API types, a thin API client, and CSS theme tokens under `packages/`. Each package has at least two consumers or serves generated output shared by API consumers.

A shared React component library requires a project decision. Each frontend owns its shadcn/ui source by default.

### Keep consumer documentation at the root (REPO.DOCS.001)

**Requirement:** Repositories MUST keep consumer documentation at the root.

**Rationale:** Product, domain, UI, and decision documentation lives under root `docs/`, not inside the standards submodule or .NET solution tree.

Application-specific README files may live beside their application for run commands and environment variables. They do not replace domain specifications.

### Keep orientation documents separate from canonical records (REPO.DOCS.002)

**Requirement:** Repositories MUST keep orientation documents separate from canonical records.

**Rationale:** Root and application README files can summarize product or architecture decisions. They link to the authoritative `specStatus: approved` documents under `docs/`. They do not become a second authored source for the same fact. When a decision changes, update the owning specification. Reduce the README to a link or approved summary in the same change.

## Conventions


### Name frontends by audience (REPO.CONVENTION.001)

**Default:** Name frontends by audience.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses short lowercase names such as `web`, `admin`, `portal`, or `docs`. The implementation does not name a frontend `frontend`, `client`, or `app` when a user-facing role is known.

### Keep scripts at the root (REPO.CONVENTION.002)

**Default:** Keep scripts at the root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Consumer bootstrap, release. CI helper scripts live under root `scripts/`. An application-specific script may remain inside that application when no other workspace uses it.

### Keep generated API contracts in packages (REPO.CONVENTION.003)

**Default:** Keep generated API contracts in packages.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses `packages/api-types/` for generated OpenAPI types and `packages/api-client/` for a thin typed client when more than one frontend consumes the API. A single frontend may own both under its `lib/api/` folder.

## Reference example

This informative example demonstrates `REPO.STRUCTURE.001` and `REPO.PACKAGES.001`.

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`. Neither imports the other frontend's feature code.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| REPO.STRUCTURE.001 | inspection | Pull request review asserts `use the canonical root tree` in the owning specification and source paths. |
| REPO.DOTNET.001 | test | An automated test citing `REPO.DOTNET.001` asserts `keep .NET production and test projects separate` at the affected boundary. |
| REPO.APPS.001 | inspection | Pull request review asserts `keep runnable applications under apps` in the owning specification and source paths. |
| REPO.PACKAGES.001 | inspection | Pull request review asserts `limit shared TypeScript packages` in the owning specification and source paths. |
| REPO.DOCS.001 | inspection | Pull request review asserts `keep consumer documentation at the root` in the owning specification and source paths. |
| REPO.DOCS.002 | inspection | Pull request review asserts `keep orientation documents separate from canonical records` in the owning specification and source paths. |
| REPO.CONVENTION.001 | static | Repository static check asserts `name frontends by audience` for the owning paths. |
| REPO.CONVENTION.002 | inspection | Pull request review asserts `keep scripts at the root` in the owning specification and source paths. |
| REPO.CONVENTION.003 | inspection | Pull request review asserts `keep generated API contracts in packages` in the owning specification and source paths. |
