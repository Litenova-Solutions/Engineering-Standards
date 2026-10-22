# Web UI

## Intent

One shared UI package carries the pieces every route composes: the pinned baseline all applications share, the token stylesheet, the registry of page references, and the floorplans fixing each page's layout. This page states the toolchain, registry, tokens, and browser suites one web frontend requires, following the UI rules in [Controlled UI Governance](../ui.md). A team that applies it while writing shared UI and routes keeps every application looking like one product and every route proved in a browser.

## Concepts

### The web baseline

The baseline is the pinned UI source the shared package installs once. The manifest names it in the `uiBaseline` entry on React and the `uiBaselineSvelte` entry on Svelte. The registry build runs `shadcn build` on React and `shadcn-svelte build` on Svelte.

### The browser route suite

The browser suite discovers its routes from the generated route tree rather than from a handwritten list, so a new route is checked without anyone writing a specification for it. A dynamic segment resolves to a record the deployment holds, falling back to an absent record when it holds none.

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

**Statement:** A workspace MUST install the pinned baseline from `litespec.manifest.json` once, into its shared UI package, using the `uiBaseline` or `uiBaselineSvelte` entry.

**Rationale:** Installing the pinned baseline once into the shared UI package keeps every application on the same source: the CLI's configuration, the registry source, the token stylesheet, and the source lock beside them. Installing per application made one copy each, and drift in any copy was invisible because every copy compiled. An additional registry is permitted only under an exception recorded against this provision, so the departure stays visible. This realizes litespec/frontend/ui#pin-the-baseline-in-the-shared-package.

### Publish one registry item per floorplan

**Statement:** The shared package MUST publish a registry whose build exits zero and which lists one item per floorplan the design contract declares.

**Rationale:** Without an installable page for each floorplan, an author invents a page from primitives and the next author invents another. One registry item per floorplan the design contract declares gives every page type a reference the author installs before writing. A registry build that exits zero proves every item still builds.

### Compose each route from one floorplan

**Statement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes and knows the page's shape. The slots take domain values: the business record state, the use cases that state permits, and the refusal results of the called use case. Exactly one floorplan per route keeps layout decisions out of route code; a recorded freestyle route is the visible exception. This realizes litespec/frontend/ui#compose-each-route-from-one-floorplan.

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

**Statement:** Route code MUST NOT carry a layout utility such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout utility in a route file is a second layout beside the floorplan's, and the next route copies it instead of the floorplan. With layout owned by floorplan and display composites, one change reaches every route composing them. Route code carries no `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`. This realizes litespec/frontend/ui#keep-layout-inside-floorplans.

### Derive each page type from a named reference

**Statement:** Every route MUST carry a `data-registry-item` attribute naming its page type's registry item, with a freestyle route carrying no attribute and naming its decision record.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another. The `data-registry-item` attribute naming the page type's registry item keeps every page of one type on one reference, and a test resolves it. A freestyle route carries no attribute and names its decision record instead, so the exception is explicit. This realizes litespec/frontend/ui#derive-each-page-type-from-a-named-reference.

### Select a tone from the closed set

**Statement:** A state indicator MUST take one tone from the closed set, each application declaring its state-to-tone mapping once as an exhaustive table of language terms.

**Rationale:** A page that picks its own color picks a meaning nobody agreed to, and the same state reads differently on every screen. One state-to-tone mapping per application, declared once as an exhaustive table of language terms, keeps every screen consistent and makes a new state fail to compile until its tone and its word exist. The table lives in `src/app/states.tsx` on React and `src/lib/app/states.ts` on Svelte. This realizes litespec/frontend/ui#select-a-tone-from-the-closed-set.

### Keep tokens in one stylesheet

**Statement:** An application stylesheet MUST import the shared package's token stylesheet and declare no rule, with no literal color in any stylesheet the shared package ships.

**Rationale:** One token stylesheet makes two applications look like one product. Each application stylesheet imports it and declares no rule, so no application invents a value the tokens have no opinion about. A stylesheet the shared package ships beside the token sheet declares no literal color, so every color resolves through the tokens. This realizes litespec/frontend/ui#keep-tokens-in-one-definition.

### Hold the declared base color

**Statement:** A token stylesheet MUST carry the values the manifest baseline `baseColor` ramp publishes, and no value outside them except under a recorded exception.

**Rationale:** A token value outside the published `baseColor` ramp is a second palette beside the declared one, and the next author copies it. Holding the ramp keeps the whole product on one palette. A recorded exception keeps a deliberate departure visible in the design contract instead of hidden in the stylesheet. This realizes litespec/frontend/ui#hold-the-declared-base-color.

### Check every route in a browser

**Statement:** Every route MUST pass each route suite check in a browser.

**Rationale:** The Concepts section names the checks: floorplan, registry reference, axe WCAG 2.2 AA, heading, landmark, reflow, text spacing, keyboard use, target size, and status announcements. One suite visits every route the tree discovers, so a new route is checked without anyone writing a specification for it. A route outside the suite can ship any defect on the list with no error. This realizes litespec/frontend/ui#check-every-route.

### Prove every result a route calls

**Statement:** Every result a called use case returns MUST be proved by a passing test or a known-gap record with owner and end date.

**Rationale:** A refusal the reader can reach and no test provokes is a refusal nobody has seen render. The calls come from the route code, so the obligation follows the code: every result a called use case returns is proved by a passing test or named by a known-gap record with owner and end date. This realizes litespec/frontend/ui#prove-every-result-a-route-calls.

**Example:** A browser test calls the use case and asserts one refusal result.

```typescript
test('shows the changed total before payment', async ({ page }) => {
  // Steps call place-order and assert the expected-total-mismatch refusal.
});
```

### Restrict CSS decisions

**Statement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, a raw palette value, or an important modifier.

**Rationale:** Semantic tokens keep every class inside the governed palette, spacing, and type scales. An arbitrary value, a raw palette value, or an important modifier steps outside them: the value answers to no token and survives every restyle. The approved CSS surface is the shared package's stylesheet, holding the Tailwind import, the tokens, the fonts, and the documented resets. The source scan skips build output and reports authored feature CSS. This realizes litespec/frontend/ui#restrict-styling-to-semantic-tokens.

### Track source changes

**Statement:** The shared package's source lock MUST record the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive.

**Rationale:** The source lock records the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive. Normalizing source before hashing lets two workspaces compute the same digest for identical source. One lock beside one copy is what makes a changed primitive report a fork instead of passing unreported.

### Prove UI behavior and appearance

**Statement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence in the matrix in this section.

**Rationale:** Each change class carries different risk, and the matrix names the narrowest evidence that covers it: no more than needed, no less. A change that names no evidence is reviewed by gut feeling, which misses exactly the regressions the matrix lists. This realizes litespec/frontend/ui#prove-ui-behavior-and-appearance.

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

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before anything is written. The regenerated files and the local composites change for different reasons, upstream source versus product adaptation, so one review cannot cover both. The branch pins the CLI and starts clean, so the run is repeatable and the diff shows only the update.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package | checkable | `litespec ui` compares the committed configuration against the manifest baseline fields. |
| litespec/frontend/web/ui#publish-one-registry-item-per-floorplan | checkable | `shadcn build` (React) or `shadcn-svelte build` (Svelte) exits zero, and review confirms `registry.json` lists one item per declared floorplan. |
| litespec/frontend/web/ui#compose-each-route-from-one-floorplan | checkable | `tests/routes/every-route.spec.ts` asserts `page.locator("[data-floorplan]")` has count 1. |
| litespec/frontend/web/ui#keep-layout-inside-floorplans | guidance | Does any route file carry a layout utility outside its floorplan and display composites? |
| litespec/frontend/web/ui#derive-each-page-type-from-a-named-reference | checkable | `tests/routes/every-route.spec.ts` asserts `data-registry-item` resolves to a published registry item on every non-freestyle route. |
| litespec/frontend/web/ui#select-a-tone-from-the-closed-set | checkable | `pnpm type-check` fails on a state with no tone; review confirms each tone is a term. |
| litespec/frontend/web/ui#keep-tokens-in-one-stylesheet | checkable | `litespec ui` reports an application stylesheet declaring a rule and a shared stylesheet declaring a literal color. |
| litespec/frontend/web/ui#hold-the-declared-base-color | guidance | Does the token stylesheet carry only values from the declared base color ramp, with each departure recorded? |
| litespec/frontend/web/ui#check-every-route-in-a-browser | checkable | `tests/routes/every-route.spec.ts` runs axe and the Concepts checks on each discovered route. |
| litespec/frontend/web/ui#prove-every-result-a-route-calls | guidance | Is every result the route calls proved by a passing test or named by a known-gap record? |
| litespec/frontend/web/ui#restrict-css-decisions | checkable | `litespec ui` rejects an arbitrary value, a raw palette value, or an important modifier. |
| litespec/frontend/web/ui#track-source-changes | checkable | `litespec ui` recomputes each digest and reports changed primitive source. |
| litespec/frontend/web/ui#prove-ui-behavior-and-appearance | checkable | `tests/routes/every-route.spec.ts` runs on the changed route, and review confirms the change named the matrix evidence. |
| litespec/frontend/web/ui#use-the-source-update-procedure | guidance | Does the update branch record the pinned CLI, the dry-run output, and separate review of both file sets? |
