# Web UI

## Intent

This page holds how the TypeScript web stacks realize the frontend UI rules ([Frontend UI](../ui.md)). It states the toolchain, registry, tokens, and suites one web frontend requires. A provision here cites the neutral rule it realizes.

## Agent Summary {#agent-summary}

- The shared package pins the baseline, publishes registry items, and tracks source with the update procedure. (litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package, litespec/frontend/web/ui#publish-one-registry-item-per-floorplan, litespec/frontend/web/ui#track-source-changes, litespec/frontend/web/ui#use-the-source-update-procedure)
- Routes compose one floorplan from registry references and keep layout inside them. (litespec/frontend/web/ui#compose-each-route-from-one-floorplan, litespec/frontend/web/ui#derive-each-page-type-from-a-named-reference, litespec/frontend/web/ui#keep-layout-inside-floorplans)
- Tones map in one table, tokens live in one stylesheet, and colours hold the ramp. (litespec/frontend/web/ui#select-a-tone-from-the-closed-set, litespec/frontend/web/ui#keep-tokens-in-one-stylesheet, litespec/frontend/web/ui#hold-the-declared-base-colour)
- Every route passes the browser suite and each change names its matrix evidence. (litespec/frontend/web/ui#check-every-route-in-a-browser, litespec/frontend/web/ui#prove-every-result-a-route-calls, litespec/frontend/web/ui#prove-ui-behavior-and-appearance)
- Tailwind classes use semantic tokens without arbitrary values or important modifiers. (litespec/frontend/web/ui#restrict-css-decisions)

## Concepts

### The web baseline

The React baseline is the manifest `uiBaseline` entry. The Svelte baseline is the manifest `uiBaselineSvelte` entry. The registry build runs `shadcn build` on React and `shadcn-svelte build` on Svelte.

### The browser route suite

The browser suite discovers its routes from the generated route tree rather than from a list. A new route is therefore checked without a specification written for it. A dynamic segment resolves to a record the deployment holds, and falls back to an absent record when it holds none.

| Check | The route passes when |
|:---|:---|
| Floorplan | Exactly one element carries `data-floorplan` |
| Reference | Each route names its registry item or is a recorded freestyle route |
| Accessibility | axe reports zero WCAG 2.2 AA violations |
| Heading | The page carries exactly one visible `h1` |
| Landmark | The page carries one `main` landmark |
| Reflow | At 320 CSS pixels the page has no horizontal overflow; a data table may scroll inside its own region |
| Text spacing | The reflow check still passes under the WCAG 1.4.12 text-spacing override |
| Keyboard | Every interactive element is reachable and shows a visible focus indicator |
| Target size | Every pointer target meets the minimum size or spacing |
| Announcements | Asynchronous status changes announce through a live region |

## Standards

### Pin the baseline in the shared package

**Requirement:** A workspace MUST install the pinned baseline from `litespec.manifest.json` once, into its shared UI package, using the `uiBaseline` or `uiBaselineSvelte` entry.

**Rationale:** The committed files are the CLI's configuration, the registry source, the token stylesheet, and the source lock beside them. Installing per application is what made a fourth copy, where a fourth drift was invisible. An additional registry is permitted under an exception recorded against this provision. The React baseline is the manifest `uiBaseline` entry and the Svelte baseline is the `uiBaselineSvelte` entry. This realizes litespec/frontend/ui#pin-the-baseline-in-the-shared-package.

### Publish one registry item per floorplan

**Requirement:** The shared package MUST publish a registry whose build exits zero and which lists one item per floorplan the design contract declares.

**Rationale:** Without an installable page, an author invents one from primitives. One item per floorplan gives every page type a reference the author installs before writing. The registry build runs `shadcn build` on React and `shadcn-svelte build` on Svelte.

### Compose each route from one floorplan

**Requirement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes. The slots take domain values: the business record state, the use cases that state permits, and the refusal results of the called use case. This realizes litespec/frontend/ui#compose-each-route-from-one-floorplan.

**Example:** An order route composes the entity floorplan and fills each slot from the order.

React:

```tsx
<EntityPage
  title={order.number}
  status={<OrderStatus state={order.state} />}
  actions={<OrderActions permitted={order.permittedActions} />}
  facts={<OrderFacts order={order} />}
  related={<OrderPayments orderId={order.id} />}
/>
```

Svelte:

```svelte
<EntityPage title={order.number}>
  {#snippet status()}
    <OrderStatus state={order.state} />
  {/snippet}
  {#snippet actions()}
    <OrderActions permitted={order.permittedActions} />
  {/snippet}
  {#snippet facts()}
    <OrderFacts {order} />
  {/snippet}
  {#snippet related()}
    <OrderPayments orderId={order.id} />
  {/snippet}
</EntityPage>
```

### Keep layout inside floorplans

**Requirement:** Route code MUST NOT carry a layout utility such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout utility in a route file is a second layout beside the floorplan, and the next route copies it. Floorplan and display composites own layout, so one change reaches every route composing them. This realizes litespec/frontend/ui#keep-layout-inside-floorplans.

### Derive each page type from a named reference

**Requirement:** Every route MUST carry a `data-registry-item` attribute naming its page type's registry item, with a freestyle route carrying no attribute and naming its decision record.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another. An attribute that resolves keeps every page of one type on one reference. This realizes litespec/frontend/ui#derive-each-page-type-from-a-named-reference.

### Select a tone from the closed set

**Requirement:** A state indicator MUST take one tone from the closed set, each application declaring its state-to-tone mapping once as an exhaustive table of language terms.

**Rationale:** A page that picks a colour picks a meaning nobody agreed to. One mapping means the same state reads the same way on every screen. A new state then fails to compile until its tone and its word exist. The table lives in `src/app/states.tsx` on React and `src/lib/app/states.ts` on Svelte. This realizes litespec/frontend/ui#select-a-tone-from-the-closed-set.

### Keep tokens in one stylesheet

**Requirement:** An application stylesheet MUST import the shared package's token stylesheet and declare no rule, with no literal colour in any stylesheet the shared package ships.

**Rationale:** One token sheet is what makes two applications look like one product. An application stylesheet imports it and declares no rule, so a second sheet never introduces a value the first has no opinion about. A stylesheet the shared package ships beside the token sheet declares no literal colour. This realizes litespec/frontend/ui#keep-tokens-in-one-definition.

### Hold the declared base colour

**Requirement:** A token stylesheet MUST carry the values the manifest baseline `baseColor` ramp publishes, and no value outside them except under a recorded exception.

**Rationale:** A token value outside the published ramp is a second palette beside the declared one, and the next author copies it. A recorded exception keeps the deliberate departure visible in the design contract. The React baseline is the manifest `uiBaseline` entry and the Svelte baseline is the `uiBaselineSvelte` entry. This realizes litespec/frontend/ui#hold-the-declared-base-colour.

### Check every route in a browser

**Requirement:** Every route MUST pass each route suite check in a browser.

**Rationale:** The Concepts section names the checks. They cover the floorplan, the registry reference, axe WCAG 2.2 AA, the heading, the landmark, reflow, text spacing, keyboard use, target size, and status announcements. One suite visits every route, so a new route is checked without a specification written for it. This realizes litespec/frontend/ui#check-every-route.

### Prove every result a route calls

**Requirement:** Every result a called use case returns MUST be proved by a passing test or a known-gap record with owner and end date.

**Rationale:** A refusal a reader can reach and no test provokes is a refusal nobody has seen render. The calls come from the route code, so the obligation follows the code rather than a declaration. This realizes litespec/frontend/ui#prove-every-result-a-route-calls.

**Example:** A browser test calls the use case and asserts one refusal result.

```typescript
test('shows the changed total before payment', async ({ page }) => {
  // Steps call place-order and assert the expected-total-mismatch refusal.
});
```

### Restrict CSS decisions

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, a raw palette value, or an important modifier.

**Rationale:** The approved CSS surface is the shared package's stylesheet, holding the Tailwind import, the tokens, the fonts, and the documented resets. The source scan skips build output and reports authored feature CSS. This realizes litespec/frontend/ui#restrict-styling-to-semantic-tokens.

### Track source changes

**Requirement:** The shared package's source lock MUST record the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive.

**Rationale:** The lock normalizes source before hashing, so two workspaces compute the same digest for identical source. One lock beside one copy is what makes a changed primitive report a fork rather than pass unreported.

### Prove UI behavior and appearance

**Requirement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk. This realizes litespec/frontend/ui#prove-ui-behavior-and-appearance.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive source or variant | The component test for that primitive |
| Floorplan or display composite | The route suite on one route that composes it |
| Token or global CSS | The route suite on one route in each profile |
| Route | The route suite on that route, and every test proving a result it calls |
| Pattern decision | The catalog entry changes with its implementation |
| Fork | The source lock digest and the component test |
| Behavior package | The accessibility check for the capability it supplies |

## Conventions

### Use the source update procedure

**Default:** Update the primitive source on a branch that pins the CLI, starts clean, and reviews the regenerated files and the local composites separately.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written. The regenerated files and the local composites change for different reasons, so one review cannot cover both.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package | checkable | `litespec ui` compares the committed configuration against the manifest baseline fields. |
| litespec/frontend/web/ui#publish-one-registry-item-per-floorplan | checkable | `shadcn build` (React) or `shadcn-svelte build` (Svelte) exits zero, and review confirms `registry.json` lists one item per declared floorplan. |
| litespec/frontend/web/ui#compose-each-route-from-one-floorplan | checkable | `tests/routes/every-route.spec.ts` asserts `page.locator("[data-floorplan]")` has count 1. |
| litespec/frontend/web/ui#keep-layout-inside-floorplans | guidance | Does any route file carry a layout utility outside its floorplan and display composites? |
| litespec/frontend/web/ui#derive-each-page-type-from-a-named-reference | checkable | `tests/routes/every-route.spec.ts` asserts `data-registry-item` resolves to a published registry item on every non-freestyle route. |
| litespec/frontend/web/ui#select-a-tone-from-the-closed-set | checkable | `pnpm type-check` fails on a state with no tone; review confirms each tone is a term. |
| litespec/frontend/web/ui#keep-tokens-in-one-stylesheet | checkable | `litespec ui` reports an application stylesheet declaring a rule and a shared stylesheet declaring a literal colour. |
| litespec/frontend/web/ui#hold-the-declared-base-colour | guidance | Does the token stylesheet carry only values from the declared base colour ramp, with each departure recorded? |
| litespec/frontend/web/ui#check-every-route-in-a-browser | checkable | `tests/routes/every-route.spec.ts` runs axe and the Concepts checks on each discovered route. |
| litespec/frontend/web/ui#prove-every-result-a-route-calls | guidance | Is every result the route calls proved by a passing test or named by a known-gap record? |
| litespec/frontend/web/ui#restrict-css-decisions | checkable | `litespec ui` rejects an arbitrary value, a raw palette value, or an important modifier. |
| litespec/frontend/web/ui#track-source-changes | checkable | `litespec ui` recomputes each digest and reports changed primitive source. |
| litespec/frontend/web/ui#prove-ui-behavior-and-appearance | checkable | `tests/routes/every-route.spec.ts` runs on the changed route, and review confirms the change named the matrix evidence. |
| litespec/frontend/web/ui#use-the-source-update-procedure | guidance | Does the update branch record the pinned CLI, the dry-run output, and separate review of both file sets? |
