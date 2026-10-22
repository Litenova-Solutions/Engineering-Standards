# Web Structure

## Intent

React and Svelte frontends share one folder layout: a frame holding the values shared across routes, one route per address, and modules that mirror the backend's use cases so each business area and user task sits in the same place on both sides. This page states the folders, the toolchain, the import direction, and the commands the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) share, following the structure rules in [Frontend Structure](../structure.md). A team that applies it while adding files keeps every use case findable by path and every layer importing in one direction.

## Standards

### Use the Frontend Application Tree

**Statement:** A frontend MUST use the frame, routes, and modules layout its stack page states.

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

### Refuse Stack-Specific Folder Names

**Statement:** A React folder MUST NOT be named `lib`, nor a Svelte folder under `src/lib` be named `stores`.

**Rationale:** A `lib` folder on React would sit beside `src/app` as a second frame, and `src/app` already holds the frame. A `stores` folder on Svelte would gather shared state in one place, while the rules put shared state in the frame or beside its readers. Refusing both names stops the second home before anything moves into it.

### Keep a Route File Thin

**Statement:** A route file MUST hold its input, its load, and its component, with no reusable logic and no import of another route file.

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

### Keep Imports Directional

**Statement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

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

A module importing a route reverses the flow, as does a shared package importing an application. A frame module reaching into one module's use-case folder for a second module's data tangles two layers. On Svelte, imports resolve through the alias its stack page names.

### Locate the Frame in the App Folder

**Statement:** A frontend MUST place cross-route values in the frame folder its stack page states: client configuration, session read, language choice, permissions, formatting, and shell data.

**Rationale:** Client configuration, session read, language choice, permissions, formatting, and shell data cross every route. Filed in the frame folder, each has one home; filed in a route, each exists once per route with copies to keep equal. A browser API reached from a use-case module belongs here too, because a module renders and reads data rather than touching the device. This realizes litespec/frontend/structure#locate-cross-route-values-in-the-frame.

## Conventions

### Use the Generated Route Tree

**Default:** Generate the typed route artifacts from the files under `src/routes` with the router's own command, and keep them untracked.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The typed route artifacts derive from the files under `src/routes`, so generating them with the router's own command and leaving them untracked keeps one source of truth. Committed artifacts add a second copy that a renamed route file leaves behind.

### Use Explicit Public Entry Points for Workspace Packages

**Default:** Export a workspace package only through its documented package root or a documented subpath in its manifest.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A package manifest names what an application may import: the package root or a documented subpath. An application importing an internal source path couples itself to a layout the package may rearrange, and the next package edit breaks the importer. This realizes litespec/frontend/structure#use-explicit-public-entry-points-for-shared-packages.

### Keep Tests Near Their Ownership Boundary

**Default:** Name a logic test `*.test.ts` beside its module, and keep browser suites under one `tests/` root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A logic test beside its module stays discoverable from the code it covers, while the browser suites share one `tests/` root per frontend with one fixture set and one deployment, so they run as one suite instead of scattered files. This realizes litespec/frontend/structure#place-tests-at-their-ownership-boundary.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/structure#use-the-frontend-application-tree | guidance | Each frontend tree matches the frame, routes, and modules layout its stack page states. |
| litespec/frontend/web/structure#refuse-stack-specific-folder-names | guidance | No React folder takes the name `lib`, and no Svelte folder under `src/lib` takes the name `stores`. |
| litespec/frontend/web/structure#keep-a-route-file-thin | guidance | Each route file holds only its input, its load, and its component, importing no other route file. |
| litespec/frontend/web/structure#keep-imports-directional | guidance | Every import follows the route to module to frame to package direction. |
| litespec/frontend/web/structure#locate-the-frame-in-the-app-folder | guidance | The frame folder its stack page names holds every cross-route value and browser use. |
| litespec/frontend/web/structure#use-the-generated-route-tree | guidance | The build and type-check scripts each run the router's generate command, and the generated artifacts stay untracked. |
| litespec/frontend/web/structure#use-explicit-public-entry-points-for-workspace-packages | guidance | Every application import resolves to the package root or a documented subpath its package manifest exports. |
| litespec/frontend/web/structure#keep-tests-near-their-ownership-boundary | guidance | Each logic test sits beside its module as `*.test.ts`, and the browser suites share one `tests/` root per frontend. |
