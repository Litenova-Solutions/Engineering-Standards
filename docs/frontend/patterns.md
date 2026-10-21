# UI Pattern Decisions

## Intent

Every recurring interface question is decided once and recorded in one catalog. Each entry holds the options considered, the option chosen, the compact-screen behavior, and the implementation per platform. Implementers build from the chosen option and extend the catalog rather than redrawing the pattern.

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
| `compact` | The breakpoint and the behavior below it |
| `extensions` | Further options a reader may switch to |
| `implementations` | The status and source paths per platform |
| `library` | The LiteSpec pattern ID the entry starts from, if any |

The `breakpoints` map names viewport widths, and `groups` collect related patterns. The optional `registry` field names the command or path rendering every product-added option for review.

### Pattern pages

A pattern page holds one group of patterns, such as `docs/frontend/patterns/record-detail.md`. The folder holds no stack, so its pages apply wherever `docs/frontend/` applies. Each `###` heading under `## Patterns` names one pattern, and its ID is `litespec/frontend/patterns/<group>#<pattern-slug>`. The heading is a name rather than an action, so the ID survives a change of default.

A pattern carries four labeled fields, then its options.

| Field | What it holds |
|:---|:---|
| `**Question:**` | The recurring question and its situation |
| `**Default:**` | The option ID a project builds unless its catalog records another |
| `**Compact:**` | How the default behaves on a narrow screen |
| `**Rationale:**` | Why the default, the runner-up and when to prefer it, and what never to ship |

Each option is a `####` heading of the form ``#### `option-id`: Option name``. It carries one `wireframe` block, an optional `wireframe compact` block for a different phone layout, then `**Rationale:**`, `**Cost:**` and an optional `**Reference:**`. An option ID is stable once published. The page's Standards hold the rules every option keeps.

### The wireframe language

A wireframe states the structure of one option: which parts sit where, in what order, which action is primary, and the copy they show. It states no color, font, spacing, or component library. An agent builds the option from the text in its own stack and design system. `litespec patterns preview` draws the text for a person to choose from.

```wireframe
page
  breadcrumb "Orders" "SO-1042"
  header
    heading "SO-1042"
    status "Paid" positive
    action primary "Mark as shipped"
    menu "More"
      action "Duplicate"
      action destructive "Cancel order"
  split 2:1
    region "Items"
      table 3 "Item" "Qty" "Total"
        item: text "Oak desk lamp" · text "2" · text "EUR 90.00"
    aside
      card "Customer"
        fact "Name" "Maria Garcia"
```

Each line is one part: its name, its modifiers as bare words, its copy in double quotes, then a count or a ratio. Children are indented by two spaces. A line ending in `:` takes inline children, which sit side by side. A middle dot, `U+00B7`, with a space on each side separates them. A line starting with `#` is a comment. Copy is the real text the product would show, drawn from the Acme Supply cast.

The parts form a closed set.

| Group | Parts |
|:---|:---|
| Structure | `page`, `header`, `footer`, `region`, `aside`, `card`, `row`, `split`, `tabs`, `nav`, `breadcrumb`, `toolbar` |
| Content | `heading`, `text`, `fact`, `figure`, `status`, `message`, `avatar`, `image`, `icon`, `link`, `divider` |
| Actions and input | `action`, `menu`, `field` |
| Collections | `list`, `table`, `grid`, `timeline`, `item` |
| Overlays | `dialog`, `drawer`, `popover`, `toast` |

The modifiers belong to their parts.

| Part | Modifiers |
|:---|:---|
| `action` | `primary`, `secondary`, `destructive`, `quiet`, `disabled` |
| `field` | `text`, `number`, `date`, `select`, `textarea`, `checkbox`, `radio`, `toggle`, `search`, `file`, and a value after `=` |
| `status`, `message`, `toast` | `neutral`, `positive`, `caution`, `critical`, `info` |
| `heading` | `small` |
| `text` | `muted` |
| `link` | `current` |
| `nav` | `side` |
| `footer`, `toolbar`, `aside` | `sticky` |
| `drawer` | `right`, `left`, `bottom` |

The validator holds each block to these rules.

| Rule | Example |
|:---|:---|
| One `page`, at the top | A block never starts with `header` |
| A `split` holds one child per ratio part | `split 2:1` holds two children |
| A `row` holds at least two children | |
| A `list`, `grid`, or `timeline` holds one template child and a count | `list 3` with one `item` |
| A `table` names its columns and a count | `table 4 "Item" "Qty"` |
| A `header`, `footer`, `toolbar`, or overlay holds at most one primary action | |
| An overlay is a child of `page`, after the page content | `dialog` last in `page` |
| A `figure` takes a value, a label and a value, or a label, a value, and a note | `figure "Paid today" "EUR 1,240.00" "+12% on last week"` |
| A `toast` holds only `action` children, such as `Undo` | |

On a phone the drawing reflows unless a `wireframe compact` block says otherwise. A `row` or `split` stacks, an `aside` follows the main content, a table keeps its first two columns, and a drawer rises from the bottom.

### Starting a catalog entry from a LiteSpec pattern

A catalog entry may set `library` to one pattern ID, such as `litespec/frontend/patterns/record-detail#record-header`, to start from that pattern. The entry keeps the pattern's option IDs and names, so a choice stays comparable across products, and it may add options of its own.

The owner chooses among the combined options with the drawings from `litespec patterns preview`, and records the source. The entry states the compact behavior and the implementation status per platform, and the platform team implements the chosen option in its own components. A choice that differs from the pattern's default records its reason in the entry.

The diagram shows the flow from a LiteSpec pattern through the catalog entry that cites it to the built screen.

![A LiteSpec pattern with three options and a named default, a catalog entry citing the pattern by ID with the chosen option and source owner, and the built loan detail screen, with arrows from the pattern to the entry to the screen.](../assets/diagrams/frontend-pattern-flow.svg)

### The decision lifecycle

A choice starts as a recommendation and settles when an owner chooses. A later change names the record that made it.

| Stage | Meaning |
|:---|:---|
| `recommended` | The reviewer recommendation, standing until an owner chooses |
| `owner` | The owner choice, with an optional note |
| `owner` or `recommended`, plus `record` | A later choice, naming the decision record that made it |

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

A floorplan implements the chosen option of one page-frame pattern. The pattern decides the behavior, and the floorplan is the shared component carrying it.

| Catalog side | Shared package side |
|:---|:---|
| A page-frame pattern and its chosen option | The floorplan implementing that option |

Every page-frame pattern therefore resolves to one floorplan, and every floorplan traces to the pattern entry that chooses it.

## Standards

### Keep one pattern catalog

**Requirement:** A workspace with a controlled frontend MUST keep one pattern catalog at `paths.uiPatterns` in `litespec.project.json`, valid against the schema.

**Rationale:** A decision kept in one catalog is found before it is remade. A decision kept in chat is decided again on the next page, and the two answers differ.

**Example:** The project file points at the catalog.

```json
{ "paths": { "uiPatterns": "docs/ui/patterns.json" } }
```

### Record every option considered

**Requirement:** Each pattern MUST record at least two options with rationale and cost, and name the chosen option.

**Rationale:** A later switch then reads the recorded cost instead of repeating the research. An option recorded without its cost is a preference, not a decision.

**Example:** An invoice list considers two sort options: clickable headers and a menu listing sort fields. The entry records the rationale and cost of each, then names the chosen one.

### Record who chose

**Requirement:** Each pattern decision MUST record its source as `owner` or `recommended`.

**Rationale:** A recommended choice stands until an owner chooses. An agent never marks its own choice as the owner's. The catalog then shows which choices are settled and which await review.

**Example:** For example, the library catalog starts its loan header entry from `litespec/frontend/patterns/record-detail#record-header`, keeps the pattern option IDs, and records the owner choice.

```json
{
  "id": "loan-header",
  "group": "record-detail",
  "library": "litespec/frontend/patterns/record-detail#record-header",
  "decision": { "option": "title-state-breadcrumb-one-primary-action", "source": "owner" },
  "compact": { "breakpoint": "compact", "behavior": "The header stacks under the title." },
  "implementations": { "svelte": { "status": "adopted" } }
}
```

The entry names the pattern's default option and records `owner` as the source, so the choice stands as settled and the platform team builds it in its own components.

### Declare the compact behavior

**Requirement:** Each pattern MUST name one breakpoint and state whether the chosen option reflows below it or a named option replaces it.

**Rationale:** A pattern with no compact statement breaks on a narrow screen or is redrawn per route. The breakpoint is a catalog key, so every pattern names one width scale.

**Example:** The entry names breakpoint `compact`; below it invoice rows render as cards.

### Implement a chosen pattern once

**Requirement:** The shared UI package MUST implement each chosen pattern once at the source paths the catalog names per platform.

**Rationale:** One implementation keeps every route on the same behavior. A route redrawing the pattern is a second decision the catalog cannot track.

**Example:** The catalog names one shared source path per platform, so every invoice route composes its platform path.

### Update the catalog with the code

**Requirement:** A change that switches option, adds an option, or extends a pattern MUST update the catalog entry in the same change as its implementation.

**Rationale:** A catalog updated later is a catalog updated never. A deliberate departure in one route names a decision record, so the exception stays reviewable.

**Example:** A route departing from the chosen option names `decision.record`, such as `docs/product/decisions/0014-invoice-sort-menu.md`.

### State the implementation status

**Requirement:** Each platform entry MUST state one status and the gap when that status is `partial` or `pending`.

**Rationale:** A reader then knows what is built and what is missing on each platform. The Concepts section defines the four values.

**Example:** A `pending` entry for one platform states in `gap` what is missing there.

### Keep the catalog platform neutral

**Requirement:** A pattern MUST name behavior and structure, never a component library.

**Rationale:** Platforms bind through `implementations`, so one catalog serves every selected stack. A library named in a pattern forces a second catalog per platform.

**Example:** An option describes a menu listing sort fields rather than naming the component rendering it.

## Conventions

### Keep a visual registry

**Default:** Review LiteSpec options with `litespec patterns preview`, and draw only product-specific options in a product registry at compact and full widths.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An option seen beside its rivals is judged on appearance rather than description. The preview already draws every LiteSpec option, so a product registry draws only the patterns and options the product added. The product registry command or path lives in the catalog `registry` field.

### Report pattern feedback after the work

**Default:** Finish the task on the chosen pattern, then report a proposal in the completion report with pattern id, change, reason, and affected option.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent never changes a decision on its own and never stops mid-task to ask. The owner accepts, refuses, or defers the proposal, and an accepted proposal follows `litespec/frontend/patterns#update-the-catalog-with-the-code`.

### Start from a LiteSpec pattern

**Default:** Start each catalog entry from its LiteSpec pattern, through `library`, and keep the pattern's option IDs, option names, and default.

**Replacement:** Start an entry without `library` and record why no LiteSpec pattern fits.

**Rationale:** A shared starting point keeps choices comparable across products and keeps the LiteSpec default visible. A product choosing a different option records its reason in the entry, so the departure stays reviewable.

### Promote pattern improvements

**Default:** Send an accepted proposal that is not specific to one product to the LiteSpec pattern page, as a new option or a refined one.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The patterns improve from use across products, while each product keeps its own choices. The proposal follows `litespec/frontend/patterns#report-pattern-feedback-after-the-work`, and it reaches the pattern page after the owner accepts it.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/patterns#keep-one-pattern-catalog | checkable | `litespec ui` reports a missing catalog or a schema failure. |
| litespec/frontend/patterns#record-every-option-considered | checkable | `litespec ui` reports fewer than two options or a choice naming no option. |
| litespec/frontend/patterns#record-who-chose | guidance | Does each decision record owner or recommended, with no agent-marked owner choice? |
| litespec/frontend/patterns#declare-the-compact-behavior | checkable | `litespec ui` reports a compact option naming no recorded option. |
| litespec/frontend/patterns#implement-a-chosen-pattern-once | checkable | `litespec ui` reports a named component path that does not exist. |
| litespec/frontend/patterns#update-the-catalog-with-the-code | guidance | Did the catalog entry change with its implementation or name a record? |
| litespec/frontend/patterns#state-the-implementation-status | checkable | `litespec ui` reports a partial or pending entry without a gap. |
| litespec/frontend/patterns#keep-the-catalog-platform-neutral | guidance | Does any pattern name a component library outside implementations? |
| litespec/frontend/patterns#keep-a-visual-registry | guidance | Does the registry render every product-added option in each theme at compact and full widths? |
| litespec/frontend/patterns#report-pattern-feedback-after-the-work | guidance | Does each completion report carry proposals with pattern id, change, reason, and option? |
| litespec/frontend/patterns#start-from-a-litespec-pattern | guidance | Does each entry set library or record its own reason, keeping the pattern's option IDs? |
| litespec/frontend/patterns#promote-pattern-improvements | guidance | Did each accepted generic proposal reach the LiteSpec pattern page as a new or refined option? |
