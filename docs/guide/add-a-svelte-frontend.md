# Add a Svelte Frontend

## Purpose

A product that serves its web interface from Svelte declares the same application tree as the React frontend in the tutorial, against the same backend use cases. This guide declares that frontend: the stack entry, the application tree with mirrored use case paths, and routes composed from one floorplan each. Each step names the standard it satisfies, and the guide adds no rule of its own.

## Prerequisites

Start with:

- A consumer from [Start a Consumer Repository](../tutorial/getting-started.md), with its backend use cases implemented.
- The `svelte` stack beside the tutorial pair in the consumer's `litespec.project.json`.
- The Svelte toolchain release pinned in `litespec.manifest.json` at the LiteSpec root.

Read the [web structure page](../frontend/web/structure.md) and the [web UI page](../frontend/web/ui.md) before this guide: they state the obligations, and this guide shows one compliant way to meet them.

## Procedure

### Declare the Svelte Stack

Add the `svelte` stack to `litespec.project.json`, matching the stack entries of the `dotnet-svelte` preset on the [initialize command page](../tools/init.md). This satisfies `litespec/core/scope#select-a-size-a-shape-and-stacks`.

### Declare the Application Tree

Declare the application tree and mirror the backend use case path for each route. This satisfies `litespec/frontend/web/structure#use-the-frontend-application-tree`.

### Compose Each Route from One Floorplan

Compose each route from one floorplan. This satisfies `litespec/frontend/web/ui#compose-each-route-from-one-floorplan`.

### Pin the Baseline in the Shared Package

Pin the shadcn-svelte baseline in the shared package. This satisfies `litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package`.

## Check

- `litespec ui` exits `0` from the consumer root.
- `litespec model build` followed by `litespec model check` links each new screen to its use case with no finding.
