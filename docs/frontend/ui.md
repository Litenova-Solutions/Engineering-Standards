# Controlled UI Governance

## Intent


The shared UI package is a constrained construction language. It provides the primitive source, the interaction behaviour, the layout, and the tokens. A route names one floorplan and fills its slots from the domain. A browser suite proves every route.

The route code is the page contract. No page document restates it, because a second description of a page drifts from the code that renders it.

## Agent Summary {#agent-summary}


- One shared package is the workspace's visual authority. (standards/rule/frontend-ui.select-one-visual-authority)
- The pinned baseline is installed once, with the package. (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)
- Floorplans are a closed set, each with a rule for choosing it. (standards/rule/frontend-ui.declare-a-closed-floorplan-set)
- A route renders one floorplan, or records why it composes none. (standards/rule/frontend-ui.compose-each-route-from-one-floorplan, standards/rule/frontend-ui.record-a-freestyle-route)
- A state colour is chosen by meaning from five tones. (standards/rule/frontend-ui.select-a-tone-from-the-closed-set)
- A command's surface follows how many inputs it takes. (standards/rule/frontend-ui.select-a-command-surface-by-size)
- Every route passes the route suite in a browser. (standards/rule/frontend-ui.check-every-route-in-a-browser)
- Every path a route can reach has a test or a recorded exclusion. (standards/rule/frontend-ui.map-every-use-case-path)

## Concepts


### The floorplan set

A floorplan is a page component that fixes one page layout and exposes named slots. The shared package holds the closed set, and a route composes exactly one of them. A closed set lets an author choose a known shape by rule rather than invent a layout. Each floorplan implements the chosen option of one page-frame pattern from the pattern catalog ([UI pattern decisions](patterns.md)).

These five floorplans are the reference set. A workspace declares the ones its routes need, and each carries the rule for choosing it.

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
| Status | The aggregate states the specification names |
| Actions | The use cases the current state permits |
| Refusals | The failure paths of the use case the route calls |

A floorplan writes `data-floorplan` on its frame with its own name. A reviewer and the route suite read that attribute to learn which floorplan a route composed.

### The tone set

A tone names what a state means. Five are available, and a page picks one of them rather than a colour.

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
| Accessibility | axe reports zero WCAG 2.2 AA violations |
| Heading | The page carries exactly one visible `h1` |
| Landmark | The page carries one `main` landmark |
| Reflow | At 320 CSS pixels the page has no horizontal overflow; a data table may scroll inside its own region |
| Text spacing | The reflow check still passes under the WCAG 1.4.12 text-spacing override |
| Keyboard | Every interactive element is reachable and shows a visible focus indicator |

The suite discovers its routes from the route tree rather than from a list. A new route is therefore checked without a specification written for it. A dynamic segment resolves to a record the deployment holds, and falls back to an absent record when it holds none.

### Path coverage

A route calls use cases, and each use case declares its paths. A path is one outcome of one use case, including every refusal. Path coverage asks whether a test provokes each path a route can reach.

The calls are derived from the route code rather than from a declaration. A new call therefore brings its paths into scope in the same change. A path is covered when a test title opens with `[path/<id>]`, or when a recorded exclusion names the path with a reach and a reason.

| Reach | Meaning |
|:---|:---|
| `tamper` | Only a modified client or a crafted request reaches the path |
| `defect` | Only a defect in the system reaches the path |
| `excluded` | The route cannot reach the path, and the reason states why |

## Standards


### Select one visual authority (standards/rule/frontend-ui.select-one-visual-authority)

**Requirement:** A workspace MUST record one shared UI package in `standards.project.json`, and each controlled frontend names its density profile against it.

**Rationale:** A second general-purpose visual system in one workspace makes every component choice ambiguous. A frontend outside the contract declares another platform and says what replaces the contract.

The density is chosen per frontend rather than per workspace, because density is a property of the audience. `public-light` suits a surface a visitor meets once. `application-balanced` suits a surface a signed-in user works in. `admin-dense` suits a surface an operator reads all day.

### Pin the baseline in the shared package (standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package)

**Requirement:** A workspace MUST install the `uiBaseline` from `standards.manifest.json` once, into its shared UI package.

**Rationale:** The committed files are the CLI's configuration, the registry source, the token stylesheet, and the source lock beside them. Installing per application is what made a fourth copy, where a fourth drift was invisible. An additional registry is permitted under an override decision recorded against this provision.

### Publish a design contract (standards/rule/frontend-ui.publish-a-design-contract)

**Requirement:** A workspace MUST publish one design contract with its shared UI package, carrying the eight required sections.

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

**Rationale:** Without an installable page, an author invents one from primitives. One item per floorplan gives every page type a reference the author installs before writing.

### Compose each route from one floorplan (standards/rule/frontend-ui.compose-each-route-from-one-floorplan)

**Requirement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes. The slots take domain values: the aggregate state, the use cases that state permits, and the failure paths of the called use case.

**Example:** An order route composes the entity floorplan and fills each slot from the order.

```tsx
<EntityPage
  title={order.number}
  status={<OrderStatus state={order.state} />}
  actions={<OrderActions permitted={order.permittedActions} />}
  facts={<OrderFacts order={order} />}
  related={<OrderPayments orderId={order.id} />}
/>
```

### Keep layout inside floorplans (standards/rule/frontend-ui.keep-layout-inside-floorplans)

**Requirement:** A route file MUST NOT carry a layout utility such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout utility in a route file is a second layout beside the floorplan, and the next route copies it. Floorplan and display composites own layout, so one change reaches every route composing them.

### Record a freestyle route (standards/rule/frontend-ui.record-a-freestyle-route)

**Requirement:** A route that composes no declared floorplan MUST name the decision record that justifies its layout.

**Rationale:** A freestyle route is the first consumer of a new floorplan or a genuine one-off. A named decision makes either case reviewable, and it keeps the declared set closed. A second route of the same shape is the signal to add a floorplan.

### Derive each page type from a named reference (standards/rule/frontend-ui.derive-each-page-type-from-a-named-reference)

**Requirement:** Every route MUST carry a tag naming the published registry item its page type was built from.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another. A tag that resolves keeps every page of one type on one reference.

### Select a tone from the closed set (standards/rule/frontend-ui.select-a-tone-from-the-closed-set)

**Requirement:** A state indicator MUST take one tone from the closed set, and each application declares its state-to-tone mapping once.

**Rationale:** A page that picks a colour picks a meaning nobody agreed to. One mapping means the same state reads the same way on every screen. A new state then fails to compile until its tone and its word exist.

### Keep tokens in one stylesheet (standards/rule/frontend-ui.keep-tokens-in-one-stylesheet)

**Requirement:** A workspace MUST declare its colour, spacing, radius, font, and motion tokens in one shared token sheet, and no other stylesheet declares a literal colour.

**Rationale:** One token sheet is what makes two applications look like one product. An application stylesheet imports it and declares no rule, so a second sheet never introduces a value the first has no opinion about. A stylesheet the shared package ships beside the token sheet declares no literal colour.

### Hold the declared base colour (standards/rule/frontend-ui.hold-the-declared-base-colour)

**Requirement:** A token stylesheet MUST carry the values the declared base colour publishes and no value outside them except under a named local extension or override.

**Rationale:** A token value outside the published ramp is a second palette beside the declared one, and the next author copies it. A named extension or override keeps the deliberate departure visible in the design contract.

### Keep separators at the subtle step (standards/rule/frontend-ui.keep-separators-at-the-subtle-step)

**Requirement:** A structural separator or input border MUST NOT be darker than the border step the declared base colour publishes.

**Rationale:** A heavier rule beside a lighter one reads as emphasis, so authors stop trusting the token. The border step keeps every separator at one weight.

### Select a command surface by size (standards/rule/frontend-ui.select-a-command-surface-by-size)

**Requirement:** A command MUST use the surface the Concepts table assigns to its input.

**Rationale:** A dialog with five fields scrolls, loses its title, and hides the refusal beside the field that caused it. A confirmation dialog for an action taking nothing reads as a warning rather than as a question.

### Check every route in a browser (standards/rule/frontend-ui.check-every-route-in-a-browser)

**Requirement:** Every route MUST pass each route suite check in a browser.

**Rationale:** The Concepts section names the seven checks. They cover the floorplan, axe WCAG 2.2 AA, the heading, the landmark, reflow, text spacing, and keyboard use. One suite visits every route, so a new route is checked without a specification written for it.

### Map every use case path (standards/rule/frontend-ui.map-every-use-case-path)

**Requirement:** Every path of every use case a route calls MUST have a test titled `[path/<id>]` or a recorded exclusion with its reach and a reason.

**Rationale:** A refusal a reader can reach and no test provokes is a refusal nobody has seen render. The reach of an exclusion is `tamper`, `defect`, or `excluded`, as the Concepts section defines. The calls come from the route code, so the obligation follows the code rather than a declaration.

**Example:** A browser test provokes one refusal path and names it at the start of its title.

```typescript
test('[path/orders.place-order.expected-total-mismatch] shows the changed total before payment', async ({ page }) => {
  // Browser behavior.
});
```

### Restrict CSS decisions (standards/rule/frontend-ui.restrict-css-decisions)

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, a raw palette value, or an important modifier.

**Rationale:** The approved CSS surface is the shared package's stylesheet, holding the Tailwind import, the tokens, the fonts, and the documented resets. The source scan skips build output and reports authored feature CSS.

### Track source changes (standards/rule/frontend-ui.track-source-changes)

**Requirement:** The shared package's source lock MUST record the pinned CLI, the registry address, the installed paths, the normalized digest, and the dependencies for each primitive.

**Rationale:** The lock normalizes source before hashing, so two workspaces compute the same digest for identical source. One lock beside one copy is what makes a changed primitive report a fork rather than pass unreported.

### Govern behavior companions and specialist controls (standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls)

**Requirement:** A behavior package MUST be approved for the capability it supplies and renders through baseline components and tokens.

**Rationale:** Approval follows the capability rather than the visual catalog, so a package is not adopted for components the baseline already provides.

### Prove UI behavior and appearance (standards/rule/frontend-ui.prove-ui-behavior-and-appearance)

**Requirement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive source or variant | The component test for that primitive |
| Floorplan or display composite | The route suite on one route that composes it |
| Token or global CSS | The route suite on one route in each profile |
| Route | The route suite on that route, and every test citing a path it calls |
| Pattern decision | The catalog entry changes with its implementation |
| Fork | The source lock digest and the component test |
| Specialist control | The accessibility check for the capability it supplies |

### Record a frontend outside the controlled contract (standards/rule/frontend-ui.record-a-frontend-outside-the-controlled-contract)

**Requirement:** A frontend whose platform is not `react-web` MUST declare that platform, and its local documentation names the boundaries that replace the ones this page sets.

**Rationale:** A device client with no shared component and no router sits outside the floorplan set and the component rules. Declaring the platform keeps the decision visible instead of reporting as a frontend with nothing to check.

## Conventions


### Use the product profiles (standards/rule/frontend-ui.use-the-product-profiles)

**Default:** Select one density profile from `public-light`, `application-balanced`, or `admin-dense` for each controlled frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** All profiles share one baseline. They limit composition and evidence rather than colours or component bases.

### Use the source update procedure (standards/rule/frontend-ui.use-the-source-update-procedure)

**Default:** Update the primitive source on a branch that pins the CLI, starts clean, and reviews the regenerated files and the local composites separately.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written.

### Keep a blocked command visible with its reason (standards/rule/frontend-ui.keep-a-blocked-command-visible-with-its-reason)

**Default:** Leave a command blocked only by the current state or role visible and disabled, with the reason beside it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A merchant looking for an action needs to know it exists and why it is unavailable. A control that vanishes looks like a product that does not offer it.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-ui.select-one-visual-authority | inspection | `standards.project.json` names one shared package and one profile per controlled frontend. |
| standards/rule/frontend-ui.pin-the-baseline-in-the-shared-package | static | `node standards/tools/validate-ui.mjs` compares the committed configuration against the manifest `uiBaseline` fields. |
| standards/rule/frontend-ui.publish-a-design-contract | static | `node standards/tools/validate-ui.mjs` reports a missing contract, a schema failure, or a missing section. |
| standards/rule/frontend-ui.declare-a-closed-floorplan-set | static | Review confirms each floorplan in `DESIGN.md` carries a when-to-use rule in `## Patterns`. |
| standards/rule/frontend-ui.publish-one-registry-item-per-floorplan | static | `shadcn build` exits zero and `registry.json` lists one item per floorplan the design contract declares. |
| standards/rule/frontend-ui.compose-each-route-from-one-floorplan | test | `tests/routes/every-route.spec.ts` asserts `page.locator("[data-floorplan]")` has count 1. |
| standards/rule/frontend-ui.keep-layout-inside-floorplans | static | `packages/*/eslint.config.js` refuses a layout utility in a route file. |
| standards/rule/frontend-ui.record-a-freestyle-route | inspection | Route review confirms each freestyle route names a decision record. |
| standards/rule/frontend-ui.derive-each-page-type-from-a-named-reference | static | A project check reads each route tag and resolves it against the registry the shared package publishes, such as `entro check pages`. |
| standards/rule/frontend-ui.select-a-tone-from-the-closed-set | static | `pnpm type-check` fails on a state kind with no tone in `src/app/states.tsx`. |
| standards/rule/frontend-ui.keep-tokens-in-one-stylesheet | static | `node standards/tools/validate-ui.mjs` reports an application stylesheet declaring a rule and a shared stylesheet declaring a literal colour. |
| standards/rule/frontend-ui.hold-the-declared-base-colour | static | A project check compares the token stylesheet `:root` and dark blocks to the published base colour, such as `entro check tokens`. |
| standards/rule/frontend-ui.keep-separators-at-the-subtle-step | static | A project check compares the token stylesheet `:root` and dark blocks to the published base colour, such as `entro check tokens`. |
| standards/rule/frontend-ui.select-a-command-surface-by-size | inspection | Review confirms each command's surface matches the table in the Concepts section. |
| standards/rule/frontend-ui.check-every-route-in-a-browser | test | `tests/routes/every-route.spec.ts` runs axe and the seven checks on each discovered route. |
| standards/rule/frontend-ui.map-every-use-case-path | static | The consumer path check reports a path with no `[path/<id>]` title and no exclusion. |
| standards/rule/frontend-ui.restrict-css-decisions | static | `node standards/tools/validate-ui.mjs` rejects an arbitrary value, a raw palette value, or an important modifier. |
| standards/rule/frontend-ui.track-source-changes | static | `node standards/tools/validate-ui.mjs` recomputes each digest and reports changed primitive source. |
| standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls | inspection | Review confirms each specialist control renders through the baseline component and token set. |
| standards/rule/frontend-ui.prove-ui-behavior-and-appearance | test | `tests/routes/every-route.spec.ts` runs on the changed route, and review confirms the evidence. |
| standards/rule/frontend-ui.record-a-frontend-outside-the-controlled-contract | inspection | `standards.project.json` gives each uncontrolled frontend a `platform` and its local page names the replacement boundaries. |
| standards/rule/frontend-ui.use-the-product-profiles | inspection | Each controlled frontend entry names one of the three density profiles. |
| standards/rule/frontend-ui.use-the-source-update-procedure | inspection | The update branch records the pinned CLI, the dry-run output, and separate review of the two file sets. |
| standards/rule/frontend-ui.keep-a-blocked-command-visible-with-its-reason | inspection | Review confirms each disabled command carries a reason rather than disappearing. |