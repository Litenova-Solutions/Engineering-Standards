# React Stack

## Intent

A React frontend takes one of 3 rendering modes, chosen by who reads it: a static application for an authenticated console, server rendering for a public surface readers reach by link or search, and one static page with no router for a device client. A team opening a React frontend chooses the mode here before writing routes, and finds the names, files, and libraries the shared web pages leave to this stack. The shared stack rules in [Technology Stacks](../../../core/stacks.md) apply to every stack.

## Concepts

### Structure Bindings

The shared web pages state each rule once; this stack names the values that differ per stack. React frontends hold the frame in `src/app`, one file per address in `src/routes`, and the use-case code in `src/modules`. The router generates the typed route tree from the files under `src/routes`. A route file holds its search parameters, its loader, and its component, and shared files use the `.tsx` extension.

### Rendering Bindings

React routes are files using the router's file convention, and the router builds the typed route tree from them. Each route declares its search parameters in `validateSearch` and prefetches its reads in its loader. Components read route data with `useSuspenseQuery` over the key the loader filled, and intent preloading fills the query cache before navigation. A shell is a pathless layout route whose file name starts with an underscore. Server-only code lives in a file whose name and import show the server ownership.

### Component Bindings

A class or style binding spells `className` or `style`. A file holding a drawing no composite makes ends with `*.visual.tsx`. Raw HTML reaches the page only through `dangerouslySetInnerHTML`. The route error surface is the route error component, which draws the shared problem state. Component authoring follows [React Components](components.md). The page-code lint applies import restrictions and JSX element restrictions in route and module folders, with visual files allowlisted.

### Data Bindings

The frame root, holding client configuration and cross-route values, is `src/app`. The client generator adds the `@tanstack/react-query` plugin. The component's own state is local component state. The dictionary library meets the locale-dictionary contract the localization rule states. The shared package's form entry point is its form hook.

### Testing Bindings

The mocks rule forbids replacing the rendering library, the router, and the query library.

### UI Bindings

The registry build command is `shadcn build`. The state-to-tone table lives in `src/app/states.tsx`.

## Standards

### Select a Rendering Mode by Audience

**Statement:** A React frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

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
| litespec/frontend/web/react/stack#select-a-rendering-mode-by-audience | guidance | Each frontend renders in the mode its audience requires: static files for a console, server rendering for an indexed public page. |
| litespec/frontend/web/react/stack#build-a-device-client-as-one-static-page | guidance | Each device client ships as one static page with no router. |
