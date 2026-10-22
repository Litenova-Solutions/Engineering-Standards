# Frontend Components

## Intent

Every screen in a LiteSpec frontend draws with components from one shared UI package: small primitives such as inputs and badges, and larger composites such as sections and tables built from them. This page states what that package holds, how page code, the components under each route or module folder, composes its parts, and where a drawing that no composite makes belongs. Frontend developers and coding agents apply it whenever they build or change a screen, so the product keeps one visual language and a restyle stays a change in one place.

## Concepts

### Primitives, Composites, and Page Code

A primitive is a small generic control from the pinned baseline, such as an input, a badge, or a card. A composite is a shared component that fixes the layout, behavior, and accessibility for one job, such as a status badge or a data table, built from primitives. Page code is any component under a route or module folder: it composes composites inside one floorplan and declares no layout or styling of its own. Page code lives under the route and module folders that [Frontend Structure](structure.md) defines, and the floorplan is the page component that fixes the page layout ([Controlled UI Governance](ui.md)).

For example, the `Badge` primitive draws a label in any color, while the `StatusBadge` composite maps a business state to its tone and draws that. An expense page imports `StatusBadge`, so every color it draws is one the product agreed to.

### The Shared UI Package

The shared UI package holds every primitive and every composite in one place, behind documented entry points that applications import. The boundary is enforced rather than described: a page that reaches past the entry points, declares its own styling, or draws with raw elements fails lint, and each refusal names the composite to use instead. The author therefore gets the replacement in the same message as the refusal and does not have to search the package.

### Drawings with No Composite

Some drawings have no composite: a stock-location map, a packing-slip preview, or a public marketing frame. They live in exception files whose names declare the exception, and they draw with semantic theme tokens, the named values the shared token definition holds. The file name keeps the exception visible, and the tokens keep it inside the product palette.

## Standards

### Keep Shared UI in One Package

**Statement:** A workspace MUST hold its shared primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** When two applications each hold a copy of one primitive, the first upstream update changes one copy and misses the other. Both copies still compile, so nothing reports the split, and the two applications drift into two visual languages. One package gives every application the same component, so one update reaches every screen.

**Example:** The primitives sit in one folder beside the composites, and the composites import them.

### Compose Composites in Page Code

**Statement:** A component under a route or module folder MUST import only the shared package's documented entry points.

**Rationale:** A composite fixes its layout and exposes only the inputs its job needs, so every page that uses it draws the same shape. If page code could reach past the composite to the primitives, one page would tune spacing or order for itself, and the next page would copy that tuning instead of the composite. The product would then hold as many layouts as pages.

**Example:** An expense section in the expenses app draws its facts, its state, and its commands through shared composites, and declares no element, class, or style binding.

```text
EntitySection "title"
  StatusBadge "state"
  DetailActions "commands"
```

The section imports only the shared package entry point, so the layout it draws is the one the shared package owns for every other entity page.

### Write No Class Name in Page Code

**Statement:** A component under a route or module folder MUST NOT declare a class or style binding.

**Rationale:** The floorplan and the display composites own every spacing, size, and placement choice on a page. A class or style binding in route code is a second layout that answers to no composite, and the next route copies it because it looks like the local way to draw. Two sources of layout then disagree on the first redesign, so keeping classes out of page code leaves the floorplan as the one place a visual change lands.

Each stack page names the class and style bindings this rule covers for its stack.

### Use Composites for Layout and Interaction in Page Code

**Statement:** A component under a route or module folder MUST NOT declare a layout or interactive element.

**Rationale:** A raw element is only markup: it carries no focus handling, no state behavior, and no accessibility wiring, so each page that declares one rebuilds behavior the composite already carries, usually worse. The lint refusal names the composite to use instead, so the author gets the replacement in the same message as the refusal and does not have to search the shared package.

### Prefer a Composite over a Primitive

**Statement:** Page code MUST import a composite wherever the shared package provides one.

**Rationale:** The composite holds the product's decision for one job: which layout, which behavior, which tone. The bare primitive holds none of those, so a page that imports it makes each decision again for itself, and two pages answer the same question two ways. Refusing the replaced primitive in page code sends every page to the decision already made.

**Example:** `Card` is `Section`, `Table` is `DataTable`, `Badge` is `StatusBadge`, and `Input` and `Field` are the form fields.

### Place a Drawing No Composite Makes in an Exception File

**Statement:** An exception file MAY declare custom styling only with semantic theme tokens.

**Rationale:** Some drawings have no composite: a stock-location map, a packing-slip preview, or a public marketing frame. Refusing them entirely would push the drawing into arbitrary values that no token governs, which is harder to find and restyle than a declared exception. The exception file keeps the drawing visible: its name says this page draws outside the composites, and semantic tokens keep it inside the product palette. Each stack page names the file pattern that marks an exception for its stack.

### Add a Missing Composite to the Shared Package

**Statement:** A layout, a control, or a surface a second page needs MUST be added to the shared UI package, not written inside an application.

**Rationale:** The second page that needs a layout, control, or surface proves the piece is shared, not page-specific. Written inside one application, it is reviewed against one use, styled for one context, and invisible to the floorplans that would carry it, so the third page writes it a third time or copies the first copy. Adding it to the shared package puts it where every page finds it and where its design is judged against every use.

### Support Keyboard, Focus, Labels, and Announcements

**Statement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** Keyboard operation, visible focus, semantic elements, programmatic labels, and status announcements come free with platform controls and all break at once in a custom control. A mouse-only control locks out keyboard readers, a missing label leaves screen-reader users guessing, and a silent update leaves anyone who does not see the screen change unaware of it. Starting from a platform control keeps all five properties, and the composite keeps them for every page that uses it.

The five properties above are the ones a component can satisfy on its own. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) adds criteria that only a flow or a page can satisfy, so each route answers them where the criterion applies:

| Criterion | Level | What it means for the UI |
|:---|:---|:---|
| 2.4.11 Focus Not Obscured (Minimum) | AA | A focused control stays at least partly visible under a sticky header, bar, or panel. |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | A focused control stays fully visible. |
| 2.4.13 Focus Appearance | AAA | The focus indicator meets the stated minimum area and contrast. |
| 2.5.7 Dragging Movements | AA | Every drag action has a single-pointer alternative. |
| 2.5.8 Target Size (Minimum) | AA | A pointer target measures at least 24 by 24 pixels, or meets the stated spacing. |
| 3.2.6 Consistent Help | A | A help mechanism sits in the same relative order on every page that has one. |
| 3.3.7 Redundant Entry | A | Information already given in the same process is not asked for again. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Sign-in offers a path with no cognitive function test. |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | That path asks for no object recognition or personal content test either. |

The level column marks which target each criterion belongs to: AA for every project, AAA for a project that targets AAA.

### Render Data States

**Statement:** A data component MUST render loading, empty, error, forbidden, and ready.

**Rationale:** A component that renders only its ready state leaves the reader with a blank region while data loads, after it fails, or when there is nothing to show. Each missing state is a screen with no design and no test visiting it. Naming every arrival state up front gives each one a designed drawing.

A route adds `not-found` under `litespec/frontend/rendering#represent-route-states`, because a missing target resolves at the route rather than inside a component. Each state name is a term in the project glossary.

### Render Control States

**Statement:** A control MUST render disabled and pending so that a second submission stays impossible while one is in flight and recovery stays usable.

**Rationale:** A control with no disabled state invites a second submission while the first is still in flight, and a control with no pending state shows no sign that anything is happening. Blocking the duplicate submission and keeping recovery usable give the reader one safe path: wait, or recover. State names are glossary terms, as under `litespec/frontend/components#render-data-states`.

### Keep Component Inputs Narrow

**Statement:** A composite MUST receive the values and callbacks it needs, not a client, a store, or an aggregate.

**Rationale:** The shared package serves applications it was not written against. A composite that takes a client, a store, or an aggregate takes one application's data model as its input, so it fits no application with a different model, and a change to that model breaks the shared package. Values and callbacks keep the composite free of any application's shape: the page translates its model into plain inputs, and the composite renders what it is given.

### Use Declared Visual Variants

**Statement:** A repeated component variant MUST use theme tokens through the shared package's variant helper rather than repeated literal values.

**Rationale:** When each composite writes its own pixel values, colors, or conditional branches for one variant, the copies start equal and drift with every later edit, because nothing points the author at the other copies. The variant helper holds each variant once, in theme tokens, so a change to the variant reaches every composite that uses it and every value stays inside the theme.

### Sanitize Untrusted Rich Content

**Statement:** A component MUST NOT render untrusted rich content without its recorded sanitization decision.

**Rationale:** Rich content written by one user renders in another user's browser, so unsanitized markup is a script injection path: whoever writes the content runs code as every reader. The recorded decision names the sanitizer, the allowed elements and attributes, the link policy, and the test cases, so the boundary is explicit and reviewable instead of a different ad-hoc escape on every page.

### Use a Composite for a Content Image

**Statement:** An informative or decorative image MUST render through the shared image component, which owns its shape, its sizing, and its fallback.

**Rationale:** An informative image needs meaningful alternative text, and a decorative image needs empty alternative text so assistive tools skip it. A source and label written directly in a page bypass both rules: the author tracks which kind each image is and writes the matching text, on every page. The shared image component owns the shape, the sizing, the fallback, and the text policy, so each image gets the handling its kind needs. The raw-element rule refuses unwrapped images in page code under `litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code`.

## Conventions

### Name Components for Their Role

**Default:** Name a component for the role it plays, such as `OrderShipmentsSection` or `RedeliverOrderDialog`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `OrderComponent` or `GenericModal` describes the file type, so it fits any component and tells a searcher nothing. A name that states the role, such as `OrderShipmentsSection` or `RedeliverOrderDialog`, tells the next author what the component does before they open it, and keeps two components for two jobs from sharing one vague name.

### Expose Card and Section Titles as Headings

**Default:** Render a visible card, panel, or section title as a heading at its correct level.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Some primitive sources render a title prop as a plain text element. That removes the title from the page outline, so screen-reader users lose it as a navigation point and the route suite's heading check misses it. Rendering the title as a heading at its correct level keeps the outline and the test in agreement.

### Keep Domain Values Typed Until Display

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Dates, money, and status values carry meaning a display string loses: the instant, the amount, the code. Converting early spreads formatting choices across every component that touches the value, and each one picks its own locale and zone. Keeping the typed value until the presentation boundary converts it in one place, with explicit locale and zone behavior.

### Keep Error Boundaries Scoped

**Default:** Use the route error surface for route failure, and a component boundary only where recovery keeps the page usable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An error boundary that catches a failure with no recovery of its own hides the error and leaves the surrounding page broken but silent. The route error surface owns route failure, with a designed recovery; a component boundary earns its place only where the rest of the page stays usable without the failed part. Each stack page names the error surface for its stack.

## Reference Example

This informative example demonstrates `litespec/frontend/components#compose-composites-in-page-code` and `litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code`.

A shipment section renders its facts, its commands, and its states by composing display composites and shared form fields. It declares no element and no styling, so the layout it draws is the one every other entity page draws.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/components#keep-shared-ui-in-one-package | guidance | One shared UI package exports the primitives and the composites, and application folders hold no copies. Look in the workspace packages and the application sources. |
| litespec/frontend/components#compose-composites-in-page-code | checkable | `litespec ui` reports `[litespec/frontend/components#compose-composites-in-page-code]` with the file and the refused import. Run it at the consumer root. |
| litespec/frontend/components#write-no-class-name-in-page-code | guidance | Route and module sources declare no class or style binding. Look in route and module sources; each stack page names the bindings its lint refuses. |
| litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code | guidance | Route and module sources declare no layout or interactive element. Look in route and module sources; each stack page names the refused elements and the composite each refusal names. |
| litespec/frontend/components#prefer-a-composite-over-a-primitive | guidance | Page sources import the composite wherever the shared package provides one. Look in route and module imports. |
| litespec/frontend/components#place-a-drawing-no-composite-makes-in-an-exception-file | guidance | Custom styling appears only in files whose names mark them as drawings outside the composites, using semantic theme tokens only. Look in the exception files each stack page names. |
| litespec/frontend/components#add-a-missing-composite-to-the-shared-package | guidance | A layout, control, or surface drawn by two pages is exported from the shared package. Look in the shared package exports and the drawing pages. |
| litespec/frontend/components#support-keyboard-focus-labels-and-announcements | guidance | Keyboard operation, visible focus, semantic elements, programmatic labels, and status announcements hold on interactive UI. Look in the route suite output. |
| litespec/frontend/components#render-data-states | guidance | Each data component draws loading, empty, error, forbidden, and ready, with each state name a glossary term. Look in the shared package components and the glossary. |
| litespec/frontend/components#render-control-states | guidance | Each control draws disabled and pending, blocks a second submission while one is in flight, and keeps recovery usable. Look in the shared package components. |
| litespec/frontend/components#keep-component-inputs-narrow | guidance | Composite inputs name values and callbacks only. Look in the shared package component signatures. |
| litespec/frontend/components#use-declared-visual-variants | guidance | Repeated variants resolve through the shared variant helper in theme tokens, with no literal values in composites. Look in the shared package components. |
| litespec/frontend/components#sanitize-untrusted-rich-content | guidance | Rich content from untrusted sources renders only with a recorded decision naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases. Look in the decision records and the rendering components. |
| litespec/frontend/components#use-a-composite-for-a-content-image | guidance | Content images render through the shared image component with the text policy for their kind. Look in page sources for unwrapped images. |
| litespec/frontend/components#name-components-for-their-role | guidance | Component names state the role each plays. Look in the shared package and module sources. |
| litespec/frontend/components#expose-card-and-section-titles-as-headings | guidance | Visible card, panel, and section titles render as headings at their level. Look in the route suite output, which resolves each as a heading. |
| litespec/frontend/components#keep-domain-values-typed-until-display | guidance | Display strings are produced only at the presentation boundary with explicit locale and zone. Look in the presentation boundary and the components feeding it. |
| litespec/frontend/components#keep-error-boundaries-scoped | guidance | Route failure renders on the route error surface, and each component boundary keeps its surroundings usable. Look in the route error surfaces and the boundary components. |
