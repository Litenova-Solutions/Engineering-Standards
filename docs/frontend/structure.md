# Frontend Structure

## Intent


Each frontend is an independent Next.js application organized around the same business modules and use cases as the backend. Route files compose features. Feature folders own behavior. Shared folders contain only code with real cross-feature use.

## Agent Summary {#agent-summary}


- Frontends share one application tree. (FRONTEND.STRUCTURE.TREE.001)
- Features sit under their module and use-case names. (FRONTEND.STRUCTURE.FEATURES.001)
- Modules never reach into another module's internals. (FRONTEND.STRUCTURE.BOUNDARY.001)
- Applications never import each other's source. (FRONTEND.STRUCTURE.APPS.001)
- Shared packages carry no application-specific code. (FRONTEND.STRUCTURE.PACKAGES.001)
- Imports flow from routes inward, never outward. (FRONTEND.STRUCTURE.IMPORTS.001)

## Standards


### Use the frontend application tree (FRONTEND.STRUCTURE.TREE.001)

**Requirement:** A frontend MUST use the declared application tree for routes, features, components, library code, and tests.

**Example:** Each Next.js application uses:

```text
apps/{frontend}/
  app/
  features/
  components/
    ui/
  lib/
  public/
  tests/
  components.json
  ui-source-lock.json
  next.config.ts
  package.json
  tsconfig.json
```

Framework-generated cache and build folders remain untracked.

### Organize features by module and use case (FRONTEND.STRUCTURE.FEATURES.001)

**Requirement:** A feature MUST live under `features/{module}/{use-case}/` using the module and use-case names its specification declares.

**Rationale:** The frontend tree then matches the specification tree and the backend Application folders.

### Isolate module internals (FRONTEND.STRUCTURE.BOUNDARY.001)

**Requirement:** A module MUST NOT import another module's internal feature path.

**Rationale:** Route composition may still render public components from several modules when a page specification requires it. Shared code moves to `components/` or `lib/`.

### Keep applications independent (FRONTEND.STRUCTURE.APPS.001)

**Requirement:** A frontend MUST NOT import source from another frontend.

**Rationale:** Each application owns its routing, environment, authentication, components, source lock, Tailwind entry, tests, and deployment configuration.

### Keep shared packages non-application-specific (FRONTEND.STRUCTURE.PACKAGES.001)

**Requirement:** A shared package MUST NOT contain page composition, feature state, authentication policy, or application-specific components.

**Rationale:** It may still contain generated API types, a thin typed client, configuration, and CSS theme tokens.

### Keep imports directional (FRONTEND.STRUCTURE.IMPORTS.001)

**Requirement:** An import MUST point from route to feature to shared code, never in the reverse direction.

**Example:** This direction shows the allowed dependency path:

```text
app -> features -> components/ui and lib -> external packages
```

`lib` cannot import a feature. Shared components cannot import route files. A workspace package cannot import an application.

## Conventions


### Use this feature layout (FRONTEND.STRUCTURE.CONVENTION.001)

**Default:** Place operation components, server functions, schemas, hooks, and view mappings inside their use-case folder.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
features/
  posts/
    create-draft/
      CreateDraftForm.tsx
      create-draft-action.ts
      create-draft-schema.ts
      create-draft-view-model.ts
    list-posts/
      PostList.tsx
      get-posts.ts
    shared/
      PostStatusBadge.tsx
```

The example creates a module-local `shared/` folder only for code used by two use cases in that module. Cross-module primitives belong outside `features/`.

### Use explicit public entry points for workspace packages (FRONTEND.STRUCTURE.CONVENTION.002)

**Default:** Export a workspace package only through its documented package root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An application importing an internal `src/` path couples itself to a layout the package may change.

### Keep tests near their ownership boundary (FRONTEND.STRUCTURE.CONVENTION.003)

**Default:** Keep unit and component tests beside their module, and browser tests under one documented Playwright root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A focused test stays discoverable from the code it covers, while browser tests share one fixture set.

## Reference example

This informative example demonstrates `FRONTEND.STRUCTURE.TREE.001` and `FRONTEND.STRUCTURE.BOUNDARY.001`.

`app/(author)/posts/new/page.tsx` may import `CreateDraftForm` from `features/posts/create-draft/`. It cannot contain the form validation schema or post-creation business decision itself.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.STRUCTURE.TREE.001 | inspection | Folder review compares each frontend tree against the layout in this section. |
| FRONTEND.STRUCTURE.FEATURES.001 | static | `FeaturePlacementTests` asserts each feature path resolves to a declared module and use case. |
| FRONTEND.STRUCTURE.BOUNDARY.001 | inspection | `ImportBoundaryTests` asserts no cross-module import resolves an internal feature path. |
| FRONTEND.STRUCTURE.APPS.001 | inspection | `ImportBoundaryTests` asserts no application imports a path inside another application. |
| FRONTEND.STRUCTURE.PACKAGES.001 | inspection | `ImportBoundaryTests` asserts no shared package exports a page, feature state, or application component. |
| FRONTEND.STRUCTURE.IMPORTS.001 | inspection | `ImportBoundaryTests` asserts no shared or feature module imports a route path. |
| FRONTEND.STRUCTURE.CONVENTION.001 | inspection | Folder review compares each feature folder against the layout in this section. |
| FRONTEND.STRUCTURE.CONVENTION.002 | inspection | `ImportBoundaryTests` asserts no application imports a package internal path. |
| FRONTEND.STRUCTURE.CONVENTION.003 | inspection | Test layout review confirms focused tests sit beside their module and browser tests share one root. |
