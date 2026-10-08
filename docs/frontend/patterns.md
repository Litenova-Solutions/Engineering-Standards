# UI Pattern Decisions

## Intent

Every recurring interface question is decided once and recorded in one catalog. Each entry holds the options considered, the option chosen, the compact-screen behaviour, and the implementation per platform. Implementers build from the chosen option and extend the catalog rather than redrawing the pattern.

## Agent Summary {#agent-summary}

- One catalog holds every interface pattern decision. (standards/rule/frontend-patterns.keep-one-pattern-catalog)
- Each pattern records its options, costs, and choice. (standards/rule/frontend-patterns.record-every-option-considered)
- Each decision records an owner or recommended source. (standards/rule/frontend-patterns.record-who-chose)
- Each pattern declares its compact-screen behaviour. (standards/rule/frontend-patterns.declare-the-compact-behaviour)
- The shared package implements each chosen pattern once. (standards/rule/frontend-patterns.implement-a-chosen-pattern-once)
- Catalog and code change together, or a record explains. (standards/rule/frontend-patterns.update-the-catalog-with-the-code, standards/rule/frontend-patterns.state-the-implementation-status)
- Patterns name behaviour, never a component library. (standards/rule/frontend-patterns.keep-the-catalog-platform-neutral)
- Agents build on the choice and report ideas after. (standards/rule/frontend-patterns.keep-a-visual-registry, standards/rule/frontend-patterns.report-pattern-feedback-after-the-work)
- Start each entry from the library and propose generic improvements back. (standards/rule/frontend-patterns.start-from-the-pattern-library, standards/rule/frontend-patterns.promote-library-improvements)

## Concepts

### Pattern kinds

A pattern answers one recurring question. Its kind states what the question is about.

| Kind | The question it answers | Example |
|:---|:---|:---|
| `page-frame` | How is a page of this kind laid out? | A customer list page |
| `element` | How does one control behave? | Sorting on an invoice table |
| `scenario` | What shows in this situation? | An order list with no orders |

### The catalog entry

The catalog is one file valid against `schemas/ui-pattern-catalog.schema.json`. Each pattern entry carries these fields.

| Field | What it holds |
|:---|:---|
| `id` | The slug other records cite |
| `group` | The group the pattern belongs to |
| `title` | The pattern name |
| `question` | The recurring question the pattern answers |
| `options` | At least two options, each with rationale and cost |
| `decision` | The chosen option, its source, and an optional record |
| `compact` | The breakpoint and the behaviour below it |
| `extensions` | Further options a reader may switch to |
| `implementations` | The status and source paths per platform |
| `library` | The library pattern id the entry starts from, if any |

The `breakpoints` map names viewport widths in CSS pixels, and `groups` collect related patterns. The optional `registry` field names the command or path rendering every option for review.

### The pattern library

The standards ship a UI pattern library at `patterns/ui`, holding every recurring screen, element, and scenario of a business application. Each library pattern carries several drawn options, a recommended option, and a compact-screen behaviour, in `patterns/ui/library.json`.

The library mocks are plain HTML and CSS in semantic tokens, so a reader on any front-end profile reads them without running a profile toolchain. Every mock draws on one neutral cast, Acme Supply, a wholesale supplier back office, so a reader moving between options meets the same records.

Browse the library in the viewer at `patterns/ui/dist/ui-patterns.html`, built by `node patterns/ui/build.mjs`. The viewer shows light and dark themes, viewports from 390 CSS pixels to full screen, a side-by-side comparison, and a slideshow. `node patterns/ui/serve.mjs` serves the viewer on localhost and writes reviewer choices to a choices file beside it.

### Starting a catalog from the library

A catalog entry may set `library` to one library pattern id to start from that pattern. The entry keeps the library option ids, so a choice stays comparable across products, and it may add options of its own.

The owner then chooses among the combined options and records the source. The entry states the compact behaviour and the implementation status per platform, and the platform team implements the chosen option in its own components. A choice differing from the library recommendation records its reason in the entry.

### The decision lifecycle

A choice starts as a recommendation and settles when an owner chooses. A later change names the record that made it.

| Stage | Meaning |
|:---|:---|
| `recommended` | The reviewer recommendation, standing until an owner chooses |
| `owner` | The owner choice, with an optional note |
| changed by record | A later choice, naming the decision record |

### The compact variant

Each pattern states what happens below one named breakpoint. The chosen option reflows, or a named option replaces it.

| Form | Meaning |
|:---|:---|
| reflow | The chosen option adapts to the narrow width |
| replacement | A named option from the entry is used instead |

The breakpoint names one key of the catalog `breakpoints` map.

### Implementation status

Each platform entry states how far the chosen option is built there.

| Status | Meaning |
|:---|:---|
| `adopted` | Every surface follows the chosen option |
| `partial` | The shared implementation exists and some surfaces do not use it yet |
| `pending` | No implementation exists yet |
| `not-applicable` | The platform has no such surface |

A partial or pending entry states its gap in `gap`.

### Patterns and floorplans

A floorplan implements the chosen option of one page-frame pattern. The pattern decides the behaviour, and the floorplan is the shared component carrying it.

| Catalog side | Shared package side |
|:---|:---|
| A page-frame pattern and its chosen option | The floorplan implementing that option |

Every page-frame pattern therefore resolves to one floorplan, and every floorplan traces to the pattern entry that chose it.

## Standards

### Keep one pattern catalog (standards/rule/frontend-patterns.keep-one-pattern-catalog)

**Requirement:** A workspace with a controlled frontend MUST keep one pattern catalog at `paths.uiPatterns` in `standards.project.json`, valid against the schema.

**Rationale:** A decision kept in one catalog is found before it is remade. A decision kept in chat is decided again on the next page, and the two answers differ.

**Example:** The project file points at the catalog.

```json
{ "paths": { "uiPatterns": "docs/ui/patterns.json" } }
```

### Record every option considered (standards/rule/frontend-patterns.record-every-option-considered)

**Requirement:** Each pattern MUST record at least two options with rationale and cost, and name the chosen option.

**Rationale:** A later switch then reads the recorded cost instead of repeating the research. An option recorded without its cost is a preference, not a decision.

**Example:** An invoice list considers two sort options: clickable headers, and a menu listing sort fields. The entry records the rationale and cost of each, then names the chosen one.

### Record who chose (standards/rule/frontend-patterns.record-who-chose)

**Requirement:** Each pattern decision MUST record its source as `owner` or `recommended`.

**Rationale:** A recommended choice stands until an owner chooses. An agent never marks its own choice as the owner's. The catalog then shows which choices are settled and which await review.

### Declare the compact behaviour (standards/rule/frontend-patterns.declare-the-compact-behaviour)

**Requirement:** Each pattern MUST name one breakpoint and state whether the chosen option reflows below it or a named option replaces it.

**Rationale:** A pattern with no compact statement breaks on a narrow screen or is redrawn per route. The breakpoint is a catalog key, so every pattern names one width scale.

**Example:** The entry names breakpoint `compact`; below it invoice rows render as cards.

### Implement a chosen pattern once (standards/rule/frontend-patterns.implement-a-chosen-pattern-once)

**Requirement:** The shared UI package MUST implement each chosen pattern once at the source paths the catalog names per platform.

**Rationale:** One implementation keeps every route on the same behaviour. A route redrawing the pattern is a second decision the catalog cannot track.

**Example:** The catalog names `packages/ui/src/table/sort-header.tsx` under `react-web`, so every invoice route composes it.

### Update the catalog with the code (standards/rule/frontend-patterns.update-the-catalog-with-the-code)

**Requirement:** A change that switches option, adds an option, or extends a pattern MUST update the catalog entry in the same change as its implementation.

**Rationale:** A catalog updated later is a catalog updated never. A deliberate departure in one route names a decision record, so the exception stays reviewable.

**Example:** A route departing from the chosen option names `decision.record`, such as `docs/decisions/014-invoice-sort-menu.md`.

### State the implementation status (standards/rule/frontend-patterns.state-the-implementation-status)

**Requirement:** Each platform entry MUST state one status and the gap when that status is `partial` or `pending`.

**Rationale:** A reader then knows what is built and what is missing on each platform. The Concepts section defines the four values.

**Example:** A `pending` Blazor entry states in `gap` that the shared table control does not exist yet.

### Keep the catalog platform neutral (standards/rule/frontend-patterns.keep-the-catalog-platform-neutral)

**Requirement:** A pattern MUST name behaviour and structure, never a component library.

**Rationale:** Platforms bind through `implementations`, so one catalog serves React with shadcn/ui, Blazor, and later profiles. A library named in a pattern forces a second catalog per platform.

**Example:** An option describes a menu listing sort fields rather than naming the component rendering it.

## Conventions

### Keep a visual registry (standards/rule/frontend-patterns.keep-a-visual-registry)

**Default:** Review library options in the shared library viewer, and draw only product-specific options in a product registry at two widths.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An option seen beside its rivals is judged on appearance rather than description. The library viewer already renders every library option, so a product registry draws only the patterns and options the product added. The product registry command or path lives in the catalog `registry` field.

### Report pattern feedback after the work (standards/rule/frontend-patterns.report-pattern-feedback-after-the-work)

**Default:** Finish the task on the chosen pattern, then report a proposal in the completion report with pattern id, change, reason, and affected option.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent never changes a decision on its own and never stops mid-task to ask. The owner accepts, refuses, or defers the proposal, and an accepted proposal follows `standards/rule/frontend-patterns.update-the-catalog-with-the-code`.

### Start from the pattern library (standards/rule/frontend-patterns.start-from-the-pattern-library)

**Default:** Start each catalog entry from its library pattern, through `library`, and keep the library option ids and the recommended option.

**Replacement:** A consumer can replace this default with a local catalog carrying its own reason.

**Rationale:** A shared starting point keeps choices comparable across products and keeps the library recommendation visible. A product choosing a different option records its reason in the entry, so the departure stays reviewable.

### Promote library improvements (standards/rule/frontend-patterns.promote-library-improvements)

**Default:** Send an accepted proposal that is not specific to one product to the library, as a new option or a refined one.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The library improves from use across products, while each product keeps its own choices. The proposal follows `standards/rule/frontend-patterns.report-pattern-feedback-after-the-work`, and it reaches the library after the owner accepts it.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-patterns.keep-one-pattern-catalog | static | `node standards/tools/validate-ui.mjs` reports a missing catalog or a schema failure. |
| standards/rule/frontend-patterns.record-every-option-considered | static | `node standards/tools/validate-ui.mjs` reports fewer than two options or a choice naming no option. |
| standards/rule/frontend-patterns.record-who-chose | inspection | Review confirms each decision source is `owner` or `recommended` with no agent-marked owner choice. |
| standards/rule/frontend-patterns.declare-the-compact-behaviour | static | `node standards/tools/validate-ui.mjs` reports a compact option naming no recorded option. |
| standards/rule/frontend-patterns.implement-a-chosen-pattern-once | static | `node standards/tools/validate-ui.mjs` reports a named component path that does not exist. |
| standards/rule/frontend-patterns.update-the-catalog-with-the-code | inspection | Review confirms the catalog entry changed with its implementation or names a record. |
| standards/rule/frontend-patterns.state-the-implementation-status | inspection | Review confirms each platform entry states one status and each gap reads complete. |
| standards/rule/frontend-patterns.keep-the-catalog-platform-neutral | inspection | Review confirms no pattern names a component library outside `implementations`. |
| standards/rule/frontend-patterns.keep-a-visual-registry | inspection | Review confirms the registry renders every option in each theme at both widths. |
| standards/rule/frontend-patterns.report-pattern-feedback-after-the-work | inspection | Review confirms task reports carry proposals with pattern id, change, reason, and option. |
| standards/rule/frontend-patterns.start-from-the-pattern-library | inspection | Review confirms each catalog entry sets `library` or records its own reason, and keeps library option ids. |
| standards/rule/frontend-patterns.promote-library-improvements | inspection | Review confirms accepted generic proposals reached the library as a new or refined option. |
