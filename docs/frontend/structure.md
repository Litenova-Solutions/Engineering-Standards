# Frontend Structure

## Intent

A frontend holds three parts: a frame, routes, and use-case modules. The frame holds everything cross-cutting. The routes hold the addresses the frontend serves. The modules hold one folder per backend use case the frontend calls. Each frontend is one entry-point record.

The module tree mirrors the backend Application tree in kebab case. A reader holding a use case specification then finds the frontend code that serves it without a second map.

## Standards

### Organize a frontend into frame, routes, and modules

**Requirement:** A frontend MUST organize its code into a frame, routes, and use-case modules.

**Rationale:** The frame holds everything cross-cutting. The routes hold the addresses the frontend serves. The modules hold one folder per backend use case the frontend calls.

**Example:** Each stack names these three parts for its own toolchain.

```text
{frontend}/
  frame/     client configuration, session, language, permissions, formatting, shell data
  routes/    one entry per address
  modules/   one folder per backend module, aggregate, and use case
```

### Mirror the backend use case path in kebab case

**Requirement:** A use-case folder MUST sit under the modules root at `{module}/{aggregate}/{use-case}/` in kebab case, resolving to the backend folder of the same three names.

**Rationale:** A reader holding a specification page then finds the frontend code by translating three names. No second register has to be learned to make that translation.

**Example:** One backend folder and its frontend counterpart are the same path in two spellings.

```text
apps/api/src/Shop.Application/Orders/Orders/SearchMerchantOrders/
{frontend}/modules/orders/orders/search-merchant-orders/
```

### Keep a use case folder flat

**Requirement:** A folder named for one use case MUST hold files and no subfolder.

**Rationale:** A subfolder inside a use case names a thing the backend does not have. The mirror stops being checkable at that point, and nothing reports it.

### Place a shared file in the folder that owns it

**Requirement:** A file read by several use cases of one aggregate MUST sit flat in that aggregate's folder.

**Rationale:** The lowest folder holding every reader is the only place where moving the file changes nothing else. A reader finds it beside its consumers rather than through an index.

**Example:** Three order queries share one tab strip, so the tab strip sits flat in the aggregate folder. A file read by several aggregates sits flat in the module folder.

### Reject a folder name that owns nothing

**Requirement:** A folder under `src` MUST NOT be named `shared`, `common`, `utils`, `util`, `helpers`, `misc`, `components`, `hooks`, `types`, or `services`.

**Rationale:** A folder with one of these names can refuse nothing, so it collects everything and nothing in it is reviewed against a use case.

**Example:** A shared query three use cases read sits flat in the aggregate folder, not in a `shared/` folder beside them.

### Keep a route entry thin

**Requirement:** A route entry MUST hold its input, its load, and its component, with no reusable logic and no reference to another route entry.

**Rationale:** A column definition or a validation rule in a route entry is unreachable from the second route that needs it. A reference between two route entries makes one address depend on another.

**Example:** An order list route validates its search, prefetches its read, and composes one screen from module components.

### Order imports from routes to shared packages

**Requirement:** An import MUST point from a route to a module to the frame to a shared package, and never in the reverse direction.

**Rationale:** The direction keeps addresses, use-case code, cross-route values, and shared code in separate layers.

**Example:** This direction shows the allowed dependency path.

```text
routes -> modules -> frame -> shared packages
```

A module cannot import a route. A shared package cannot import an application. A frame module cannot reach into one module's use-case folder for a second module's data.

### Keep applications independent

**Requirement:** A frontend MUST NOT import source from another frontend.

**Rationale:** Each application owns its routes, its environment, its session handling, its words, its tests, and its deployment. A shared import moves one of those into the wrong place.

### Keep shared packages non application specific

**Requirement:** A shared package MUST NOT contain page composition, feature state, authentication policy, or application components.

**Rationale:** It holds the generated client, the shared UI package, the language machinery, and the frontend tooling. Each serves every frontend and names none of them.

### Locate cross-route values in the frame

**Requirement:** A frontend MUST place cross-route values in its frame: client configuration, session read, language choice, permissions, formatting, and shell data.

**Rationale:** These values cross every route, so a route holding one of them holds it twice with two copies to keep equal. A browser API reached from a use-case module belongs in the frame, because a module renders and reads data rather than touching the device.

### Cover public use cases in journeys

**Requirement:** Every public use case MUST appear in a journey or name its background caller.

**Rationale:** A use case in no journey and with no named caller is unreachable from every actor. The journey or the caller name states who reaches it and why.

## Conventions

### Use explicit public entry points for shared packages

**Default:** Expose a shared package only through its documented public entry points.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An application importing an internal path couples itself to a layout the package may change.

### Place tests at their ownership boundary

**Default:** Place a logic test beside its module, and keep browser suites under one tests root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A focused test stays discoverable from the code it covers, while the browser suites share one fixture set and one deployment.

## Reference example

This informative example demonstrates `litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case`, `litespec/frontend/structure#place-a-shared-file-in-the-folder-that-owns-it`, and `litespec/frontend/structure#reject-a-folder-name-that-owns-nothing`.

A search use case folder holds its query definition and its table. The aggregate folder holds the tab strip its three sibling use cases share. Nothing sits in a `shared/` folder, because that name owns nothing.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/structure#organize-a-frontend-into-frame-routes-and-modules | guidance | Does each frontend use a frame, routes, and use-case modules? |
| litespec/frontend/structure#mirror-the-backend-use-case-path-in-kebab-case | guidance | Does each use-case folder resolve to its backend folder? |
| litespec/frontend/structure#keep-a-use-case-folder-flat | guidance | Does each use-case folder hold files and no subfolder? |
| litespec/frontend/structure#place-a-shared-file-in-the-folder-that-owns-it | guidance | Does each shared file sit in the narrowest folder holding every reader? |
| litespec/frontend/structure#reject-a-folder-name-that-owns-nothing | guidance | Does any folder carry a refused name? |
| litespec/frontend/structure#keep-a-route-entry-thin | guidance | Does each route entry hold only its input, its load, and its component? |
| litespec/frontend/structure#order-imports-from-routes-to-shared-packages | guidance | Does every import follow the route to module to frame to package direction? |
| litespec/frontend/structure#keep-applications-independent | guidance | Does any frontend import source from another frontend? |
| litespec/frontend/structure#keep-shared-packages-non-application-specific | guidance | Does any shared package name a use case or a screen? |
| litespec/frontend/structure#locate-cross-route-values-in-the-frame | guidance | Does the frame hold every cross-route value and browser use? |
| litespec/frontend/structure#cover-public-use-cases-in-journeys | guidance | Does every public use case appear in a journey or name its background caller? |
| litespec/frontend/structure#use-explicit-public-entry-points-for-shared-packages | guidance | Does any application import a path its package does not export? |
| litespec/frontend/structure#place-tests-at-their-ownership-boundary | guidance | Do logic tests sit beside their module and browser suites share one root? |
