# Frontend Components

## Intent

Every screen in a LiteSpec frontend draws with components from one shared UI package: small primitives such as inputs and badges, and larger composites such as sections and tables built from them. This page states what that package holds, how page code, the components under each route or module folder, composes its parts, and where a drawing that no composite makes belongs. Frontend developers and coding agents apply it whenever they build or change a screen, so the product keeps one visual language and a restyle stays a change in one place.

## Concepts

### Primitives, composites, and page code

A primitive is a small generic control from the pinned baseline, such as an input, a badge, or a card. A composite is a shared component that fixes the layout, behavior, and accessibility for one job, such as a status badge or a data table, built from primitives. Page code is any component under a route or module folder: it composes composites inside one floorplan and declares no layout or styling of its own. Page code lives under the route and module folders that [Frontend Structure](structure.md) defines, and the floorplan is the page component that fixes the page layout ([Controlled UI Governance](ui.md)).

For example, the `Badge` primitive draws a label in any color, while the `StatusBadge` composite maps a business state to its tone and draws that. An expense page imports `StatusBadge`, so it cannot pick a color the product never agreed to.

### The shared UI package

The shared UI package holds every primitive and every composite in one place, behind documented entry points that applications import. The boundary is enforced rather than described: a page that reaches past the entry points, declares its own styling, or draws with raw elements fails lint, and each refusal names the composite to use instead. The author therefore gets the replacement in the same message as the refusal and does not have to search the package.

### Drawings with no composite

Some drawings have no composite: a stock-location map, a packing-slip preview, or a public marketing frame. They live in exception files whose names declare the exception, and they draw with semantic theme tokens, the named values the shared token definition holds. The file name keeps the exception visible, and the tokens keep it inside the product palette.

## Standards

### Keep shared UI in one package

**Statement:** A workspace MUST hold its shared primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** When two applications each hold a copy of one primitive, the first upstream update changes one copy and misses the other. Both copies still compile, so nothing reports the split, and the two applications drift into two visual languages. One package gives every application the same component, so one update reaches every screen.

**Example:** The primitives sit in one folder beside the composites, and the composites import them.

### Compose composites in page code

**Statement:** A component under a route or module folder MUST import only the shared package's documented entry points.

**Rationale:** A composite fixes its layout and exposes only the inputs its job needs, so every page that uses it draws the same shape. If page code could reach past the composite to the primitives, one page would tune spacing or order for itself, and the next page would copy that tuning instead of the composite. The product would then hold as many layouts as pages.

**Example:** For example, an expense section in the expenses app draws its facts, its state, and its commands through shared composites, and declares no element, class, or style binding.

```svelte
<script>
  import { EntitySection, StatusBadge, DetailActions } from '@fixture/ui/floorplans';

  export let expense;
</script>

<EntitySection title={expense.title}>
  <StatusBadge code={expense.state} />
  <DetailActions actions={expense.commands} />
</EntitySection>
```

The section imports only the shared package entry point, so the layout it draws is the one the shared package owns for every other entity page.

### Write no class name in page code

**Statement:** A component under a route or module folder MUST NOT declare a class or style binding.

**Rationale:** The floorplan and the display composites own every spacing, size, and placement choice on a page. A class or style binding in route code is a second layout that answers to no composite, and the next route copies it because it looks like the local way to draw. Two sources of layout then disagree on the first redesign, so keeping classes out of page code leaves the floorplan as the one place a visual change lands.

Each stack page names the class and style bindings this rule covers for its stack.

### Use composites for layout and interaction in page code

**Statement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

**Rationale:** A raw element is only markup: it carries no focus handling, no state behavior, and no accessibility wiring, so each page that declares one rebuilds behavior the composite already carries, usually worse. The lint refusal names the composite to use instead, so the author gets the replacement in the same message as the refusal and does not have to search the shared package.

### Prefer a composite over a primitive

**Statement:** Page code MUST import a composite wherever the shared package provides one, and the lint refuses the primitive that composite replaces.

**Rationale:** The composite holds the product's decision for one job: which layout, which behavior, which tone. The bare primitive holds none of those, so a page that imports it makes each decision again for itself, and two pages answer the same question two ways. Refusing the replaced primitive in page code sends every page to the decision already made.

**Example:** `Card` is `Section`, `Table` is `DataTable`, `Badge` is `StatusBadge`, and `Input` and `Field` are the form fields.

### Place a drawing no composite makes in an exception file

**Statement:** An exception file MAY declare custom styling, and uses semantic theme tokens only.

**Rationale:** Some drawings have no composite: a stock-location map, a packing-slip preview, or a public marketing frame. Refusing them entirely would push the drawing into arbitrary values that no token governs, which is harder to find and restyle than a declared exception. The exception file keeps the drawing visible: its name says this page draws outside the composites, and semantic tokens keep it inside the product palette. Each stack page names the file pattern that marks an exception for its stack.

### Add a missing composite to the shared package

**Statement:** A layout, a control, or a surface a second page needs MUST be added to the shared UI package, not written inside an application.

**Rationale:** The second page that needs a layout, control, or surface proves the piece is shared, not page-specific. Written inside one application, it is reviewed against one use, styled for one context, and invisible to the floorplans that should carry it, so the third page writes it a third time or copies the first copy. Adding it to the shared package puts it where every page finds it and where its design is judged against every use.

### Support keyboard, focus, labels, and announcements

**Statement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** Keyboard operation, visible focus, semantic elements, programmatic labels, and status announcements come free with platform controls and all break at once in a custom control. A mouse-only control locks out keyboard readers, a missing label leaves screen-reader users guessing, and a silent update never reaches anyone who cannot see the screen change. Starting from a platform control keeps all five properties, and the composite keeps them for every page that uses it.

The five properties above are the ones a component can satisfy on its own. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) adds criteria that only a flow or a page can satisfy, so each route answers them where the criterion applies:

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

**Statement:** A data component MUST render loading, empty, error, forbidden, and ready; a control renders disabled and pending, prevents duplicate submission, and keeps recovery usable.

**Rationale:** A component that renders only its ready state leaves the reader with a blank region while data loads, after it fails, or when there is nothing to show. Each missing state is a screen the team never designed and no test visits. Naming every state up front forces each one to have a designed drawing: what arrives (loading, empty, error, forbidden, ready) and what the reader may do (disabled, pending, with duplicate submission blocked and recovery kept usable).

A route adds `not-found` under `litespec/frontend/rendering#represent-route-states`, because a missing target resolves at the route rather than inside a component. Each state name is a term in the project's language record.

### Keep component inputs narrow

**Statement:** A composite MUST receive the values and callbacks it needs, not a client, a store, or a business record.

**Rationale:** The shared package serves applications it was never written against. A composite that takes a client, a store, or a business record takes one application's data model as its input, so it cannot be reused by an application with a different model, and a change to that model breaks the shared package. Values and callbacks keep the composite free of any application's shape: the page translates its model into plain inputs, and the composite renders what it is given.

### Use declared visual variants

**Statement:** A repeated component variant MUST use theme tokens through the shared package's variant helper rather than repeated literal values.

**Rationale:** When each composite writes its own pixel values, colors, or conditional branches for one variant, the copies start equal and drift with every later edit, because nothing points the author at the other copies. The variant helper holds each variant once, in theme tokens, so a change to the variant reaches every composite that uses it and no composite carries a literal the theme cannot restyle.

### Sanitize untrusted rich content

**Statement:** A component MUST NOT render untrusted rich content without its recorded sanitization decision.

**Rationale:** Rich content written by one user renders in another user's browser, so unsanitized markup is a script injection path: whoever writes the content runs code as every reader. The recorded decision names the sanitizer, the allowed elements and attributes, the link policy, and the test cases, so the boundary is explicit and reviewable instead of a different ad-hoc escape on every page.

### Use a composite for a content image

**Statement:** An informative or decorative image MUST render through the shared image component, which owns its shape, its sizing, and its fallback.

**Rationale:** An informative image needs meaningful alternative text, and a decorative image needs empty alternative text so assistive tools skip it. A source and label written directly in a page bypass both rules: the author must remember which kind each image is and write the matching text, on every page. The shared image component owns the shape, the sizing, the fallback, and the text policy, so each image gets the handling its kind needs. The raw-element rule refuses unwrapped images in page code under litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code.

## Conventions

### Name components for their role

**Default:** Name a component for the role it plays, such as `OrderShipmentsSection` or `RedeliverOrderDialog`.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A name such as `OrderComponent` or `GenericModal` describes the file type, so it fits any component and tells a searcher nothing. A name that states the role, such as `OrderShipmentsSection` or `RedeliverOrderDialog`, tells the next author what the component does before they open it, and keeps two components for two jobs from sharing one vague name.

### Expose card and section titles as headings

**Default:** Render a visible card, panel, or section title as a heading at its correct level.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Some primitive sources render a title prop as a plain text element. That removes the title from the page outline, so screen-reader users cannot navigate by it and the route suite's heading check cannot find it. Rendering the title as a heading at its correct level keeps the outline and the test in agreement.

### Keep domain values typed until display

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Dates, money, and status values carry meaning a display string loses: the instant, the amount, the code. Converting early spreads formatting choices across every component that touches the value, and each one picks its own locale and zone. Keeping the typed value until the presentation boundary converts it in one place, with explicit locale and zone behavior.

### Keep error boundaries scoped

**Default:** Use the route error surface for route failure, and a component boundary only where recovery keeps the page usable.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** An error boundary that catches a failure it cannot recover from hides the error and leaves the surrounding page broken but silent. The route error surface owns route failure, with a designed recovery; a component boundary earns its place only where the rest of the page stays usable without the failed part. Each stack page names the error surface for its stack.

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
