# Workspace Structure

## Intent

A LiteSpec consumer, a project built with LiteSpec, keeps one monorepo tree for its applications, shared packages, documentation, tests, and records, the written statements the project builds against. This page states that tree, where each file kind lives inside it, and what `litespec.project.json` declares. It applies to anyone who creates a file, and to agents locating code without asking. One fixed shape works from an API-only product to several frontends while the whole workspace keeps one bounded context, one business language and deployment boundary.

## Concepts

### Applications and packages

`apps/` holds what runs: the API, each frontend, and any deployed host. `packages/` holds what is reused: shared configuration, generated API types, a thin client, and theme tokens. The split keeps deployable code out of libraries and reusable code out of applications.

### Records and their homes

Each record type has one home in the tree: a business record page under its module, requirements on product topic pages, permissions on the permissions page, entry points on the entry-point page, limits on the limits page. Rules, results, cases, and events live on their business record or use case page instead of their own files. Fixed homes let an agent derive the path from the record type without searching.

The model builder writes the generated project model under `.model/` from records, code, routes, tests, and test runs; the folder is rebuilt rather than reviewed.

## Standards

### Use the canonical root tree

**Requirement:** A consumer workspace MUST use the canonical root tree declared in this section.

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
    ui/                        create with the first UI decision or guide, held in the pattern catalog and the design contract
    language.json
  litespec/
  AGENTS.md
  <toolchain pin file>
  package.json                 when a frontend or TypeScript package exists
  pnpm-lock.yaml               when a frontend or TypeScript package exists
  pnpm-workspace.yaml          when a frontend or TypeScript package exists
  litespec.project.json
```

A backend stack binding names the files that realize the entries in angle brackets.

The example places neither the backend application nor a frontend application at the workspace root. Under `modules/`, each module folder holds one folder per business record in plural kebab-case form.

A record page lives at the home the tree names for its type. An entry lives on its home page. Requirements live on product topic pages, permissions on the permissions page, entry points on the entry-point page, and limits on the limits page. Rules, results, cases, and events live on their business record or use case page.

### Declare size and application stacks in project config

**Requirement:** `litespec.project.json` MUST declare `size` as `small` or `large` and one stack for the backend and for each frontend.

**Rationale:** Size decides which record types and test projects apply: small or large selects the project's required-record set. Each stack decides which technology pages and checks apply to its application. Declaring both in `litespec.project.json` lets tools and reviewers read the selection from one file.

### Keep the generated model out of source control

**Requirement:** The generated `.model/` folder MUST stay out of source control.

**Rationale:** The model builder writes `model.json` there from records, code, routes, tests, and test runs. Tracking it would commit a derived copy beside its sources, and every commit would carry a stale model until somebody regenerates it. The folder is rebuilt rather than reviewed.

### Keep production and test code separate

**Requirement:** Production code MUST live under `apps/api/src/` and test code under `apps/api/tests/`.

**Rationale:** Production code under `apps/api/src/` and test code under `apps/api/tests/` keep the two graphs apart by path. The split makes a test dependency reaching production code visible in the path itself, and keeps test helpers from shipping with the product.

**Example:** The backend tree is:

```text
apps/api/
  <backend project manifest>
  src/
  tests/
```

### Keep runnable applications under apps

**Requirement:** An independently runnable frontend, API, or deployed host MUST live under `apps/{name}/`.

**Rationale:** Each root makes one promise: `apps/` runs, `packages/` is reused. A reusable package under `apps/` or deployable code under `packages/` inverts that promise, so neither location tells the reader what it holds. One home per kind keeps the promise readable.

### Limit shared TypeScript packages

**Requirement:** A shared TypeScript package MUST have at least two consumers or carry generated output shared by design.

**Rationale:** A shared package with one consumer pays versioning, publishing, and cross-package edits for an audience of one. Requiring two consumers or generated output shared by design keeps sharing deliberate. The baseline permits shared configuration, generated API types, a thin client, and CSS theme tokens.

### Keep consumer documentation at the root

**Requirement:** Project records MUST live under the root `docs/` directory.

**Rationale:** Project records describe the product, not the standard and not the code. Placing them inside the LiteSpec submodule or the application tree makes them disappear when either is replaced. The root `docs/` directory keeps records where a replaced standard or a rewritten application cannot take them.

### Keep orientation documents separate from canonical records

**Requirement:** A README under `docs/` MUST link to the approved record rather than restate its content.

**Rationale:** A README orients; a record decides. A README that restates a decision becomes a second authored source that drifts from the record it summarizes, until the two disagree and neither is trusted. Linking to the approved record keeps one source with many pointers.

## Conventions

### Name frontends by audience

**Default:** Name a frontend for its audience, such as `web`, `admin`, `portal`, or `docs`.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** `apps/web` tells the reader who it serves; `apps/frontend` tells them only what it is built with. Naming each frontend for its audience keeps the folder meaningful when the technology changes. `frontend`, `client`, or `app` names the technology rather than the audience it serves.

### Keep scripts at the root

**Default:** Keep bootstrap, release, and CI helper scripts under root `scripts/`.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Bootstrap, release, and CI helper scripts serve the whole workspace, so the root `scripts/` folder keeps them where every caller looks. An application-specific script may stay inside its application when no other workspace calls it.

### Keep generated API contracts in packages

**Default:** Place generated OpenAPI types in `packages/api-types/` and a thin client in `packages/api-client/` when more than one frontend consumes the API.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Generated OpenAPI types and their thin client belong to every frontend that reads the API. With more than one consumer, `packages/api-types/` and `packages/api-client/` keep one copy each. A single frontend may own both locally until a second consumer appears.

## Reference example

This informative example demonstrates `litespec/workspace/structure#use-the-canonical-root-tree` and `litespec/workspace/structure#limit-shared-typescript-packages`.

An API with public and admin frontends uses `apps/api/`, `apps/web/`, and `apps/admin/`. Both frontends may import generated transport types from `packages/api-types/`. Neither imports the other frontend's feature code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/structure#use-the-canonical-root-tree | guidance | Does the workspace match the canonical tree with records at their homes? |
| litespec/workspace/structure#declare-size-and-application-stacks-in-project-config | guidance | Does `litespec.project.json` declare size and one stack for the backend and each frontend? |
| litespec/workspace/structure#keep-the-generated-model-out-of-source-control | guidance | Is the generated `.model/` folder untracked? |
| litespec/workspace/structure#keep-production-and-test-code-separate | guidance | Does production code sit under `src/` and test code under `tests/`? |
| litespec/workspace/structure#keep-runnable-applications-under-apps | guidance | Does each runnable application sit under `apps/` and each library under `packages/`? |
| litespec/workspace/structure#limit-shared-typescript-packages | guidance | Does each shared package have two consumers or carry generated output? |
| litespec/workspace/structure#keep-consumer-documentation-at-the-root | guidance | Do all project records live under the root `docs/` directory? |
| litespec/workspace/structure#keep-orientation-documents-separate-from-canonical-records | guidance | Does each `README` under `docs/` link to its record rather than restate it? |
| litespec/workspace/structure#name-frontends-by-audience | guidance | Does each directory under `apps/` carry an audience name? |
| litespec/workspace/structure#keep-scripts-at-the-root | guidance | Do bootstrap, release, and CI helper scripts sit under root `scripts/`? |
| litespec/workspace/structure#keep-generated-api-contracts-in-packages | guidance | Do generated types and the typed client sit under `packages/` with two frontends? |
