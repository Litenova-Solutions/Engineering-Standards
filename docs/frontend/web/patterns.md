# Web UI Patterns

## Intent

A product records its UI pattern choices in one catalog, and each chosen pattern needs one implementation per web platform. This page states how the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) follow the pattern rules in [UI Patterns](../patterns.md): implementing each chosen pattern once per platform and reviewing options in a visual registry. A team that applies it while building shared UI keeps every route on the same behavior for each pattern.

## Standards

### Implement a chosen pattern once

**Statement:** The shared web UI packages MUST implement each chosen pattern once at the source paths the catalog names for `react` and `svelte`.

**Rationale:** Each web platform implements a chosen pattern once, at the source path the catalog names for `react` or `svelte`, so every React and Svelte route composes the same behavior. A route that redraws the pattern instead creates a second decision the catalog cannot track, and the two copies diverge. This realizes litespec/frontend/patterns#implement-a-chosen-pattern-once.

**Example:** The catalog names `packages/ui/src/table/sort-header.tsx` under `react` and `packages/ui/src/table/sort-header.svelte` under `svelte`, so every invoice route composes one of them.

## Conventions

### Keep a visual registry

**Default:** Review LiteSpec options in `litespec patterns preview` at 390 and 1200 CSS pixels, and draw only product-specific options in a product registry at 390 and 1280.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An option judged beside its rivals is judged on appearance rather than description, so review happens in `litespec patterns preview` at 390 and 1200 CSS pixels. The preview already draws every LiteSpec option, so a product registry draws only the patterns and options the product added, at 390 and 1280. The catalog `registry` field holds the product registry command or path. This realizes litespec/frontend/patterns#keep-a-visual-registry.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/patterns#implement-a-chosen-pattern-once | checkable | `litespec ui` reports a named React or Svelte component path that does not exist. |
| litespec/frontend/web/patterns#keep-a-visual-registry | guidance | Does the registry render every product-added option at 390 and 1280 pixels? |
