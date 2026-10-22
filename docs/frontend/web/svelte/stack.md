# Svelte Stack

## Intent

A Svelte frontend takes one of 3 rendering modes, chosen by who reads it: a static SvelteKit application for an authenticated console, server rendering for a public surface readers reach by link or search, and one static page with no router for a device client. A team opening a Svelte frontend chooses the mode here before writing routes. The shared stack rules in [Technology Stacks](../../../core/stacks.md) apply to every stack.

## Standards

### Select a rendering mode by audience

**Statement:** A Svelte frontend MUST render as a static application when it is a console, and on the server when a public page is indexed.

**Rationale:** A console opens inside the application a signed-in user already has, so its first response has nothing to index and ships as static files. A public page arrives by message or search result, so its title and links belong in the first response and it renders on the server. A page counts as indexed when its readers reach it from a message or a search result. A device client asks one question over and over and takes a static page with no router.

**Example:** A back-office console and an internal admin console ship as static files. A public storefront runs as a Node server that hydrates in the browser. A warehouse handheld client ships as one static page.

### Build a device client as one static page

**Statement:** A device client MUST ship as one static page with no router.

**Rationale:** A device client shows one answer on repeat: one question, one screen, no navigation. A router would add downloads for destinations the client never visits. One static page carries exactly what the device needs.


## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/svelte/stack#select-a-rendering-mode-by-audience | guidance | Does each frontend render in the mode its audience requires? |
| litespec/frontend/web/svelte/stack#build-a-device-client-as-one-static-page | guidance | Is each device client one static page with no router? |
