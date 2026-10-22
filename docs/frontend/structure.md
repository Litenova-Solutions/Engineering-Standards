# Frontend Structure

## Intent

A LiteSpec frontend holds three parts: a frame holding what every route shares, routes for the addresses it serves, and one module folder per backend use case it calls, with the module tree mirroring the backend module folders in kebab case. This page states those parts, the import direction between them, and where a file shared by several use cases belongs. Frontend developers and agents apply it whenever they add or move frontend code, so a reader holding a use-case specification finds the frontend code that serves it without a second map.

## Concepts

### The Three Parts

The frame holds everything cross-cutting: client configuration, session read, language choice, permissions, formatting, and shell data. Routes hold one entry per address the frontend serves. Modules hold one folder per backend use case the frontend calls. Each frontend is one entry-point record, owning its routes, environment, session handling, words, tests, and deployment.

### The Module Mirror

The module tree mirrors the backend module tree in kebab case: `{module}/{aggregate}/{use-case}/`, where module, aggregate, and use case are the backend's three grouping names. A reader holding a use case specification translates the three backend names to lowercase folders and lands on the frontend code that serves it, with no second map to learn.

### The Import Direction

Imports point one way: routes import modules, modules import the frame, and the frame and modules import shared packages. The direction keeps addresses, use-case code, cross-route values, and shared code in separate layers, with each layer building only on the layers inside it.

## Standards

### Organize a Frontend into Frame, Routes, and Modules

**Statement:** A frontend MUST organize its code into a frame, routes, and use-case modules.

**Rationale:** Three parts give every file one home by answering one question: is it cross-cutting, is it an address, or does it serve one use case. Without the split, shared values hide inside routes, use-case code hides inside shared folders, and no author can tell where a new file belongs. The three parts make the answer mechanical.

**Example:** Each stack names these three parts for its own toolchain.

```text
{frontend}/
  frame/     client configuration, session, language, permissions, formatting, shell data
  routes/    one entry per address
  modules/   one folder per backend module, aggregate, and use case
```

### Mirror the Backend Use Case Path in Kebab Case

**Statement:** A use-case folder MUST sit under the modules root at `{module}/{aggregate}/{use-case}/` in kebab case, resolving to the backend folder of the same three names.

**Rationale:** A reader holding a specification page finds the frontend code by translating three names to lowercase folders. No second map, index, or naming register stands between the specification and the code, so an agent given a use case id resolves its frontend folder by rule. The frontend structure test holds the mirror on every build under `litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test`.

**Example:** One backend folder and its frontend counterpart are the same path in two spellings.

```text
<backend>/Orders/Orders/SearchMerchantOrders/
<frontend>/modules/orders/orders/search-merchant-orders/
```

For example, the Expenses product submits an expense through `use-case/spending.submit-expense`, implemented in the backend under `Spending/Expenses/SubmitExpense`. The web frontend serves it from the same path in kebab case.

```text
<backend>/Spending/Expenses/SubmitExpense/
<frontend>/modules/spending/expenses/submit-expense/
```

The three backend names become three lowercase folder names, so a reader holding the use case finds the frontend code by translating Spending, Expenses, and SubmitExpense.

The diagram shows the backend path beside its frontend mirror, with one arrow per translated segment.

![The backend folder Spending, Expenses, SubmitExpense beside the frontend folders spending, expenses, submit-expense, with one arrow mapping each backend segment to its kebab-case spelling.](../assets/diagrams/frontend-use-case-path.svg)

### Keep a Use Case Folder Flat

**Statement:** A folder named for one use case MUST hold files and no subfolder.

**Rationale:** A subfolder inside a use case folder names a grouping the backend does not have, so the one-to-one mirror between the two trees stops at that point. Past the subfolder, the reader can no longer translate names by rule, and nothing reports where the translation broke. Files directly in the use case folder keep the mirror checkable to the bottom.

### Place a Shared File in the Folder That Owns It

**Statement:** A file read by several use cases of one aggregate MUST sit flat in that aggregate's folder.

**Rationale:** A file read by several use cases of one aggregate belongs flat in that aggregate's folder: the lowest folder holding every reader. There it sits beside its consumers, found by browsing rather than through an index, and moving it changes nothing outside the aggregate. A file read by several aggregates rises one more level, to the module folder, by the same rule.

**Example:** Three order queries share one tab strip, so the tab strip sits flat in the aggregate folder. A file read by several aggregates sits flat in the module folder.

### Reject a Folder Name That Owns Nothing

**Statement:** A folder under `src` MUST NOT be named `shared`, `common`, `utils`, `util`, `helpers`, `misc`, `components`, `hooks`, `types`, or `services`.

**Rationale:** A folder named `shared`, `utils`, or `components` can refuse nothing: every author with a file of unclear ownership drops it there. The folder collects unrelated code that escapes review against the use cases it serves, and finding a file means searching a pile instead of translating a use case path. The refused names force each file into the folder that owns it.

**Example:** A shared query three use cases read sits flat in the aggregate folder, not in a `shared/` folder beside them.

### Keep a Route Entry Thin

**Statement:** A route entry MUST hold its input, its load, and its component, with no reusable logic and no reference to another route entry.

**Rationale:** A route entry serves one address: its input, its load, and its component. A column definition or validation rule written there is unreachable from the second route that needs it, so the second route writes its own copy. A reference from one route entry to another makes one address depend on another, so changing the first breaks the second. Reusable logic belongs in modules, where both routes import it.

**Example:** An order list route validates its search, prefetches its read, and composes one screen from module components.

### Order Imports from Routes to Shared Packages

**Statement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

**Rationale:** Imports pointing from routes to modules to the frame to shared packages keep addresses, use-case code, cross-route values, and shared code in separate layers. A reverse import collapses two layers: a module importing a route ties use-case code to one address, and a shared package importing an application ties every application to one application's choices. One direction keeps each layer usable without the layers above it.

**Example:** This direction shows the allowed dependency path.

```text
Routes -> modules -> frame -> shared packages
```

The direction refuses three imports: a module reaching a route, a shared package reaching an application, and a frame module reaching into one module's use-case folder for a second module's data.

### Keep Applications Independent

**Statement:** A frontend MUST NOT import source from another frontend.

**Rationale:** Each application owns its routes, its environment, its session handling, its words, its tests, and its deployment, so it can change, test, and ship on its own. An import from another application's source ties the two together: a change to one breaks or redeploys the other. Code two applications genuinely share moves down into a shared package, which names neither application.

### Keep Shared Packages Non Application Specific

**Statement:** A shared package MUST NOT contain page composition, feature state, authentication policy, or application components.

**Rationale:** Shared packages hold what serves every frontend and names none of them: the generated client, the shared UI package, the locale dictionaries, and the frontend tooling. Page composition, feature state, authentication policy, or application components kept there would bind every application to one application's choices. Application-specific code stays in the application, where it can change without touching the rest.

### Locate Cross-Route Values in the Frame

**Statement:** A frontend MUST place cross-route values in its frame: client configuration, session read, language choice, permissions, formatting, and shell data.

**Rationale:** Client configuration, session read, language choice, permissions, formatting, and shell data cross every route. A route holding one of them holds a copy beside every other route's copy, with nothing keeping the copies equal. The frame holds each once, where every route reaches it. A browser API a use-case module needs belongs in the frame too, because a module renders and reads data rather than touching the device.

## Conventions

### Use Explicit Public Entry Points for Shared Packages

**Default:** Expose a shared package only through its documented public entry points.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shared package is free to rearrange its internals between releases. An application importing an internal path couples itself to that layout, so the next rearrangement breaks the application. Documented public entry points are the stable surface the package keeps.

### Place Tests at Their Ownership Boundary

**Default:** Place a logic test beside its module, and keep browser suites under one tests root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A logic test beside its module is found from the code it covers and runs with it. Browser suites instead share one fixture set and one deployment per frontend, so scattering them beside modules would split the fixtures and the runs. One tests root per frontend keeps the browser suites together.

## Reference Example

This informative example demonstrates `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case`, `litespec/frontend/structure#place-a-shared-file-in-the-folder-that-owns-it`, and `litespec/frontend/structure#reject-a-folder-name-that-owns-nothing`.

A search use case folder holds its query definition and its table. The aggregate folder holds the tab strip its three sibling use cases share. Nothing sits in a `shared/` folder, because that name owns nothing.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/structure#organize-a-frontend-into-frame-routes-and-modules | guidance | Frontends separate frame, routes, and use-case modules. Look in the frontend folder roots. |
| litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case | guidance | Use-case folders sit at `{module}/{aggregate}/{use-case}/` in kebab case and resolve to the backend folder of the same names. Look in the module tree and the structure test proving the mirror. |
| litespec/frontend/structure#keep-a-use-case-folder-flat | guidance | Use-case folders hold files and no subfolder. Look in the module tree. |
| litespec/frontend/structure#place-a-shared-file-in-the-folder-that-owns-it | guidance | Files read by several use cases sit flat in the narrowest folder holding every reader. Look in the aggregate and module folders. |
| litespec/frontend/structure#reject-a-folder-name-that-owns-nothing | guidance | No folder under `src` carries a refused name. Look in the folder tree. |
| litespec/frontend/structure#keep-a-route-entry-thin | guidance | Route entries hold input, load, and component, with reusable logic in modules and no route-to-route reference. Look in the route entries. |
| litespec/frontend/structure#order-imports-from-routes-to-shared-packages | guidance | Imports point from routes to modules to the frame to shared packages. Look in the import statements. |
| litespec/frontend/structure#keep-applications-independent | guidance | Frontends import no source from another frontend. Look in the import statements. |
| litespec/frontend/structure#keep-shared-packages-non-application-specific | guidance | Shared packages hold no page composition, feature state, authentication policy, or application components. Look in the shared package sources. |
| litespec/frontend/structure#locate-cross-route-values-in-the-frame | guidance | The frame holds client configuration, session read, language choice, permissions, formatting, shell data, and browser uses. Look in the frame. |
| litespec/frontend/structure#use-explicit-public-entry-points-for-shared-packages | guidance | Applications import only documented public entry points of shared packages. Look in the application imports and the package manifests. |
| litespec/frontend/structure#place-tests-at-their-ownership-boundary | guidance | Logic tests sit beside their module, and browser suites share one tests root per frontend. Look in the module folders and the tests roots. |
