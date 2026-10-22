# Web UI

## Intent

One shared UI package carries the pieces every route composes: the pinned baseline all applications share, the token stylesheet, the registry of page references, and the floorplans fixing each page's layout. This page states the toolchain, registry, tokens, and browser suites one web frontend requires, following the UI rules in [Controlled UI Governance](../ui.md). A team that applies it while writing shared UI and routes keeps every application looking like one product and every route proved in a browser.

## Concepts

### The Web Baseline

The baseline is the pinned UI source the shared package installs once. The manifest names it in the `uiBaseline` entry on React and the `uiBaselineSvelte` entry on Svelte. The registry build runs the command its stack page names.

### The Browser Route Suite

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

### Pin the Baseline in the Shared Package

**Statement:** A workspace MUST install the pinned baseline from `litespec.manifest.json` once, into its shared UI package, using the `uiBaseline` or `uiBaselineSvelte` entry.

**Rationale:** Installing the pinned baseline once into the shared UI package keeps every application on the same source: the CLI's configuration, the registry source, the token stylesheet, and the source lock beside them. Installing per application made one copy each, and drift in any copy was invisible because every copy compiled. An additional registry is permitted only under a deviation recorded against this provision, so the departure stays visible. This realizes litespec/frontend/ui#pin-the-baseline-in-the-shared-package.

### Publish One Registry Item per Floorplan

**Statement:** The shared package MUST publish a registry whose build exits zero and which lists one item per floorplan the design contract declares.

**Rationale:** Without an installable page for each floorplan, an author invents a page from primitives and the next author invents another. One registry item per floorplan the design contract declares gives every page type a reference the author installs before writing. A registry build that exits zero proves every item still builds.

### Compose Each Route from One Floorplan

**Statement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes and knows the page's shape. The slots take domain values: the aggregate state, the use cases that state permits, and the refusal results of the called use case. Exactly one floorplan per route keeps layout decisions out of route code; a recorded freestyle route is the visible deviation. This realizes litespec/frontend/ui#compose-each-route-from-one-floorplan.

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

### Keep Layout Inside Floorplans

**Statement:** Route code MUST NOT carry a layout utility such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout utility in a route file is a second layout beside the floorplan's, and the next route copies it instead of the floorplan. With layout owned by floorplan and display composites, one change reaches every route composing them. Route code carries no `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`. This realizes litespec/frontend/ui#keep-layout-inside-floorplans.

### Derive Each Page Type from a Named Reference

**Statement:** Every route MUST carry a `data-registry-item` attribute naming its page type's registry item, with a freestyle route carrying no attribute and naming its decision record.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another. The `data-registry-item` attribute naming the page type's registry item keeps every page of one type on one reference, and a test resolves it. A freestyle route carries no attribute and names its decision record instead, so the deviation is explicit. This realizes litespec/frontend/ui#derive-each-page-type-from-a-named-reference.

### Select a Tone from the Closed Set

**Statement:** A state indicator MUST take one tone from the closed set, each application declaring its state-to-tone mapping once as an exhaustive table of glossary terms.

**Rationale:** A page that picks its own color picks a meaning nobody agreed to, and the same state reads differently on every screen. One state-to-tone mapping per application, declared once as an exhaustive table of glossary terms, keeps every screen consistent and makes a new state fail to compile until its tone and its word exist. The table lives at the path its stack page names. This realizes litespec/frontend/ui#select-a-tone-from-the-closed-set.

### Keep Tokens in One Stylesheet

**Statement:** An application stylesheet MUST import the shared package's token stylesheet and declare no rule, with no literal color in any stylesheet the shared package ships.

**Rationale:** One token stylesheet makes two applications look like one product. Each application stylesheet imports it and declares no rule, so no application invents a value the tokens have no opinion about. A stylesheet the shared package ships beside the token sheet declares no literal color, so every color resolves through the tokens. This realizes litespec/frontend/ui#keep-tokens-in-one-definition.

### Hold the Declared Base Color

**Statement:** A token stylesheet MUST carry the values the manifest baseline `baseColor` ramp publishes, and no value outside them except under a recorded deviation.

**Rationale:** A token value outside the published `baseColor` ramp is a second palette beside the declared one, and the next author copies it. Holding the ramp keeps the whole product on one palette. A recorded deviation keeps a deliberate departure visible in the design contract instead of hidden in the stylesheet. This realizes litespec/frontend/ui#hold-the-declared-base-color.

### Refuse Token Violations with Stylelint

**Statement:** Every stylesheet MUST pass the project's approved Stylelint configuration, which refuses color, spacing, and type values outside the shared tokens.

**Rationale:** A value outside the tokens answers to no token and survives every restyle, so the gate refuses it where it is written. The token file and the lint configuration are approved once: which properties are token-backed and which values are allowlisted. This gates litespec/frontend/ui#hold-the-declared-base-color, litespec/frontend/ui#keep-tokens-in-one-definition, and litespec/frontend/ui#restrict-styling-to-semantic-tokens.

### Check Every Route in a Browser

**Statement:** Every route MUST pass each route suite check in a browser, with axe reporting zero WCAG 2.2 AA violations.

**Rationale:** The Concepts section names the checks: floorplan, registry reference, axe WCAG 2.2 AA, heading, landmark, reflow, text spacing, keyboard use, target size, and status announcements. One suite visits every route the tree discovers, so a new route is checked without anyone writing a specification for it. A route outside the suite can ship any defect on the list with no error. This realizes litespec/frontend/ui#check-every-route.

### Prove Every Result a Route Calls

**Statement:** Every result a called use case returns MUST be proved by a passing test or a known-gap record with owner and end date.

**Rationale:** A refusal the reader can reach and no test provokes is a refusal nobody has seen render. The calls come from the route code, so the obligation follows the code: every result a called use case returns is proved by a passing test or named by a known-gap record with owner and end date. This realizes litespec/frontend/ui#prove-every-result-a-route-calls.

**Example:** A browser test calls the use case and asserts one refusal result.

```typescript
test('shows the changed total before payment', async ({ page }) => {
  // Steps call place-order and assert the expected-total-mismatch refusal.
});
```

### Restrict CSS Decisions

**Statement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, a raw palette value, or an important modifier.

**Rationale:** Semantic tokens keep every class inside the governed palette, spacing, and type scales. An arbitrary value, a raw palette value, or an important modifier steps outside them: the value answers to no token and survives every restyle. The approved CSS surface is the shared package's stylesheet, holding the Tailwind import, the tokens, the fonts, and the documented resets. The source scan skips build output and reports authored feature CSS. This realizes litespec/frontend/ui#restrict-styling-to-semantic-tokens.

### Track Source Changes

**Statement:** The shared package's source lock MUST record the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive.

**Rationale:** The source lock records the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive. Normalizing source before hashing lets two workspaces compute the same digest for identical source. One lock beside one copy is what makes a changed primitive report a fork instead of passing unreported.

### Prove UI Behavior and Appearance

**Statement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence the governance matrix requires for its class.

**Rationale:** The governance matrix on [Controlled UI Governance](../ui.md) maps each change class to the narrowest evidence that covers it: no more than needed, no less. On the web stacks the fork record is the source lock entry, so a fork names the digest beside the component test. This realizes litespec/frontend/ui#prove-ui-behavior-and-appearance.

## Conventions

### Use the Source Update Procedure

**Default:** Update the primitive source on a branch that pins the CLI, starts clean, and reviews the regenerated files and the local composites separately.

**Replacement:** A consumer can replace this default by naming its source-update branch procedure in its documentation.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before anything is written. The regenerated files and the local composites change for different reasons, upstream source versus product adaptation, so one review cannot cover both. The branch pins the CLI and starts clean, so the run is repeatable and the diff shows only the update.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package | checkable | `litespec ui` compares the committed configuration against the manifest baseline fields and reports each mismatch. |
| litespec/frontend/web/ui#publish-one-registry-item-per-floorplan | checkable | `shadcn build` on React or `shadcn-svelte build` on Svelte exits zero, and `registry.json` lists one item per declared floorplan. |
| litespec/frontend/web/ui#compose-each-route-from-one-floorplan | checkable | `tests/routes/every-route.spec.ts` asserts `page.locator("[data-floorplan]")` has count 1 on every route. |
| litespec/frontend/web/ui#keep-layout-inside-floorplans | checkable | `pnpm eslint` refuses each layout utility in route code, naming the floorplan or composite to use. |
| litespec/frontend/web/ui#derive-each-page-type-from-a-named-reference | checkable | `tests/routes/every-route.spec.ts` asserts `data-registry-item` resolves to a published registry item on every non-freestyle route. |
| litespec/frontend/web/ui#select-a-tone-from-the-closed-set | checkable | `pnpm type-check` fails on a state with no tone, and the state-to-tone table holds glossary terms only. |
| litespec/frontend/web/ui#keep-tokens-in-one-stylesheet | checkable | `litespec ui` reports each application stylesheet declaring a rule and each shared stylesheet declaring a literal color. |
| litespec/frontend/web/ui#hold-the-declared-base-color | checkable | `pnpm stylelint` reports each token value outside the declared base color ramp. |
| litespec/frontend/web/ui#refuse-token-violations-with-stylelint | checkable | `pnpm stylelint` reports no color, spacing, or type value outside the shared tokens in application or shared stylesheets. |
| litespec/frontend/web/ui#check-every-route-in-a-browser | checkable | `tests/routes/every-route.spec.ts` runs axe and the Concepts checks on each discovered route, and `litespec ui` reports each route missing its suite. |
| litespec/frontend/web/ui#prove-every-result-a-route-calls | guidance | Each result a route calls is proved by a passing test or named by a known-gap record with owner and end date. |
| litespec/frontend/web/ui#restrict-css-decisions | checkable | `litespec ui` reports each arbitrary value, raw palette value, important modifier, and inline style with its file. |
| litespec/frontend/web/ui#track-source-changes | checkable | `litespec ui` recomputes each digest and reports changed primitive source. |
| litespec/frontend/web/ui#prove-ui-behavior-and-appearance | checkable | `tests/routes/every-route.spec.ts` runs on the changed route, and review confirms the change names the governance matrix evidence for its class. |
| litespec/frontend/web/ui#use-the-source-update-procedure | guidance | Each update branch pins the CLI, records the dry-run output, and reviews regenerated files and local composites separately. |
