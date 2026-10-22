# TypeScript Web Components

## Intent

Every screen in a TypeScript web frontend draws with composites, shared building blocks for layout and interaction, from one shared UI package, instead of each application drawing its own. This page states how the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) follow the component principles in [Frontend Components](../components.md): the registry source holding the primitives every composite builds on, the closed list of refused raw elements, visual files for drawings no composite makes, the raw HTML sinks kept away from untrusted content, and the route checks both stacks share. A team that applies it while writing pages keeps layout and interaction inside governed composites instead of scattered raw elements.

## Standards

### Keep Primitives and Composites in One Shared Package

**Statement:** A workspace MUST hold its registry primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update, and the divergence is invisible because both copies compile. One shared package holding the registry primitives and the composites keeps every application on the same source: an update lands once and reaches all of them. This realizes litespec/frontend/components#keep-shared-ui-in-one-package.

**Example:** The primitives sit in one folder that the registry CLI writes. No one edits that folder by hand. The composites sit beside them and import them.

### Use No Raw Element in Page Code

**Statement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

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

### Refuse Page Code Violations with ESLint

**Statement:** Route and module code MUST pass the ESLint rules that refuse raw layout and interactive elements, class and style bindings, and layout utilities outside visual files, with each refusal naming the composite to use.

**Rationale:** A lint gate that only refuses leaves the author searching the shared package for the replacement; a refusal that names the composite answers with the error. The refusal-to-composite map is approved once per stack, and each stack page names the mechanism that enforces it. Visual files stay allowlisted, because a drawing no composite makes has no composite to name. This gates litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code, litespec/frontend/components#write-no-class-name-in-page-code, and litespec/frontend/ui#keep-layout-inside-floorplans.

### Place a Drawing No Composite Makes in a Visual File

**Statement:** A visual file MAY write class names, and uses semantic theme tokens only.

**Rationale:** Some drawings have no composite: a stock-location map, a packing-slip preview, a public frame. Refusing them outright would push the drawing into an arbitrary value that no token governs. The visual file name declares the drawing visibly, and semantic theme tokens keep even the drawing inside the palette. Each stack page names the file pattern for its stack. This realizes litespec/frontend/components#place-a-drawing-no-composite-makes-in-an-exception-file.

### Meet Accessibility Requirements

**Statement:** The route suite MUST check keyboard reach, visible focus, target size, and status announcements on every route.

**Rationale:** Keyboard reach, visible focus, target size, and status announcements hold only when every route proves them. A route the suite skips can ship unreachable controls or silent updates with no error. Checking all four on every route makes the guarantees hold for the whole product, not just the routes somebody specified. This realizes litespec/frontend/components#support-keyboard-focus-labels-and-announcements.

### Protect Rich Content Boundaries

**Statement:** A component MUST NOT pass untrusted content to a raw HTML sink.

**Rationale:** A raw HTML sink renders whatever it receives, so untrusted content passed to it runs as page markup. Stored rich content therefore needs a decision record naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases before any component renders it. Each stack page names the sink for its stack. This realizes litespec/frontend/components#sanitize-untrusted-rich-content.

## Conventions

### Give Card and Section Titles Heading Semantics

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer can replace this default by naming its own title-to-heading mapping in its component documentation.

**Rationale:** A title rendered as a non-heading element vanishes from the document outline and from the browser test that finds it, and some primitive sources default to exactly that. Rendering each visible card, panel, or section title as a heading at its correct level keeps the outline and the test intact. The route suite asserts each visible section title resolves as a heading. This realizes litespec/frontend/components#expose-card-and-section-titles-as-headings.

### Compose Class Names in the Shared Package

**Default:** Compose class names through the one merge helper the shared package exports, and keep every merge or variant helper import inside it.

**Replacement:** A consumer can replace this default by naming its class-merging helper and its home package in its documentation.

**Rationale:** Two merging helpers resolve the same class pair differently, so a second helper makes identical markup render differently by location. One merge helper exported by the shared package keeps conflict resolution identical everywhere. Page code holds no merge or variant helper import, because it has no decision to make.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/components#keep-primitives-and-composites-in-one-shared-package | guidance | The workspace packages hold the registry source and the composites in one shared package, with no primitive or composite copy under an application. |
| litespec/frontend/web/components#use-no-raw-element-in-page-code | checkable | `pnpm eslint` refuses each raw layout or interactive element in route and module code, naming the composite to use. |
| litespec/frontend/web/components#refuse-page-code-violations-with-eslint | checkable | `pnpm eslint` reports no refused element, binding, or layout utility outside visual files in route and module code. |
| litespec/frontend/web/components#place-a-drawing-no-composite-makes-in-a-visual-file | guidance | Each visual file named on its stack page uses semantic theme tokens only, and class names appear in no other route or module file. |
| litespec/frontend/web/components#meet-accessibility-requirements | checkable | `tests/routes/every-route.spec.ts` tabs through every route and fails on an unreachable control, a missing focus indicator, an undersized target, or a silent status change. |
| litespec/frontend/web/components#protect-rich-content-boundaries | guidance | Each stored-rich-content decision record names its sanitizer, allowed elements and attributes, link policy, and test cases, and no component passes untrusted content to the sink its stack page names without one. |
| litespec/frontend/web/components#give-card-and-section-titles-heading-semantics | checkable | `tests/routes/every-route.spec.ts` resolves each visible card, panel, and section title as a heading at its level. |
| litespec/frontend/web/components#compose-class-names-in-the-shared-package | guidance | Every class merge in the workspace imports the merge helper from the shared package, with no merge or variant helper import in route or module code. |
