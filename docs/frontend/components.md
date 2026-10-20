# Frontend Components

## Intent

One shared UI package holds everything a page draws with. It holds the shared primitives and the composites those primitives are assembled into.

Page code composes composites and nothing else. The boundary is enforced rather than described, so a page that improvises fails at lint with a message naming the component to use.

## Standards

### Keep shared UI in one package

**Requirement:** A workspace MUST hold its shared primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update, and the divergence is invisible because both copies compile.

**Example:** The primitives sit in one folder beside the composites, and the composites import them.

### Compose composites in page code

**Requirement:** A component under a route or module folder MUST import only the shared package's documented entry points.

**Rationale:** A composite with a closed property set draws one layout for every caller. A page cannot change spacing for itself and produce the second spacing the next page copies.

### Write no class name in page code

**Requirement:** A component under a route or module folder MUST NOT declare a class or style binding.

**Rationale:** Layout belongs to the floorplan and to the display composites. A class in route code is a second layout beside the floorplan, and the next route copies it.

Each stack realization names the binding for its stack.

### Use composites for layout and interaction in page code

**Requirement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

**Rationale:** A raw element carries no focus management, no state, and no accessibility wiring. The reader of the lint message is choosing between two answers, so the message gives one.

### Prefer a composite over a primitive

**Requirement:** Page code MUST import a composite wherever the shared package provides one, and the lint refuses the primitive that composite replaces.

**Rationale:** The composite is where the decision was made once. The primitive is where it has to be made again, per page.

**Example:** `Card` is `Section`, `Table` is `DataTable`, `Badge` is `StatusBadge`, and `Input` and `Field` are the form fields.

### Place a drawing no composite makes in an exception file

**Requirement:** An exception file MAY declare custom styling, and uses semantic theme tokens only.

**Rationale:** A stock-location map, a packing-slip preview, and a public frame have no composite. Refusing them pushes the drawing into an arbitrary value that no token governs. The file name is the declaration that this is the exception. Each stack realization names the file pattern.

### Add a missing composite to the shared package

**Requirement:** A layout, a control, or a surface a second page needs MUST be added to the shared UI package, not written inside an application.

**Rationale:** A component written inside one page cannot be reviewed against its use elsewhere, and it is invisible to the floorplans that depend on it.

### Support keyboard, focus, labels, and announcements

**Requirement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** A custom control loses them all at once, so a platform control is the starting point.

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

The AA criteria bind every project. The AAA rows bind only a project that targets AAA.

### Render complete states

**Requirement:** A data component MUST render loading, empty, error, forbidden, and ready; a control renders disabled and pending, prevents duplicate submission, and keeps recovery usable.

**Rationale:** Data states describe what arrived; control states describe what the reader may do.

A route adds `not-found` under `litespec/frontend/rendering#represent-route-states`, because a missing target resolves at the route rather than inside a component. Each state name is a term in the project's language record.

### Keep component inputs narrow

**Requirement:** A composite MUST receive the values and callbacks it needs, not a client, a store, or a business record.

**Rationale:** The shared package serves applications it does not know, so an input carrying one application's data model couples the two.

### Use declared visual variants

**Requirement:** A repeated component variant MUST use theme tokens through the shared package's variant helper rather than repeated literal values.

**Rationale:** Repeated pixel values, colors, or long conditional branches drift apart once more than one composite edits them.

### Sanitize untrusted rich content

**Requirement:** A component MUST NOT render untrusted rich content without its recorded sanitization decision.

**Rationale:** Stored rich content requires a decision record naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases.

### Use a composite for a content image

**Requirement:** An informative or decorative image MUST render through the shared image component, which owns its shape, its sizing, and its fallback.

**Rationale:** An informative image carries meaningful alternative text and a decorative image carries empty alternative text. A source and label written in a page bypass both. The raw-element rule refuses unwrapped images in page code under litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code.

## Conventions

### Name components for their role

**Default:** Name a component for the role it plays, such as `OrderShipmentsSection` or `RedeliverOrderDialog`.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A name such as `OrderComponent` or `GenericModal` describes its file type rather than its job.

### Expose card and section titles as headings

**Default:** Render a visible card, panel, or section title as a heading at its correct level.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the outline and the automated test that finds it.

### Keep domain values typed until display

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Dates, money, and status convert to display strings there with explicit locale and zone behavior.

### Keep error boundaries scoped

**Default:** Use the route error surface for route failure, and a component boundary only where recovery keeps the page usable.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A component boundary that cannot recover hides the failure while leaving the page broken. Each stack realization names the surface for its stack.

## Reference example

This informative example demonstrates `litespec/frontend/components#compose-composites-in-page-code` and `litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code`.

A shipment section renders its facts, its commands, and its states by composing display composites and shared form fields. It declares no element and no styling, so the layout it draws is the one every other entity page draws.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/components#keep-shared-ui-in-one-package | guidance | Does one shared package hold the shared primitives and the composites, with no copy in an application? |
| litespec/frontend/components#compose-composites-in-page-code | checkable | `litespec ui` refuses a primitive library import reached from an application. |
| litespec/frontend/components#write-no-class-name-in-page-code | guidance | Does any component under a route or module folder declare a class or style binding? |
| litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code | guidance | Does page code declare a refused element, and does each refusal name its composite? |
| litespec/frontend/components#prefer-a-composite-over-a-primitive | guidance | Does page code import a primitive where the shared package provides a composite? |
| litespec/frontend/components#place-a-drawing-no-composite-makes-in-an-exception-file | guidance | Does every exception file use semantic tokens only, with no custom styling elsewhere? |
| litespec/frontend/components#add-a-missing-composite-to-the-shared-package | guidance | Is every layout, control, or surface a second page needs exported from the shared package? |
| litespec/frontend/components#support-keyboard-focus-labels-and-announcements | guidance | Does interactive UI support keyboard operation, visible focus, semantic elements, programmatic labels, and status announcements? |
| litespec/frontend/components#render-complete-states | guidance | Does every data component render each named state and every control render its own, with each name a recorded term? |
| litespec/frontend/components#keep-component-inputs-narrow | guidance | Does any composite input type name a client, a store, or a business record? |
| litespec/frontend/components#use-declared-visual-variants | guidance | Does every repeated variant use theme tokens through the variant helper? |
| litespec/frontend/components#sanitize-untrusted-rich-content | guidance | Does any component render untrusted content without its recorded sanitization decision? |
| litespec/frontend/components#use-a-composite-for-a-content-image | guidance | Does every content image render through the shared image component with its owned text? |
| litespec/frontend/components#name-components-for-their-role | guidance | Does every component name describe the role it plays? |
| litespec/frontend/components#expose-card-and-section-titles-as-headings | guidance | Does every visible card, panel, or section title render as a heading at its correct level? |
| litespec/frontend/components#keep-domain-values-typed-until-display | guidance | Does conversion to display strings happen only at the presentation boundary? |
| litespec/frontend/components#keep-error-boundaries-scoped | guidance | Does each error boundary have a recovery path that keeps its surroundings usable? |
