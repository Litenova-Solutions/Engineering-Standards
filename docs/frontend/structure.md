# Frontend Structure

## Intent

A frontend holds three parts: a frame, routes, and use-case modules. The frame holds everything cross-cutting. The routes hold the addresses the frontend serves. The modules hold one folder per backend use case the frontend calls. Each frontend is one entry-point record.

The module tree mirrors the backend's Application tree in kebab case. A reader holding a use case specification then finds the frontend code that serves it without a second map.

## Agent Summary {#agent-summary}

- A frame, routes, and modules sit under `src`, each with one job. (standards/rule/frontend-structure.use-the-frontend-application-tree)
- A module path resolves to a backend use case folder. (standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case)
- A shared file sits in the narrowest folder holding every reader. (standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it)
- A folder named for nothing is refused. (standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing)
- React refuses `lib` and Svelte refuses `stores` under `src/lib`. (standards/rule/frontend-structure.refuse-stack-specific-folder-names)
- A route file composes and imports no other route. (standards/rule/frontend-structure.keep-a-route-file-thin)
- Browser APIs belong to the frame. (standards/rule/frontend-structure.locate-the-frame-in-the-app-folder)
- One visual authority serves every frontend. (standards/rule/frontend-structure.keep-shared-packages-non-application-specific)
- Every public use case appears in a journey or names its caller. (standards/rule/frontend-structure.cover-public-use-cases-in-journeys)

## React

React frontends use `src/app` for the frame, `src/routes` for one file per address, and `src/modules` for the use-case code. The router generates the typed route tree from the files under `src/routes`. A route file holds its search parameters, its loader, and its component. Shared files use the `.tsx` extension.

## Svelte

Svelte frontends use `src/routes` for one folder per address, and `src/lib/app` and `src/lib/modules` for the frame and the use-case code. The toolkit generates the route types from the folders under `src/routes`. A page holds its parameters, its load, and its component. Imports resolve through the `$lib` alias, which points at `src/lib`.

Shared files use the `.svelte` extension. A device client serves one page with no router. Route groups keep their parenthesized names, because those names are router syntax.

## Standards

### Use the frontend application tree (standards/rule/frontend-structure.use-the-frontend-application-tree)

**Requirement:** A frontend MUST use the frame, routes, and modules layout its stack section states.

**Example:**

React:

```text
apps/{frontend}/
  src/
    app/       the frame: client configuration, session, language, permissions, formatting, shell data
    routes/    one file per address, compiled into a typed route tree
    modules/   one folder per backend module, aggregate, and use case
  tests/
    unit/      logic tests
    routes/    the route contract suite
    e2e/       evidence specifications
  package.json
  vite.config.ts
```

Svelte:

```text
apps/{frontend}/
  src/
    routes/    one folder per address, with a page per folder
    lib/
      app/       the frame: client configuration, session, language, permissions, formatting, shell data
      modules/   one folder per backend module, aggregate, and use case
  tests/
    unit/      logic tests
    routes/    the route contract suite
    e2e/       evidence specifications
  svelte.config.js
  vite.config.ts
  package.json
```

The generated route artifacts, build output, and dependency folders stay untracked.

### Mirror the backend use case path in kebab case (standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case)

**Requirement:** A use-case folder MUST sit under the modules root at `{module}/{aggregate}/{use-case}/` in kebab case, resolving to the backend folder of the same three names.

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

**Example:** Three order queries share one tab strip, so `orders-tabs.tsx` sits flat in `modules/orders/orders/` on React and `orders-tabs.svelte` sits flat in `lib/modules/orders/orders/` on Svelte. A file read by several aggregates sits flat in the module folder.

### Reject a folder name that owns nothing (standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing)

**Requirement:** A folder under `src` MUST NOT be named `shared`, `common`, `utils`, `util`, `helpers`, `misc`, `components`, `hooks`, `types`, or `services`.

**Rationale:** A folder with one of these names can refuse nothing, so it collects everything and nothing in it is reviewed against a use case.

**Example:** A shared query three use cases read sits flat in the aggregate folder, not in a `shared/` folder beside them.

### Refuse stack-specific folder names (standards/rule/frontend-structure.refuse-stack-specific-folder-names)

**Requirement:** A React folder MUST NOT be named `lib`, nor a Svelte folder under `src/lib` be named `stores`.

**Rationale:** `lib` is refused on React because the frame lives in `src/app`, so a `lib` folder would be a second frame. `stores` is refused on Svelte because shared state belongs in the frame or beside its readers, not in one store folder.

### Keep a route file thin (standards/rule/frontend-structure.keep-a-route-file-thin)

**Requirement:** A route file MUST hold its input, its load, and its component, with no reusable logic and no import of another route file.

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

The Svelte page does the same in its load:

```ts
export async function load({ parent, url }) {
  const { queryClient } = await parent();
  const search = orderSearch.parse(Object.fromEntries(url.searchParams));
  await queryClient.ensureQueryData(merchantOrdersQuery(search.q, search.page));
  return { search };
}
```

### Keep imports directional (standards/rule/frontend-structure.keep-imports-directional)

**Requirement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

**Example:** This direction shows the allowed dependency path.

React:

```text
src/routes -> src/modules -> src/app -> packages/*
```

Svelte:

```text
src/routes -> src/lib/modules -> src/lib/app -> packages/*
```

A module cannot import a route. A shared package cannot import an application. A frame module cannot reach into one module's use-case folder for a second module's data. Imports on Svelte resolve through the `$lib` alias, which points at `src/lib`.

### Keep applications independent (standards/rule/frontend-structure.keep-applications-independent)

**Requirement:** A frontend MUST NOT import source from another frontend.

**Rationale:** Each application owns its routes, its environment, its session handling, its words, its tests, and its deployment. A shared import moves one of those into the wrong place.

### Keep shared packages non application specific (standards/rule/frontend-structure.keep-shared-packages-non-application-specific)

**Requirement:** A shared package MUST NOT contain page composition, feature state, authentication policy, or application components.

**Rationale:** It holds the generated client, the shared UI package, the language machinery, and the frontend tooling. Each serves every frontend and names none of them.

### Locate the frame in the app folder (standards/rule/frontend-structure.locate-the-frame-in-the-app-folder)

**Requirement:** A frontend MUST place cross-route values in the frame folder its stack section states: client configuration, session read, language choice, permissions, formatting, and shell data.

**Rationale:** These values cross every route, so a route holding one of them holds it twice with two copies to keep equal. A browser API reached from a use-case module belongs here as well, because a module renders and reads data rather than touching the device.

### Cover public use cases in journeys (standards/rule/frontend-structure.cover-public-use-cases-in-journeys)

**Requirement:** Every public use case MUST appear in a journey or name its background caller.

**Rationale:** A use case in no journey and with no named caller is unreachable from every actor. The journey or the caller name states who reaches it and why.

## Conventions

### Use the generated route tree (standards/rule/frontend-structure.use-the-generated-route-tree)

**Default:** Generate the typed route artifacts from the files under `src/routes` with the router's own command, and keep them untracked.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The artifacts derive from the route files, so committing them adds a second copy that a renamed file leaves behind.

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

A search use case folder holds its query definition and its table. The aggregate folder holds the tab strip its three sibling use cases share. Nothing sits in a `shared/` folder, because that name owns nothing.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/frontend-structure.use-the-frontend-application-tree | guidance | Does each frontend tree match the layout its stack section states? |
| standards/rule/frontend-structure.mirror-the-backend-use-case-path-in-kebab-case | guidance | Does each use-case folder resolve to its backend folder? |
| standards/rule/frontend-structure.keep-a-use-case-folder-flat | guidance | Does each use-case folder hold files and no subfolder? |
| standards/rule/frontend-structure.place-a-shared-file-in-the-folder-that-owns-it | guidance | Does each shared file sit in the narrowest folder holding every reader? |
| standards/rule/frontend-structure.reject-a-folder-name-that-owns-nothing | guidance | Does any folder carry a refused name? |
| standards/rule/frontend-structure.refuse-stack-specific-folder-names | guidance | Does any React folder take the name `lib`, or any Svelte folder under `src/lib` the name `stores`? |
| standards/rule/frontend-structure.keep-a-route-file-thin | guidance | Does each route file hold only its input, its load, and its component? |
| standards/rule/frontend-structure.keep-imports-directional | guidance | Does every import follow the route to module to frame to package direction? |
| standards/rule/frontend-structure.keep-applications-independent | guidance | Does any frontend import source from another frontend? |
| standards/rule/frontend-structure.keep-shared-packages-non-application-specific | guidance | Does any shared package name a use case or a screen? |
| standards/rule/frontend-structure.locate-the-frame-in-the-app-folder | guidance | Does the frame hold every cross-route value and browser use? |
| standards/rule/frontend-structure.cover-public-use-cases-in-journeys | guidance | Does every public use case appear in a journey or name its background caller? |
| standards/rule/frontend-structure.use-the-generated-route-tree | guidance | Do the build and type-check scripts each run the router's generate command? |
| standards/rule/frontend-structure.use-explicit-public-entry-points-for-workspace-packages | guidance | Does any application import a path its package manifest does not export? |
| standards/rule/frontend-structure.keep-tests-near-their-ownership-boundary | guidance | Do logic tests sit beside their module and browser suites share one root? |
