# Overview

## Intent

The frontend pages state how the browser side of a LiteSpec product is built: its frame, routes, and modules named for the backend use cases they call, the shared components and governed visual language, the interface pattern catalog, and how data, rendering, and testing work, with the React, Svelte, and Blazor bindings that realize them. Frontend teams and agents follow them when they add a route, build a screen, or change shared UI or data code, so every screen answers the same question the same way.

## How the Pages Fit Together

The seven principle pages directly in this folder hold for every frontend, from a web application to a client-only Blazor product. They say what each part owns without naming a framework: structure, routes, components, UI governance, patterns, data, and testing. React and Svelte share the web folder, whose [Web overview](web/README.md) lists the pages that state the TypeScript bindings both apply; each stack folder then states only what its own technology adds. Recurring interface questions are decided once in [UI Patterns](patterns.md) and its pattern pages, which apply with this folder.

## Frontend Principles

- [Frontend Structure](structure.md): frame, routes, and use-case modules, and the module tree that mirrors the backend.
- [Frontend Rendering and Routes](rendering.md): route addresses, data loading, and how each route state renders.
- [Frontend Components](components.md): the shared UI package and how page code composes its parts.
- [Controlled UI Governance](ui.md): the visual authority, the design contract, the floorplans, and the route suite.
- [UI Patterns](patterns.md): the catalog that decides each recurring interface question once.
- [Frontend Data and State](data.md): the generated client, the query cache, command writes, and how failures reach the reader.
- [Frontend Testing](testing.md): unit tests, browser suites, and the contract check for every address.

## Shared Web Pages

- [Web overview](web/README.md): the TypeScript pages the React and Svelte stacks both apply, and the two stacks themselves.

## Stacks

- [React Stack](web/react/stack.md): the React binding and its three rendering modes.
- [Svelte Stack](web/svelte/stack.md): the Svelte binding and its three rendering modes.
- [Blazor Stack](blazor/stack.md): the client-only domain model, browser persistence, and WebAssembly application.
