# TypeScript Web Components

## Intent

Every screen in a TypeScript web frontend draws with composites, shared building blocks for layout and interaction, from one shared UI package, instead of each application drawing its own. This page states how the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) follow the component principles in [Frontend Components](../components.md): the registry source holding the primitives every composite builds on, the closed list of refused raw elements, visual files for drawings no composite makes, the raw HTML sinks untrusted content must never reach, and the route checks both stacks share. A team that applies it while writing pages keeps layout and interaction inside governed composites instead of scattered raw elements.

## React

Names and files that differ per stack. The React stack uses these bindings:

- A class or style binding spells `className` or `style`.
- A file holding a drawing no composite makes ends with `*.visual.tsx`.
- Raw HTML reaches the page only through `dangerouslySetInnerHTML`.
- The route error surface is the route error component, which draws the shared problem state.
- Component authoring follows [React components](react/components.md).

## Svelte

The Svelte stack uses these bindings:

- A class or style binding spells `class`, `class:`, `style`, or `style:`.
- A file holding a drawing no composite makes ends with `*.visual.svelte`.
- Raw HTML reaches the page only through `{@html}`.
- The route error surface is the route error page, which draws the shared problem state.
- Component authoring follows [Svelte components](svelte/components.md).

## Standards

### Keep primitives and composites in one shared package

**Requirement:** A workspace MUST hold its registry primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update, and the divergence is invisible because both copies compile. One shared package holding the registry primitives and the composites keeps every application on the same source: an update lands once and reaches all of them. This realizes litespec/frontend/components#keep-shared-ui-in-one-package.

**Example:** The primitives sit in one folder that the registry CLI writes. No one edits that folder by hand. The composites sit beside them and import them.

### Use no raw element in page code

**Requirement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

**Rationale:** A raw layout or interactive element carries no focus management, no state, and no accessibility wiring, so each use rebuilds what a composite already provides. The lint refusal names the composite to use, so the reader gets the answer with the error instead of searching for it. This realizes litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code.

**Example:** The refused elements and their replacements are one closed list.

| Refused | Use instead |
|:---|:---|
| `div`, `span` | `Stack`, `Inline`, `Columns`, `Section`, or a floorplan slot |
| `button` | `Button` from the shared package |
| `a` | `TextLink` or `ButtonLink` |
| `input`, `select`, `textarea` | a field from the shared form library |
| `form` | the shared form component |
| `table` | `DataTable` |
| `img` | the shared image component, which `litespec/frontend/components#use-a-composite-for-a-content-image` owns |

Text elements stay available, because a sentence is not a component decision: `p`, `h2`, `h3`, `em`, `strong`, `ul`, `ol`, and `li` carry prose. The [floorplan](../ui.md) owns the `h1`, so it is absent from the list. Any other element follows the same rule: page code declares no other element, and the author adds a composite or a visual file instead.

### Place a drawing no composite makes in a visual file

**Requirement:** A visual file MAY write class names, and uses semantic theme tokens only.

**Rationale:** Some drawings have no composite: a stock-location map, a packing-slip preview, a public frame. Refusing them outright would push the drawing into an arbitrary value that no token governs. The visual file name declares the exception visibly, and semantic theme tokens keep even the exception inside the palette. The React and Svelte sections name the file pattern for each stack. This realizes litespec/frontend/components#place-a-drawing-no-composite-makes-in-an-exception-file.

### Meet accessibility requirements

**Requirement:** The route suite MUST check keyboard reach, visible focus, target size, and status announcements on every route.

**Rationale:** Keyboard reach, visible focus, target size, and status announcements hold only when every route proves them. A route the suite skips can ship unreachable controls or silent updates with no error. Checking all four on every route makes the guarantees hold for the whole product, not just the routes somebody specified. This realizes litespec/frontend/components#support-keyboard-focus-labels-and-announcements.

### Protect rich content boundaries

**Requirement:** A component MUST NOT pass untrusted content to a raw HTML sink.

**Rationale:** A raw HTML sink renders whatever it receives, so untrusted content passed to it runs as page markup. Stored rich content therefore needs a decision record naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases before any component renders it. The React and Svelte sections name the sink for each stack. This realizes litespec/frontend/components#sanitize-untrusted-rich-content.

## Conventions

### Give card and section titles heading semantics

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A title rendered as a non-heading element vanishes from the document outline and from the browser test that finds it, and some primitive sources default to exactly that. Rendering each visible card, panel, or section title as a heading at its correct level keeps the outline and the test intact. The route suite asserts each visible section title resolves as a heading. This realizes litespec/frontend/components#expose-card-and-section-titles-as-headings.

### Compose class names in the shared package

**Default:** Compose class names through the one merge helper the shared package exports, and keep every merge or variant helper import inside it.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Two merging helpers resolve the same class pair differently, so a second helper makes identical markup render differently by location. One merge helper exported by the shared package keeps conflict resolution identical everywhere. Page code holds no merge or variant helper import, because it has no decision to make.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/components#keep-primitives-and-composites-in-one-shared-package | guidance | Does one shared package hold the registry source and the composites, with no copy in an application? |
| litespec/frontend/web/components#use-no-raw-element-in-page-code | guidance | Does page code declare a refused element, and does each refusal name its composite? |
| litespec/frontend/web/components#place-a-drawing-no-composite-makes-in-a-visual-file | guidance | Does every visual file use semantic tokens only, and does any other file write class names? |
| litespec/frontend/web/components#meet-accessibility-requirements | checkable | `tests/routes/every-route.spec.ts` presses `Tab` and asserts every focused element shows an indicator. |
| litespec/frontend/web/components#protect-rich-content-boundaries | guidance | Does any component pass untrusted content to a raw HTML sink without its recorded decision? |
| litespec/frontend/web/components#give-card-and-section-titles-heading-semantics | checkable | `tests/routes/every-route.spec.ts` asserts each visible section title resolves as a heading. |
| litespec/frontend/web/components#compose-class-names-in-the-shared-package | guidance | Does every class merge go through the shared package helper? |
