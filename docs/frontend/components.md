# Frontend Components

## Intent


One shared UI package holds everything a page draws with. It holds the registry primitives the pinned CLI copies in, and the composites those primitives are assembled into.

Page code composes composites and nothing else. The boundary is enforced rather than described, so a page that improvises fails at lint with a message naming the component to use.

## Agent Summary {#agent-summary}


- One package holds the registry primitives and the composites. (standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package)
- Page code composes composites and takes no class name. (standards/rule/frontend-components.compose-composites-in-page-code)
- The lint refuses a raw element and names the composite instead. (standards/rule/frontend-components.use-no-raw-element-in-page-code)
- A drawing no composite makes goes in a visual file. (standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file)
- A missing composite is added to the package. (standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package)
- Interactive UI supports keyboard, focus, labels, and announcements. (standards/rule/frontend-components.meet-accessibility-requirements)
- Data-aware components render every applicable state. (standards/rule/frontend-components.render-complete-states)

## Standards


### Keep primitives and composites in one shared package (standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package)

**Requirement:** A workspace MUST hold its registry primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update, and the divergence is invisible because both copies compile.

**Example:** The primitives sit in one folder the registry CLI writes and no hand edits. The composites sit beside them and import them.

### Compose composites in page code (standards/rule/frontend-components.compose-composites-in-page-code)

**Requirement:** A component under a route or module folder MUST import only the shared package's documented entry points.

**Rationale:** A composite with a closed prop set draws one layout for every caller. A page cannot change spacing for itself and produce the second spacing the next page copies.

### Write no class name in page code (standards/rule/frontend-components.write-no-class-name-in-page-code)

**Requirement:** A component under a route or module folder MUST NOT declare a `className` or a `style` attribute.

**Rationale:** Layout belongs to the floorplan and to the display composites. A class in a route file is a second layout beside the floorplan, and the next route copies it.

### Use no raw element in page code (standards/rule/frontend-components.use-no-raw-element-in-page-code)

**Requirement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

**Rationale:** A raw element carries no focus management, no state, and no accessibility wiring. The reader of the lint message is choosing between two answers, so the message gives one.

**Example:** The refused elements and their replacements are one closed list.

| Refused | Use instead |
|:---|:---|
| `div`, `span` | `Stack`, `Inline`, `Columns`, `Section`, or a floorplan slot |
| `button` | `Button` from the shared package |
| `a` | `TextLink` or `ButtonLink` |
| `input`, `select`, `textarea` | a field from the shared form library |
| `form` | the shared form component |
| `table` | `DataTable` |
| `img` | the shared image component |

Text elements stay available, because a sentence is not a component decision. `p`, `h2`, `h3`, `strong`, `ul`, and `li` carry prose.

### Prefer a composite over a primitive (standards/rule/frontend-components.prefer-a-composite-over-a-primitive)

**Requirement:** Page code MUST import a composite wherever the shared package provides one, and the lint refuses the primitive that composite replaces.

**Rationale:** The composite is where the decision was made once. The primitive is where it has to be made again, per page.

**Example:** `Card` is `Section`, `Table` is `DataTable`, `Badge` is `StatusBadge`, and `Input` and `Field` are the form fields.

### Place a drawing no composite makes in a visual file (standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file)

**Requirement:** A file named `*.visual.tsx` MAY write class names, and uses semantic theme tokens only.

**Rationale:** A stock-location map, a packing-slip preview, and a public frame have no composite. Refusing them pushes the drawing into an arbitrary value that no token governs. The file name is the declaration that this is the exception.

### Add a missing composite to the shared package (standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package)

**Requirement:** A layout, a control, or a surface a second page needs MUST be added to the shared UI package, not written inside an application.

**Rationale:** A component written inside one page cannot be reviewed against its use elsewhere, and it is invisible to the floorplans that depend on it.

### Meet accessibility requirements (standards/rule/frontend-components.meet-accessibility-requirements)

**Requirement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** A clickable `div` loses all five at once, so a native element is the starting point.

The five are the ones a component can get wrong on its own. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) adds nine criteria that a component cannot satisfy by itself, because each one is a property of a flow or a page:

| Criterion | Level | What the UI has to do |
|:---|:---|:---|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Keep a focused control at least partly visible under a sticky header, bar, or panel. |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Keep a focused control fully visible. |
| 2.4.13 Focus Appearance | AAA | Give the focus indicator the stated minimum area and contrast. |
| 2.5.7 Dragging Movements | AA | Offer a single-pointer alternative to every drag action. |
| 2.5.8 Target Size (Minimum) | AA | Give a pointer target at least 24 by 24 pixels, or the stated spacing. |
| 3.2.6 Consistent Help | A | Put a help mechanism in the same relative order on every page that has one. |
| 3.3.7 Redundant Entry | A | Do not ask again for information already given in the same process. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Offer a sign-in path with no cognitive function test. |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | Offer that path with no object recognition or personal content test either. |

The AA criteria bind a project targeting AA. The three AAA rows are listed so a project selecting them knows what it selected. The route suite checks keyboard reach and visible focus on every route. The tests of a route assert target size and status announcements, which is where the flow-level criteria are checked.

### Render complete states (standards/rule/frontend-components.render-complete-states)

**Requirement:** A data or permission-aware component MUST render its loading, empty, error, forbidden, disabled, pending, and ready states.

**Rationale:** A mutation control also prevents duplicate submission and keeps an error recovery path usable.

These seven are the states a component has. `disabled` and `pending` describe a control and have no route equivalent. A route adds `not-found` under `standards/rule/frontend-rendering.represent-route-states`, because a missing target resolves at the route rather than inside a component.

### Keep props narrow (standards/rule/frontend-components.keep-props-narrow)

**Requirement:** A composite MUST receive the values and callbacks it needs, not a client, a store, or an aggregate-shaped object.

**Rationale:** The shared package serves applications it does not know, so a prop carrying one application's data model couples the two.

### Use declared visual variants (standards/rule/frontend-components.use-declared-visual-variants)

**Requirement:** A repeated component variant MUST use theme tokens through the shared package's variant helper rather than repeated literal values.

**Rationale:** Repeated pixel values, colours, or long conditional class strings drift apart once more than one composite edits them.

### Protect rich content boundaries (standards/rule/frontend-components.protect-rich-content-boundaries)

**Requirement:** A component MUST NOT pass untrusted content to a raw HTML sink.

**Rationale:** Stored rich content requires a project decision naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases.

### Use a composite for a content image (standards/rule/frontend-components.use-a-composite-for-a-content-image)

**Requirement:** An informative or decorative image MUST render through the shared image component, which owns its shape, its sizing, and its fallback.

**Rationale:** An informative image carries meaningful alternative text and a decorative image carries empty alternative text. A `src` and `alt` written in a page bypass both.

## Conventions


### Name components for their role (standards/rule/frontend-components.name-components-for-their-role)

**Default:** Name a component for the role it plays, such as `OrderShipmentsSection` or `RedeliverOrderDialog`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `OrderComponent` or `GenericModal` describes its file type rather than its job.

### Give card and section titles heading semantics (standards/rule/frontend-components.give-card-and-section-titles-heading-semantics)

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the document outline and from the browser test that finds it.

### Keep domain values typed until display (standards/rule/frontend-components.keep-domain-values-typed-until-display)

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Dates, money, and status convert to display strings there with explicit locale and zone behaviour.

### Compose class names in the shared package (standards/rule/frontend-components.compose-class-names-in-the-shared-package)

**Default:** Compose class names through the one merge helper the shared package exports, and keep every merge or variant helper import inside it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second merging helper produces a different conflict resolution for the same class pair. Page code has no reason to hold one.

### Keep error boundaries scoped (standards/rule/frontend-components.keep-error-boundaries-scoped)

**Default:** Use the route's error component for route failure, and a component boundary only where recovery keeps the page usable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A component boundary that cannot recover hides the failure while leaving the page broken.

## Reference example

This informative example demonstrates `standards/rule/frontend-components.compose-composites-in-page-code` and `standards/rule/frontend-components.use-no-raw-element-in-page-code`.

A shipment section renders its facts, its commands, and its states by composing display composites and shared form fields. It declares no element and no class name, so the layout it draws is the one every other entity page draws.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package | inspection | Package review confirms one shared package holds the registry source and that no application holds a copy. |
| standards/rule/frontend-components.compose-composites-in-page-code | static | `node standards/tools/validate-ui.mjs` refuses a primitive library import reached from an application. |
| standards/rule/frontend-components.write-no-class-name-in-page-code | static | `packages/*/eslint.config.js` reports a `className` or `style` attribute in page code. |
| standards/rule/frontend-components.use-no-raw-element-in-page-code | static | `packages/*/eslint.config.js` reports each refused element with the composite replacing it. |
| standards/rule/frontend-components.prefer-a-composite-over-a-primitive | static | The same `eslint.config.js` refuses each replaced primitive by its module path. |
| standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file | inspection | File review confirms each visual file uses semantic tokens and no arbitrary value. |
| standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package | inspection | Package review confirms each composite is exported from a documented entry point. |
| standards/rule/frontend-components.meet-accessibility-requirements | test | `tests/routes/every-route.spec.ts` presses `Tab` and asserts every focused element shows an indicator. |
| standards/rule/frontend-components.render-complete-states | inspection | Component review confirms each data-aware composite names every state it renders. |
| standards/rule/frontend-components.keep-props-narrow | inspection | Prop review confirms no composite prop type names a client, a store, or a model. |
| standards/rule/frontend-components.use-declared-visual-variants | static | `node standards/tools/validate-ui.mjs` rejects a literal value where a theme token exists. |
| standards/rule/frontend-components.protect-rich-content-boundaries | static | `node standards/tools/validate-ui.mjs` reports each raw HTML sink for review against its decision. |
| standards/rule/frontend-components.use-a-composite-for-a-content-image | static | The same `eslint.config.js` refuses an `img` element in page code. |
| standards/rule/frontend-components.name-components-for-their-role | inspection | Naming review compares each new component name against its rendered role. |
| standards/rule/frontend-components.give-card-and-section-titles-heading-semantics | test | `tests/routes/every-route.spec.ts` asserts each visible section title resolves as a heading. |
| standards/rule/frontend-components.keep-domain-values-typed-until-display | inspection | Review confirms conversion to display strings happens at the presentation boundary. |
| standards/rule/frontend-components.compose-class-names-in-the-shared-package | static | The same `eslint.config.js` refuses a direct import of a class merge helper in page code. |
| standards/rule/frontend-components.keep-error-boundaries-scoped | inspection | Error boundary review confirms each boundary has a recovery path that keeps its surroundings usable. |