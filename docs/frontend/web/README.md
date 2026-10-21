# Overview

## Intent

The web pages state what the React and Svelte frontends do the same way: one TypeScript toolchain, one generated API client, and one shared UI package across structure, rendering, components, UI, patterns, data, and testing. No project selects this folder directly; selecting the [React Stack](react/stack.md) or [Svelte Stack](svelte/stack.md) applies it through that stack's folder chain. A developer or agent adding a route, a component, or data code to a React or Svelte frontend finds the shared rule here and the stack-specific rule on the stack page.

## How the pages fit together

Each page here follows one frontend principle page and states what the two web stacks do the same way: one toolchain, one generated client, one shared UI package. Where React and Svelte differ, the page carries a short section per stack; the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) folders hold only what one stack alone requires. A team that adds a web screen reads the principle page, then the shared page here, then the stack page where the stacks differ.

## Shared web pages

- [Web Structure](structure.md): the folders, toolchain, import direction, and commands both stacks share.
- [Web Rendering and Routes](rendering.md): loaders, validated search, chunk splitting, and per-request caching.
- [TypeScript Web Components](components.md): the registry source, the closed element list, and the shared route checks.
- [Web UI](ui.md): the pinned baseline, tokens, registry, and browser suites for shared UI.
- [Web UI Patterns](patterns.md): one implementation per platform for each chosen pattern.
- [Web Data and State](data.md): the generated client, failure mapping, cache updates, and state ownership.
- [Web Testing](testing.md): Vitest beside the module and Playwright against a running stack.

## Stacks

- [React Stack](react/stack.md): the rendering mode choice and what React alone requires.
- [Svelte Stack](svelte/stack.md): the rendering mode choice and what Svelte alone requires.
