# Web Structure

## Intent

React and Svelte frontends share one folder layout: a frame holding the values shared across routes, one route per address, and modules that mirror the backend's use cases so each business area and user task sits in the same place on both sides. This page states the folders, the toolchain, the import direction, and the commands the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) share, following the structure rules in [Frontend Structure](../structure.md). A team that applies it while adding files keeps every use case findable by path and every layer importing in one direction.

## React

React frontends hold the frame in `src/app`, one file per address in `src/routes`, and the use-case code in `src/modules`. The router generates the typed route tree from the files under `src/routes`. A route file holds its search parameters, its loader, and its component, and shared files use the `.tsx` extension.

## Svelte

Svelte frontends hold one folder per address in `src/routes`, and the frame and use-case code in `src/lib/app` and `src/lib/modules`. The toolkit generates the route types from the folders under `src/routes`. A page holds its parameters, its load, and its component. Imports resolve through the `$lib` alias, which points at `src/lib`, and shared files use the `.svelte` extension.

A device client serves one page with no router. Route groups keep their parenthesized names, because those names are router syntax.

## Standards

### Use the frontend application tree

**Requirement:** A frontend MUST use the frame, routes, and modules layout its stack section states.

**Rationale:** The frame, routes, and modules layout gives every file one predictable home: cross-route values in the frame, one address per route file or folder, and use-case code under the module that owns it. A reader moves from a use case to its code by path alone, on either stack. This realizes litespec/frontend/structure#organize-a-frontend-into-frame-routes-and-modules.

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

### Refuse stack-specific folder names

**Requirement:** A React folder MUST NOT be named `lib`, nor a Svelte folder under `src/lib` be named `stores`.

**Rationale:** A `lib` folder on React would sit beside `src/app` as a second frame, and `src/app` already holds the frame. A `stores` folder on Svelte would gather shared state in one place, while the rules put shared state in the frame or beside its readers. Refusing both names stops the second home before anything moves into it.

### Keep a route file thin

**Requirement:** A route file MUST hold its input, its load, and its component, with no reusable logic and no import of another route file.

**Rationale:** A route file holds its input, its load, and its component: the wiring for one address. Reusable logic filed there is unreachable from the second route that needs it, and an import between route files makes one address depend on another. Both push shared code into modules where it belongs. This realizes litespec/frontend/structure#keep-a-route-entry-thin.

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

### Keep imports directional

**Requirement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

**Rationale:** The direction runs from addresses to use-case code to cross-route values to shared code: route to module to frame to shared package. Each layer then builds on the ones inside it without cycles. A module importing a route, a package importing an application, or a frame module reaching into one use-case folder for another module's data each reverses the flow and tangles two layers. This realizes litespec/frontend/structure#order-imports-from-routes-to-shared-packages.

**Example:** This direction shows the allowed dependency path.

React:

```text
src/routes -> src/modules -> src/app -> packages/*
```

Svelte:

```text
src/routes -> src/lib/modules -> src/lib/app -> packages/*
```

A module cannot import a route. A shared package cannot import an application. A frame module cannot reach into one module's use-case folder for a second module's data. On Svelte, imports resolve through the `$lib` alias, which points at `src/lib`.

### Locate the frame in the app folder

**Requirement:** A frontend MUST place cross-route values in the frame folder its stack section states: client configuration, session read, language choice, permissions, formatting, and shell data.

**Rationale:** Client configuration, session read, language choice, permissions, formatting, and shell data cross every route. Filed in the frame folder, each has one home; filed in a route, each exists once per route with copies to keep equal. A browser API reached from a use-case module belongs here too, because a module renders and reads data rather than touching the device. This realizes litespec/frontend/structure#locate-cross-route-values-in-the-frame.

## Conventions

### Use the generated route tree

**Default:** Generate the typed route artifacts from the files under `src/routes` with the router's own command, and keep them untracked.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The typed route artifacts derive from the files under `src/routes`, so generating them with the router's own command and leaving them untracked keeps one source of truth. Committed artifacts add a second copy that a renamed route file leaves behind.

### Use explicit public entry points for workspace packages

**Default:** Export a workspace package only through its documented package root or a documented subpath in its manifest.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A package manifest names what an application may import: the package root or a documented subpath. An application importing an internal source path couples itself to a layout the package may rearrange, and the next package edit breaks the importer. This realizes litespec/frontend/structure#use-explicit-public-entry-points-for-shared-packages.

### Keep tests near their ownership boundary

**Default:** Name a logic test `*.test.ts` beside its module, and keep browser suites under one `tests/` root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A logic test beside its module stays discoverable from the code it covers, while the browser suites share one `tests/` root per frontend with one fixture set and one deployment, so they run as one suite instead of scattered files. This realizes litespec/frontend/structure#place-tests-at-their-ownership-boundary.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/structure#use-the-frontend-application-tree | guidance | Does each frontend tree match the layout its stack section states? |
| litespec/frontend/web/structure#refuse-stack-specific-folder-names | guidance | Does any React folder take the name `lib`, or any Svelte folder under `src/lib` the name `stores`? |
| litespec/frontend/web/structure#keep-a-route-file-thin | guidance | Does each route file hold only its input, its load, and its component? |
| litespec/frontend/web/structure#keep-imports-directional | guidance | Does every import follow the route to module to frame to package direction? |
| litespec/frontend/web/structure#locate-the-frame-in-the-app-folder | guidance | Does the frame hold every cross-route value and browser use? |
| litespec/frontend/web/structure#use-the-generated-route-tree | guidance | Do the build and type-check scripts each run the router's generate command? |
| litespec/frontend/web/structure#use-explicit-public-entry-points-for-workspace-packages | guidance | Does any application import a path its package manifest does not export? |
| litespec/frontend/web/structure#keep-tests-near-their-ownership-boundary | guidance | Do logic tests sit beside their module and browser suites share one root? |
