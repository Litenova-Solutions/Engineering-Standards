# Workspace Structure

## Intent

A LiteSpec consumer, a project built with LiteSpec, keeps one monorepo tree for its applications, shared packages, documentation, tests, and records. This page states that tree, where each file kind lives inside it, and what `litespec.project.json` declares. It applies to anyone who creates a file, and to agents locating code without asking.

## Concepts

### Applications and Packages

`apps/` holds what runs: the API, each frontend, and any deployed host. `packages/` holds what is reused: shared configuration, generated API types, a thin client, and theme tokens. The split keeps deployable code out of libraries and reusable code out of applications.

### Records and Their Homes

Each record type has one home in the tree: the [model page](../core/model.md) names the home, and the canonical tree below realizes it. Entries live on their home page instead of their own files, so an agent derives the path from the record type without searching.

The model builder writes the generated project model under `.model/` from records, code, routes, tests, and test runs; the folder is rebuilt rather than reviewed.

## Standards

### Use the Canonical Root Tree

**Statement:** A consumer workspace MUST use the canonical root tree declared in this section.

**Example:** Consumer workspaces use this shape:

```text
{repo}/
  .config/
    <tool manifest>
  .model/                      generated; ignored
  apps/
    api/
      <backend project manifest>
      src/
      tests/
    {frontend}/
    apphost/                   when one host runs more than one application
  packages/
  docs/
    product/
      brief.md
      {area}/                  requirement pages carrying requirement entries
      constraints/             create with the first constraint record
      decisions/
      features/                create with the first feature record
      goals/                   create with the first goal record
      journeys/                create with the first journey record
      problems/                create with the first problem record
    research/                  create with the first research record
    domain/
      README.md
      actors/
      roles/
      permissions.md
      entry-points.md
      systems/                 create with the first external system record
      modules/
        {module}/
          README.md
          {aggregate}/
            README.md
            {use-case}.md
      rules/                   create with the first cross-aggregate rule set
    operations/                create with the first operating record
      limits.md                create with the first limit record
      secrets.json             create with the first secret
      log/                     create with the first operations entry
    runbooks/                  create with the first runbook
    deviations/                create with the first deviation record
    known-gaps/                create with the first known-gap record
    ui/                        create with the first UI decision or guide, held in the pattern catalog and the design contract
    glossary.json
  litespec/
  AGENTS.md
  <toolchain pin file>
  package.json                 when a frontend or TypeScript package exists
  pnpm-lock.yaml               when a frontend or TypeScript package exists
  pnpm-workspace.yaml          when a frontend or TypeScript package exists
  litespec.project.json
```

A backend stack binding names the files that realize the entries in angle brackets.

The example places neither the backend application nor a frontend application at the workspace root. Under `modules/`, each module folder holds one folder per aggregate in plural kebab-case form.

A record page lives at the home the [model page](../core/model.md) names for its type. An entry lives on its home page: requirements on requirement pages, permissions on the permissions page, entry points on the entry-point page, limits on the limits page, and rules, results, scenarios, and events on their aggregate or use case page.

### Declare Size and Application Stacks in Project Config

**Statement:** `litespec.project.json` MUST declare `size` as `small` or `large` and one stack for the backend and for each frontend.

**Rationale:** Size decides which record types and test projects apply: small or large selects the project's required-record set. Each stack decides which technology pages and checks apply to its application. Declaring both in `litespec.project.json` lets tools and reviewers read the selection from one file. The [scope page](../core/scope.md) states the full selection.

### Keep the Generated Model Out of Source Control

**Statement:** The generated `.model/` folder MUST stay out of source control.

**Rationale:** The model builder writes `model.json` there from records, code, routes, tests, and test runs. Tracking it would commit a derived copy beside its sources, and every commit would carry a stale model until somebody regenerates it. The folder is rebuilt rather than reviewed.

### Keep Production and Test Code Separate

**Statement:** Production code MUST live under `apps/api/src/` and test code under `apps/api/tests/`.

**Rationale:** Production code under `apps/api/src/` and test code under `apps/api/tests/` keep the two graphs apart by path. The split makes a test dependency reaching production code visible in the path itself, and keeps test helpers from shipping with the product.

**Example:** The backend tree is:

```text
apps/api/
  <backend project manifest>
  src/
  tests/
```

### Keep Runnable Applications Under Apps

**Statement:** An independently runnable frontend, API, or deployed host MUST live under `apps/{name}/`.

**Rationale:** Each root makes one promise: `apps/` runs, `packages/` is reused. A reusable package under `apps/` or deployable code under `packages/` inverts that promise, so neither location tells the reader what it holds. One home per kind keeps the promise readable.

### Limit Shared TypeScript Packages

**Statement:** A shared TypeScript package MUST have at least two consumers or carry generated output shared by design.

**Rationale:** A shared package with one consumer pays versioning, publishing, and cross-package edits for an audience of one. Requiring two consumers or generated output shared by design keeps sharing deliberate. The baseline permits shared configuration, generated API types, a thin client, and CSS theme tokens.

### Keep Consumer Documentation at the Root

**Statement:** Project records MUST live under the root `docs/` directory.

**Rationale:** Project records describe the product, not the standard and not the code. Placing them inside the LiteSpec submodule or the application tree makes them disappear when either is replaced. The root `docs/` directory keeps records in a place that survives replacing the standard or rewriting the application.

### Keep Orientation Documents Separate from Canonical Records

**Statement:** A README under `docs/` MUST link to the approved record rather than restate its content.

**Rationale:** A README orients; a record decides. A README that restates a decision becomes a second authored source that drifts from the record it summarizes, until the two disagree and neither is trusted. Linking to the approved record keeps one source with many pointers.

## Conventions

### Name Frontends by Audience

**Default:** Name a frontend for its audience, such as `web`, `admin`, `portal`, or `docs`.

**Replacement:** A project whose frontends serve one audience records its own frontend names in `litespec.project.json` under `paths.frontends`.

**Rationale:** `apps/web` tells the reader who it serves; `apps/frontend` tells them only what it is built with. Naming each frontend for its audience keeps the folder meaningful when the technology changes. `frontend`, `client`, or `app` names the technology rather than the audience it serves.

### Keep Scripts at the Root

**Default:** Keep bootstrap, release, and CI helper scripts under root `scripts/`.

**Replacement:** A project that organizes scripts per application records its own script layout in its project documentation.

**Rationale:** Bootstrap, release, and CI helper scripts serve the whole workspace, so the root `scripts/` folder keeps them where every caller looks. An application-specific script may stay inside its application when no other workspace calls it.

### Keep Generated API Contracts in Packages

**Default:** Place generated OpenAPI types in `packages/api-types/` and a thin client in `packages/api-client/` when more than one frontend consumes the API.

**Replacement:** A project with a single frontend records that frontend as the local owner of both outputs.

**Rationale:** Generated OpenAPI types and their thin client belong to every frontend that reads the API. With more than one consumer, `packages/api-types/` and `packages/api-client/` keep one copy each. A single frontend may own both locally until a second consumer appears.

## Reference Example

This informative example demonstrates `litespec/workspace/structure#use-the-canonical-root-tree` and `litespec/workspace/structure#limit-shared-typescript-packages`.

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`. Neither imports the other frontend's feature code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/structure#use-the-canonical-root-tree | guidance | The workspace tree matches the canonical tree in this section, with each record at its type's home under `docs/`. |
| litespec/workspace/structure#declare-size-and-application-stacks-in-project-config | guidance | `litespec.project.json` at the workspace root declares `size` and one stack for the backend and for each frontend. |
| litespec/workspace/structure#keep-the-generated-model-out-of-source-control | guidance | No path under `.model/` is tracked in git; `git ls-files .model` prints nothing. |
| litespec/workspace/structure#keep-production-and-test-code-separate | guidance | Production files sit under `apps/api/src/` and test files under `apps/api/tests/`, with no test helper shipped beside production code. |
| litespec/workspace/structure#keep-runnable-applications-under-apps | guidance | Each directory under `apps/` runs on its own, and each directory under `packages/` is imported by an application. |
| litespec/workspace/structure#limit-shared-typescript-packages | guidance | Each package under `packages/` is imported by at least two consumers, or carries generated output shared by design; read the imports in `apps/`. |
| litespec/workspace/structure#keep-consumer-documentation-at-the-root | guidance | Every record path sits under the root `docs/` directory. |
| litespec/workspace/structure#keep-orientation-documents-separate-from-canonical-records | guidance | Each `README.md` under `docs/` links to its approved record and restates no record content. |
| litespec/workspace/structure#name-frontends-by-audience | guidance | Each directory under `apps/` carries an audience name; where replaced, `paths.frontends` in `litespec.project.json` names the project's own frontend names. |
| litespec/workspace/structure#keep-scripts-at-the-root | guidance | Bootstrap, release, and CI helper scripts sit under root `scripts/`; where replaced, the project documentation names the project's own script layout. |
| litespec/workspace/structure#keep-generated-api-contracts-in-packages | guidance | Generated OpenAPI types sit in `packages/api-types/` and the thin client in `packages/api-client/` once two frontends consume the API; with one frontend, that frontend owns both outputs. |
