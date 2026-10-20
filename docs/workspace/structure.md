# Workspace Structure

## Intent

One canonical monorepo tree lets agents locate applications, shared packages, documentation, and tests without searching for a project-specific interpretation. The structure supports an API-only application, one frontend, or multiple frontends while retaining one bounded context.

## Agent Summary {#agent-summary}

- Consumers share one canonical root tree. (litespec/rule/workspace-structure.use-the-canonical-root-tree)
- The project config declares size and stacks. (litespec/rule/workspace-structure.declare-size-and-application-stacks-in-project-config)
- The generated model folder stays untracked. (litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control)
- Production code and test code sit in separate roots. (litespec/rule/workspace-structure.keep-production-and-test-code-separate)
- Runnable applications live under apps. (litespec/rule/workspace-structure.keep-runnable-applications-under-apps)
- Shared packages have two consumers or hold generated output. (litespec/rule/workspace-structure.limit-shared-typescript-packages)
- Consumer documentation lives under the root docs directory. (litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root)
- READMEs orient and link; they never restate records. (litespec/rule/workspace-structure.keep-orientation-documents-separate-from-canonical-records)
- Frontends take audience names and scripts stay at the root. (litespec/rule/workspace-structure.name-frontends-by-audience, litespec/rule/workspace-structure.keep-scripts-at-the-root)
- Generated API contracts live in packages. (litespec/rule/workspace-structure.keep-generated-api-contracts-in-packages)

## Standards

### Use the canonical root tree (litespec/rule/workspace-structure.use-the-canonical-root-tree)

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
    ui/                        create with the first UI decision or guide
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

### Declare size and application stacks in project config (litespec/rule/workspace-structure.declare-size-and-application-stacks-in-project-config)

**Requirement:** `litespec.project.json` MUST declare `size` as `small` or `large` and one stack for the backend and for each frontend.

**Rationale:** Size decides which record types and test projects apply, and each stack decides which technology pages and checks apply.

### Keep the generated model out of source control (litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control)

**Requirement:** The generated `.model/` folder MUST stay out of source control.

**Rationale:** The model builder writes `model.json` there from records, code, routes, tests, and test runs, so the folder is rebuilt rather than reviewed.

### Keep production and test code separate (litespec/rule/workspace-structure.keep-production-and-test-code-separate)

**Requirement:** Production code MUST live under `apps/api/src/` and test code under `apps/api/tests/`.

**Rationale:** The split makes a test dependency reaching production code visible in the path itself.

**Example:** The backend tree is:

```text
apps/api/
  <backend project manifest>
  src/
  tests/
```

### Keep runnable applications under apps (litespec/rule/workspace-structure.keep-runnable-applications-under-apps)

**Requirement:** An independently runnable frontend, API, or deployed host MUST live under `apps/{name}/`.

**Rationale:** A reusable package under `apps/` or deployable code under `packages/` inverts what each root promises.

### Limit shared TypeScript packages (litespec/rule/workspace-structure.limit-shared-typescript-packages)

**Requirement:** A shared TypeScript package MUST have at least two consumers or carry generated output shared by design.

**Rationale:** The baseline permits shared configuration, generated API types, a thin client, and CSS theme tokens.

### Keep consumer documentation at the root (litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root)

**Requirement:** Project records MUST live under the root `docs/` directory.

**Rationale:** Placing them inside the LiteSpec submodule or the application tree makes them disappear when either is replaced.

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
| litespec/rule/workspace-structure.declare-size-and-application-stacks-in-project-config | guidance | Does litespec.project.json declare size and one stack for the backend and each frontend? |
| litespec/rule/workspace-structure.keep-the-generated-model-out-of-source-control | guidance | Is the generated .model/ folder untracked? |
| litespec/rule/workspace-structure.keep-production-and-test-code-separate | guidance | Does production code sit under src/ and test code under tests/? |
| litespec/rule/workspace-structure.keep-runnable-applications-under-apps | guidance | Does each runnable application sit under apps/ and each library under packages/? |
| litespec/rule/workspace-structure.limit-shared-typescript-packages | guidance | Does each shared package have two consumers or carry generated output? |
| litespec/rule/workspace-structure.keep-consumer-documentation-at-the-root | guidance | Do all project records live under the root docs/ directory? |
| litespec/rule/workspace-structure.keep-orientation-documents-separate-from-canonical-records | guidance | Does each README under docs/ link to its record rather than restate it? |
| litespec/rule/workspace-structure.name-frontends-by-audience | guidance | Does each directory under apps/ carry an audience name? |
| litespec/rule/workspace-structure.keep-scripts-at-the-root | guidance | Do bootstrap, release, and CI helper scripts sit under root scripts/? |
| litespec/rule/workspace-structure.keep-generated-api-contracts-in-packages | guidance | Do generated types and the typed client sit under packages/ with two frontends? |
