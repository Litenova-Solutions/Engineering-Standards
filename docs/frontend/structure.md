# Frontend Structure

## Intent


A React frontend is three folders under `src`. The frame holds everything cross-cutting. The routes hold one file per address. The modules hold one folder per backend use case the frontend calls.

The module tree mirrors the backend's Application tree in kebab case. A reader holding a use case specification then finds the frontend code that serves it without a second map.

## Agent Summary {#agent-summary}


- Three folders sit under `src`, each with one job. (standards/rule/frontend-structure.use-the-frontend-application-tree)
- A module path resolves to a backend use case folder. (standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case)
- A shared file sits in the narrowest folder holding every reader. (standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it)
- A folder named for nothing is refused. (standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing)
- A route file composes and imports no other route. (standards/rule/frontend-structure.keep-a-route-file-thin)
- Browser APIs belong to the frame. (standards/rule/frontend-structure.locate-the-frame-in-the-app-folder)
- One visual authority serves every frontend. (standards/rule/frontend-structure.keep-shared-packages-non-application-specific)

## Standards


### Use the frontend application tree (standards/rule/frontend-structure.use-the-frontend-application-tree)

**Requirement:** A React frontend MUST use `src/app`, `src/routes`, and `src/modules` for the frame, the addresses, and the use-case code.

**Example:**

```text
apps/{frontend}/
  src/
    app/       the frame: client configuration, session, language, permissions, formatting, shell data
    routes/    one file per address, compiled into a typed route tree
    modules/   one folder per backend module, aggregate, and use case
  tests/
    unit/      logic tests and the structure check
    routes/    the route contract suite
    e2e/       evidence specifications
  package.json
  vite.config.ts
```

The generated route tree, build output, and dependency folders stay untracked.

### Mirror the backend use case path in kebab case (standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case)

**Requirement:** A use-case folder MUST sit at `src/modules/{module}/{aggregate}/{use-case}/` in kebab case, resolving to the backend folder of the same three names.

**Rationale:** A reader holding a specification page then finds the frontend code by translating three names. No second register has to be learned to make that translation.

**Example:** One backend folder and its frontend counterpart are the same path in two spellings.

```text
apps/api/src/Shop.Application/Orders/Orders/SearchMerchantOrders/
apps/admin/src/modules/orders/orders/search-merchant-orders/
```

### Keep a use case folder flat (standards/rule/frontend-structure.keep-a-use-case-folder-flat)

**Requirement:** A folder named for one use case MUST hold files and no subfolder.

**Rationale:** A subfolder inside a use case names a thing the backend does not have. The mirror stops being checkable at that point, and nothing reports it.

### Place a shared file in the folder that owns it (standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it)

**Requirement:** A file read by several use cases of one aggregate MUST sit flat in that aggregate's folder.

**Rationale:** The lowest folder holding every reader is the only place where moving the file changes nothing else. A reader finds it beside its consumers rather than through an index.

**Example:** Three order queries share one tab strip, so `orders-tabs.tsx` sits flat in `modules/orders/orders/`. A file read by several aggregates sits flat in the module folder.

### Reject a folder name that owns nothing (standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing)

**Requirement:** A folder under `src` MUST NOT be named `shared`, `common`, `utils`, `util`, `helpers`, `misc`, `components`, `hooks`, `lib`, `types`, or `services`.

**Rationale:** A folder with one of these names can refuse nothing, so it collects everything and nothing in it is reviewed against a use case.

**Example:** A query wrapper three use cases share sits flat in the aggregate folder, not in a `shared/` folder beside them.

### Keep a route file thin (standards/rule/frontend-structure.keep-a-route-file-thin)

**Requirement:** A route file MUST hold its search parameters, its loader, and its component, with no reusable logic and no import of another route file.

**Rationale:** A column definition or a validation rule in a route file is unreachable from the second route that needs it. An import between two route files makes one address depend on another.

**Example:** An order list route validates its search, prefetches its read, and composes one floorplan from module components.

```tsx
export const Route = createFileRoute("/_console/orders/")({
  validateSearch: z.object({ q: z.string().trim().catch("").default(""), ...pagingSearch }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(merchantOrdersQuery(deps.q, deps.page)),
  component: OrdersPage,
});
```

### Keep imports directional (standards/rule/frontend-structure.keep-imports-directional)

**Requirement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

**Example:** This direction shows the allowed dependency path.

```text
src/routes -> src/modules -> src/app -> packages/*
```

A module cannot import a route. A shared package cannot import an application. A frame module cannot reach into one module's use-case folder for a second module's data.

### Keep applications independent (standards/rule/frontend-structure.keep-applications-independent)

**Requirement:** A frontend MUST NOT import source from another frontend.

**Rationale:** Each application owns its routes, its environment, its session handling, its words, its tests, and its deployment. A shared import moves one of those into the wrong place.

### Keep shared packages non application specific (standards/rule/frontend-structure.keep-shared-packages-non-application-specific)

**Requirement:** A shared package MUST NOT contain page composition, feature state, authentication policy, or application components.

**Rationale:** It holds the generated client, the shared UI package, the language machinery, and the frontend tooling. Each serves every frontend and names none of them.

### Locate the frame in the app folder (standards/rule/frontend-structure.locate-the-frame-in-the-app-folder)

**Requirement:** A frontend MUST place its client configuration, its session read, its language choice, its permissions, its formatting, and its shell data in `src/app`.

**Rationale:** These values cross every route, so a route holding one of them holds it twice with two copies to keep equal. A browser API reached from a use-case module belongs here as well, because a module renders and reads data rather than touching the device.

## Conventions


### Use the generated route tree (standards/rule/frontend-structure.use-the-generated-route-tree)

**Default:** Generate the typed route tree from the files under `src/routes` with the router's own command, and keep it untracked.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The tree is derived from the route files, so committing it adds a second copy that a renamed file leaves behind.

### Use explicit public entry points for workspace packages (standards/rule/frontend-structure.use-explicit-public-entry-points-for-workspace-packages)

**Default:** Export a workspace package only through its documented package root or a documented subpath in its manifest.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An application importing an internal source path couples itself to a layout the package may change.

### Keep tests near their ownership boundary (standards/rule/frontend-structure.keep-tests-near-their-ownership-boundary)

**Default:** Name a logic test `*.test.ts` beside its module, and keep browser suites under one `tests/` root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A focused test stays discoverable from the code it covers, while the browser suites share one fixture set and one deployment.

## Reference example

This informative example demonstrates `standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case`, `standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it`, and `standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing`.

A search use case folder holds its query wrapper and its table. The aggregate folder holds the tab strip its three sibling use cases share. Nothing sits in a `shared/` folder, because that name would own nothing and the structure check refuses it.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-structure.use-the-frontend-application-tree | inspection | Folder review compares each frontend tree against the layout in this section. |
| standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case | test | `tests/unit/structure.test.ts` calls `checkModuleStructure` and asserts an empty result. |
| standards/rule/frontend-structure.keep-a-use-case-folder-flat | test | `checkModuleStructure` reports a subfolder inside a use-case folder by its own message. |
| standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it | inspection | Folder review confirms each file flat in an aggregate or module folder has two real readers. |
| standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing | test | `checkModuleStructure` reports each refused name with its path. |
| standards/rule/frontend-structure.keep-a-route-file-thin | static | The frontend lint config refuses a route import, as `packages/*/eslint.config.js` does. |
| standards/rule/frontend-structure.keep-imports-directional | inspection | Import review confirms no module imports a route and no package imports an application. |
| standards/rule/frontend-structure.keep-applications-independent | inspection | Import review confirms no frontend resolves a path inside another frontend. |
| standards/rule/frontend-structure.keep-shared-packages-non-application-specific | inspection | Package review confirms each shared package names no use case and no screen. |
| standards/rule/frontend-structure.locate-the-frame-in-the-app-folder | static | The frontend lint config refuses a browser global reached from `src/modules`. |
| standards/rule/frontend-structure.use-the-generated-route-tree | inspection | The `build` and `type-check` scripts each run the router's generate command. |
| standards/rule/frontend-structure.use-explicit-public-entry-points-for-workspace-packages | inspection | Import review confirms no application imports a path its package manifest does not export. |
| standards/rule/frontend-structure.keep-tests-near-their-ownership-boundary | inspection | Test layout review confirms logic tests sit beside their module and browser suites share one root. |