# Frontend Components

## Intent

One shared UI package holds everything a page draws with. It holds the registry primitives the pinned CLI copies in, and the composites those primitives are assembled into.

Page code composes composites and nothing else. The boundary is enforced rather than described, so a page that improvises fails at lint with a message naming the component to use.

## Agent Summary {#agent-summary}

- One package holds the registry primitives and the composites. (standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package)
- Page code composes composites and takes no class name. (standards/rule/frontend-components.compose-composites-in-page-code, standards/rule/frontend-components.write-no-class-name-in-page-code)
- The lint refuses a raw element and names the composite instead. (standards/rule/frontend-components.use-no-raw-element-in-page-code)
- A drawing no composite makes goes in a visual file. (standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file)
- A missing composite is added to the package. (standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package)
- Interactive UI supports keyboard, focus, labels, and announcements. (standards/rule/frontend-components.meet-accessibility-requirements)
- Data components and controls render every applicable state. (standards/rule/frontend-components.render-complete-states)

## React

- A class or style binding spells `className` or `style`.
- A visual file ends with `*.visual.tsx`.
- The raw HTML sink is `dangerouslySetInnerHTML`.
- The route error surface is the route error component.
- Component authoring follows `../react/components.md`.

## Svelte

- A class or style binding spells `class`, `class:`, `style`, or `style:`.
- A visual file ends with `*.visual.svelte`.
- The raw HTML sink is `{@html}`.
- The route error surface is the route error page.
- Component authoring follows `../svelte/components.md`.

## Standards

### Keep primitives and composites in one shared package (standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package)

**Requirement:** A workspace MUST hold its registry primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update, and the divergence is invisible because both copies compile.

**Example:** The primitives sit in one folder the registry CLI writes and no hand edits. The composites sit beside them and import them.

### Compose composites in page code (standards/rule/frontend-components.compose-composites-in-page-code)

**Requirement:** A component under a route or module folder MUST import only the shared package's documented entry points.

**Rationale:** A composite with a closed prop set draws one layout for every caller. A page cannot change spacing for itself and produce the second spacing the next page copies.

### Write no class name in page code (standards/rule/frontend-components.write-no-class-name-in-page-code)

**Requirement:** A component under a route or module folder MUST NOT declare a class or style binding.

**Rationale:** Layout belongs to the floorplan and to the display composites. A class in route code is a second layout beside the floorplan, and the next route copies it.

The stack sections name the binding for each stack.

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
| `img` | the shared image component, which `standards/rule/frontend-components.use-a-composite-for-a-content-image` owns |

Text elements stay available, because a sentence is not a component decision. `p`, `h2`, `h3`, `em`, `strong`, `ul`, `ol`, and `li` carry prose. The floorplan owns the `h1`, so it is not in the list. Any other element follows the same rule: page code MUST NOT declare it, and the author adds a composite or a visual file instead.

### Prefer a composite over a primitive (standards/rule/frontend-components.prefer-a-composite-over-a-primitive)

**Requirement:** Page code MUST import a composite wherever the shared package provides one, and the lint refuses the primitive that composite replaces.

**Rationale:** The composite is where the decision was made once. The primitive is where it has to be made again, per page.

**Example:** `Card` is `Section`, `Table` is `DataTable`, `Badge` is `StatusBadge`, and `Input` and `Field` are the form fields.

### Place a drawing no composite makes in a visual file (standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file)

**Requirement:** A visual file MAY write class names, and uses semantic theme tokens only.

**Rationale:** A stock-location map, a packing-slip preview, and a public frame have no composite. Refusing them pushes the drawing into an arbitrary value that no token governs. The file name is the declaration that this is the exception. The stack sections name the file pattern.

### Add a missing composite to the shared package (standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package)

**Requirement:** A layout, a control, or a surface a second page needs MUST be added to the shared UI package, not written inside an application.

**Rationale:** A component written inside one page cannot be reviewed against its use elsewhere, and it is invisible to the floorplans that depend on it.

### Meet accessibility requirements (standards/rule/frontend-components.meet-accessibility-requirements)

**Requirement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** A clickable `div` loses them all at once, so a native element is the starting point.

These are the properties a component gets wrong on its own. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) adds criteria that a component cannot satisfy by itself, because each one is a property of a flow or a page:

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

The AA criteria bind every project. The AAA rows bind only a project that targets AAA. The route suite checks keyboard reach, visible focus, target size, and status announcements on every route.

### Render complete states (standards/rule/frontend-components.render-complete-states)

**Requirement:** A data component MUST render its loading, empty, error, forbidden, and ready states. A control MUST render its disabled and pending states, prevent duplicate submission, and keep an error recovery path usable.

**Rationale:** Data states describe what arrived; control states describe what the reader may do.

A route adds `not-found` under `standards/rule/frontend-rendering.represent-route-states`, because a missing target resolves at the route rather than inside a component. Each state name is a term in the project's language record.

### Keep props narrow (standards/rule/frontend-components.keep-props-narrow)

**Requirement:** A composite MUST receive the values and callbacks it needs, not a client, a store, or a business record.

**Rationale:** The shared package serves applications it does not know, so a prop carrying one application's data model couples the two.

### Use declared visual variants (standards/rule/frontend-components.use-declared-visual-variants)

**Requirement:** A repeated component variant MUST use theme tokens through the shared package's variant helper rather than repeated literal values.

**Rationale:** Repeated pixel values, colours, or long conditional class strings drift apart once more than one composite edits them.

### Protect rich content boundaries (standards/rule/frontend-components.protect-rich-content-boundaries)

**Requirement:** A component MUST NOT pass untrusted content to a raw HTML sink.

**Rationale:** Stored rich content requires a decision record naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases.

The stack sections name the sink.

### Use a composite for a content image (standards/rule/frontend-components.use-a-composite-for-a-content-image)

**Requirement:** An informative or decorative image MUST render through the shared image component, which owns its shape, its sizing, and its fallback.

**Rationale:** An informative image carries meaningful alternative text and a decorative image carries empty alternative text. A `src` and `alt` written in a page bypass both. The raw-element rule refuses `img` in page code under `standards/rule/frontend-components.use-no-raw-element-in-page-code`.

## Conventions

### Name components for their role (standards/rule/frontend-components.name-components-for-their-role)

**Default:** Name a component for the role it plays, such as `OrderShipmentsSection` or `RedeliverOrderDialog`.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A name such as `OrderComponent` or `GenericModal` describes its file type rather than its job.

### Give card and section titles heading semantics (standards/rule/frontend-components.give-card-and-section-titles-heading-semantics)

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the outline and the browser test that finds it.

### Keep domain values typed until display (standards/rule/frontend-components.keep-domain-values-typed-until-display)

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Dates, money, and status convert to display strings there with explicit locale and zone behaviour.

### Compose class names in the shared package (standards/rule/frontend-components.compose-class-names-in-the-shared-package)

**Default:** Compose class names through the one merge helper the shared package exports, and keep every merge or variant helper import inside it.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A second merging helper produces a different conflict resolution for the same class pair. Page code has no reason to hold one.

### Keep error handling scoped (standards/rule/frontend-components.keep-error-boundaries-scoped)

**Default:** Use the route error surface for route failure, and a component boundary only where recovery keeps the page usable. The stack sections name the surface for each stack.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A component boundary that cannot recover hides the failure while leaving the page broken.

## Reference example

This informative example demonstrates `standards/rule/frontend-components.compose-composites-in-page-code` and `standards/rule/frontend-components.use-no-raw-element-in-page-code`.

A shipment section renders its facts, its commands, and its states by composing display composites and shared form fields. It declares no element and no class name, so the layout it draws is the one every other entity page draws.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/frontend-components.keep-primitives-and-composites-in-one-shared-package | guidance | Does one shared package hold the registry source and the composites, with no copy in an application? |
| standards/rule/frontend-components.compose-composites-in-page-code | checkable | `node standards/tools/validate-ui.mjs` refuses a primitive library import reached from an application. |
| standards/rule/frontend-components.write-no-class-name-in-page-code | guidance | Does any component under a route or module folder declare a class or style binding? |
| standards/rule/frontend-components.use-no-raw-element-in-page-code | guidance | Does page code declare a refused element, and does each refusal name its composite? |
| standards/rule/frontend-components.prefer-a-composite-over-a-primitive | guidance | Does page code import a primitive where the shared package provides a composite? |
| standards/rule/frontend-components.place-a-drawing-no-composite-makes-in-a-visual-file | guidance | Does every visual file use semantic tokens only, and does any other file write class names? |
| standards/rule/frontend-components.add-a-missing-composite-to-the-shared-package | guidance | Is every layout, control, or surface a second page needs exported from the shared package? |
| standards/rule/frontend-components.meet-accessibility-requirements | checkable | `tests/routes/every-route.spec.ts` presses `Tab` and asserts every focused element shows an indicator. |
| standards/rule/frontend-components.render-complete-states | guidance | Does every data component render each named state and every control render its own, with each name a recorded term? |
| standards/rule/frontend-components.keep-props-narrow | guidance | Does any composite prop type name a client, a store, or a business record? |
| standards/rule/frontend-components.use-declared-visual-variants | guidance | Does every repeated variant use theme tokens through the variant helper? |
| standards/rule/frontend-components.protect-rich-content-boundaries | guidance | Does any component pass untrusted content to a raw HTML sink without its recorded decision? |
| standards/rule/frontend-components.use-a-composite-for-a-content-image | guidance | Does every content image render through the shared image component with its owned text? |
| standards/rule/frontend-components.name-components-for-their-role | guidance | Does every component name describe the role it plays? |
| standards/rule/frontend-components.give-card-and-section-titles-heading-semantics | checkable | `tests/routes/every-route.spec.ts` asserts each visible section title resolves as a heading. |
| standards/rule/frontend-components.keep-domain-values-typed-until-display | guidance | Does conversion to display strings happen only at the presentation boundary? |
| standards/rule/frontend-components.compose-class-names-in-the-shared-package | guidance | Does every class merge go through the shared package helper? |
| standards/rule/frontend-components.keep-error-boundaries-scoped | guidance | Does each error boundary have a recovery path that keeps its surroundings usable? |
