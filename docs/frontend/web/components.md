# TypeScript Web Components

## Intent

This page states how the TypeScript web stacks realize the frontend component principles ([Frontend components](../components.md)). It states the registry source, the closed element list, and the visual file patterns. It also states the raw HTML sinks and the route suite checks the React and Svelte stacks share.

## React

The React stack uses these bindings:

- A class or style binding spells `className` or `style`.
- A visual file ends with `*.visual.tsx`.
- The raw HTML sink is `dangerouslySetInnerHTML`.
- The route error surface is the route error component.
- Component authoring follows `react/components.md`.

## Svelte

The Svelte stack uses these bindings:

- A class or style binding spells `class`, `class:`, `style`, or `style:`.
- A visual file ends with `*.visual.svelte`.
- The raw HTML sink is `{@html}`.
- The route error surface is the route error page.
- Component authoring follows `svelte/components.md`.

## Standards

### Keep primitives and composites in one shared package

**Requirement:** A workspace MUST hold its registry primitives and its composites in one shared UI package, with no copy in an application.

**Rationale:** A primitive copied into two applications diverges on the first upstream update. The divergence is invisible because both copies compile. This realizes litespec/frontend/components#keep-shared-ui-in-one-package.

**Example:** The primitives sit in one folder that the registry CLI writes. No one edits that folder by hand. The composites sit beside them and import them.

### Use no raw element in page code

**Requirement:** A component under a route or module folder MUST NOT declare a layout or interactive element, and each refusal names the composite to use.

**Rationale:** A raw element carries no focus management, no state, and no accessibility wiring. The reader of the lint message chooses between two answers. The message gives one. This realizes litespec/frontend/components#use-composites-for-layout-and-interaction-in-page-code.

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

Text elements stay available, because a sentence is not a component decision. `p`, `h2`, `h3`, `em`, `strong`, `ul`, `ol`, and `li` carry prose. The floorplan owns the `h1`, so it is not in the list. Any other element follows the same rule: page code declares no other element, and the author adds a composite or a visual file instead.

### Place a drawing no composite makes in a visual file

**Requirement:** A visual file MAY write class names, and uses semantic theme tokens only.

**Rationale:** A stock-location map, a packing-slip preview, and a public frame have no composite. Refusing them pushes the drawing into an arbitrary value that no token governs. The file name declares this exception. The React and Svelte sections name the file pattern. This realizes litespec/frontend/components#place-a-drawing-no-composite-makes-in-an-exception-file.

### Meet accessibility requirements

**Requirement:** The route suite MUST check keyboard reach, visible focus, target size, and status announcements on every route.

**Rationale:** The principle's guarantees hold only when every route proves them. This realizes litespec/frontend/components#support-keyboard-focus-labels-and-announcements.

### Protect rich content boundaries

**Requirement:** A component MUST NOT pass untrusted content to a raw HTML sink.

**Rationale:** The React and Svelte sections name the sink for each stack. Stored rich content requires a decision record naming the sanitizer, the allowed elements and attributes, the link policy, and the test cases. This realizes litespec/frontend/components#sanitize-untrusted-rich-content.

## Conventions

### Give card and section titles heading semantics

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the outline and the browser test that finds it. The route suite asserts each visible section title resolves as a heading. This realizes litespec/frontend/components#expose-card-and-section-titles-as-headings.

### Compose class names in the shared package

**Default:** Compose class names through the one merge helper the shared package exports, and keep every merge or variant helper import inside it.

**Replacement:** A consumer replaces this default by recording an exception with its reason and review date.

**Rationale:** A second merging helper produces a different conflict resolution for the same class pair. Page code has no reason to hold one.

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
