# Frontend Structure

## Intent

Each frontend is an independent Next.js application organized around the same business subjects and use cases as the backend. Route files compose features. Feature folders own behavior. Shared folders contain only code with real cross-feature use.

## Agent Summary {#agent-summary}

- Place each frontend under `apps/{name}/` with its own `app`, `features`, `components`, and `lib` folders.
- Organize feature code by subject and use case.
- Do not import another subject's internal feature files.
- Keep route files as composition boundaries.
- Keep shadcn/ui source inside each frontend.
- Share generated API types, thin clients, configuration, or CSS tokens through packages only when multiple apps consume them.

## Standards

### Use the frontend application tree (FRONTEND.STRUCTURE.001)

Each Next.js application uses:

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
  next.config.ts
  package.json
  tsconfig.json
```

Framework-generated cache and build folders remain untracked.

### Organize features by subject and use case (FRONTEND.FEATURES.001)

Use `features/{subject}/{use-case}/` for operation-specific components, server functions, schemas, hooks, and view mappings.

The subject and use-case names match ADDD documentation and backend Application folders.

### Isolate subject internals (FRONTEND.BOUNDARIES.001)

One subject cannot import another subject's internal feature path. Route composition may render public components from more than one subject when a page specification requires it.

Move shared code to `components/`, `lib/`, or a workspace package only after two real consumers need the same responsibility.

### Keep applications independent (FRONTEND.APPS.001)

A frontend cannot import source from another frontend. Each application owns its routing, environment module, authentication integration, shadcn/ui components, Tailwind entry, tests, and deployment configuration.

### Keep shared packages non-application-specific (FRONTEND.PACKAGES.001)

Shared packages may contain generated API types, a thin typed API client, configuration, and CSS theme tokens. They cannot contain product page composition, feature state, application authentication policy, or application-specific React components without a project decision.

### Keep imports directional (FRONTEND.IMPORTS.001)

Use this direction:

```text
app -> features -> components/ui and lib -> external packages
```

`lib` cannot import a feature. Shared components cannot import route files. A workspace package cannot import an application.

## Conventions

### Use this feature layout

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

Create a subject-local `shared/` folder only for code used by two use cases in that subject. Cross-subject primitives belong outside `features/`.

### Use explicit public entry points for workspace packages

Workspace packages expose documented exports from their package root. Applications do not import another package's internal `src/` path.

### Keep tests near their ownership boundary

Unit and component tests may stay beside the module they test. Cross-route browser tests live under the frontend's `tests/e2e/` or another single documented Playwright root.

## Examples

`app/(author)/posts/new/page.tsx` may import `CreateDraftForm` from `features/posts/create-draft/`. It cannot contain the form validation schema or post-creation business decision itself.

## Verification

- Compare frontend folders with the canonical tree.
- Run lint rules that reject cross-subject and cross-application imports.
- Confirm shared modules have at least two consumers.
- Confirm generated types and API clients expose public package entry points.
- Confirm route files contain composition rather than reusable feature behavior.
