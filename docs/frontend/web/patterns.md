# Web UI Pattern Decisions

## Intent

This page states how the TypeScript web group realizes the frontend pattern rules ([UI Pattern Decisions](../patterns.md)). It states the React and Svelte bindings and the widths one web implementation requires. A provision here cites the neutral rule it realizes.

## Standards

### Implement a chosen pattern once

**Requirement:** The shared web UI packages MUST implement each chosen pattern once at the source paths the catalog names for `react` and `svelte`.

**Rationale:** One implementation per web platform keeps every React and Svelte route on the same behavior. A route redrawing the pattern is a second decision the catalog cannot track. This realizes litespec/frontend/patterns#implement-a-chosen-pattern-once.

**Example:** The catalog names `packages/ui/src/table/sort-header.tsx` under `react` and `packages/ui/src/table/sort-header.svelte` under `svelte`, so every invoice route composes one of them.

## Conventions

### Keep a visual registry

**Default:** Review LiteSpec options in `litespec patterns preview` at 390 and 1200 CSS pixels, and draw only product-specific options in a product registry at 390 and 1280.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An option seen beside its rivals is judged on appearance rather than description. The preview already draws every LiteSpec option, so a product registry draws only the patterns and options the product added. The product registry command or path lives in the catalog `registry` field. This realizes litespec/frontend/patterns#keep-a-visual-registry.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/patterns#implement-a-chosen-pattern-once | checkable | `litespec ui` reports a named React or Svelte component path that does not exist. |
| litespec/frontend/web/patterns#keep-a-visual-registry | guidance | Does the registry render every product-added option at 390 and 1280 pixels? |
