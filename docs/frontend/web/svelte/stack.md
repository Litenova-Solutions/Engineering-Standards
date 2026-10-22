# Svelte Stack

## Intent

A Svelte frontend takes one of 3 rendering modes, chosen by who reads it: a static SvelteKit application for an authenticated console, server rendering for a public surface readers reach by link or search, and one static page with no router for a device client. A team opening a Svelte frontend chooses the mode here before writing routes, and finds the names, files, and libraries the shared web pages leave to this stack. The shared stack rules in [Technology Stacks](../../../core/stacks.md) apply to every stack.

## Concepts

### Structure Bindings

The shared web pages state each rule once; this stack names the values that differ per stack. Svelte frontends hold one folder per address in `src/routes`, and the frame and use-case code in `src/lib/app` and `src/lib/modules`. The toolkit generates the route types from the folders under `src/routes`. A page holds its parameters, its load, and its component. Imports resolve through the `$lib` alias, which points at `src/lib`, and shared files use the `.svelte` extension. Route groups keep their parenthesized names, because those names are router syntax.

### Rendering Bindings

Svelte routes are folders under `src/routes`, each holding a page, and the toolkit generates the route types from them. Each page declares its parameters in a schema and prefetches its reads in its load. Pages read route data with a query creator over the key the load filled, and intent preloading fills the query cache before navigation. A shell is a layout file holding the frame every child page shares. Server-only code lives in a server file or under the server library.

In Svelte terms: a page is a route file, a load is a loader, and a query creator is a suspense query.

### Component Bindings

A class or style binding spells `class`, `class:`, `style`, or `style:`. A file holding a drawing no composite makes ends with `*.visual.svelte`. Raw HTML reaches the page only through `{@html}`. The route error surface is the route error page, which draws the shared problem state. Component authoring follows [Svelte Components](components.md). The page-code lint applies the same restrictions through the Svelte ESLint processor, with visual files allowlisted.

### Data Bindings

The frame root, holding client configuration and cross-route values, is `src/lib/app`. The client generator adds the `@tanstack/svelte-query` plugin. The component's own state is a rune. The dictionary library is `svelte-i18n`, or machinery meeting the same contract. The shared package's form entry point is its form creator.

### Testing Bindings

The mocks rule forbids replacing Svelte, SvelteKit, the query library, and the form library.

### UI Bindings

The registry build command is `shadcn-svelte build`. The state-to-tone table lives in `src/lib/app/states.ts`.

## Standards

### Select a Rendering Mode by Audience

**Statement:** A Svelte frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

**Rationale:** A console opens inside the application a signed-in user already has, so its first response has nothing to index and ships as static files. A public page arrives by message or search result, so its title and links belong in the first response and it renders on the server. A page counts as indexed when its readers reach it from a message or a search result. A device client asks one question over and over and takes a static page with no router.

**Example:** A back-office console and an internal admin console ship as static files. A public storefront runs as a Node server that hydrates in the browser. A warehouse handheld client ships as one static page.

### Build a Device Client as One Static Page

**Statement:** A device client MUST ship as one static page with no router.

**Rationale:** A device client shows one answer on repeat: one question, one screen, no navigation. A router would add downloads for destinations the client never visits. One static page carries exactly what the device needs.


## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/svelte/stack#select-a-rendering-mode-by-audience | guidance | Each frontend renders in the mode its audience requires: static files for a console, server rendering for an indexed public page. |
| litespec/frontend/web/svelte/stack#build-a-device-client-as-one-static-page | guidance | Each device client ships as one static page with no router. |
