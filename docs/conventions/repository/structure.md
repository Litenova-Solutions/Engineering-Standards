# Repository Structure

## Intent

One canonical monorepo tree lets agents locate applications, shared packages, documentation, and tests without searching for a project-specific interpretation. The structure supports an API-only application, one frontend, or multiple frontends while retaining one bounded context.

## Agent Summary {#agent-summary}

- Place every deployable under `apps/`.
- Place the .NET solution under `apps/api/`, production projects under `src/`, and test projects under `tests/`.
- Place each frontend under `apps/{name}/`.
- Keep shared TypeScript code under `packages/` only when two applications consume it.
- Keep product and domain documentation under root `docs/`.
- Keep the standards submodule at root `standards/`.

## Standards

### Use the canonical root tree (REPO.STRUCTURE.001)

Consumer repositories use this shape:

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

Do not place the .NET solution or a frontend application at the repository root.

### Keep .NET production and test projects separate (REPO.DOTNET.001)

Production projects live under `apps/api/src/`. Test projects live under `apps/api/tests/`. The solution file lives directly under `apps/api/`.

The baseline tree is:

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

Each independently runnable frontend, API, or separately deployed host lives under `apps/{name}/`. Do not place reusable packages under `apps/` or deployable code under `packages/`.

### Limit shared TypeScript packages (REPO.PACKAGES.001)

The baseline permits shared configuration, generated API types, a thin API client, and CSS theme tokens under `packages/`. Each package must have at least two consumers or serve generated output shared by API consumers.

A shared React component library requires a project decision. Each frontend owns its shadcn/ui source by default.

### Keep consumer documentation at the root (REPO.DOCS.001)

Product, domain, UI, and decision documentation lives under root `docs/`, not inside the standards submodule or .NET solution tree.

Application-specific README files may live beside their application for run commands and environment variables. They do not replace domain specifications.

### Keep orientation documents separate from canonical records (REPO.DOCS.002)

Root and application README files MAY summarize product or architecture decisions, but they MUST link to the authoritative `specStatus: approved` documents under `docs/` and MUST NOT become a second authored source for the same fact. When a product, domain, or architecture decision changes, update the owning specification and reduce the README to a link or approved summary in the same change.

## Conventions

### Name frontends by audience

Use short lowercase names such as `web`, `admin`, `portal`, or `docs`. Do not name a frontend `frontend`, `client`, or `app` when a user-facing role is known.

### Keep scripts at the root

Consumer bootstrap, release, and CI helper scripts live under root `scripts/`. An application-specific script may remain inside that application when no other workspace uses it.

### Keep generated API contracts in packages

Use `packages/api-types/` for generated OpenAPI types and `packages/api-client/` for a thin typed client when more than one frontend consumes the API. A single frontend may own both under its `lib/api/` folder.

## Examples

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`; neither imports the other frontend's feature code.

## Verification

- Confirm the solution is `apps/api/{ProjectName}.slnx`.
- Confirm production projects are under `apps/api/src/` and tests under `apps/api/tests/`.
- Confirm every deployable is under `apps/`.
- Confirm every shared package has a named consumer.
- Confirm module documentation is under `docs/domain/modules/`, end-to-end flows are under `docs/product/flows/`, workflows are under `docs/domain/workflows/`, and domain policies are under `docs/domain/policies/`.
- Confirm Operating Limits are under `docs/operations/` and release records are under `docs/releases/`.
- Confirm optional directories contain real artifacts and no placeholder files.
