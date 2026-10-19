# Controlled UI Governance

## Intent

The shared UI package is a constrained construction language. It provides the primitive source, the interaction behaviour, the layout, and the tokens. A route names one floorplan and fills its slots from the domain. A browser suite proves every route.

The route code is the page contract. No page document restates it, because a second description of a page drifts from the code that renders it.

## Agent Summary {#agent-summary}

- One shared package is the workspace's visual authority. (standards/rule/frontend-ui.select-one-visual-authority)
- The pinned baseline is installed once, with the package. (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)
- Floorplans are a closed set, each with a rule for choosing it. (standards/rule/frontend-ui.declare-a-closed-floorplan-set)
- A route renders one floorplan, or records why it composes none. (standards/rule/frontend-ui.compose-each-route-from-one-floorplan, standards/rule/frontend-ui.record-a-freestyle-route)
- A state colour is chosen by meaning from the closed tone set. (standards/rule/frontend-ui.select-a-tone-from-the-closed-set)
- A command's surface follows how many inputs it takes. (standards/rule/frontend-ui.select-a-command-surface-by-size)
- Every route passes the route suite in a browser. (standards/rule/frontend-ui.check-every-route-in-a-browser)
- Every result a route calls is proved by a test or named by a known gap. (standards/rule/frontend-ui.prove-every-result-a-route-calls)
- Every error the user sees shows its trace identifier in its detail. (standards/rule/frontend-ui.show-the-trace-id-in-error-detail)

## Concepts

### The floorplan set

A floorplan is a page component that fixes one page layout and exposes named slots. The shared package holds the closed set, and a route composes exactly one of them. A closed set lets an author choose a known shape by rule rather than invent a layout. Each floorplan implements the chosen option of one page-frame pattern from the pattern catalog ([UI pattern decisions](patterns.md)).

The reference set holds one floorplan per reader task. A workspace declares the ones its routes need, and each carries the rule for choosing it.

| Floorplan | Choose it when the reader | Slots it carries |
|:---|:---|:---|
| `WorkPage` | Processes items one after another | The queue, the current item, and its actions |
| `ListPage` | Finds one record among many | Filters, the result count, and the rows |
| `EntityPage` | Acts on one record | Facts, state, the actions that state permits, and related records |
| `FormPage` | Supplies the input of one command | The fields, one primary action, and the refusals |
| `OutcomePage` | Receives one answer after an action | The answer and the next step |

The domain fills the slots, so a floorplan never invents a state, an action, or a refusal.

| Slot | Domain source |
|:---|:---|
| Status | The business record states the specification names |
| Actions | The use cases the current state permits |
| Refusals | The refusal results of the use case the route calls |

A floorplan writes `data-floorplan` on its frame with its own name. A reviewer and the route suite read that attribute to learn which floorplan a route composed.

### The tone set

A tone names what a state means. The set is closed: a page picks one of them rather than a colour.

| Tone | The state it means |
|:---|:---|
| `neutral` | Nothing is wrong and nothing is being asked for |
| `positive` | The thing asked for happened |
| `caution` | A person has to decide |
| `destructive` | The thing asked for was refused |
| `info` | The page is explaining rather than reporting |

The mapping from a state code to a tone lives in one table in each application. A reader then sees the same colour for the same state on every screen.

### The command surface

A command's surface follows the size of its input. A larger surface than the command needs costs the reader attention it has no use for.

| The command takes | Use |
|:---|:---|
| Nothing, and can be taken back | A button |
| Nothing, and cannot be taken back | A confirmation dialog |
| One to four inputs | A form dialog |
| More than four inputs | A form page |

### The route suite

The route suite is one browser specification per frontend that visits every route. It asserts the checks below, and a visual snapshot supplements an assertion without replacing one. A snapshot varies across platforms, fonts, and hardware, so an assertion is the gate.

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

The suite discovers its routes from the generated route tree rather than from a list. A new route is therefore checked without a specification written for it. A dynamic segment resolves to a record the deployment holds, and falls back to an absent record when it holds none.

### Result proof

A route calls use cases, and each use case declares its results. Proof is computed: a test proves a case when its steps call the use case and assert the result. Every result a route calls is proved by a passing test or named by a known-gap record with an owner and an end date. The calls come from the route code, so the obligation follows the code rather than a declaration.

## React

- The pinned baseline is the manifest `uiBaseline` entry.
- The registry build runs `shadcn build`.
- The state-to-tone table lives in `src/app/states.tsx`.

## Svelte

- The pinned baseline is the manifest `uiBaselineSvelte` entry.
- The registry build runs `shadcn-svelte build`.
- The state-to-tone table lives in `src/lib/app/states.ts`.

## Standards

### Select one visual authority (standards/rule/frontend-ui.select-one-visual-authority)

**Requirement:** A workspace MUST record one shared UI package in `standards.project.json`, and each controlled frontend names its density profile against it.

**Rationale:** A second general-purpose visual system in one workspace makes every component choice ambiguous. A frontend outside the contract declares another platform and says what replaces the contract.

The density is chosen per frontend rather than per workspace, because density is a property of the audience. `public-light` suits a surface a visitor meets once. `application-balanced` suits a surface a signed-in user works in. `admin-dense` suits a surface an operator reads all day.

### Pin the baseline in the shared package (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)

**Requirement:** A workspace MUST install the pinned baseline from `standards.manifest.json` once, into its shared UI package.

**Rationale:** The committed files are the CLI's configuration, the registry source, the token stylesheet, and the source lock beside them. Installing per application is what made a fourth copy, where a fourth drift was invisible. An additional registry is permitted under an exception recorded against this provision. The stack sections name the manifest entry.

### Publish a design contract (standards/rule/frontend-ui.publish-a-design-contract)

**Requirement:** A workspace MUST publish one design contract with its shared UI package, carrying the required sections: Brand, Tokens, Vocabulary, Patterns, Do, Do not, Motion, Voice.

**Rationale:** An author that has read no contract picks its own tokens, its own motion, and its own voice. The picks differ on the next page, and the difference is what a reader sees as clutter. One contract keeps the answers in one file.

**Example:** The metadata block names the package and the floorplans it provides.

```json
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "package": "@acme/ui",
  "profile": "application-balanced",
  "shell": "app-shell",
  "patterns": ["work-page", "list-page", "entity-page"]
}
```

### Declare a closed floorplan set (standards/rule/frontend-ui.declare-a-closed-floorplan-set)

**Requirement:** The `Patterns` section of the design contract MUST list every floorplan the package provides, each with a when-to-use rule.

**Rationale:** A floorplan with no rule for choosing it is chosen by resemblance, and two authors then pick different floorplans for one kind of page. A floorplan outside the list is a design decision rather than a route-level choice.

**Example:** The section states each floorplan and the question that selects it.

```markdown
## Patterns

| Floorplan | Component | Use it when the reader |
|:---|:---|:---|
| `list-page` | `ListPage` | Finds one record among many. The page shows the result count. |
| `entity-page` | `EntityPage` | Acts on one record: its facts, its state, and the actions that state permits. |
| `form-page` | `FormPage` | Supplies the input of one command, with one primary action. |
```

### Publish one registry item per floorplan (standards/rule/frontend-ui.publish-one-registry-item-per-floorplan)

**Requirement:** The shared package MUST publish a registry whose build exits zero and which lists one item per floorplan the design contract declares.

**Rationale:** Without an installable page, an author invents one from primitives. One item per floorplan gives every page type a reference the author installs before writing. The stack sections name the registry build.

### Compose each route from one floorplan (standards/rule/frontend-ui.compose-each-route-from-one-floorplan)

**Requirement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes. The slots take domain values: the business record state, the use cases that state permits, and the refusal results of the called use case.

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

### Keep layout inside floorplans (standards/rule/frontend-ui.keep-layout-inside-floorplans)

**Requirement:** Route code MUST NOT carry a layout utility such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout utility in a route file is a second layout beside the floorplan, and the next route copies it. Floorplan and display composites own layout, so one change reaches every route composing them.

### Record a freestyle route (standards/rule/frontend-ui.record-a-freestyle-route)

**Requirement:** A route that composes no declared floorplan MUST name the decision record that justifies its layout.

**Rationale:** A freestyle route is the first consumer of a new floorplan or a genuine one-off. A named decision makes either case reviewable, and it keeps the declared set closed. A second route of the same shape is the signal to add a floorplan.

### Derive each page type from a named reference (standards/rule/frontend-ui.derive-each-page-type-from-a-named-reference)

**Requirement:** Every route MUST carry a `data-registry-item` attribute naming its page type's registry item, with a freestyle route carrying no attribute and naming its decision record.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another. An attribute that resolves keeps every page of one type on one reference.

### Select a tone from the closed set (standards/rule/frontend-ui.select-a-tone-from-the-closed-set)

**Requirement:** A state indicator MUST take one tone from the closed set, each application declaring its state-to-tone mapping once as an exhaustive table of language terms.

**Rationale:** A page that picks a colour picks a meaning nobody agreed to. One mapping means the same state reads the same way on every screen. A new state then fails to compile until its tone and its word exist.

### Keep tokens in one stylesheet (standards/rule/frontend-ui.keep-tokens-in-one-stylesheet)

**Requirement:** An application stylesheet MUST import the shared package's token stylesheet and declare no rule, with no literal colour in any stylesheet the shared package ships.

**Rationale:** One token sheet is what makes two applications look like one product. An application stylesheet imports it and declares no rule, so a second sheet never introduces a value the first has no opinion about. A stylesheet the shared package ships beside the token sheet declares no literal colour.

### Hold the declared base colour (standards/rule/frontend-ui.hold-the-declared-base-colour)

**Requirement:** A token stylesheet MUST carry the values the manifest baseline `baseColor` ramp publishes, and no value outside them except under a recorded exception.

**Rationale:** A token value outside the published ramp is a second palette beside the declared one, and the next author copies it. A recorded exception keeps the deliberate departure visible in the design contract. The stack sections name the manifest entry.

### Keep separators at the subtle step (standards/rule/frontend-ui.keep-separators-at-the-subtle-step)

**Requirement:** A structural separator or input border MUST NOT be darker than the border step the declared base colour publishes.

**Rationale:** A heavier rule beside a lighter one reads as emphasis, so authors stop trusting the token. The border step keeps every separator at one weight.

### Select a command surface by size (standards/rule/frontend-ui.select-a-command-surface-by-size)

**Requirement:** A command MUST use the surface the Concepts table assigns to its input.

**Rationale:** A form dialog with more inputs than the table allows scrolls, loses its title, and hides the refusal beside the field that caused it. A confirmation dialog for an action taking nothing reads as a warning rather than as a question.

### Show the trace ID in error detail (standards/rule/frontend-ui.show-the-trace-id-in-error-detail)

**Requirement:** Every error the user sees MUST show its trace identifier in copyable form in the error detail, from the problem body or the `X-Trace-Id` header.

**Rationale:** Support reads the identifier to find the failure, and the reader copies it without retyping. A headline carries what happened; the identifier belongs in the detail.

### Check every route in a browser (standards/rule/frontend-ui.check-every-route-in-a-browser)

**Requirement:** Every route MUST pass each route suite check in a browser.

**Rationale:** The Concepts section names the checks. They cover the floorplan, the registry reference, axe WCAG 2.2 AA, the heading, the landmark, reflow, text spacing, keyboard use, target size, and status announcements. One suite visits every route, so a new route is checked without a specification written for it.

### Prove every result a route calls (standards/rule/frontend-ui.prove-every-result-a-route-calls)

**Requirement:** Every result a called use case returns MUST be proved by a passing test or a known-gap record with owner and end date.

**Rationale:** A refusal a reader can reach and no test provokes is a refusal nobody has seen render. The calls come from the route code, so the obligation follows the code rather than a declaration.

**Example:** A browser test calls the use case and asserts one refusal result.

```typescript
test('shows the changed total before payment', async ({ page }) => {
  // Steps call place-order and assert the expected-total-mismatch refusal.
});
```

### Restrict CSS decisions (standards/rule/frontend-ui.restrict-css-decisions)

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, a raw palette value, or an important modifier.

**Rationale:** The approved CSS surface is the shared package's stylesheet, holding the Tailwind import, the tokens, the fonts, and the documented resets. The source scan skips build output and reports authored feature CSS.

### Track source changes (standards/rule/frontend-ui.track-source-changes)

**Requirement:** The shared package's source lock MUST record the pinned CLI, the registry address, the paths, the normalized digest, and the dependencies for each primitive.

**Rationale:** The lock normalizes source before hashing, so two workspaces compute the same digest for identical source. One lock beside one copy is what makes a changed primitive report a fork rather than pass unreported.

### Govern behavior packages (standards/rule/frontend-ui.govern-behavior-packages)

**Requirement:** A behavior package MUST name the decision record approving it for the capability it supplies, and render through baseline components and tokens.

**Rationale:** Approval follows the capability rather than the visual catalog, so a package is not adopted for components the baseline already provides.

### Prove UI behavior and appearance (standards/rule/frontend-ui.prove-ui-behavior-and-appearance)

**Requirement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive source or variant | The component test for that primitive |
| Floorplan or display composite | The route suite on one route that composes it |
| Token or global CSS | The route suite on one route in each profile |
| Route | The route suite on that route, and every test proving a result it calls |
| Pattern decision | The catalog entry changes with its implementation |
| Fork | The source lock digest and the component test |
| Behavior package | The accessibility check for the capability it supplies |

### Record a frontend outside the controlled contract (standards/rule/frontend-ui.record-a-frontend-outside-the-controlled-contract)

**Requirement:** A frontend whose platform is neither `react-web` nor `svelte` MUST declare an entry point record naming that platform and the boundaries replacing this contract.

**Rationale:** A device client with no shared component and no router sits outside the floorplan set and the component rules. Declaring the platform keeps the decision visible instead of reporting as a frontend with nothing to check.

## Conventions

### Use the product profiles (standards/rule/frontend-ui.use-the-product-profiles)

**Default:** Select one density profile from `public-light`, `application-balanced`, or `admin-dense` for each controlled frontend.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** All profiles share one baseline.

### Use the source update procedure (standards/rule/frontend-ui.use-the-source-update-procedure)

**Default:** Update the primitive source on a branch that pins the CLI, starts clean, and reviews the regenerated files and the local composites separately.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written. The regenerated files and the local composites change for different reasons, so one review cannot cover both.

### Keep a blocked command visible with its reason (standards/rule/frontend-ui.keep-a-blocked-command-visible-with-its-reason)

**Default:** Leave a command blocked only by the current state or role visible and disabled, with the reason beside it.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A merchant looking for an action needs to know it exists and why it is unavailable. A control that vanishes looks like a product that does not offer it.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/frontend-ui.select-one-visual-authority | checkable | `node standards/tools/validate-consumer.mjs` refuses a frontend with no declared platform and a workspace with a controlled frontend but no shared package. |
| standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package | checkable | `node standards/tools/validate-ui.mjs` compares the committed configuration against the manifest baseline fields. |
| standards/rule/frontend-ui.publish-a-design-contract | checkable | `node standards/tools/validate-ui.mjs` reports a missing contract, a schema failure, or a missing section. |
| standards/rule/frontend-ui.declare-a-closed-floorplan-set | guidance | Does the Patterns section list every floorplan with a when-to-use rule? |
| standards/rule/frontend-ui.publish-one-registry-item-per-floorplan | checkable | `shadcn build` (React) or `shadcn-svelte build` (Svelte) exits zero, and review confirms `registry.json` lists one item per declared floorplan. |
| standards/rule/frontend-ui.compose-each-route-from-one-floorplan | checkable | `tests/routes/every-route.spec.ts` asserts `page.locator("[data-floorplan]")` has count 1. |
| standards/rule/frontend-ui.keep-layout-inside-floorplans | guidance | Does any route file carry a layout utility outside its floorplan and display composites? |
| standards/rule/frontend-ui.record-a-freestyle-route | guidance | Does every freestyle route name the decision record that justifies its layout? |
| standards/rule/frontend-ui.derive-each-page-type-from-a-named-reference | checkable | `tests/routes/every-route.spec.ts` asserts `data-registry-item` resolves to a published registry item on every non-freestyle route. |
| standards/rule/frontend-ui.select-a-tone-from-the-closed-set | checkable | `pnpm type-check` fails on a state with no tone; review confirms each tone is a term. |
| standards/rule/frontend-ui.keep-tokens-in-one-stylesheet | checkable | `node standards/tools/validate-ui.mjs` reports an application stylesheet declaring a rule and a shared stylesheet declaring a literal colour. |
| standards/rule/frontend-ui.hold-the-declared-base-colour | guidance | Does the token stylesheet carry only values from the declared base colour ramp, with each departure recorded? |
| standards/rule/frontend-ui.keep-separators-at-the-subtle-step | guidance | Is every structural separator and input border at the published border step or lighter? |
| standards/rule/frontend-ui.select-a-command-surface-by-size | guidance | Does each command use the surface the Concepts table assigns to its input? |
| standards/rule/frontend-ui.show-the-trace-id-in-error-detail | guidance | Does every visible error show its trace identifier copyably in its detail rather than its headline? |
| standards/rule/frontend-ui.check-every-route-in-a-browser | checkable | `tests/routes/every-route.spec.ts` runs axe and the Concepts checks on each discovered route. |
| standards/rule/frontend-ui.prove-every-result-a-route-calls | guidance | Is every result the route calls proved by a passing test or named by a known-gap record? |
| standards/rule/frontend-ui.restrict-css-decisions | checkable | `node standards/tools/validate-ui.mjs` rejects an arbitrary value, a raw palette value, or an important modifier. |
| standards/rule/frontend-ui.track-source-changes | checkable | `node standards/tools/validate-ui.mjs` recomputes each digest and reports changed primitive source. |
| standards/rule/frontend-ui.govern-behavior-packages | guidance | Does every behavior package name its approving decision and render through baseline components and tokens? |
| standards/rule/frontend-ui.prove-ui-behavior-and-appearance | checkable | `tests/routes/every-route.spec.ts` runs on the changed route, and review confirms the change named the matrix evidence. |
| standards/rule/frontend-ui.record-a-frontend-outside-the-controlled-contract | guidance | Does every frontend outside the controlled platforms declare its platform and name its replacement boundaries? |
| standards/rule/frontend-ui.use-the-product-profiles | checkable | `node standards/tools/validate-ui.mjs` refuses a controlled frontend with no density profile. |
| standards/rule/frontend-ui.use-the-source-update-procedure | guidance | Does the update branch record the pinned CLI, the dry-run output, and separate review of both file sets? |
| standards/rule/frontend-ui.keep-a-blocked-command-visible-with-its-reason | guidance | Does each disabled command stay visible with its reason? |
