# Frontend Structure

## Intent


Each frontend is an independent Next.js application organized around the same business modules and use cases as the backend. Route files compose features. Feature folders own behavior. Shared folders contain only code with real cross-feature use.

## Agent Summary {#agent-summary}


- Use the frontend application tree. (FRONTEND.STRUCTURE.001)
- Organize features by module and use case. (FRONTEND.FEATURES.001)
- Isolate module internals. (FRONTEND.BOUNDARIES.001)
- Keep applications independent. (FRONTEND.APPS.001)
- Keep shared packages non-application-specific. (FRONTEND.PACKAGES.001)
- Keep imports directional. (FRONTEND.IMPORTS.001)

## Standards


### Use the frontend application tree (FRONTEND.STRUCTURE.001)

**Requirement:** Frontends MUST use the frontend application tree.

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

### Organize features by module and use case (FRONTEND.FEATURES.001)

**Requirement:** Frontends MUST organize features by module and use case.

**Rationale:** The implementation uses `features/{module}/{use-case}/` for operation-specific components, server functions, schemas, hooks, and view mappings.

The module and use-case names match the system documentation and backend Application folders.

### Isolate module internals (FRONTEND.BOUNDARIES.001)

**Requirement:** Frontends MUST isolate module internals.

**Rationale:** One module cannot import another module's internal feature path. Route composition may render public components from more than one module when a page specification requires it.

The implementation moves shared code to `components/`, `lib/`, or a workspace package only after two real consumers need the same responsibility.

### Keep applications independent (FRONTEND.APPS.001)

**Requirement:** Frontends MUST keep applications independent.

**Rationale:** A frontend cannot import source from another frontend. Each application owns its routing, environment module, authentication integration, shadcn/ui components, source lock, Tailwind entry, tests, and deployment configuration. React web applications also own the vocabulary and page sidecars named by their UI configuration.

### Keep shared packages non-application-specific (FRONTEND.PACKAGES.001)

**Requirement:** Frontends MUST keep shared packages non-application-specific.

**Rationale:** Shared packages may contain generated API types, a thin typed API client, configuration, and CSS theme tokens. They cannot contain product page composition, feature state, application authentication policy, or application-specific React components without a project decision.

### Keep imports directional (FRONTEND.IMPORTS.001)

**Requirement:** Frontends MUST keep imports directional.

**Example:** This direction shows the allowed dependency path:

```text
app -> features -> components/ui and lib -> external packages
```

`lib` cannot import a feature. Shared components cannot import route files. A workspace package cannot import an application.

## Conventions


### Use this feature layout (FRONTEND.STRUCTURE.CONVENTION.001)

**Default:** Use this feature layout.

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

**Default:** Use explicit public entry points for workspace packages.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Workspace packages expose documented exports from their package root. Applications do not import another package's internal `src/` path.

### Keep tests near their ownership boundary (FRONTEND.STRUCTURE.CONVENTION.003)

**Default:** Keep tests near their ownership boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Unit and component tests may stay beside the module they test. Cross-route browser tests live under the frontend's `tests/e2e/` or another single documented Playwright root.

## Reference example

This informative example demonstrates `FRONTEND.STRUCTURE.001` and `FRONTEND.BOUNDARIES.001`.

`app/(author)/posts/new/page.tsx` may import `CreateDraftForm` from `features/posts/create-draft/`. It cannot contain the form validation schema or post-creation business decision itself.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.STRUCTURE.001 | inspection | Pull request review asserts `use the frontend application tree` in the owning specification and source paths. |
| FRONTEND.FEATURES.001 | static | Repository static check asserts `organize features by module and use case` for the owning paths. |
| FRONTEND.BOUNDARIES.001 | inspection | Pull request review asserts `isolate module internals` in the owning specification and source paths. |
| FRONTEND.APPS.001 | inspection | Pull request review asserts `keep applications independent` in the owning specification and source paths. |
| FRONTEND.PACKAGES.001 | inspection | Pull request review asserts `keep shared packages non-application-specific` in the owning specification and source paths. |
| FRONTEND.IMPORTS.001 | inspection | Pull request review asserts `keep imports directional` in the owning specification and source paths. |
| FRONTEND.STRUCTURE.CONVENTION.001 | inspection | Pull request review asserts `use this feature layout` in the owning specification and source paths. |
| FRONTEND.STRUCTURE.CONVENTION.002 | inspection | Pull request review asserts `use explicit public entry points for workspace packages` in the owning specification and source paths. |
| FRONTEND.STRUCTURE.CONVENTION.003 | inspection | Pull request review asserts `keep tests near their ownership boundary` in the owning specification and source paths. |
