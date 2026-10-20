# The wireframe language and the pattern page

Status: the target for the record-detail sample, 2026-10-20. Once the owner accepts the sample, this text moves into `docs/frontend/patterns.md` as its normative concept section.

## 1. Purpose

A wireframe states the structure of one UI option: which parts sit where, in what order, which action is primary, and what real copy they carry. It states no visual style: no colour, font, radius, spacing or component library. An agent reads the text and builds the option in its own stack and design system; a person reads the rendered picture to choose between options.

## 2. The block

A wireframe is a fenced code block with the info string `wireframe`, placed under one option of a pattern. An option whose phone layout differs adds a second block with the info string `wireframe compact`; otherwise the renderer derives the phone layout (section 6).

```wireframe
page
  breadcrumb "Orders" "1042"
  header
    heading "Order 1042"
    status "Paid" positive
    action primary "Mark as shipped"
    menu "More"
      action "Duplicate"
      action destructive "Cancel order"
  split 2:1
    region "Items"
      table 3 "Item" "Qty" "Total"
    aside
      card "Customer"
        fact "Name" "Maria Garcia"
        fact "Email" "maria@example.com"
```

## 3. Lines

- One part per line. Children are indented by exactly two spaces under their parent.
- A line is: the part name, then its modifiers (bare words), then its quoted strings, then an optional count (a bare integer) or ratio (`2:1`, `1:1:1`).
- A quoted string is visible copy, written as the product would show it. Inside it, `\"` is a literal quote.
- Inline children: a line may end with `:` followed by sibling parts separated by ` · ` (space, middle dot, space). They render side by side in one row, as if they were indented children of a `row`. Example: `item: avatar "MG" · text "Maria Garcia" · status "Paid" positive`.
- A line starting with `#` is a comment for authors; it renders nothing.
- Blank lines are ignored.

## 4. Parts

The set is closed. A part outside it is an error.

**Structure**

| Part | Meaning | Children |
|:---|:---|:---|
| `page` | The screen. Exactly one, at the top of the block. | any |
| `header` | The page or card header: identity and its actions. | any |
| `footer` | The bottom of a page, card or overlay. Modifier `sticky` keeps it in view. | any |
| `region "Title"` | A titled section of the page. The title is optional. | any |
| `aside "Title"` | A side column next to the main content inside a `split`, or on the page edge. The title is optional. Modifier `sticky` keeps it in view while the main column scrolls. | any |
| `card "Title"` | A bordered group. The title is optional. | any |
| `row` | Children side by side with equal width. | 2 or more |
| `split 2:1` | Children side by side with the given width ratio; one child per ratio part. | as many as ratio parts |
| `tabs "A" "B" "C"` | A tab strip; the first tab is selected. Its children are the selected tab's content. | any |
| `nav` | A navigation list. Its children are `link` parts. Modifier `side` draws it as a vertical rail. | `link` |
| `breadcrumb "A" "B"` | The trail to this page, outermost first. The last string is the current page. | none |
| `toolbar` | A row of actions and fields above a collection. Modifier `sticky`. | `action`, `field`, `menu`, `text` |

**Content**

| Part | Meaning |
|:---|:---|
| `heading "Text"` | A title. Modifier `small` for a section heading. |
| `text "Text"` | Running text. Modifier `muted` for secondary text. |
| `fact "Label" "Value"` | One labelled value. |
| `figure "Label" "Value"` | One prominent number with its label: a stat tile. |
| `status "Text" tone` | A state pill. Tone is `neutral` (default), `positive`, `caution`, `critical` or `info`. |
| `message "Text" tone` | An inline notice or an empty state; the same tones. |
| `avatar "AB"` | A person or organisation mark with initials. |
| `image "Label"` | A picture or file preview, labelled with what it shows. |
| `icon "name"` | A small symbol named by meaning, such as `"warning"` or `"file"`. |
| `link "Text"` | A navigation target. Modifier `current` in a `nav`. |
| `divider` | A separating line. |

**Actions and input**

| Part | Meaning |
|:---|:---|
| `action "Label"` | A command. Modifiers: `primary` (at most one per header, footer or overlay), `secondary` (default), `destructive`, `quiet` (text-only), `disabled` (refused; say why in a `message` beside it). |
| `menu "Label"` | A control that opens more actions. Its children are `action` parts. |
| `field "Label" kind` | An input. Kind: `text` (default), `number`, `date`, `select`, `textarea`, `checkbox`, `radio`, `toggle`, `search`, `file`. An optional value follows `=`: `field "Name" = "Maria Garcia"`. |

**Collections**

| Part | Meaning |
|:---|:---|
| `list n` | `n` rows. Its one child is the row template, usually `item`. |
| `table n "Column" "Column" ...` | `n` rows under named columns. An optional child `item` gives the first row's cells as inline parts. |
| `grid n` | `n` cards in a grid. Its one child is the card template. |
| `timeline n` | `n` events in time order. Its one child is the event template. |
| `item` | One row of a collection; its children usually come inline. |

**Overlays**

| Part | Meaning |
|:---|:---|
| `dialog "Title"` | A centred modal over the page. |
| `drawer "Title" side` | A panel over one edge: `right` (default), `left` or `bottom`. |
| `popover "Title"` | A small panel anchored to the control before it. |
| `toast "Text" tone` | A transient notice at the page edge. |

An overlay is the last child of `page`; the page content before it is drawn dimmed behind it.

## 5. Rules the validator checks

- The block parses: known parts, two-space indentation, closed quotes, a count where a collection needs one.
- Exactly one `page`, at the top.
- A `split` has as many children as ratio parts; a `row` has at least two.
- At most one `primary` action within one `header`, `footer`, `toolbar` or overlay.
- `list`, `grid` and `timeline` have exactly one child template.
- Every option in a pattern has one `wireframe` block, and at most one `wireframe compact` block.

## 6. Rendering

The renderer turns one block into one SVG at a given width. It draws structure only, in one neutral grey style, with the block's copy as the visible text.

- Widths: `desktop` 1200 px and `phone` 390 px; the height follows the content.
- Vertical stacking for children of `page`, `region`, `aside`, `card`, `header` rows, `footer`, overlays and collections; `row`, `split` and inline children lay out horizontally.
- At the phone width, without a `wireframe compact` block: every `row` and `split` stacks vertically, an `aside` follows the main content, a `table` keeps at most its first two columns plus an overflow mark, and a `drawer` comes from the bottom.
- Glyphs: `action primary` a filled dark box with light label; `secondary` an outlined box; `destructive` an outlined box with a critical-tone border; `quiet` the label alone, underlined. `field` a small label over an empty box (with its value in it when one is given). `status` a pill tinted by tone. `message` a tinted band. `figure` a large number over a small label. `table` a header row and `n` row lines. `list` `n` repeated rows of the template. `tabs` labels with the first underlined. `avatar` a circle with initials. `image` a crossed box with its label. `breadcrumb` the strings joined by `/`. Overlays dim the page behind them.
- Text width is estimated from character count; a string longer than its box is truncated with an ellipsis. The picture is a sketch, not a mock.
- Tone colours are the only colours: one tint each for `positive`, `caution`, `critical` and `info`.

## 7. The pattern page

Pattern pages live in `docs/frontend/patterns/<group>.md`, one per group. They apply wherever `docs/frontend/` applies: the folder holds no stack, so it belongs to its parent.

```markdown
# Record Detail Patterns

## Intent
<two or three sentences: what these patterns cover>

## Agent Summary {#agent-summary}
- <up to 10 bullets, each citing the pattern and rule IDs it summarises>

## Standards
### <a rule every option keeps, phrased as an action>
**Requirement:** <one sentence, one modal>
**Rationale:** <why>

## Patterns
### <Pattern name, a noun phrase such as "Record header">
**Question:** <the recurring question and its situation>
**Default:** `<option-id>`
**Compact:** <how the default behaves below the compact breakpoint>
**Rationale:** <why the default, the runner-up and when to prefer it, and what never to ship>

#### `<option-id>`: <Option name>
```wireframe
...
```
**Rationale:** <why this option>
**Cost:** <what it gives up>

## Verification
| ID | Mark | Evidence |
```

- A pattern is a provision of kind `pattern`. Its ID is `litespec/frontend/patterns/<group>#<pattern-slug>`, and its heading is a name rather than an action, so the ID survives a change of default.
- An option ID is a short kebab-case slug, unique within its pattern, and stable once published.
- The default is the recommended option. A project that implements another option records it in its pattern catalog with who chose and why.
- Every pattern and every Standard has one Verification row. A pattern's row is `guidance`, asking whether the frontend implements the default or the option its catalog records.
