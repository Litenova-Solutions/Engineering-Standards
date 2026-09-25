# Controlled UI Governance

## Intent


This convention turns the selected UI library into a constrained construction language. The library provides component source and baseline interaction behavior. Each frontend provides a closed set of floorplans, and the route code composes one of them. The domain specification supplies the states, actions, and refusals that fill a floorplan. A browser suite proves every route.

The route code is the page contract. No page document restates it, because a second description of a page drifts from the code that renders it.

The baseline applies to React web frontends. It does not pretend that official shadcn/ui components are a native mobile system. A native frontend selects its own platform system through a separate decision.

## Agent Summary {#agent-summary}


- One recorded visual system per React web frontend. (standards/rule/frontend-ui.select-one-visual-authority, standards/rule/frontend-ui.use-the-pinned-shadcnui-baseline)
- Each frontend declares a schema-valid UI vocabulary and a root design contract. (standards/rule/frontend-ui.declare-the-ui-vocabulary, standards/rule/frontend-ui.publish-a-design-contract)
- The design contract lists a closed floorplan set, each floorplan with a when-to-use rule. (standards/rule/frontend-ui.declare-a-closed-floorplan-set)
- Each route composes exactly one floorplan, or names the decision behind its freestyle layout. (standards/rule/frontend-ui.compose-each-route-from-one-floorplan, standards/rule/frontend-ui.record-a-freestyle-route)
- Route files carry no layout classes, because floorplan components own layout. (standards/rule/frontend-ui.keep-layout-inside-floorplans)
- Every route passes the route suite in a browser. (standards/rule/frontend-ui.check-every-route-in-a-browser)
- Every path of every use case a route calls has a citing test or an exclusion. (standards/rule/frontend-ui.map-every-use-case-path)
- Tailwind use stays within semantic tokens, and source changes stay in the lock. (standards/rule/frontend-ui.restrict-css-decisions, standards/rule/frontend-ui.track-source-changes)
- Behavior packages are approved by capability and render through the baseline. (standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls)
- A route change runs the route suite and the tests citing its paths. (standards/rule/frontend-ui.prove-ui-behavior-and-appearance)

## Concepts


### The design contract

A design contract is the file an agent reads before it composes anything on a frontend. It sits at the frontend root, it is named `DESIGN.md`, and it opens with a metadata block the validator resolves.

Eight sections are required, and each one closes a drift the next page would otherwise repeat.

| Section | What it carries | The drift it closes |
|:---|:---|:---|
| Brand | The tone, in three words the product is and three it is not | Voice differs from page to page |
| Tokens | The semantic tokens in use, and what each one is for | An agent invents its own values |
| Vocabulary | The primitives this frontend composes from | A card appears where a badge belongs |
| Patterns | The floorplans this frontend provides, each with a when-to-use rule | A layout is invented for a solved shape |
| Do | Concrete rules, each one a sentence a reviewer can apply | A generic pattern replaces a product one |
| Do not | Concrete refusals, each one naming its failure | The cluttered first draft |
| Motion | The named presets, with duration and use | Motion invented per page |
| Voice | The words the product uses and the words it refuses | Copy that reads like a sales page |

### Floorplans

A floorplan is a page component that fixes one page layout and exposes named slots. Each React web frontend holds a closed set of floorplans, and a route composes exactly one of them. A closed set lets an agent choose a known shape by rule rather than invent a layout.

These five floorplans are the reference set. A frontend declares the ones its routes need, and each one carries the rule for choosing it.

| Floorplan | Choose it when the reader | Slots it carries |
|:---|:---|:---|
| Work page | Processes items one after another | The queue, the current item, and its actions |
| List page | Finds one record among many | Filters, the result count, and the rows |
| Entity page | Acts on one record | Facts, state, the actions that state permits, and related records |
| Form page | Supplies the input of one command | The fields, one primary action, and the refusals |
| Outcome page | Receives one answer after an action or a lookup | The answer and the next step |

The domain specification fills the slots, so a floorplan never invents a state, an action, or a refusal.

| Slot | Domain source |
|:---|:---|
| Status | The aggregate states the specification names |
| Actions | The use cases the current state permits |
| Refusals | The failure paths of the use case the route calls |

A freestyle route composes no declared floorplan. It names the decision that justifies its layout, and a second freestyle route of the same shape is a candidate floorplan.

### The route suite

The route suite is one browser test suite per frontend that visits every route. It asserts the checks below, and a visual snapshot supplements an assertion without replacing one. A snapshot varies across platforms, fonts, and hardware, so an assertion is the gate.

| Check | The route passes when |
|:---|:---|
| Accessibility | axe reports zero WCAG 2.2 AA violations |
| Heading | The page carries exactly one `h1` |
| Landmark | The page carries a `main` landmark |
| Reflow | At 320 CSS pixels the page has no horizontal overflow; a data table may scroll inside its own region |
| Text spacing | The reflow check still passes under the WCAG 1.4.12 text-spacing override |
| Keyboard | Every interactive element is reachable by keyboard and shows visible focus |

### Path coverage

A route calls use cases, and each use case declares its paths. A path is one outcome of one use case, including every refusal. Path coverage asks whether a test provokes each path a route can reach.

The consumer derives the calls from the route code rather than from a declaration. A new call therefore brings its paths into scope in the same change. A path is covered when a test title opens with `[path/<id>]`, or when a recorded exclusion names the path with a reach and a reason.

| Reach | Meaning |
|:---|:---|
| `tamper` | Only a modified client or a crafted request reaches the path |
| `defect` | Only a defect in the system reaches the path |
| `excluded` | The route cannot reach the path, and the reason states why |

## Standards


### Select one visual authority (standards/rule/frontend-ui.select-one-visual-authority)

**Requirement:** Each React web frontend MUST record one primary visual system, its profile, and its owned paths in `standards.project.json`.

**Rationale:** A second general-purpose visual system in one workspace makes every component choice ambiguous. An override carries a review date so it cannot become permanent by omission.

The profile is chosen per frontend rather than per workspace, because density is a property of the audience. `public-light` suits a surface a visitor meets once. `application-balanced` suits a surface a signed-in user works in. `admin-dense` suits a surface an operator reads all day. A workspace with four frontends normally carries more than one profile, and two frontends sharing an audience share a profile.

### Use the pinned shadcn/ui baseline (standards/rule/frontend-ui.use-the-pinned-shadcnui-baseline)

**Requirement:** A new React web frontend MUST install the `uiBaseline` from `standards.manifest.json` and commit its generated configuration and source.

**Rationale:** The committed files are `components.json` from the pinned CLI, the installed `components/ui/` source, the Tailwind entry, and the source lock.

### Declare the UI vocabulary (standards/rule/frontend-ui.declare-the-ui-vocabulary)

**Requirement:** Each React web frontend MUST declare a vocabulary validating against `schemas/ui-vocabulary.schema.json` and repeating its selected preset.

**Rationale:** A page can then be reviewed without reconstructing the CLI command that produced its components. `schemas/ui-vocabulary.schema.json` is the shape, and `node standards/tools/validate-ui.mjs` is what reads the file against it. The schema requires the full preset only for the default visual system. A frontend on an alternate system records its own baseline and carries the override decision `standards/rule/frontend-ui.select-one-visual-authority` requires. The vocabulary `patterns` entries name the floorplans this frontend provides.

### Publish a design contract (standards/rule/frontend-ui.publish-a-design-contract)

**Requirement:** Each React web frontend MUST publish a root `DESIGN.md` satisfying `schemas/design-contract.schema.json` and carrying the eight required sections.

**Rationale:** An agent that has read no contract picks its own tokens, its own motion, and its own voice. The picks differ on the next page, and the difference is what a reader sees as clutter. The Concepts section on this page lists the eight sections and the drift each one closes.

**Example:** The metadata block names the frontend, its profile, its shell, and the floorplans it provides.

```json
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "frontend": "control-panel",
  "profile": "admin-dense",
  "shell": "panel-shell",
  "patterns": ["work-page", "list-page", "entity-page"]
}
```

### Declare a closed floorplan set (standards/rule/frontend-ui.declare-a-closed-floorplan-set)

**Requirement:** The `Patterns` section of each React web frontend's `DESIGN.md` MUST list every floorplan the frontend provides, each with a when-to-use rule.

**Rationale:** A floorplan with no rule for choosing it is chosen by resemblance, and two agents then pick different floorplans for one kind of page. The metadata `patterns` list, the vocabulary `patterns`, and this section name the same floorplans. A floorplan outside the list is a design decision rather than a route-level choice.

**Example:** The section states each floorplan and the question that selects it.

```markdown
## Patterns

| Floorplan | Component | Use it when the reader |
|:---|:---|:---|
| `list-page` | `ListPage` | Finds one record among many. The page shows the result count. |
| `entity-page` | `EntityPage` | Acts on one record: its facts, its state, and the actions that state permits. |
| `form-page` | `FormPage` | Supplies the input of one command, with one primary action. |
```

### Compose each route from one floorplan (standards/rule/frontend-ui.compose-each-route-from-one-floorplan)

**Requirement:** A route in a React web frontend MUST render exactly one floorplan from its frontend's declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes instead of reconstructing a layout. The slots take domain values: the aggregate state, the use cases that state permits, and the failure paths of the called use case.

**Example:** An order route composes the entity floorplan and fills each slot from the order.

```tsx
export default async function OrderPage({ params }: OrderPageProps) {
  const order = await readOrder((await params).orderId);
  return (
    <EntityPage
      title={order.number}
      status={<OrderStatus state={order.state} />}
      actions={<OrderActions permitted={order.permittedActions} />}
      facts={<OrderFacts order={order} />}
      related={<OrderPayments orderId={order.id} />}
    />
  );
}
```

### Keep layout inside floorplans (standards/rule/frontend-ui.keep-layout-inside-floorplans)

**Requirement:** A route file MUST NOT carry a layout class such as `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*`.

**Rationale:** A layout class in a route file is a second layout beside the floorplan, and the next route copies it. Floorplan and section components own layout, so a layout change happens once and reaches every route that composes the component.

### Record a freestyle route (standards/rule/frontend-ui.record-a-freestyle-route)

**Requirement:** A route that composes no declared floorplan MUST name the decision record that justifies its layout.

**Rationale:** A freestyle route is the first consumer of a new floorplan or a genuine one-off. A named decision makes either case reviewable, and it keeps the declared set closed. A second freestyle route of the same shape is the signal to add a floorplan.

### Check every route in a browser (standards/rule/frontend-ui.check-every-route-in-a-browser)

**Requirement:** Every route of a React web frontend MUST pass each route suite check in a browser.

**Rationale:** The route suite in the Concepts section names the six checks. They cover axe WCAG 2.2 AA, headings, landmarks, reflow, text spacing, and keyboard use. One suite visits every route, so a new route is checked without a test written for it. WCAG 2.2 exempts a data table from reflow, so a table may scroll inside its own region.

### Map every use-case path (standards/rule/frontend-ui.map-every-use-case-path)

**Requirement:** Every path of every use case a route calls MUST have a test titled `[path/<id>]` or a recorded exclusion with its reach and reason.

**Rationale:** A refusal a buyer can reach and no test provokes is a refusal nobody has seen render. The reach of an exclusion is `tamper`, `defect`, or `excluded`, as the Concepts section defines. The consumer derives the route's calls from its code, so the obligation follows the code rather than a declaration. The consumer's own tooling enforces the rule, because only the consumer can read its route code and its exclusion record.

**Example:** A browser test provokes one refusal path and names it at the start of its title.

```typescript
test('[path/orders.place-order.expected-total-mismatch] shows the changed total before payment', async ({ page }) => {
  // Browser behavior.
});
```

### Restrict CSS decisions (standards/rule/frontend-ui.restrict-css-decisions)

**Requirement:** A Tailwind class MUST use a semantic token rather than an arbitrary value, raw palette value, or important modifier.

**Rationale:** The default CSS surface is one global entry holding the Tailwind import, tokens, fonts, and documented resets. The source scan skips generated build output and native runtime asset directories, and still rejects authored feature CSS.

### Track source changes (standards/rule/frontend-ui.track-source-changes)

**Requirement:** `ui-source-lock.json` MUST record the pinned CLI, preset fingerprint, registry address, installed paths, normalized digest, and dependencies for each component.

**Rationale:** The project formatter normalizes source before hashing, so two consumers compute the same digest for identical source.

### Govern behavior companions and specialist controls (standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls)

**Requirement:** A behavior package MUST be approved for the capability it supplies and render through baseline components and tokens.

**Rationale:** Approval follows the capability rather than the visual catalog, so a package is not adopted for components the baseline already provides.

### Prove UI behavior and appearance (standards/rule/frontend-ui.prove-ui-behavior-and-appearance)

**Requirement:** A primitive, floorplan, token, source, route, fork, or specialist surface change MUST name the evidence in the matrix in this section.

**Rationale:** The matrix maps each change class to the narrowest evidence that represents its risk.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive source or variant | The component test for that primitive |
| Floorplan or section component | The route suite on one route that composes it |
| Token or global CSS | The visual baseline of one page in each profile |
| Route | The route suite on that route, and every test citing a path it calls |
| Fork | The source lock digest and the component test |
| Specialist control | The accessibility check for the capability it supplies |

## Conventions


### Use the product profiles (standards/rule/frontend-ui.use-the-product-profiles)

**Default:** Select one product profile from `public-light`, `application-balanced`, or `admin-dense` for each frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** All profiles share the baseline. They limit composition and evidence rather than colors or component bases.

### Use the source update procedure (standards/rule/frontend-ui.use-the-source-update-procedure)

**Default:** Update baseline source on a branch that pins the CLI, starts clean, and reviews generated and local files separately.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Running `view`, `--dry-run`, and `--diff` first shows what the update changes before it is written.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-ui.select-one-visual-authority | inspection | `node standards/tools/validate-ui.mjs` reports a frontend with no recorded visual system or a second system in the workspace. |
| standards/rule/frontend-ui.use-the-pinned-shadcnui-baseline | inspection | `node standards/tools/validate-ui.mjs` compares the committed configuration against the manifest `uiBaseline` fields. |
| standards/rule/frontend-ui.declare-the-ui-vocabulary | inspection | `node standards/tools/validate-ui.mjs` validates the vocabulary against its schema and its recorded preset. |
| standards/rule/frontend-ui.publish-a-design-contract | static | `node standards/tools/validate-ui.mjs` reports a frontend whose `DESIGN.md` is missing, fails the schema, or omits a required section. |
| standards/rule/frontend-ui.declare-a-closed-floorplan-set | static, inspection | `node standards/tools/validate-ui.mjs` reports a design-contract floorplan the vocabulary does not bind; review confirms each carries a when-to-use rule. |
| standards/rule/frontend-ui.compose-each-route-from-one-floorplan | static | A consumer floorplan check reads each `page.tsx` and reports one rendering no declared floorplan, or several, with no freestyle record. |
| standards/rule/frontend-ui.keep-layout-inside-floorplans | static | A consumer lint rule or floorplan check reports a `grid`, `flex`, `gap-*`, `space-*`, or `col-span-*` class in a route file. |
| standards/rule/frontend-ui.record-a-freestyle-route | static | A consumer floorplan check reads each freestyle `page.tsx` and reports one that names no decision record, or a missing one. |
| standards/rule/frontend-ui.check-every-route-in-a-browser | test | The route suite runs `@axe-core/playwright` on every route, and fails on an axe, heading, landmark, reflow, text-spacing, or keyboard finding. |
| standards/rule/frontend-ui.map-every-use-case-path | static | A consumer path check derives each route's use-case calls and reports a path with no `[path/<id>]` title and no exclusion. |
| standards/rule/frontend-ui.restrict-css-decisions | inspection | `node standards/tools/validate-ui.mjs` rejects an arbitrary value, raw palette value, important modifier, or unapproved global import. |
| standards/rule/frontend-ui.track-source-changes | inspection | `node standards/tools/validate-ui.mjs` recomputes each digest and reports changed baseline source with no fork record. |
| standards/rule/frontend-ui.govern-behavior-companions-and-specialist-controls | inspection | `node standards/tools/validate-ui.mjs` reports a specialist control rendering outside the baseline component and token set. |
| standards/rule/frontend-ui.prove-ui-behavior-and-appearance | test | The route suite runs on the changed route, and `node standards/tools/validate-ui.mjs` reports a vocabulary state no evidence record covers. |
| standards/rule/frontend-ui.use-the-product-profiles | inspection | Each frontend entry in `standards.project.json` names one of the three product profiles. |
| standards/rule/frontend-ui.use-the-source-update-procedure | inspection | The update branch records the pinned CLI, the dry-run output, and separate review of generated and local files. |
